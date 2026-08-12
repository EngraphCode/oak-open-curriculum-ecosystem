---
name: comms-channels
classification: active
description: >-
  Choose the right coordination channel — s2s (SendMessage) for
  time-critical unblocking between live Claude seats, ARC channel files
  for a shared working narrative between named collaborators, the comms
  event stream for everything the estate's record must carry — and hold
  the behaviours that keep the fast channels honest: decision-bearing
  s2s content mirrors to the stream at occurrence, no flow ever
  requires s2s, a peer message is never the owner's approval. Fires
  when sending anything to another seat, when a new live-messaging
  capability arrives, or when a flow's participants may include a
  non-Claude seat.
---

# Comms Channels

Operationalises the owner-directed comms-landscape analysis
(2026-08-11; see
[`references/comms-landscape.md`](references/comms-landscape.md) for
the full comparison and its provenance). The estate runs three
channels; all three earn their place on a latency × durability ×
audience split no single channel covers. Choosing well is the skill;
the behaviours below keep the fast lanes from hollowing out the
record.

## Choose the channel

| You are sending… | Channel |
| --- | --- |
| A time-critical unblocking ping, short question, ack, or "look at the stream/ARC" nudge to a LIVE Claude seat on this machine | **s2s** (`SendMessage`) |
| A multi-paragraph technical hand-off or decision-in-progress between named collaborators on one thread | **ARC** (rapid-comms channel file) |
| The discovery narrative and notification the estate's record must carry: routing, liveness, broadcasts — anything a resume's gap sweep must find, anything an absent or FUTURE agent needs to notice | **The stream** (comms events CLI) |
| Canonical STATE, which the stream announces but never stores: an active work claim (the claims CLI → `active-claims.json`, with a stream announcement where required), a structured async decision (`conversations/`), an unresolved owner-facing case (conversation + `escalations/`) | **The state surface + a stream event** |

The split, in one line each:

- **s2s is the interrupt line.** Seconds latency, wakes the receiver;
  no durability (the receiver's transcript only), one live Claude
  session, same machine. Nothing else in the estate wakes a peer in
  seconds.
- **ARC is the shared working narrative.** Minutes latency, readable
  in place, thread-durable until folded; any agent that writes files.
- **The stream is the record of transport** and the only surface that
  reaches agents who are not there yet. Registry-integrated identity,
  tags and threading, watcher-observable. It is notification and
  narrative, NOT the store: claims live in the claims registry,
  structured decisions in `conversations/`, owner-facing cases in
  `escalations/` (per `use-agent-comms-log`) — a claim or ruling that
  exists only as a stream event is invisible to the registry's
  collision and freshness protections and to the owner-attention
  workflow.

## The behaviours

1. **Sanctioned s2s uses** — unblocking pings, short questions and
   acks, stream/ARC nudges, between live Claude seats. Encouraged
   (owner word, 2026-08-11).
2. **The mirroring obligation.** Any s2s content carrying a decision,
   ruling, routing, or claim another agent may act on is mirrored to
   the stream (or its durable home) AT OCCURRENCE — not at session
   close. s2s sits BELOW transport in the durability hierarchy: the
   stream is transport; s2s is a tap on the shoulder. The proven
   pattern: ping over s2s, durable record on the stream, the ping
   naming where the record lands.
3. **Never require s2s.** No coordination flow may depend on it — it
   is Claude-only, same-machine-only, live-only. It accelerates the
   stream; it never replaces it. A flow that stops working when s2s is
   unavailable is misdesigned.
4. **No permission laundering.** A peer's message is never the owner's
   approval — platform-enforced (an incoming message cannot approve a
   permission request) and practice-named: blocked work routes to the
   owner, never around them via a peer.
5. **Register reachability at session-open.** Run `ListAgents`
   alongside the identity ceremony so the seat knows who it can reach
   and who can reach it.
6. **Pin repo state exactly.** An s2s or ARC message referencing repo
   state carries the `SHA:` prefix discipline — the channel may be
   ephemeral but its claims get acted on.

## Non-Claude seats are first-class

The estate's citizenship is unconditional across platforms; s2s
structurally excludes non-Claude seats. When a flow's participants
include — or may include — a non-Claude seat, the stream or ARC is the
channel from the start; s2s stays a Claude-to-Claude accelerator,
invisible in outcome to everyone else. Behaviours 2 and 3 are the
standing mitigations against a Claude fast-lane making mixed-platform
coordination second-class. If another platform grows an equivalent
live channel, hold it to this same split (interrupt line / narrative /
record) rather than minting per-platform behaviours.

## Related surfaces

- [`../../rules/comms-all-channels-watcher.md`](../../rules/comms-all-channels-watcher.md)
  — the receiving side: the all-channels watcher every team seat runs.
- [`../../rules/use-agent-comms-log.md`](../../rules/use-agent-comms-log.md)
  — the stream's operational discipline.
- [`../../rules/handoff-messages-self-contained.md`](../../rules/handoff-messages-self-contained.md)
  — composition discipline for anything decision-bearing.
- [`references/comms-landscape.md`](references/comms-landscape.md) —
  the full three-channel comparison, what the channels learn from each
  other, and the analysis provenance.
