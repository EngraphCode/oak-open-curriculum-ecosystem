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

**Phase 1 (S8707) COMPLETE — all three sites MERGED to `main`.** Sites 1-2 + S4036 via
PR #223 (`9d2e33bb1`); **site-3 + the `@oaknational/safe-path` SSOT + the `--passWithNoTests`
de-masks via PR #242 (merge commit `3895b3f45`, 2026-06-27)**; the plan itself via PR #220.
**NEXT: Phase 2 (regex-safety).** The authoritative fresh-agent pickup is the §"Phase 1
MERGED" and §"Next safe step — PHASE 2" blocks in the Lane State section below. The earlier
site-by-site pickup text and the `fix/sonar-s8707-cli-path-injection` / `ff3da671`
paused-claim references are **superseded and removed** — Phase 1 is done.

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

**Phase 1 MERGED (2026-06-27, Alder tracks Topsoil)**: #242 merged to `main` as **merge
commit `3895b3f45`** (a real two-parent merge, not a squash — all commits preserved;
auto-release 1.36.1 followed as `c69aa57ea`). All 5 review threads resolved AND replied
with per-thread dispositions; disposition summary `#issuecomment-4813412293`; CI green;
the `.agent/` semantic merge-impact analysis was clean (main unchanged since the branch
base, empty intersection — no manual merge needed). Claim `6bded07b` closed.

**Correction (knowledge integrity):** #242 merged `CLEAN` with no approval **because it was
agent-authored under the owner's shared gh auth and the sole code owner IS the author**
(GitHub auto-satisfies the code-owner gate and forbids self-approval) — the documented
author-dependent gate behaviour, NOT because "these paths aren't code-owner-gated." CODEOWNERS
is `* @jimCresswell`; every path is gated. An earlier note here claimed path-scoping — that was
a misdiagnosis (see [[project_main_merge_gate_codeowner]]).

**Next safe step — PHASE 2, for a FRESH agent (Phase 1 is done):** open a fresh branch off
`main` and execute the **regex-safety** lane — `S8786 ×15`, `S5843 ×2`, `S6035 ×1`. Decided
strategy (owner-ratified; see the plan + the §Owner decisions block above): hand-written sites
consolidate into a per-workspace **`src/lib/regex/`** home; `path-utils.ts` is GENERATED (fix at
the generator, never the output); `semver.ts:33` is refactor-to-import-from-`semver` (not a
dismissal). **Re-triage first-hand** which exact S8786 sites are linear-safe FPs vs real fixes
before fixing — the per-site labels proved unreliable (3 mislabels in one earlier session). Read
the plan and this record first; re-fetch live Sonar (issue counts in archived prose are stale). No
blockers, no claim held. Then the remaining MAJOR/MINOR classes per the plan's triage table.

## Watch (not mine; flagged)

`oak-sdk-codegen` generated/schema files showed as modified mid-session
(parallel process; not this session's edits). Do not stage them in this lane.
