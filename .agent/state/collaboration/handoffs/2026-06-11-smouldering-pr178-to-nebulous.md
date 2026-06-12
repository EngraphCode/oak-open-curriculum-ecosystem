# Mid-cycle handoff: Smouldering Stoking Hearth (fddf14) → Nebulous Shimmering Nebula

**Date**: 2026-06-11 ~12:03Z. **Claim**: `45b3a187-4c4c-4ac5-8bf4-7226d912c50f` (thread `eef`,
retained for this pickup). **Trigger**: owner-directed session end at the PR-178
monitor-to-merge boundary ("Nebulous Shimmering Nebula is your eventual successor … this
session is complete and will not need to stand up again"). Successor reads this record END TO
END before any action (PDR-063 / ADR-182; the start-right-team pickup contract).

## 1. Current edit state

- **PR #178 OPEN**: `feat/position-anchored-prompt` → `main`,
  "feat(mcp): add continue-teaching position-anchored prompt (name sign-off requested)".
  ONE commit `32ba1ceeb` (atomic test+code landing; full pre-commit + pre-push gate chains
  green; push transfer-line + ls-remote proven).
- **Checks at freeze (~12:02Z)**: 6/7 green (CodeQL, Bugbot, SonarCloud, both Analyze, Vercel
  pass); `run-quality-gates` PENDING; mergeStateStatus BLOCKED pending that check.
  **0 review comments** at freeze.
- **Worktree**: `../oak-wt-smouldering`, branch `feat/position-anchored-prompt`
  at `32ba1ceeb`, working tree CLEAN, everything pushed. One local-only gitignored file:
  `apps/oak-curriculum-mcp-streamable-http/.env.local` (copied from the primary checkout for
  the P3 live proof; harmless, never committable).
- **The change set** (all in the one commit): SDK `MCP_PROMPTS` entry + `getPromptMessages`
  switch case; generator at `src/mcp/prompt-messages/continue-teaching.ts`; the former
  `mcp-prompt-messages.ts` is now a barrel over per-prompt modules under
  `src/mcp/prompt-messages/` (ESLint max-lines structural cure; six moved generators
  reviewer-verified content-identical to HEAD); app `prompt-schemas.ts`
  (`continueTeachingArgsSchema`) + `register-prompts.ts` entry (NOT EEF-gated); SDK unit tests
  (count 6→7 + 12 new assertions, written first, proven RED); e2e list/get cases; ADR-123
  drift reconciliation (7-prompt table, dated amendment note).

## 2. In-flight reasoning (what remains and how to run it)

**FRESHER THAN §1 (12:04Z, landed during handoff compose — supersedes the §1 freeze where
they conflict):**

- **OWNER NAME DECISION: `where-next`** (over the implemented `continue-teaching`;
  `plan-next-lesson` dropped pre-ask for S2 collision). Sign-off recorded on the PR at the
  Director's hand (issuecomment-4680314953; directed event 12:04:10Z). **ONE rename commit is
  required** — the rename-touches list in §3 below is the checklist; the Director's direction:
  full gates green at commit and push.
- **TWO Copilot review comments** landed 12:04Z on `prompt-messages/continue-teaching.ts`.
  My first-hand adjudication, pinned at `32ba1ceeb` (re-verify cheaply, then fix + reply):
  1. line 48 — step-1 lessons fallback does not instruct passing `subject`: **VALID** (the
     scope-units example carries subject; the fallback sentence does not — one-line prompt
     edit, lowers wrong-unit resolution risk).
  2. line 56 — attribution line omits misconception data while step 4 pulls it: **VALID**
     (the line reads "threads, sequencing, and prior-knowledge data"; add misconception data
     to the credited list — accuracy fix).
  Both fold naturally into the SAME rename commit (tests asserting the prompt text need the
  matching updates: the misconception-anchor regex and attribution assertions are unaffected;
  the new subject-fallback sentence may warrant one added assertion at your judgement).

Remaining work after that one commit is **monitor-to-merge** (the w1-c1 cycle is otherwise
complete):

1. Arm your own PR #178 monitor (my monitors died with my session): checks AND review
   comments AND merge state — three loops, all must settle.
2. Adjudicate any review-bot comments FIRST-HAND (refute with source grounding or apply;
   reply with verdicts on the PR; resolve threads; fresh GraphQL thread recount at merge-ask
   time — the #169 lesson).
3. **The owner name sign-off gate**: the outward prompt name lands at this PR per the S2
   fixed vocabulary. Candidates on the PR body: `continue-teaching` (implemented, my
   recommendation), `plan-next-lesson`, `where-next`. The sign-off must be RECORDED on the PR
   before merge (the get-keyword-graph / curriculum-mapping precedent — the Director relays
   the owner's decision). If the owner picks a different name, the rename touches: the
   MCP_PROMPTS entry + switch case, the generator filename + barrel line, prompt-schemas
   export name, PROMPT_REGISTRATIONS entry, the unit/e2e test strings, and the ADR-123 table
   row — one mechanical commit, full gates.
4. Merge ask is DIRECTED to Iridescent Threading Constellation (f9454b, Director seventh
   holder) at both-loops-settled + name sign-off recorded. Merges are Director-serialised.
5. After merge: w2-c1 (the bounded impact-language pass) is the plan's remaining todo —
   it needs its own collision-safety read of active-claims at start (the landing-page file
   had no live claim at plan authoring; re-verify). NOTE: the Director routed Prismatic
   (~12:00Z) to fold a vocabulary-bridge FUTURE CYCLE into the position-anchored plan —
   additive, no w1/w2 conflict, but re-read the plan at w2 start.

## 3. Decisions made (cite, do not re-open)

- **Working name `continue-teaching`** — verb-first (find-lessons/explore-curriculum/
  adapt-lesson class); does not blur the lesson-planning boundary. Owner decides the final
  name at the PR.
- **Barrel split** (one module per prompt) over a second overflow file — never-disable-checks;
  the import surface is unchanged; `prompt-messages/` is internal (exports map verified — no
  new public subpath).
- **KS4 verbatim assertion kept** against a test-expert audit-shaped finding — the plan
  clause mandates the caveat "carried verbatim from curriculum-mapping"; the literal IS the
  contract; the consuming clause is named in the test comment. (Refusal grounded, recorded in
  the PR body.)
- **e2e classNotes path not added** — optional-absent is the wire-relevant path; unit tests
  cover presence (code-expert S2 refused, mcp-expert concurred).
- Reviewer adjudications: code-expert barrel-order + OGL-URL assertion APPLIED; mcp-expert
  COMPLIANT (5/5 protocol checks); title-field observation = pre-existing practice, not held.

## 4. Decisions deferred

- **Outward prompt name** — owner, at the PR (above).
- **w2-c1 execution** — pending; the plan todo carries full scope.
- **P5 delivered-value** — post-merge release-and-observe; no pre-release claim.
- The plan's risk note about extending lesson-planning instead of a seventh prompt was
  resolved at c0 (owner-ratified new prompt) — do not re-open.

## Proof evidence (verified first-hand at write time)

- Commit `32ba1ceeb` (gates green at commit + push); remote SHA verified:
  `git ls-remote origin refs/heads/feat/position-anchored-prompt` → `32ba1ceeb…`.
- `pnpm check` GREEN in the worktree pre-commit (second run, real exit 0 read from the
  captured log — the first run caught the max-lines lint failure that the split cured).
- P3 live round-trip (server :3333, this branch): prompts/list = 7 incl. continue-teaching;
  prompts/get serves the full workflow incl. the classNotes branch; orchestration executed on
  real data — search resolved real units+threads; get-thread-progressions(number-fractions)
  = 32-unit year-ordered progression; next unit comparing-fractions-using-equivalence-and-
  decimals (Y5) → readiness list (3 items, depth-2 subgraph 5 units/8 edges) +
  get-misconception-graph → 15 lessons with recorded misconceptions + teacher responses.
- SDK suite 770/770; e2e suite 137/137.
