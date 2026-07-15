# Plan: Graph-corpus data-blob storage + Git LFS evaluation

**Status**: Future — **HIGH PRIORITY** (owner-flagged 2026-07-06, Cricket lifts Echo
session). Dedicated session; analysis + decision only, execution follows the decision.

**Owning collection**: architecture-and-infrastructure

**Related** (the architectural-boundary half of this problem already has homes —
this plan is the storage/mechanics half, not a duplicate):

- [`monorepo-workspace-topology-adr-and-canonical-plan.plan.md`](./monorepo-workspace-topology-adr-and-canonical-plan.plan.md)
  — the S0–S6 pipeline-stage separation (schema-fetch / type-gen / data-fetch /
  runtime-codegen / consumption). The "unclear boundary" the owner named lives here.
- [`oak-surface-isolation-and-generic-foundation-programme.plan.md`](./oak-surface-isolation-and-generic-foundation-programme.plan.md)
  — separating Oak-specific leaves (the corpus data) from generic foundations.
- [`../codegen/future/sdk-codegen-workspace-decomposition.md`](../codegen/future/sdk-codegen-workspace-decomposition.md)
  — the strategic split of the mixed OpenAPI/codegen and **bulk-data lineages**; the
  data-fetch/snapshot concern that owns this blob belongs to that decomposition.
- [ADR-001](../../../../docs/architecture/architectural-decisions/001-esm-only-package.md)
  (ESM-only, no CJS) and
  [ADR-086](../../../../docs/architecture/architectural-decisions/086-vocab-gen-graph-export-pattern.md)
  (vocab-gen graph-export pattern) — the constraints any storage change must hold.
- PR #306 (`fix/gitleaks-pre-push-scope`) — the **already-shipped** mitigation that
  removed the day-to-day *symptom* (pre-push secret-scan now scans only pushed
  commits, not full history). This plan addresses the *root*, which #306 does not.

## Context / Problem

`packages/sdks/oak-sdk-codegen/src/generated/vocab/graph-corpus/data.json` is a
**26 MB generated knowledge-graph snapshot** (40,016 nodes / 74,724 edges), emitted
by the `vocab-gen` pipeline. It is a **legitimate cross-workspace runtime asset**,
not a build intermediate — it is loaded at runtime and consumed by:

- `graph-corpus-sdk` (all bounded query views: misconception / keyword /
  prior-knowledge / thread-progression)
- `oak-curriculum-sdk` (surfacing layer; imports the raw corpus directly too)
- `apps/oak-curriculum-mcp-streamable-http` (e2e, and the product surface transitively)

It is **committed** (not gitignored-and-regenerated) because generation is
network-bound (`vocab-gen` fetches live Oak curriculum data); committing the snapshot
is what makes consumer builds offline, deterministic, and reproducible. That
rationale is sound and is **not** in question.

**The problem is storage, not existence.** Stored as a monolithic minified JSON,
regenerated wholesale and re-committed each `vocab-gen` run: **7 versions ≈ 116 MB**
of blob content for this one file in history, and git cannot delta-compress large
minified JSON, so each regen adds a near-full new blob. Siblings share the pattern
at smaller scale (`vocabulary-graph` 3.4 MB, `nc-coverage-graph` 2.3 MB). This is
permanent, unbounded, monotonic history growth. It is what made full-history secret
scans slow (see #306's commit message) and inflates every clone/fetch.

## Measured facts (as of 2026-07-06)

| Fact | Value |
|---|---|
| Current `graph-corpus/data.json` size | 25.7 MB raw |
| Gzip size | 3.8 MB (**85% smaller**) |
| Versions in history (this file) | 7 |
| History weight (this file alone) | ~116 MB |
| Loader mechanism | `createRequire(import.meta.url)` + `require('./data.json')` in `src/generated/vocab/graph-corpus/index.ts` — **CJS, contra ADR-001** |
| Ship mechanism | `code-generation/copy-json-assets.ts` copies `data.json` → `dist/` at build |
| Package | `@oaknational/sdk-codegen`, `private: true` (workspace-internal, not npm-published) |

## Options to evaluate (do NOT pre-decide — the session weighs them)

1. **gzip the committed asset** — 26 MB → 3.8 MB per version; ~7× slower history
   growth; single-point loader change; transparent to all consumers. Cost: blob
   stops being human-diffable (acceptable for a generated file no one diffs).
2. **Git LFS** — move the blob out of the main pack. Owner explicitly wants this
   option examined. Weigh: LFS tooling/CI dependency, clone behaviour, GitHub LFS
   quota/billing, whether Vercel/consumers pull LFS objects at build.
3. **Boundary separation** (the architecturally-clean answer) — a dedicated
   versioned data artifact the monorepo references by version, not by committing the
   blob. This is the S0–S6 topology work; **do not re-plan it here** — link to it.
4. **History surgery** (`git filter-repo`) to reclaim the existing ~116 MB — separate,
   disruptive (rewrites every SHA), coordinate-only. Justified only if clone/fetch
   size is actually hurting people; #306 already removed the main day-to-day pain.

Options 1 and 2 are go-forward storage choices (possibly combined); 3 is the
long-term architecture; 4 is one-time cleanup. They are not mutually exclusive.

## Hard constraints (owner directive, 2026-07-06)

- **All source is TypeScript; JS is compiled-from-TS only; ESM only, no CJS.** The
  current loader uses `createRequire` + `require('./data.json')` — CJS, contra
  ADR-001. **Any storage change MUST also migrate the loader to ESM** (e.g.
  `import data from './data.json' with { type: 'json' }`, or an ESM `fs` read +
  gunzip if gzip is chosen). This is a required subtask, not optional cleanup.
- Do not break offline/deterministic consumer builds — the reason the snapshot is
  committed in the first place.

## Scope boundary for the dedicated session

In: evaluate options 1–4 (Git LFS included), decide, record the decision (ADR), fix
the CJS→ESM loader. Out: the full S0–S6 boundary re-architecture (its own plan);
execution beyond the chosen storage change.
