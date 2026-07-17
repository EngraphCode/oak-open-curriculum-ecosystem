# Stray-code register — owner-ordered sweep, 2026-07-16 (AIP-131)

Every piece of work found outside `main` at the session close, with its committed/
pushed/draft-PR disposition. Corrected inventory: the first scan over-counted by
eleven stale remote-tracking refs (branches merged upstream and deleted; pruned).

## Secured on draft PRs by this sweep

| Draft PR | Branch | Content | Commits |
|---|---|---|---|
| #395 | chore/aip-131-primary-estate-snapshot | ALL uncommitted primary-checkout work (36 files, +6,293): session records, reports, rules, cricket templates, ratified oak-reason amendments, tooling-runway plan, r2 walk inputs; napkin as mechanical append union (+1,953/−0 over main) | 1 |
| #396 | fix/commit-queue-rename-endpoints | commit-queue rename-endpoint fixes | 3 |
| #397 | feat/plan-corpus-refounding-s1-zodiac | Zodiac's S1 refounding work | 1 |
| #398 | chore/session-handoff-zodiac-019f65 | Zodiac's session-handoff record | 1 |
| #399 | team/plan-corpus-refounding | refounding team-branch work | 3 |
| #400 | docs/agent-operability-deferred-work-map | operability deferred-work map | 3 |
| #401 | claude/nifty-ramanujan-7b1623 | unlabelled claude-session work — needs identification at adjudication | 3 |
| #402 | docs/graph-team-direction-2026-06-10 | graph team direction docs | 2 |

## Another seat's parallel sweep (do not touch)

- `fix/claude-hook-hardening` — 5 commits + 12 uncommitted files in its worktree:
  **Lupin herds Bark's hooks sweep**, per the owner. Also excluded from #395 for the
  same reason: the codex-hook ARC channel and the codex-to-codex thread record.

## Deliberately NOT committed (hard constraint: never enters git history)

- `.agent/reports/restatement-audit/canary-key.v1.json` (primary checkout)
- `.agent/plans-refounding/challenge/canary-key.v1.json` and
  `canary-keyset.v1.json` (s2-divergence worktree)

These are unsealed audit canary keys; they live untracked beside their consumers.

## Stale refs corrected (merged upstream, branch deleted — nothing stranded)

- `feat/plan-corpus-refounding-r2` → already merged as PR #390; the first scan's
  "12 unmerged commits" was a stale local ref, not stranded work
- `feat/refound-tooling-arg-contract` → merged as PR #387
- `chore/s2-attestation-ledger-set-aside` → merged as PR #388
- plus eight further pruned refs with no local divergence

## Clean at sweep close

- `s2-divergence` worktree: branch fully merged; only the canary keys above remain
  (by design). All other worktrees (tooling-runway, continuity-truth,
  s1-reader-sample, restatement-audit, plan-corpus-refounding-r1): clean, branches
  merged.
- The primary checkout's working tree DELIBERATELY retains its files (live fleet
  surfaces — comms, claims, handoff records, napkin); their content is secured on
  #395. Do not "clean" the primary; reconciliation lands via AIP-127.

## Adjudication queue (merge / fold / close — owner or fresh seat)

Each draft above needs a disposition, adjudicated at the refounding restart with its
Linear link per the new order. Recommended first pass: #395 folds via AIP-127's union
authorship; #397/#398/#399 are refounding-lane inputs and adjudicate with that
restart; #396/#400/#401/#402 are individually small — merge-or-close on inspection.

— Mussel rides Coral (6f8857), 2026-07-16, agent under shared credentials

## Post-sweep amendment (2026-07-16 ~22:0xZ): the s2 canary keys entered history via PR #404

Lupin herds Bark's parallel cleanup (correctly protocol'd — their custody ask went
unanswered because this seat's watcher was already stood down) committed the two
s2-divergence canary JSON files as `chore/preserve-r2-canary-key` (commit 5612ae244,
draft PR #404). Under the standing never-in-history constraint those keys are now
COMPROMISED-FOR-AUDIT: a key readable in history cannot prove a finder found rather
than read it. Disposition: #404 closes unmerged; both keys re-plant in the v2-cycle
key work before any canary gate consumes them. The primary-checkout key
(canary-key.v1.json) remains untracked and unaffected. Lupin's #403 (hook prototype)
is clean and stands.
