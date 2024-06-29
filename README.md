# ActionSchema Migrate CLI

This CLI performs a migration on remote ActionSchema microservices and creates an SDK and Typescript Types in your codebase afterwards.

Goal: Provide an easy way to use openapi-based microservices without the pain of microservices

# Usage

1. Setup your `actionschema.json`

```json
{
  "$schema": "https://migrate.actionschema.com/migration-context.schema.json"
  //autocomplete from here
}
```

2. Run `bunx actionschema-migrate` and follow further instructions.

# TODO

- Add support for adding sdk for any (partial) openapi from either file or url
- Use this for `actionschema-migrate` as well, as it depends on the `data` and `openapi-tools` microservices.
