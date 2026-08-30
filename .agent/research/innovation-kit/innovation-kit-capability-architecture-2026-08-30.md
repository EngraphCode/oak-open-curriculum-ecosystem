# Oak Innovation Kit capability architecture — removing the compromise between fast and good

<!-- markdownlint-disable MD013 MD060 -->

- **Date:** 2026-08-30
- **Status:** Provisional whole-system research synthesis; no implementation architecture or provider selected
- **Decision class:** Capability, contract, composition and proof map for owner review
- **Strategic relationship:** Research input to the owner-declared Innovation Kit value stream and the `innovation-kit` strategic node; strategy authority remains in `docs/strategy/`
- **Evidence pin:** PR 25 head [`4915fe1826372d9b0b6ee18322500c811128f41c`](https://github.com/EngraphCode/oak-open-curriculum-ecosystem/commit/4915fe1826372d9b0b6ee18322500c811128f41c)

## Executive finding

The Innovation Kit should be the complete, governed path from a consequential idea to an
excellent working experience, trustworthy evidence, an authorised disposition, reusable
learning and eventual elevation or retirement.

Its purpose is not to make low-quality prototypes faster and repair them later. It is to remove
the apparent compromise between speed and quality by investing up front in the recurring
capabilities, contracts, composition rules, developer workflows, lifecycle machinery and
assurance that make quality the easiest path. Novel work should remain novel; recurring product,
engineering, trust and operational work should become prepared, visible and reusable.

The primary finding is the whole creation-and-elevation system, not a production-foundations gap
list. Managed relational persistence, SQL, migrations, typed data access, object storage, jobs and
derived-index operations are real gaps in the current reusable estate, but they are diagnostic
examples of the earlier analysis stopping too soon. The deconstruction had already identified the
larger mandate: educational and product outcomes, curriculum and information authority,
interaction and visual language, host composition, accessibility, identity, rights, state,
delivery, observability, support, evidence, correction, governance and preservation. The earlier
synthesis failure was not absence of those findings; it was failure to consume and promote them
into the Kit definition.

The working definition is therefore:

> **The Oak Innovation Kit is a deliberately governed capability-composition and product-creation
> system that makes excellent, production-ready demonstrations cheap to create and keeps their
> unchanged semantic core cheap to elevate, while making every newly activated obligation,
> binding, risk and proof explicit.**

“Production-ready demonstration” means complete for its declared audience, claims and activated
capabilities. “Cheap to elevate” is a falsifiable cost-of-change claim. It does not mean zero work,
that every demonstration is a product, or that a new audience, write path, right, scale target or
service obligation can be activated without additional capability and evidence.

### How to read and use this synthesis

| Surface | Question it answers | Authority |
| --- | --- | --- |
| [Innovation Kit strategy](../../../docs/strategy/stream-innovation-kit.md) | Why this value stream exists and which durable outcomes matter | Strategic front |
| [`innovation-kit` strategic node](../../plans/strategic/innovation-kit.plan.md) | What success boundary is currently proposed for the shared fast-and-good path | Sketch until owner ratification |
| This research synthesis | What the whole system may need, what the current estate demonstrates and what could falsify the model | Provisional evidence and hypotheses |
| [Capability-architecture delivery plan](../../plans/delivery/innovation-kit-capability-architecture-definition.plan.md) | Which review, owner decisions and proofs must turn the synthesis into an actionable boundary | Sketch; no implementation authority yet |

For a new proposition, use the synthesis in this order: declare the people, outcome, claim and
decision owner; retain the difficult states and alternatives; map activated and deliberately
omitted capabilities; select the smallest honest profile; name the comparator and falsifier; then
decide which mechanisms remain proposition-specific and which recurring burden is a candidate for
the Kit. The atlas is a question set, not a requirement to select technology from every row.

## 1. Authority and claim boundary

Owner direction establishes the desired impact: invest in exceptional quality, modularity and
developer experience so fast and good reinforce one another. The
[Innovation Kit strategy](../../../docs/strategy/stream-innovation-kit.md) and
[strategic node](../../plans/strategic/innovation-kit.plan.md) remain the durable strategic
surfaces. This report investigates what the Kit would need to make that bet credible; it neither
ratifies a target architecture nor converts research hypotheses into repository obligations.

The relocated [web-app deconstruction](./web-app-deconstruction/README.md) is evidence. Its
[research charter](./web-app-deconstruction/docs/research-charter.md) is unusually direct about
the intended outcome, and its
[ecosystem-enablement synthesis](./web-app-deconstruction/docs/synthesis/ecosystem-enablement.md)
already names the Kit as a product for developers, product teams, partners and integrators. The
corpus is pinned historical analysis. It can establish encoded mechanisms, accumulated difficult
cases and candidate obligations; it cannot establish present production behaviour, lived user
value, organisational intent or the correct future mechanism.

The twelve deconstruction hypotheses remain hypotheses. The
[hypothesis register](./web-app-deconstruction/docs/hypotheses/README.md) labels them `testing`
with low confidence. They provide discriminating questions about capability ownership, UI
layers, host obligations, domain ports, journey evidence, premise-first design, intrinsic
excellence, release identity, policy, commands, contract transformation and resource delivery.
They do not select those shapes.

The
[provider-independent capability research](../provider-independent-capability-architecture.md),
[ADR-225](../../../docs/architecture/architectural-decisions/225-provider-independent-capability-contracts.md)
and
[PDR-139](../../practice-core/decision-records/PDR-139-provider-independent-capability-composition.md)
support the capability/adapter/binding distinction. ADR-225 and PDR-139 are still **Proposed** at
this evidence pin. Their model is a strong research input, not a binding rule.

Ten owner-supplied Graphify/OCE analyses dated 2026-08-20 were also used as secondary challenge
material. Their useful source-neutral prompts—derived views remain subordinate to authority,
activation differs from file presence, correction and forgetting need explicit semantics,
questions should drive projections, and provider exit needs executable proof—were retained only
where current OCE or the primary deconstruction supports them. Their source-specific product
vocabulary and implementation recommendations are not imported as OCE authority.

The secondary challenge set comprised `graphify-labs-initial-exploration`,
`graphify-concept-reuse-and-mechanism-divergence-protocol`,
`oce-practice-graph-and-agent-tools-analysis`,
`oce-graph-agent-tools-and-practice-development-needs`,
`oce-and-graphify-mit-deep-comparative-analysis`,
`practice-observatory-governed-intervention-and-memory-architecture`,
`oce-graph-tools-immediate-fixes`, `oce-graph-tools-end-state-and-roadmap`,
`oce-through-graphify-design-lenses` and `oce-cool-ideas`. They were owner-supplied session
sources, not copied into the repository. Naming them here preserves the synthesis boundary
without making the derivative reports durable authority.

## 2. What the Kit is—and is not

The Kit combines four planes:

1. **Intent and evidence:** proposition, audience, outcome, comparator, evidence class, claim
   boundary, falsifier, decision owner and disposition.
2. **Composition and product creation:** capability discovery, supported profiles, scaffolding,
   bindings, configuration, local development, examples, diagnostics and upgrade paths.
3. **Runtime and production capability:** experience shell, Oak/domain/educational capability,
   identity, policy, state, data, jobs, assets, search/graph/AI, observability, delivery and
   recovery.
4. **Assurance and evolution:** generated contracts, tests, accessibility, security, operational
   evidence, migration, promotion, correction, reuse, supersession, preservation and retirement.

The Kit is not:

- an application factory that homogenises distinct propositions or interaction grammars;
- a fixed technology stack or a branded provider bundle;
- a universal database, repository, service or storage interface;
- the Oak Design System, curriculum authority, public capability estate or engineering Practice;
- a collection of demonstrations;
- a hand-maintained catalogue whose file presence is mistaken for activation;
- a lower-quality “prototype tier” with production work deferred; or
- a claim that documentation, conformance, reuse or polish proves human value.

The Kit may own a composition capability, lifecycle, invariant or assurance contract. It must not
absorb another layer's semantic authority merely because several demonstrations use it.

## 3. Method and evidence discipline

The synthesis used four evidence classes:

| Class | Use in this report | Limit |
| --- | --- | --- |
| Owner direction and strategy | Establish desired impact, value boundary and strategic identity | Do not select technical mechanisms |
| Current OCE source and decisions | Establish what is implemented, app-specific, partial, proposed or absent in this repository | Do not prove deployed use, effectiveness or external controls |
| Pinned web-app deconstruction | Recover accumulated outcomes, difficult states, hypotheses and decisive experiments | Historical, mostly static and often inferred; mechanisms are not requirements |
| Secondary comparative analyses | Challenge blind spots and suggest transferable questions | Derivative; never OCE authority without first-hand corroboration |

Current-state classification separates two questions that must not be collapsed:

1. **Implementation evidence:** `demonstrated`, `partial`, `proposed`, `absent` or `unknown`.
2. **Reach and placement:** reusable across the estate, specialised reusable, app-specific,
   externally operated or not yet a Kit capability. This is stated in each row's boundary rather
   than disguised as maturity.

| Implementation state | Meaning |
| --- | --- |
| **Demonstrated** | The capability named in the row has a real implementation and consumer or conformance evidence within the stated reach |
| **Partial** | Some mechanism or evidence exists, but the whole semantic, lifecycle, composition or assurance contract named by the row does not |
| **Proposed** | Research or a Proposed decision describes a direction that is not binding or landed |
| **Absent** | A bounded repository scan found no implementation in the searched product/workspace estate |
| **Unknown** | Source cannot establish the claim, usually because live control-plane, user, legal or operational evidence is required |

No state is a quality score. A deliberate app-specific mechanism can be excellent; a reusable
package can still be ineffective. Keeping evidence from reach prevents a specialised success from
being reported as a general Kit capability and prevents absence of a Kit abstraction from erasing
real app-level work.

Key claims have different epistemic status; multiple reports derived from the same source snapshot
do not become independent corroboration by accumulation.

| Key claim | Status here | Dependence and what would strengthen it |
| --- | --- | --- |
| Up-front investment can make fast and good reinforce one another | **Owner premise / strategic bet** | Owner direction establishes the goal; comparative delivery evidence must establish the effect |
| OCE already has strong reusable curriculum, contract-generation, MCP/agent, search, graph, design and repository-assurance ingredients | **Observed within current repository scope** | Source, decisions and consumers at the evidence pin; deployed effectiveness remains outside the claim |
| The deconstruction contains wider human, educational, product, operational, institutional and custodial knowledge than the previous Kit synthesis used | **Observed in pinned historical analysis** | Traceable corpus coverage; not evidence of present production behaviour or independent field research |
| The Kit should be a complete intent-to-disposition composition and product-creation system | **Inferred architecture hypothesis** | The corpus and current estate make it plausible; unlike propositions and a consequential vertical proof must discriminate it |
| A demonstration can retain an unchanged semantic core while becoming cheap to elevate | **Unearned outcome claim** | Needs a like-for-like bespoke comparator, equal claim/quality boundary, owner-set cost threshold and lifecycle evidence |
| The eventual profiles, adapters, bindings or providers will be effective, portable or worth standardising | **Unearned design claims** | Require proposition-led option research, implementation, adverse-state evidence, independent composition/exit and authorised disposition |

## 4. Architectural grammar

The primary reasoning grammar is about warranted correspondence across human, technical,
institutional and custodial systems:

```text
principal and situated context
→ intended human, educational or public outcome
→ referents and authoritative claims
→ norms, rights and duties
→ permitted operations and effects
→ observations and representations
→ evidence and competent interpretation
→ authorised correction, disposition or preservation
```

A selected design must state which correspondences it preserves, compresses or loses. Product,
service, educational, data, operational and preservation decompositions are legitimate alternative
views; no single software layering is allowed to erase them.

The following is the technical-composition projection of that grammar. It helps select and change
mechanisms after the upstream outcome and authority questions are explicit; it is not the whole
reasoning model:

```text
intended outcome and claim
→ semantic capability contract
→ activated composition profile
→ technology adapter
→ provider binding
→ host and product-specific use
→ claim-specific evidence
→ authorised disposition
```

This grammar keeps six things separate:

- **Authority and lifecycle** own canonical meaning, provenance, retention, correction and
  legitimate change.
- **Capability semantics** own operations, guarantees, absence, failure and recovery meaning.
- **Composition profiles** state which capabilities and obligations are active together and why.
- **Technology adapters** implement protocols or mechanisms such as PostgreSQL, HTTP, S3, RDF,
  OpenTelemetry or an in-process substitute.
- **Provider bindings** own credentials, endpoints, provider types, lifecycle and optional
  control-plane extensions.
- **Hosts and products** own the proposition, interaction grammar, product-specific policy,
  routes, local state and evidence thresholds.

The deconstruction's [meta-analysis](./web-app-deconstruction/docs/synthesis/meta-analysis.md)
supplies the seam rule: a seam becomes material when value, referent, authority, state clock,
projection invariant, evidence regime or stewardship changes. This is more discriminating than
splitting by file type, technology noun, provider or current consumer count.

The same grammar allows explicit absence. A no-effect telemetry sink can be valid for a local
profile; an absent authoritative state capability cannot be silently replaced by process memory.
A reduced search mode may be honest; a response that looks complete while one retriever is absent
is not.

## 5. Ownership model

| Concern | Legitimate upstream authority | Kit responsibility | Demonstration or product responsibility |
| --- | --- | --- | --- |
| Strategic outcome and decision | Strategy and legitimate decision owner | Experiment/evidence contract and workflow | Proposition, audience, comparator, falsifier and requested disposition |
| Curriculum and domain meaning | Curriculum services, public contracts and domain owners | Typed integration, provenance/freshness envelopes, fixtures and conformance | Use case, selection and presentation |
| Educational intent, pedagogy and assessment | Competent curriculum, pedagogy, assessment, research and professional authorities | Composition questions, representative scenarios and minimum provenance/evidence envelopes without claiming pedagogic authority | Learner/teacher proposition, situated teaching and learning design, feedback and claim-specific evidence |
| Visual and interaction language | Oak Design System and accessibility authority | Supported host adapters, composition specimens and assurance harness | Distinct interaction grammar, layout and concept-specific visualisation |
| Engineering Practice | Practice, ADRs/PDRs and repository standards | Automation and product-creation integration | Plan-specific evidence and justified exceptions |
| Application host | Web/runtime platform and applicable trust authorities | Named host profiles, composition, diagnostics and conformance | Routes, chrome, local state and product-specific providers |
| Persistence and services | Domain authority owns enduring meaning and retention | Capability contracts, adapters/bindings, mechanical migration/restore tooling and operational profiles | Domain schema, queries, semantic migrations, lifecycle and product-specific guarantees |
| Identity, rights and policy | Competent identity, safeguarding, privacy and rights authorities | Integrate authority-supplied principal/session/grant contracts through adapters and verification | Roles, journeys and resource-specific policy inputs |
| Search, graph, vector and AI | Authoritative source corpus and owning domain capability | Derived-projection lifecycle, composition, evaluation and telemetry | Retrieval strategy, prompts/interaction and proposition-specific thresholds |
| Observability and operations | Product/service owner sets objectives and responds | Instrumentation, sinks, health contracts, release correlation and runbook patterns | Domain events, SLO values, on-call/support and operational ownership |
| Evidence and learning | Decision/method owner retains claim, method and interpretive authority | Minimum run/provenance/disposition envelope, lineage and return-routing mechanics | Observations, method, interpretation and claim-specific evidence semantics |
| Reusable placement | Owning semantic layer | Kit ownership only when composition, lifecycle, invariants or assurance justify it | Remains local while concept-specific or unproved through unlike use |

Persistence illustrates the boundary: the Kit may own supported transactional-state profiles,
migration mechanics and recovery probes without owning a product's domain schema. Observability
may supply instrumentation and release coordinates without owning the meaning of a domain event
or the decision to respond.

## 6. Contract dimensions that apply to every capability

A capability is not ready for Kit consideration until the applicable dimensions are explicit.
Applicability can vary; silent omission cannot.

| Dimension | Required question |
| --- | --- |
| Outcome and consumer | Who needs this capability, what human/educational/public progress does it enable and what claim is being made; who else is affected or excluded? |
| Educational validity and distribution | Where applicable, what pedagogic or assessment construct, teacher/pupil agency, cognitive load, harmful displacement, equity distribution and affected non-user consequence must be evidenced? |
| Meaning and invariants | What does each operation mean, and what must remain true across normal and adverse states? |
| Authority and duty | Who may define, change, challenge, correct and retire the meaning or state? |
| Identity, state and time | What identifies intent, entity, version, release, attempt and projection; which clocks matter? |
| Dependencies and projections | What is authoritative, derived, cached, generated or externally owned; what loss is accepted? |
| Activation and absence | How is the capability proposed, packaged, installed, registered, served, exercised and shown effective; what does omission mean? |
| Failure and degradation | What do denial, absence, staleness, timeout, partial success, duplication, reordering and provider loss mean? |
| Correction and recovery | How are bad state, wrong claims, interrupted work, restore, replay, rebuild and remedy handled? |
| Security, privacy, safety and rights | What principals, data, rights-holders, threats, restrictions, consent and duty-bearers apply? |
| Version and evolution | What is compatible, how do coexistence and migration work, and when is a consumer forced to change? |
| Quality and evidence | Which structural, behavioural, accessibility, operational and human claims need which proofs and falsifiers? |
| Configuration and binding | Which decisions are semantic, profile-level, host-level, technology-level or provider-level? |
| Stewardship and exit | Who maintains it, how does state or behaviour move, and how is it deprecated, preserved or retired? |

These dimensions are a design checklist and an evidence contract, not a requirement for thirteen
interfaces or files.

## 7. Provisional whole-system capability atlas

The atlas names areas that must be understood and supported where an experience activates them.
It is an omission-finding instrument, not a claim that the final enumeration is complete and not a
proposed module list or priority backlog. Several rows may collapse into one coherent capability;
one row may require distinct authorities and lifecycles; a capability no selected experience
activates need not be built.

This compact orientation prevents the most concrete infrastructure gaps from becoming the frame:

| Band | Strongest current ingredients | Candidate Kit boundary | First discriminating evidence |
| --- | --- | --- | --- |
| Intent and evidence | Deep strategy, Practice, research and review methods | One proposition-to-disposition path with legitimate authority | A decision changes—or deliberately does not—on retained positive, negative and ambiguous evidence |
| Oak semantic and educational | Curriculum SDK/codegen and rich pinned OWA journey analysis | Compose authoritative curriculum, teaching, learning and assessment concerns without taking their authority | One situated educational proposition preserves meaning and agency and earns outcome evidence |
| Product and experience | Design system, demos and fidelity/accessibility mechanisms | Distinct interaction grammars on a complete quality floor | Unlike experiences compose without one host or interaction template |
| Identity, trust and human authority | Bounded authentication, privacy and policy mechanisms | Authority-supplied identity/policy contracts, rights, safety and remedy | A real restricted/denied/corrected journey with competent human escalation |
| State, data and integration | Specialised search/graph/codegen projections and one cache | Consequential state/effects only where a proposition activates them | Transaction/reconciliation, correction or rebuild proof appropriate to the selected slice |
| Delivery and live operation | Strong build, observability and app-specific deployment ingredients | Profile-aware release, diagnosis, recovery, support and exit | Public operation with truthful failure and an exercised recovery path |
| Creation, evolution and stewardship | Strong repository tooling and governance | Discover, compose, evolve, place, preserve and retire capabilities coherently | A cold consumer succeeds; an unlike use earns or rejects Kit placement |

### A. Intent, premise and evidence

| Capability area | What the Kit should make possible |
| --- | --- |
| Proposition and audience | Declare the people, context, problem, real capability and intended progress before selecting machinery |
| Educational purpose and causal premise | Where relevant, name the teaching, learning or assessment progress sought, pedagogic rationale, situated constraints and evidence that technology is an appropriate cause rather than displacement |
| Agency, load, equity and public value | Make teacher professional judgement, pupil agency, cognitive/emotional load, differential benefit/harm, excluded people, non-users and wider public externalities part of the proposition |
| Learning and assessment validity | Distinguish engagement, completion, answer capture, feedback, learning, transfer and educational impact; preserve construct validity, limitations and competent interpretation |
| Claim and evidence class | Distinguish possibility, comprehension, utility, product, portability, stewardship and impact claims |
| Premise challenge | Trace current mechanism to purpose; classify essential, chosen, accidental, compensating or unknown complexity; compare no-build and system-change options |
| Comparator and falsifier | Name the baseline, losing condition, claim boundary and evidence that would narrow or stop the work |
| Experiment execution | Bind exact inputs, configuration, versions, environments, methods and adverse cases to a reproducible run |
| Evidence record | Retain positive, negative and ambiguous findings, denominators, limitations, source identity and decision relevance |
| Disposition and return | Route advance, narrow, reshape, stop, defer, retire or unresolved outcomes to the legitimate owner and a review trigger |

### B. Oak semantic, educational and public capability

| Capability area | What the Kit should make possible |
| --- | --- |
| Curriculum identity and release | Preserve concept, authored revision, placement, variant, ordering, publication, withdrawal and public address without creating a second authority |
| Teaching and professional agency | Support planning, explanation, adaptation, orchestration and professional judgement without turning a generated recommendation, usage signal or fixed workflow into pedagogic authority |
| Pupil learning and participation | Preserve prerequisites, activity choice, accessibility, feedback, misconception handling, progress/resume, safe challenge and age/context-appropriate agency rather than reducing learning to page completion |
| Assessment and feedback | Represent construct, question/response, correctness/partiality, feedback, attempt, evidence limitations and who may interpret or act; distinguish formative interaction from durable judgement |
| Public API and SDK | Consume reviewed contracts through generated structural primitives plus deliberately authored semantic capabilities, runtime validation and compatibility evidence |
| Discovery and search | Serve a named information need with rights, relevance, coverage, freshness, ordering, explanation and evaluation made explicit |
| Graph and relationship views | Query complete bounded projections with identity, direction, multiplicity, provenance, inference and declared loss intact |
| Resources and generated artefacts | Separate stable descriptors, rights/policy grants and byte delivery; preserve version, representation, range/stream/cache and failure semantics |
| Media and channel projections | Preserve meaning and applicable capability across web, documents, print, media, offline and agent/third-party hosts |
| Correction and contestability | Carry challenges to competent authority and make accepted correction, withdrawal and downstream propagation observable without claiming remedy that is not implemented |

The Kit composes these capabilities; the owning domain remains authoritative.

### C. Product and experience composition

| Capability area | What the Kit should make possible |
| --- | --- |
| Host and runtime profiles | Declare routing/rendering, server/client, metadata, errors, notifications, analytics, consent, identity and provider obligations without one universal provider tree |
| Application shell and navigation | Supply coherent baseline behaviour, failure containment, canonical identity, responsive layout and progressive enhancement while allowing distinct product grammars |
| Design language | Consume semantic tokens, assets, accessible behaviours and framework adapters from the Oak Design System without transferring design authority into the Kit |
| Interaction composition | Make invalid combinations difficult, preserve keyboard/assistive semantics and test composed outcomes rather than local component validity alone |
| Content and information design | Carry language, hierarchy, provenance, attribution, status, error and recovery meaning through every presentation |
| Accessibility and inclusive capability | Treat equivalent action and understanding across representative states, input modes and assistive technologies as a product surface |
| Localisation and cultural fit | Make language, locale, direction, content expansion and situated applicability explicit profile concerns |
| Service continuity and support | Connect digital states to backstage work, human support, escalation, recovery and honest terminal outcomes |
| Variability and experimentation | Bind feature, audience, product-line and experiment variation at explicit times without making unsupported combinations look valid |

### D. Identity, trust and human authority

| Capability area | What the Kit should make possible |
| --- | --- |
| Authentication and session | Compose verified principals, anonymous/baseline access, session lifecycle and provider boundaries without provider-shaped domain identity |
| Authorisation and delegation | Express who may perform which operation over which referent, revision, context and time, including least privilege and revocation |
| Accounts, tenancy and isolation | Support person/organisation boundaries, onboarding, return, reconciliation, deletion, residency and cross-tenant isolation where activated |
| Consent, privacy and data dignity | Bind purpose, minimisation, retention, analytics choices, disclosure, subject rights and correction to actual data flows |
| Safeguarding and abuse resistance | Model vulnerable-user hazards, prevention, detection, response, human escalation and evidence without treating security tooling as complete safety |
| Rights and policy | Carry competent decisions, reasons, obligations, territory, channel, use and expiry while keeping policy authority upstream |
| Security capability | Supply threat boundaries, secret handling, secure defaults, dependency/supply-chain evidence, rate/resource controls and incident-ready diagnostics |
| Human authority and remedy | Make professional judgement, challenge, duty-bearer, decision and effective-remedy boundaries explicit; never promote agent output or aggregate benefit into authority |

### E. State, data and integration

This is the “ordinary and important” band. Its extra mechanism detail reflects its usefulness as a
stress-test of the fast-to-good claim, not centrality in the Kit. Its absence is a strong test of
whether rapid elevation is real or merely visual; equally, a technically complete state path with
no educational validity or authorised disposition would fail the whole-system claim.

| Capability area | What the Kit should make possible |
| --- | --- |
| Transactional state | Activate durable constraints, transactions, concurrency, idempotency, expected versions, audit and recovery under a PostgreSQL technology profile or another evidence-selected mechanism |
| Schema and SQL lifecycle | Establish schema authority, reviewed SQL, hermetic blank construction, deterministic fixtures, drift detection, safe application and query-plan/performance evidence |
| Migration management | Provide immutable migration identity, fail-closed execution, expand/contract compatibility, backfill, coexistence, promotion, forward recovery and restore evidence |
| Typed data access | Offer query/repository/ORM-adjacent ergonomics, direct SQL access, transaction/locking access, runtime validation and diagnostics without making generated structural types semantic authority |
| Object and artefact storage | Address bytes with integrity, metadata, retention, lifecycle, rights and delivery semantics independent of one storage provider |
| Cache and ephemeral state | Accelerate authoritative reads with explicit keys, invalidation, staleness, stampede/failure behaviour and correct direct-read fallback |
| Commands and workflow | Give intent, operation, attempt, acknowledgement, durable hand-off, idempotency, concurrency, terminal state and repair stable identities |
| Jobs, queues, events and outbox | Support delayed or asynchronous obligations with ordering, retries, dead-letter/repair, backpressure, observability and absence semantics |
| External integrations | Contain provider identity, webhooks, callbacks, rate limits, reconciliation, failure and exit behind product-meaningful contracts |
| Derived projections | Build search, vector, graph, bulk, cache and analytical views from named authority with release identity, completeness, loss, rebuild, correction and atomic cutover |
| Vector and embedding operations | When outcome evidence requires them, separate embedding transformation, vector projection and discovery semantics; version model/chunker/dimension, support upsert/delete/rebuild and evaluate value against quality/latency/cost |

PostgreSQL is a technology profile; Neon is one candidate managed binding. Neither belongs in a
domain capability name. An ORM is developer tooling over a schema/query boundary, not the
authority for domain meaning, migrations or database invariants. A vector index is normally a
rebuildable projection, not authoritative state. These distinctions matter more than which tool
is ultimately selected.

### F. Delivery and live operation

| Capability area | What the Kit should make possible |
| --- | --- |
| Configuration and secrets | Type, validate and explain profile/host/binding configuration; isolate credentials; distinguish missing, invalid and intentionally absent capability |
| Build and supply identity | Produce immutable, reproducible artefacts tied to source, generated inputs, dependencies, configuration, provenance and security evidence |
| Environment and preview | Create isolated, production-shaped local/review environments with deterministic data, declared deviations and safe teardown |
| Release and promotion | Separate build, deploy, verify, promote and expose; identify the active release; retain last-good; prevent mixed epochs |
| Rollback, repair and retirement | Define rollback limits, forward recovery, migration compatibility, feature/capability withdrawal and safe resource cleanup |
| Observability and control | Distinguish liveness, readiness, dependency health, semantic canaries, projection freshness, command outcomes and user-impact signals; connect observation to an authorised response |
| Reliability and SLOs | Declare availability, latency, freshness, durability, continuity and degradation budgets per activated outcome rather than inheriting provider defaults |
| Capacity, performance and cost | Measure end-to-end deadlines, queueing, payloads, headroom, provider limits, double-run transitions and full lifecycle cost per correct outcome |
| Backup and operational restore | Prove backup identity, point-in-time or equivalent recovery, clean-room restore, independent-target restoration and time-to-recovery for live service obligations |
| Incident and support operation | Correlate principal, intent, release, writes, effects and repair; provide runbooks, escalation, status communication and learning return |
| Provider exit | Exercise alternative composition and behaviour/state portability; distinguish exported authority from rebuilt derived state and provider control-plane capability |

### G. Creation, evolution and stewardship

| Capability area | What the Kit should make possible |
| --- | --- |
| Capability discovery | Tell a human or agent what is available, proposed, selected, installed, served, exercised and effective from executable evidence rather than a hand ledger |
| Composition manifest | Declare purpose, host, activated/omitted capabilities, selected adapters/bindings, compatibility, budgets and evidence profile in one inspectable projection |
| Scaffolding and generation | Mechanically generate configuration, contracts, fixtures and host wiring where choices are mechanical; keep judgement authored and reviewable |
| Local developer loop | Reach a deterministic meaningful experience from a fresh checkout; support local/substitute bindings and honest reduced modes |
| Scenarios and fault injection | Make normal, restricted, stale, duplicate, delayed, reordered, partial, denied and failed states cheap to reproduce |
| Diagnostics and repair | Name the failed capability, contract, binding, source/release identity, evidence and recovery action instead of leaking provider errors or false success |
| Documentation and examples | Teach purpose, decisions, invalid combinations, adverse states and governed extension points through executable conformance specimens; extension cannot bypass contracts, quality or assurance |
| Contract compilation | Transform reviewed immutable inputs through loss-accounting intermediate forms into types, validators, clients, tools, docs and fixtures with semantic compatibility evidence |
| Upgrades and deprecation | Supply semantic diffs, compatibility windows, codemods where mechanical, data/projection transitions, adoption evidence and explicit retirement |
| Reuse and Kit placement | Keep concepts local until composition/lifecycle/invariant/assurance ownership is warranted; use unlike implemented consumers to test reach without making a second consumer a precondition for deliberate Kit design |
| Learning and conservation | Return findings to the legitimate layer, retain failed and ambiguous evidence, revalidate perishable claims and keep superseded history non-active but inspectable |
| Long-horizon preservation and custody | Name the preserved object, authenticity, provenance, fixity, custody, representation information, independent readability and future intelligibility; keep preservation distinct from operational backup and honour lawful correction, erasure, retention and disposal |
| Stewardship and sustainability | Name ownership, maintenance capacity, licensing, public option value, resource externalities, preservation and disposal obligations |

Assurance is transverse to every band. It is not an eighth, late-stage capability area.

### Retained outcome and difficult-case specimens

The six historical OWA journeys are coverage tests for the atlas, not proposed Kit modules or
proof of current behaviour. Their outcome boundaries and awkward states are valuable precisely
because a generic capability list can otherwise erase them.

| Retained specimen | Enduring outcome to conserve | Difficult cases and unknowns the Kit should make cheap to express and test | Main bands exercised |
| --- | --- | --- | --- |
| [Teacher discovery → resource download](./web-app-deconstruction/docs/current-state/journeys/teacher-discovery-to-download.md) | A teacher finds the right curriculum context, selects permitted resources, initiates a valid archive and can continue usefully | Subject/phase versus programme identity; publication/copyright restrictions; file-existence and API degradation; engagement side effects that must not deny the core outcome; clicked-link “success” versus transferred, complete, usable archive | B, C, D, E, F |
| [Account → saved content](./web-app-deconstruction/docs/current-state/journeys/account-to-saved-content.md) | An educator understands the account boundary, returns safely, saves/unsaves in curriculum context and later sees only their content | Account-free pupil access; sign-in/onboarding/provider seams; optimistic rollback and cross-tab reconciliation; lazy/webhook provisioning; isolation; retired or partially published content; non-critical side effects | C, D, E, F |
| [Pupil lesson → results](./web-app-deconstruction/docs/current-state/journeys/pupil-lesson-to-results.md) | A pupil completes a situated, non-linear lesson session, receives feedback, resumes under a named policy and projects appropriate results | Restricted activity variants; quiz/partial-correctness and media evidence; progress identity; failed downloads falsely recorded; local/shared/Classroom persistence; duplicate/reordered writes; read-only submitted state; teacher versus pupil interpretation | A, B, C, D, E, F |
| [Classroom assignment → submission](./web-app-deconstruction/docs/current-state/journeys/classroom-assignment-to-submission.md) | A teacher attaches an Oak lesson to an existing classroom item; a pupil resumes and submits through distinct provider identities without duplicating the learning experience | Teacher/pupil OAuth separation and scopes; iframe/browser hand-off; fire-and-forget progress ordering; submission-state reconciliation; auth asymmetry; provider-shaped IDs; silent sync failure versus continued content access | B, C, D, E, F, G |
| [Curriculum export → editable document](./web-app-deconstruction/docs/current-state/journeys/curriculum-export.md) | A teacher receives an accurate, editable and accessible curriculum artefact with meaningful source/version identity | DOCX/XLSX/ZIP differences; “downloaded” versus opened and valid; source/CMS/template freshness; cache identity; missing metadata; accessible generated documents; upstream failure collapsed to not-found; synchronous capacity | A, B, C, E, F, G |
| [Editorial publish → public page](./web-app-deconstruction/docs/current-state/journeys/editorial-publish-to-page.md) | An authorised editor previews and publishes a revision that visitors receive as an accessible, trustworthy and internally consistent page | Source/query/runtime correspondence; partial CMS use; draft/public separation; feature-gated 404; media/metadata/analytics identity; freshness/outage policy; deployed-page assurance; editor experience outside the source snapshot | A, B, C, D, F, G |

## 8. Governing strategies and approaches

1. **Premise before architecture.** Start with the outcome, obligation and difficult states;
   challenge no-build, system-change and collapse options before selecting a mechanism.
2. **Vertical closure before horizontal platform.** Prove a complete, real path across the
   applicable bands before building a general layer whose consumers and adverse states are
   hypothetical.
3. **Mechanism-neutral contracts, specific semantics.** Separate capability, adapter and binding
   without collapsing useful behaviour into a lowest-common-denominator universal API.
4. **Generate from authority.** Derive structural projections, types, fixtures and identifiers
   where a legitimate authority exists; record loss and keep semantic intent deliberately owned.
5. **Explicit state, effects and failure.** Identity, clocks, transitions, acknowledgement,
   ordering, idempotency, freshness, degradation, correction and recovery are part of the design.
6. **Quality complete at every declared profile.** A smaller activated surface may need fewer
   capabilities, but every claim it makes receives the relevant accessibility, trust,
   operational and evidence treatment.
7. **Paved roads with governed divergence.** Make correct recurring work unusually easy and allow
   proposition-specific extension only through explicit contracts, owners and evidence; divergence
   cannot bypass quality, assurance or unsupported-combination checks.
8. **Progressive precision.** Begin with a narrow, honest capability and add optional semantics
   only when evidence warrants them; preserve, deliberately lower with consent, or refuse
   unsupported meaning rather than silently dropping it.
9. **Unlike use tests commonality.** Shared-file count and planned consumers prove little. Real
   recomposition should preserve meaning and invariants across distinct propositions.
10. **Observability, security and recovery from the first consequential slice.** They shape
    identity, state, operations and evidence; adding them later risks semantic redesign.
11. **Provider independence needs world-return proof.** An interface is insufficient. Exercise a
    meaningfully different binding or valid omission and, for state, export/restore or rebuild.
12. **Evidence returns to legitimate authority.** Usage, recurrence, graph centrality, agent
    confidence or polished presentation can inform review but cannot ratify meaning or strategy.
13. **Measure lifecycle cost per correct outcome.** Include verification, maintenance, drift,
    recovery, provider exit, support and retirement—not only time to first render.

## 9. Composition and elevation contract

Profiles express activated obligations, not quality grades.

Applicability is not chosen by the implementation team or profile label. Actual audience, data,
channel, jurisdiction, exposure, dependency, rights, risk, service promise and sustained reliance
activate duties. Omitting an apparently applicable duty needs evidence and the competent authority;
it cannot be achieved by declaring a capability absent. An experience on which people or services
actually rely is a live product or service for those obligations regardless of whether its
repository label still says “demo”.

| Profile | Typical purpose | Required shape |
| --- | --- | --- |
| Local exploration | Test a mechanism, interaction or proposition cheaply | Real semantic contracts; deterministic authority inputs; explicit local/absent bindings; scenarios; focused assurance; no staged success presented as capability |
| Bounded evidence | Let a known audience inspect a real proposition | Reproducible build/run identity; isolated environment; real integrations needed by the claim; comparator/falsifier; representative adverse states; retained evidence |
| Public production-ready demonstration | Make real capability safely and credibly available | Public threat/right/accessibility treatment; managed bindings where activated; deployment/release identity; observability; resource protection; humane failure; operational owner; retirement path |
| Live product | Sustain a service and its product obligations | Product evidence; durable support and decision ownership; SLOs; capacity; incident response; backup/restore; tenancy/residency/retention where applicable; governed change and retirement |

### Illustrative elevation walkthrough — curriculum-relationship explainer

This example is deliberately non-prescriptive and is not the selected first proof. Suppose the
proposition is that a teacher can inspect curriculum relationships for one identified release and
judge whether the view helps planning. The **semantic core** is the authoritative curriculum IDs,
relationship meanings and provenance; selection/explanation behaviour; an equivalent accessible
representation; and the bounded claim about what the view does and does not establish.

- In **local exploration**, a pinned release and deterministic in-process projection can be valid.
  Accounts, mutable transactional state and public operations are explicitly absent because the
  claim does not activate them; difficult relation, missing-data and accessible-use scenarios are
  real.
- In **bounded evidence**, a known teacher group sees an isolated build tied to a real release.
  Research consent, method, comparator, observation and disposition become active; a managed graph
  or search binding is used only if the evidence design needs it.
- In a **public production-ready demonstration**, public security/rights, analytics choices,
  release and freshness identity, resource limits, observability, support, correction and
  retirement activate. A managed binding may replace the local adapter without changing what a
  relationship means or what the interaction claims.
- It becomes a **live product** only with sustained reliance, product evidence, service ownership
  and the resulting continuity obligations—not because someone changes its label.

Elevation is falsified if public operation changes relationship meaning, accessible interaction or
success vocabulary; if local completeness was staged; or if the supposedly reusable path costs no
less than an equal-quality proposition-specific implementation. This is also why a database row is
not automatically activated by “production”: the real proposition and effects determine the
capabilities.

Elevation is legitimate composition when:

- the proposition's unchanged semantic capability contracts and authority identities survive;
- domain state and migration histories remain valid or move through an explicit compatible path;
- accessibility, error, provenance and evidence vocabulary remain applicable;
- new audiences, writes, personal data, rights, integrations, scale or support obligations are
  activated as new capabilities rather than hidden as “hardening”;
- technology adapters or provider bindings may change without leaking provider meaning into the
  product core;
- topology, budgets and operational evidence may strengthen without falsifying prior claims; and
- the change in concept-specific code and recurring plumbing is measured.

The claim is falsified when unchanged user and domain obligations require replacing the demo's
core contracts, authority model or interaction truth; when public deployment exposes success
states that local substitutes merely staged; or when the elevation path is bespoke archaeology
rather than declared capability activation.

## 10. Pipeline architecture

The Kit should eventually make five closed loops cheap and inspectable. Each loop needs named
authority, inputs, outputs, gates, failure/recovery semantics, evidence and an owner.

### Idea to evidence and disposition

```text
idea
→ audience, proposition and claim class
→ premise challenge and competing designs
→ comparator, falsifier and evidence boundary
→ capability/profile composition
→ real implementation and assurance
→ observation
→ authorised disposition
→ learning returned to its legitimate layer
→ retain, elevate, reshape or retire
```

### Authority to projection and correction

```text
authoritative release or event
→ validate identity, scope and rights
→ deterministic/idempotent transform
→ isolated generation
→ structural, semantic, completeness and capacity gates
→ atomic activation
→ consumer-visible epoch and freshness
→ correction, withdrawal, deletion or rebuild
→ safe retirement of prior generations
```

### Contract/schema change to compatible release

```text
domain or contract decision
→ reviewed immutable change
→ schema/migration/transform
→ blank construction and deterministic scenarios
→ generated projection and semantic diff
→ coexistence/expand-contract evidence
→ preview application and conformance
→ promote with release identity
→ post-deploy probes
→ rollback limit or forward-recovery/restore proof
```

### Operation to observation and repair

```text
principal intent
→ authorised command identity
→ atomic commit or explicit acceptance
→ durable downstream hand-off
→ projection and external effects
→ correlated observation and semantic canary
→ authorised interpretation and response
→ repair, correction or escalation
→ re-observation and retained learning
```

### Demo-local mechanism to governed Kit capability

```text
concept-specific implementation
→ repeated need or risk observed
→ purpose, authority and ownership test
→ candidate capability contract
→ second unlike implemented composition or valid independent proof
→ conformance and activation evidence
→ deliberate Kit placement
→ version, migration, deprecation and stewardship
```

The arrow chains make sequence legible; the following closure record makes responsibility and
failure semantics explicit. It is a contract checklist for future designs, not a claim that one
orchestrator should own all five loops.

| Pipeline | Authority and legitimate owner | Input → output | Gates | Failure and recovery | Required evidence |
| --- | --- | --- | --- | --- | --- |
| Idea → evidence and disposition | Proposition owner frames the claim; the legitimate product, educational, service or portfolio decision owner authorises disposition | Bounded proposition, audience and claim → retained evidence, decision and routed learning | Premise, comparator, falsifier, activated-profile and claim-specific assurance gates | Stop, narrow, reshape or mark unresolved; never turn missing evidence into success | Exact run/configuration, comparator result, negative and ambiguous findings, limitations and decision record |
| Authority → projection and correction | Source/domain authority owns meaning and correction; projection operator owns deterministic generation and activation | Identified authoritative release/event → activated projection with visible release/freshness identity and retirement state | Identity/rights, transform determinism, structural/semantic completeness, capacity and atomic-cutover gates | Retain last-good, quarantine, rebuild, withdraw, propagate correction or forward-repair; prove no resurrection | Source and projection manifests, counts/hashes/loss record, freshness, cutover observation and correction/rebuild drill |
| Contract/schema → compatible release | Domain/contract authority owns meaning; release and data owners own compatibility, migration and recovery within their duties | Reviewed immutable contract or schema decision → compatible release, migrated state/projection and explicit rollback limit | Semantic diff, blank construction, deterministic scenarios, coexistence/expand-contract, preview and conformance gates | Reject before promotion, restore where valid, forward-repair where rollback is unsafe, or hold coexistence | Generated diff, compatibility/conformance results, migration rehearsal, post-deploy probes and restore/forward-recovery proof |
| Operation → observation and repair | Authorised principal owns intent; semantic capability owner defines outcome; runtime/service operator owns observation and response; policy owners retain policy authority | Authorised command → truthful authoritative outcome, reconciled projections/effects, terminal user state and retained learning | Authentication/authorisation, precondition, idempotency, atomicity or explicit acceptance, downstream hand-off and semantic-canary gates | Retry only where safe, reconcile, compensate/correct, cancel, escalate or provide remedy; never acknowledge a staged effect as complete | Correlation and command identity, audit trail, outcome envelope, telemetry/SLO evidence, repair/re-observation and incident learning |
| Demo-local → governed Kit capability | Concept owner owns the local mechanism; candidate semantic-layer owner and Kit steward judge placement; owner ratification applies where strategy or authority changes | Repeated local need/risk and worked mechanism → admitted/versioned Kit capability, deliberately retained local mechanism, split capability or rejection | Purpose/authority, invariant/lifecycle, unlike-use or independent-proof, conformance, absence semantics and elevation-value gates | Retain local, split, reject, deprecate or reverse placement when reach is unearned; do not universalise by renaming | Implemented consumers or independent proof, contract/conformance suite, recurring-cost and divergence evidence, ownership/lifecycle record |

## 11. Current OCE capability map

OCE contains substantial reusable ingredients, but there is no runtime Innovation Kit workspace,
composition manifest, profile system or end-to-end creation/elevation path. The current demos are
substantial consumers of read-oriented capability; they do not yet exercise authoritative
application state. This makes the estate look more complete than the stateful product-elevation
path has demonstrated.

The following map is source-based at the evidence pin. “Absent” claims are bounded to tracked
manifests and source under `apps/`, `demos/` and `packages/`; ignored local infrastructure and live
provider configuration are outside the claim. The map is supporting evidence for the whole-system
architecture above, not its organising centre or an implementation backlog.

The bounded absence scan enumerated all 32 tracked `package.json` manifests plus tracked file paths
and source under those three roots at the pinned commit. Dependency/source terms included
PostgreSQL, Neon, `pg`, Drizzle, Prisma, Kysely and Knex; path/content checks covered SQL and
migration artefacts. Vector inspection separately covered `semantic_text`, ELSER, dense and sparse
vector terms so existing Elastic-specific semantic operations were not erased by the generic-gap
claim. This establishes a reproducible repository boundary, not the state of ignored files,
deployed services or provider control planes.

| Band / capability | Implementation evidence | Reach, evidence and boundary |
| --- | --- | --- |
| Intent and evidence workflow | **Partial** | Reusable strategy, Practice, plan, research, review and fidelity methods are deep, but the cross-demo evidence ledger and disposition workflow are not integrated as a Kit capability |
| Curriculum API and SDK | **Demonstrated** | [`@oaknational/curriculum-sdk`](../../../packages/sdks/oak-curriculum-sdk/README.md) and code generation provide a reusable public consumer surface; semantic capability authorship remains distinct from generated transport |
| Pedagogy, assessment and educational-outcome composition | **Unknown** | Current OCE source demonstrates curriculum access and some experience mechanics, but it cannot establish competent pedagogic authority, teacher/pupil outcome evidence or a reusable Kit composition for those concerns; the pinned OWA traces are historical evidence, not current implementation |
| Contract compilation and generated surfaces | **Demonstrated** | [`oak-sdk-codegen`](../../../packages/sdks/oak-sdk-codegen/README.md) is a specialised reusable pipeline for OpenAPI acquisition, transformation, generated types/validators/clients/tools and runtime conformance; it is not yet a general loss-accounting contract compiler |
| MCP and agent capability delivery | **Demonstrated** | The [MCP HTTP app](../../../apps/oak-curriculum-mcp-streamable-http/README.md), generated tool definitions, resources, host integration and agent-support metadata form a real specialised reusable vertical slice; they do not establish general application composition or evidence workflow |
| Search lifecycle and evaluation | **Demonstrated** | [`oak-search-sdk`](../../../packages/sdks/oak-search-sdk/README.md), the [search CLI](../../../apps/oak-search-cli/README.md) and accepted evaluation/lifecycle decisions implement a strong reusable, Elastic-specific vertical slice; semantic portability, full release identity and generic projection/correction remain partial |
| Graph substrate and corpus views | **Partial** | `graph-core`, `graph-ingest`, `graph-project` and [`graph-corpus-sdk`](../../../packages/sdks/graph-corpus-sdk/README.md) provide reusable typed capability, while planned ingestion modes and wider estate topology are unevenly activated |
| Design language and assets | **Demonstrated** | [`packages/design`](../../../packages/design/README.md) separates reusable tokens, assets, framework-neutral design system, React binding and Ink primitives with real demo/app consumers |
| Product/interaction recipes | **Partial** | The demos and MCP app contain app-specific worked composition and accessibility evidence, but no general host/profile/recipe capability equivalent to the breadth recovered from OWA |
| Host/runtime composition | **Partial** | MCP and Next.js demos perform app-specific routing, auth, observability and design integration; no reusable host profiles, composition manifest or compatibility matrix exists |
| Accessibility and fidelity assurance | **Partial** | Reusable browser, widget, axe, design-system and [`fidelity-review`](../../../packages/libs/fidelity-review/README.md) machinery is substantial; outcome evidence across full journeys, channels and assistive-technology use remains claim-specific |
| Identity and authorisation | **Partial** | The MCP HTTP app demonstrates app-specific Clerk/OAuth and deployment policy; there is no reusable principal/session/tenancy/policy capability for Kit consumers |
| Privacy, consent, safeguarding, rights and remedy | **Partial** | Reusable redaction/privacy mechanisms and app-specific auth/domain policy exist in bounded surfaces; no whole-Kit policy/grant, safeguarding, rights-holder or correction/remedy composition exists |
| Human research, product evidence and service support | **Unknown** | Repository methods and some demo review artefacts are visible, but representative research, educational outcomes, service operations and disposition authority are externally operated; the existence of methods is not evidence that a portfolio has exercised them |
| Transactional persistence and SQL lifecycle | **Absent** | No Kit implementation: a scan of all tracked app/demo/package manifests found no PostgreSQL/Neon/`pg`/Drizzle/Prisma/Kysely/Knex dependency and no SQL or migration artefacts in those workspace trees |
| Typed/ORM-adjacent data access | **Absent** | No Kit implementation: the bounded scan found no reusable query builder, ORM profile, repository/mapping tooling, database transaction harness or schema-to-domain correspondence capability |
| Object storage and durable asset lifecycle | **Absent** | No Kit implementation: existing assets and delivery paths do not provide a reusable object lifecycle covering authority, upload, metadata, rights, versioning, delivery, retention, deletion and provider exit |
| Cache and ephemeral acceleration | **Partial** | The search CLI demonstrates an app-specific [Redis-backed SDK-response cache](../../../apps/oak-search-cli/src/adapters/sdk-cache/index.ts) with TTL jitter, negative-cache semantics, fallback and diagnostics; no reusable Kit cache contract or general application-state capability exists |
| Jobs, queues, events and outbox | **Absent** | No Kit implementation: the bounded scan found no repository-owned durable-work, queue, event-handoff or transactional-outbox capability with retries, ordering, repair and conformance |
| Derived projection factory | **Partial** | Search, graph and code generation contain strong specialised reusable pipelines; no common authority/release/completeness/correction/cutover/result-envelope contract spans derived capabilities |
| Vector-store operations | **Absent** | No separately addressable Kit or generic vector-store CRUD/lifecycle contract was found. Elastic-specific `semantic_text` ingestion, ELSER inference/retry handling and index lifecycle operations exist inside search. Dense vectors are not assumed baseline: accepted ADR-075 records that its dense-vector arm reduced the measured curriculum-search quality/latency trade-off |
| Configuration and environment | **Partial** | Reusable [`@oaknational/env`](../../../packages/core/env/README.md) and [`env-resolution`](../../../packages/libs/env-resolution/README.md) provide typed contracts and resolution for current apps; capability/profile discovery and provider composition remain absent |
| Observability and analytics | **Partial** | Reusable [`observability`](../../../packages/core/observability/README.md), logger, Sentry and PostHog packages provide redaction, diagnostics, traces and sinks; universal health/SLO/semantic-canary/incident-response contracts are not present |
| Build, repository and supply assurance | **Demonstrated** | Reusable root checks, `agent-tools`, workspace config, custom ESLint, generation, provenance and security gates form an unusually strong delivery substrate |
| Deployment, preview, promotion and rollback | **Partial** | The MCP app has an app-specific Vercel production path and search has specialised atomic index promotion/rollback; there is no Kit-wide host profile or release/elevation pipeline |
| Backup, restore, PITR, state portability and provider exit | **Proposed** | Provider research and Proposed ADR/PDR articulate the direction; no current Kit state capability can exercise authoritative export/restore, independent-target recovery or provider exit |
| Long-horizon preservation and custody | **Partial** | Repository history, provenance and supersession practices are strong, but no Kit capability defines preserved product objects, significant properties, custody, fixity, future readability and lawful correction/disposal independently of operational backup |
| Developer scaffolding, doctor and local profiles | **Partial** | Workspaces have reusable local instructions, generators and diagnostics, but no Kit CLI/generator, capability activation probe, scenario system or one-path fresh-checkout product scaffold exists |
| Upgrade, deprecation, placement and stewardship | **Partial** | Repository decisions and package/version machinery are reusable; cross-Kit semantic upgrade, data/projection migration, capability placement through unlike reuse and retirement are not one coherent product |

This is not a deficit score. The current estate is strongest where it has repeatedly exercised a
real product path: curriculum and generated contracts, search, graph, design, MCP/agent delivery
and repository assurance. It is least evidenced where current runnable hosts have not needed to
write authoritative application state, support long-lived multi-user products, connect digital
states to service operations, or prove human outcomes and authorised disposition.

## 12. First discriminating proof programme

The next phase should test the whole architecture, not build every row horizontally.

### Proof 0 — earn the selected slice before selecting architecture

For every proposed slice, retain its human, educational or public outcome and difficult cases;
complete a premise record; trace purpose and current cause; and compare no-build, service/process
change, collapse and genuinely competing architectures. Gather relevant external user,
professional, service and authority evidence; name actual applicability and justified omissions;
record unresolved assumptions; and obtain the explicit owner selection gate before provider
research or implementation.

**Falsifier:** the slice is selected because a component exists or a technology gap is visible,
while the intended outcome, affected people, current cause, alternatives or legitimate decision
owner remain unresolved.

### Proof 1 — map two unlike demonstrations

Select two genuinely different portfolio members. For each, record proposition, audience, claim
class, authority, activated/omitted capabilities, profile, difficult states, evidence and
disposition. The map should reveal whether the grammar preserves difference or merely renames one
template.

**Falsifier:** the composition model forces one interaction, host or evidence shape, or cannot
explain a legitimate omission without pretending capability exists.

### Proof 2 — complete one consequential vertical slice

Choose the smallest real slice whose claim activates several bands—for example a user-owned
collection or governed generated artefact rather than a technology showcase. Carry it through
every band and contract dimension its real proposition activates. If it owns mutable authoritative
state, include transaction, concurrency, migration, backup and recovery; if it creates projections
or external effects, include their correction and reconciliation paths. Compare local/self-hosted
and managed bindings only where the contract actually claims portability.

**Falsifier:** success depends on an undeclared provider-specific assumption, a staged
authoritative effect, manual environment archaeology or quality work deferred to a later profile.

### Proof 3 — elevate without replacing the semantic core

Before execution, preregister a like-for-like bespoke comparator with the same claim, quality floor
and applicability boundary; define the unchanged-core criterion, total lifecycle/elevation cost
boundary and an owner-set decision threshold. Then move the slice through local, bounded-evidence
and public-production profiles. Record unchanged semantic/product code, newly activated capability
code, binding/topology changes, assurance and operational evidence, and total recurring versus
novel effort.

**Falsifier:** unchanged obligations require a new authority model, schema meaning, success/error
vocabulary or interaction truth; the earlier artefact was a disposable prototype.

### Proof 4 — derived projection and correction

Build one search/vector/graph or generated-artifact projection from an immutable authority
release. Prove manifest identity, reproducible clean rebuild, completeness/loss, atomic cutover,
consumer-visible epoch, correction/deletion propagation, no resurrection and rollback/repair.

**Falsifier:** structural validity hides incomplete semantic population, mixed epochs or stale
withdrawn claims.

### Proof 5 — failure, recovery and exit

Inject interruption during command, migration, projection, deployment and provider failure. Prove
truthful acknowledgement, last-good continuity, idempotent resume, clean-room restore or rebuild,
and one independent composition or valid omission.

**Falsifier:** the interface survives while data, identity, operations or recovery remain locked
to one binding.

### Proof 6 — developer and decision outcome

Give a cold consumer a proposition and the Kit path. Measure time to a meaningful real outcome,
hidden-policy reconstruction, diagnostic success, repeated plumbing, change/elevation effort,
claim-quality defects and whether the evidence changed an authorised decision.

**Falsifier:** the Kit shifts work into opaque framework concepts, raises archaeology or creates
more maintenance than the preregistered equal-quality bespoke comparator, or misses the owner-set
decision threshold.

## 13. Risks, falsifiers and open decisions

### Whole-architecture falsifiers

The working model should be rejected or narrowed if:

- it accelerates polished demonstrations but not trustworthy evidence or safe public operation;
- it lowers quality in early profiles and calls later repair “elevation”;
- unchanged semantic obligations require core rewrites between profiles;
- it cannot express legitimate capability absence, degraded modes or proposition-specific
  divergence;
- it creates universal abstractions that erase provider strengths or domain meaning;
- it centralises curriculum, design, policy, evidence or product authority in the Kit;
- it makes state, projection, release, correction, restore or provider exit unverifiable;
- unlike consumers reject the shared mechanism for the same semantic reason;
- lifecycle cost per correct outcome is not lower than the declared comparator; or
- evidence accumulates without an authorised disposition, correction, reuse or retirement.

### Principal risks

- **Feature-catalogue gravity:** completeness can become a shopping list. The contract dimensions,
  profile activation and vertical proof programme must govern priority.
- **Atlas-to-module fallacy:** analytical distinctions do not imply packages, services or teams.
- **Quality-tier drift:** local and public profiles can be mistaken for low/high quality rather
  than different obligations.
- **Authority capture:** convenient composition can silently become semantic ownership.
- **False portability:** interfaces can hide provider types while state, recovery and operations
  remain captive.
- **Horizontal platform building:** broad abstractions can land before a real vertical path proves
  the need.
- **Evidence theatre:** configured tools, passing gates, use, polish and reuse can be promoted
  beyond what they establish.
- **Documentation authority drift:** a manual capability matrix can become stale; future status
  should derive from executable composition and activation evidence where possible.

### Decisions deliberately not earned

- the first vertical product slice and its audience;
- application framework, host or deployment topology;
- PostgreSQL adoption, a managed provider, ORM/query tool or migration library;
- workflow, queue, object-storage, cache, vector or observability providers;
- whether one composition manifest or several profile schemas are warranted;
- package boundaries or a dedicated runtime `innovation-kit` workspace;
- which current app-specific capabilities should move into the Kit;
- SLO, retention, residency, support and product evidence thresholds; and
- strategy, ADR-225 or PDR-139 ratification.

## 14. Provenance and retained deconstruction value

The relocated corpus preserves analysis and examples, not a runnable research workspace. The
following source-to-finding map keeps its most important contributions discoverable:

| Retained source | Durable contribution to this synthesis |
| --- | --- |
| [Research charter](./web-app-deconstruction/docs/research-charter.md) | Mission, Kit consumer outcome, premise-first method, excellence dimensions and success boundary |
| [Ecosystem enablement](./web-app-deconstruction/docs/synthesis/ecosystem-enablement.md) | Capability atlas, framework principles, premise/acceptance record and investigation sequence |
| [OWA/Components synthesis](./web-app-deconstruction/docs/current-state/owa-components-concept-lenses/synthesis.md) | 53 orthogonal/recursive lenses; full human, product, semantic, operational, institutional and preservation scope |
| [Database/API/OCE lens synthesis](./web-app-deconstruction/docs/current-state/database-tools/concept-lenses/synthesis.md) | Authority chains, contracts, state/time, operations, policy, public value and provider/Kit boundaries |
| [Database authority and projections](./web-app-deconstruction/docs/current-state/database-tools/database-authority-and-projections.md) | Authority lattice, lossy representations, projection DAG, release/freshness and rebuild questions |
| [Mutation workflow](./web-app-deconstruction/docs/current-state/database-tools/mutation-workflow-and-control.md) | Command identity, truthful acknowledgement, transactions, concurrency, audit and real-system probes |
| [API runtime, contract and policy](./web-app-deconstruction/docs/current-state/database-tools/api-runtime-contract-and-policy.md) | Transport/semantic separation, bulk and binary shadow contracts, rights and release identity |
| [Operations, evolution and assurance](./web-app-deconstruction/docs/current-state/database-tools/operations-evolution-and-assurance.md) | Migration, recovery, deployment, fail-closed evidence, capacity and post-deploy assurance gaps |
| [Working product model](./web-app-deconstruction/docs/synthesis/working-model.md) | Mechanism-neutral product definition, candidate topology and guardrails |
| [Hypotheses H001–H012](./web-app-deconstruction/docs/hypotheses/README.md) | Falsifiable design questions and decisive experiments, retained as low-confidence research |
| [Journey traces](./web-app-deconstruction/docs/current-state/journeys/teacher-discovery-to-download.md) | Cross-boundary outcome, state, identity, rights, failure and continuation examples |
| [Accessibility and assurance](./web-app-deconstruction/docs/current-state/accessibility-and-assurance.md) | Layered automation/human evidence and the gap between tool conformance and equivalent capability |
| [Production topology](./web-app-deconstruction/docs/current-state/production-topology.md) | Release, host, cache, observability, operational residue and control-plane unknowns |

The removed TypeScript harness previously recomputed some static inventories and probes. Its
methods, reported results, limitations and invalidators remain in the analysis documents. Those
results must be treated as pinned historical evidence, not silently refreshed current truth.

## Conclusion

The deconstruction did contain the beginnings of the requested Innovation Kit. Its central
lesson is not that Oak needs a longer list of tools. It is that product creation becomes both fast
and good when recurring meaning, quality, lifecycle and proof are designed as one composable
system, while legitimate authorities and proposition-specific diversity remain intact.

The next move is a whole-system vertical proof. If a real, consequential slice can move from idea
to public evidence with its semantic core intact, its newly activated obligations explicit, its
failures recoverable and its learning returned to the right owner, the Kit will have begun to
earn its foundational claim. If it cannot, more abstractions would only make the compromise harder
to see.
