# Residue Disposition Sweep — 2026-07-15

The one-batch disposition of the primary checkout's accumulated residue: 4 stashes, 51
non-main local branches, and the remote-branch tail. Owner-commissioned after the
handover-PR-habit ruling; owner-ruled in one batch (four rulings, 2026-07-15 ~13:35Z);
executed by the Director seat (Schooner guards Whirlpool, 82a9df) the same hour. This report
is the audit artefact: the evidence method, the ledger, the execution record, and the
corrections-of-record the sweep produced.

## Why the residue existed

Two disciplines compounded: agents worked on the shared primary checkout (pre-worktree era),
leaving stashes and branches at session ends; and the conservation rules (deletion is
owner-gated, archive-not-delete) mean no agent disposes of anything unilaterally.
Conservation without a scheduled disposition moment equals accumulation. The cure applied
here — a proof-per-item ledger, one batch ruling, same-day execution — is the disposition
moment that was missing.

## Evidence method

A read-only forensics pass (subagent) over every stash and branch, then Director
spot-verification of the three highest-stakes claims before any ruling was requested:

- **Merged-PR head identity**: `gh pr view --json headRefOid` equal to the local tip SHA of
  a MERGED PR proves the branch content landed (squash merges break patch-id equivalence, so
  `git cherry` alone systematically under-reports containment).
- **Content comparison for every diverged branch** (owner-directed strengthening):
  distinctive-added-phrase substance probes (`git grep -F` short phrases, never whole lines
  — line rewrapping produces false absents) against origin/main's tree, plus per-file
  tip-vs-main blob diffs where applicable.
- **Ancestry**: `git merge-base --is-ancestor` to a proven-contained tip.
- Spot-verified first-hand before ruling: `feat/no-throw-result-migration` (all six touched
  files byte-identical to origin/main), `feat/graph-tooling-tidyup` (tip `5f8394aba` ==
  merged PR #131 head), the oak-prod exercise report (zero origin refs — genuinely
  unconserved).

## The ledger (dispositions and proofs)

### Stashes — all four DROP (executed; owner-run via `!`, hook binds agents)

| Ref (SHA) | Context | Proof |
|---|---|---|
| `45f5ab75` | WIP on docs/consolidation-run | Whole diff = the localised-spelling fix, already applied in the pattern file on main (spot-verified) |
| `12f7f433` | WIP on docs/session-closeouts | Proven duplicate: 26/26 napkin headings already in the landed napkin |
| `e8380c0c` | WIP on feat/corpus_research_enhancements | Unique content recovered verbatim into the napkin archive (heading verified on main) |
| `9bcb9e63` | WIP on docs/consolidations | Memory deltas landed + remainder regenerable codegen (43 files checked at audit) |

### Local branches — 52 → 5

- **Deleted 47** (23 safe-deletes; 24 force-deletes — force needed only because local `main`
  predated the merges, every one proven conserved): 21 zero-ahead pointers; 13 tip==merged-PR-head
  (PRs #73, #87, #90, #131, #220, #223, #224, #225, #226, #241, #259, #260, #270); 3 contained
  via merged-PR commit lists + per-commit probes (PRs #272, #273, #275 — the spawn-flow pair and
  the F-75 liveness branch); 4 ancestors of proven-contained tips; 5 content-contained by direct
  comparison (incl. `feat/no-throw-result-migration`, byte-identical across all touched files);
  plus `codex/graph-tooling-tidyup-isolation` after its tag-archive (below).
- **Kept 5**: `main`; `feat/plan-corpus-refounding-s0` and `feat/plan-corpus-refounding-s1-zodiac`
  (live lanes — the latter holds conservation commit `42b27e3eb`, the 49 MB S1 artefact bundle,
  local-only until a post-merge regeneration re-verify against the recorded hashes proves
  containment; dated note 2026-08-02: the re-verify ran at the pinned base — two rounds,
  byte-identical to the manifest — so containment is proven; preservation PR #706 closed,
  branch deleted); `feat/plan-corpus-refounding-s1-evidence` (PR #382, merged `de3cc54c1`);
  `docs/graph-team-direction-2026-06-10` (until this PR's re-homed content merges).

### Conserved BEFORE deletion

- Tag `archive/school-data-search-scaffold` → origin (`caef5f50`): the PR #132 scaffold
  (workspace code + contract-ADR text; PR closed unmerged on a failed gate; the plan estate
  lives on main, so the scaffold is conserved for a possible thread resume). Owner-ruled
  tag-archive.
- `docs/graph-team-direction-2026-06-10` pushed to origin: the ONE genuinely unconserved
  artefact found in the whole estate — the oak-prod live MCP exercise verification record
  (2026-06-11). PR #383 (opened on the raw June branch) proved structurally unmergeable: the
  branch re-tracks coordination-state files that became untracked-by-design on 2026-06-14
  (ADR-199/PDR-094 tier) and conflicts on the napkin. Closed by ruling; the substance —
  the report, the eef thread-record bullet, the June napkin entry — lands via THIS batched
  continuity PR with SHA provenance (`SHA:c9ff6bb49`).

### Remote branches

- Deleted on proof: `pilot/ws-b-explain-resource`, `pilot/ws-d-roles-doctrine`,
  `fix/observability-synclog-target`, `docs/neo-sentry-safeguard` (all contained; citations
  as above / PR #372, PR #380).
- The 7 `remediate-main-*` bot branches (a generated per-finding class; individual suffixes
  not re-enumerated here — the class name plus their closed-unmerged PRs are the record; all
  PRs closed unmerged): agent deletion was
  rejected by a name-specific repository rule INVISIBLE to the agent token (repo rulesets
  and the effective-rules endpoint show nothing matching; ordinary branch deletion works —
  probe-proven). Owner deleted them directly. The invisible-rule surface is a real finding:
  at least one push-rule layer is not enumerable by agent credentials.
- Kept: `docs/agent-operability-deferred-work-map` — genuinely unlanded (its deferred-work
  plan is absent from main; PR #264 closed unmerged); belongs to the ACTIVE agent-operability
  thread, so its disposition routes to that thread's next session, conserved in place.
  `claude/nifty-ramanujan-7b1623` — PR #319, owner-ruled paused in place.

## Corrections of record this sweep produced

1. **Quasar's 2026-07-14 "seven unpushed branches" audit is refuted for six of the seven**:
   the spawn-flow pair, both lane-b liveness branches, and the June-era set all landed via
   squash merges (PRs #270/#272/#273/#275 and the containment proofs above); squash merging
   hid the patch-ids from the original audit's method. Only
   `docs/graph-team-direction-2026-06-10` carried unconserved substance.
2. **The repo-continuity "archived as tag `archive/graph-tooling-tidyup`" claim was false**
   (no such tag existed anywhere) — but superseded by a stronger proof: the branch tip WAS
   merged PR #131's head. The false conservation claim is worth remembering: a recorded
   "archived as X" is a hypothesis until X is verified to exist.
3. **The original bulk-push rejection** ("push declined due to repository rule violations",
   2026-07-14) is best explained as a protected ref included in an atomic batch push — no
   ruleset matches feature-branch names. The `remediate-main-*` rejection is a different,
   still-unexplained rule surface invisible to agent tokens.

## Recoverability

Every deleted local tip's SHA was recorded before deletion (session scratchpad + the comms
broadcast "Residue disposition sweep EXECUTED", 2026-07-15). Deleting a branch also deletes
that branch's own reflog, so recovery relies on those recorded object IDs: they can restore
a tip while the now-unreachable commit objects remain in the local object database (until a
future `git gc` prunes them per `gc.pruneExpire`), plus `HEAD`'s reflog for tips recently
checked out. The stash drops printed their SHAs at drop time; all four
matched the pre-deletion map.
