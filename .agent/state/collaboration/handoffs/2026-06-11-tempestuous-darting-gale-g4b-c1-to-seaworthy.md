# PDR-063 Mid-Cycle Handoff — G4b keyword graph tool (c1 at gate-pending boundary)

- **claim_id**: `718b1d24-5997-4658-a9d0-6ccd691ef7e6` (active-claims registry; stays OPEN, you adopt it)
- **From**: Tempestuous Darting Gale / claude / fable-5 / 6243de / id `1afc6047-6e4e-5713-88b4-f55812152e6e`
- **To**: Seaworthy Surfing Compass (e7dd0b) — owner-named G4b seat successor
- **Trigger**: owner-directed rotation (Director event ~07:47:34Z), NOT budget pressure; c1 is
  functionally complete and one gate-run away from its commit.
- **Authority**: the plan g4 todo (`graph-tools-value-redesign.plan.md`, coordination-home copy —
  the worktree copy on main is the OLD pre-reshape G4; never read it as authority). Director
  routing event `9ef9078a`; my readiness verdict synthesis event `a9a83862` (read it end to end —
  every reviewer adjudication and refuted finding is recorded there).

## 1. Current edit state

**Worktree**: `/Users/jim/code/oak/oak-wt-airy-g`, branch `feat/g4b-keyword-graph` off
`origin/main` (b3a482dc, contains #162). `pnpm install && pnpm build` done (provisioned, green).
**Nothing is committed on the branch** — ALL c1 work is working-tree state. All git ops `git -C`
(the cwd resets to the primary checkout between Bash calls — confirmed gotcha).

Working-tree inventory (all in `packages/sdks/oak-sdk-codegen/`):

- NEW `src/bulk/generators/graph-corpus-keyword-nodes.ts` — KeywordBuild builder (id-sorted lean
  nodes + lesson→keyword edgePairs; node frequency = `lessonSlugs.length`, NEVER the extractor's
  occurrence-counted `frequency`).
- NEW `src/bulk/generators/graph-corpus-keyword-nodes.unit.test.ts` — builder describes.
- NEW `src/bulk/extractors/keyword-extractor.unit.test.ts` — moved from vocab-gen + extended:
  displayTerm describes, order-independence describe, normaliseKeyword mint-contract golden
  vectors (lc+trim only), occurrence-vs-unique-lesson frequency describe.
- MODIFIED `src/bulk/extractors/keyword-extractor.ts` — canonical copy: `displayTerm` added
  (first-occurrence casing, trimmed); deterministic `(lessonSlug, unitSlug)` lesson ordering
  inside `extractKeywords` (cures readdir-order-dependent first-occurrence — definition AND
  displayTerm); honest frequency TSDoc (occurrences, can exceed unique-lesson count).
- DELETED `vocab-gen/extractors/keyword-extractor.ts` + its unit test (consolidation per my
  adjudication 2: canonical home is src/bulk — FORCED by tsconfig.build including only src/**;
  vocab-gen runs unbuilt via tsx and its lib/ already re-exports from src/bulk — precedented).
  `vocab-gen/extractors/index.ts` re-points to the src/bulk copy.
- MODIFIED `src/bulk/generators/graph-corpus-types.ts` — GraphCorpusKeywordNode(+Id), unions,
  'containsKeyword' edge type, counts interfaces, GraphCorpusInput.keywords, keywordNodeId mint
  (normalises internally, idempotent).
- MODIFIED `src/bulk/generators/graph-corpus-generator.ts` — buildLessonAnchoredEdges
  generalisation (replaces buildAddressesMisconceptionEdges; two consumers: misconception +
  keyword edge resolution, both drop-to-provenance), assembly + stats + re-exports + version
  '1.3.0' + seeAlso.
- MODIFIED all three emitted templates (`graph-corpus-emitted-{json-shape,index,types}-lines.ts`)
  — JsonKeywordNode, NODE_KINDS/EDGE_TYPES + 'keyword'/'containsKeyword', toNode case, export
  lists. The 8-location atomicity condition from the readiness review is SATISFIED — verify by
  reading the synthesis event's adjudication 1 against the diff.
- MODIFIED `src/graph-corpus.ts` (hand-authored barrel) — keyword types exported.
- MODIFIED `vocab-gen/vocab-gen.ts` — `keywords: result.extractedData.keywords` wired.
- MODIFIED test fixtures for the new required `displayTerm`:
  `analysis-report-generator.unit.test.ts`, `synonym-miner.unit.test.ts`,
  `vocabulary-graph-generator.unit.test.ts`, plus `keywords: []` in
  `graph-corpus-sequences.unit.test.ts` makeInput; `graph-corpus-generator.unit.test.ts` and
  `graph-corpus-stability-contract.unit.test.ts` extended with keyword fixtures/describes;
  `graph-corpus-emitted.integration.test.ts` count guards extended (keyword: 13452,
  containsKeyword: 43660, keyword id-sorted).
- REGENERATED (vocab-gen run twice): `src/generated/vocab/graph-corpus/{data.json,index.ts,types.ts}`,
  `vocabulary-graph/data.json`, `nc-coverage-graph/data.json`, `synonyms/definition-synonyms.ts`,
  `vocab-gen/reports/bulk-analysis-2026-06-11.md` (new dated report file — check whether prior
  PRs committed these reports or excluded them; follow precedent).

**Gate state**: workspace `type-check` GREEN; workspace `test` GREEN (92 files / 911 tests,
including all new describes and the pinned real-corpus guards). NOT yet run: `pnpm build`,
`lint`, `format:root`, full root gate chain — the commit has NOT been made. The pre-commit hook
runs the full gates; run build/lint:fix/format first to avoid hook churn.

**Emission verified first-hand against the regenerated artefact**: version 1.3.0; nodeKindCounts
keyword 13,452; edgeTypeCounts containsKeyword 43,660; droppedEdges 0; droppedDuplicates 0 —
all matching my independent jq recomputation from bulk (distinct normalised terms 13,452; unique
lesson|term pairs 43,660, separator-safe recount).

## 2. In-flight reasoning

- **The vocabulary-graph/synonyms diffs are the determinism cure landing, not damage**: equal
  insertions/deletions (53,974 each in vocabulary-graph); flips are first-occurrence definition
  selection moving from readdir-encounter order to lessonSlug order (sampled first-hand:
  'adjective', 'noun', 'theme' definitions flip between real bulk variants); subjectDistribution
  key order shifts for the same reason; nc-coverage is timestamp-only. These artefacts are now
  stable across regenerations by construction. Defend this classification in the PR body.
- **OPEN PROOF GAP (small, honest)**: I intended a double-regen convergence proof (second regen
  byte-identical modulo generatedAt) but my check diffed working-tree vs HEAD (wrong baseline) —
  it proves nothing. If you want the proof: copy data.json + vocabulary-graph aside, re-run
  vocab-gen, diff copies. Cheap, optional; the order-independence unit test carries the design
  proof regardless.
- A SECOND vocab-gen run's output is what currently sits in the tree (generatedAt ~07:48Z).
  Harmless — generatedAt is the only legitimately varying field.
- **Commit shape**: ONE atomic c1 commit (tests + product + templates + regenerated artefacts +
  consolidation deletions). Draft subject (validate via
  `pnpm agent-tools:check-commit-message`, 100-char header limit, commitlint):
  `feat(sdk-codegen): emit keyword nodes and containsKeyword edges into the graph corpus (G4b-c1)`.
  Trailer `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>` BEFORE first push (deny rule
  blocks amend-after-push).
- **My session task list** (not transferable; recreate): c1 commit → c2 view → c3 tool → ONE PR
  monitor-to-merge. c2/c3 specs live verbatim in the plan g4 todo + synthesis event.

## 3. Decisions made (cite, don't re-litigate — grounding in event a9a83862)

1. Extractor consolidation direction: src/bulk canonical; vocab-gen re-points (build boundary
   forces it; plan's "byte-identical" corrected — one import line differed).
2. Node `frequency` = unique-lesson count at the BUILDER; extractor semantics untouched (other
   consumers unaffected); extractor TSDoc honesty fix instead.
3. `displayTerm` added to ExtractedKeyword (additive); node `term` carries display casing; the
   normalised form lives only in the id.
4. Edge type name: `containsKeyword` (contains* family).
5. Corpus version 1.2.0 → 1.3.0 (additive kind; non-major through the alpha redesign).
6. Deterministic extraction ordering `(lessonSlug, unitSlug)` — the determinism contract applies
   to first-occurrence selection; stability-contract test extended with keywords.
7. z.string().min(1) (G3 family precedent) for c3 subject/keyStage — mcp-expert's z.enum
   recommendation REFUTED (api-schema coupling; type-expert concurred); guidance via .describe().
8. c2 view = projection-module pattern (misconception-projection precedent), NOT createGraphView
   — the plan's "per-view createGraphView" vocabulary reads as per-view construction; G2/G3
   merged precedent. keyword-projection.ts + keyword-view.ts in graph-corpus-sdk src/curriculum/
   (covered by existing ./curriculum subpath + tsup glob — verified, no build-config change).
9. c3 carries BOTH disambiguation halves in the same PR: new tool description + get-keywords
   codegen description-part update (tool-description.ts + correction test + regen).
10. c3 mechanical obligations: server.e2e.test.ts parity array; AGGREGATED_TOOL_ORDER landing-page
    entry for the new tool; all four annotation hints; 4-surface atomic registration.
11. ADR-086 count recompute rides the PR (recompute at amendment time, never copy).
12. Claim boundary corrected to the full surface set (claim 718b1d24 intent text carries it).

## 4. Decisions deferred (owner/executor at the named gate)

- **Tool name** — owner decides at the PR (candidates get-keyword-graph / explore-keywords).
- **Decoration depth + default-vs-on-demand fields** — c2/c3 design agency (the synthesis notes
  the view test must pin frequency-ranked ordering, anchor narrowing, top-N bound + default,
  well-formed empty BEFORE code).
- **limit param constants** — c3; follow the misconception unitLimit precedent
  (DEFAULT_/MAX_ constants exported from the view; empirical basis in .describe()).
- **eef-revalidation signal** — raise ONLY if the EEF path consumes the keyword surface.
- **Landing-page order backfill for older missing tools + emitted-template .includes widening** —
  NOT in this PR; routed to the Director's reliability micro-queue (already acknowledged).

Read the plan g4 todo end to end + synthesis event a9a83862 BEFORE any source edit. The comms
watcher standing ruling: portable polling loop only (four-shape pre-arm render test), absolute
--comms-dir paths, verify every write's success token AND destination.
