import { $ } from "bun";
import { notEmpty, tryParseJson } from "from-anywhere";
import { readJsonFile } from "from-anywhere/node";
import { readdirSync } from "node:fs";
import path from "node:path";

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
 */
export const runMigration = async (
  context: MigrationContext,
  crudAdminToken: string,
) => {
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
            const content = await readJsonFile<Schema>(p);
            return content;
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

            return json;
          }),
        )
      ).filter(notEmpty)
    : [];

  const schemas = fileSchemas.concat(remoteSchemas);

  await Promise.all(
    schemas.map(async (p) => {
      // submit name+schema+adminSecret+authtoken to app crud upsert endpoint and get openapi back
      // overwrite .env keys that were submitted as authTokens
      // submit {openapiUrl,authEnvironmentVariableName}[] via endpoint and get a single typesafe SDK client back
      // ensure to warn if it goes wrong
    }),
  );
};
