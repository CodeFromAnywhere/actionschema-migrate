#!/usr/bin/env node

import path from "node:path";
import { runMigration } from "./runMigration.js";
import fs, { PathLike, existsSync, access, constants } from "node:fs";
import { tryParseJson } from "from-anywhere";
import { MigrationContext } from "./MigrationContext.js";
import dotenv from "dotenv";
dotenv.config({});

const fsPromises = fs.promises;
/**
 * uses fs.access to determine if something can be accessed
 *
 * Check File access constants for possible values of mode. It is possible to create a mask consisting of the bitwise OR of two or more values (e.g. fs.constants.W_OK | fs.constants.R_OK).
 */
export const canRead = async (p: PathLike): Promise<boolean> => {
  try {
    await fsPromises.access(p, constants.R_OK);
    return true;
  } catch (e) {
    return false;
  }
};

export const readJsonFile = async <T extends unknown>(
  filePath: PathLike | undefined,
): Promise<T | null> => {
  if (!filePath) return null;
  // TODO: is this needed?
  if (!existsSync(filePath)) return null;

  const readable = await canRead(filePath);
  if (!readable) return null;
  const fileString = await fsPromises.readFile(filePath, "utf8");
  if (!fileString) return null;
  const parsed = tryParseJson<T>(fileString);
  return parsed;
};

// npx actionschema migrate
// looks for MigrationContext in migration-context.json in the first folder where package.json is found.
// TODO: also parse/validate it
const actionschemaJsonPath = path.join(process.cwd(), "actionschema.json");
const publicActionschemaJsonPath = path.join(
  process.cwd(),
  "public",
  "actionschema.json",
);
const existingPath = fs.existsSync(publicActionschemaJsonPath)
  ? publicActionschemaJsonPath
  : fs.existsSync(actionschemaJsonPath)
  ? actionschemaJsonPath
  : undefined;

if (!existingPath) {
  console.log("No actionschema.json found");
  process.exit();
}

readJsonFile(existingPath).then((response) => {
  if (!response) {
    console.log("Couldn't find actionschema.json");
    return;
  }
  runMigration(response as MigrationContext);
});
