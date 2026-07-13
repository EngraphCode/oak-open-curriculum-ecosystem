---
title: 'External organising and stakeholder surfaces — repository, Linear, Notion, Slack, GitHub, Figma, and evidence systems'
type: report
status: exploration
stage: 'Repository-grounded exploration and understanding; decides no implementation, integration, or service adoption.'
date: 2026-07-13
audience: 'Oak engineering, product, design, delivery, and organisational stakeholders considering how OCE intent, execution, evidence, and stakeholder access should cross system boundaries'
subject: 'The authority model, current plans, code/configuration, contradictions, gaps, and likely architectural direction for connecting OCE to Linear, Notion, and other organising or stakeholder surfaces'
thread: strategy-and-plan-estate-holistic-review
related:
  - docs/architecture/architectural-decisions/200-intent-as-a-living-idea-graph.md
  - docs/architecture/architectural-decisions/201-external-systems-evidence-integration.md
  - docs/architecture/architectural-decisions/207-dora-delivery-metrics-as-a-structural-property.md
  - .agent/plans/product-development-governance/plan-node-schema.v0.md
  - .agent/plans/product-development-governance/current/planning-estate-rewrite.plan.md
  - .agent/plans/product-development-governance/active/plan-corpus-refounding.plan.md
  - .agent/plans/product-development-governance/future/external-evidence-integration.plan.md
  - .agent/plans/agentic-engineering-enhancements/future/external-pointer-surface-integration.plan.md
  - .agent/plans/slack-assistants/current/ask-oisin.plan.md
---

# External organising and stakeholder surfaces

> **Status: exploration and understanding only.** This report records what the repository currently
> says, what has actually been implemented, where the artefacts disagree, and what architectural
> model appears to be emerging. It does **not** accept ADR-201, promote or retire a plan, define a
> Linear mapping, assign Notion a role, or author an implementation plan. Recommendations below are
> candidate dispositions for later owner-governed work, not decisions made by this report.

## Executive synthesis

The repository contains a strong and increasingly coherent architectural model for relating OCE to
external work-management, collaboration, evidence, and stakeholder surfaces. It does **not** yet
contain a functioning integration system.

The decisive model is:

> OCE's durable intent lives in the repository and, ultimately, its idea graph. External systems
> receive projections or own specialised live state; they report evidence back without acquiring
> authority over intent.

That direction is accepted for the intent substrate in
[ADR-200](../../docs/architecture/architectural-decisions/200-intent-as-a-living-idea-graph.md),
designed into the
[V0 plan-node schema](../plans/product-development-governance/plan-node-schema.v0.md), and extended —
still only provisionally — by
[ADR-201](../../docs/architecture/architectural-decisions/201-external-systems-evidence-integration.md)
for external evidence.

The central conclusion of this review is that **"connect the repo to Linear, Notion, and stakeholder
surfaces" is too solution-shaped**. The underlying problem is:

> How can each audience see, understand, coordinate, review, or evidence the work in its natural
> environment without creating another competing store of intent?

Once framed that way, the surfaces separate into distinct kinds:

| Kind | Surface | Proper role suggested by the current estate |
| --- | --- | --- |
| Canonical intent | OCE repository and future idea graph | Why, what, constraints, strategy, durable plans, decisions, and interpretation |
| Execution coordination | Linear | Assignment, sequencing, cycles, estimates, and live delivery status |
| Change readiness | GitHub pull requests | Diffs, reviews, checks, previews, and evidence for a proposed change |
| Design collaboration | Figma | Design source, interaction intent, design-system artefacts, and design review |
| Internal stakeholder access | Ask Oisín in Slack | Low-friction, read-only navigation and questions grounded live in the repo |
| Operational and product evidence | Sentry, OpenTelemetry, PostHog, Sonar, Vercel, Elastic | Facts and signals that return to intent as typed evidence |
| Potential public orientation | GitHub Projects, generated web views, or another public surface | Public roadmap or partner visibility, if that need becomes real |
| Undefined | Notion | No current OCE role has been established |

This is a better architecture than a network of pairwise synchronisations. It is not yet fully
reconciled across the plan estate.

The most important tensions are:

1. an older Linear design maps threads to labels and session landings to issues, while the accepted
   V0 plan schema maps plans to Linear Projects and execution state back into the graph;
2. the older Linear design is one-way and best-effort in places, while ADR-201 proposes returning
   evidence, validated write-back, and declared supervision;
3. the repo has graph substrate and plans, but no Linear projector, connector, write-back path, or
   validator implementation;
4. Notion is historical rather than current: the former `oak-notion-mcp` workspace was removed and
   no present strategy gives Notion a unique role;
5. Ask Oisín is the clearest concrete stakeholder surface, but its own plan exposes unregistered
   strategic and stream values that the plan-corpus refounding is intended to cure;
6. Figma is recognised as a real design-intent surface but has not yet received settled graph-edge
   semantics;
7. the stakeholder audience model is less mature than the technical authority model.

## 1. Scope, method, and reasoning stance

### 1.1 Scope

This review searched and read the plans, reports, ADRs, directives, configuration, and code-adjacent
surfaces related to:

- Linear;
- Notion and the removed `oak-notion-mcp` workspace;
- GitHub pull requests and GitHub Projects;
- Slack and Ask Oisín;
- Figma;
- Sentry and OpenTelemetry;
- PostHog;
- SonarQube Cloud;
- Vercel;
- Elastic Cloud Serverless;
- the idea-graph, plan graph, and graph substrate that would connect these systems;
- the authority boundary between durable repo intent and external live state.

The review also searched for implementation evidence including `@linear/sdk`, `LINEAR_API_KEY`,
`mcp.linear.app`, `projects_to`, `@notionhq/client`, Slack app paths, and relevant plugin settings.

### 1.2 Reasoning method

This report applies the five outward moves from
[`oak-reason`](../skills/reason/SKILL-CANONICAL.md):

1. name the kind of problem;
2. frame the problem rather than presuppose a solution;
3. surface the warrant and falsifier;
4. distinguish reversible probes from expensive commitments;
5. stress-test for premature solutions, hidden values, abstraction drift, and local optimisation.

It also applies the inward questions from
[`oak-metacognition`](../skills/metacognition/SKILL-CANONICAL.md) and the
[metacognition directive](../directives/metacognition.md):

- what shape was inherited;
- whether that shape was ratified from first principles;
- whether it still fits the requested impact;
- what bridge connects action to impact;
- whether smooth, familiar answers such as "sync it to Notion" or "mirror it in Linear" are being
  accepted before their preconditions are checked.

The governing decision lenses are taken in order from
[`principles.md`](../directives/principles.md):

1. choose long-term architectural excellence;
2. strict and complete, everywhere;
3. ask whether it could be simpler without compromising quality or value;
4. ask whether changing the system dissolves the problem;
5. optimise for user value.

### 1.3 The kind of problem

This is not primarily an API-integration problem. It is a **socio-technical authority, projection,
and audience-design problem** across a complex institutional system.

The systems do not merely exchange data. Each surface has a different relationship to:

- authority;
- volatility;
- audience;
- action rights;
- auditability;
- privacy;
- failure;
- interpretation;
- and time.

A Linear issue being `In Progress`, a Figma frame describing an intended interaction, a PostHog
funnel recording behaviour, and an ADR defining architecture are not interchangeable facts. A
sound integration architecture must preserve those differences rather than flatten them into a
single generic "sync" concept.

### 1.4 The load-bearing warrant

The principal warrant behind the emerging design is:

> Durable product and engineering intent must remain recoverable, versioned, reviewable, and
> structurally traceable in the repository; external systems are better at live coordination,
> specialised collaboration, or observation, but should not silently redefine that intent.

This warrant would be weakened if first-hand team use showed that repo-authored plans were not
human-usable, could not support normal product-management collaboration, or routinely lagged the
actual decisions being made elsewhere. The current architecture therefore still needs empirical
validation as a team forms and the external consumers become real.

## 2. Authority and maturity of the material

The relevant artefacts do not all have equal authority. Treating them as a flat corpus would create
false contradictions and revive superseded designs.

### 2.1 Accepted or active authority

#### ADR-200 — intent as a living idea graph

[ADR-200](../../docs/architecture/architectural-decisions/200-intent-as-a-living-idea-graph.md)
is the architectural centre.

It decides that:

- ideas are the fundamental unit of intent;
- the idea graph is the authoritative machine-readable source;
- vision, strategy, streams, threads, and plans are human-navigable projections or curated
  traversals over regions of that graph;
- documents remain co-equal human embodiments rather than generated stubs;
- frontmatter carries the typed connection between prose documents and graph nodes;
- external evidence is separate from the substrate milestone;
- repo intent projects outward and service evidence later returns through a distinct integration
  decision.

This is materially more fundamental than any specific Linear or stakeholder-surface plan. Any
integration must compose with it rather than establish a parallel planning model.

#### The V0 plan-node schema

The
[V0 plan-node schema](../plans/product-development-governance/plan-node-schema.v0.md)
makes the Linear relationship concrete at the plan layer.

It states that:

- a plan carries durable work intent, not authorship or assignment;
- a plan consumes authority through `serves_strategic_choice` and `derives_from`;
- live execution state is not stored in durable frontmatter;
- live execution state is projected from Linear;
- a plan is approximately a Linear Project, not an epic issue;
- a strategic choice is approximately a Linear Initiative;
- workstreams or cycles map approximately to issues and sub-issues;
- `projects_to` is an outward projection edge from a plan to an external Linear Project;
- Linear never holds an authority edge into intent.

The state decomposition is one of the strongest parts of the current design. It separates:

- `kind`: whether intent is strategic or executable;
- `gate`: a temporary, expiring external or owner block;
- `disposition`: delivered, superseded, extracted-and-archived, or cancelled;
- execution status: `backlog -> in_progress -> done`, owned by Linear.

This cures the previous collapse of readiness, activity, blocking, and terminal state into one
hand-maintained status label.

#### ADR-207 — delivery metrics as a structural property

[ADR-207](../../docs/architecture/architectural-decisions/207-dora-delivery-metrics-as-a-structural-property.md)
is accepted and treats GitHub, Linear, Sentry, deployments, and the intent graph as joined parts of
a single delivery-measurement structure.

It is explicit that:

- GitHub is the change axis;
- Linear is the intent/execution-status axis;
- Sentry and OpenTelemetry contribute runtime and incident evidence;
- `projects_to`, `realized_by`, and evidence edges make attribution traversable;
- delivery metrics should be generated projections, not hand-maintained dashboards;
- the Linear projection is designed and reserved but not built.

#### Current corpus refounding and planning-estate rewrite

The
[active plan-corpus refounding](../plans/product-development-governance/active/plan-corpus-refounding.plan.md)
and
[current planning-estate rewrite](../plans/product-development-governance/current/planning-estate-rewrite.plan.md)
are the current execution context.

The refounding precedes the full idea-graph build and aims to produce a lossless, strategy-aligned,
graph-ready corpus with:

- registered organising axes;
- mechanically recomputable state;
- explicit conservation proofs;
- destination lanes derived from vision and strategy;
- no ungoverned free-text stream or thread values.

This matters because the external-surface design should project a stable, governed corpus rather
than encode the current estate's drift into Linear or another service.

### 2.2 Proposed and future architecture

#### ADR-201 — external systems as evidence edges

[ADR-201](../../docs/architecture/architectural-decisions/201-external-systems-evidence-integration.md)
is proposed, not accepted.

Its proposed contract is nevertheless the clearest general design for external systems:

- direction invariant: repo intent projects outward; services report evidence back;
- external state never becomes an authority edge into intent;
- evidence returns through typed edges such as `evidence`, `validated_by`, and `realized_by`;
- each integration declares a capability mode: `read`, `summarise`, `annotate`, or `mutate`;
- mutations carry an explicit supervision requirement;
- external identifiers and credentials remain out of version control;
- connectors and triggers feed validated write-back into the graph;
- only evidence that earns persistence should be stored rather than duplicating computable service
  state.

It is gated on the idea-graph substrate and an owner decision.

#### External-evidence integration plan

The
[future external-evidence integration plan](../plans/product-development-governance/future/external-evidence-integration.plan.md)
turns ADR-201 into four gated workstreams:

1. evidence-edge schema;
2. read-first connectors;
3. triggers and validated write-back;
4. generated DORA and user-value projections.

It includes GitHub, Linear, Sentry/OpenTelemetry, Vercel, Sonar, and PostHog in its architectural
statement. Its detailed connector map, however, lists Vercel, Sentry, Sonar, GitHub, and PostHog but
omits Linear. That appears to be an incomplete decomposition rather than a settled exclusion,
because Linear remains required elsewhere for execution status and throughput.

### 2.3 Imported, subordinate design inputs

The
[product-development-governance collection README](../plans/product-development-governance/README.md)
explicitly classifies the material under `suggestions/` as imported analysis rather than authority.
Those documents are useful because they independently re-derived much of the accepted model, but
they must be verified and dispositioned rather than adopted wholesale.

The strongest imported model is
[`service-authority-and-operating-contexts.semantic-model.md`](../plans/product-development-governance/suggestions/service-authority-and-operating-contexts.semantic-model.md).
It states the useful three-way distinction:

```text
Repo documents define durable intent.
Linear coordinates execution.
GitHub PRs aggregate review and readiness for proposed changes.
```

It also gives Figma, Sentry, PostHog, Sonar, Elastic, deployments, and AI agents distinct authority
boundaries. Its warning against turning the repo into a stale second dashboard is well-founded.

The
[`governed-repo-document-graph.plan.md`](../plans/product-development-governance/suggestions/governed-repo-document-graph.plan.md)
provides useful candidate graph relationships such as `projects_to_linear` and `summarises_linear`,
but its document-graph framing predates and is partly superseded by ADR-200's stronger idea-graph
architecture.

The
[`repo-intent-and-service-knowledge-boundaries.proposal.md`](../plans/product-development-governance/suggestions/repo-intent-and-service-knowledge-boundaries.proposal.md)
usefully names the need to preserve service boundaries, stakeholder access, Figma, and a recurring
loss-prevention test. It remains a proposal record.

### 2.4 Historical or materially stale material

The
[future external-pointer-surface plan](../plans/agentic-engineering-enhancements/future/external-pointer-surface-integration.plan.md)
contains valuable reasoning but has been overtaken by later architecture in significant respects.

Its primary mapping is:

- thread -> Linear label;
- landing -> Linear issue;
- repo -> existing Linear project;
- navigation -> one Linear Document;
- emission -> session-handoff event;
- direction -> repo to Linear only.

That was a structurally thoughtful design for exposing the former thread/session continuity model.
It is no longer sufficient as the primary semantic model because the accepted V0 schema centres:

- strategic choice -> Initiative;
- plan -> Project;
- workstream/cycle -> issue or sub-issue;
- external execution state -> returning graph projection.

The older plan should not simply be treated as wrong. Thread labels may remain useful
cross-project classification, and finite landing issues may still be useful evidence. But it must
be reconciled against the more authoritative plan-graph design before any execution.

## 3. The emerging authority model

The repository is converging on a layered system:

```text
                    OCE intent graph
                         |
          +--------------+-----------------+
          |              |                 |
   human documents   execution         stakeholder
   in the repo       projection         read models
          |              |                 |
   vision/strategy     Linear          Slack / public
   streams/plans         |             navigation
          |              |
          +------ GitHub changes ---------+
                         |
                  deployed products
                         |
       Sentry / PostHog / Vercel / Sonar / Elastic
                         |
                  returning evidence
                         |
                    intent graph
```

This assigns different kinds of truth rather than claiming every service is or is not a "source of
truth":

| Truth or authority kind | Proper surface |
| --- | --- |
| Normative product and engineering intent | Repo documents and idea graph |
| Live delivery coordination | Linear |
| Proposed code/document change and review | GitHub |
| Design source and design collaboration | Figma |
| Runtime error, trace, and incident facts | Sentry and OpenTelemetry |
| Deployment facts | Vercel or other deployment platforms |
| User behaviour and adoption facts | PostHog |
| Static code-quality facts | Sonar |
| Search and index operational facts | Elastic |
| Low-friction internal access to repo knowledge | Slack / Ask Oisín |

The core design principle is not that the repo contains every fact. It is that the repo contains the
semantic and authority model by which specialised facts are interpreted and connected to durable
intent.

## 4. Linear

### 4.1 Intended role

The repo is consistent at high altitude:

- OCE owns durable intent, strategy, scope, constraints, acceptance, and relationships;
- Linear owns assignment, sequencing, cycles, estimates, and current execution state;
- Linear may report state back into the graph;
- Linear does not define the plan, strategic choice, or acceptance contract.

The accepted V0 mapping is the strongest available model:

```text
strategic choice  ~= Linear Initiative
plan              ~= Linear Project
workstream/cycle  ~= Linear issue or sub-issue
```

The use of approximation is important. The repo's graph concepts should not be distorted merely to
match current vendor primitives.

### 4.2 Why plan -> Project is stronger than thread -> label as the primary mapping

A plan is goal-bearing and contains executable work. A Linear Project is also goal-bearing and
contains issues. The lifetimes and semantics align.

A thread is a continuity and navigation concept that may span many plans and products. A Linear
label can classify issues across projects, but it cannot carry the full durable scope or acceptance
of a thread. Therefore:

- plan -> Project is a credible primary projection;
- thread -> label is a credible secondary classification;
- landing -> issue may be a useful finite evidence record, but should not define the ontology;
- current workstreams and todos are stronger candidates for issues than the session boundary itself.

### 4.3 Existing implementation evidence

The current repository contains almost no Linear implementation.

Present:

- the Cursor plugin setting enables `linear` in [`.cursor/settings.json`](../../.cursor/settings.json);
- the graph foundation exists in
  [`packages/core/graph-core`](../../packages/core/graph-core/README.md) and
  [`packages/libs/graph-ingest`](../../packages/libs/graph-ingest/README.md);
- the V0 plan schema reserves `projects_to`;
- plans and ADRs describe future connectors and projections.

Not found:

- product code importing `@linear/sdk`;
- a `LINEAR_API_KEY` integration outside the old future plan;
- an implemented `mcp.linear.app` configuration;
- `projects_to` schema or runtime code;
- a Linear projector or exporter command;
- a Linear connector under `agent-tools`;
- validated write-back;
- PR-template integration;
- a GitHub workflow performing reconciliation;
- an implemented stale-pointer or projection-integrity validator.

The older plan claims that the Linear MCP plugin was already wired in both Cursor and Claude. The
current [`.claude/settings.json`](../../.claude/settings.json) enables Sentry, MCP-server-development,
and Sonar plugins, but not Linear. That claim is therefore stale or at least no longer demonstrated
by the current configuration.

### 4.4 Open architectural questions

#### Projection cardinality

The V0 plan schema currently gives `projects_to` cardinality `0..1`. The earlier governed graph
proposal expected many-to-many relationships.

Both shapes are plausible:

- one plan -> one Linear Project is simpler and semantically clean;
- one project may legitimately coordinate several repo plans;
- one large repo plan may require several projects across teams or phases;
- a product increment may cut across multiple plans and projects.

This should be settled from actual team and Linear usage rather than by abstract preference. The
first real consumers are a cheap probe; the schema should remain strict once grounded.

#### Stable external identity without PII or secrets

The repo needs a precise distinction among:

- public or safe external object references;
- opaque service IDs;
- organisation identifiers;
- personal identifiers;
- credentials and secrets.

"No PII in version control" is necessary but insufficient as a complete identity contract. If a
graph edge must resolve durably, the system needs a safe, stable reference representation plus a
local or service-side resolver.

#### Write mechanism

The old design relies on an agent emitting Linear state during session handoff. That rides an
existing action surface, but it still depends on conversational workflow and agent compliance.

The graph architecture suggests a stronger target:

- derive the intended external projection from typed plan nodes;
- compute the desired-state delta;
- present supervised mutations;
- apply mutations through one canonical command path;
- validate the resulting external relationship;
- make reconciliation idempotent and rerunnable.

This would make session handoff a trigger, not the owner of Linear semantics.

#### Failure semantics

The old plan permits skipped emissions on MCP timeout and warning-only freshness checks. That is in
tension with current doctrine:

- strict and complete;
- no warning toleration;
- fail fast;
- no silent fallback;
- every issue earns a check.

A later design needs explicit failure behaviour. Plausible questions include:

- does a failed projection block the handoff or queue a durable recovery item?
- where is the uncommitted mutation represented?
- how is idempotency proven?
- how is partial success rolled forward without duplicate projects or issues?
- what evidence proves the external state now matches the graph projection?

#### Ownership of execution status

The V0 model says Linear owns live status. The current plan folder taxonomy still contains
`active/` and `current/`, and the root plans README still describes them as separate execution
lanes. The V0 schema explicitly intends to collapse that distinction once the projection is real.

Until Linear is actually a dependable consumer, removing all repo execution orientation could make
the repo less usable. This is an example where architecture and migration sequencing must be held
apart: the target decision is clear, but the current repo still needs a legible interim execution
surface.

## 5. Notion

### 5.1 Current finding

Notion has no current strategic or operational role in the OCE surface architecture found by this
review.

The concrete history is documented in
[ADR-004](../../docs/architecture/architectural-decisions/004-no-direct-notion-sdk-usage.md).
The former `oak-notion-mcp` workspace was removed. It had served as an architectural forcing
function: supporting a second MCP server forced the original codebase to generalise. Once the
ecosystem supported multiple MCP servers natively, that forcing function became obsolete.

Searches for `@notionhq/client` and `oak-notion-mcp` produce archived implementation plans,
baselines, and historical analyses rather than current code or product-governance plans.

### 5.2 Enduring lesson

The useful outcome of the Notion work is not a continuing requirement to connect OCE to Notion. It
is the anti-corruption principle preserved by ADR-004:

- isolate external SDKs behind domain interfaces;
- prevent vendor vocabulary from leaking into the core model;
- retain testability through simple substitutes;
- keep external API change local to the adapter;
- express OCE's domain rather than the vendor's objects.

This principle applies directly to Linear, Slack, Figma, PostHog, Sentry, and every other service.

### 5.3 Could Notion still earn a role?

There is a plausible future role for Notion as a curated asynchronous stakeholder portal:

- narrative project summaries;
- accessible strategy explanations;
- decision briefings;
- onboarding or organisational context;
- a browsable status surface for people who will not use GitHub or Linear.

But the repository does not currently establish that need, audience, or authority boundary. Adding
Notion because it is familiar or already used elsewhere would create another editable knowledge
surface before proving that it adds unique value.

An architecture-compatible Notion role would therefore be one of:

- a generated read model;
- a read-only projection;
- an explicitly curated communication artefact with provenance back to the graph;
- a service-native collaboration object whose authority is narrowly defined.

It should not become a second planning estate or an editable mirror of repo strategy and plans.

The falsifier for the current "no role yet" judgement would be a concrete stakeholder workflow that
cannot be served adequately by Slack, Linear, GitHub, generated reports, or a public web surface,
and for which Notion's native collaboration model materially improves value.

## 6. GitHub and pull requests

GitHub has a clear role as the proposed-change and readiness aggregation surface.

A pull request naturally aggregates:

- commits and diffs;
- human review;
- AI review;
- quality gates;
- deployment previews;
- plan and strategy references;
- Linear project or issue links;
- Figma design references;
- Sentry or PostHog evidence where relevant;
- release-readiness context.

The imported service-authority model correctly says that GitHub does not own delivery priority or
durable strategy. It owns the proposed change and the evidence needed to decide whether that change
is ready to merge.

The governed-document-graph proposal additionally suggests explicit review lanes for mixed PRs,
including:

- strategy and authority;
- plan-estate governance;
- evidence and report method;
- generated code and schema sync;
- runtime behaviour;
- agent-practice doctrine;
- repo/Linear projection;
- migration and disposition integrity.

This is conceptually strong, but the review did not find a fully operationalised typed PR-readiness
contract or a repo-wide PR template implementing these lanes.

GitHub is also the change axis in ADR-207. It joins intent to commits and pull requests, then to
deployments and incidents through `realized_by` and evidence relationships. This is a more valuable
use than adding a parallel GitHub Project merely to duplicate Linear.

## 7. Slack and Ask Oisín

### 7.1 The clearest stakeholder surface

[Ask Oisín](../plans/slack-assistants/current/ask-oisin.plan.md) is the most concrete current answer
to internal stakeholder legibility.

Its design is deliberately not a new source of truth:

- it serves internal Oak staff;
- it answers questions about OCE, the repo, strategy, planning, and the Practice;
- it reads the live repository through the official remote GitHub MCP;
- it is read-only at the repository boundary;
- it does not vendor or copy the repo corpus;
- Slack renders the conversation, but the repo remains the grounding source.

This is architecturally excellent because it makes the canonical substrate more accessible without
forking it.

### 7.2 Current implementation state

The plan is decision-complete and queued, but the workstreams remain pending. Searches for the
planned `apps/slack/ask-oisin` path find the plan and design record rather than landed app code.

The plan includes:

- shared `ai-gateway` and `slack-assistant` libraries;
- live GitHub MCP attachment;
- a strict PII egress boundary;
- internal installation allow-listing;
- rate limiting and retry de-duplication;
- Sentry observability;
- deployment and live validation;
- documentation and readiness review.

### 7.3 Governance signal exposed by the plan

The Ask Oisín frontmatter currently says:

- `strategic_choice: "n/a — new surface domain"`;
- `serves_stream: "agentic surfaces over Oak's MCPs (new; no parent stream record yet)"`.

The planning-estate rewrite explicitly identifies unregistered `serves_stream` and orphan thread
values as defects. It requires every organising axis to have a registry and reference-integrity
validation.

This does not show that Ask Oisín is strategically wrong. It shows that a real new stakeholder
surface has arrived faster than the current strategy and planning taxonomy can place it. The plan
is therefore useful evidence for the refounding's lane and strategic-choice work.

### 7.4 Broader implication

Ask Oisín may be the first concrete example of a general class:

> stakeholder read models and conversational projections over the canonical graph.

That class could later include:

- Slack assistants;
- generated leadership briefs;
- public project explainers;
- onboarding navigators;
- role-specific status views;
- question-answering interfaces over strategy, plans, and evidence.

The shared architectural requirement is that these surfaces remain grounded, attributable, and
read-oriented unless a separate supervised command capability is explicitly designed.

## 8. Figma

The imported service-authority model gives Figma a coherent role:

- visual design intent;
- interaction flows;
- component variants;
- responsive behaviour expectations;
- design-system artefacts;
- design comments and collaboration state.

It also correctly denies Figma authority over:

- implemented behaviour;
- runtime truth;
- repo strategy;
- code-level accessibility proof;
- release readiness by itself.

The product-development-governance collection README says Figma is a real near-term need as a team
and designer arrive, but projection tooling should wait until the consumers exist.

The unresolved issue is that Figma is not simply another evidence service:

- within design work, it may carry normative design intent;
- when implementation begins, it becomes an input and acceptance reference;
- after implementation, previews and tests provide evidence back to design review;
- design comments are live collaboration state;
- some design-system contracts may need a machine-readable canonical form shared with code.

ADR-201's first-cut external-system list does not include Figma, and the external-evidence plan does
not assign it a connector. A later architecture should decide whether Figma participates through
several distinct edge families rather than one generic `evidence` relationship, for example:

- `designed_by` or `design_source`;
- `implements_design`;
- `reviewed_against`;
- `validated_by` for accessibility or preview evidence;
- a collaboration-state link that is not durable intent.

Those names are illustrative only; the vocabulary should be grounded and ratified rather than
invented by this report.

## 9. Operational, quality, analytics, and evidence systems

### 9.1 Sentry and OpenTelemetry

Sentry and OpenTelemetry own runtime error, trace, performance, and incident facts. They do not own
product priority or strategy. Their evidence can:

- identify failures;
- measure change-failure and recovery behaviour;
- attach incidents to product increments;
- inform engineering plans;
- contribute to release and operational decisions.

The observability estate is the most developed external evidence foundation, but the full
intent-to-runtime graph loop is not yet built.

### 9.2 PostHog

PostHog is strategically important because it is intended to close the user-value loop rather than
merely report engineering activity.

The external-evidence plan names PostHog as the primary source for `validated_by` usage and
behaviour evidence. ADR-207 treats the user-value loop as higher priority than the delivery metrics
because delivery without end-user evidence can optimise the wrong thing.

PostHog should therefore not become a strategy authority. It observes behaviour; the repo defines
what the observation means, which hypothesis it bears on, and what decision follows.

### 9.3 Vercel and deployments

Deployment systems own environment and deployment facts. They can supply:

- deployment frequency;
- production transition times;
- failed deployment events;
- preview links;
- environment state.

They do not define product intent or release acceptance by themselves.

### 9.4 Sonar

Sonar supplies static code-quality and vulnerability findings. It is evidence within an engineering
policy boundary, not an independent product or architecture decision maker.

A finding becomes meaningful through repo doctrine and the affected change context. The quality
gate may block a PR because repo policy says it does, not because the service acquires authority over
intent.

### 9.5 Elastic

Elastic owns search/index/query operational state and retrieval evidence. It can support search
quality and system diagnosis, but relevance metrics do not become product success without user and
curriculum context.

### 9.6 The common evidence contract

The proposed common pattern is:

```text
repo intent -> work and product change
external system -> observed fact
observed fact -> typed evidence edge
repo-owned interpretation -> decision, learning, or new intent
```

This is stronger than copying dashboards into reports. It preserves source authority while making
evidence structurally traversable.

## 10. GitHub Projects, public roadmaps, and other public surfaces

The old external-pointer-surface plan considered a GitHub Project and rejected it for the current
internal-visibility need:

- Linear is the chosen internal execution surface;
- commits and PRs already provide GitHub-native change state;
- another project board would duplicate rather than add;
- every extra surface creates sync, drift, and attention costs.

It leaves a clear reopening trigger: a future need for a **public roadmap** visible to external
partners, curriculum organisations, or community contributors.

That remains a legitimate unmet surface, but it should be framed by audience need rather than by the
availability of GitHub Projects. Candidate public read models could include:

- a generated GitHub Project;
- a generated web roadmap;
- GitHub Discussions;
- a public subset of graph projections;
- milestone and product-increment pages.

The essential constraints would be:

- no private planning or personal execution data;
- clear provenance to public repo intent;
- generated rather than manually mirrored state where possible;
- no accidental commitment language;
- accessibility and comprehensibility for non-engineering audiences.

## 11. Code and configuration inventory

### 11.1 Foundations present

- [`packages/core/graph-core`](../../packages/core/graph-core/README.md): RDF/JS-aligned terms,
  datasets, JSON-LD, canonicalisation, and vocabulary registry.
- [`packages/libs/graph-ingest`](../../packages/libs/graph-ingest/README.md): reusable graph ingestion
  modes and source mapping.
- Plan and idea-graph architecture in ADR-200 and the current rewrite plan.
- Reserved plan-layer `projects_to`, `realized_by`, and `validated_by` edges.
- Cursor plugin enablement for Linear, PostHog, Sentry, Vercel, and other services.
- Claude plugin enablement for Sentry and Sonar, but not currently Linear.
- Slack assistant design and executable plan.

### 11.2 Important implementation absent

- no idea-node JSON Schema or idea-graph domain SDK yet;
- no plan projection runtime;
- no Linear client or connector;
- no Linear desired-state calculation;
- no Linear mutation command;
- no Linear reconciliation validator;
- no external evidence edge schema;
- no connector/triggers/write-back implementation;
- no DORA graph projection;
- no PostHog-to-`validated_by` implementation;
- no Figma connector or edge contract;
- no Notion connector or current role;
- no Ask Oisín app code yet;
- no generated public stakeholder surface.

The architecture is therefore intentionally ahead of the implementation. Current-state language
must remain future-tense wherever the consuming runtime does not exist.

## 12. Contradictions, drift, and unresolved overlaps

| Tension | Earlier or weaker shape | Later or stronger shape | Current assessment |
| --- | --- | --- | --- |
| Linear primary mapping | Thread -> label; landing -> issue; one repo project | Strategic choice -> Initiative; plan -> Project; workstream -> issue | Reconcile; later V0 schema governs primary semantics |
| Data direction | Repo -> Linear only | Intent projects outward; execution/evidence reports back | Older non-goal is overtaken by ADR-201 direction, subject to ratification |
| Trigger ownership | Session handoff emits updates | Graph-derived desired state, connectors, triggers, validated write-back | Session handoff may trigger, but should not own semantics |
| Failure behaviour | Skip on MCP timeout; warnings initially | Strict, complete, no warning toleration, fail-fast | Old fallback/warning shape is not compatible with current doctrine |
| Cardinality | One existing repo project; thread labels | V0 `projects_to` 0..1 | Must be tested against real team/project structure; many-to-many remains plausible |
| Linear plugin state | Claimed wired in Cursor and Claude | Current config demonstrates Cursor only | Older claim is stale or unproven |
| Graph authority | Governed document graph | Living idea graph with documents as projections | ADR-200 supersedes document-as-fundamental framing |
| External service model | Peer pointer surface | Typed projection and evidence edges | Pointer language remains useful for navigation but is incomplete |
| Figma | Design source in imported semantic model | Omitted from ADR-201 connector map | Needs separate ratification and likely more than one edge family |
| Ask Oisín strategy placement | New unregistered stream; no strategic choice | Registered axes and mandatory traceability | Input to refounding; not proof that the surface is invalid |
| Notion | Former MCP forcing function | No current role | Do not assume a new integration need from history |
| Execution state in repo | `active/` and `current/` folders | Linear-owned execution status; future folder collapse | Target decided, migration dependent on dependable projection |

## 13. Assessment through the decision lenses

### 13.1 Long-term architectural excellence

The excellent shape is **one canonical intent graph with purpose-specific projections, commands,
and evidence connectors**, not a mesh of independent pairwise synchronisations.

Each external integration should be an adapter over OCE-owned contracts. Linear, Slack, Figma,
GitHub, and evidence systems should not force vendor concepts into the core intent model.

### 13.2 Strict and complete

Every external relationship eventually needs a typed contract covering:

- actor;
- operating context;
- source and target;
- data direction;
- capability mode;
- authority effect;
- supervision;
- safe external identity;
- failure semantics;
- idempotency;
- reconciliation;
- validation;
- persistence or derivation policy;
- privacy and audit behaviour.

Best-effort copying and "remember to update the other tool" are not acceptable end states.

### 13.3 Could it be simpler without compromising quality or value?

Yes: do not add a surface until it has a unique job.

- Linear earns its place through execution coordination.
- GitHub earns its place through changes and readiness.
- Slack earns its place through low-friction internal access.
- Figma earns its place through design collaboration.
- Evidence systems earn their place through specialised observation.
- Notion does not yet have a unique role.
- GitHub Projects does not yet have a unique internal role.

Simplicity does not mean reducing capability. It means avoiding redundant editable authorities.

### 13.4 Would it be simpler if the system changed?

Yes. The key system change is to stop treating the problem as document and ticket synchronisation.
Instead build:

- one canonical graph;
- typed projections into operational systems;
- supervised command paths for mutation;
- generated read models for audiences;
- returning evidence edges;
- deterministic and semantic reconciliation at the right boundaries.

This dissolves much of the sync problem rather than managing its symptoms.

### 13.5 Optimise for user value

Every surface should begin with an audience and a decision or task:

- what does a delivery lead need to coordinate?
- what does an engineer need during implementation?
- what does a designer need to author and review?
- what does an Oak stakeholder need to understand?
- what does a partner or contributor need to see?
- what evidence is needed to know the work benefited teachers?
- what can an agent safely read or change in each context?

The repo is highly developed around architecture, graph modelling, and agent operation. Its explicit
stakeholder audience taxonomy is less mature. Ask Oisín begins to close that gap, but a broader
audience-and-decision map would be needed before selecting additional stakeholder surfaces.

## 14. Current model and candidate future decomposition

The following is an interpretation of the emerging architecture, not a ratified design:

### Layer A — canonical intent

- idea graph;
- human documents as co-equal projections;
- strategy, choices, plans, decisions, acceptance, and interpretation;
- stable identifiers and registered vocabularies.

### Layer B — command and execution projection

- plan -> Linear Project;
- workstream/todo -> issue or sub-issue;
- strategic choice -> Initiative where useful;
- thread labels as cross-project classification where earned;
- supervised, idempotent desired-state reconciliation.

### Layer C — change and readiness

- GitHub commits and PRs;
- typed links to plans and external execution objects;
- review lanes and required checks;
- previews and evidence aggregation.

### Layer D — specialised collaboration

- Figma for design intent and design collaboration;
- Slack for questions and access;
- service-native annotations where the object of work belongs to that service.

### Layer E — external observation

- Sentry/OpenTelemetry, PostHog, Sonar, Vercel, Elastic;
- source-owned facts represented by typed external nodes or resolvable references;
- generated summaries and returning evidence.

### Layer F — stakeholder read models

- Ask Oisín;
- generated reports;
- leadership or team views;
- public roadmaps if later required;
- possibly Notion only if a distinct stakeholder workflow earns it.

The reusable mechanism across Layers B–F should be generic where the principles require it, with
thin OCE-specific configuration and interpretation.

## 15. Principal gaps

### Gap 1 — no single accepted service-boundary ADR

ADR-200 is accepted for the substrate, but ADR-201 remains proposed. The imported service-authority
model is broader than ADR-201 and includes Figma, stakeholder surfaces, and operating contexts. The
repo therefore has a coherent direction but not yet one accepted, complete cross-service authority
contract.

### Gap 2 — Linear design is split across eras

The old pointer-surface plan, V0 schema, ADR-201, ADR-207, and the external-evidence plan each hold a
part of the Linear model. No current artefact reconciles them all.

### Gap 3 — stakeholder audiences are under-modelled

The service map is strong, but the audience map is partial. "Stakeholders" may mean:

- Oak leadership;
- product and delivery colleagues;
- engineers;
- designers;
- curriculum experts;
- partner organisations;
- public contributors;
- adopters of the Practice;
- external developers;
- auditors or governance reviewers.

Those audiences need different altitudes, disclosure, cadence, interaction, and language. Selecting
a tool before defining the audience risks building the wrong projection.

### Gap 4 — no implementation bridge from graph architecture to service adapters

The repo has generic graph substrate, but the idea graph, plan projection SDK, external-node model,
safe identity resolver, command architecture, and connector framework are not built.

### Gap 5 — no settled Figma semantics

Figma is acknowledged but does not fit neatly into the existing evidence-only framing.

### Gap 6 — Notion has no problem statement

The absence of a current Notion integration is not itself a defect. The missing item is evidence
that a unique Notion-shaped need exists.

### Gap 7 — current plans can predate the registered strategy axes they need

Ask Oisín demonstrates the practical consequence: valuable new work can appear before the planning
corpus has a legal strategic or stream value for it. The refounding must preserve that signal rather
than forcing the plan into an incorrect existing category.

### Gap 8 — execution migration sequencing remains unresolved

The target removes hand-maintained repo execution state in favour of Linear projection. The current
repo still depends on folder and continuity cues. A migration must prevent a period in which neither
surface is dependable.

## 16. Candidate dispositions for later owner-governed work

These are not actions authorised by this report. They are the most coherent candidate dispositions
for a later planning or architecture turn.

1. **Treat the V0 plan schema and ADR-200 as the starting authority for Linear**, not the old
   pointer-surface plan.
2. **Harvest and retire or rewrite the old Linear plan during corpus refounding**, preserving its
   useful findings: no-collapse thread visibility, low-noise cadence, local secret/PII boundary,
   and the distinction between navigation pointers and authority.
3. **Ratify or replace ADR-201 only after reconciling the broader service-authority model**, including
   Figma and stakeholder read surfaces rather than evidence systems alone.
4. **Define an audience-and-decision map before selecting another stakeholder tool.** This is the
   missing problem statement for Notion and public surfaces.
5. **Use Ask Oisín as a proving instance for read-model architecture**, not as a one-off Slack bot.
6. **Derive Linear state from typed plan nodes**, with one command and reconciliation path, rather
   than distributing vendor writes across session workflows.
7. **Keep GitHub PRs as the readiness aggregation hub**, with typed review lanes and links rather
   than duplicating planning state in GitHub Projects.
8. **Model Figma with design-specific semantics**, not by forcing it into a generic operational
   evidence connector.
9. **Separate current-state orientation from target execution authority during migration** so the
   current repo remains navigable until Linear projection is proven dependable.
10. **Require runtime evidence before present-tense integration claims.** Configuration toggles and
    future plans are not proof that a connector or stakeholder surface exists.

## 17. Falsifiers and uncertainty

This report's model should change if first-hand evidence shows any of the following:

- a team cannot coordinate delivery effectively when durable intent remains repo-owned;
- plan -> Linear Project repeatedly fails because real project boundaries are structurally different;
- stakeholders do not use or trust a live repo-grounded Slack surface;
- Notion provides a unique collaboration or communication function not covered elsewhere;
- Figma cannot be connected without making it an authority surface for particular product-design
  contracts;
- strict desired-state reconciliation produces more complexity and lower reliability than a
  service-native workflow with explicit repo references;
- the idea graph fails to become human-usable or becomes a bottleneck for ordinary work;
- public partners require a roadmap before the graph and projection infrastructure is available.

The strongest current judgement is therefore conditional:

> The graph-centred projection-and-evidence architecture is the best fit to the repo's accepted
> principles and decisions, but its service mappings and stakeholder value must still be proven by
> real consumers rather than inferred solely from architectural coherence.

## 18. Conclusion

The most important reframing is:

> OCE should not be "connected to" a collection of external tools. OCE should expose a governed set
> of projections, command paths, evidence channels, and read models over a canonical intent system.

That makes the architecture:

- vendor-independent;
- legible to humans and agents;
- strict about authority;
- capable of serving different audiences without duplicating intent;
- able to close the loop from strategy through delivery to observed value.

Linear is the clearest operational consumer, but its integration should be re-derived from the
accepted plan and idea-graph architecture rather than implemented directly from the older
pointer-surface plan.

Notion is historical, not currently part of the model. It should remain absent unless a distinctive
stakeholder need is demonstrated.

Ask Oisín is strategically significant because it is not another store: it is a live, read-only
stakeholder lens over the canonical repo. It may be the first concrete example of the broader
projection/read-model architecture, even though its own strategy traceability still needs
reconciliation.

The conceptual direction is strong. The estate's present weakness is not a lack of ideas; it is
**unretired conceptual overlap and the distance between accepted architecture and running
integration code**. The current plan-corpus refounding is therefore a genuine prerequisite, not
planning ceremony.

## Source inventory

### Reasoning and governance

- [`oak-reason`](../skills/reason/SKILL-CANONICAL.md)
- [`oak-metacognition`](../skills/metacognition/SKILL-CANONICAL.md)
- [Metacognition directive](../directives/metacognition.md)
- [Principles and decision lenses](../directives/principles.md)

### Accepted architecture and current plans

- [ADR-200 — intent as a living idea graph](../../docs/architecture/architectural-decisions/200-intent-as-a-living-idea-graph.md)
- [ADR-207 — DORA delivery metrics as a structural property](../../docs/architecture/architectural-decisions/207-dora-delivery-metrics-as-a-structural-property.md)
- [V0 plan-node schema](../plans/product-development-governance/plan-node-schema.v0.md)
- [Planning-estate rewrite](../plans/product-development-governance/current/planning-estate-rewrite.plan.md)
- [Plan-corpus refounding](../plans/product-development-governance/active/plan-corpus-refounding.plan.md)
- [Plans root index](../plans/README.md)

### Proposed and future integration architecture

- [ADR-201 — external systems as evidence edges](../../docs/architecture/architectural-decisions/201-external-systems-evidence-integration.md)
- [External-evidence integration plan](../plans/product-development-governance/future/external-evidence-integration.plan.md)
- [External pointer-surface plan](../plans/agentic-engineering-enhancements/future/external-pointer-surface-integration.plan.md)

### Product-development-governance inputs

- [Collection authority and disposition](../plans/product-development-governance/README.md)
- [Service authority and operating contexts](../plans/product-development-governance/suggestions/service-authority-and-operating-contexts.semantic-model.md)
- [Governed repo document graph plan](../plans/product-development-governance/suggestions/governed-repo-document-graph.plan.md)
- [Repo intent and service knowledge boundaries](../plans/product-development-governance/suggestions/repo-intent-and-service-knowledge-boundaries.proposal.md)

### Stakeholder and service surfaces

- [Ask Oisín design](outreach/oisin-oce-navigator-design.md)
- [Slack assistants collection](../plans/slack-assistants/README.md)
- [Ask Oisín plan](../plans/slack-assistants/current/ask-oisin.plan.md)
- [ADR-004 — deprecated Notion adapter decision](../../docs/architecture/architectural-decisions/004-no-direct-notion-sdk-usage.md)

### Code and configuration foundations

- [`graph-core`](../../packages/core/graph-core/README.md)
- [`graph-ingest`](../../packages/libs/graph-ingest/README.md)
- [Cursor settings](../../.cursor/settings.json)
- [Claude settings](../../.claude/settings.json)
