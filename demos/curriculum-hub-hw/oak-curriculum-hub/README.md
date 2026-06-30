# oak-curriculum-hub

Oak-styled web UI over the live curriculum **search** (Elasticsearch Serverless
via `oak-search-sdk`) and **content** (Open Curriculum REST API via
`oak-curriculum-sdk`) stacks.

See [`../PROJECT-BRIEF.md`](../PROJECT-BRIEF.md) for the full brief, architecture
and conventions.

**Demo by Heather W**, re-platformed from the original HTML prototype and wired
to the live SDKs. This is a deliberately temporary prototype (`demos/` tier):
it builds, type-checks, and passes its own ESLint, but full production standards
and an accessibility pass are deferred.

## Quick start

```bash
pnpm install                       # from the monorepo root
cp .env.example .env.local         # then fill in ES_* and OAK_API_KEY
pnpm -C apps/oak-curriculum-hub dev # http://localhost:3010
```

No credentials yet? The app still boots — the search route returns `503` and the
UI shows a "search backend not configured" state.

## The two SDK seams

All SDK calls live in exactly two files, so the rest of the app is decoupled
from the (verify-before-shipping) SDK surface:

- `lib/search-client.ts` — `@oaknational/oak-search-sdk/read`
- `lib/curriculum.ts` — `@oaknational/curriculum-sdk`

Each guessed export/method is marked `// VERIFY`. Confirm against the package
types in `packages/sdks/` and adjust those two files only.

## Routes

| Route                          | Plane     | SDK                                       |
| ------------------------------ | --------- | ----------------------------------------- |
| `GET /api/search?q=`           | discovery | `oak-search-sdk/read`                     |
| `GET /api/lesson/[slug]`       | content   | `curriculum-sdk`                          |
| `GET /api/asset/[slug]/[type]` | content   | `curriculum-sdk` (signed-URL passthrough) |

## Add to the workspace

1. Add `apps/*` is already globbed in most setups; otherwise add
   `apps/oak-curriculum-hub` to `pnpm-workspace.yaml`.
2. Register in `turbo.json` pipelines (`build`, `type-check`, `lint`).
3. Decide Vercel deployment alongside the MCP server.
