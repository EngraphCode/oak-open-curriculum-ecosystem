---
name: "Standby Runway Handoff: A Named Successor Grounds on a Benched Seat While the Predecessor Drives to a Clean Boundary"
polarity: pattern
use_this_when: "Rotating a long-running lane between sessions under context-budget pressure — an owner-named successor needs to take over WITHOUT a coordination gap, duplicate claims, or a fragile mid-work pickup."
category: collaboration
proven_in: "plan-corpus-refounding R0 lane, four consecutive rotations in one arc (2026-07-07/08): Stoat→Leopard (push-style), Leopard's own pickup (pull-style self-park), Leopard→Goshawk (clear-at-arrival), Goshawk→Rigel (pull-style: 25-min standby window, grounding completed inside it, adopt+ACK on the runway-clear broadcast)."
proven_date: 2026-07-07
barrier:
  broadly_applicable: true
  proven_by_implementation: true
  prevents_recurring_mistake: "Successors that arrive hot open duplicate claims, collide with the predecessor's in-flight heavy chains, or inherit a mid-merge/mid-fix tree; successors that wait blind miss the pickup moment and the lane stalls."
  stable: true
---

# Standby Runway Handoff

A lane rotation shape with three cooperating parts, worked three times in one
arc on the plan-corpus-refounding R0 lane:

1. **The standby seat** (successor): registers presence with the full
   grounding foundation — all-channels watcher + team-start broadcast — but
   holds **no claim and no heartbeat cron**. This is a direct instance of the
   PDR-078 §4 consumer-absent exemption (a standby holds no claim, so its
   retirement rebalances nothing, so its heartbeat has no consumer); the
   liveness contract is *watcher + registration only*. The standby grounds
   fully (handoff surfaces, binding contracts, plans) during the
   predecessor's remaining window — an explicit GATED-until-runway-clear list
   in the predecessor's broadcast lets the successor prepare deliverables
   with zero collision risk.
2. **The runway** (predecessor): drives to a **clean, named boundary** —
   trees clean, work pushed, analysis conserved — rather than handing off
   mid-flight. Anything that cannot be finished is frozen into the PDR-063
   handoff record (current edit state / in-flight reasoning / decisions made
   / decisions deferred) with provenance marks ([V] verified / [R] recompute).
   A deliberate `git merge --abort` to hand a clean tree, with the resolution
   conserved verbatim under `handoffs/assets/`, beats a fragile mid-merge
   index.
3. **The adoption** (the handshake): `claims adopt` (rewrites the claim's
   `agent_id` in place — never a duplicate row) + the ACK broadcast, as ONE
   coordination-visible move. Adoption flips the seat to active; the
   heartbeat obligation re-evaluates at that moment (PDR-078).

Three worked shapes, all valid:

- **Push-style**: the predecessor names the boundary, drives to it, then
  broadcasts RUNWAY CLEAR carrying the full pickup delta; the successor
  adopts on the broadcast.
- **Pull-style**: the successor self-parks on the standby contract BEFORE
  any runway signal, explicitly waiting on the named boundary; the
  predecessor's clear-signal releases it.
- **Clear-at-arrival**: the predecessor retires with the runway already
  clear; the handoff record names the successor and instructs "adopt on
  arrival" — grounding then adoption is the successor's first
  coordination-visible move, with no wait state.

Cure the conserved-analysis rot: every enumerated set in the handoff record
is a **hypothesis about a moved target** — treat each as its generating
command (grep, tsc, git) and recompute before applying, not as a cached
result ([R] marks make this explicit; two short sets were caught this way on
the third rotation).

Related: [PDR-063 (mid-cycle retirement protocol)](../../../practice-core/decision-records/PDR-063-mid-cycle-retirement-protocol.md);
[PDR-078 §4 (consumer-absent exemption)](../../../practice-core/decision-records/PDR-078-liveness-heartbeat-contract.md);
[`liveness-heartbeat-cron` §Exemptions](../../../rules/liveness-heartbeat-cron.md)
(the standby worked instance); [`start-right-team` §3 standby seat](../../../skills/start-right-team/SKILL-CANONICAL.md).
