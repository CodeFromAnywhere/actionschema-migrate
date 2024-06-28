import fs from "node:fs";
import path from "node:path";
export const GET = () => {
  const readmeContent = fs.readFileSync(path.join(process.cwd(), "README.md"));
  return new Response(readmeContent);
};
