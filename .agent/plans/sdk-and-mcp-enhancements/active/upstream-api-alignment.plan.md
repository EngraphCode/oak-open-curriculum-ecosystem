---
status: active
lineage:
  serves_thread: upstream-api-alignment
  serves_stream: TBD-owner (governed-axis pending; do not free-text — see napkin 2026-06-30 registry-and-validation)
  strategic_choice: schema-first everywhere + observable schema drift
  derives_from: .agent/reports/upstream-api-alignment-notes-2026-06-30.md
todos:
  - id: ws0-ship-additive-regen
    content: Commit the verified additive SDK/MCP regen (programmes family) and open a draft PR to main
    status: in_progress
  - id: ws1-cached-default
    content: Invert codegen loadSchema() to cached-by-default with explicit online opt-in
    status: pending
  - id: ws2-staleness-validator
    content: "Wire the existing full-content ci-schema-drift-check into pre-push (warn-only) and fix its misleading OAK_API_KEY docstring; leave the diff behaviour unchanged (D1 corrected)"
    status: pending
  - id: ws3-bulk-schema-derived
    content: "DESIGN-GATED: settle the bulk type-derivation approach with the owner (WS3.0), then dry-run blast-radius probe (WS3.1, STOP on consumer type errors), then land (WS3.2) — generate bulk Zod/types/predicates from schema.json, retire templates, commit schema.json + manifest.json"
    status: pending
  - id: ws4-ux-discoverability
    content: Surface programmes in get-curriculum-model (hierarchy level, tool category, byProgramme workflow, steering, idFormat) and fix the get-subjects-programmes slug description at the generator
    status: pending
  - id: ws5-live-proof-recipe
    content: Establish the repeatable post-regen live-execution proof (decision needed on a committed network-permitted smoke lane)
    status: pending
  - id: ws6-runbook
    content: Graduate the process notes into a permanent "aligning to an evolving upstream surface" runbook
    status: pending
---

# Upstream API Alignment — and a repeatable, observable alignment process

## Handoff status — 2026-07-01 (Bonfire turns Basalt → Vanilla stirs Spore)

**Session scope (owner-narrowed 2026-07-01): adapt the repo to the changed upstream API
spec only.**

**DONE & shipped (PR #291, draft):**

- **WS0** — programmes regen (SDK + 5 MCP tools), live-verified (real 200s; regenerated
  zod output-validates). Fresh cache `8eceb70`.
- **Cached-default codegen + pre-push staleness advisory** (`79364bbd1`, cherry-picked
  onto #291 — the coherent home, since #291 carries the *fresh* cache). `resolveSchemaSource`
  is pure + unit-tested. The `--online` / `SDK_CODEGEN_MODE=online` / `VERCEL` opt-in is
  **retained** (the owner **withdrew** the `USE_LIVE_API_SCHEMA` switch change).

**DECIDED + DIAGNOSED, NOT YET IMPLEMENTED — successor's first task:**

- **The drift-check must compare SEMANTICALLY** (canonical / sorted-key), not raw bytes
  (owner-confirmed 2026-07-01). **Diagnostic (first-hand, do not re-derive):** two
  consecutive raw swagger fetches are **byte-identical** → upstream is deterministic; the
  cache↔fetch byte difference is our **two-pipeline mismatch** (the cache is written from
  `validateOpenApiDocument(live)` via `writeSchemaCacheIfChanged`'s stringify, while the
  drift-check stringifies the **raw** fetch) — `jq -S` confirms semantic identity. So a
  byte compare cries wolf; semantic compare is right. **Fix:** `agent-tools/src/ci/
  ci-schema-drift-check.ts` `main()` comparison (currently `cachedText.trimEnd() ===
  liveText.trimEnd()`, ~line 104) → extract a pure `evaluateSchemaDrift(cachedText,
  liveText)` that canonicalises (recursively sort object keys, preserve array order) both
  sides before comparing; unit-test it; wire `main()`. Also fix the annotation's stale
  "Run `pnpm sdk-codegen` with OAK_API_KEY set" (the endpoint is public; the refresh path
  is `--online`). The `OAK_API_KEY` docstring line is already corrected in `79364bbd1`.

**MOVED OUT (owner directive):** bulk-types-schema-derivation (was WS3) → **its own
separate plan**, not this session. Compose approach (b) is owner-confirmed; the
template-authoring defect + the `schema.json`-is-a-superset finding are conserved in §WS3
below — mine them into the new `future/` plan.

**REMAINING IN-SCOPE:** **WS4** — surface programmes in `get-curriculum-model` (co-equal
per D2) + fix the `get-subjects-programmes` slug description (verified full-form live:
`english-secondary-year-10-edexcel`, **not** `y7`). Generated descriptions are fixed at the
generator, not the output file.

**DEFERRED (separate/later):** WS5 committed live smoke lane; WS6 runbook graduation.

**Worktree estate:** `oak-upstream-api-alignment` = #291 (this adaptation).
`oak-schema-staleness-validator` (`feat/cached-schema-default`, `0677e8916`, **pushed, no
PR**) is now **redundant** — its content is `79364bbd1` on #291 — **safe to delete**
(owner-gated destructive removal; content-verified in #291).

**Continuity/consolidation still owed (surfaced, not done):** a `upstream-api-alignment`
thread record + `repo-continuity.md` refresh belong on the primary/main branch (not this
feature branch, to avoid per-branch `.agent` divergence); the consolidation gate + full
`pnpm check` were not run in this handoff. See the successor brief.

## Problem (gap · harm · mechanism · constraints · success)

- **Gap.** The upstream Oak API surface evolves (this instance: a new `programmes`
  resource family). Bringing the ecosystem into alignment is currently a manual,
  re-derive-each-time effort, and two schema-bearing surfaces are not fully
  schema-first or drift-observable.
- **Harm.** Agents/educators get tools that work but are under-discoverable; the bulk
  pipeline can silently diverge from the data it ingests; staleness of the committed
  schema cache is not surfaced; every future evolution repeats the same manual archaeology.
- **Mechanism (causal hypothesis).** Types flow from schema for the OpenAPI surface, but
  (a) codegen fetches live by default (non-hermetic builds), (b) the bulk types are
  hand-authored templates (not schema-derived), and (c) human/agent guidance
  (curriculum-model, tool descriptions) is not regenerated from the same source, so all
  three drift independently of the schema.
- **Constraints.** Cardinal Rule (schema-first); worktree-hygiene; warn-not-fail for new
  checks; no machine-local paths; owner owns feature/curriculum-model shaping.
- **Success.** The programmes alignment is shipped and verified; both schema-bearing
  surfaces derive all types from their schema and surface drift; and the process is a
  documented runbook so the next evolution is cheap.

## End goal · mechanism · means

- **End goal.** A coherently-aligned ecosystem for the current change, plus a repeatable
  observable process for future upstream evolution.
- **Mechanism.** Two obligations on every schema-bearing surface: **derive, never
  author** (types from schema at codegen time) and **make drift observable and gated**
  (committed cache as build source + warn-only staleness check).
- **Means.** The workstreams below.

## Verified findings (evidence base — see the notes report)

All first-hand or independently-verified this session:

1. **Schema delta is purely additive** — 5 `programmes` endpoints + 5 schemas; all other
   changes description-only. Our cached `info.version` (`…-8eceb70…`) == upstream HEAD.
2. **Tools work live** — `get-subjects-programmes(english)`→200/15 slugs;
   `get-programmes(english-primary-year-1)`→200/full object; regenerated zod validates.
3. **Bulk export shape is unchanged** — upstream-source `schema.json`@HEAD is identical
   to our Jun-10 copy; programmes are not a bulk entity.
4. **Bulk types are template-authored** (`schema-templates*.ts`) — a schema-first
   violation; the templates are a strict subset of the authoritative `schema.json`.
5. **The staleness validator already exists** (`agent-tools/src/ci/ci-schema-drift-check.ts`),
   warn-only, CI-wired; defects: stale `OAK_API_KEY` docstring, full-content compare;
   gap: not in pre-push.
6. **UX gap** — the 5 tools are invisible in `get-curriculum-model`, which they mandate
   as a prerequisite; the `get-subjects-programmes` slug description (`y7`) contradicts
   the verified full-form slugs (`english-secondary-year-10-edexcel`).

## Decisions (owner-settled 2026-06-30)

- **D1 — staleness scope: LEAVE the full-content diff** (corrected 2026-07-01). The
  existing `ci-schema-drift-check` already diffs the entire spec (warn-only) and catches
  same-version content drift (e.g. the `asset→assets` typo upstream failed to version). The
  earlier "version-only" call was context-bound to reducing *build* work while deciding what
  to build; re-applied now that the fuller check exists, narrowing would be a destructive
  refactor (more work) that removes capability. So the check's behaviour is untouched.
- **D2 — programmes navigation: CO-EQUAL views.** Programme tools and sequence tools are
  co-equal, serving different use cases. WS4 adds the programme route as first-class
  **without demoting** sequences; the curriculum-model frames *when to use each*.
- **D3 — committed live smoke lane: YES.** Establish a committed, explicitly
  network-permitted live smoke lane (separate from the ADR-078 network-free e2e estate;
  `SMOKE_REMOTE_BASE_URL` already exists) so "the tools work" closes against a real-world
  signal continuously (§Agentic Quality), not just an ad-hoc script.

## Type-change discipline (owner directive, load-bearing)

Types at the SDK/codegen layer flow **outward** from the schema. The only correct place
to change them is the generator; `pnpm sdk-codegen && pnpm build` then aligns every
consumer (Cardinal Rule: "fix the generator, not the consumer"). **STOP tripwire:** if any
workstream produces type errors in a *consumer* (app/lib) that tempt a consumer-side type
edit, that is the signal a fundamental mistake was made in the generator design — **halt
and surface to the owner**, do not chase the types through the system. WS0 is the positive
proof (additive regen → zero consumer type errors across 45 projects). WS3 is the delicate
case (it widens the bulk subset types) and is gated on owner-confirmed derivation approach
before any build.

## Workstreams

> TDD cycle = one commit (failing test + product code + refactor). Tests never lead or
> lag product code. Quality gates per `components/quality-gates.md`; final aggregate is
> `pnpm check`. Foundation: `principles.md`, `testing-strategy.md`,
> `schema-first-execution.md`.

### WS0 — Ship the additive regen (independent, ready)

Additive, verified, low-risk; ships on its own PR ahead of the enhancements
(ship-independent-coordinate-dependent). Commit the regenerated SDK/MCP files by explicit
pathspec; open a draft PR to `main`; run the full gate.

- **Consumes:** the regenerated artefacts already in the worktree.
- **Acceptance:** `pnpm check` green; draft PR open; the 5 tools present in `tools/list`;
  live proof (already run) cited. **Proof level:** e2e/value-proxy (live invoke observed).
- **Prereq:** none (blocking: none).

### WS1 — Cached-schema default (codegen)

Invert `code-generation/codegen.ts` `loadSchema()` to read the committed cache by
default; online only via `--online` / `SDK_CODEGEN_MODE=online` / `isVercel`. Preserve
`writeSchemaCacheIfChanged` on the online path. Grep + Vercel-MCP-confirm before retiring
the `--ci`/`SDK_CODEGEN_MODE=ci` sentinel (dashboard build command is not greppable).

- **Cycles:** (A) cache read when no opt-in (mock fetch asserted NOT called); (B) each
  opt-in takes the fetch path and still writes the cache; (C) actionable throw when cache
  missing in default mode. Inject `fetch`/`readFile` as args (no global state).
- **Acceptance:** default run performs no network fetch and reads the cache; opt-ins
  fetch+refresh; `pnpm sdk-codegen && pnpm build` green. **Proof:** unit + integration.
- **Prereq:** none. Independent of WS2.

### WS2 — Wire the existing staleness validator into pre-push (+ docstring fix)

**Leave `agent-tools/src/ci/ci-schema-drift-check.ts`'s diff behaviour untouched** (D1
corrected: it already full-content-diffs, warn-only, CI-wired). Only two genuine changes,
both context-independent: (1) fix the factually-wrong `OAK_API_KEY` docstring line (the
script sends no auth header; the swagger endpoint returns 200 unauthenticated); (2) add a
non-blocking advisory step to `.husky/pre-push` invoking the existing check (CI already
runs it). Non-blocking placement: never inside the `if ! …; then exit 1` pattern — the
check already exits 0, and pre-push must never fail on it (offline/network-blip safe). No
logic change means no new unit test is required by this change; the pre-existing
zero-test-coverage of the validator is separate test-debt, noted not fixed here. Edits no
SDK types — type tripwire N/A.

- **Acceptance:** unit test green; pre-push runs it non-blocking (never fails the push,
  even offline). **Proof:** unit + a manual pre-push observation.
- **Prereq:** none. Ship before WS1 so staleness is observable before the default flips.

### WS3 — Bulk types schema-derived (the schema-first fix) — DESIGN-GATED on owner

This is the delicate type-layer change the owner flagged. The derivation **widens** the
current `.strict()` subset types into the `schema.json` superset, so it has SDK-level type
blast radius. **Approach (b) — compose — is owner-confirmed (2026-06-30):** reuse the
API-derived Zod (which already flows from OpenAPI via `zodgen-core`) where bulk shapes
match, and derive only the bulk-specific deltas (transcripts, `lessonSlug`, NULL-sentinel
handling, and the superset fields the API responses omit) from `schema.json`. Owner
direction: **plan the shape-correspondence ahead, take it a step at a time.** The
§Type-change-discipline STOP tripwire is live throughout.

- **WS3.0 — the composition design (plan ahead, no generator code yet).** Ground
  first-hand: `zodgen-core` (how API Zod is emitted from the OpenAPI doc and how it could
  be reused), the bulk `schema.json` `$defs`, and exactly what consumers import from
  `src/types/generated/bulk/` (the strict reader `reader.ts`, the search adapters/
  transformers, the ground-truth parser). Produce a **correspondence map**: for each bulk
  `$def` (unit, lesson, thread, …) name which API-derived schema it reuses verbatim, which
  it extends, and which fields are bulk-only deltas. This map is the step-at-a-time plan;
  review it (type-expert) before any generator code.
- **WS3.1 — dry-run blast-radius probe.** Build the generator behind the confirmed
  approach in isolation, regenerate `src/types/generated/bulk/`, run `pnpm build` +
  `type-check` and **observe** whether any consumer type-errors. **If consumers error →
  STOP and surface** (the derivation is mis-shaped or a genuine contract break the owner
  must adjudicate) — do not edit consumers to chase the types.
- **WS3.2 — land (only if 3.1 is clean).** Retire `schema-templates*.ts`; reconcile
  `bulkgen.ts`; commit `apps/oak-search-cli/bulk-downloads/{schema.json,manifest.json}`
  (owner un-ignored; not yet committed) so the canonical shape is version-controlled.
- **Beneficial prereq:** a fresh `pnpm bulk:download` (~0.67 GB, needs `OAK_API_KEY`) to
  confirm whether *data* now populates the superset fields. **Min shippable without it:**
  derive from the committed `schema.json` (authoritative shape) and validate against the
  existing on-disk dataset.
- **Acceptance:** approach owner-confirmed; `pnpm sdk-codegen` regenerates bulk types from
  `schema.json` with **zero consumer type edits**; no `schema-templates*.ts` remain;
  `bulkDownloadFileSchema.parse` succeeds over every real file. **Proof:** unit +
  integration (parse over real data). The derived schema is the single source the strict
  reader and the ground-truth parser both consume.

### WS4 — UX / discoverability

Hand-authored (safe to edit; no SDK types — type tripwire N/A): in `oak-curriculum-sdk`
`ontology-data.ts` add a **Programme** hierarchy level; `tool-guidance-data.ts` add a
**programmes tool category** and idFormat note; `tool-guidance-workflows.ts` add a
**byProgramme** workflow. Per **D2 (co-equal)**: present programme and sequence routes as
co-equal — **do not demote** the sequence-first guidance; instead frame *when to use each*
(programme = a single year-group's teacher-facing view; sequence = cross-programme /
structural traversal). Generated (fix at source): correct the `get-subjects-programmes`
slug description (`y7` → full-form `english-secondary-year-10-edexcel`) at the generator
(`code-generation/typegen/mcp-tools/parts/…`) or the upstream spec — never in the generated
file.

- **Acceptance:** `get-curriculum-model` names programmes as a co-equal entity, tool
  category, and workflow alongside sequences; the slug description matches verified
  reality. **Proof:** unit (guidance asserted by relationship, not literal) + a re-run
  live proof confirming slug shape.

### WS5 — Committed live smoke lane (D3: yes)

Build a committed, explicitly network-permitted live smoke lane (separate config from the
ADR-078 network-free e2e estate; gated on `SMOKE_REMOTE_BASE_URL`/`OAK_API_KEY` presence,
skipping cleanly when absent). It iterates representative operations — at minimum each new
or shape-changed one — via `executeToolCall` against the live API and asserts `ok` +
schema-valid data. This closes the alignment against a real-world signal (§Agentic
Quality) and makes "the tools work" continuously verifiable, superseding the ad-hoc proof
script. Network-permitted tests must be a distinct lane, never inside the network-free
`test:e2e` config.

- **Acceptance:** a `pnpm` smoke target runs the live lane; green against prod; skips
  cleanly without credentials. **Proof:** the lane is itself the value-proxy proof.

### WS6 — Graduate the runbook

Promote `.agent/reports/upstream-api-alignment-notes-2026-06-30.md` into a permanent
runbook ("aligning to an evolving upstream surface", PDR-120 runbook kind) once WS1–WS4
land, and run `/oak-consolidate-docs`.

## Non-goals (YAGNI)

- No escalation of the staleness check from warn to fail (separate later decision).
- No change to upstream `oak-openapi` beyond the generated-description source fix path.
- No new MCP transport/auth work (oauth2/domain-context is out of scope here).
- No bulk *content* re-indexing — this plan is shape/type alignment, not ingestion.

## Prerequisite classification

- WS0, WS1, WS2, WS4: no blocking prereqs (independent; WS2 before WS1 by preference).
- WS3: beneficial prereq = fresh bulk download; min-shippable derives from committed
  `schema.json`.
- WS6: blocked by WS1–WS4 landing.

## Risk assessment

| Risk | Mitigation |
| --- | --- |
| Cached-default ships a stale schema to Vercel | Keep `isVercel` on the online path. |
| Retiring `--ci` breaks a Vercel dashboard build command | Verify via Vercel MCP before removal; keep the path until confirmed. |
| Version-only staleness misses content drift | D1 verdict: report both signals. |
| Strict reader vs lenient parser disagree on bulk validity | WS3 makes the schema-derived Zod the single source both consume. |
| Bulk download partial/failed leaves a misleading dataset | WS3 validates over a complete fresh download; treat strict-parse throw as the trigger. |
| Live proof hits a non-prod URL from ambient env | Clear `OAK_API_URL` in the proof (done). |

## Foundation alignment

- `schema-first-execution.md` — WS3 is the canonical instance (bulk types from schema).
- `testing-strategy.md` — TDD cycle-pairs; tests prove behaviour; no global state.
- `principles.md` — derive-not-author; observable drift; First Question per workstream.

## Plan-body first-principles check

Fires before executing each workstream's tests/impl: (1) **shape** — confirm the cited
file/line still matches before editing (the SDK is regenerated; generated files are
DO-NOT-EDIT — fix at the generator); (2) **landing-path** — every workstream ends at a
commit with green gates and (WS0) a PR; (3) **vendor-literal** — re-confirm the upstream
swagger `info.version` and the bulk `schema.json` at execution time (both verified this
session at HEAD `8eceb70`); (4) **type-chasing tripwire** (§Type-change discipline) — any
consumer (app/lib) type error after a generator change is a STOP-and-surface signal, never
a consumer-side edit. Live for WS3 above all.

## Readiness reviewers

Before marking any workstream READY: `assumptions-expert` (proportionality/blocking),
`type-expert` + `config-expert` (WS1/WS3 codegen + turbo/env), `test-expert` (all TDD
cycles), `mcp-expert` + `docs-adr-expert`/`onboarding-expert` (WS4 guidance + WS6 runbook).

## Learning loop & lifecycle triggers

Per `components/lifecycle-triggers.md`: session-open grounding done; this plan is the
work-shape artefact; claim registered for the alignment area; each workstream closes with
a commit + the notes report updated; completion runs `/oak-consolidate-docs` and WS6
graduates the runbook. A `upstream-api-alignment` thread record should be created when WS1
execution starts (continuity home for the standing process).
