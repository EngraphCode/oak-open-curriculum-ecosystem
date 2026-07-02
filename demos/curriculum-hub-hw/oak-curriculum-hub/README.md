# oak-curriculum-hub

Oak-styled web UI over the live curriculum **search** (Elasticsearch Serverless
via `oak-search-sdk`) and **content** (Open Curriculum REST API via
`oak-curriculum-sdk`) stacks, built as a full-fidelity reproduction of a Claude
Design export. **Demo by Heather W**, re-platformed from the original HTML
prototype and wired to the live SDKs.

This is a `demos/`-tier workspace at **full repo standards** — strict
TypeScript, the shared full-strict ESLint ruleset, TDD, and WCAG 2.2 AA (see
the [demos tier README](../../README.md)). The design source of truth is the
committed Claude Design canonical export; the surrounding project directory is
mapped in the [project README](../README.md). The original brief is
[`../PROJECT-BRIEF.md`](../PROJECT-BRIEF.md) (historical — paths in it predate
the `demos/` placement).

## Quick start

```bash
pnpm install                                        # from the monorepo root
cp .env.example .env.local                          # in this directory; fill in the values below
pnpm -C demos/curriculum-hub-hw/oak-curriculum-hub dev   # http://localhost:3010
```

Required env: `ELASTICSEARCH_URL`, `ELASTICSEARCH_API_KEY`, `OAK_API_KEY`,
`SEARCH_INDEX_TARGET` (optional `SEARCH_INDEX_VERSION`). Without credentials
the app still boots — the search route returns `503` and the UI shows a
"search backend not configured" state.

## Pages

| Route | Content source |
| --- | --- |
| `/` | Hub: two-search (live Elasticsearch + local static) and destination cards |
| `/course` | The 214-block Oak Course, generated from the canonical export, rendered as a paginated player |
| `/standards` | Quality-standards browse + detail (685 standards, local data) |
| `/rubrics`, `/exemplars`, `/wiki` | Sections reproduced from the export |
| `/lesson/[slug]` | Live lesson detail: summary, quizzes, assets via the REST SDK |

## The two data planes

Both backends hold secrets, so both are server-side only; the browser sees
only our own routes and server-rendered pages.

- **Discovery plane** — `GET /api/search?q=` (the only API route). The route
  handler is built by `lib/search-handler.ts` over `lib/search-core.ts` (a
  dependency-injected seam with contract tests); `lib/search-client.ts` is the
  only file that touches `@oaknational/oak-search-sdk/read`.
- **Content plane** — `lib/curriculum.ts` is the only file that touches
  `@oaknational/curriculum-sdk`. The lesson page calls it server-side
  directly; there is no `/api/lesson` route. Asset downloads link out to
  `thenational.academy` (the API's asset URL is an authenticated endpoint,
  not a browser-usable signed URL).

Local-search data (`lib/static-quality-standards.ts`,
`lib/static-training-courses.ts`, `lib/course/`) is generated from the
committed canonical export by re-runnable extractors in `scripts/` and
compile-time validated against the block-type union.

## Licence

This demo needs no separate licence — it is covered by the repository's root licences:

- **Code** — [`LICENCE`](../../../LICENCE) (MIT).
- **Oak curriculum content** (live search + lesson data, and the quality-standards data) —
  [`LICENCE-DATA.md`](../../../LICENCE-DATA.md), which places curriculum content under the Open
  Government Licence v3.0. Attribution is required:
  *"Contains public sector information licensed under the Open Government Licence v3.0."*
- **Oak brand assets** (fonts, logos, and the design-system kit under
  [`../oak-design-kit/`](../oak-design-kit/)) — the MIT licence covers source code only and does
  not grant trademark or brand rights, and this is Oak's own repository, so no separate grant is
  made or needed.

The root [`LICENCE`](../../../LICENCE) and [`LICENCE-DATA.md`](../../../LICENCE-DATA.md) are the
authoritative terms.
