# Use `authenticate` via SDK

✅ Improve `actionschema-migrate` to allow for pruned OpenAPI

✅ Also improve the fact that imports need to have a `.js` suffix. Add this as config.

Make SDK with https://auth.actionschema.com/openapi.json with `operationIds: ["authenticate"]`

In CRUD-openapi, use `client.auth.authenticate()` to determine we have access everywhere besides the hardcoded auth token.

Also try using it via a middleware.ts and document this!

Make a new html by applying `website.yaml`. Alter it so it logs in with github first, then renders projects and models, linking to `project.html?id=`, `model.html?id=` as well as the respective references. Take baseUrl from `window.location.origin`.

Test CRUD OpenAPI in localhost, and ensure now it's easy to play around with it.
