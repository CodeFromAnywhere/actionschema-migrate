# May/June 2024

Made the first version of this

# July 25th 2024

✅ Improve `actionschema-migrate` to allow for pruned OpenAPI

✅ Also improve the fact that imports need to have a `.js` suffix. Add this as config.

✅ Make SDK with https://auth.actionschema.com/openapi.json with `operationIds: ["authenticate"]`

✅ In CRUD-openapi, use `client.auth.permission()` to determine we have access everywhere besides the hardcoded auth token.

❌ Also try using it via a middleware.ts and document this!
