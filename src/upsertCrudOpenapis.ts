import {
  capitalCase,
  generateRandomString,
  mergeObjectsArray,
  notEmpty,
  snakeCase,
  tryParseJson,
} from "from-anywhere";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fetchUpsertDatabase } from "./fetchUpsertDatabase.js";

import { addOrReplaceEnvKeys } from "./addOrReplaceEnvKeys.js";
type JsonSchema = { [key: string]: any };

export const upsertCrudOpenapis = async (context: {
  remoteCrudSchemaUrls?: string[];
  relativeCrudSchemaBasePath?: string;
  crudAdminToken?: string;
  crudSlugPrefix?: string;
  customCrudServer?: string;
}) => {
  const {
    crudSlugPrefix,
    crudAdminToken,
    relativeCrudSchemaBasePath,
    remoteCrudSchemaUrls,
  } = context;

  if (relativeCrudSchemaBasePath && !remoteCrudSchemaUrls?.length) {
    return;
  }

  const absoluteBasePath = relativeCrudSchemaBasePath
    ? path.join(process.cwd(), relativeCrudSchemaBasePath)
    : undefined;

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

            const json = tryParseJson<JsonSchema>(text);

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

  console.log("schemas found:", schemas.length, { filePaths });

  const results = await Promise.all(
    fileSchemas.map(async (item) => {
      const { databaseSlug, schemaString } = item;

      const envKeyName =
        capitalCase(snakeCase(databaseSlug)) + "_CRUD_AUTH_TOKEN";
      const currentEnvValue = process.env[envKeyName];
      const authToken = currentEnvValue || generateRandomString(64);
      console.log({ envKeyName, currentEnvValue, authToken });

      const fullDatabaseSlug = (crudSlugPrefix || "") + databaseSlug;
      const createContext = {
        databaseSlug: fullDatabaseSlug,
        schemaString,
        authToken,
        adminAuthToken: crudAdminToken,
      };

      // console.log({ createContext });
      // ensure we get the existing authTokens in .env
      // submit name+schema+adminSecret+authtoken to app crud upsert endpoint and get openapi back
      const upsertResult = await fetchUpsertDatabase(createContext);

      if (!upsertResult?.isSuccessful) {
        console.log({ fullDatabaseSlug }, upsertResult);
      }

      return {
        databaseSlug: fullDatabaseSlug,
        envKeyName,
        currentEnvValue,
        authToken,
        upsertResult,
      };
    }),
  );

  // update .env
  const changedEnvironmentVariablesArray = results
    .filter((x) => x.currentEnvValue !== x.authToken)
    .map((x) => ({ [x.envKeyName]: x.authToken }));
  const changedEnvironmentVariables = mergeObjectsArray(
    changedEnvironmentVariablesArray,
  );
  addOrReplaceEnvKeys(
    path.join(process.cwd(), ".env"),
    changedEnvironmentVariables,
  );

  const openapis = results
    .filter((x) => !!x.upsertResult?.openapiUrl)
    .map((x) => ({
      slug: x.databaseSlug,
      openapiUrl: x.upsertResult?.openapiUrl!,
      envKeyName: x.envKeyName,
      operationIds: undefined,
    }));

  return openapis;
};
