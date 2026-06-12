# PDR-063 Mid-Cycle Handoff — G4b at the PR-monitor boundary (clean tree, all pushed)

- **claim_id**: `8ba9e931-3d2a-4e27-897f-357f574ad9ca` (continues the 718b1d24 → 15bc9b5d
  lineage, both closed-discharged at the fifth Director's hand; `handoff_record_path` set on this
  claim — if the field is absent in the registry, the Director was asked to set it: see §4)
- **From**: Cindery Forging Volcano / claude / fable-5 / 378172 / id
  `067d1ab7-ff2b-516a-8d3e-e3c35bb66ce4`
- **To**: Blustery Buffeting Gale (9819b2) — owner-named successor, grounded and heartbeat-live
  since ~09:57Z
- **Trigger**: owner-directed prioritised handover (owner chat to my session ~10:13Z: "please
  prioritise handover to Blustery Buffeting Gale"), executed at the nearest CLEAN boundary —
  review-wave fixes committed and pushed, tree clean.
- **Authority**: plan g4 todo (coordination-home copy — the worktree copy on main is the OLD
  pre-reshape G4); readiness synthesis event `a9a83862` (all adjudications); the three prior
  handoff records (Tempestuous→Seaworthy, Seaworthy→Cindery — you have read them).

## 1. Current edit state

**Worktree**: `../oak-wt-airy-g`, branch `feat/g4b-keyword-graph` off
`b3a482dc`. **Working tree CLEAN. Everything is pushed** (`ls-remote` verified
`0c7938579` == local HEAD). **PR #173 is OPEN**
(<https://github.com/oaknational/oak-open-curriculum-ecosystem/pull/173>), MERGEABLE against main
(the #167 template overlap resolved cleanly). Six commits, each full-gate green at landing:

- `73aaedca0` c1 emission, `6560cc810` c1 review absorption (predecessors')
- `451a9a658` c2 keyword view (Seaworthy's)
- `9f10850d3` c2 review absorption — code-expert + test-expert findings (mine)
- `46799ca7d` c3 — get-keyword-graph tool, 4-surface registration, BOTH disambiguation halves
  (get-keywords codegen enhancement + regen), e2e parity + disambiguation describe,
  AGGREGATED_TOOL_ORDER entry, ADR-086 amendment with recomputed counts (mine)
- `0c7938579` PR review wave — shared `projection-helpers.ts` (buildEdgeAdjacency + mustGet,
  thin narrowed wrappers in both projections), Copilot summary-honesty fix, S6582 ×2 (mine)

All git ops `git -C` (cwd resets between Bash calls). Co-Authored-By is on every commit.

## 2. In-flight reasoning — what remains (your task list)

1. **Sonar re-scan verdict** on `0c7938579`. Pre-push state: QG failed on (a) 3.5% new-code
   duplication and (b) MAJOR smells. The MAJOR S6582s are fixed; the projection duplication
   (17×2 lines) is consolidated. Remaining duplication contributor: `definition-synonyms.ts`
   (133 lines, REGENERATED DATA from c1) — my arithmetic says new-code density lands ~2.8% ≤ 3%
   so the gate should clear WITHOUT it, but if the re-scan still fails: the cure is the
   owner-gated cpd-glob expansion (see §4), NEVER a config edit inside this PR.
2. **Copilot review thread** (1 unresolved, on `aggregated-keyword-graph.ts` summariseKeywords):
   verdict VALID, fix landed in `0c7938579` (summaries key off PROVIDED narrowing inputs, both
   empty and non-empty paths). Remaining: reply on the thread with the verdict + commit SHA,
   then RESOLVE it via the GraphQL `resolveReviewThread` mutation — Copilot threads NEVER
   auto-resolve on reply (standing gotcha; REST hides the state; the Director verifies
   0-unresolved by GraphQL count before merging).
3. **Merge ask** to Sunlit Waxing Asteroid (14a56a, sixth-holder Director, Moment-2 `118ad69e`)
   by DIRECTED event when both loops settle (all checks green AND 0 unresolved threads).
   Director-serialised; they have a monitor armed on the PR.
4. **At the merge**: Hushed Watching Night (999f69, n=3 seat Z) fires item 5
   (AGGREGATED_TOOL_ORDER backfill of older tools) — nothing for this seat to do beyond the
   merge itself; the seat's natural-boundary closeout follows (claims close, retirement
   broadcast, heartbeat-end). The worktree stays for the next seat or cleanup at Director
   direction.
5. **My monitors die with my session**: PR monitor (checks+threads+merge state) and the comms
   watcher/heartbeat are Monitor tasks in MY session — re-arm your own (watcher first, then
   heartbeat, per First Moves).

## 3. Decisions made (cite, don't re-litigate)

1. Everything in the two prior records' §3 stands (Tempestuous 12 items; Seaworthy 4 items).
2. **Tool name OWNER-SIGNED-OFF**: `get-keyword-graph` as implemented, recorded on the PR
   (issuecomment-4679486138, relayed by Sunlit's directed event ~10:13:54Z). No rename gate
   remains.
3. c2 review verdicts (this session, dispatched over `6560cc810..451a9a658`): code-expert
   approved-with-suggestions, test-expert sound-with-suggestions. Applied at `9f10850d3`.
   Declined with grounds (recorded in the PR body): keywordEntry-docstring finding (factually
   wrong — docstring exists); wholesale replacement of reference-count assertions (the
   ordering/boundedness invariants carry the implementation-independent proof).
4. PR review wave (this session): Copilot summary finding VALID → fixed; S6582 ×2 → fixed;
   projection duplication → consolidated to `projection-helpers.ts` with per-view narrowed
   wrappers (preserves the call-site edge-type constraint both reviewers wanted); NO re-export
   shims (replace-don't-bridge) — all five prior mustGet importers repointed.
5. eef-revalidation NOT raised: the EEF path does not consume the keyword surface (grepped
   eef-strands + EEF tool/resource modules first-hand; recorded in the c3 commit body).

## 4. Decisions deferred (owner/Director at the named gate)

- **cpd-glob expansion for vocab-generated output**: `definition-synonyms.ts` (and the vocab
  generated dir generally, `**/src/generated/vocab/**`) matches the sonar-disposition-policy
  generator-output CLASS but not the encoded glob (`**/src/types/generated/**`). Expansion is
  owner-gated per the recorded api-schema precedent ("specific user intervention") and needs a
  policy-doc amendment first. ROUTE to the Director queue if the Sonar re-scan still fails on
  duplication — I have not yet routed it (the re-scan may make it moot).
- **handoff_record_path on claim 8ba9e931**: the collaboration CLI exposes no claim-update verb;
  if the field is not on the claim when you read the registry, the Director sets it in their
  next continuity commit (asked in my retirement broadcast). The claim itself stays OPEN for
  your pickup; close disposition follows the 15bc9b5d precedent (Director closes at/after your
  pickup, or you open a continuation claim and the Director closes mine — coordinate with
  Sunlit).
- **Predecessor pattern for your claim**: open your own continuation claim (same surface set,
  cite this record + claim 8ba9e931) rather than mutating mine — the registry CLI supports
  `claims open` with `--claim-id` you mint.
