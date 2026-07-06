# Project brief — Curriculum Hub

**A new workspace for `oak-open-curriculum-ecosystem` that puts an Oak-styled
web UI over the live curriculum search stack.**

|                            |                                                                                                |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| **Workspace**              | `apps/oak-curriculum-hub/`                                                                     |
| **Stack**                  | Next.js (App Router) + React, TypeScript                                                       |
| **Consumes**               | `oak-search-sdk`, `oak-curriculum-sdk`, `search-contracts`, design tokens — all `workspace:*`  |
| **Status of this package** | Runnable shell + real route handlers. SDK call sites are isolated and marked for verification. |

---

## 1. Why this exists

The ecosystem repo ships a high-accuracy hybrid search stack (Elasticsearch
Serverless + RRF, ELSER + BM25) and a typed curriculum REST SDK — but its
search **UI layer was retired in Feb 2026**; it is now CLI/SDK/MCP-first. There
is no teacher-facing web front-end over that retrieval today.

This workspace fills that gap: a polished, Oak-branded search experience that
runs on the **same indices and the same `oak-search-sdk`** as
`curriculum-mcp-alpha`, so retrieval quality is identical to the alpha — not a
baked snapshot or the weaker public REST title-search.

It started life as an HTML prototype (the "Oak Curriculum Hub" demo). This
package is that prototype, re-platformed as a real workspace app.

## 2. Goal

A teacher can type a natural-language query ("comparing fractions", "the Romans
KS2", "what turned the tide in WW2") and get live, ranked **lessons, units and
threads**, each linking to `thenational.academy`; opening a lesson surfaces its
summary, quizzes, transcript and downloadable resources.

## 3. Architecture — two data planes, one server boundary

Both backends hold secrets, so both sit behind Next.js server routes. The
browser only ever calls our own `/api/*`.

```text
Browser (Oak-styled hub UI)
   │  /api/search?q=…                 /api/lesson/[slug]
   ▼                                   ▼
Next.js server (App Router)
   │  oak-search-sdk /read            oak-curriculum-sdk
   │  (ES credentials)                (OAK_API_KEY)
   ▼                                   ▼
Elasticsearch Serverless            Oak Open Curriculum REST API
(oak_lessons, oak_unit_rollup,      (summaries, quizzes, transcripts,
 oak_threads, oak_sequences …)       signed asset download URLs)
```

- **Discovery plane** — `oak-search-sdk/read`. One server-side RRF `_search`
  per scope; lessons/units use 4-way RRF (BM25 + ELSER × content/structure),
  threads 2-way. Noise-phrase stripping, curriculum-phrase boosting and
  transcript-aware score normalisation are all inside the SDK.
- **Content plane** — `oak-curriculum-sdk`. Typed REST access, called only when
  a result is opened.

## 4. What's in this package

```text
oak-curriculum-hub/
├── package.json            workspace:* deps
├── next.config.ts          transpiles workspace packages
├── tsconfig.json
├── .env.example            ES + OAK_API_KEY + index target/version
├── app/
│   ├── layout.tsx          Lexend + Oak tokens
│   ├── globals.css         Oak palette / resets
│   ├── page.tsx            hub (server) → <SearchHub/>
│   ├── lesson/[slug]/page.tsx   lesson detail
│   └── api/
│       ├── search/route.ts              discovery plane
│       ├── lesson/[slug]/route.ts       content plane
│       └── asset/[slug]/[type]/route.ts signed-download passthrough
├── lib/
│   ├── env.ts              validated env access
│   ├── logger.ts           structured logging
│   ├── search-client.ts    ← the ONLY oak-search-sdk seam
│   └── curriculum.ts       ← the ONLY oak-curriculum-sdk seam
└── components/
    ├── SearchHub.tsx       client: debounced search + result groups
    ├── ResultCards.tsx     lesson / unit / thread cards
    └── subjects.ts         subject slug → label + pastel colour
```

The two `lib/*-client.ts` files are the **only** places that touch the SDKs.
Every guessed export or method signature lives there, clearly marked
`// VERIFY`. The rest of the app compiles against local interfaces, so adjusting
to the real SDK shape is a one-file change.

## 5. Running it

```bash
# from the monorepo root, after adding to pnpm-workspace.yaml
pnpm install
cp apps/oak-curriculum-hub/.env.example apps/oak-curriculum-hub/.env.local
# fill in ES_* and OAK_API_KEY
pnpm -C apps/oak-curriculum-hub dev      # http://localhost:3010
```

Without ES credentials the search route returns a clear `503` and the UI shows
a "search backend not configured" state — the app still boots.

## 6. Conventions to honour (repo rules)

- **Cardinal Rule** — never hand-write API types; they flow from the OpenAPI
  schema via `pnpm sdk-codegen`. The local types in `lib/*-client.ts` are view
  models, not API contracts — map from the SDK's generated types.
- **ADR-134 capability boundary** — app code imports `oak-search-sdk/read`
  only. Never `/admin` or internal paths.
- **`Result<T,E>`** — the repo favours explicit error returns over throwing;
  align the route handlers if you wire the repo's `result` package.
- **Blocked content** — handle the API's `BAD_REQUEST` "blocked for copyright
  reasons" case gracefully in rendering.
- **Brand voice** — sentence case everywhere, "pupils" (not students), British
  spelling. Swap the placeholder hex for `oak-design-tokens` variables.

## 7. Confirm before coding

1. **Exact SDK surface** — factory name and per-scope method signatures of
   `@oaknational/oak-search-sdk/read`, and the hit shape it returns. Read the
   package's own types in `packages/sdks/oak-search-sdk/`. Same for the
   curriculum SDK's package name (`@oaknational/curriculum-sdk` vs
   `oak-curriculum-sdk`) and method names.
2. **Elasticsearch read credentials** for the live Serverless instance, and
   which `SEARCH_INDEX_TARGET` to point the demo at (start with `sandbox`).
3. **Workspace registration** — add to `pnpm-workspace.yaml` and `turbo.json`
   pipelines; decide whether Vercel deploys it alongside the MCP server.

## 8. Acceptance criteria

- [ ] Typing a query returns live lessons/units/threads from the ES indices.
- [ ] Each card links to the correct canonical `thenational.academy` URL.
- [ ] Opening a lesson shows summary + quiz + downloadable assets via the REST SDK.
- [ ] No secret is exposed to the client (verify network tab — only `/api/*`).
- [ ] Type-check, lint and the repo quality gates pass.

---

_Grounded in the repo README and `apps/oak-search-cli/docs/ARCHITECTURE.md`
(search) and the Open API OpenAPI schema v0.7.0 (content). SDK method-level
names are illustrative and must be verified against the published packages._
