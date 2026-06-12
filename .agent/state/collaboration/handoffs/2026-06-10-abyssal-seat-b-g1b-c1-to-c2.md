---
from_agent: Abyssal Swimming Mast
from_session_prefix: "b14f60"
from_id: 576d41e1-30d3-5dea-84c5-8c9c10f1462b
to: Radiant Ascending Eclipse (Seat B / Track G c2 successor, owner-named 2026-06-10)
seat: B
lane: Track G — G1b (prior-knowledge bounded-anchored view + tool rewrite)
claim_id: 86548f2c-da00-49b9-865c-b5f460a32876
date: 2026-06-10
kind: cycle-boundary handoff (G1b c1 landed gate-green + reviewed; c2 not started)
---

# Handoff — Seat B / Track G: G1b c1 landed, c2 is next

Self-contained per `handoff-messages-self-contained.md`; you cannot read my transcript.

## 1. Current edit state (where things are)

- **G1b c1 is DONE and COMMITTED, NOT pushed.** Commit **`a79b2271`** on branch
  **`feat/g1b-prior-knowledge-view`** in worktree **`../oak-wt-airy-g`**
  (cut off `origin/main` `d56f846d`, which has #153 + S1 + S2 + U1 merged + release 1.19.0). Full
  worktree pre-commit gate GREEN at commit (turbo 97/97; major-version guard passed). G1b is ONE
  PR (c1 + c2), so c1 stays local until c2 lands — then push + open ONE PR. c1 is gate-green, not
  broken; this is the planned cycle split, not local-broken-code.
- **Worktree uncommitted state (do NOT commit — intentional, inherited from Airy):** the same 9
  incidental old-dataset metadata-regen files (misconception/nc-coverage/prior-knowledge/vocabulary
  `data.json`+`index.ts`, `synonyms/definition-synonyms.ts`, `thread-progression-data.ts`). Airy +
  Veiled deferred these to G2/G3. Stage by EXPLICIT pathspec only your c2 files; never `git add -A`.
- **My claim `86548f2c`** (eef thread) is RETAINED open with this record as its handoff pointer.
  Adopt the branch + worktree in place (never re-create over it). When you pick up: notify the team,
  confirm you are continuing claim 86548f2c, then proceed.

## 2. What c1 delivered (the view a successor MUST build on)

New file `packages/sdks/graph-corpus-sdk/src/curriculum/prior-knowledge-view.ts`:

- **`priorKnowledgeSubgraph(unitSlugs, depth = 2)`** → `Result<PriorKnowledgeSubgraph, SubgraphError>`.
  Bounded anchored PREDECESSOR retrieval over the one corpus. Returns
  `{ nodes, edges, resolvedAnchors, unknownAnchors, depth }`. Edges carry the TRUE `prerequisiteFor`
  orientation (prerequisite→dependent). Unknown slugs are reported in `unknownAnchors`, not errored.
  Anchors are de-duplicated. Empty / all-unknown anchor list → well-formed empty result. Depth
  beyond the ceiling (3) → `SubgraphDepthExceeded`. **This is the surface the c2 tool consumes.**
- **`createCurriculumPriorKnowledgeView(maxDepth = 3)`**, `DEFAULT_PREREQUISITE_DEPTH = 2`,
  `MAX_PREREQUISITE_DEPTH = 3`, types `PriorKnowledgeSubgraph` + `CurriculumPriorKnowledgeView`.
  Exported from the curriculum barrel `index.ts`.
- **THE DIRECTION FACT (load-bearing, owner/Director-ratified):** "prior knowledge of X" = X's
  PREDECESSORS. Corpus edges are prerequisite(source)→dependent(target) — confirmed first-hand in
  the generator (`graph-corpus-generator.ts` buildEdges: `from = units[i]` earlier-in-thread →
  `to = units[i+1]`). `createGraphView` is OUTGOING-only, so the view constructs over REVERSED
  edges and re-orients result edges back. Do NOT "simplify" this away.
- **Depth, re-measured in the predecessor direction** (Veiled's carried check; recorded in the view
  TSDoc): depth-1 median 2/p90 4/max 8; **depth-2 median 4/p90 9/max 21** (default); depth-3 median
  8/p90 18/max 42 (ceiling, ≤2.6% of corpus). Use THESE numbers in the c2 tool description, not the
  plan's forward-direction figures.
- **Forward-only factory retired:** Airy's `createCurriculumPrerequisiteGraph` is gone (option (a),
  Veiled-confirmed); `graph-corpus.ts` is now corpus data+types re-export only; Airy's
  `graph-corpus.integration.test.ts` repointed to `createCurriculumPriorKnowledgeView`.
- **Reviews (all first-hand):** code-expert APPROVED (direction round-trip traced correct);
  type-expert SOUND; test-expert findings adjudicated (conditional-narrowing REFUTED as the
  repo-canonical GraphView test convention — eef-graph.unit.test.ts / create-graph-view.unit.test.ts;
  fixture-complexity simplification APPLIED; ceiling-completeness APPLIED).

## 3. Decisions made (who + when)

- **Direction = predecessors / reversed-edge construction + result re-orientation; predecessors-only
  (no direction param — unauthorised scope otherwise).** Finding routed to Veiled, ACCEPTED
  (event 89dabefd, 2026-06-10T14:43Z).
- **Fork RULING option (a): one direction-aware construction path; retire the forward-only factory
  in THIS PR; repoint Airy's test.** Veiled (same event).
- **Depth re-measured in predecessor direction; default 2 holds; record re-measured numbers**
  (Veiled's carried check). Done in the view TSDoc.
- **eef-revalidation signal fires at G1b, not at #153** (Veiled, event 741ee58b) — it is c2's to raise.

## 4. Decisions deferred (your c2 options)

- **Module-load singleton vs per-call construction in the TOOL:** the view singleton already exists
  (`priorKnowledgeView` constructed once at module load). The tool just calls
  `priorKnowledgeSubgraph(...)`. No further singleton decision needed.
- **Tool error shape for `SubgraphDepthExceeded` / how to present `unknownAnchors`:** c2's call —
  shape the MCP envelope (isError vs a structured note). Keep it information, never a recommendation
  (ADR-194).

## NEXT SAFE ACTION (c2) — the plan's G1b row, second cycle

Per the plan `§Cycles` G1b c2 + the g1-prior-knowledge-view todo. On branch
`feat/g1b-prior-knowledge-view` (continue it; do NOT re-cut):

1. **Rewrite the tool** `packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-prior-knowledge-graph.ts`:
   anchor input `unitSlug[]` + optional `depth`; call `priorKnowledgeSubgraph` from
   `@oaknational/graph-corpus-sdk/curriculum`; return the bounded subgraph in `structuredContent`
   AND keep `TextContent` alongside (MCP spec SHOULD). No whole-corpus path remains. (The current
   tool is a whole-corpus dump via `graph-resource-factory` + `PRIOR_KNOWLEDGE_GRAPH_CONFIG`.)
2. **REMOVE the resource** `curriculum://prior-knowledge-graph`: delete `prior-knowledge-graph-resource.ts`,
   remove its catalogue entry in `all-resources.ts`, update the registration drift-guard in the SAME
   PR (`all-resources.unit.test.ts` / `prior-knowledge-graph-resource.unit.test.ts`). A11y/A5 invariant:
   `curriculum://model` + `eef://interpretation` stay untouched + drift-guard green.
3. **REMOVE the orphaned old dataset** `oak-sdk-codegen/src/generated/vocab/prior-knowledge-graph/`
   (`data.json` + `types.ts` + `index.ts`) AND its re-export in `generated/vocab/index.ts` + the
   `vocab`/`vocab-data` barrels. (Acceptance #2: G1 deletes `prior-knowledge-graph/types.ts`.) Note
   the live `priorKnowledgeGraph` consumers shift to the view — verify nothing else imports the old
   dataset before deleting (grep `priorKnowledgeGraph`).
4. **ANCHOR-THREADING prompt rewrites** in `mcp-prompt-messages.ts` (NOT reference swaps):
   `adapt-lesson` step 2 prior-knowledge clause ONLY (the misconception clause keeps the whole-corpus
   tool until G2 — `adapt-lesson` step 2 names BOTH tools in one sentence; repoint only the
   prior-knowledge half) + `learning-progression` step 3 — each step resolves the anchor `unitSlug`
   from the preceding search/fetch step and passes it to the anchored tool. Each partial edit
   correct-at-that-commit.
5. **Raise the eef-revalidation signal** (Veiled: the bounded tool is the value change).
6. **Removed-URI assertions expect `-32602`** (InvalidParams) per plan §Protocol notes (SDK 1.29.0;
   the spec's -32002 is an unimplemented SHOULD). Confirm first-hand when authoring.
7. Tests: unit (anchored `structuredContent` envelope + resource absence + repointed prompt clauses)
   - integration + e2e (`tools/call` with anchor; `resources/list` without the removed resource).
   Full gate chain green at the commit. Then push + open ONE G1b PR off this branch.
8. Re-verify pinned facts at execution start (held for c1: 1,612 nodes / 3,452 edges / 0 dangling /
   sourceVersion 2026-05-21).

## Coordination

- Director: Veiled Listening Secret (7c8e8e). Coordination home = primary checkout
  `the repo root`; point all comms/claims CLIs there by absolute
  path. Director serialises merges + monitors PRs.
- Team also live: Iridescent Glowing Sun (Seat A / S3 + G4 design, owner-rerouted forward);
  Luminous Scattering Dawn (agent-tools comms-watch hang hardening — disjoint).
- **Tooling caution:** the `comms watch` CLI silently stalls (hang-but-run); I run a PORTABLE
  poll-shape watcher instead and cross-check seen-file-count vs comms-dir-count at cycle boundaries.
  Luminous is hardening the CLI (failure-mode event 26c8b7e9).
