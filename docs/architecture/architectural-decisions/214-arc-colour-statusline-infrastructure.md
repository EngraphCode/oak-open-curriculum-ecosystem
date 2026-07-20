# ADR-214: ARC-Colour Statusline Infrastructure

- **Status:** Proposed (drafted 2026-07-20; owner direction 2026-07-20 — bring castr's
  ARC feather system and the usage relocation into oak as one coherent estate)
- **Relates to:** [ADR-183](183-comms-event-tag-namespace-substrate.md) (comms-event tag
  namespace), [ADR-186](186-comms-event-heartbeat-lifecycle-substrate.md) (heartbeat
  lifecycle substrate), PDR-111 (agent experience is first-class), PDR-027 (threads,
  sessions, and agent identity), the canonical ARC protocol reference at
  `.agent/reference/arc-rapid-communication.md`, and `principles.md` §Core Rules (no
  backwards compatibility, no legacy surfaces, consolidate-at-second-consumer)

## Context

The agent statusline is the estate's always-on glance surface (PDR-111). Today it signals
ArcAngel rapid-comms liveness as a single boolean wing derived from filename-substring
matching — a mechanism with a recorded false-negative class (short-slug channels, dark
wings) whose structural cure the ARC reference doc has tracked since 2026-06. Castr
(a sibling Practice estate) built that cure: per-channel identity-coloured feather badges,
where each channel file records its own colour index and roster, and the statusline
projects them per tick.

The rapid-comms channel corpus is a shared cross-host surface — castr sessions read the
same channel files — so its shape is a grammar shared between estates, not a per-consumer
convention. The adopted feather design's upstream source is
[castr PR #22](https://github.com/EngraphCode/castr/pull/22) (the feather/ARC estate)
with [castr PR #29](https://github.com/EngraphCode/castr/pull/29) (gauge relabelling),
both merged to [`EngraphCode/castr`](https://github.com/EngraphCode/castr) main
2026-07-20.

## Decision

1. **A canonical ARC channel grammar module is the single schema authority for channel
   shape.** Shared ARC constants (palette size, active-window seconds) single-home in the
   grammar; every consumer imports them and never redeclares
   (consolidate-at-second-consumer). Channel parsing, colour resolution, roster
   derivation, cross-host detection, and strictness evaluation are grammar functions, not
   per-consumer re-derivations.
2. **Feather colour is a projection of parsed channel content, never decoration.** A
   channel's colour is the index recorded in the channel file at channel-open; the
   statusline renders what the corpus records. There is no colourless fallback rendering
   and no hash-derived colour: a feather without a recorded index is an invalid-state
   signal, rendered as such.
3. **The historical corpus is repaired in place.** Every tracked channel file is conformed
   to the grammar — no grandfather window, no exclusion list, no fallback reader for
   legacy shapes (`principles.md`: no legacy surfaces).
4. **A corpus validator lands with the grammar and fails loud.** The grammar's strictness
   surface exists only through its validator; the two land together (no dead code). The
   validator targets the canonical rapid-comms surface and fails loudly when it is absent
   or invalid. Its wiring into the estate's blocking validator gate lands atomically with
   the corpus repair, so no commit window carries a red gate over an unrepaired corpus.
5. **The strict tier preserves the protocol's protected zero-per-message-ceremony
   property.** All grammar obligations attach at channel-open (one colour-index line, one
   header) and to entry timestamps the protocol already requires; no per-message field,
   tag, or schema is introduced. Strictness formalises what entries already carry rather
   than adding ceremony the reference doc's protected property forbids.

## Consequences

- The statusline gains multi-channel, identity-coloured liveness with cross-host and
  invalid/overflow states, replacing the boolean wing and its false-negative class.
- The channel corpus becomes machine-validated shared state: colour and roster mean the
  same thing to every estate that reads it, and drift fails the gate instead of silently
  mis-rendering.
- The per-tick gatherer moves from two cheap reads to bounded content reads; the read
  caps and membership-first ranking from the source design are load-bearing
  (`no-unbounded-host-load`) and travel with the port.
- Channel-open gains one obligation: recording a colour index. The convention is
  documented in the canonical ARC reference doc, which is extended — not replaced — and
  its falsified wing-detection sections repaired in the same delivery.
- The oak-local active-window constant is deleted in favour of the grammar import; oak's
  identity-prefix rendering (the PDR-125 clause-5 cross-estate join key) is preserved through the
  port.

Implementation sequencing, file paths, CLI shapes, and acceptance proofs live in the
executable planning surface of the delivery that cites this record; this record owns the
decision only.
