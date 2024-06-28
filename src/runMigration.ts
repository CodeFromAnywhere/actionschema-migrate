import { $ } from "bun";
import {
  notEmpty,
  snakeCase,
  capitalCase,
  tryParseJson,
  generateRandomString,
} from "from-anywhere";
import { fs } from "from-anywhere/node";
import { readdirSync } from "node:fs";
import path from "node:path";
import { fetchCreateDatabase } from "./fetchCreateDatabase.js";
import { fetchGenerateSdk } from "./fetchGenerateSdk.js";

type Schema = { [key: string]: any };

/** TODO: Get this from schema. This may be an exception though, haha. */
export type MigrationContext = {
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

/**
 * Needs access to env and fs
 */
export const runMigration = async (context: MigrationContext) => {
  const {
    relativeCrudSchemaBasePath,
    remoteCrudSchemaUrls,
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
    console.log("Please provide a crudAdminToken");
    return;
  }

  $.nothrow();

  const filePaths = absoluteBasePath
    ? readdirSync(absoluteBasePath, { withFileTypes: true })
        .filter((x) => x.isFile() && x.name.endsWith(".json"))
        .map((x) => path.join(absoluteBasePath, x.name))
    : undefined;

  const fileSchemas = filePaths
    ? (
        await Promise.all(
          filePaths.map(async (p) => {
            const text = fs.readFileSync(p, "utf8");
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

  console.log("schemas found:", schemas.length);

  const results = await Promise.all(
    schemas.map(async (item) => {
      const { databaseSlug, schemaString } = item;

      const envKeyName =
        capitalCase(snakeCase(databaseSlug)) + "_CRUD_AUTH_TOKEN";
      const currentEnvValue = process.env[envKeyName];
      const authToken = currentEnvValue || generateRandomString(64);

      // ensure we get the existing authTokens in .env
      // submit name+schema+adminSecret+authtoken to app crud upsert endpoint and get openapi back
      const upsertResult = await fetchCreateDatabase({
        databaseSlug,
        schemaString,
        authToken,
      });

      return {
        databaseSlug,
        envKeyName,
        currentEnvValue,
        authToken,
        upsertResult,
      };
    }),
  );

  // POST migrate.actionschema/generateSdk -> save sdk.ts
  // come up with generateSdk data
  const generateResult = await fetchGenerateSdk({
    openapis: results
      .filter((x) => !!x.upsertResult?.openapiUrl)
      .map((x) => ({
        slug: x.databaseSlug,
        openapiUrl: x.upsertResult.openapiUrl!,
        envKeyName: x.envKeyName,
        operationIds: undefined,
      })),
  });

  if (!generateResult.sdk) {
    console.log("Didn't get SDK");
    return;
  }

  fs.writeFileSync(path.join(process.cwd(), "src/sdk.ts"), generateResult.sdk);
  console.log("Written to src/sdk.ts");
};
