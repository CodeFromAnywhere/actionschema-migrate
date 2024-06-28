export const GET = () =>
  new Response("Hello world", {
    status: 302,
    headers: { Location: "/migration-context.schema.json" },
  });
