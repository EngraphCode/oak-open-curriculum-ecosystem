# Agent-tools architecture: learning promotion and reversal inquiry

**Date:** 2026-08-01

**Author:** Caracal binds Reverie (`019fbd`)

**Status:** Bounded FRAME-1 inquiry; evidence and one decision route, not an
implementation decision or a new Practice contract

**Current-source baseline:** `origin/main` at
`88612fdf647263bbd5750f3e0a1a1977fe05d5d4`. Dated decisions and incident
records establish the lineage and its reasoning; current source establishes the
present phenotype. No people-derived data, runtime event-volume analysis, or
external outcome evidence was collected.

**Companion frame:** _Agent-tools architecture: purpose, effect, and the
negative space_. This inquiry tests whether its proposed capability, effect, and
feedback contracts would change one live decision rather than merely add
another description.

## Direct answer

The liveness-heartbeat lineage shows that this Practice can promote and reverse
learning with unusually good provenance. A first contract was narrowed by
counter-evidence within a day, later amended only after additional worked
instances, and kept its residual uncertainties and falsifiers visible.

The weak link is **closure**, not promotion. Two accepted obligations remain
visible in current doctrine but not in the inspected current implementation:

- suppress a scheduled heartbeat when the same role emitted a substantive event
  within the cadence window; and
- migrate heartbeat events from `narrative + tags: ["heartbeat"]` to
  `lifecycle + event_type='heartbeat'`, with dual-shape consumption until the
  migration closes.

This does not prove that either obligation should now be implemented. It proves
that the current estate does not expose their disposition: enacted,
intentionally deferred with a trigger, or retired because the expected effect no
longer repays the cost.

The one decision-bearing gap is therefore:

> Does the present liveness capability still need these two accepted mitigations
> to achieve its intended human and agent effects? If so, what evidence will
> close them; if not, which decision explicitly retires or revises them?

A single lineage-level disposition review can answer that question. Creating a
universal new governance surface, collecting workplace telemetry, or opening
implementation tickets before that decision would be disproportionate.

## Why this specimen

The purpose-first exploration proposes three architectural contracts:

1. a **capability contract** for mechanism, authority, failure, and recovery;
2. an **effect hypothesis** for beneficiary, intended outcome, harm, cost, and
   assumptions; and
3. a **feedback contract** for signal, provenance, custody, expiry, permissible
   decisions, and missing-data meaning.

That proposal is useful only if it changes a real decision. The
liveness-heartbeat lineage is a strong test because it connects:

- human attention and coordination burden;
- agent mutual awareness, silent retirement, and false confidence;
- portable Practice decisions;
- a repository-bound architecture decision; and
- current TypeScript emit and consume paths.

It also contains counter-evidence and reversals, so the inquiry can test learning
rather than merely find an unimplemented intention.

## Inquiry contract

### Question

Can one consequential lesson be traced from experience through promotion,
counter-evidence, narrowing, implementation, and an explicit recheck or
retirement condition?

### Evidence ceiling

The inquiry uses repository primary sources, git history, current source, and
curated incident evidence. It can judge provenance, decision shape, and
current-source correspondence. It cannot judge present human burden, individual
performance, external adoption, product outcomes, or mission impact.

### Intended impact bridge

- **For people directing work:** retain trustworthy awareness of silent
  retirement and stalled lanes while reducing signals that consume attention but
  change no decision.
- **For agents:** make peer state legible enough to coordinate and recover without
  treating scheduler activity as proof of cognition, or quietness as an automatic
  retirement verdict.
- **For the Practice:** preserve why a rule exists, how contrary evidence narrowed
  it, and when the current phenotype should be rechecked or retired.

### Exit condition

Stop after identifying one decision-bearing gap or establishing that the current
lineage already closes the loop. Do not add a second specimen.

## The lineage

### 1. A portable contract promoted a real failure class

PDR-078 entered git on 2026-05-24 as Candidate in `9725ae094`. Its problem was
not heartbeat absence in the abstract. Silent role retirement had left stale
claims and stale peer assumptions, requiring owner intervention to expose and
reroute work.

The initial contract already held two effects in tension:

- emit at no more than four-minute cadence so quiet or retired roles become
  observable; and
- suppress the next scheduled heartbeat when the same role emitted a substantive
  event within that cadence window, because substantive activity already proves
  liveness and duplicate signals add noise.

It also distinguished quiet-but-legitimate work, named a soft
`retired-pending-confirmation` threshold rather than an automatic verdict, and
made heartbeat volume a falsifier rather than assuming the coordination benefit
would always repay the cost.

This is strong promotion: problem, mechanism, cost, exceptions, and defeat
conditions travelled together.

### 2. Contrary experience narrowed the rule within one day

PDR-082 entered git on 2026-05-25 in `238b3ca83` after the first n=2 session
produced roughly 30 combined heartbeat events per hour and the owner judged the
overhead disproportionate. It proposed dropping heartbeat ceremony where chat
visibility already provided the relevant presence signal, while preserving the
conditions that would falsify the reduced mode.

The lesson was not promoted immediately as a universal team-size rule. The later
amendment in `fc02f28a2` generalised the causal variable to **consumer presence**:
heartbeat emission may pause only when there is no asynchronous consumer for the
signal, and consumer presence re-arms it. PDR-078 records that this change
graduated after two instances and left cadence, redundancy, threshold, and the
heartbeat/substantive category distinction unchanged.

That is strong reversal behaviour. A local cure was challenged, narrowed to its
actual variable, corroborated, and folded back into the original contract without
discarding the original safety purpose.

### 3. Later incidents improved the observe-side model

Subsequent amendments added two important corrections:

- heartbeat-only output can mean `alive-but-stalled-pending-coordination`, because
  a scheduler can continue while the reasoning loop is blocked; and
- retirement remains input to verify through a direct ping and remote
  work-evidence check, never a self-executing verdict.

The current operational rule goes further: it records three autonomous-emitter
instances in which heartbeat loops ran while the reasoning loop was suspended or
wedged. Current `peer-liveness.ts` reinforces the guard in code and comments: its
output is “input-to-verify”, it orders the most stale result first, excludes the
caller, and drops malformed timestamps rather than manufacturing a retired state.

These are not incidental merits. They show that experience continued to change
the capability after the first decision and that the current implementation
protects people and agents from a dangerously simple “heartbeat equals alive”
model.

## Where the trace stops

### Accepted obligation A: emit-side redundancy suppression

PDR-078 §2 says a scheduled heartbeat **MUST** be suppressed after a substantive
event from the same role inside the cadence window. It connects the rule directly
to human and substrate cost, and its falsifiers treat inconsistent suppression or
heartbeat-dominated volume as evidence against the contract.

The current operational rule instead gives a loop that “emits a heartbeat event
each cycle”. The inspected current agent-tools heartbeat path composes typed state
when the `heartbeat` tag is present, but no current source or canonical operational
rule found in the targeted search decides whether a recent substantive event
should suppress the tick.

This is an evidence absence, not proof that no host-local wrapper can ever suppress
a heartbeat. It is enough to say that the canonical invocation and current
agent-tools surface do not make the accepted mitigation visible or verifiable.

### Accepted obligation B: lifecycle heartbeat migration

ADR-186 was accepted on 2026-05-24 in `48c8ac225`. It chose
`lifecycle + event_type='heartbeat'` as the forward canonical shape, required
consumers to accept both lifecycle and legacy narrative-tag shapes during
migration, and named an explicit closure signal: all emitters migrated plus one
full team-session cycle with no recent legacy heartbeat events.

The current operational rule still declares
`narrative + tags: ["heartbeat"]` to be the repository phenotype. Current
`peer-liveness.ts` recognises a heartbeat only through
`event.tags?.includes('heartbeat')`; the current append command constructs a
`kind: 'narrative'` event; and the typed heartbeat-body composer documents itself
as operating within ADR-186's migration window. The targeted current-source search
found no `HEARTBEAT_EVENT_TYPE`, lifecycle-heartbeat emitter, dual-shape liveness
predicate, or recorded closure signal.

Again, incompletion is not the same as present harm. The legacy tag shape works in
live operations and the lifecycle migration was deliberately opportunistic. The
architectural gap is that an opportunistic migration with no named recheck can
remain permanently “in transition” even if its original semantic benefit has
become marginal or its sequencing precondition never fires.

## The learning-loop assessment

| Loop stage | Assessment | Evidence |
| --- | --- | --- |
| Experience becomes a candidate | Strong | Silent retirement, heartbeat noise, category confusion, and autonomous-emitter incidents are separately recorded |
| Candidate preserves provenance and scope | Strong | PDR-078 records the originating failure and every amendment; PDR-082 preserves its first-instance ceiling |
| Counter-evidence can reverse or narrow it | Strong | n=2 reduction was generalised to consumer absence only after a second instance |
| Decision carries falsifiers | Strong | Both PDRs name conditions that should weaken or defeat their rules |
| Decision reaches a useful current phenotype | Partial and positive | Typed heartbeat bodies, conservative peer classification, thresholds, and ping-before-escalate are current |
| Accepted obligations receive a closure disposition | Weak | No inspected current surface shows redundancy suppression, lifecycle migration closure, intentional deferral trigger, or retirement decision |

The conclusion is therefore not “learning failed to reach software”. Much of it
did. Nor is it “every accepted decision must be implemented”. That would turn
historical intent into authority over the present system.

The conclusion is: **promotion worked; closure is the weak link**.

## Do the FRAME-1 contracts add value here?

Yes, but only if used as a compact decision lens for this lineage.

### Capability contract

The lineage distributes the capability across an emitter loop, comms event
substrate, peer-liveness classifier, direct-ping protocol, claim state, and human
or Director judgement. Current sources describe each part well, but no single
decision surface says who owns the end-to-end effect or the two open dispositions.

### Effect hypothesis

The intended effect is not “emit heartbeats” or “conform to ADR-186”. It is:

> Detect quiet retirement and coordination stalls early enough to recover work,
> without spending human attention and agent context on redundant signals or
> creating false confidence from an autonomous scheduler.

This formulation makes both accepted obligations contestable. Redundancy
suppression has a direct burden rationale. Lifecycle migration is justified only
if semantic distinction and consumer safety still change the effect enough to
repay migration complexity.

### Feedback contract

The lineage names useful falsifiers but not the owner, recheck moment, or expiry of
the unresolved obligations. A minimal feedback contract for this decision would
name:

- the evidence allowed: current emit/consume paths, existing curated incidents,
  and content-free operational verification if separately authorised;
- the evidence not allowed here: individual activity analysis, performance
  inference, or re-analysis of workplace communications;
- the decision owner: the Practice/architecture authority designated by the
  Director, not an emitting agent or a metric;
- the three allowed dispositions: effective, intentionally deferred with a named
  trigger, or retired/revised with reasons; and
- the next check: only if the chosen disposition carries a trigger or observable
  failure condition.

If the existing PDR/ADR process can record those fields without a new contract
surface, it should. The concepts earn their keep by improving this decision, not
by growing a parallel governance estate.

## Recommended decision route

Ask the Director to route one bounded disposition review of the
liveness-heartbeat lineage, covering the PDR-078 §2 redundancy rule and ADR-186
migration as two obligations under one intended effect.

For each obligation, record exactly one present disposition:

1. **Effective:** point to current enactment and the evidence that it still serves
   the effect.
2. **Intentionally deferred:** name the owner, trigger, and interim safe state.
3. **Retired or revised:** say why the present effect no longer warrants the old
   obligation, and update or supersede the decision source rather than leaving a
   permanent migration window.

This inquiry does not choose among those dispositions. It specifically recommends
against treating implementation as the default proof of seriousness. A stale
accepted migration should be retired truthfully if its effect does not justify it;
a still-important burden control should be made observable if the current system
depends on it.

## Falsifiers and counter-evidence

The conclusion should be reduced or defeated if any of the following is shown:

- a current canonical source demonstrates cadence-window suppression after
  substantive events;
- a current emitter and consumer implement the lifecycle-heartbeat dual shape, or
  a recorded decision explicitly retains the legacy tag phenotype;
- an existing Practice decision surface already names owner, trigger, evidence,
  and retirement disposition for both obligations end to end; or
- the proposed disposition review cannot change any live choice beyond restating
  current PDR/ADR status.

Evidence already limiting the claim:

- the current legacy tag shape is operationally useful;
- the peer-liveness classifier has strong false-verdict guards;
- PDR-082 and the PDR-078 amendment demonstrate real reversal and honest evidence
  ceilings; and
- this inquiry did not measure current signal volume or human burden, so it cannot
  claim that redundancy is presently costly in practice.

## Free-play harvest kept separate from findings

These associations helped shape the inquiry but are not evidence:

- **Case law and appeal:** a decision system needs not only precedent but a way to
  know whether a ruling still governs the present case.
- **Build publication and Practice learning:** a locally coherent artefact is not
  proof that a downstream consumer received or adopted it.
- **Laboratory instruments:** a green sensor proves the sensor path worked, not
  that the phenomenon of interest occurred.
- **Wildlife cameras:** a friction corpus sees visible incidents more readily than
  quiet success, abandonment, or avoided effort.
- **Forgetting as pruning:** explicit retirement can preserve a system's ability to
  learn better than indefinite accumulation.

Two attractive ideas were discarded: a single outcome dashboard would collapse
distinct evidence speeds and authorities, and a standing governance council would
add ceremony before one bounded decision demonstrates a need.

## Sources inspected

- `.agent/practice-core/decision-records/PDR-078-liveness-heartbeat-contract.md`
- `.agent/practice-core/decision-records/PDR-082-n2-collaboration-mode.md`
- `.agent/rules/collaboration-is-value-contingent.md`
- `.agent/rules/liveness-heartbeat-cron.md`
- `docs/architecture/architectural-decisions/186-comms-event-heartbeat-lifecycle-substrate.md`
- `agent-tools/src/collaboration-state/peer-liveness.ts`
- `agent-tools/src/collaboration-state/cli-comms-commands.ts`
- `agent-tools/src/collaboration-state/comms-heartbeat-body.ts`
- git history for the decision and amendment lineage named above

