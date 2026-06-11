---
from_agent: Airy Wheeling Gale
from_session_prefix: "597439"
from_id: 91aa593c-263b-50b5-97b3-b7216729a720
to: next Seat B (Track G) implementer
seat: B
lane: Track G (G1a → G1b)
claim_id: 57a83f00-0c6f-4812-be85-bca154e0fc9b
date: 2026-06-10
kind: mid-cycle-handoff (natural-boundary variant — G1a landed; G1b not started)
---

# Handoff — Seat B / Track G: G1a landed, G1b is next

Self-contained per `handoff-messages-self-contained.md`; you cannot read my transcript.

## 1. Current edit state (where things are)

- **G1a is DONE and SHIPPED.** PR **#153** (`feat/g1a-graph-corpus-foundation`), commit
  **`177df9b6`**, pushed to origin. Full gate GREEN at commit (turbo 97/97 across 24 packages)
  and at push (103/103 incl. test:ui). Director (Veiled, 7c8e8e) owns PR #153 monitoring +
  merge from here — I retired at the PDR-063 post-commit trigger.
- **Worktree**: `/Users/jim/code/oak/oak-wt-airy-g`, branch `feat/g1a-graph-corpus-foundation`
  (= commit 177df9b6). Leave it in place (do not delete / git-clean — operator/successor reuse).
- **Uncommitted state in that worktree (do NOT commit — intentional)**:
  - 9 incidental old-dataset metadata-regen files (misconception/nc-coverage/prior-knowledge/
    vocabulary `data.json`+`index.ts`, `synonyms/definition-synonyms.ts`,
    `thread-progression-data.ts`) — timestamp/comment drift only; resync deferred to G2/G3.
  - `apps/oak-search-cli/bulk-downloads/*.json` are symlinks I added to the primary checkout's
    bulk (gitignored) so vocab-gen could run in the worktree. Harmless; reuse or remove.
  - `format:root` (run during the commit fix) may have reformatted the worktree copy of
    `.agent/memory/active/napkin.md` and other unstaged files — all unstaged, not in #153.
- **G1a PR is a PURE DIFF** (19 files: graph-corpus generator+test+write-file, wiring, the
  emitted `graph-corpus/` dataset, `./graph-corpus` barrel, graph-corpus-sdk adapter+integration
  test, both package.jsons, pnpm-lock, ADR-086 amendment). No `.agent/state|memory` rides it.

## 2. In-flight reasoning (what G1a delivered + the design a successor MUST respect)

G1a = the one-graph corpus FOUNDATION (Decision A). What landed:

- **Emitted `graph-corpus` dataset** (`packages/sdks/oak-sdk-codegen/src/generated/vocab/graph-corpus/`):
  **1,612 unit nodes / 3,452 prerequisiteFor edges / 0 dangling / 0 dropped**, sourceVersion
  2026-05-21. Generator: `src/bulk/generators/graph-corpus-generator.ts`; descriptor+loader:
  `write-json-graph-corpus-file.ts`; wired in `vocab-gen/vocab-gen.ts` `generateOutputFiles`.
- **Identity model (respect exactly)**: node id = `unit:<unitSlug>`, a materialised explicit
  `id` field; `GraphCorpusNodeId` is the template-literal type over `unit:` + string. The
  `createGraphView` `nodeId` extractor returns `node.id`, never a bare slug.
- **Integrity resolution (the per-endpoint choice)**: node set = (prior-knowledge units) ∪
  (thread units); both carry full metadata. Edges come from thread ordering, so every endpoint
  is a thread unit → becomes a node → ZERO dangling by construction. The defensive drop path
  (`droppedEdges` provenance) exists but is empty in practice. Self-loops are PRESERVED + counted
  (`stats.selfLoops`) as an upstream data-quality signal; the bounded BFS is visited-set-safe.
- **Edge shape** = graph-core `GraphEdge` (`{ source, type: 'prerequisiteFor', target }`) with id
  endpoints — so the corpus flows into `createGraphView` with no remap.
- **Types single-sourced** in the generator (Decision A): the emitted `graph-corpus/types.ts`
  RE-EXPORTS the generator's interfaces (no hand-maintained parallel). The `vocab` types barrel +
  `vocab-data` value barrel + `generated/vocab/index.ts` (hand-maintained) all carry graph-corpus.
- **`./graph-corpus` subpath** (`@oaknational/sdk-codegen/graph-corpus`, barrel `src/graph-corpus.ts`)
  re-exports value + types. **graph-corpus-sdk adapter** (`@oaknational/graph-corpus-sdk/curriculum`,
  `src/curriculum/graph-corpus.ts`) provides `createCurriculumPrerequisiteGraph(maxDepth)` — the
  construction bridge. View SEMANTICS (depth default, anchored retrieval, singleton) are G1b's.
- **ADR-086 amended** in the same commit: §2 explicit-interface-types-first → computed-from-data;
  §4 freeze cleared; §3 misconception=live + prerequisite→prior-knowledge naming; counts recomputed.

## 3. Decisions made (who + when)

- **Owner (chat) + Veiled (event 22c9c487)**: Airy → Seat B / Track G; first-broadcast honoured.
- **Stale-corpus fork → option (a) quantify-first**: owner (chat) + Veiled. Drift diagnostic ran
  → DISSOLVED: the 2026-05-21 re-mine is content-identical to the committed 2026-03-07 corpus
  (metadata/timestamp drift only; pinned facts hold exactly). **Do NOT re-open this.** Veiled
  released the G1a hold at event **8b036207**. (My finding + drift-results are behaviour-note
  comms events by Airy/597439 on 2026-06-10 if you need the detail.)
- **G1a is ADDITIVE; old prior-knowledge-graph removal deferred to G1b** (my intra-lane call —
  the G1a/G1b split is plan-delegated "split-permitted at size"). Rationale: deleting
  `prior-knowledge-graph/types.ts` in G1a breaks the still-live `get-prior-knowledge-graph` tool
  → violates correct-at-every-commit. Veiled aware (comms). So **the plan todo "G1a deletes
  prior-knowledge types.ts" is satisfied at the G1 level, executed in the G1b sub-PR.**
- **Incidental vocab-dataset resync deferred to G2/G3** (Veiled ruling) — not in #153.

## 4. Decisions deferred (your options)

- **G2/G3 own the metadata resync** — when G2 (misconception) / G3 (thread) re-run vocab-gen,
  the old datasets refresh to 2026-05-21 naturally. No standalone resync PR needed.
- **graph-corpus view singleton vs factory**: G1a ships a factory
  (`createCurriculumPrerequisiteGraph(maxDepth)`). G1b decides whether to construct a module-load
  singleton (EEF `eef-graph.ts` precedent) with a recorded startup-cost check, and the depth
  ceiling. My view: a singleton at module load is fine (1,612 nodes index in sub-ms).

## NEXT SAFE ACTION (G1b) + preconditions

- **HARD GATE**: G1b starts only after **S1 AND S2 are merged**. S1 (#152) is MERGED; **S2 is
  NOT yet open** (Riverine closed Seat A after S1; S2 + U1 are the next Seat A work). So G1b is
  now **S2-gated** (and ideally G1a #153 merged too, so you build on the corpus).
- When unblocked: pull `main`, cut `feat/g1b-...` off `origin/main` (flat, never stacked),
  `pnpm install && pnpm build` once. Then per the plan's `g1-prior-knowledge-view` todo + the
  G1b row of §Cycles:
  1. prior-knowledge VIEW in graph-corpus-sdk (per-view createGraphView over the corpus; depth
     default **2**, caller-adjustable; empirical basis depth-2 median 5 / p90 9 / max 18 nodes).
  2. rewrite `get-prior-knowledge-graph` (anchor `unitSlug[]` + depth; well-formed empty result;
     keep TextContent alongside structuredContent per the MCP SHOULD).
  3. **REMOVE** `curriculum://prior-knowledge-graph` (catalogue + drift-guard in the same PR) AND
     remove the now-orphaned old `prior-knowledge-graph` dataset (data.json/types.ts/index.ts).
  4. **Prompt repoints are ANCHOR-THREADING REWRITES, not reference swaps** — rewrite the
     prior-knowledge clause of `adapt-lesson` step 2 AND `learning-progression` step 3 so the step
     resolves the anchor from the preceding search/fetch step (the misconception clause keeps
     instructing the whole-corpus tool until G2). Each partial edit correct-at-that-commit.
  5. raise the eef-revalidation signal.
- **Removed-URI behaviour**: assertions for removed `curriculum://` resources expect JSON-RPC
  **`-32602`** per the CORRECTED plan §Protocol notes (Riverine's mcp-expert finding; the plan,
  not the agent, is the citation). Confirm first-hand. (Note: the plan body §Protocol notes earlier
  said -32002 for `resources/read` on a removed URI — adjudicate which applies to your assertion;
  Riverine flagged -32602. Read Riverine's events + the plan §Protocol notes before asserting.)
- Re-verify pinned data facts at execution start (they held for G1a; re-confirm for your slice).

## Emission ownership (what G1a emitted vs what G2/G3/G4 emit)

| Node kind / edge type | Emitted by |
| --- | --- |
| `unit` nodes; `unit→unit prerequisiteFor` edges | **G1 (LANDED in #153)** |
| `thread`, `lesson`, `misconception` nodes; unit→thread, unit↔lesson, lesson→misconception edges | G2 |
| thread→unit ordering data | G3 |
| `keyword` nodes; lesson→keyword edges (bulk branch only) | G4 |

Decision A forbids re-emitting shared entities: G2/G3/G4 ADD to the same `graph-corpus` identity
space; they do not re-emit `unit` nodes.

## LESSONS (consolidate into napkin / thread record — Director-owned)

- **Execution-start re-verification is where plan-vs-reality drift surfaces.** "Re-verify pinned
  facts" done honestly found the committed vocab corpus was 2.5mo stale AND that vocab-gen
  (separate from sdk-codegen, ungated by CI) re-baselines ALL datasets in one pass. The plan's
  "pinned to the 2026-05-21 snapshot" framing hid that the numbers came from the committed
  2026-03-07 emission. Cure that worked: option (a) quantify-first (disposable vocab-gen run) →
  proved content-identical → fork dissolved cheaply. When blast radius is unknown, measure before
  choosing.
- **Explore-agent output is input-to-verify, by half.** Its TYPE facts (ThreadUnit carries full
  metadata; ExtractedData shape) were correct and load-bearing. Its DESIGN suggestions were
  hallucinated (proposed NLP/regex requirement-text edge-parsing; the real generator builds edges
  from thread ordering). Reading the actual generator first-hand caught it. Sibling of
  validate-specialist-findings.
- **correct-at-every-commit can force a literal-todo deviation — surface it, don't silently
  follow.** "G1a deletes prior-knowledge types.ts" would break the still-live tool; the dependency
  chain (read first-hand) forced additive-G1a + deferral to G1b. The plan todo holds at the G1
  level. Intra-lane sequencing within a delegated split is the implementer's call.
- **Lint is real design feedback, not friction.** First generator draft tripped max-lines (306>250)
  - cognitive-complexity on buildEdges. Cure: split iteration (threadOrderingPairs) from resolution
  (buildEdges) + trim over-verbose TSDoc. Behaviour-identical, so no re-emission needed.
- **The pre-commit hook runs the FULL turbo gate per worktree** (build/type-check/lint/test × 24
  pkgs, + major-version guard), not just lint-staged. prettier-staged fires first as a fast fail;
  `pnpm format:root` + re-stage (explicit pathspec) + re-commit clears it. A worktree commit is
  thoroughly gated — "successful push proves gates green" holds here.

---

## DIRECTOR ADDENDUM (Veiled Listening Secret, 7c8e8e — post-closeout, 2026-06-10T13:40Z)

Written after Airy retired; the sections above are Airy's frozen record, this section is mine.

**PR #153 merge is HELD on two Copilot findings I verified first-hand as REAL** (adjudication
replies 3388690597 + 3388690770 on the PR). **Fixing them is the Seat B successor's FIRST task,
before G1b and independent of the S2 gate:**

1. **BLOCKING — `./curriculum` export ships no runtime.** `graph-corpus-sdk/tsup.config.ts` entry
   globs cover `src/*.ts` + `src/eef-strands/**/*.ts` only; `dist/curriculum/` holds `.d.ts`
   files but NO `.js`. The package.json `./curriculum` default condition points at the
   nonexistent `./dist/curriculum/index.js`. Gates stayed green because the monorepo
   `development` condition resolves to `src/` — verify the fix against the `default` condition
   (e.g. a packed/dist-level check), not just `pnpm test`. Fix: add `src/curriculum/**/*.ts` to
   the entry globs (mind the test-file exclusions).
2. **REAL — eager-loading barrel.** `oak-sdk-codegen/src/graph-corpus.ts` re-exports from
   `./generated/vocab/index.js` (the aggregate), so consumers load every legacy dataset's
   `data.json` to reach `graphCorpus`. Fix: re-export value + types from the graph-corpus
   generated module directly, preserving the single-subpath import surface.

Both fixes are small, land on `feat/g1a-graph-corpus-foundation` as one commit, full gates, push;
I re-verify and merge. The G1b §NEXT SAFE ACTION above is unchanged and remains S2-gated.
