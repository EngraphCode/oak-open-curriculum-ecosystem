# Agent-tools architecture: purpose, effect, and the negative space

**Date:** 2026-08-01

**Author:** Possum turns Nocturne (019fbc)

**Status:** Purpose-first continuation of the initial concept exploration;
evidence and a strategic frame, not an implementation decision

**Current-source baseline:** origin/main at
6453516d536cc27b9761815f6f408022f50908ec. Dated decisions, plans, reports,
and incident records are used as evidence of trajectory and experience, never
as present-system verdicts.

**Companion close-up report:** Agent-tools architecture: present-system concept
exploration, delivered on PR #686. That report's evidence remains useful. This
continuation changes the system boundary and therefore changes how the evidence
is ranked.

## Why this continuation exists

The first pass asked whether the TypeScript workspace was internally coherent:
activation lifecycle, generation identity, authority and projections, mixed
process compatibility, bootstrap exposure, and decomposition. Those were good
questions at implementation and mechanism altitude.

The owner then asked the more important questions:

- What is this system for?
- What intent and impact should it serve?
- Which questions have we asked, which should stop leading, and which have we
  not considered?
- What occupies the apparent negative space between the existing conclusions?

That prompt exposed a boundary error in the earlier review: it treated
agent-tools as the system. Widening the boundary to include all product delivery
and mission impact would create the opposite error.

The **system of interest** for this review is the portable Practice, its host
phenotype, and the human-agent work process they enable. Product delivery,
adopters, teachers, pupils, model and platform suppliers, and mission outcomes
form its **external environment**. They matter through boundary contracts:
delivery and assurance evidence move outward; outcome and correction evidence
move inward.

The TypeScript implementation is complicated. The system of interest is also
complex, human, and institutional. Dependency graphs can illuminate the former;
they cannot, by themselves, judge the latter.

## Direct answer: what the system is for

The system helps people turn consequential intent into trustworthy work that
contributes to publicly useful outcomes, without losing judgement,
accountability, learning, or control.

At successive altitudes:

1. **Operationally**, it makes agent work discoverable, coordinated,
   observable, safe, and repeatable through identity, communication, claims,
   lifecycle, policy, assurance, curation, and evidence.
2. **Organisationally**, it lets people direct a larger delivery capability
   while retaining judgement, taste, accountability, correction, and the right
   to interrupt. Agents carry toil and scale; people remain responsible for
   whether the work is worth doing and whether it is good.
3. **Strategically**, it aims to deliver rigorous digital products at greater
   reach and pace, while producing an open Practice that other teams can adopt.
4. **Missionally**, it supports teachers and ecosystem builders to use Oak's
   rigorous curriculum more effectively, with pupils as the ultimate intended
   beneficiaries.

The purpose is therefore not maximum agent throughput, maximum parallelism,
perfect rule conformance, or a pristine CLI architecture. Those are means, not
ends; the Practice should leave people better able to direct trustworthy work
together.

## The intended human-led capability loop

~~~mermaid
flowchart LR
    subgraph S[System of interest]
        H[Human intent and governed decision rights]
        P[Portable Practice]
        T[Host phenotype]
        W[Human-agent work]
        L[Practice learning]

        H -->|directs| W
        P --> W
        T --> W
        W -->|live evidence, correction, interruption| H
        W -->|experience| L --> P
        H -->|accountable decision| P
    end

    subgraph E[External environment]
        D[Product and delivery effects]
        U[Adoption and use]
        M[Mission outcomes]

        D --> U --> M
    end

    W -->|delivery and assurance evidence| D
    D -->|work-episode feedback| H
    U -->|adoption feedback| H
    M -->|slow strategic evidence| H
~~~

The `H` node is visual shorthand, not one omniscient person. Each
consequential decision must distinguish who may authorise evidence collection,
interpret it, interrupt or veto action, accept risk, challenge or appeal a
conclusion, and resolve conflict. Keeping a signal does not confer authority
over the decision it informs.

The loop runs at different speeds and under different custody:

| Loop | Signal and decision scale |
| --- | --- |
| Fast operational | Current world, authority, interruption, and recovery inform an immediate continue, stop, retry, or restore decision |
| Work episode | Human attention, correction, rework, and delivery quality inform a workflow or tool decision |
| Practice learning | Recurrence and onboarding evidence inform a rule, memory, mechanism, or retirement decision |
| Slow strategic | Adoption, product, and mission evidence—held by Oak and real users—inform priorities and investment |

The architecture review has accumulated strong evidence inside the host
phenotype and parts of the fast loop. It has much weaker evidence for the
work-episode, Practice-learning, and slow strategic feedback loops. Their
latency, custody, and decision rights must remain distinct: slow and noisy
mission evidence cannot gate an immediate safety decision, and runtime telemetry
cannot stand in for public value.

That asymmetry is the largest negative space.

## Who the system is for

The beneficiaries are layered, and a sound architecture must not collapse them
into a single generic user.

| Beneficiary | Intended change |
| --- | --- |
| Oak's people directing and reviewing work | More ambition and delivery capacity per unit of human attention, with meaningful control and accountability preserved |
| AI agents doing the work | Clear, deterministic, safe, live, and corrigible working conditions; good agent experience is instrumental and ethically relevant, not an end detached from value |
| Future contributors and future sessions | Less rediscovery, recoverable intent, cheaper onboarding, and accumulated learning |
| External Practice adopters | A genuinely portable, understandable way to work agent-first without inheriting Oak-specific machinery |
| Ecosystem builders | Lower cost and risk when building trustworthy products on open educational data |
| Teachers and curriculum leaders | Better access to rigorous, adaptable material in the tools they choose |
| Pupils | The ultimate intended mission benefit |

This layering matters. A tool can delight its immediate agent user while
increasing human review burden. It can improve delivery metrics while weakening
teacher outcomes. It can be internally rigorous while making the outward
Practice impractical to adopt. Local success is not system success.

Beneficiary is not the same role as owner, operator, or risk bearer. A useful
architecture must also make visible who owns a capability and its decisions,
who operates it, who keeps each feedback signal, who can authorise change or
retirement, which supplier controls a dependency, who bears security, privacy,
or safeguarding risk, and who tried but failed or was excluded from adoption.
These roles expose interfaces and consequences; they are not a request for a
larger stakeholder catalogue.

## A boundary correction

Current primary sources distinguish the portable Practice from its optional
host-local implementation. This exploration adds the human-agent work process
to form the bounded system of interest; that three-part model is a synthesis,
not a taxonomy already declared by the sources.

The negative space first appeared to be an **effect layer** beyond the existing
philosophy → structure → tooling model. Pressure-testing shows that “layer” is
too static and conflates three different architectural contracts:

1. A **capability contract** names the actor, operator, owner, mechanism,
   authority, criticality, failure, recovery, and consequential decision
   rights.
2. An **effect hypothesis** names the beneficiary, intended outcome, harm
   prevented, total cost, and assumptions.
3. A **feedback contract** names an observable signal, provenance and coverage,
   custodian, decision owner, freshness or expiry, missing-data meaning,
   confidence and known confounders, the decisions it may and must not affect,
   and the interim rule while evidence is unavailable.

Together they form an **outcome-and-feedback boundary** that closes a human-led
capability control loop. No comparably complete contract was found in the
surfaces inspected for this review. That is narrower than claiming that the
estate has no outcome thinking: strategy correctly keeps much impact evidence
with Oak and real users. The architectural gap is the weakly specified route by
which that external evidence can change the priorities, shape, or retirement of
the Practice and host phenotype.

People-derived signals add a conditional information-governance boundary:
approved purpose, minimisation, access, retention and erasure, permitted use,
subject rights, supplier transfer, and safeguarding escalation. Content-free
aggregates should be structural where they can answer the question, but are not
automatically anonymous: suppress sparse cohorts and rare combinations, provide
no individual drill-down, and treat any re-identifiable aggregate as personal
data. This FRAME-1 learning inquiry does not use or transfer pupil-level data;
any future pupil-data case belongs outside this node under separate safeguarding
authority.

This exploration authorises neither new collection nor secondary processing,
linking, or re-analysis of existing people-derived evidence. Any workplace
proposal needs a separately approved purpose and lawful-basis assessment,
transparent staff information or consultation, a data-protection impact screen,
and an explicit ban on covert monitoring, performance or disciplinary use, and
individual profiling. Privacy, security, and safeguarding review precedes any
such proposal.

## What the close-up review asked well

The earlier review asked valuable questions:

- Which activation lifecycle does a command need?
- Can a running process identify the generation it loaded?
- Which representation is authoritative and which is a projection?
- What happens when old readers and new writers overlap?
- Does bootstrap or build coupling create material cost or failure exposure?
- Would physical decomposition reduce actual change cost?

These remain necessary. They are not sufficient.

The modular-control-plane-monolith description is a useful local model of the
workspace. It is not a complete model of the Practice, its users, or its effect.

## Questions that should stop leading

These questions need not disappear. They should stop being the first or
highest-level question.

| Stop leading with | Ask first instead |
| --- | --- |
| Is agent-tools too large? | Which capability, beneficiary, lifecycle, and consequence does each part serve? |
| Should the package be split? | Which capabilities need independent ownership, failure containment, activation, or portability? |
| Does the implementation conform to an ADR, PDR, or plan? | Does the present system work well on its own merits, and what does the dated record teach us about its trajectory? |
| Can every activation path be uniform? | What stability, freshness, lifetime, and recovery contract does this capability require? |
| How many gates, validators, checks, or health signals exist? | Which material harm or positive outcome does each control influence, and what evidence shows that it pays for itself? |
| How do we cure each recorded friction? | Should the tool, rule, or ceremony generating that class of friction exist in its present form? |
| How do we reduce cost per coordination event? | What useful outcome or avoided failure repays the total coordination burden? |
| How can agents become more autonomous? | Which delegation expands human capability while preserving legibility, interruption, and accountability? |
| Which seam should be instrumented next? | What live decision could the signal change? |
| Can one registry or graph remove all drift? | Which authority relationship needs to be explicit, and is representation the actual constraint? |

The key correction is not anti-rigour. It is refusing to mistake control
activity, internal consistency, or structural neatness for effect.

## Questions not yet integrated into the architecture frame

### Human agency and legibility

- What does “the human expert leads” mean operationally?
- Which decisions must remain human, which can be delegated, and which can be
  reversed without prior approval?
- Can a human understand why consequential agent action occurred, not merely
  which command ran?
- How quickly can a human redirect or stop work, and what state remains
  trustworthy after interruption?
- Does greater formal control create meaningful human agency, or merely more
  approval and reading burden?

### Value and effect

- For every major capability family, who is the immediate user, who is the
  beneficiary, and what observable improvement should it cause?
- Which capabilities materially protect rigour, reach, or pace, and which
  mostly manage complexity introduced by the Practice itself?
- What evidence would justify deleting a tool or rule?
- How does real product and user evidence feed back into architecture
  priorities?

### Positive capability and creative range

- Is the system better at preventing bad work than enabling excellent new work?
- What senses discovery, usefulness, creative range, good judgement, and
  unexpectedly valuable outcomes?
- Does strictness create a trustworthy platform for initiative, or teach
  compliance performance and risk avoidance?
- Does multi-agent work create insight and option value that a single agent
  would not, or only distribute execution?

### Total cost and proportionality

- Does the substrate reduce total human attention per high-quality outcome, or
  move work into less visible coordination and verification?
- What is the full cost of an outcome: human attention, elapsed time, agent and
  compute use, review load, re-grounding, recovery, and onboarding?
- How should the required substrate change for solo work, a short paired task,
  a long-lived team, and a cold external contributor?
- At what scale does coordination change phase from enabling to dominating?

### Learning and corrigibility

- Does captured experience demonstrably reduce recurrence, improve decisions,
  or shorten onboarding?
- Which successes and quiet failures never enter a friction-led learning
  corpus?
- How does the system prevent local scars from becoming permanent universal
  constraints?
- What is deliberately forgotten, who decides, and how can a future reader
  distinguish durable principle from path-dependent habit?
- Can outside evidence overturn a self-consistent rule and assurance system?

### Portability and access

- Can weaker models, different vendors, smaller teams, unfamiliar humans, cold
  machines, and external organisations use the Practice successfully?
- Is open availability becoming practical adoptability?
- Does cross-vendor standardisation preserve useful native strengths, or
  converge on the lowest common denominator?
- If the TypeScript phenotype vanished, which Practice capabilities would
  remain understandable and usable?

### Trust, resilience, and governance

- Which capabilities are critical enough that unrelated experiments or
  analysis must not interrupt them?
- What is the trust model for agents sharing one user account, filesystem, and
  mutable state? Identity is not automatically authenticity or authority.
- Which data should never enter shared logs or memory, and how are privacy and
  safeguarding preserved when experience is reused across participants?
- How does the system contain a compromised, mistaken, or misconfigured
  participant rather than treating every failure as cooperative?
- How are dissent, minority evidence, and competing interpretations preserved
  inside a self-reinforcing learning system?
- Who can change the Practice, on what evidence, and who bears the downside of
  a wrong constraint?

### Sustainability

- Does the capability gained justify its ongoing maintenance, context, compute,
  and attention cost?
- Which energy, environmental, or supplier externalities are hidden by a cheap
  local interaction, and who is accountable for them?
- Is the system overfitted to current model limitations or platform quirks?
- Which mechanisms become simpler or disappear as models and native platforms
  improve?

## The negative space is not empty

The apparently empty centre between the existing conclusions is relational,
not modular. It contains:

- human attention and judgement;
- shared reality and trust;
- authority, legitimacy, and interruption;
- creative capacity and initiative;
- total resource cost and opportunity cost;
- adoption effort and accessibility;
- product usefulness and public value; and
- the causal arrows joining tools to those effects.

A useful first name was the **effect layer**. Its more exact shape is the
outcome-and-feedback boundary: three contracts closing several human-led loops,
not another module or one more tier of the tool stack.

The strongest reframed finding is:

> The estate has a richly modelled control plane and much weaker
> outcome-and-feedback contracts. It can increasingly prove which rule fired,
> which process ran, which state is current, and which artefact passed. It
> cannot yet show with comparable clarity whether human agency expanded, total
> effort fell, decisions improved, learning compounded, external adoption
> became easier, or mission value increased—and then connect that evidence to
> the right decision at the right timescale.

This does not invalidate the seam findings. It explains why they matter and
how they should be ranked.

## A deeper common invariant behind the seam findings

The close-up findings are not a random collection of tooling defects. Viewed
from purpose, they cluster around one deeper requirement:

> A participant must be able to establish which world is current, understand
> its authority, remain mutually aware with other participants, act within
> human intent, prove the effect of that action, recover from interruption,
> and leave learning that improves future work—without the substrate becoming
> the work.

| Close-up finding | Purpose-level meaning |
| --- | --- |
| A running process cannot attest the build generation it loaded | Shared reality is incomplete; an agent may reason correctly about the wrong world |
| One incompatible comms record can block all later unseen events | Mutual awareness can fail while the process still appears alive |
| Authority and projection are sometimes implicit | Participants may act on a coherent but non-authoritative representation |
| Compile, publication, and runtime boundaries are misaligned | Unrelated change can threaten the availability or coherence of an operational substrate |
| Activation families are implicit | Stability, freshness, and recovery expectations cannot be reasoned about from the interface |
| The source graph is cohesive but contains a credible workflow-build seam | Physical structure is a downstream choice; capability and lifecycle evidence can support narrow extraction without justifying broad decomposition |

The shared concern is whether participants can identify trustworthy state,
coordinate safely, and show that their work improved the outcome—not whether
the package is structurally pure.

## Close-up continuation: findings conserved at their proper altitude

These findings were gathered before the purpose reset. They remain useful
mechanism evidence and are recorded here so the higher-altitude turn does not
lose them.

### 1. Loaded generation has a narrower observability gap than first stated

Several adjacent identities are observable today:

- Git identifies the checkout now;
- the root release identifies released main;
- Turbo computes a hash of current build inputs;
- filesystem hashes can identify files currently on disk; and
- watcher heartbeat identifies a process and its lifetime.

No inspected runtime surface durably binds an already-running agent-tools
process to the build-input or output generation it loaded. Lifecycle JSON,
help, health, and watcher heartbeat omit that identity. A manifest read afresh
from disk would not close the gap because an in-place rebuild can replace it
while a Node process keeps the older modules in memory. Any generation
identity intended to answer this question must be captured at process start or
compiled into the artefact.

The earlier phrase “generation is not observable” was too broad. The surviving
claim is specifically about loaded-code generation.

### 2. Mixed-generation comms failure is an observed exposure

The old-reader/new-event cell is not merely static possibility. On 2026-07-30,
an optional in_response_to field written by a newer process was rejected by a
strict older reader. The watcher retried the same unseen batch, delivered
nothing behind the record, and remained process-live. Recovery required a
reader that understood the event and a re-arm against the unchanged cursor.

The current mechanism has useful properties: strict authoring catches drift,
the cursor does not advance over an unread record, and the event is not erased.
The failure is availability and truthful liveness. Authoring strictness,
operational reading, and incompatibility recovery are different contracts even
when they concern one schema.

### 3. Compile, publication, and runtime boundaries are misaligned

On the current baseline:

- tsconfig.build.json includes all 870 source TypeScript/TSX files, including
  214 colocated tests;
- the unified built CLI's static runtime closure is about 216 modules, and four
  representative hot operational surfaces together reach about 247 modules;
- bootstrap publishes directly into the live dist directory with no staging,
  generation directory, or atomic switch;
- TypeScript 6.0.3 has noEmitOnError false in this configuration, so a red
  compile can still mutate emitted output before bootstrap exits;
- the root check cleans dist before rebuild, creating a current start-up
  availability window for new CLI and hook processes;
- later workflow verification can fail after TypeScript has already emitted;
  and
- the full check invokes the agent-tools build more than once.

A controlled hash probe also established that Turbo excludes a colocated unit
test from the declared build-input hash while TypeScript compiles and emits
that file. A comment-only change to
src/core/cli-arg-parser.unit.test.ts left the Turbo build hash unchanged at
af2419f818d2476f, then a direct TypeScript build changed the emitted test JS.
Source-based type-check and tests still protect product correctness; the
finding is that the cached distribution is not a faithful complete projection
of the TypeScript build closure it claims as output.

Current health is good: the inspected dist was coherent and runnable. Historical
loader and watcher incidents plus unchanged publication mechanics establish
exposure, not a current outage.

This evidence separates three possible responses:

- a runtime build profile addresses unrelated-domain compilation and test
  emission;
- atomic or versioned publication addresses missing and mixed-generation
  windows; and
- package extraction addresses ownership, API, portability, or independent
  lifecycle.

They are not interchangeable.

### 4. Broad package decomposition remains unwarranted

At origin/main 6453516d5, dependency-cruiser reported zero dependency
violations and no module cycles. A production-only aggregation found 651
resolved modules and 1,679 internal import edges; 80.6 percent stayed inside
one top-level domain. Since 2026-04-01, 78.4 percent of commits touching
agent-tools source changed one top-level domain; excluding composition/shared
bin and core, 88.9 percent changed at most one feature domain.

That is evidence of real module and change cohesion. It argues against
splitting every directory into a package.

One candidate deserves future measurement: workflow-build is a small,
module-agnostic shared kernel used by both corpus-analysis and
restatement-audit, with no outgoing dependency on another agent-tools domain.
It has a plausible reusable boundary. Its independent lifecycle and external
consumer value are not yet established, so feasibility is not yet warrant.

The present conclusion is:

- keep the broad no-split verdict;
- recognise one credible narrow extraction candidate;
- test build profile and publication boundaries separately; and
- decide from capability, lifecycle, portability, and observable payoff rather
  than an acyclic directory graph.

## Purpose-derived architecture qualities and system outcomes

The following are candidate judgement criteria, not a new universal checklist.
They are derived from the intended effect:

1. **Trustworthy shared state** — participants can identify current state,
   generation, authority, and uncertainty.
2. **Legible human control** — consequential action remains understandable,
   interruptible, and accountable.
3. **Continuity and recovery** — critical awareness and coordination survive
   unrelated change and fail in a visible, recoverable way.
4. **Proportionality** — coordination and assurance burden scales with risk,
   reversibility, and team shape.
5. **Learning that can be corrected** — experience improves future work and
   remains open to disconfirming outside evidence.
6. **Portability and substitutability** — the Practice capability survives a
   change of vendor, language, repository, or local implementation.

Three further properties judge the system that those qualities create rather
than stand beside them as structural attributes:

- **Creative usefulness:** worthwhile initiative and new capability emerge, not
  only rule compliance.
- **Connection to outcomes:** internal activity remains connected to human,
  product, adoption, and mission effects.
- **Calm operation:** rigour is easy to trust and use; the substrate does not
  demand more attention than the risk or value warrants.

Together they provide a better basis for future build and package decisions
than file count or consistency alone.

## Free-play harvest: associations, not findings

### Kept

- **Exoskeleton:** the substrate should amplify human strength. If operating
  and maintaining it consumes the attention it is meant to free, amplification
  has inverted.
- **Epistemic commons:** generation, authority, comms, and memory are ways a
  group maintains shared reality. Their architecture is partly governance of a
  commons, not merely data plumbing.
- **Immune system with weak proprioception:** the Practice has rich
  violation-detection and correction loops, but weaker sensing of whether the
  whole system is thriving. The association points toward effect signals and
  the risk of an autoimmune control system; it does not prove either.
- **City infrastructure:** an analytical laboratory and an emergency
  communications service can share a city without sharing a failure domain.
  This suggests classifying criticality before packaging.
- **Trellis:** constraints can enable growth, but a trellis designed around
  yesterday's plant can also determine what is allowed to grow. This points to
  corrigibility and deletion conditions.

### Discarded

- **“Agent-tools should become a microkernel.”** This turns a metaphor into a
  solution before the capability boundaries are known.
- **“Many scripts prove bureaucracy.”** Breadth may represent legitimate
  capability. Only effect and total-cost evidence distinguish infrastructure
  from accretion.
- **“Every capability needs a KPI.”** Forced measurement would Goodhart
  unquantifiable values. Mixed evidence and decision-relevant signals are the
  requirement, not universal metrics.
- **“Human-led means more approval gates.”** This confuses leadership with
  procedural control. Clear intent, visibility, interruption, and meaningful
  decisions may reduce approvals.
- **“One graph will reveal the outcome-and-feedback boundary.”** A graph may
  address knowledge relations; representation alone cannot supply causal or
  real-world evidence.

## Reframed problem

### Gap

In the surfaces inspected, internal activity is much easier to inspect than its
effects on human effort, decisions, adoption, delivery, and public value. The
missing architectural link is a proportionate feedback contract between tools,
those effects, and a named decision.

### Who bears the uncertainty and possible downside

- humans may spend attention on a substrate whose net amplification is hard to
  judge;
- agents can face local friction and invisible failure without a shared account
  of which capabilities are critical and why;
- future maintainers can improve internal consistency while still missing
  value;
- external adopters may receive an open but impractically heavy system; and
- product and mission beneficiaries bear the opportunity cost when internal
  optimisation displaces outward value.

### Current causal hypothesis

Concrete incidents generate tools, rules, checks, and documents. The learning
loop is effective at conserving and enforcing those local lessons. Because the
outcome-and-feedback boundary is weakly specified, architecture may optimise
the visible internal proxies—correctness, conformance, friction count, event
cost, gate coverage, document fitness—more readily than human leverage,
creative usefulness, adoption, or product effect. The result can be locally
excellent mechanisms whose system contribution remains assumed. This is a
causal hypothesis for the inquiries below, not an established diagnosis.

### Constraints

- the human expert remains in the lead;
- truthfulness, rigour, accountability, and architectural quality remain
  invariant; every present rule, gate, ceremony, and implementation mechanism
  remains corrigible and replaceable;
- the portable Practice remains distinct from the Oak/TypeScript phenotype;
- impact measurement keeps its legitimate Oak and user custody;
- the current source graph's cohesion and successful operation are real
  counter-evidence to speculative restructuring; and
- this exploration authorises no production change or package split.

### Success

The system becomes judgeable across its boundary without pretending to own its
environment. Decision-bearing capabilities have explicit capability contracts,
effect hypotheses, and feedback contracts. Technical boundaries follow
consequence and lifecycle. Decision rights, evidence limits, and
information-governance obligations remain visible. Learning is promoted and
reversed within a bounded blast radius. Human attention and legitimately
external evidence can change architecture priorities. The Practice remains
rigorous, but its rigour feels calm because every burden has a visible reason
and payoff.

## Candidate next inquiries

Each proposal is evidence acquisition, not an accepted delivery programme.

### A. Trace real work journeys

Define the eligible population first and predeclare a small selection rule that
cannot quietly omit failure: include smooth work, correction-heavy work, failed
or explicitly abandoned work, and silent abandonment or failed adoption where
the source evidence permits. Trace each selected episode from owner intent
through tool interventions to product or Practice outcome, human attention,
rework, and conserved learning. Compare the result with the simpler current
decision process and inspect a later outcome or uncertainty reduction, not just
whether a decision changed.

**Warrant:** this tests the missing causal arrows using real work rather than
inventing a KPI estate.

**Falsifier:** if current evidence supports decisions equally well with less
burden, use it and stop. If an outcome cannot be reconstructed, report that
limitation; do not treat it as proof of an architectural defect unless a named
decision actually requires reconstructability.

### B. Derive the minimum contracts from the traces

For only the capabilities attached to a live decision exposed by the journeys,
record the minimum useful distinction among:

- capability contract: actor, operator, owner, authority and appeal rights,
  criticality, failure, recovery;
- effect hypothesis: beneficiary, outcome, harm prevented, cost, assumptions;
  and
- feedback contract: signal provenance and coverage, custodian, decision owner,
  freshness and expiry, missing-data meaning, confidence and confounders,
  permitted and prohibited decisions, interim rule, and deletion or
  simplification condition.

Also distinguish the portable Practice contract from its host phenotype.
Where a signal derives from people, add the information-governance boundary
before collection or secondary analysis. Do not treat existing evidence as a
licence for a new purpose, and do not use pupil-level evidence in this FRAME-1
inquiry.

**Warrant:** package, activation, and assurance choices are currently discussed
without one shared outcome and consequence model, but an estate-wide ten-field
inventory could become the next substrate.

**Falsifier:** if the bounded contracts add no priority-changing information,
retain the seam-centred review and do not expand the map.

### C. Test learning promotion and reversal

Follow one candidate lesson from local experience toward wider Practice. Test
the controls that prevent a mistaken, compromised, or path-dependent signal
from becoming a universal constraint: quarantine, independent corroboration,
scoped trial, preserved dissent, bounded blast radius, rollback, and deliberate
retirement.

**Warrant:** the current learning loop is strong at retaining and enforcing
lessons; its system-level risk is a bad lesson propagating successfully.

**Falsifier:** if the current promotion path already supplies those controls
with recoverable evidence, document and use it rather than adding governance.

### D. Classify criticality before failure domains

Distinguish critical coordination/awareness, assurance, learning/analysis, and
disposable experimental capabilities. Then test which compile, publication,
runtime, and process failures may legitimately be shared.

**Warrant:** the close-up evidence shows these boundaries are currently
misaligned, while the source graph remains cohesive.

**Falsifier:** if controlled failure trials show unrelated changes cannot
materially impair critical capability, do not add build or package boundaries.

### E. Close the outcome-feedback contract

Name the minimum set of mixed signals that can actually redirect the system:
first-attempt AX, human correction/attention, recurrence reduction, delivery
quality and pace, external adoption effort, and Oak-held real-world impact.
For each, name its provenance and coverage, custodian, decision owner, freshness
and expiry, missing-data meaning, confidence and confounders, permitted and
prohibited decisions, and the interim rule while evidence is unavailable. Keep
custody where it belongs. Apply an explicit information-governance boundary to
any people-derived signal before collecting or re-analysing it.

**Warrant:** current strategy correctly keeps impact grounding with Oak, but
architecture has no explicit review trigger from that signal.

**Falsifier:** if a current governance or planning mechanism already ingests
those signals and demonstrably changes tool priorities, document and use it
instead of creating another surface.

### F. Test practical portability

Run one bounded adoption journey on a different vendor or host with the
TypeScript phenotype unavailable or deliberately minimal. Observe which
Practice capabilities remain understandable, which require local
implementation, and how much adopter knowledge and effort are needed.

**Warrant:** openness and plain-text portability are stated strategic
advantages; current evidence is strongest inside the originating repo.

**Falsifier:** repeated external adoption already proves the same journey with
recoverable evidence; use that evidence and do not stage a demonstration.

## Planning implication

The immediate planning object is not a package-refactor plan. The companion
born-sketch strategic node, outcome-informed-practice-learning.plan.md, records
the FRAME-1 learning hypothesis and success conditions. It deliberately leaves
operational continuity, FRAME-2 adoption, FRAME-3 reuse, and product or mission
outcomes under their own strategic choices. It governs no work until owner
ratification. Delivery plans, tickets, build profiles, publication changes, or
package extractions follow only when a bounded inquiry makes one necessary.

Before ratification, the node needs an explicit privacy, security, and
safeguarding judgement on any people-derived evidence proposal, and agreement
that its decision-rights, noisy-evidence, promotion, reversal, and strategic
scope boundaries are sufficient. The report is ready to conserve those as open
obligations; it does not pretend they are implemented.

The strategic bet itself is falsifiable: if a predeclared bounded set of
contrasting work journeys shows that the three-contract model does not improve
a later outcome or decision, reduce recurrence or material uncertainty against
the simpler current process, or its attention cost exceeds the gain, narrow or
retire the sketch and retain the seam-centred review.

The older agent-tools architecture-standard plan remains useful dated evidence.
Its invocation, dependency, error, encoding, hook, and knowledge-layer strands
are several decisions wearing one plan name. They should be re-evaluated
against the human-led capability loop rather than executed as a single
architecture programme.

## Decisions deliberately not made

- No package, service, or workspace split is recommended.
- No build-profile or atomic-publication implementation is authorised.
- No schema compatibility policy is selected.
- No new universal metric or dashboard is proposed.
- No people-derived data collection or secondary processing, staff-monitoring
  surface, or pupil-level data flow is authorised.
- No current ADR, PDR, plan, or rule is treated as a compliance verdict.
- No claim is made that the Practice fails its purpose; the inspected surfaces
  specify control evidence much more completely than outcome-and-feedback
  contracts.
- No strategic plan is presented as ratified.

## Evidence map

Current purpose and strategy:

- VISION.md
- docs/strategy/README.md
- docs/strategy/diagnosis.md
- docs/strategy/alignment-and-streams.md
- docs/strategy/stream-agentic-framework.md
- docs/strategy/measures.md

Current Practice and implementation boundary:

- .agent/practice-core/practice.md
- .agent/directives/user-collaboration.md
- .agent/directives/principles.md
- agent-tools/README.md
- agent-tools/package.json

Dated trajectory and prior evaluation:

- PDR-035, PDR-111, ADR-119, and ADR-165
- ADR-201 and ADR-218 as dated privacy, custody, and external-evidence examples
- .agent/reports/agent-experience-cause-class-analysis-2026-06-21.md
- .agent/reports/oak-repo-professionalism-engineering-quality-report-2026-06-03.md
- .agent/plans-backlog-2026-07/agent-tooling/current/cost-of-collaboration.plan.md
- .agent/plans-backlog-2026-07/agent-tooling/future/agent-tools-architecture-standard.plan.md

Current implementation and direct probes:

- agent-tools/tsconfig.build.json
- turbo.json
- package.json
- agent-tools/src/bootstrap/bootstrap.ts
- agent-tools/src/bin/agent-tools-cli.ts
- agent-tools/src/collaboration-state/
- the origin/main dependency graph and change history at the named baseline

## Conservation and metaloss audit

The altitude reset could easily have discarded the close-up evidence as “too
technical”. This report instead conserves it under the purpose it serves. It
also preserves counter-evidence: current health is good, source cohesion is
real, warm costs are modest, strict parsing prevents silent erasure, and
portable impact custody legitimately sits partly outside the repo.

A second pass checked for loss across:

- purpose, beneficiaries, and causal chain;
- questions asked, stopped, and newly exposed;
- human agency, effect, creative usefulness, cost, learning, portability, trust,
  decision rights, privacy, safeguarding, evidence delay, and sustainability;
- confirming and disconfirming technical evidence;
- kept and discarded free-play associations;
- assumptions, warrants, falsifiers, and decisions not made; and
- the relationship between the report and the born-sketch plan.

No further material class emerged from the evidence examined. This is a fixed
point for this continuation, not completion of the ongoing architecture
review.
