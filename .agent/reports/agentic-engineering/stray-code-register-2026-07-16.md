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

## THE MANAGEMENT PLAN (definitive, 2026-07-16 close; supersedes the queue above)

Two tickets own everything; every PR below carries its verdict and its vehicle.

### The nine open PRs

| PR | Verdict | Vehicle / gate |
|---|---|---|
| #395 estate snapshot | CURATE THEN MERGE — this branch IS AIP-127's working vehicle: author the two remaining unions (repo-continuity, strategy thread record), apply the track-vs-untracked split (coordination-record classes that stay untracked BY RULE come OFF the branch, recorded here as living untracked-by-design), undraft, merge | AIP-127; first act of the next fresh seat |
| #396 commit-queue fixes | MERGE — small code fix; verify gates on tip, undraft, merge | AIP-131 adjudication; minutes |
| #397 Zodiac S1 | ADJUDICATE AT REFOUNDING RESTART — lane input; fold into the restart branch or merge if self-contained | AIP-131 → refounding restart |
| #398 Zodiac handoff record | EXTRACT AND CLOSE — handoff commits are barred from main by standing rule; conserve unique content into the continuity estate via #395, then close | AIP-131 adjudication |
| #399 team/plan-corpus-refounding | ADJUDICATE AT REFOUNDING RESTART — as #397 | AIP-131 → refounding restart |
| #400 operability work map | FRESHNESS-CHECK THEN MERGE-OR-CLOSE — docs; if the map still reflects reality, merge; else extract-and-close | AIP-131 adjudication |
| #401 nifty-ramanujan | IDENTIFY FIRST — unlabelled session work; read the 3 commits, then merge-or-close on content | AIP-131 adjudication |
| #402 graph-team-direction (June) | FRESHNESS-CHECK THEN MERGE-OR-CLOSE — five weeks old; likely extract-and-close | AIP-131 adjudication |
| #403 Lupin hook prototype | HOLDS AS DRAFT — the codex-hook lane's own continuation gate (diagnose the masked reviewer exit-1 first, per their thread record); disposition belongs to that lane, not this sweep | codex-hook lane |

(#404 CLOSED unmerged — canary-key constraint; keys re-plant in the v2 cycle.)

### The dirty primary checkout

All content is secured on #395; the working tree deliberately keeps its files because
they are live fleet surfaces. End-state after #395 merges (AIP-127): `git pull
--ff-only` succeeds content-aware; the tracked files match main; what remains
"dirty" is exactly the by-design residue — the untracked runtime surfaces (comms,
claims, active handoff records, ARC channels if ruled untracked) and the primary
canary key. Target: primary status drops from 39 items to only that named residue,
listed here at AIP-127 close as the accepted steady state.

Sequencing: (1) #396 merge (minutes) · (2) #395 curation + merge, then the primary
fast-forward (AIP-127) · (3) #398/#400/#401/#402 adjudications (an hour of fresh-seat
work) · (4) #397/#399 ride the refounding restart · (5) #403 rides its lane. All
under ticket-first; AIP-131 closes when only #397/#399/#403 remain, each owned by a
named live lane.
