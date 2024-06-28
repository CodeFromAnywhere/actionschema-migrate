import {
  notEmpty,
  snakeCase,
  capitalCase,
  tryParseJson,
  generateRandomString,
  mergeObjectsArray,
  mapKeys,
} from "from-anywhere";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fetchCreateDatabase } from "./fetchCreateDatabase.js";
import { fetchGenerateSdk } from "./fetchGenerateSdk.js";
import { mkdir } from "node:fs/promises";
import { writeToFiles } from "from-anywhere/node";

type Schema = { [key: string]: any };

/** TODO: Get this from schema. This may be an exception though, haha. */
export type MigrationContext = {
  slugPrefix?: string;
  relativeOutputPath?: string;
  /**any json schemas we need in typescript*/
  relativeJsonSchemaBasePath?: string;
  remoteJsonSchemaUrls?: string[];

  /** NB: Useful to add later like I wanted making an actionschema-server */

  remoteOpenapis?: {
    url: string;
    /**Prune it */
    operationIds?: string[];
  }[];

  /** agent schemas that need to become an agent API */
  relativeAgentBasePath?: string;
  remoteAgentUrls?: string[];
  customAgentServer?: string;

  /** file prompts that need to be accessible through the actionschema CLI */
  relativeFilePromptBasePath?: string;
  remoteFilePromptUrls?: string[];

  /**crud schemas we need to be a crud api*/
  relativeCrudSchemaBasePath?: string;
  remoteCrudSchemaUrls?: string[];
  customCrudServer?: string;
};

export const addOrReplaceEnvKeys = (
  filePath: string,
  newEntries: Record<string, string>,
) => {
  const content = readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  let updatedLines = [...lines];

  Object.keys(newEntries).forEach((key) => {
    const regex = new RegExp(`^${key}=`);
    const existingLineIndex = lines.findIndex((line) => regex.test(line));

    if (existingLineIndex !== -1) {
      // Replace existing line
      updatedLines[existingLineIndex] = `${key}=${newEntries[key]}`;
    } else {
      // Add new line
      updatedLines.push(`${key}=${newEntries[key]}`);
    }
  });

  const updatedContent = updatedLines.join("\n");

  writeFileSync(filePath, updatedContent, "utf8");
};

/**
 * Needs access to env and fs
 */
export const runMigration = async (context: MigrationContext) => {
  const {
    relativeCrudSchemaBasePath,
    relativeOutputPath,
    remoteCrudSchemaUrls,
    slugPrefix,
    relativeAgentBasePath,
    remoteAgentUrls,
    remoteOpenapis,
    relativeFilePromptBasePath,
    relativeJsonSchemaBasePath,
    remoteFilePromptUrls,
    remoteJsonSchemaUrls,
  } = context;

  const absoluteBasePath = relativeCrudSchemaBasePath
    ? path.join(process.cwd(), relativeCrudSchemaBasePath)
    : undefined;

  const crudAdminToken = process.env.CRUD_ADMIN_TOKEN;

  if (!crudAdminToken) {
    console.log("Please provide a CRUD_ADMIN_TOKEN in your .env");
    return;
  }

  const filePaths = absoluteBasePath
    ? readdirSync(absoluteBasePath, { withFileTypes: true })
        .filter((x) => x.isFile() && x.name.endsWith(".json"))
        .map((x) => path.join(absoluteBasePath, x.name))
    : undefined;

  const fileSchemas = filePaths
    ? (
        await Promise.all(
          filePaths.map(async (p) => {
            try {
              const text = readFileSync(p, "utf8");
              const json = tryParseJson<any>(text);
              if (!json) {
                return;
              }
              // name after last slash without any (sub)extensions
              const databaseSlug = p.split("/").pop()?.split(".")[0];

              if (!databaseSlug) {
                return;
              }
              return { schemaString: text, databaseSlug };
            } catch (e) {
              console.log("errrr", e);
            }
          }),
        )
      ).filter(notEmpty)
    : [];

  const remoteSchemas = remoteCrudSchemaUrls
    ? (
        await Promise.all(
          remoteCrudSchemaUrls.map(async (url) => {
            const text = await fetch(url, {
              method: "GET",
              headers: { Accept: "application/json" },
            })
              .then((res) => res.text())
              .catch((e) => {
                console.log(e);
                return;
              });

            if (!text) {
              return;
            }

            const json = tryParseJson<Schema>(text);

            if (!json) {
              return;
            }

            // name after last slash without any (sub)extensions
            const databaseSlug = url.split("/").pop()?.split(".")[0];

            if (!databaseSlug) {
              return;
            }
            return { schemaString: text, databaseSlug };
          }),
        )
      ).filter(notEmpty)
    : [];

  const schemas = fileSchemas.concat(remoteSchemas);

  console.log("schemas found:", schemas.length, { schemas, filePaths });

  const results = await Promise.all(
    fileSchemas.map(async (item) => {
      const { databaseSlug, schemaString } = item;

      const envKeyName =
        capitalCase(snakeCase(databaseSlug)) + "_CRUD_AUTH_TOKEN";
      const currentEnvValue = process.env[envKeyName];
      const authToken = currentEnvValue || generateRandomString(64);

      const createContext = {
        databaseSlug: (slugPrefix || "") + databaseSlug,
        schemaString,
        authToken,
        adminAuthToken: crudAdminToken,
      };

      // console.log({ createContext });
      // ensure we get the existing authTokens in .env
      // submit name+schema+adminSecret+authtoken to app crud upsert endpoint and get openapi back
      const upsertResult = await fetchCreateDatabase(createContext);

      if (!upsertResult?.isSuccessful) {
        console.log(databaseSlug, upsertResult);
      }

      return {
        databaseSlug,
        envKeyName,
        currentEnvValue,
        authToken,
        upsertResult,
      };
    }),
  );

  const pushEnv = mergeObjectsArray(
    results
      .filter((x) => x.currentEnvValue !== x.authToken)
      .map((x) => ({ [x.envKeyName]: x.authToken })),
  );

  addOrReplaceEnvKeys(path.join(process.cwd(), ".env"), pushEnv);

  // POST migrate.actionschema/generateSdk -> save sdk.ts
  // come up with generateSdk data
  const generateResult = await fetchGenerateSdk({
    openapis: results
      .filter((x) => !!x.upsertResult?.openapiUrl)
      .map((x) => ({
        slug: x.databaseSlug,
        openapiUrl: x.upsertResult?.openapiUrl!,
        envKeyName: x.envKeyName,
        operationIds: undefined,
      })),
  });

  if (!generateResult.files) {
    console.log("Didn't get SDK");
    return;
  }

  const absoluteSdkPath = path.join(
    process.cwd(),
    relativeOutputPath || "src/sdk",
  );

  if (!existsSync(absoluteSdkPath)) {
    await mkdir(absoluteSdkPath, { recursive: true });
  }

  //console.log({ generateResult });

  const absoluteFiles = await mapKeys(generateResult.files, (key) =>
    path.join(absoluteSdkPath, key),
  );

  await writeToFiles(absoluteFiles);
  console.log("Written to:", absoluteSdkPath);
};
