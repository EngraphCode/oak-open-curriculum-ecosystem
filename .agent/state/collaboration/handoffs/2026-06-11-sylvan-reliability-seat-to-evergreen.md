# Seat handover: Sylvan Branching Pollen (89f3b3) → Evergreen Budding Sapling (1e6b10)

- **Date**: 2026-06-11 (~08:25Z)
- **Kind**: full seat handover at a natural boundary (owner-directed ~08:14Z, relayed +
  cited on the ARC channel; NOT a PDR-063 mid-cycle freeze — no WIP exists)
- **Seat**: reliability micro-queue implementer (Director routings `c87340f6` + `fbbe9f74`)
- **Closing claims**: `19136ff2` (closed at #166 merge), `66881c6a` (closed at #167 merge);
  ZERO retained

## Current edit state

None. No uncommitted work anywhere. Both my branches are merged and their worktree
(`oak-wt-umbral-g4`) is clean at `fix/graph-corpus-edge-types-predicate` = `d7f5d0de`
(merged into main at `82d57b4d`); the worktree is ADOPTABLE — pull main and cut the next
branch off `origin/main` per the team opener's worktree-adoption clause.

## Per-item state (the whole queue)

| Item | State | Evidence |
| --- | --- | --- |
| 1 loud-write fixes | DELIVERED | PR #166 merged `adddc1bb`; cures silent-success on 8 writing subcommands, silent no-op on unmatched claim ids, and the wholly-broken conversation/escalation `--file` surface (failure-mode event `40a6ce09`) |
| 2 rebuild verification | DELIVERED | Coordination home rebuilt from merged main (Director tree action `898a0ac4`/`ae1802da1`); loud tokens + #157 hardening flags + exit-2 no-match all verified first-hand on the installed dist; supersession broadcast `bbb1c8ed` — the portable-watcher caution is RETIRED |
| 3a lifecycle-lease flake | YOURS, GO | Director explicit GO (~08:20Z event); your real-timer-race finding stands; surface oak-search-sdk |
| 3b scopes_supported flake | YOURS, executing | your claim `ac7ff0ad`; disposition + tee cure Director-approved |
| 4 test:e2e turbo env | YOURS | per the approved split; #160's PR carries the cured class's proofs |
| 5 AGGREGATED_TOOL_ORDER | OPEN, gated | starts only after the G4b PR merges (Seaworthy Surfing Compass mid-cycle); re-derive the missing-tool set at execution; guard test so new aggregated tools cannot silently miss the array |
| 6 EDGE_TYPES predicate | DELIVERED | PR #167 merged `82d57b4d`; type-expert verdict SAFE (canonical ADR-153 form) |

## In-flight reasoning

- **Item 5 collision shape**: G4b adds its tool name to the same `AGGREGATED_TOOL_ORDER`
  array your item-5 PR completes — the one-line conflict is why it gates on their merge.
  Sequence, never race.
- **Director-queue candidate (routed, not yours unless routed to you)**: the emitted
  `EDGE_TYPES` tuple and the hand-written `GraphCorpusEdgeType` union
  (`graph-corpus-types.ts:83-87`) are parallel-maintained — silent drift if the edge
  vocabulary grows. Cure shape in event `9d35369a` (generator-internal constant, type
  derived via `typeof EDGE_TYPES[number]`, template reads the constant at generation
  time). The Director holds it.
- **vocab-gen regen noise**: a no-op `pnpm vocab-gen` always churns four `generatedAt`
  timestamp lines (graph-corpus/nc-coverage-graph/vocabulary-graph data.json +
  definition-synonyms.ts). Write-forward HEAD's content over them (`git show HEAD:<path> >
  <path>`) to keep PRs pure; vocab-gen remains ungated (standing napkin item).

## Decisions made

- Loud-token shapes follow the `comms direct` model verbatim (`wrote comms event <id> to
  <path>`); no-match failures are thrown INSIDE the transactional transform so no write
  ever happens on a miss (per-retry semantics documented on `assertClaimMatches`).
- Conversation/escalation `--file` resolves from the parsed repeatable `files` array
  (exactly one), not the values map.
- ARC channel conventions adopted mid-experiment: timestamp headers over turn numbers
  (collision-proof), COPY-not-rewrite for conservation passes (a live-channel rewrite
  replays every follower's tail), first-broadcast-establishes-context for channel races.

## Decisions deferred

- ARC owner synthesis: three frictions + two benefits logged as tagged channel turns
  (channel-open race / turn-number collision / non-append rewrite replay; ~3-min
  negotiation latency / safe owner-authority relay via citation). You hold the
  conservation lane; the synthesis duty travels with the seat.
- Item 5's owner is "whoever is free at the G4b-merge gate, declared on ARC first" — now
  effectively you unless the Director routes otherwise.

## Monitors and environment

- My monitors stop at closeout (comms watcher, ARC tail, heartbeat). The PR monitors
  exited at their merges. Re-arm your own; the canonical `comms watch` CLI is now safe
  (supersession `bbb1c8ed`).
- `oak-wt-umbral-g4`: clean, built, adoptable. The coordination home's agent-tools dist is
  freshly built from main — your CLI calls get loud writes from here on.
