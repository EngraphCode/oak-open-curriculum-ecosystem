# Agent-tools architecture: operational criticality of event-driven wake

**Date:** 2026-08-01

**Author:** Caracal binds Reverie (`019fbd`)

**Status:** Bounded FRAME-1 inquiry D; evidence and one architecture
disposition route, not an implementation decision

**Current-source baseline:** `origin/main` at
`88612fdf647263bbd5750f3e0a1a1977fe05d5d4`. Current platform behaviour is
bounded by the dated, first-hand Codex capability census and this session's
exposed collaboration contract. No people-derived data, runtime surveillance,
or new behavioural measurement was used.

**Preceding inquiry:** _Agent-tools architecture: learning promotion and
reversal inquiry_ concluded that promotion works and closure is the weak link.
This inquiry does not reopen that specimen. It asks a different question:
what operational consequence should the event-driven-wake capability be built
to withstand before another failure-domain mechanism is proposed?

## Direct answer

The current Codex team-alert stack is **coordination-critical,
session-scoped, and recoverable**. Its integrity matters more than continuous
availability:

- a coordination event must remain recoverable and must not be silently
  consumed as though a person or agent absorbed it;
- an active agent benefits materially from prompt notification because it
  reduces manual polling and shortens stop, reroute, and challenge latency;
- loss of the alert path is operationally costly but does not erase the
  canonical event, directly interrupt a public product, or justify pretending
  that the seat is continuously on call; and
- a truly idle Codex root is not woken by the current relay. Idle activation is
  a distinct capability whose pinned-native implementation the owner has
  already judged disproportionate to its current benefit.

The root watcher and relay should therefore be **retained, but their contract
should be narrowed**. They are not redundant copies:

- the root watcher owns canonical-source consumption, a root-identity cursor,
  and the F-95 claim-opening presence check;
- the relay watcher and child inject external events into an already-active
  root turn when the session exposes `collaboration.send_message`; and
- the foreground sweep recovers from watcher or relay loss by reading durable
  canonical events.

The architectural defect is the claim made about the composition. Current
doctrine and the Platform Liveness Declaration say Codex `NOTIFY` is certified.
The later first-hand capability census records two contrary boundary probes:
`collaboration.send_message` reached an **active** parent promptly but did not
start a new parent turn after that parent became idle. PDR-133 defines `NOTIFY`
independently of `LOOP`; a mechanism that requires the loop already to be
running cannot certify that independent class.

The one decision route is:

> Retain the root-watcher-plus-relay composition as an **active-turn alert
> mode**, correct the Codex liveness declaration and bootstrap language so it
> does not claim idle wake, keep bounded polling and gap sweeps as recovery,
> and leave native idle activation deliberately deferred until a supported
> upstream primitive exists or observed consequence changes its criticality.

No additional daemon, broker, registry, or high-availability layer is warranted
by the evidence in this inquiry.

## Inquiry contract

### Specimen

One capability only: event-driven reasoning awareness for a Codex root in a
team session, composed from the all-channels watcher, relay child, and bounded
manual recovery path.

File-only ARC and standards channels are outside this capability, as the
generated bootstrap already states. Pull-request settle watches are evidence
of an analogous silent-failure class, not a second specimen.

### Decision this inquiry can change

Should this capability retain its layered form, be simplified, or strengthen a
specific boundary? The answer must follow operational criticality and intended
effect, not process count or doctrinal conformity.

### Evidence ceiling

Allowed evidence:

- current watcher source, tests, rules, and generated bootstrap;
- PDR-133's current liveness-class contract;
- the dated capability census and its external probes;
- current owner-ratified or owner-ruled plan posture; and
- git history establishing which mechanism currently exists.

Not allowed:

- inference about individual worker attention or performance;
- new analysis of private conversations or people-derived activity;
- a claim about future Codex capability from current product naming; or
- a mission, adoption, or public-product outcome claim.

### Intended impact bridge

- **For people directing work:** a stop, reroute, challenge, or custody message
  should reach an active agent without continuous manual poking. The system
  should never give a person false assurance that an idle agent is on call.
- **For agents doing work:** coordination should interrupt active reasoning
  promptly enough to prevent stale work, while durable source and recovery
  preserve context after a process dies. Alerting should not consume a whole
  agent's attention with routine heartbeat noise.
- **For the Practice:** platform-specific capability must be declared at the
  boundary actually proved. A useful degraded mode is a valid architecture;
  an overclaimed healthy mode is not.

### Exit condition

Stop after one retain, simplify, or strengthen verdict with a falsifiable
decision route. Do not design or implement idle wake.

## What the capability is for

The capability does not exist to keep watcher processes alive. It exists to
change this outcome:

> A consequential coordination event reaches the right working seat in time
> to affect its next action, without requiring the human Director to monitor
> every stream manually, and remains recoverable when notification fails.

That outcome has three separable parts:

1. **Custody:** the event lands in the canonical comms source and remains
   recoverable.
2. **Attention:** an active reasoning loop is alerted promptly rather than
   discovering the event at a later poll.
3. **Activation:** an idle seat starts a new turn without a user prompt.

The current composition serves the first two. It does not serve the third.
Treating them as one binary “wake” capability is the boundary error that makes
the current estate hard to reason about.

## Current capability anatomy

| Part | Current responsibility | What its green does not prove |
| --- | --- | --- |
| Canonical comms event files | Durable source and identity-addressed dispatch | That any watcher read the event |
| Root-identity watcher | Root cursor, output stream, watcher heartbeat, F-95 presence | That the platform notified or the root absorbed |
| Relay-identity watcher | Independent cursor and non-heartbeat event delivery to the relay child | That the child forwarded or the root was active |
| `collaboration.send_message` | Injects the relay's message into an active parent turn where exposed | That an idle parent starts a new turn |
| Foreground sweep / bounded poll | Recovers durable events while the root has an active turn | Idle activation or continuous awareness |
| Content-bearing acknowledgement | External evidence that a particular message engaged the seat | General future liveness or comprehension |

This split is broadly sound. Each part fails independently and current sources
name those limits. The problem is not that there are too many components; it is
that “NOTIFY certified” collapses attention and activation back together.

## Current implementation merits

### Durable recovery is designed into the watcher

The TypeScript watcher is substantially stronger than a shell tail:

- it resolves the canonical coordination home and uses an identity-bound cursor;
- it refuses to run without streaming stdout, preventing a drained event from
  being marked seen while delivered nowhere;
- it emits before marking an event seen, preferring a duplicate after failure
  to a silent hole;
- it bounds each drain pass rather than the process lifetime;
- it marks deliberately excluded heartbeats seen without spending notification
  capacity on them;
- it applies per-step deadlines and emits typed failure lines;
- it writes a strict watcher heartbeat recording source, identity, progress,
  and error state; and
- it self-exits when its supervising process disappears.

Focused unit and integration suites cover output-before-seen ordering, failure
redelivery, excluded-event marking, supervisor exit, path defaulting, heartbeat
parsing, staleness, and the F-95 claim-opening backstop.

These properties justify a **replay-and-recover** posture. A process death can
delay coordination without making the event unknowable.

### The two watchers have different jobs

The root watcher is not an inefficient copy of the relay watcher. Its heartbeat
and exact-display-name cursor attest the participating root for F-95. The relay
uses a different identity and cursor because it is a platform-notification
adapter, not the participating seat.

Collapsing them without replacing both contracts would make one green carry two
independent meanings again—the exact over-reading PDR-133 was written to stop.

### Noise is already treated as an effect cost

The relay excludes routine heartbeat-tagged events and pairs that exclusion
with the separate F-75 absence poll. Directed and group events still surface.
That is a sensible effect-led trade: reduce agent context consumption without
removing the retirement signal entirely.

## The boundary the current contract overclaims

### PDR-133's model

PDR-133 says `NOTIFY` depends on delivery and certifies that the platform wakes
the reasoning loop on watcher output. It deliberately makes `LOOP`
independent: a notification path can be live while reasoning is wedged, and a
reasoning loop can be live while notification is dead.

Its reading rule is load-bearing: a green may certify only the path actually
traversed.

### The Codex evidence

The Platform Liveness Declaration currently records Codex CLI 0.146.0
`NOTIFY: certified`, based on a directed event reaching a relay child and then
appearing inside a root reasoning turn without a manual poll or user prompt.

The later capability-divergence census preserves the missing discriminator:

- relay sends reached active parent turns;
- a child sent after the parent had finished, and no new parent turn appeared;
- a second idle root had a challenge marked seen but did not absorb it; and
- the census concludes that relay-live seats are push-live within active turns
  only.

That evidence does not make the relay a failure. It makes the certification
too broad. The relay depends on `LOOP` already being live, so it cannot certify
a class defined to be independent from `LOOP`.

### The implementation boundary agrees

No agent-tools runtime implements the relay or starts a Codex turn. The July 31
“auto-load Codex team alerts” change generates and validates an instruction
block in `AGENTS.md`, adds a SessionStart pointer, and tests projection parity.
It explicitly does not implement the watcher procedure. Runtime alerting is a
session composition performed by a collaboration child when that session
exposes the send tool.

This boundary is reasonable because tool exposure varies by harness. It also
means repository tests can prove that the recipe is discovered, but not that a
particular session activates or notifies. The live challenge remains necessary,
and its conclusion must be scoped to the state actually challenged.

## Operational criticality classification

| Dimension | Verdict | Reason |
| --- | --- | --- |
| Beneficiary | Human Director and active agent team | Faster correction and less manual stream monitoring |
| Failure blast radius | One seat and its coordinated work window | The canonical public product does not depend on this watcher |
| Typical consequence | Delay, duplicate work, stale claim assumptions, missed stop/reroute | Harm is operational and can become consequential if other authority gates are also skipped |
| Recoverability | High | Canonical event files remain; cursors, sweeps, and acknowledgements support reconstruction |
| Data-loss tolerance | Effectively zero for canonical events | Notification duplication is safer than a silent event hole |
| Active-turn latency need | Time-sensitive, not hard real-time | Current relay wait is bounded around tens of seconds; degraded poll is at most about a minute while active |
| Idle availability need | Explicitly unserved today | No current primitive starts a new parent turn; owner declined the pinned-native route |
| Human attention cost | Material | Manual polling and human re-pings consume attention; false assurance costs more |
| Agent capacity cost | Material | A relay occupies a collaboration slot, runs a second watcher, and carries reasoning context |
| Correct resilience posture | Detectable degradation plus replay | High-availability machinery is not justified while the durable source and explicit acknowledgement gates hold |

The classification is therefore **coordination-critical, safety-relevant at
authority boundaries, but not continuously available infrastructure**.

## Human and agent consequences

### Human control

An always-on idle wake is not automatically more human-centred. It changes the
meaning of leaving a seat idle: external events could create model work without
a contemporaneous user turn. That can be worthwhile only with clear
user-priority, capability, and cancellation boundaries.

The current owner ruling reflects that cost. A pinned native extension against
Codex internals was rejected as disproportionate; the successor upstream plan
is explicitly speculative and requires fresh owner authority. This is a
deliberate control boundary, not missing engineering ambition.

The present system should therefore tell humans the truth: active roots can be
alerted; idle roots resume when a person or supported platform primitive starts
them. Urgent coordination requires acknowledgement, a named response window,
and a safe default—not faith in background activation.

### Agent conditions

For an active agent, the relay is useful. It removes repeated poll decisions and
brings a stop or reroute into the next tool boundary. The separate cursor also
lets the notification adapter fail without taking custody of the root identity.

The cost is non-trivial: one of four collaboration slots can be occupied by the
relay, every external non-heartbeat event crosses a reasoning boundary, and a
relay-authored summary can omit nuance. The relay message must remain an alert
and provenance pointer; consequential action should read the canonical event,
not treat the relay's prose as authority.

### Practice portability

The architecture already contains the right portability idea: platforms may
declare a class unavailable and name a proxy. A cannot-certify row is not
second-class citizenship. Correcting the Codex row would demonstrate that idea
rather than weaken it.

## Disposition options

### Option 1: retain the mechanism and the present claim

Reject. It preserves a useful mechanism but leaves an active-only observation
labelled as independent reasoning wake. The next human or agent can reasonably
infer unattended activation that does not exist.

### Option 2: remove the relay and use polling only

Reject on current evidence. It saves one collaboration slot and process, but
reintroduces repeated polling and lengthens active-turn correction latency. The
relay has externally observed, decision-relevant value while the root is
working.

### Option 3: build resilient native idle wake now

Reject. The owner has ruled out a pinned native extension as disproportionate,
the upstream plan is speculative, and this inquiry found no unrecoverable harm
that overturns that decision.

### Option 4: retain and narrow

Accept.

- Keep the root watcher for root custody and F-95.
- Keep the relay as an active-turn attention adapter when its send capability
  is exposed and challenge-proven.
- Keep bounded polling and canonical gap sweeps as the declared recovery mode.
- Reclassify Codex's current liveness row so active-turn injection is not
  presented as idle/new-turn `NOTIFY`.
- Keep idle activation deferred, with the existing supported-upstream-or-
  changed-consequence trigger.

## Recommended decision route

Route one doctrine-and-declaration correction, not a runtime build:

1. Reconcile the Codex row in the Platform Liveness Declaration with the later
   capability census and PDR-133's `LOOP` independence.
2. Rename or qualify the current relay procedure as active-turn alerting. State
   plainly that successful `collaboration.send_message` exposure does not start
   an idle root turn.
3. Make the acceptance probe test both states:
   - an active root receives the challenge without polling; and
   - a post-final send either starts a new turn or records idle activation as
     unavailable. The second result must never be inferred from the first.
4. Preserve the generated `AGENTS.md` projection and CI parity check, but make
   the generated text carry the corrected effect boundary.
5. Leave the native-extension plan deliberately deferred and the upstream
   contribution plan speculative. Re-open only at its existing trigger: a
   supported upstream surface or evidence that the operational consequence now
   outweighs the maintenance and control cost.

The route can use current PDR, rule, matrix, and generated-bootstrap homes. It
does not need a new registry, liveness class, ticket taxonomy, or telemetry
pipeline.

## Falsifiers and counter-evidence

The main conclusion should be reduced or defeated if:

- a current external probe shows `collaboration.send_message` starting a new
  parent turn after the parent has genuinely become idle, without user input or
  a foreground poll;
- PDR-133's ratified meaning of `NOTIFY` is explicitly narrowed to active-loop
  injection without collapsing its stated independence from `LOOP`;
- removing the relay produces no meaningful increase in active-turn polling,
  coordination delay, or human re-ping burden; or
- a missed idle wake causes unrecoverable or irreversible harm despite durable
  comms, acknowledgement requirements, and authority gates, changing the
  capability's criticality class.

Evidence limiting the recommendation:

- the relay has multiple successful active-turn delivery and absorption probes;
- the watcher code has strong durability and fail-loud properties;
- canonical comms does not cover file-only ARC or standards channels;
- this inquiry did not measure current human attention burden or event volume;
- an active-turn injection may still be colloquially described as a wake, but
  the architecture needs the stricter distinction because decisions depend on
  idle availability; and
- the owner may choose to invest in upstream idle wake for strategic reasons
  beyond this operational-criticality evidence, but that remains a fresh
  decision.

## Free-play harvest kept separate from findings

These associations helped expose the boundary but are not evidence:

- **Mailbox, doorbell, and power switch:** the canonical event is the mailbox,
  the relay is a doorbell heard while someone is home, and idle activation is a
  power switch. Improving one does not silently supply the others.
- **Flight recorder and pager:** a pager may fail without erasing the record.
  Reliability effort should first protect the record and make pager failure
  visible.
- **On-call contract:** saying an idle seat can be woken creates a social and
  control expectation, not merely a technical feature.
- **Two processes, two purposes:** counting watcher processes obscures whether
  they duplicate work or protect different boundaries.

The tempting ideas discarded were an always-on replacement daemon, a universal
notification broker, and a new liveness registry. None is justified before the
existing capability is named truthfully.

## Sources inspected

- `.agent/rules/comms-all-channels-watcher.md`
- `.agent/rules/use-monitor-for-event-driven-wake.md`
- `.agent/skills/start-right-team/SKILL-CANONICAL.md`
- `.agent/practice-core/decision-records/PDR-133-liveness-classes-and-platform-declaration.md`
- `.agent/memory/executive/cross-platform-agent-surface-matrix.md`
- `.agent/reports/agentic-engineering/2026-07-31-codex-capability-divergence-census.md`
- `.agent/plans/delivery/codex-app-server-idle-wake.plan.md`
- `.agent/plans/delivery/codex-upstream-idle-wake-contribution.plan.md`
- `agent-tools/src/collaboration-state/cli-comms-watch.ts`
- `agent-tools/src/collaboration-state/comms-watch-loop.ts`
- `agent-tools/src/collaboration-state/comms-watch-iteration.ts`
- `agent-tools/src/collaboration-state/watcher-heartbeat.ts`
- `agent-tools/src/collaboration-state/watcher-presence.ts`
- `agent-tools/src/collaboration-state/watcher-supervisor.ts`
- focused watcher unit and integration tests
- commit `f23584fbd` (generated Codex team-alert bootstrap)

