---
fitness_line_target: 400
fitness_line_limit: 700
fitness_char_limit: 45000
fitness_line_length: 100
fitness_content_role: reference
overflow_disposition: 'leave-if-live; else conserve-insight-and-delete — never archive/split/rotate/shard (see continuity-practice.md §Disposition of Continuity Surfaces)'
merge_class: index-narrative-tables
---

# main-sonar-ai-profile-to-zero Next Session

## Thread Identity

Thread: `main-sonar-ai-profile-to-zero`
Primary plan:
[`main-sonar-ai-profile-to-zero.plan.md`](../../../plans/architecture-and-infrastructure/current/main-sonar-ai-profile-to-zero.plan.md)
Supersedes the retired `main-critical-sonar-remediation` lane.

## Participating Agent Identities

| platform | model | session_id_prefix | agent_name | role | first_session | last_session |
| --- | --- | --- | --- | --- | --- | --- |
| claude-code | claude-opus-4-8-1m | 4b038c | Aspen tracks Root | analyst/plan-author | 2026-06-24 | 2026-06-24 |
| claude-code | claude-opus-4-8-1m | c57e0b | Lapwing weaves Downdraft | implementer | 2026-06-24 | 2026-06-25 |
| claude | claude-opus-4-8[1m] | c2b721 | Thyme lifts Compost | team-session-closer | 2026-06-25 | 2026-06-25 |
| claude | claude-opus-4-8 | 3b1f1c | Junk tracks Moorings | implementer | 2026-06-25 | 2026-06-25 |
| claude | claude-opus-4-8[1m] | 547586 | Alder tracks Topsoil | implementer | 2026-06-26 | 2026-06-26 |

## Landing Target For Next Session

**Plan status: MERGED to `main` via PR #220 (`9e9844015`, 2026-06-24).**
**Sites 1-2 + the S4036 fix MERGED to `main` via PR #223 (`9d2e33bb1`, 2026-06-25, Junk tracks Moorings)
— S8707 sites 1-2 contained, plus S4036 cleared as a replace (`resolveTrustedGit` absolute git path,
fail-loud; `TRUSTED_GIT_PATH` deleted; §S4036 retired to FIX-only). NEXT: site-3 only.**
**Site-3 PAUSED (Thyme lifts Compost's claim `ff3da671`) — `apps/oak-search-cli` analyze-elser-failures
local safe-path helper, then the integrated security-expert re-review, then one PR direct to main.**
Phase 1 (S8707) on branch `fix/sonar-s8707-cli-path-injection` (off `9e9844015`; sites 1-2 now on main via #223):

- **Site 1/3 DONE + green — COMMITTED `1329d787a`** — `assertPathWithinBase`
  validator (`agent-tools/src/core/safe-path.ts`, security-expert GO) wired into
  `ci-turbo-report.ts`; type-check clean, 24/24 tests; full pre-commit gate
  green. A `max-lines` fix extracted the production fs seam to
  `ci-turbo-report-fs.ts`. Phase 1 still lands as one PR direct to main.
- **Site 2/3 DONE — COMMITTED `4c9cfbfc9`** — git-dir containment base
  (`git rev-parse --absolute-git-dir`; repo-root would block every worktree
  commit), gate-green.
- **Branch PUSHED to origin** (orphan mitigation, 2026-06-25). PUSHED-not-merged
  deliberately: coordination is already squash-merged to `main`, the primary tree
  is dirty, and Sonar is a separate thread; push is the zero-risk reversible
  preservation that homes the at-risk work on origin without entangling it in a
  dirty tree or a closed coordination branch.
- **Site 3/3 PENDING** → next team session. Containment base
  `apps/oak-search-cli/diagnostics`.
- **Sites 2-3 handoff record (PDR-063)**:
  [`../../../state/collaboration/handoffs/f2a17e85-55e1-4081-bf9e-a6c4cd69e48b.md`](../../../state/collaboration/handoffs/f2a17e85-55e1-4081-bf9e-a6c4cd69e48b.md).
- **Plan correction (verified first-hand + security-reviewed):** per-site
  containment bases, NOT blanket repo-root — site-1 `.turbo/runs`, site-2
  **git dir** (`git rev-parse --absolute-git-dir`; repo-root would block every
  worktree commit), site-3 `apps/oak-search-cli/diagnostics`. All FIX.

Target (next team session): successor wires site 3 (TDD; sites 1 + 2 already
committed) → security-expert RE-review of integrated sites → workspace gates →
one PR direct to `main` via code-owner review. Then Phase 2 regex strategy.

## Lane State

**Objective**: drive `main`'s Sonar AI quality-profile backlog to **zero** —
fix or genuine-FP only, no suppression, generated files fixed at generator.

**Done this session (2026-06-24, Aspen tracks Root)**:

- Retired the stale `main-critical-sonar-remediation` lane (plan + evidence →
  `plans-old-archive/.../superseded/`; thread record → `retired/` with banner;
  `repo-continuity.md` tables updated).
- Authored this tracking home + the full 48-class triage table; the plan is now
  **DECISION-COMPLETE and owner-approved** (six phases, two owner decisions closed:
  FP-dismissal authorised on first-hand proof; idiom rules enable→autofix→lock-at-error).
- First-hand triage of the three HIGH-priority classes:
  - **S8707 ×3** (agent-CLI path-injection) — all genuine; fix = canonical-path
    validation. Gate-blocking (new vulnerabilities condition).
  - **Regex safety** (S8786 ×15, S5843 ×2, S6035 ×1) — five sub-classes;
    `path-utils.ts` is GENERATED (fix at generator); `semver.ts:33` is a
    vendored canonical pattern (accept/refactor candidate); hand-written sites
    are the per-workspace consolidation targets.
  - **Test integrity** (S2699 BLOCKER, S5914 ×12, S5906 ×34, S6551 ×1).

**Owner decisions — all CLOSED (2026-06-24, plan is DECISION-COMPLETE)**:

- Regex home: **`src/lib/regex/`** per workspace, hand-written sites only (not
  generated / generator-source / vendored). [owner: "agree to all"]
- `semver.ts:33`: **refactor-to-import from `semver`** (not a dismissal). [agreed]
- `S101 ×3`: **FALSE_POSITIVE** — openapi-ts fixed `paths`/`operations` names,
  not renamable; dismissal **authorised on first-hand proof** [AskUserQuestion].
- FP dismissals generally: **authorised on first-hand proof** with site rationale.
- Idiom rules: **enable → autofix → lock at error**.

Residual (non-blocking, resolved first-hand during execution): which exact S8786
sites are linear-safe FPs vs real fixes.

**Coverage note**: HIGH-priority classes read per-site first-hand;
design-MAJOR representative; mechanical-MINOR dispositioned at class level
(per-site confirmation collapses into the fix act). Full per-site first-hand of
every MINOR site is available on request.

**Current state (2026-06-26, Alder tracks Topsoil)**: Phase 1 is COMPLETE in
**PR #242** (branch `fix/sonar-site3-test-demask-local-edits`, off fresh `main`
`f0b87a2e3` — NOT the old `fix/sonar-s8707-cli-path-injection`, which was the stale
pre-squash #223 branch, 23 behind main; retire it). #242 (12 commits, all PUSHED,
**Sonar gate OK** — duplication 0%, all conditions pass, CI green) contains: site-3
containment fix; the validator extracted to a shared **`@oaknational/safe-path`**
SSOT package (`packages/core/safe-path`) — the required Sonar
`new_duplicated_lines_density` gate forced DRY at the **2nd** consumer; both local
copies deleted; the two `--passWithNoTests` de-masks (graph-ingest, graph-project);
plan/prompt/napkin/vscode updates; and the `consolidate-at-third-consumer` guidance
correction (extraction is at the **second** consumer — rule content, practice-index,
and closed-shape descriptions fixed; filename retained as a stable id; a clean rename
is a tracked follow-up). Worktrees `oak-pr-watch` and `oak-pilot-ws-e`: verified retire-only
(keepers already merged via #222/#224; nothing net-new).

**Review fixes LANDED (2026-06-26T20:35Z, Alder tracks Topsoil)**: the #242 bot-review
fixes are committed and the tree is green — (a) `12bad766e` analyze-elser contain-first
(Codex P2: dropped the redundant `existsSync(reportPath)`; contain the untrusted argv
path with `assertPathWithinBase` before any fs access; extracted `analyseReport()` so
`main()` clears `max-statements` — and `analyseReport` returns `void`, sidestepping the
`consistent-return` error that a `string`-returning resolver-helper extraction first
introduced), (b) `b0e70e375` safe-path test `./index`→`./index.js` (Copilot), (c) plan
prose → SSOT framing (Copilot) in the docs commit alongside this record. Verified
first-hand: `search-cli` lint 0 errors + type-check clean, `safe-path` 6/6. (The 160
`search-cli` lint *warnings* are pre-existing repo-wide ADR-088 `no-throw-statement`
migration warnings in unrelated files — zero added by this work.)

**#242 is GREEN and MERGE-READY (2026-06-26T~21:00Z, Alder tracks Topsoil)**: disposition
comment posted (`#issuecomment-4813412293`); all 5 review threads RESOLVED; CI green on
`d19559587`; **`mergeStateStatus: CLEAN`**. Verified first-hand: these paths are NOT
code-owner-review-gated by the ruleset (`reviewDecision` empty + state CLEAN) — a normal
merge works, **no `--admin`** (this corrects the earlier "code-owner approval required"
assumption for this PR's paths). Owner-directed pipeline in flight: closeout →
consolidate-docs → recursive scan → commit/push → semantic merge-impact analysis → merge
→ tell Cedar.

**Next safe step**: (1) flag Cedar on canonical per the merge-ordering pact; (2) run the
`.agent/` semantic-merge check vs `main` (this branch touches the napkin, this thread
record, the plan, `consolidate-at-third-consumer.md`, practice-index — git line-merges
them, meaning needs an agent merge); (3) merge `#242` as a **MERGE commit (never squash)**;
(4) tell Cedar it merged; (5) close claim `6bded07b`. Then Phase 2 (regex strategy:
S8786 ×15, S5843 ×2, S6035 ×1; per-workspace `src/lib/regex/` home).

## Watch (not mine; flagged)

`oak-sdk-codegen` generated/schema files showed as modified mid-session
(parallel process; not this session's edits). Do not stage them in this lane.
