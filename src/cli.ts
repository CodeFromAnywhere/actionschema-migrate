#!/usr/bin/env bun
import { readJsonFile } from "from-anywhere/node";
import path from "node:path";
import { MigrationContext, runMigration } from "./runMigration.js";

// npx actionschema migrate
// looks for MigrationContext in migration-context.json in the first folder where package.json is found.
// TODO: also parse/validate it
readJsonFile(path.join(process.cwd(), "actionschema.json")).then((response) => {
  const crudAdminToken = process.env.CRUD_ADMIN_TOKEN;
  if (!crudAdminToken) {
    console.log("Please provide a CRUD_ADMIN_TOKEN in your .env");
    return;
  }

  if (!response) {
    console.log("Couldn't find actionschema.json");
    return;
  }
  runMigration(response as MigrationContext, crudAdminToken);
});
