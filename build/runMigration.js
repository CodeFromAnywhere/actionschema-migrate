import { mapKeys } from "from-anywhere";
import { existsSync } from "node:fs";
import path from "node:path";
import { mkdir } from "node:fs/promises";
import { writeToFiles } from "from-anywhere/node";
import { generateTypescriptSdk } from "openapi-util";
import { upsertCrudOpenapis } from "./upsertCrudOpenapis.js";
/**
 * Needs access to env and fs
 */
export const runMigration = async (context) => {
    const { relativeOutputPath, 
    //crud stuff
    relativeCrudSchemaBasePath, remoteCrudSchemaUrls, crudSlugPrefix, customCrudServer, 
    // openapis
    openapis, 
    // json schemas
    relativeJsonSchemaBasePath, remoteJsonSchemaUrls, 
    // BELOW: Later
    // agent stuff
    relativeAgentBasePath, remoteAgentUrls, 
    //file prompts
    relativeFilePromptBasePath, remoteFilePromptUrls, } = context;
    /// crud stuff
    const crudAdminToken = process.env.CRUD_ADMIN_TOKEN;
    const crudOpenapis = await upsertCrudOpenapis({
        crudSlugPrefix,
        customCrudServer,
        crudAdminToken,
        relativeCrudSchemaBasePath,
        remoteCrudSchemaUrls,
    });
    console.log({ crudOpenapis, openapis });
    const allOpenapis = (openapis || []).concat(crudOpenapis || []);
    const generateResult = await generateTypescriptSdk({
        openapis: allOpenapis,
    });
    if (!generateResult.files) {
        console.log("Didn't get SDK");
        return;
    }
    const absoluteSdkPath = path.join(process.cwd(), relativeOutputPath || "src/sdk");
    if (!existsSync(absoluteSdkPath)) {
        await mkdir(absoluteSdkPath, { recursive: true });
    }
    //console.log({ generateResult });
    const absoluteFiles = await mapKeys(generateResult.files, (key) => path.join(absoluteSdkPath, key));
    await writeToFiles(absoluteFiles);
    console.log("Written to:", absoluteSdkPath);
};
