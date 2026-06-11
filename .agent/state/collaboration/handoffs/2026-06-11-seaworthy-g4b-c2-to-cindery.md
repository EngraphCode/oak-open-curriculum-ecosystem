# PDR-063 Mid-Cycle Handoff — G4b at the c2→c3 boundary (clean tree)

- **claim_id**: `15bc9b5d-e155-4619-a74a-42258b15380f` (continues the 718b1d24 lineage; `handoff_record_path` set on this claim)
- **From**: Seaworthy Surfing Compass / claude / fable-5 / e7dd0b / id `715311cf-8d6f-578e-804a-3263af12facd`
- **To**: Cindery Forging Volcano (378172) — owner-named successor ("eventual successor", owner chat ~08:45Z; you stood by at this boundary per my directed `d7de9594`, your standby heartbeats from 08:56:04Z)
- **Trigger**: PDR-063 post-commit budget re-evaluation at the c2 commit — c3 is the deliverable's largest cycle and my remaining budget does not cover it with margin; rotation at a clean committed boundary beats a forced freeze mid-c3.
- **Authority**: plan g4 todo (coordination-home copy — the worktree copy on main is the OLD pre-reshape G4); readiness synthesis event `a9a83862` (all adjudications; you have read it); Tempestuous's record `2026-06-11-tempestuous-darting-gale-g4b-c1-to-seaworthy.md` (you have read it).

## 1. Current edit state

**Worktree**: `/Users/jim/code/oak/oak-wt-airy-g`, branch `feat/g4b-keyword-graph` off `b3a482dc`
(origin/main has since advanced ~4 commits: #166 agent-tools loud-writes + releases — no overlap
with this branch's surfaces; verified first-hand). **Working tree CLEAN.** Three commits, each
full-gate green at landing (the pre-commit hook runs the whole chain):

- `73aaedca0` — c1 emission (keyword nodes + containsKeyword edges, corpus v1.3.0: 13,452
  keyword nodes / 43,660 edges / 0 dropped; extractor consolidation; emitted-template chain;
  misconception-projection keyword-skip; integration-test extension; max-lines cures along
  stated seams: buildLessonAnchoredEdges → graph-corpus-edges.ts, G4b generator describes →
  graph-corpus-generator-keywords.unit.test.ts).
- `6560cc810` — c1 code-expert absorption (count-guard provenance now names G2 + G4b sources;
  version test asserts semver shape, not the constant).
- `451a9a658` — c2 keyword view: `keyword-projection.ts` (lesson/unit/keyword indexes +
  lesson→keyword and unit→lesson adjacencies, exhaustiveness anchor on kind dispatch),
  `keyword-view.ts` (`keywordsForSubjectKeyStage(subject, keyStage, {unitSlugs?, lessonSlugs?,
  limit?})` → `Result<KeywordSubgraph, KeywordLimitInvalid>`), `anchor-resolution.ts` (shared
  resolver extracted; misconception-view now imports it — its private copy deleted),
  `keyword-view.integration.test.ts` (11 describes over the REAL corpus with independent
  reference adjacency), curriculum barrel exports.

NOTHING is pushed. No PR exists. All git ops `git -C` (cwd resets between Bash calls).

## 2. In-flight reasoning

- **c2 design decisions you inherit** (all pinned by the integration test, so the contract is
  executable): ranking = in-scope placement count (`scopedLessonCount`) desc, keyword id asc
  tie-break — NOT the node's global `frequency` (a keyword frequent in another key stage must
  not outrank locally relevant vocabulary; the global figure stays on the node for c3 to
  surface); `DEFAULT_KEYWORD_LIMIT 25` / `MAX_KEYWORD_LIMIT 100` /
  `KEYWORD_LESSON_DECORATION_LIMIT 10` (constants exported from the view per the misconception
  unitLimit precedent — c3's `.describe()` strings should carry them); empty narrowing list ≡
  absent; unknown subject/keyStage → well-formed empty (anchors are attribute filters, not node
  ids — there is no unknownAnchors report for subject/keyStage, only for unit/lesson slugs).
- **c2 was NOT specialist-reviewed** (c1 was — verdict absorbed at `6560cc810`). Dispatch
  code-expert + test-expert over `6560cc810..451a9a658` (or fold into the c3 PR review wave);
  the review-at-every-stage discipline expects it before the PR settles.
- **Write-tool control-byte hazard is live** (my failure-mode event `b84fae38`): a file-Write
  intending the `backslash-u001f` ESCAPE can emit a LITERAL 0x1F byte — invisible in grep/diff and it
  breaks exact-match Edit. `od -c` is the tiebreaker; `perl -pe 's/\x1f/.../'` the cure. Check
  any file where you intend a control-char escape.
- **The piped-exit gotcha bites command chains**: `cmd | tail -N && next` runs `next` even when
  `cmd` failed. Check gate exits individually (distilled.md carries the doctrine).
- **PR #167 (Sylvan's EDGE_TYPES predicate) may merge before your PR** — it touches
  `graph-corpus-emitted-index-lines.ts`, which c1 also modified (different hunks; flagged to the
  Director in my broadcast `8679c43a`). At PR time, rebase or merge-resolve consciously and
  re-run sdk-codegen if the template merged differently.

## 3. Decisions made (cite, don't re-litigate)

1. Everything in the Tempestuous record §3 stands (12 items; grounding event `a9a83862`).
2. c1 review verdict: APPROVED WITH SUGGESTIONS; two findings applied (`6560cc810`), two
   declined with grounds — (a) extractor `keyStageToFirstYear` silent `?? 1` fallback is
   pre-existing shared-consumer code → record on the PR + Director reliability queue, do NOT
   widen this PR; (b) defensive dedup assertion in `buildKeywordNodes` duplicates the
   extractor-tested contract already guarded by recomputing corpus count tests → declined,
   record on the PR.
3. anchor-resolution extraction: consolidating at the second consumer was deliberate — the
   copies were byte-identical, the keyword view file was over max-lines, and the duplication was
   the honest cure target (not a limit raise).
4. The vocab-gen reports directory is gitignored (`**/reports/`) — the dated bulk-analysis file
   never enters the diff.

## 4. Decisions deferred (owner/executor at the named gate)

- **Tool name** — owner decides at the PR (candidates get-keyword-graph / explore-keywords).
- **c3 design agency**: structuredContent envelope shape (view result is designed to map nearly
  1:1); which keyword node fields surface by default (global `frequency` + firstYear coarseness
  statement belong in the description per synthesis adjudication 5); snapshot semantics sentence
  in the description; z.string().min(1) anchors per adjudication 7 (z.enum REFUTED — do not
  re-open).
- **c3 mechanical obligations** (synthesis adjudications 8–10): BOTH disambiguation halves in
  the same PR (new tool description + get-keywords codegen description-part correction via
  tool-description.ts + correction test + regen); server.e2e.test.ts parity array;
  AGGREGATED_TOOL_ORDER entry; all four annotation hints; 4-surface atomic registration
  (AggregatedToolName union, AGGREGATED_TOOL_DEFS, AGGREGATED_HANDLERS, module).
- **ADR-086 count recompute** rides the PR (recompute, never copy).
- **eef-revalidation signal** — only if the EEF path consumes the keyword surface.
- **ONE PR** for the whole G4b branch (three commits + your c3), Director-serialised merge;
  monitor-to-merge with first-hand adjudication of every bot/reviewer comment. Note the
  Director seat is itself rotating (Ethereal f92636 → Sunlit Waxing Asteroid 14a56a, "incoming
  sixth holder" heartbeats) — confirm the live Director before merge sequencing.
- **Predecessor claim closures**: 718b1d24 (Tempestuous) and 15bc9b5d (mine, closes at my
  closeout citing this record) — disposition rests with the Director per your team-start ask.
