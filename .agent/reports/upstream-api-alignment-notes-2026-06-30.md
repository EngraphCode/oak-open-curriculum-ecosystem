# Upstream API Alignment — Process Notes (living)

Living notes on bringing the Oak Open Curriculum Ecosystem into alignment with the
**evolving** upstream Oak Open Curriculum API and bulk export. Each step records
**what** was done, **why**, and **how it generalises** — because the API surface
will keep changing, and the value of this record is in the repeatable process, not
the one instance.

- **Lane:** `feat/upstream-api-alignment` (worktree off `main`).
- **Trigger instance (2026-06-30):** upstream added a `programmes` resource family
  (5 GET endpoints + 5 response schemas); SDK and MCP tools regenerated.

## The unifying principle (the substrate, not the instance)

Every schema-bearing surface in this repo has two obligations:

1. **Derive, never author.** All types, data structures, Zod schemas, and type
   predicates flow from that surface's schema/data at codegen time — the Cardinal
   Rule (`.agent/directives/schema-first-execution.md`, ADR-029/030/031). This holds
   for the OpenAPI surface **and** the bulk export surface.
2. **Make drift observable and gated.** The committed cache of each schema is the
   source of truth for hermetic builds; a lightweight validator warns when the
   committed cache falls behind upstream. Drift is surfaced, not discovered by
   accident.

The two surfaces and their schemas:

| Surface | Upstream | Schema fingerprint (committed) | Type generation |
| --- | --- | --- | --- |
| OpenAPI / SDK / MCP tools | `https://open-api.thenational.academy/api/v0/swagger.json` | `packages/sdks/oak-sdk-codegen/schema-cache/api-schema-original.json` (`info.version` = `0.7.0-<gitsha>`) | `pnpm sdk-codegen` (`code-generation/codegen.ts`) — schema-derived ✅ |
| Bulk export | `https://open-api.thenational.academy/api/bulk` | `apps/oak-search-cli/bulk-downloads/{schema.json,manifest.json}` (now git-tracked) | `code-generation/bulkgen.ts` — **template-authored ❌ (defect, see Step 5)** |

## Step 1 — Isolate the work in a built worktree

**What.** Created `feat/upstream-api-alignment` as a linked worktree off `main`
(current: `main` == `origin/main`), then `pnpm install && pnpm build` before any
gate or work.

**Why.** A worktree isolates this lane from the primary checkout's unrelated WIP, so
its gates are not cross-contaminated (the primary checkout's pre-commit/pre-push gate
the whole tree, so a peer's broken untracked WIP can otherwise block commits). Build
before work because the ESLint flat config and the statusline both resolve from
`dist/`; an unbuilt worktree silently fails `lint` (and shows no statusline).

**How it generalises.** Every alignment pass is one bounded lane → one worktree → one
draft PR → merge → remove. Build first, always (`.agent/rules/worktree-hygiene.md`).

## Step 2 — Analyse the OpenAPI schema delta before regenerating

**What.** Diffed the freshly-fetched cached schema against the previous committed
version with `jq` set operations over `.paths`, `.components.schemas`, and per-path
operation fingerprints (operationId + parameter names + response `$ref`s). Result:
**purely additive** — 5 new `programmes` paths + 5 schemas, nothing removed, no
parameter/response/type change to any existing endpoint; the 15 "changed" existing
paths and 3 "changed" schemas were **description text only** (an `asset`→`assets`
URL typo fix and cross-references to the new programme routes).

**Why.** Understanding the delta before regenerating tells you the blast radius
(additive vs breaking) and what to verify downstream. "Regenerate and trust green
types" is necessary but not sufficient.

**How it generalises.** A reusable delta recipe (works for any two schema versions):

```bash
# paths added / removed
comm -13 <(jq -r '.paths|keys[]' PREV|sort) <(jq -r '.paths|keys[]' NEW|sort)   # added
comm -23 <(jq -r '.paths|keys[]' PREV|sort) <(jq -r '.paths|keys[]' NEW|sort)   # removed
# schemas added / removed / changed-body
comm -13 <(jq -r '.components.schemas|keys[]' PREV|sort) <(jq -r '.components.schemas|keys[]' NEW|sort)
# classify an existing path change as structural vs prose: fingerprint op+params+response-refs,
# diff that; if identical, the change is description-only.
```

The structural-vs-prose fingerprint is the load-bearing trick: it separates a
breaking change from documentation churn without reading every line.

## Step 3 — Regenerate the SDK and MCP tools from the schema

**What.** Ran `pnpm sdk-codegen` in the worktree (re-fetched the live schema,
reproducing the same delta deterministically) then `pnpm build`. Output matched the
primary checkout's already-regenerated state exactly: 26 modified + 10 untracked
files; 5 new tool descriptors (`get-subjects-programmes`, `get-programmes`,
`get-programmes-units`, `get-programmes-assets`, `get-programmes-questions`) plus
their generated test-fixture stubs.

**Why.** The generated artefacts are not the source of truth — the schema + generator
are. Regenerating off `main` proves the alignment is deterministic and reproducible,
and is the schema-first-correct way to "do" the alignment (vs transplanting a diff).

**How it generalises.** `pnpm sdk-codegen && pnpm build` is the whole alignment
mechanism for the OpenAPI surface. The Cardinal Rule guarantees it is sufficient to
bring all workspaces into alignment when the schema changes.

## Step 4 — Confirm the endpoints became registered tools

**What.** Verified the 5 endpoints are real, complete tool descriptors (full
`invoke`, input/output Zod + JSON schemas, validation, annotations) registered in
`MCP_TOOLS` (`…/mcp-tools/definitions.ts`, 29 tools total) and wired in
`…/mcp-tools/runtime/execute.ts`. `type-check` passes across all 45 workspace
projects against the new generated types.

**Why.** Registration ≠ generation ≠ function. A file existing does not mean the tool
is listed; a listed tool is not proven to execute. This step closes the
generation→registration gap; Step 6 closes the registration→execution gap.

**How it generalises.** The tool registry is generated from the schema's operations,
so new endpoints become registered tools by construction — but always confirm the
registry count moved and `type-check` is green across consumers, because downstream
type breakage is where an additive-looking change can still bite.

> Note: `tools/*` are the functional descriptors; `stubs/tools/*` are generated test
> fixtures (sample responses), not incomplete tools.

## Step 5 — Bulk export: "before" shape + a confirmed schema-first defect

**What (before-shape capture).** The existing bulk download
(`apps/oak-search-cli/bulk-downloads/`, ~635 MB, 30 subject×phase files, dated
2026-06-10) carries an authoritative `schema.json` (a JSON-Schema titled "Oak
Curriculum API Bulk Export Schema") and a `manifest.json` (`downloadedAt`, `source`,
per-file sizes). The bulk shape is keyed by **subject×phase** (`french-primary`) as
`{ sequenceSlug, subjectTitle, sequence[units], lessons[], ks4Options? }`. **There is
no `programme` entity in the bulk export** — programmes are implicit (units carry
`yearSlug`/`keyStageSlug`/`pathway`/`tier`/`examBoard`). So the API gaining programme
endpoints does **not** by itself imply the bulk shape changed; that is a concrete diff
to run (fresh `schema.json` vs the committed one).

**What (defect — owner-confirmed).** The bulk Zod schemas/types/predicates
(`src/types/generated/bulk/bulk-schemas.ts`) are **hand-authored** by concatenating
static template strings (`code-generation/typegen/bulk/schema-templates*.ts`), not
derived from the bulk `schema.json`. This is an **implementation error**: it violates
the Cardinal Rule. A real bulk-data shape change does not auto-propagate — it requires
someone to hand-edit the templates, which is exactly the drift schema-first exists to
prevent.

**What (tracking).** The bulk-downloads `.gitignore` now tracks `schema.json`,
`manifest.json`, and `README.md` (only data files stay ignored), so a fresh download
that changes the shape shows up in `git diff` — version-controlled drift detection for
the bulk side.

**Why.** The bulk export is the second schema-bearing surface feeding search/indexing.
If its types are hand-authored, the whole pipeline can silently diverge from the data
it ingests. Tracking the schema fingerprint makes that drift visible.

**How it generalises.** Both surfaces must obey the same two obligations (derive +
observable drift). The fix is to generate the bulk Zod/types from `schema.json` (it is
already a JSON-Schema) the same way the OpenAPI types flow from the OpenAPI schema —
see the plan's bulk-schema-derivation workstream.

## Step 6 — Tool execution verification (VERIFIED LIVE)

**What.** Proved the tools execute against the live API with a throwaway GET-only
script (`createOakPathBasedClient(OAK_API_KEY)` + `executeToolCall`), key injected via
`--env-file` (never read), deleted after. Results: `get-subjects-programmes
{subject:english}` → HTTP 200, 15 programme slugs; `get-programmes
{programme:english-primary-year-1}` → HTTP 200, full programme object (keystage,
phase, year, nullable examboard/pathway/tier). The regenerated zod **output
validation passed** — the live response shape matches the regenerated schema.

**Why.** Registration + type-check prove wiring, not function. A live call is the only
proof that (a) the endpoint returns data and (b) the regenerated schema matches the
live response (the real risk after any regen). The existing e2e estate cannot prove
this — it is network-free by design (ADR-078; the codegen e2e blocks `fetch`, the HTTP
app stubs `executeMcpTool`), so a live proof is necessarily an ad-hoc script, not a
committed test.

**How it generalises.** After any regen, run one live `executeToolCall` per *new* or
*shape-changed* operation against prod (clear `OAK_API_URL` to force the default). An
`ok` with populated data = pass; an Output-validation `err` = the live response
diverged from the schema (the canonical post-regen failure). Auth at the SDK layer is
just `Authorization: Bearer <OAK_API_KEY>`; the oauth2/`email` scope and
`requiresDomainContext` are MCP-transport/Clerk concerns, not enforced in `invoke`.

**Finding (UX, verified):** the real slugs are the **full** form
(`english-secondary-year-10-edexcel`, `english-primary-year-1`), not the short
`y7`/`y10-biology-foundation` the `get-subjects-programmes` description claims — the
description is factually wrong and must be corrected at the generator (Step 9/plan).

## Step 7 — Cached-schema default + staleness validator (DESIGNED, verified)

**What (verified by investigation + first-hand).** Two parts, and a validator already
half-exists:

1. **Invert the default.** `code-generation/codegen.ts` `loadSchema()` fetches live by
   default today (`isCiMode` only reads cache in CI). Invert to **cached unless an
   explicit online opt-in** (`--online` / `SDK_CODEGEN_MODE=online`), keeping `isVercel`
   on the online path (Vercel deploy wants the freshest schema; it has network egress).
   Preserve `writeSchemaCacheIfChanged` on the online path. Net: local + CI + offline
   read the committed cache (hermetic, deterministic); only an explicit refresh or
   Vercel fetches live.
2. **The staleness validator ALREADY EXISTS** — `agent-tools/src/ci/ci-schema-drift-check.ts`,
   warn-only (always exit 0), already wired into CI at `.github/workflows/ci.yml:147-149`
   (`if: always()`). So this is **adopt + harden**, not build. Two real defects: (i) a
   stale docstring claiming `OAK_API_KEY` is required (the swagger endpoint returns 200
   unauthenticated — verified), and (ii) it compares **full serialised JSON**, so it
   reports drift on any field tweak even at the same version. The only CI-side gap is
   wiring the same script into `.husky/pre-push` as a non-blocking advisory step.

**Why.** Cached-default makes builds reproducible and network-independent; the validator
makes the resulting staleness *observable* and *gated* (warn). Warn-not-fail initially
(new checks start at warn). A stale cache must never block unrelated work — only surface.

**Decision (owner-settled 2026-06-30): VERSION ONLY.** Compare `info.version`; warn on
difference; do **not** content-diff. A content change without a version bump (the
`asset→assets` typo should have produced a patch bump) is an **upstream defect** to
surface upstream — not something our validator masks by content-diffing. Adding
content-sensitivity would be inventing compensating optionality, which the principles
forbid (§Strict-and-Complete, §No-escape-hatches). So WS2 **narrows** the existing
full-content check to version-only — that narrowing is the correction, not a regression.
(My earlier "report both" verdict was the error: it compensated for an upstream bug
instead of trusting the version contract.)

**How it generalises.** Every schema-bearing cache (OpenAPI now; the bulk `schema.json`
next) gets: committed cache as the build source + a warn-only staleness check (version
headline + content advisory) in CI and pre-push. Drift is surfaced, never silently
carried.

**Risk to honour:** retiring the old `--ci`/`SDK_CODEGEN_MODE=ci` sentinel needs a
Vercel-dashboard check (the build command is configured there, not in-repo, so it
cannot be grepped) — verify via the Vercel MCP before removing the path.

## Step 8 — Bulk shape check + bulk types schema-derivation (shape VERIFIED; fix DESIGNED)

**What (shape check, verified).** The upstream-source bulk `schema.json` at HEAD
`8eceb70` (`oak-openapi/src/app/api/bulk/schema.json/schema.json`, a static
hand-maintained-upstream JSON-Schema served verbatim) is **jq-normalised identical** to
our committed Jun-10 copy — the byte difference is formatting only. So **the bulk export
shape has not changed**, and programmes are not (and were never) a bulk entity. A fresh
full download (~0.67 GB, `pnpm bulk:download`, needs `OAK_API_KEY`) remains worthwhile to
check whether *data* now populates the schema's **superset fields** (the schema declares
`lesson.restricted/oakUrl/canonicalUrl`, `unit.pathway/tier/examSubjects/categories`
that the current template Zod omits and no current data file populates).

**What (the defect + fix).** The bulk Zod schemas/types/predicates
(`src/types/generated/bulk/bulk-schemas.ts`) are **hand-authored** by concatenating
templates (`code-generation/typegen/bulk/schema-templates*.ts`) — a confirmed
schema-first violation (owner: "an implementation error"). They are also a **strict
subset** of the authoritative `schema.json`, so the `.strict()` reader would *throw* the
moment upstream emits any superset field into data. The fix: **generate the bulk Zod
from `schema.json`** (JSON-Schema → Zod codegen) the same way the OpenAPI types flow from
the OpenAPI schema, retiring the templates. Commit `schema.json` + `manifest.json` (the
owner has un-ignored them; they are not yet committed) so the canonical shape is
version-controlled and drift shows in `git diff`.

**Why.** The bulk export is the second schema-bearing surface (it feeds search
indexing). Hand-authored types silently diverge from the data; deriving from
`schema.json` closes that and makes the superset fields first-class. Committing the
schema fingerprint makes bulk drift observable, mirroring the OpenAPI staleness check.

**How it generalises.** Both surfaces obey the same two obligations — derive all types
from the schema, and make schema drift observable (committed fingerprint + warn-only
check). The bulk surface joins the OpenAPI surface under one substrate.

**Risk to honour:** the strict SDK reader (`parseBulkFile`) and the lenient
ground-truth parser (`bulk-data-parser.ts`, tolerates extra fields) disagree on what is
"valid"; a shape change passes the latter and fails the former. The schema-derived Zod
should be the single source both consume.

## Generalised runbook (draft) — "the upstream surface changed, now what?"

1. New worktree off `main`; `pnpm install && pnpm build`.
2. Refresh the cached schema (online opt-in) → **diff the delta** (Step 2 recipe);
   classify additive vs breaking.
3. `pnpm sdk-codegen && pnpm build` → confirm registry moved + `type-check` green
   across consumers.
4. Refresh the bulk download → **diff `schema.json`** (tracked) for shape change →
   regenerate bulk types (schema-derived) → confirm parse over real data.
5. Verify representative tools **execute** against the live API.
6. Assess discoverability/UX (does `get-curriculum-model` teach the new concept?).
7. Gates green → commit (explicit pathspec) → draft PR → owner review → merge →
   remove worktree.

## Open questions / decisions

- Vercel build behaviour under cached-default (currently fetches live). Decision in
  the plan.
- Whether the staleness validator should ever escalate from warn to fail (default:
  start at warn, per `feedback_new_eslint_rules_start_warn`).
