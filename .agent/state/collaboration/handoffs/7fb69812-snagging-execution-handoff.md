# Mid-cycle handoff: 2026-06-11 snagging execution (claim 7fb69812)

- **Retiring agent**: Dusky Passing Mist (claude / Fable 5 / 2c0c4b /
  `078c13ad-436c-586a-a4a7-bc1539299fd3`)
- **Claim**: `7fb69812-0259-4976-88f3-b52b96c0be98` (thread `eef`)
- **Owner-named successor**: Cosmos turns Equinox. NOTE for the Director: your
  claim intent (21:04Z) names "Tarsier calls Warren" for this lane; the owner
  named Cosmos turns Equinox to me later (~22:20Z). Owner statement is fresher —
  please route accordingly.
- **Approved plan (authoritative for remaining scope)**:
  `~/.claude/plans/ultrathink-oak-plan-oak-metacognition-pl-sparkling-forest.md`
  (owner-approved this session; full evidence audit trail inside).
- **Worktree**: `.claude/worktrees/snagging-2026-06-11` (this is the session
  worktree; enter it before any source work).

## 1. Current edit state

- **PR-1 (token health metric) — DELIVERED, monitoring open**:
  <https://github.com/oaknational/oak-open-curriculum-ecosystem/pull/190> —
  branch `feat/mcp-outbound-token-health`, commit `95cc6319f`, all gates green
  at push. Obligation to merge: watch checks AND review comments; adjudicate
  every bot/reviewer finding first-hand (refute false with source grounding,
  apply true); post-merge, confirm `oak.mcp.response.*` span attributes in
  Sentry against preview.
- **PR-2 (EEF dual-shape) — E1+E2 LANDED as `20ad83326`** on branch
  `feat/eef-dual-shape-alignment` (off origin/main `1a1a0cb3f`), full
  pre-commit gate chain green; push to origin was in flight at freeze
  (verify `origin/feat/eef-dual-shape-alignment` exists; if absent, plain
  `git push -u origin feat/eef-dual-shape-alignment` from the worktree —
  pre-push re-runs the gates). Bundle: 5 SDK files (aggregated-eef-evidence
  .ts + unit test, NEW eef-evidence-egress.ts, NEW eef-evidence-summary.ts,
  universal-tools/executor.ts) + NEW e2e `eef-evidence-anchored.e2e.test.ts`
  - `docs/manual-uat-guide.md` §H1/H2. Verified green: SDK suite 54 files /
  774 tests; new e2e 2/2; tsc + eslint clean on both workspaces.
- **PR-3 (S4 limit bounds) — NOT STARTED**: one cycle, fully specified in the
  approved plan (`aggregated-keyword-graph.ts:67-72` →
  `.int().min(1).max(MAX_KEYWORD_LIMIT)`; integration test asserting the
  served JSON schema carries the bounds, red first; `rg -U` multiline-aware
  sweep for other bare numeric params — single-line grep misses chained Zod).

## 2. In-flight reasoning

- **Design (panel-ratified + owner-approved)**: domain stays strict
  (`runEefEvidenceTool` returns `{summary, envelope}`); the egress membrane
  (own module `eef-evidence-egress.ts`, ADR-193 one-seam) delegates to
  `formatToolResponse` with `status: 'success'`, `toolName`,
  `annotationsTitle`, default `includeContextHint` (hint INCLUDED —
  uniformity + composeEnvelopeSchema predicate + cost now measurable by
  PR-1's metric). Summary built at dispatch sites (only place `detail` is
  statically known). A guard test pins envelope keys
  `[answerType, members, edges, frontier, provenance]` against
  decoration-spread clobbering.
- **Why dual shape**: live client matrix — Cursor surfaces ONLY content
  blocks; Claude Code (probed live this session) ONLY structuredContent;
  claude.ai/ChatGPT both. In-repo research
  `mcp-client-tool-result-consumption-2026-05-28.md` concluded "only both is
  robust" ten days before D6 shipped structuredContent-only (knowledge-flow
  lesson captured in napkin, distilled candidate).
- **Token cost**: dual shape ≈ doubles model-visible payload on both-fields
  clients — owner-accepted; PR-1's metric is the watchdog. PR-2's
  description should quote a measured local before/after delta
  (deterministic: run `measureCallToolResult`-style arithmetic over the old
  shape (envelope only) vs new (content[0]+content[1]+decorated
  structuredContent) for H1 inspect-strand + a full evidence-for-move — no
  calendar gate; the adversarial reviewer's "3 days live first" was REJECTED
  as an invented gate, reasoning in the approved plan).

## 3. Decisions made (owner-ratified or landed)

- S1 dual-shape: owner decision 2026-06-11, supersedes EEF plan D6/D7
  structuredContent-only ratification (2026-06-06/07).
- S0 closed evidence-recorded (Cursor + Claude Code probes + 2026-05-28
  research); further client probes optional annex, NOT gates.
- Token metric v1 = baseline observation, numbers only, two seams, NO
  thresholds (named follow-on decision, trigger: Sentry baselines + post-S1).
- S2 root cause located: OUR keyword-extractor first-occurrence-wins collapse
  (`keyword-extractor.ts:101-105,152-186`), upstream data is per-placement
  (8+ "convert" descriptions). Cure = identity-model design decision, queued.
- S3 reframed: typo in generated corpus (`graph-corpus/data.json:30036`) but
  ABSENT from current bulk-downloads (unit slug absent too) → refresh bulk +
  regenerate, then route (upstream ticket in
  `.agent/plans/sector-engagement/ooc-issues/` only if it survives).
- S5: stays an observation.
- Conditional-in-test lesson (owner-challenged this session): guarded
  assertions pass vacuously; proof moved to e2e through the real path —
  napkin entry 2026-06-11 carries the full lesson.

## 4. Decisions deferred / remaining work (in order)

1. **Land the E1+E2 commit** if not already on the branch (see §1), then
   **E3 docs supersession sweep** (one commit): EEF plan D6/D7 supersession
   annotations; output-schemas plan Cycle 0.3 landed-shape note + provenance
   row reconciliation (EEF now emits the formatToolResponse envelope —
   composeEnvelopeSchema applies uniformly); snagging plan S0 disposition +
   s1 todo closure + finding-1 row + dispositions ledger (S2/S3/S5 per §3);
   cursor-visibility write-up outcome addendum (+ Claude Code matrix row:
   structuredContent-only visible, content dropped); ADR-058
   client-variability note (its visibility table is OpenAI-Apps-specific —
   Cursor refutes "model sees structuredContent"). Acceptance:
   `grep -rn 'structuredContent-only' .agent/plans .agent/reports` shows
   zero un-annotated current-shape claims.
2. **Local pre/post size delta** → PR-2 description; push; open PR-2
   (base main); monitor with PR-1.
3. **PR-3** (S4 cycle, §1 above); close snagging s4 todo.
4. Reviewer dispatch per approved plan: code-expert + mcp-expert +
   test-expert (PR-2); sentry-expert (PR-1 if not yet reviewed); ground all
   findings against code before acting.
5. Knowledge capture: napkin → distilled candidates (research-didn't-reach-
   decision-thread; audit-my-own-filters second instance; conditional-test
   lesson); session-handoff consolidation gate.
6. **Post-merge verification**: PR-1 Sentry attributes in preview; PR-2
   replay (local no-auth server Shape-B call returns 2 content blocks; a
   Claude Code session re-probe against preview).

## Loss-scan additions (session-handoff 6e.2 — facts only in the retiring context)

- **The app's e2e suite runs the SDK from SOURCE, not dist** (vitest aliasing): my
  EEF e2e went green without rebuilding the SDK. Also the SDK package filter name
  is `@oaknational/curriculum-sdk`-style in imports — `pnpm --filter
  @oaknational/oak-curriculum-sdk build` matched NOTHING (silent no-op); verify
  filter names against the package.json `name` field before trusting a filtered build.
- **Do not run two git operations in the same worktree concurrently** (even via
  background tasks): a commit's hook window and a follow-up `git add` raced on
  `index.lock` once this session. Transient — the lock cleared itself; serialise
  per-worktree git ops. Never delete the lock.
- **PR-1's first commit attempt failed ONLY on prettier** (md table formatting in
  the UAT guide); `prettier --write` + re-stage cured it. Watch for the same on E3's
  doc edits.
- The pre/post size-delta arithmetic for PR-2's body needs no PR-1 code: old shape
  chars = JSON(envelope); new shape chars = JSON(content blocks) + JSON(envelope +
  summary/oakContextHint/status decorations). Compute for H1 inspect-strand and one
  full evidence-for-move; quote both.

## Untouched-by-design

`.agent/state/**` registry files stay OUT of all three PR diffs (resolve any
conflict to main's version). The main-checkout napkin carries this session's
captures (committed by whoever holds that window next).
