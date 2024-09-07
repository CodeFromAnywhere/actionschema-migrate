> September 2024: Decided to for now lay down work on this. The reason is that this high level of abstraction causes the resulting code to be quite hard to read/understand. It's useful but the other way to do it is using LLMs and generate less abstracted code directly from an OpenAPI. The latter - although it repeats - results in much simpler, more readable code.

# ActionSchema Migrate CLI

This CLI performs a migration on remote ActionSchema microservices and creates an SDK and Typescript Types in your codebase afterwards.

Goals:

- Provide an easy way to use openapi-based microservices without the pain of microservices.
- Develop things openapi-first and schema-first while keeping a good typescript integration.

Non-goals:

- Make this available for other languages than typescript

# Usage

1. Setup your `actionschema.json`

```json
{
  "$schema": "https://migrate.actionschema.com/migration-context.schema.json"
  //autocomplete from here
}
```

2. Run `npx actionschema-migrate@latest` and follow further instructions.

# TODO

- ✅ Add support for adding sdk for any (partial) openapi from either file or url
- Fix the client everywhere so `client.auth("permission")` allows for non-200 status codes without crashing. Can I add this into the type?
- Use this for `actionschema-migrate` as well, as it depends on the `data` and `openapi-tools` microservices.
- Add support for all other described functionality (see [migration-context](public/migration-context.schema.json))
