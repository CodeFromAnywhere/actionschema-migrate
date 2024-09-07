import { mapKeys, notEmpty, tryParseJson } from "edge-util";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { mkdir } from "node:fs/promises";
import { writeToFiles } from "from-anywhere/node";
import { generateTypescriptSdk } from "openapi-util";
import { MigrationContext } from "./MigrationContext.js";
import { upsertCrudOpenapis } from "./upsertCrudOpenapis.js";
import { OpenapiDocument } from "openapi-util";
/**
 * Needs access to env and fs
 */
export const runMigration = async (context: MigrationContext) => {
  const {
    relativeOutputPath,
    useJsImportSuffix,
    //crud stuff
    relativeCrudSchemaBasePath,
    remoteCrudSchemaUrls,
    crudSlugPrefix,
    customCrudServer,

    // openapis
    openapis,

    // json schemas
    relativeJsonSchemaBasePath,
    remoteJsonSchemaUrls,

    // BELOW: Later

    // agent stuff
    relativeAgentBasePath,
    remoteAgentUrls,

    //file prompts
    relativeFilePromptBasePath,
    remoteFilePromptUrls,
  } = context;

  /// crud stuff
  const crudAdminToken = process.env.CRUD_ADMIN_TOKEN;

  const crudOpenapis = await upsertCrudOpenapis({
    crudSlugPrefix,
    customCrudServer,
    crudAdminToken,
    relativeCrudSchemaBasePath,
    remoteCrudSchemaUrls,
  });

  const parsedOpenapis = (openapis || [])
    .map((item) => {
      if (item.openapiPath) {
        const absolutePath = path.join(process.cwd(), item.openapiPath);
        const realAbsolutePath = existsSync(absolutePath)
          ? absolutePath
          : existsSync(item.openapiPath)
            ? item.openapiPath
            : undefined;

        if (!realAbsolutePath) {
          console.log(
            "couldnt find/parse openapi file",
            item.openapiPath,
            item.slug,
          );

          return null;
        }

        const fileContent = readFileSync(realAbsolutePath, "utf8");
        const parsed = tryParseJson<OpenapiDocument>(fileContent);

        if (!parsed || !parsed.paths) {
          console.log("Couldn't get openapi at", realAbsolutePath);
          return null;
        }

        return {
          ...item,
          // attach object if it comes from local path
          openapiObject: parsed,
        };
      }

      return item;
    })
    .filter(notEmpty);

  const allOpenapis = parsedOpenapis.concat(crudOpenapis || []);

  const generateResult = await generateTypescriptSdk({
    openapis: allOpenapis,
    useJsImportSuffix,
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
