#!/usr/bin/env bun
import path from "node:path";
import { runMigration } from "./runMigration.js";
import fs, { existsSync, constants } from "node:fs";
import { tryParseJson } from "from-anywhere";
const fsPromises = fs.promises;
/**
 * uses fs.access to determine if something can be accessed
 *
 * Check File access constants for possible values of mode. It is possible to create a mask consisting of the bitwise OR of two or more values (e.g. fs.constants.W_OK | fs.constants.R_OK).
 */
export const canRead = async (p) => {
    try {
        await fsPromises.access(p, constants.R_OK);
        return true;
    }
    catch (e) {
        return false;
    }
};
export const readJsonFile = async (filePath) => {
    if (!filePath)
        return null;
    // TODO: is this needed?
    if (!existsSync(filePath))
        return null;
    const readable = await canRead(filePath);
    if (!readable)
        return null;
    const fileString = await fsPromises.readFile(filePath, "utf8");
    if (!fileString)
        return null;
    const parsed = tryParseJson(fileString);
    return parsed;
};
// npx actionschema migrate
// looks for MigrationContext in migration-context.json in the first folder where package.json is found.
// TODO: also parse/validate it
const actionschemaJsonPath = path.join(process.cwd(), "actionschema.json");
readJsonFile(actionschemaJsonPath).then((response) => {
    if (!response) {
        console.log("Couldn't find actionschema.json");
        return;
    }
    runMigration(response);
});
