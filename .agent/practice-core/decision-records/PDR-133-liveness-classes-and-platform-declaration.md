---
pdr_kind: contract
---

# PDR-133: Liveness Classes and the Platform Liveness Declaration

**Status**: Proposed
**Date**: 2026-07-25
**Related**:
[PDR-078](PDR-078-liveness-heartbeat-contract.md)
(liveness-heartbeat contract — an Accepted record that governs the
`EMIT` class in depth (cadence, threshold, redundancy, exemptions)
plus the absence machinery; this PDR names the class set that contract
sits inside, so an implementer can see which classes PDR-078 does
*not* certify. On ratification the two read as frame and
specialisation; see §Cascade);
[PDR-027](PDR-027-threads-sessions-and-agent-identity.md)
(threads, sessions, and agent identity — liveness is always asserted
*of an identity tuple*, so every class below is per-seat, not
per-process, and `DISPATCH` and `BINDING` both fail on identity
grounds);
[PDR-063](PDR-063-mid-cycle-retirement-protocol.md)
(mid-cycle retirement protocol — the downstream consumer: it owns the
handoff and claim-adoption steps that follow a takeover decision,
which is why the class a takeover decision reads (§7) determines
whether PDR-063 fires soundly; the reading consumer itself is
PDR-078 §3 plus the host's takeover rule);
[PDR-079](PDR-079-pdr-vs-adr-portability-distinction.md)
(PDR-vs-ADR portability distinction — this PDR is portable: it names
classes and obligations, never a host's watcher, scheduler, or event
schema, which belong to repo-bound phenotype records).

## Context

Multi-agent operation depends on answering one operational question:
**can this seat be relied on to receive and act on coordination — and
if not, may its work be taken?** Every liveness check ever built is a
proxy for that question.

The question stops at *act*. No class named below certifies that a
seat **understood** what reached it; comprehension is not observable
from outside the seat, and no observation in this record may be read
as evidence of it.

The recurring failure is not that checks are missing. It is that a
check goes green and the green is read as answering the whole
question when it answers one class on one path. Each such misreading
was recorded where it was found rather than as an instance of a
class:

- A watcher wrote a liveness heartbeat while its supervising agent
  was gone, so an orphan asserted a seat that did not exist.
- A watcher restarted for roughly fourteen hours emitting restart
  notices while its cursor never advanced: the drain exceeded its
  deadline before the first mark-seen, every pass.
- A watcher passed its own liveness assert for about forty minutes
  while delivering zero events, because a hand-rolled filter muted
  them; the same day, a sibling filter had the inverse defect and
  leaked everything.
- A seat's harness was suspended for about sixty-four minutes while
  its heartbeat loop emitted perfectly on cadence, because the loop
  runs in a scheduling layer independent of the reasoning layer.
- A seat's comms stream read continuously live while its claim's
  registry timestamp sat stale for roughly fifteen hours: two
  distinct surfaces, one bumped, one forgotten.
- A seat's watcher delivered a directed event correctly, marked it
  seen, and emitted it to its output surface — and the platform never
  woke the reasoning loop, because that platform's background
  primitive wakes the harness only when a process *completes* and a
  persistent watcher never completes. The owner noticed the
  unanswered event before the seat did.

Every one of those failures was **invisible from the classes beneath
it on its own path**: every cheaper check on that path was green at
the time. Several cost an operational window; one escaped costing
anything only by the luck of a quiet stream. That is the pattern, and
it is what makes the failures expensive — they present as health.

Scattered class-by-class capture does not scale as the number of
agent platforms grows. Each new platform re-discovers the same gaps
by outage, because nothing tells an implementer which classes exist
to be certified or which of them their platform's primitives cannot
reach. The cure is to name the classes once, portably, and to make
each platform declare its coverage on arrival.

## Decision

### 1. Liveness is a partial order over independently-failing classes, not a state

Liveness is not a boolean and not a single measurement. It is a set
of independently-failing classes ordered by **dependency**, and the
order is **partial, not total**: some classes are incomparable, and
no single sequence holds the whole set. A liveness claim is
meaningless until it names **which class** it asserts.

The founding instance in §Context is why the order is partial: that
seat's reasoning loop was demonstrably alive — it was working — while
its notification path was dead. `LOOP` and `NOTIFY` are
**incomparable**, neither depending on the other, so no single sequence
holds them, and any ranking of the two licenses a false inference
(§4).

Class identifiers are **mnemonics, never ordinals**. An ordinal
encodes position, so inserting a class renumbers its successors and
invalidates every citation already written. Each class states its
dependencies explicitly instead; that is where position information
now lives, and it survives insertion.

### 2. The incoming classes (can coordination reach the seat?)

| Class | Depends on | Certifies | Characteristic failure |
|---|---|---|---|
| `DISPATCH` | — | The coordinating write landed as an event in the canonical home, addressed to an identity that resolves to the intended live seat | An exit-0 write that transferred nothing; an address in the wrong naming convention (a kebab slug where the display name is required — four recorded instances), or carrying a pre-rotation designation or stale session prefix; right home, wrong audience field |
| `SUBSTRATE` | `DISPATCH` | The shared medium is the canonical one, exists, and is writable | Reads and writes succeed against a decoy or retired location; both sides silent |
| `PROCESS` | `SUBSTRATE` | A watching process exists | The watcher is dead, or a supervising wrapper hides its inner process's death |
| `BINDING` | `PROCESS` | The watching process belongs to THIS live seat | An orphan outliving its seat, writing liveness signals for a seat that is gone; an inherited process assumed live across a continuity boundary |
| `CURSOR` | `BINDING` | The watcher drains new events and advances its position | Self-restarting watcher whose cursor never moves; restart notices read as progress |
| `INTEGRITY` | `CURSOR` | The delivered set equals the written set — no hole, no replay | A drain that dies after marking seen leaves a silent hole while the cursor reads advanced; a missing seen-file (or its absent parent directory) replays everything and buries live events, while both the cursor and the emitted counter read healthy |
| `DELIVERY` | `INTEGRITY` | Drained events reach the seat's output surface | A filter mutes (or floods) the surface while every process check stays green |
| `NOTIFY` | `DELIVERY` | The platform wakes the reasoning loop on that output | A platform whose background primitive signals only on process completion cannot notify from a persistent watcher at all |
| `LOOP` | — (INDEPENDENT of the delivery path) | The reasoning loop is running, not wedged or suspended | Background-layer emitters keep asserting liveness through a suspended or wedged main loop |
| `ABSORB` | `NOTIFY` or any other wake path, AND `LOOP` | The seat received the coordination and engaged with it | A seat appears bootstrapped on its own surface while invisible to peers, having missed the coordinating traffic |
| `CAPABILITY` | `ABSORB` | The seat holds the credentials, permissions, and identity needed to effect what it absorbed | An invalidated token or missing permission makes a correctly-absorbing seat produce no movement, which reads exactly like a stall — so a takeover transfers the wall, not the work |

`DISPATCH` through `NOTIFY` form one dependency path. `LOOP` sits on
no path: it is **incomparable** to every delivery-path class, and the
two directions of that incomparability are both attested (a live loop
behind a dead notification path; a wedged loop behind a healthy
delivery path). `ABSORB` is the join — it requires a wake, from
`NOTIFY` or from any other wake path a platform declares, **and** a
running `LOOP`. `CAPABILITY` sits above `ABSORB` because a seat can
absorb correctly and still be unable to act.

### 3. The outgoing classes (can peers tell the seat is alive?)

| Class | Depends on | Certifies | Characteristic failure |
|---|---|---|---|
| `EMIT` | — | Liveness signals are being written at cadence | The emitting loop dies silently, or emits posture baked at arm time and now false (depth: PDR-078 §7) |
| `REGISTRY` | — | Every claim-bearing surface's freshness is renewed | One surface renewed and a sibling forgotten; a multi-claim seat bumping only one claim |
| `PROGRESS` | — | Substantive work is advancing, not merely presence | Signals present, lane untouched: observed-live but stalled |

`EMIT`, `REGISTRY`, and `PROGRESS` are **mutually independent**: no
order holds between them, each fails alone, and each of those solo
failures is attested. They are also independent of the incoming
classes — a seat can emit perfectly while receiving nothing, and
receive everything while emitting nothing.

### 4. The reading rule

**An observation is evidence only about the classes on the path it
traversed, and about nothing else. A green on one path licenses no
conclusion about a parallel path, and no observation licenses a
conclusion about a class it did not pass through.**

The rule is stated as a constraint on reading rather than as a claim
about indistinguishability, because the latter would be unfalsifiable
by construction: a single observation can certify several classes at
once (§6), so "always indistinguishable" is not the operative content.
The operative content is that a check's green tells you nothing about
the classes its path did not touch, and is *actively reassuring* about
exactly those classes — which is what makes over-reading it more
dangerous than having no check at all.

The founding instance demonstrates why the rule is stated over paths.
That seat's reasoning loop was alive while its notification path was
dead: a `LOOP` green proves nothing whatever about `NOTIFY`, because
the observation never traversed the delivery path. A ranked reading —
"evidence about this class and everything beneath it" — licenses the
conclusion that notification was fine, which is precisely the
conclusion that cost the window. Ranking is the reflex the path
formulation exists to defeat, and `LOOP` is where it bites: a seat's
most visible green sits on no delivery path at all.

### 5. The self-observation corollary

**Self-observation degrades as the classes leave the seat's own
reach.** A seat can certify `SUBSTRATE`, `PROCESS`, `BINDING`,
`CURSOR`, `INTEGRITY`, and `DELIVERY` about itself **only from a
progress artefact it reads fresh in the current session** — cursor
movement, an emitted-count delta, a heartbeat-file mtime — and never
by inference, and never across a continuity boundary. Both weaker
forms are attested failures: a watcher passed its own liveness assert
while delivering nothing, and an inherited watcher's four-second-fresh
heartbeat was read as proof it had survived a compaction, when an
inherited process is unverifiable from inside.

A seat cannot soundly certify `NOTIFY`, `LOOP`, `ABSORB`,
`CAPABILITY`, or `PROGRESS` about itself at all. This is the
**never-self-certifiable set**, and every other section that needs it
cites this one rather than restating it. A seat whose notification
path is dead cannot notice the absence of a wake; a wedged loop cannot
report that it is wedged; a credential-blocked seat reports intent it
cannot execute. Signals emitted by a scheduling layer that runs
independently of the reasoning layer certify the *scheduler* only,
never the reasoning.

Therefore **the never-self-certifiable set must be certified
externally** — by a peer, by tooling that observes from outside the
seat, or by the owner. A team that relies only on self-reported
liveness is structurally blind at exactly the classes whose failure is
most costly.

### 6. Two instruments certify what no self-report reaches

Only two observations reach the never-self-certifiable set of §5, and
both are external:

1. **Observed deliverable movement** — work landing that only a
   running reasoning loop could have produced (commits, pushes,
   review replies, artefacts changing). This certifies `LOOP` and
   `CAPABILITY` (the movement is itself proof the seat could effect
   it), and `ABSORB` where the movement responds to the coordination
   in question. It spends no challenge and no peer attention; it is
   `PROGRESS` read from outside.
2. **A content-bearing challenge reply** — a challenge that requires
   the seat to produce content it could not produce without having
   absorbed the challenge, answered inside a bounded window. This
   certifies `LOOP`, `ABSORB`, and **every class on the path the
   challenge traversed**: a reply engaging the challenge's specific
   content is proof the challenge arrived, so the `DISPATCH`-through-
   `NOTIFY` classes of that particular send are certified with it.

Every *presence* signal in this taxonomy is a proxy for these two;
neither of these two is a proxy. A bare acknowledgement is weak
evidence for instrument 2 (it may be produced without absorption); a
reply engaging the challenge's specific content is strong. This is why
direct-ping-before-escalation is not a courtesy but a sound
instrument, and why work-evidence cross-checks belong in every
takeover decision — a seat can be comms-silent and substantively
active, and instrument 1 sees that where no presence check can.

### 7. Match the class to the decision

Every liveness-dependent decision names the class it requires
*before* reading a signal:

- **"Should I restart the watcher?"** → `PROCESS`, `BINDING`,
  `CURSOR`.
- **"Am I seeing everything the team sent?"** → `INTEGRITY` and
  `DELIVERY`, and `NOTIFY` to know whether seeing arrives in time to
  matter.
- **"Can I rely on this seat having received what I sent?"** →
  `DISPATCH`, `NOTIFY`, and `ABSORB` for that platform; where the
  platform's `NOTIFY` row is cannot-certify, the substituting proxy is
  part of THE SEND, not the receive.
- **"May I take this seat's claim or lane?"** → `LOOP`, `ABSORB`,
  `CAPABILITY`, and `PROGRESS` — the never-self-certifiable set of §5,
  read for externally-certified **absence** per §9, never for
  presence. `CAPABILITY` belongs on this list because a
  credential-blocked seat produces no movement and reads exactly like
  a stall: taking its lane transfers the wall, not the work. A
  retirement or takeover decision justified by delivery-path greens
  (`SUBSTRATE` through `DELIVERY`) or by `EMIT` / `REGISTRY` evidence
  is unsound, however green those classes read.

### 8. The Platform Liveness Declaration (onboarding obligation)

Any agent platform admitted to team operation MUST carry a
declaration stating, **for every class in §2 and §3**, one of three
answers:

- the platform primitive that certifies the class, with the observed
  latency or interval it yields, and the date and evidence of the
  first-hand observation that established it;
- that the platform **cannot** certify the class, naming the proxy
  that substitutes and the residual exposure the proxy leaves; or
- that the class is **certified-but-contract-suspended** — the
  primitive exists and was observed, and a portable contract
  deliberately suspends the class for this seat or session shape.
  PDR-078's consumer-absent exemption is the worked case: it suspends
  `EMIT` emission itself by contract, so a flat "certified" row is
  wrong for any window in which that exemption is live. The row names
  the contract and the clause, so a reader diagnoses the silence as
  contract, not as a broken primitive.

**A row is about our path, not the platform's capabilities.** Each row
records what we observed and certified about **our own coordination
path** on that platform, dated. It never records what the platform
currently supports: that is a documentation question answered at time
of use from the platform's own sources, and a row claiming it is stale
the moment the platform ships.

Five binding disciplines on the declaration:

1. **Observed, never inferred.** Each row is established by
   first-hand observation on the platform at a stated version, not
   from vendor documentation alone and not by analogy to another
   platform. Capability claims are version-pinned, because platform
   capabilities change under the same name. Where a host already
   defines an acceptance test for a class, the declaration cites that
   test rather than inventing a second one — the `NOTIFY` test (send a
   directed event; confirm it creates an agent turn with no manual
   poll and no user prompt; a process that merely prints the event
   fails) already exists host-side and is the shape every other
   class's test should follow.
2. **The observation obligation is scoped to classes with a defined
   test shape.** A class whose test shape does not yet exist is
   recorded **explicitly unverified**, naming the missing test. It is
   never filled by inference from a neighbouring class's green: an
   inferred row is the precise defect discipline 1 exists to prevent,
   and a matrix of confident unverified rows is worse than a matrix
   with honest holes.
3. **Rows in the never-self-certifiable set need an external
   observer.** `NOTIFY`, `LOOP`, `ABSORB`, `CAPABILITY`, and
   `PROGRESS` (§5) cannot be established by the platform's own seat
   reporting on itself. They are observed by a peer on another
   platform, by tooling watching from outside the seat, or — as the
   fallback observer — by the owner.
4. **A cannot-certify row is a first-class, valid answer** and does
   not bar citizenship. It bars *silence*: an undeclared class is
   the defect, because an undeclared class is discovered by outage.
   Where a class cannot be certified, its substituting proxy is a
   **named requirement of that platform's participation**, not an
   optimisation to be tuned away.
5. **The declaration is re-verified, not inherited.** A platform's
   rows expire when the platform version moves; a declaration
   carried forward without re-observation is an assumption wearing
   evidence's clothes.

**Transition.** The obligation binds every platform admitted to team
operation **after this record is ratified**. Platforms already in
operation carry it as a **named landing** — one declaration set per
platform, authored at the first liveness question that platform raises
or at a dated backfill the estate schedules — never as an instant
estate-wide violation on the day of ratification. Citizenship is
unconditional throughout: the defect is an undeclared class, and the
cure is completing the declaration.

### 9. Absence is not a class

Every class above certifies the presence of a capability.
**Retirement is an absence judgement, and no presence check can make
it. Silence past a threshold opens the question; closing it requires
BOTH instruments to come back negative — an unanswered bounded
challenge AND no observed deliverable movement. Where a platform's
declaration marks `NOTIFY` cannot-certify, an unanswered challenge is
not absence evidence at all until the substituting proxy's declared
interval has elapsed, because on that platform unanswered challenges
are the expected steady state rather than a signal.**

This is why the emit-side contract's threshold (PDR-078 §3) is a soft
signal that opens a protocol rather than a verdict that ends one.

The second half of the conjunction — no observed deliverable movement
— **is** the host rules' existing remote work-evidence cross-check (PR
pushes, review replies, check activity), and it is a **named
requirement** of the absence judgement in the §Notes sense: it is
load-bearing and stays. A seat can be comms-silent and substantively
active, so an unanswered challenge on its own leaves the
live-and-working case indistinguishable from the gone case. Both
instruments negative, or the question stays open.

## Mechanism

This PDR is a naming and obligation contract. It introduces no
substrate, no scheduler, and no check.

Hosts implement the classes with their own primitives and record
those choices in repo-bound phenotype records; the Platform Liveness
Declaration of §8 lives wherever a host records per-platform
capability (a capability matrix, a platform-support surface), one row
set per platform. The classes are the columns; the platforms are the
rows; the cells are observed facts with dates.

Existing host surfaces that carry class fragments keep their
operational specifics and gain a pointer to this taxonomy rather than
restating it — the taxonomy is the model, the rules are the
procedures.

## Rationale

Three alternative homes for this substance were considered and
rejected.

**Amend the clauses into PDR-078.** PDR-078 is Accepted, already
governs one class in depth, and already owns the absence machinery §9
leans on, so amendment looks like the low-ceremony path. Rejected
because PDR-078's subject is the **emit-side heartbeat** — cadence,
threshold, redundancy, exemptions — and no existing record owns
incoming visibility at all. Amending would invert containment: the
general frame (which classes exist, what an observation licenses)
would sit inside a record about one class's cadence, and every
incoming class would be readable only through an emit-side lens.

**A §Liveness-classes section inside one host rule.** The two host
liveness rules already carry class fragments, and a section in the
watcher rule would be the cheapest landing. Rejected on two counts.
The reading rule binds *both* host rules, plus PDR-078, plus every
takeover decision — so siting it in one rule forces the other readers
to cite sideways into a peer's rule, which the estate's
reference-direction discipline forbids. And a rule is host-bound, not
portable (PDR-079): the declaration obligation exists precisely
because new platforms arrive, and a platform arriving in a different
estate must be able to read the obligation without translation.

**The declaration obligation as a separate record.** §8 is a
distinguishable obligation from the class set — one names a model, the
other imposes onboarding work — and could stand alone. Rejected as
premature while the taxonomy it depends on is unratified: a separate
record would have to restate the class set to be readable at all, and
a restated class set is a second home that drifts. The reviewers'
recommendation is to re-site §8 onto the host's cross-platform
architecture record — where platform capability is already tabulated,
and where the onboarding decisions are actually made — once the
taxonomy is ratified. That re-siting is carded to the owner rather
than pre-empted here, and §Prediction's falsifier is its mechanical
trigger.

## Cascade

- **On ratification, PDR-078 reads as a specialisation, not a
  rival.** It is the depth treatment of `EMIT`, and it additionally
  owns `PROGRESS`'s stall diagnostic, the exemption algebra, and the
  absence machinery (threshold plus exemption suspension) that §9
  depends on; its substrate-category invariant belongs to neither
  `EMIT` nor `PROGRESS`. Nothing in PDR-078 changes, and this PDR
  asserts no authority over it — an Accepted record is not
  re-characterised by a Proposed one. What this PDR supplies is the
  frame showing which classes PDR-078's green signals do not reach.
  Where PDR-078 §6 separates the scheduler/liveness loop from
  main-loop attention and from lane progress, that three-way split is
  `EMIT`, `LOOP`, and `PROGRESS` in this vocabulary. A reciprocal
  pointer lands in PDR-078 at ratification, not before.
- **Host liveness rules** gain a pointer paragraph naming this PDR as
  the class model, and keep their invocation detail, thresholds, and
  worked instances. Three rules carry class fragments: the incoming
  watcher rule (`SUBSTRATE` through `DELIVERY`), the outgoing
  heartbeat rule (`EMIT`, `REGISTRY`, `PROGRESS`), and the rule
  governing the platform's event-driven wake primitive, which is the
  operational home of `NOTIFY`.
- **Platform onboarding work** gains the §8 declaration as an
  acceptance obligation: a platform's liveness coverage is known when
  its declaration is complete and observed, not when its first watcher
  runs. Citizenship itself is unconditional and is not gated on the
  declaration.

## Notes

### Why the order is partial and the identifiers are mnemonics

The order is a dependency order, not a severity order. `NOTIFY`'s
failure is not worse than `CURSOR`'s; it is *later on the same path*,
which means more green checks sit beneath it lying by omission.
Severity tracks the decision at stake (§7), not position.

Because `LOOP` sits on no delivery path, and `EMIT`, `REGISTRY`, and
`PROGRESS` sit on none either, no numbering could carry the dependency
information without implying comparisons that do not hold. Naming
dependencies per class carries it exactly, and mnemonic identifiers
carry no position to be invalidated when the class set grows — which
it will, since a class set graduated from observed failures is an open
set.

### Proxies are legitimate; unnamed proxies are not

Nothing here disparages proxies. A bounded periodic drain is a
perfectly sound proxy for a missing notification path. The failure
mode is an **unnamed** proxy: one that nobody records as
load-bearing, that a later optimisation removes as redundant, and
whose removal restores an outage that was already paid for once.

## Consequences

### Enables

- A liveness claim can be stated precisely ("`DELIVERY` green,
  `NOTIFY` unknown") instead of "the watcher is fine".
- New agent platforms are onboarded by completing a known matrix
  rather than by discovering gaps one outage at a time.
- Takeover and retirement decisions can be audited against the class
  they actually required.
- Proxies survive later optimisation passes, because §8 makes them
  named requirements with recorded residual exposure.
- The class set grows by insertion without invalidating a single
  existing citation, because identifiers carry no position.

### Forbids

- Asserting liveness without naming the class asserted.
- Reading an observation as evidence about any class its path did not
  traverse, in either direction — including reading a green on one
  path as evidence about a parallel path.
- Certifying any class in §5's never-self-certifiable set from a
  seat's own self-report, or from any signal emitted by a scheduling
  layer independent of the reasoning layer.
- Concluding retirement from any presence check, or from a single
  negative instrument, without the both-negative conjunction of §9.
- Leaving a class undeclared for a platform in team operation, or
  carrying a declaration forward across a platform version change
  without re-observation. The defect is the undeclared class and the
  cure is completing the declaration — never withholding citizenship,
  which is unconditional.
- Recording a declaration row by inference from a neighbouring
  class, or recording a class the platform contract suspends as flatly
  certified.
- Removing a proxy that a declaration names as substituting for a
  cannot-certify class, on the grounds that it looks redundant.

### Accepted Costs

- Declaration authoring and re-verification work per platform and
  per version. Bounded, one-off per version, and paid against
  outages already observed to cost operational windows.
- Some classes are certifiable only by a challenge round-trip, which
  costs a peer's attention. Cheaper than the owner discovering an
  unanswered event.
- The both-negative absence test (§9) makes retirement slower to
  conclude than a single timer. That is the intended trade: a false
  retirement costs a live seat's work.

## Falsifiability

This taxonomy is falsifiable on five axes:

- **An observed liveness failure that fits none of the named
  classes** — direct evidence the class set is incomplete, and the
  trigger to graduate a new class from the worked instance.
- **A class that never fails independently of its declared
  dependencies across a long observation window** — evidence the
  distinction is decorative and the classes should merge.
- **A retirement or takeover decision that followed §7 and §9 and
  was still wrong** — evidence the two instruments are not the
  complete proof this PDR claims, and that a further class sits above
  `CAPABILITY`.
- **An incident or platform onboarding whose record cites no
  declaration row** — the observable form of "declarations are
  completed but never consulted", and evidence §8 has become ceremony
  that needs re-siting to where the decisions are actually made.
- **A platform whose declaration was complete and observed, which
  nonetheless failed a declared-certified class in operation** —
  evidence the declaration's observation discipline is too weak
  (inference passing as observation, or a version-pin missing).

The taxonomy succeeds when liveness disagreements resolve by naming
classes rather than by trading anecdotes, and when a new platform's
first liveness surprise is a declaration row someone had already
marked cannot-certify.

## Prediction and falsifier

**Expected observable effect.** Every takeover, retirement, or restart
decision record names the class it required and the instrument or
declaration row it read.

**Falsifier.** If no such decision record in the month after
ratification names the class it required, the taxonomy is inert
vocabulary and §8 should be cut to a pointer.

**Review moment.** The one-month check is the named look; whoever runs
the estate's consolidation at that point performs it and records the
result in this PDR's revision history.

## Owner direction (source-of-record)

Owner instruction, 2026-07-25: "promote all of the liveness classes
now please, as we work with more agent types we need to be able to
handle broader sets of requirements."

The instruction followed the day's worked instance in §Context — a
seat that was delivery-live and notification-dead on a platform whose
background primitive cannot wake a persistent watcher, caught by the
owner rather than by any check. The owner's stated reason is the
forward one: platform variety is increasing, and the estate needs a
way to hold broader sets of requirements without rediscovering each
platform's gaps by outage. §8 is the direct answer to that reason;
the class set and the reading rule are what make §8 expressible.

## Revision history

- 2026-07-25 — Initial record. Names eleven incoming and three
  outgoing classes graduated from worked instances already recorded
  across the estate's watcher, heartbeat, and wake-primitive surfaces,
  each carrying a mnemonic identifier, its explicit dependencies, and
  an attested characteristic failure. States the partial order and its
  incomparable pairs, the reading rule, the self-observation corollary
  with its never-self-certifiable set, the two external instruments,
  the class-to-decision rule, the Platform Liveness Declaration
  obligation with its three answer states and transition landing, and
  the absence conjunction. Reviewed pre-landing by the four-seat
  quorum the graduation-quorum record requires. Authored by the
  Director on owner instruction; **Status stays Proposed pending owner
  ratification**, per the doctrine-record gate.
