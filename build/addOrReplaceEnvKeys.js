import { readFileSync, writeFileSync } from "node:fs";
export const addOrReplaceEnvKeys = (filePath, newEntries) => {
    const content = readFileSync(filePath, "utf8");
    const lines = content.split("\n");
    let updatedLines = [...lines];
    Object.keys(newEntries).forEach((key) => {
        const regex = new RegExp(`^${key}=`);
        const existingLineIndex = lines.findIndex((line) => regex.test(line));
        if (existingLineIndex !== -1) {
            // Replace existing line
            updatedLines[existingLineIndex] = `${key}=${newEntries[key]}`;
        }
        else {
            // Add new line
            updatedLines.push(`${key}=${newEntries[key]}`);
        }
    });
    const updatedContent = updatedLines.join("\n");
    writeFileSync(filePath, updatedContent, "utf8");
};
