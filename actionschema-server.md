# Motivation

- Using many different Cloud services creates annoyance in DX as it's hard to keep it in sync.
- We need a central place to host small modular freemium serverless OpenAPIs
- Serving, testing, and monetisation of utility is hard. It needs to be easy. Also for agents.
- Developers don't like No-code, business people don't like code. We need it to be both: maybe code.

# Idea

My idea would be to not have a CLI, but rather have an integrated deployment environment. Every github repo can be an accumulation of different things:

- looks at `actionschema-config.json` for configuration.
- looks at `clerk-config.json` for user configuration
- looks at `stripe-config.json` for payment configuration
- `.proxy.json` files should offer a proxy to any other apis.
- `.schema.json` files should get pushed to the crud-openapi service.
- `.agent.json` files get pushed to the agent-openapi service.
- `src/*.endpoint.ts` and `src/**/*.request.ts` files get pushed into cloudflare workers and become proxied. looks to `wrangler.toml` for cloudflare settings.
- README.md becomes the openapi description.

After you push a repo publicly, you can replace your github url: https://github.com/CodeFromAnywhere/test123 becomes https://server.actionschema.com/CodeFromAnywhere/test123 and should redirect to https://server.actionschema.com/CodeFromAnywhere/test123/main

The OpenAPI would expose all APIs in your repo, lazily pushed to the services as specified.

The server should store a kv store for your project with required env-keys as they are provided. Once provided, can only be changed with the admin token.

The frontpage https://server.actionschema.com/CodeFromAnywhere/test123 will show a chat with which you'd be able to interact with the proxy agent to update env keys as admin. It should link to all your services that got created and served.

After you oauth2 with github with read-repo scope, the envs get centralised. It would also be possible to link `repo-name.private` private repo to store the auth.

If this wasn't great enough already; In order to allow testing before deploying, we can allow for deployment from any branch using `/[branch]` suffix. Non-main ones would host a prefixed service for each.

This whole thing would be some sort of Vercel but for agents, hosted on serverless cloudflare. A simplified way to build serverless apps.

# TODO

- ✅ Make `github.actionschema.com/{owner}/{repo}` so its easy to get public code
- ✅ Find a way to get repo's last commit
  - ✅ To download git folder: `git clone --filter=blob:none --no-checkout git@github.com:foo/bar.git` (https://stackoverflow.com/questions/36547904/git-clone-without-objects-to-do-git-log)
  - ❌ Afterwards, lets print the commits in a JSON:
  - `cd bar && git fetch --all && git log --all --graph --decorate`
- ❌ Serve `server.actionschema.com/{owner}/{repo}` on vercel **NO! WHY! let's serve where-ever they want by using vercel.json, for now.**
- check out github for `x/y` by looking in the kv-store and fetching the github api for last changes
- redirect `x/y` to `x/y/main` if `main` branch exists
- based on the JSON-blob present in the kv-store we generate the openapi
- based on the JSON-blob we push services (if not already)
- based on the JSON-blob the OpenAPI routes get served

If I have this, a couple lines of code can be served, tested, and monetised. We can also create an agent that does this. EPIC!

# ⚠️⚠️⚠️ Alternatives ⚠️⚠️⚠️

- a cli and npm command to do this before deployment or development
- github actions to serve the services that can be triggered locally too
- internalising things rather than using the openapi only

# Later

- allow for extensibility of the different services when self-hosting server.actionschema.com, and allow editing the endpoint urls for different services after github oauth.
- implement `.gitignore#private` standard (read a bit more about it first: https://chatgpt.com/c/93de8a63-3834-4c2c-bc26-94b0cafebd64)
- allow the server-agent to edit itself based on chatting. it can make a PR. it can also change private stuff in the kv-store. this allows for a secondary interface to make agent apps.

# API

https://api.github.com/repos/CodeFromAnywhere/actionschema/contents --> `{download_url}[]`
