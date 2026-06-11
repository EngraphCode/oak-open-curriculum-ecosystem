---
tier: reference
---

# ARC — Agents Rapid Communication (and Gellings)

A low-latency, low-ceremony peer dialogue channel for live multi-agent
sessions: a shared append-only markdown file that each participant tails.
ARC complements the canonical comms-event stream; it never replaces it.
This document is the tracked home for the protocol, its conventions, and
the evaluation evidence (conserved from the live experiment channel on
2026-06-11, owner-directed).

## Protocol

- **A channel is one append-only markdown file.** Participants append
  entries; nobody ever edits a prior entry. Retractions and corrections
  are new entries that name what they retract.
- **Channel files live under `.agent/state/collaboration/experiments/`**,
  whose `.gitignore` excludes everything by default and then explicitly
  re-includes the durable record (currently the founding channel's
  README). A re-included channel file is TRACKED — its live-append churn
  sits as uncommitted working-tree modification and is committed only at
  conservation waypoints. A channel file that is not re-included is
  genuinely gitignored: durable in the working copy for the session,
  never committed. Either way, durable substance MUST be conserved to
  canonical homes before session end (see §Conventions,
  conserve-at-close) — tracking is not conservation.
- **Each participant tails the file** with a persistent watcher:

  ```bash
  tail -n 0 -F <absolute-path-to-channel-file>
  ```

  Observed delivery latency is seconds (~15s worst case with a polling
  wrapper). Always use the absolute path of the ONE shared channel file —
  worktree-relative paths silently retarget to the wrong tree (the same
  trap as relative `--comms-dir`).
- **Entry shape**:

  ```text
  ## [<Name> <prefix>] <ISO-8601 UTC timestamp> — <subject>

  <message body — any length, full markdown>

  — <Name> (<prefix>)
  ```

  Identity is the PDR-027 tuple by convention (name + session prefix in
  the header and signature). Timestamps replace turn numbers: concurrent
  appenders collide on turn numbers (observed 2026-06-11, two "turn 51"s);
  file position plus timestamp orders entries unambiguously.

## Conventions

1. **One channel per pairing (or grouping) per topic, in a dated file** —
   `YYYY-MM-DD-<topic-slug>-<name-a>-<name-b>.md`. A single shared file
   accreted three pairs' history (70KB) and taxed every new pair with all
   prior pairs' context; per-pair files cure this and the
   channel-discovery race below.
2. **Announce the channel with exactly ONE canonical comms event** at
   open, before the first substantive entry, naming the absolute file
   path and the participants. The canonical stream is the discovery
   index; the rapid channel cannot announce its own existence. (Observed
   failure modes: two agents opened channels simultaneously at ~07:50Z
   2026-06-11 — cured by first-broadcast-establishes-context; an agent
   missed three entries in 2026-05-27 after a channel moved paths.)
3. **Conserve-at-close.** ARC is working memory. Decisions, recon,
   verdicts, and insights fold into their canonical homes (handoff
   records, thread records, reports, reference docs) before the session
   ends. Precedents: the 2026-05-27 owner-rescued sidebar backup into
   `sidebars/`; research persisted as a tracked file because the channel
   could not hold it durably.
4. **Dialogue only — never state.** Claims, heartbeats, commit intents,
   and owner gates live on their canonical surfaces. An ARC promise is
   not a registration (observed benignly: a promised claim declaration
   never landed on-channel while the registry correctly led).
5. **Identity and honesty disciplines carry over unchanged** — full name
   + prefix on every entry, retractions by new entry, critical assessment
   of peer claims before acting on them.

## Evaluation evidence (as of 2026-06-11)

Four arcs observed: a driver/reviewer commit-cycle collaboration
(2026-05-27, turns 20–43 of the founding channel), a research handover
with corrections (2026-05-28, turns 44–49), a work-split negotiation plus
recon handover (2026-06-11), and the owner-directed handover coordination
that followed.

**Measured benefits:**

- Proposal → full acceptance round-trip in under 4 minutes with the peer
  mid-gates; the same negotiation shape over canonical comms events was
  measured at 10–15 minutes the same day (Sylvan Branching Pollen's
  measurement).
- No size ceiling: a multi-section recon handover travelled whole; the
  comms CLI's 1500-character body limit cannot carry that.
- Whole-history-in-one-read suits design dialogue and review cycles; the
  founding arc ran complete commit-review rounds on-channel.
- Zero per-message ceremony — no schema, no identity preflight per entry.
  This property is plausibly load-bearing for the latency benefit;
  protect it when extending the mechanism.
- Owner-authority relay works when cited: an owner direction relayed
  on-channel reached the peer in ~15 seconds with zero coordinator
  round-trip, and was safe to act on because the entry cited the owner
  turn it relayed. The citation discipline (`gates must be citable`) is
  what makes authority-bearing content legitimate on a peer channel.

**Known limitations (with worked instances):**

- Bootstrap depends on the canonical stream (pointer events) — ARC is a
  complement by construction.
- Append atomicity is unguaranteed (no corruption observed at n=2
  frequency; unproven under contention).
- Cross-machine durability is nil for un-re-included channel files
  (gitignored) and waypoint-grained at best for the tracked founding
  channel; conserve-at-close is the cure, and it is a discipline, not a
  mechanism.
- No tags/schema: failure-mode tagging and watcher render tokens are
  unavailable on-channel; substance needing those belongs on the
  canonical stream.
- **Non-append writes reset every follower.** `tail -F` treats an inode
  swap or truncate-and-rewrite as rotation and replays the entire file
  into every follower's context (observed live 2026-06-11 ~08:16Z, both
  participants' tails flooded; content intact). The liveness contract
  assumes strictly append-only writes (`>>`). Convention: conservation,
  backup, or normalisation passes COPY the channel file elsewhere and
  never rewrite it in place; editing tools that write whole files are
  unsafe on a live channel.

**Named triggers for mechanism-level work** (do not build ahead of
these; the zero-ceremony property is the thing to protect):

- First n≥3 group channel ("gellings") — group dynamics, addressing, and
  read-cursor questions are all unobserved.
- First observed interleaved/corrupted append under real contention —
  then consider a CLI-mediated append.
- First cross-platform pairing (Codex or Cursor seat) — tail/append
  ergonomics differ.

## Spinning up an n≥3 channel (untested guidance)

Apply the conventions above plus: one dated file for the group; the
announce event lists every participant tuple; every participant tails the
same absolute path; first-broadcast-establishes-context resolves any
opening race; expect the unobserved questions (threading, addressing,
quorum on proposals with deadlines) to surface — capture them as
evaluation notes and fold them back into this document.

## Relationship to the canonical channels

In the routing card
([`agent-collaboration-channels.md`](../memory/executive/agent-collaboration-channels.md))
ARC sits beside channel 4 (sidebars): it is operationally a standalone,
rapid, file-backed sidebar. Use a decision thread / sidebar when the
exchange must be durable and structured from the start; use ARC when
latency and bandwidth dominate and the substance will be conserved at
close.
