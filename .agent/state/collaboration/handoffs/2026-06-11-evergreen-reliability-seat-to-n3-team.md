# Seat handover: Evergreen Budding Sapling (1e6b10) → the n=3 ARC successor team

- **Date**: 2026-06-11 (~09:05Z)
- **Kind**: full seat handover at an owner-directed boundary (owner ~08:58Z: "prioritise
  handing off to the three agent team"; earlier owner turn ~08:55Z defines the team's brief:
  pick up this thread AND continue the ARC experiment + observation at n=3)
- **To**: Oceanic Flowing Harbour (`e05bf4`), Seaworthy Fathoming Pier (`4a1b92`),
  Hushed Watching Night (`999f69`) — coordinate your own boundary split on your channel
  (`experiments/2026-06-11-reliability-stream-n3.md`, announce event `88ee48bb`)
- **From-identity**: Evergreen Budding Sapling / claude / Fable 5 / 1e6b10 /
  id d77be07d-b00f-56db-8806-d51629769cc1
- **Closing claims**: `ac7ff0ad` (3b — Director-approved disposition discharged),
  `9956c979` (item 4 — PR #168 MERGED), `e7f1d978` (ARC docs — PR #169 open, duty transfers),
  `abbc5d7a` (3a — PR open at handover, duty transfers). ZERO retained.
- **Director**: Ethereal Orbiting Eclipse (`f92636`) at handover; a SIXTH-holder succession to
  Sunlit Waxing Asteroid (`14a56a`) is mid-choreography (their Moment-1 ask `f44ce78d`,
  deadline 09:20Z) — VERIFY the live holder before routing asks.

## Current edit state

No uncommitted work anywhere. Worktree `oak-wt-evergreen-rel` is clean; three branches, all
pushed: `build/turbo-test-e2e-env` (merged via #168), `docs/arc-protocol-reference` (PR #169
open), `fix/lifecycle-lease-timer-race` (PR opening at handover — check
`gh pr list --head fix/lifecycle-lease-timer-race`; the push was in flight when this record
froze; if no PR exists, open it — the body text is in the comms stream and the branch is
self-contained). The worktree is ADOPTABLE; or cut fresh worktrees off origin/main per the
team opener. Do NOT touch `oak-wt-airy-g` (G4b seat, live contention being resolved between
Seaworthy Surfing Compass and Cindery Forging Volcano) or `oak-wt-umbral-g4` (idle, was
Sylvan's).

## Per-item state (the whole reliability queue)

| Item | State | Evidence / next action |
| --- | --- | --- |
| 1 loud-write fixes | DELIVERED (Sylvan) | PR #166 merged |
| 2 rebuild verification | DELIVERED (Sylvan) | supersession `bbb1c8ed`; canonical comms watch CLI is safe to use |
| 3a lifecycle-lease flake | CURED, PR OPEN | branch `fix/lifecycle-lease-timer-race`, 2 commits: causal-gate test rewrite (RED proven by forcing the one-renewal window; GREEN 5/5 under 14-core saturation) + fail-closed gate tee. **Monitor-to-merge transfers to you**: watch checks AND review comments, adjudicate first-hand, Director-serialised merge |
| 3b scopes_supported flake | CLOSED unconfirmed-with-dossier | Director-approved (`e6bc0cdb`); 41 repro runs across three load regimes, "same class as 3a" REFUTED (no timers); dossier in comms `6beeb9bf`; the tee cure (rides the 3a PR) is the structural remainder. If it recurs: `.turbo/last-gate.log` now preserves the evidence — characterise from there |
| 4 test:e2e turbo env | DELIVERED | PR #168 merged `13b99bd2` |
| 5 AGGREGATED_TOOL_ORDER | OPEN, GATED on the G4b merge | G4b seat is mid-rotation (Seaworthy → Cindery at the c2 boundary, Director ruling `6e74ccd5`). At the G4b merge: re-derive the missing-tool set fresh, add a guard test so new aggregated tools cannot silently miss the array; the one-line collision with G4b's tool-name addition is WHY it gates — sequence, never race. Declare the owner on your channel first |
| 6 EDGE_TYPES predicate | DELIVERED (Sylvan) | PR #167 merged |
| ARC reference doc | PR #169 OPEN | Both review findings applied + pushed (`4d6f46b6f`); REPLY-WITH-VERDICTS on the two PR comments is still owed (verdicts: both VALID, both applied; finding 1 also resolved by merge sequencing — the Director lands the transcript-backup waypoint before merging). **Monitor-to-merge transfers to you** |

## In-flight reasoning

- **Reviewer conditions on the 3a PR (non-blocking, recorded follow-ons)**: (a) extract a
  `gateOnNthRenewalIssue` helper in `lifecycle-lease.integration.test.ts` — the gate pattern
  appears 3×, consolidate-at-third-consumer; (b) when `startRenewalLoop` gains an injectable
  observation seam, simplify the counting mocks to injected fakes; (c) `pnpm lint:shell` does
  not lint `.husky/pre-commit` itself — structural gap, route to the Director queue.
- **Red-gate near-miss disclosure (already in the 3a PR body)**: the naive tee shape silently
  inverted the gate under husky's `sh -e`; one red commit landed locally, was caught via the
  teed log, amended green before push. The committed shape is fail-closed and proven three
  ways under `sh -e`. A failure-mode comms event for this is still owed — post it (Observation
  / Diagnosis / Cure / Pointer; pointer = the 3a PR body + this record).
- **The vitest-vs-codegen race** (distinct defect found during 3b reproduction): an
  out-of-band `vitest run` racing a turbo run that rewrites `generated/**` fails with
  Cannot-find-module. It joined the Director's queue (`e6bc0cdb`). Practice cure: don't run
  out-of-band single-file tests while a turbo invocation is live in the same tree.
- **Item 5 design note**: re-derive the missing-tool set at execution start — do not trust
  any stale enumeration, including this record.

## Decisions made (cite, don't re-open)

- 3a cure is causal-gating anchored to the renewal loop's single-in-flight invariant —
  test-expert ratified it as contract-anchoring, not implementation-coupling. The production
  code was always correct; test-only fix.
- 3b closure shape: unconfirmed-with-dossier + structural evidence preservation (never let a
  flake signal vanish on a re-run again). Director-approved.
- Item 4: removal (not `env` declaration) was correct — e2e is hermetic; `globalPassThroughEnv`
  is the single passthrough home (config-expert ratified; #168 merged).
- ARC conventions hardened this session: per-pair dated files; ONE canonical announce event;
  ISO-timestamp headers (turn numbers collide); conserve-at-close; dialogue-only scope;
  strictly append-only writes (a non-append rewrite replays every follower's tail).

## Decisions deferred

- The three reviewer follow-ons above (non-blocking).
- The prerequisiteFor-multiplicity and EDGE_TYPES derive-don't-parallel items sit in the
  DIRECTOR's queue, not this seat's — do not absorb without routing.

## The n=3 brief (what the owner asked your team to do)

1. **Pick up this thread**: the reliability seat as inventoried above — two open PRs to
   monitor-to-merge (3a + #169, including the owed #169 comment replies), item 5 at its gate,
   the failure-mode event to post, and the reviewer follow-ons as your first natural cycles.
2. **Continue the ARC experiment at n=3**: run your team's coordination ON your ARC channel
   (`2026-06-11-reliability-stream-n3.md`) and OBSERVE the protocol as you work. The tracked
   protocol + conventions + the n≥3 open questions are in PR #169's
   `.agent/reference/arc-rapid-communication.md` (read it from the branch until merged). The
   named unobserved questions your usage answers: group addressing (how do you direct an entry
   to one of three?), read-cursor discipline (does everyone tail everything?), proposal quorum
   (deadline+default with three voices), channel-race behaviour at n=3, append contention at
   higher frequency. Capture observations AS YOU GO (tagged entries on the channel, the
   `[friction] #N` / `[benefit] #N` convention from the founding channel), and conserve them
   at your closeout into the reference doc (it is the durable home; extend it via PR).
3. **State discipline unchanged**: claims/heartbeats/owner-gates on canonical surfaces with
   absolute paths into the coordination home; ARC carries dialogue only; merges
   Director-serialised; verify the live Director first (succession mid-flight).

## Monitors and environment

- My monitors stop at closeout: all-channels comms watcher, two PR monitors, heartbeat loop.
  Re-arm your own — the canonical `comms watch` CLI is safe (supersession `bbb1c8ed`).
- The coordination home's agent-tools dist is freshly built from main: loud write tokens on
  every CLI write — verify the token AND its destination path on every comms/claims call.
- `.turbo/last-gate.log` + `.turbo/last-gate.status` (gitignored, per-worktree) now preserve
  every pre-commit gate run once the 3a PR merges — read them before re-running any red gate.
