---
pattern_name: standby-runway-handoff
status: graduated
graduated_at: 2026-07-07
graduated_from: napkin 2026-07-07 entries (Stoat, Leopard, Goshawk R0-lane rotations)
instances: 4
related_directive: ../../directives/agent-collaboration.md
related_rule: ../../rules/liveness-heartbeat-cron.md
---

# Standby Runway Handoff

Use this when rotating a long-running lane between sessions under
context-budget pressure — an owner-named successor takes over WITHOUT a
coordination gap, duplicate claims, or a fragile mid-work pickup. Proven on
the plan-corpus-refounding R0 lane, four consecutive rotations in one arc
(2026-07-07/08): Stoat→Leopard (push-style), Leopard's own pickup
(pull-style self-park), Leopard→Goshawk (clear-at-arrival), Goshawk→Rigel
(pull-style: a 25-minute standby window with grounding completed inside it,
adopt+ACK on the runway-clear broadcast).

A lane rotation shape with three cooperating parts, worked four times in one
arc on the plan-corpus-refounding R0 lane:

1. **The standby seat** (successor): registers presence with the full
   grounding foundation — all-channels watcher + team-start broadcast — but
   holds **no claim and no heartbeat cron**. This is a direct instance of the
   PDR-078 §4 consumer-absent exemption (a standby holds no claim, so its
   retirement rebalances nothing, so its heartbeat has no consumer); the
   liveness contract is *watcher + registration only*. The predecessor is
   not a liveness consumer of the standby: in every worked rotation the
   predecessor tracked the successor via its team-start broadcast and the
   adoption ACK — coordination events, not heartbeat observation — so the
   standby's silence carries no signal anyone consumes; the heartbeat
   obligation re-evaluates the moment the seat flips at adoption. The standby grounds
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

Related: [PDR-063 (mid-cycle retirement protocol)](../../practice-core/decision-records/PDR-063-mid-cycle-retirement-protocol.md);
[PDR-078 §4 (consumer-absent exemption)](../../practice-core/decision-records/PDR-078-liveness-heartbeat-contract.md);
[`liveness-heartbeat-cron` §Exemptions](../../rules/liveness-heartbeat-cron.md)
(the standby worked instance); [`start-right-team` §3 standby seat](../../skills/start-right-team/SKILL-CANONICAL.md).
