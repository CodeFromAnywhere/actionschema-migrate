import fs from "node:fs";

export const GET = () => {
  const readmeContent = fs.readFileSync("README.md");

  return new Response(readmeContent, {
    status: 200,
    headers: { "Content-Type": "text/markdown" },
  });
};
