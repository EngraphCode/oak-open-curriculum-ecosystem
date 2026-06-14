# PDR-063 handoff — Clipper wakes Atoll (de1f79) → Gull spins Stratus (WS7 / comms-rotation)

**Pre-positioning record** (PDR-063 / ADR-182). Owner-directed 2026-06-14: Gull spins Stratus is the
eventual successor to complete the comms-research work (WS7). Gull is NOT yet active — authority/claim
transfer happens when Gull broadcasts active-acknowledgement. Self-contained — read end-to-end before any
WS7 edit (First Moves move 7).

**Claims**: `c8f0425f` (owner-directed #7 doc cures) CLOSED — landed `92bf05764`. `3b56cb4d` (WS7 Phase 2,
role peer) RETAINED for you; release if not picked up within a reasonable window. **Branch**:
`feat/comms-research`, fully pushed (origin == HEAD, ahead 0).

## 1. Current state (verified first-hand 2026-06-14)

- **WS0–WS6 COMPLETE + ratified** (PDR-094 portable + ADR-199 phenotype) + consolidated (Juno, 2026-06-13).
- **WS7 Phase 1 LANDED** (`6d1e45f35`): 5 schemas → `agent-tools/src/collaboration-state/schemas/`,
  validator decoupled (repo-root-relative, works tsx + dist), readers repointed, the (b) ArcAngel wing-fix
  (`statusline-identity.ts listExperiments` → `rapid-comms`). CLI acid-tested working.
- **#7 ArcAngel comms-doc cures LANDED** (`92bf05764`).
- **Remaining: WS7 Phase 2 / 3 / 4.** `comms-archive/` exists but is NOT yet gitignored (a real
  sequencing gap — a plain `mv` would track ~5,000 events until Phase 3). `experiments/` still at
  `.agent/state/collaboration/experiments/` (relocation deferred to Phase 3). 5,491 tracked files under
  `.agent/state/`.
- **Corpus = 5,290 events**: 2,464 heartbeat-tagged (~47%), 346 research-precious (failure-mode /
  behaviour-note), ~2,480 coordination/other.
- **Provenance scope = 9 cited live events** in permanent docs: 3 already inline-quoted in ADR-199
  (`2ff03ded`, `3cc1fb93`, `86e94e54`); **6 uncovered** needing a tracked digest entry: `02fa64cf`,
  `1e2c83eb`, `5fbf6f92`, `92183937`, `952e329b`, `c7d65a58` (all confirmed live in `comms/`).

## 2. In-flight reasoning / the deep definition-of-done

The **full deep WS7 DoD** is in the machine-local contract `~/.claude/plans/ah-very-good-in-quizzical-whisper.md`.
**Your FIRST WS7 task (boundary principle, below): route that contract's substance into the REPO companion
plan** (`comms-corpus-research-and-rotation-strategy.plan.md`) so it is not orphaned for a non-same-checkout
instance. Key deltas it carries: the comms-archive-gitignore-before-move sequencing fix; body-read
classification of every over-length body (the `3cc1fb93` falsifier — title genre is never sufficient); the
pre-archive-move provenance check authored as a TESTED agent-tools module (not a throwaway script); the
heartbeat-cadence aggregate artefact written BEFORE moving heartbeats; archive-not-delete byte-preservation
check (`count(comms/)+count(archive/) == pre-move`).

## 3. Decisions made (owner-ratified / owner-delegated)

- **The repo/instance content-boundary principle + the atomic-propagation HARD GATE (owner, 2026-06-14).**
  Untracking `.agent/state/` crystallises a repo tier (shared by every clone: memory/docs/ADR/PDR/patterns/
  plans) vs instance tier (one checkout's comms/claims/heartbeats/channels). The untrack removes the
  accidental git safety net, so comms-log knowledge curation into repo-tier homes is MANDATORY, wired into
  the lifecycle skills. **WS7 Phase 3 untrack is UNSAFE unless the obligation lands ATOMICALLY across
  PDR-094 + ADR-199 + the `session-handoff` SKILL + the `consolidate-docs` SKILL + the Phase-3 README** —
  a protocol change recorded only in the decision record but absent from the operational surfaces agents
  read is an invisible half-way broken state. Captured in `distilled.md` + `pending-graduations.md` (DUE).
- **Untrack boundary (owner-delegated to judgment)**: keep tracked = README + `conversations/` +
  `escalations/` (+ lean `sidebars/`); untrack (preserve-on-disk) = `comms/` + `comms-seen/` + claims +
  `shared-comms-log.md` + `comms-archive/` + `comms-draft/` + `handoffs/`; relocate out = schemas/fixtures
  (done) + `experiments/`. Nothing `git rm --cached` until its substance is conserved or preserved-on-disk.

## 4. Decisions deferred / open (for the owner)

- Retention windows per class (heartbeat 48h / coordination 7d / research-precious until-graduated /
  diagnostic immediate-eligible) — confirm or adjust.
- Provenance-check: tested module (recommended) vs throwaway script.
- Provenance scan scope: ADRs/PDRs/patterns (where the 9 were found) vs broaden to `reference/` + `reports/`.
- Confirm the untrack boundary above.
- (RESOLVED by owner: the skill-wiring IS a WS7 completion gate, not a companion tranche.)

## Coordination / monitors

Rosemary lifts Undergrowth (`6f55c7`) holds the comms-research seat + PR #208 push/merge stewardship
(parked on owner go). **The Phase-2 archive-move touches the shared `comms/` dir Rosemary's watcher reads —
coordinate with Rosemary before it.** ArcAngel homes: the 4-way reconcile channel + the Rosemary⇄Clipper
pair channel under `.agent/collaboration/rapid-comms/`. Per the pairing rule, run a canonical comms watcher
alongside any ArcAngel tail. Monitors crash over long idle gaps (owner-flagged) — use a liveness check +
sweep-on-wake, not blind trust (see the `watcher-liveness-self-heal` icebox idea).

## Lessons carried

- A relocation completes its reader-repoint AND rebuild in one window (git-mv-then-pause ENOENT-broke team
  comms mid-flight — Whippoorwill).
- Verify peer/own status via the actual runtime path (dist CLI), not a source-run proxy (tsx) — Whippoorwill.
- Opening an ArcAngel channel ≠ being in standard comms; register on the canonical surfaces (claim +
  team-start + heartbeat) or the registry-driven session-shape shows solo — Clipper.
- A protocol change must propagate atomically to every affected-reader surface, or you get an invisible
  broken state (§3 hard gate; third instance of the pattern this session).
