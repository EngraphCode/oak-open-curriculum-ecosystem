# Public-alpha teacher workflows through MCP

**Date:** 2026-07-13

**Status:** Product-direction record and current-state observations. This is exploration, not a plan
or implementation proposal.

This first part records the owner direction and the relevant repository and protocol facts before
running the Concept Exploration workflow. The exploration follows in a later section so that the
source understanding remains distinguishable from its synthesis.

## Product direction to preserve

The public alpha exists to bring Oak's content, curriculum quality, understanding, and intent into
the major AI applications where teachers are already working. It connects those assets to the
teacher's existing effort; it is not primarily a content-generation product.

The intended entry point is ordinary teacher language, for example:

> I want to prepare a Year 9 lesson using the Oak photosynthesis materials.

This is a demonstration utterance, not the boundary of the capability.

The consuming agent should recognise the intent, ask useful refining questions, find and present
the appropriate Oak content and materials, and facilitate the teacher's requests. Facilitation is
the agent's only role. Teacher authority is invariant throughout every user interaction: the agent
does not take decision authority at discovery, refinement, presentation, transformation, or any
other stage.

This is the product expression of
[ADR-194](../../docs/architecture/architectural-decisions/194-teacher-as-expert-product-boundary.md):
Oak surfaces inform and offer options, while the teacher remains the pedagogical expert and the
authority on what should happen.

Two invariants govern every workflow discussed here:

1. **Teacher authority:** the teacher remains in control throughout every interaction. The agent
   facilitates the teacher's work; it does not decide on the teacher's behalf.
2. **Curriculum generality:** the workflows and tools must operate across any Oak lesson, topic, or
   unit. Named subjects, years, lessons, and places are demonstration fixtures, never hard-coded
   branches or boundaries in the capability.

For milestone scope:

- **Public alpha:** finding, understanding, presenting, and using Oak content and materials in the
  teacher's existing workflow. Generation is secondary; lesson adaptation is tangential.
- **Public beta horizon:** adaptation and localisation become a stronger product priority. The
  sophisticated end of that capability must remain visible on the roadmap even if delivery begins
  with simpler forms.

## Generic capabilities and their demonstration fixtures

### Demonstration fixture 1: prepare an existing [Year 9 photosynthesis lesson](https://www.thenational.academy/teachers/programmes/science-secondary-ks3/units/plant-nutrition-and-photosynthesis/lessons/photosynthesis)

This example demonstrates a generic lesson-preparation flow. It must work whether the teacher
starts with a lesson, a topic, or a unit, and regardless of subject or year. The useful flow is
likely to include resolving the relevant Oak lesson, establishing what the teacher wants to
prepare, and presenting its outcome, key learning points, misconceptions, transcript, quizzes, and
available assets selectively. Which of those matter, and what the teacher does with them, are
matters for the dialogue rather than a fixed output template.

This differs materially from the current `lesson-planning` MCP prompt. That prompt searches for an
Oak analogue and then instructs the model to assemble a complete lesson with a new outcome,
sequence, assessments, resources, and adaptation notes. Its content is useful candidate material,
but its current goal is broader and more generative than preparing to teach an existing lesson.

### Demonstration fixture 2: localise the [Local Area lesson](https://www.thenational.academy/teachers/programmes/geography-primary-ks1/units/local-area-where-do-we-live/lessons/our-local-area) for Watford, England

Localisation has degrees. In this use case it is generally about engagement and contextual
relevance, not changing the educational content itself. The source lesson already invites the
teacher to replace its example aerial maps with maps of the school's local area. The agent can help
the teacher inspect the lesson, identify context-bearing elements, gather teacher-supplied local
context, and present possible substitutions. The fixed locale for the demonstration is **Watford,
England**. Watford exercises the generic localisation flow; it must not appear in the workflow or
tool implementation as a special case. The teacher decides what is locally and pedagogically
meaningful.

A useful gradient is:

1. **Engagement-level context:** familiar place names, photographs, examples, or prompts while the
   educational intent remains unchanged.
2. **Contextual material substitution:** local maps, features, routes, or fieldwork references that
   serve the same intended learning.
3. **Resource transformation:** editing or producing lesson artefacts that carry those choices.
4. **Pedagogical or educational-content adaptation:** changing teaching decisions, sequencing,
   support, assessment, or intended learning.

The earlier degrees provide a credible starting point. The later degrees require progressively
more capability, review, and explicit teacher direction; they are a beta-horizon concern rather
than an implied alpha promise. At every degree and in every interaction, the teacher retains
authority and the agent only facilitates.

## MCP interaction constraint

The [MCP 2025-11-25 prompts specification](https://modelcontextprotocol.io/specification/2025-11-25/server/prompts#user-interaction-model)
defines prompts as user-controlled: they are intended to be explicitly selected through a
user-initiated interface. The existing Oak prompts are therefore useful commands for a teacher who
knows they exist, but they are not an agent-facing mechanism that can reliably activate when the
teacher makes a natural-language request.

This creates a mismatch: early draft workflow instructions exist in the prompt bodies, but the
consuming agent cannot depend on those instructions being present when it interprets ordinary
teacher language.

The [resources specification](https://modelcontextprotocol.io/specification/2025-11-25/server/resources#annotations)
offers a relevant but qualified mechanism:

- resources may be annotated with `audience: ["assistant"]` and a priority;
- those annotations are hints clients can use when choosing context; and
- resources remain application-driven. A host may expose manual selection, search, heuristic
  inclusion, or model selection. The protocol does not guarantee automatic injection or reading.

An assistant-audience resource can therefore be the canonical home for agent-facing workflow
guidance, but the annotation alone cannot establish a consistent cross-host natural-language UX.

## What already exists in this repository

The repository already implements most of the proposed delivery pattern at the orientation level:

- `curriculum://model` is an assistant-audience, priority `1.0` resource containing the domain
  model and tool guidance;
- `get-curriculum-model` exposes the same content through a model-controlled, read-only tool; and
- tool descriptions repeatedly direct the consuming agent to call that tool first.

This dual resource-and-tool exposure is a stronger starting point than adding a second generic
"read the resources" tool. The unresolved question is how detailed teacher workflows join that
existing single source without making the always-loaded orientation indiscriminately large.

The current `curriculum://model` lesson-planning workflow is a generic sequence for finding a
lesson and gathering its summary, transcript, quiz, and assets. The current `lesson-planning` and
`adapt-lesson` prompt bodies are much richer, but are user-controlled. The latter is specifically
an EEF evidence workflow, not a general localisation workflow.

The manual UAT guide correctly tests prompts as discoverable through `prompts/list` and retrievable
through `prompts/get`. That proves the MCP prompt surface, not the desired teacher outcome: an
agent recognising a natural-language request, entering the appropriate refining workflow, and
maintaining the teacher-as-expert boundary across different hosts.

## Provisional problem statement

Oak possesses both the curriculum data and early workflow knowledge needed to support these use
cases, but the detailed workflow knowledge is bound to a user-controlled MCP primitive. The
agent-facing orientation path is discoverable and model-accessible, but does not yet carry the
intent-sensitive refining workflows. As a result, a teacher's natural-language request may reach
the tools without the Oak-authored understanding needed to facilitate it well.

## Questions to take into Concept Exploration

- Should the detailed workflows be separate, bounded assistant-audience resources reached through
  a compact index, or part of `curriculum://model`?
- Should `get-curriculum-model` gain intent-scoped retrieval, should a small dedicated workflow
  discovery tool return the relevant guidance, or is strong tool metadata sufficient?
- What trigger descriptions let a consuming agent recognise "prepare an existing lesson" without
  converting it into "generate a lesson"?
- What contract makes the same flow work from any lesson, topic, or unit without demo-specific
  instructions?
- What minimum refining dialogue is genuinely useful, and which questions should only arise from
  the teacher's stated goal?
- Which behaviours can be demonstrated across the target AI hosts, given that resource inclusion
  is application-driven?
- Where is the explicit alpha boundary between using and presenting existing content, simple
  engagement-focused localisation, and beta-level resource or pedagogical transformation?

## Related repository evidence

- [MCP help-surface research](mcp_agent_guidance_provision.md)
- [Agent-facing content audit](../reports/mcp-agent-facing-content-audit/report.md)
- [Rendered agent-facing surfaces](../reports/mcp-agent-facing-content-audit/rendered-wholes.md)
- [Manual MCP UAT guide](../../apps/oak-curriculum-mcp-streamable-http/docs/manual-uat-guide.md)
- [Teacher-as-expert boundary](../../docs/architecture/architectural-decisions/194-teacher-as-expert-product-boundary.md)

## Concept Exploration

This section applies [Resonance's upstream four-movement Concept Exploration workflow](https://github.com/EngraphCode/resonance/blob/main/baxtersgallery/research/concept-exploration.md)
to the preceding Oak-specific observations. The local use retains the four reflective movements but
does not adopt Resonance's repository governance or decision-matrix layer. It evaluates the concept
and the two demonstration fixtures; it does not turn the outcome into an implementation sequence.

### Movement 1: reflect on the raw observations

Several observations are load-bearing:

1. The teacher's natural-language request is the real entry point. Requiring prior knowledge of an
   Oak slash command would move discovery work back onto the teacher and break the intended UX.
2. The named stories are demonstration fixtures, not capability definitions. The workflows and
   tools must work across any lesson, topic, or unit; photosynthesis and Watford are concrete probes
   of generic behaviour.
3. The current rich workflow instructions are attached to user-controlled prompts. That makes them
   candidate content, not an agent-facing capability.
4. Oak already exposes an agent-audience resource and a model-controlled orientation tool. The
   missing shape is therefore not a generic MCP "start here" surface; it is detailed workflow
   knowledge that is discoverable by intent without inflating every conversation.
5. MCP resources are application-driven. `audience: ["assistant"]` and `priority` improve the
   signal to a host, but do not oblige it to inject or let the model read the resource.
6. "Plan a lesson" is linguistically dangerous. In the product story it means supporting the
   teacher to prepare an existing lesson. In the current prompt it means assembling a complete new
   lesson. If that distinction is not encoded, fluent agent behaviour will over-generate.
7. Localisation is not one operation. The Local Area lesson's own teacher tip invites a local-map
   substitution, while its learning outcome and key learning points provide the educational anchor
   to preserve. Engagement-level context and pedagogical adaptation must not be collapsed together.
8. Teacher authority is invariant over every user interaction, not a disclaimer appended to an
   output or a boundary that activates only for overt pedagogical decisions. It changes the whole
   interaction: the agent asks what matters, offers relevant content and options, and only
   facilitates the teacher's work.
9. The alpha's distinctive value is distribution into existing AI workspaces. A technically valid
   MCP primitive that only works in one host's UI does not satisfy that value by itself.

The surprise is that the initially proposed resource-plus-tool pattern is already present in the
repository. The unanswered problem sits one layer above it: what agent-facing workflow contract
should travel through that pattern, and how does the agent reliably reach the right bounded part
from an ordinary teacher request?

### Movement 2: define the problem space

#### Kind of problem

This is an **agent experience and product-boundary problem expressed through MCP**, not primarily a
content-search or content-generation problem.

#### Gap

Oak has the curriculum content, tools, orientation substrate, and early workflow drafts. It does
not yet expose generic detailed workflows on a sufficiently portable, model-accessible path that a
consuming agent can discover from natural-language teacher intent and apply to any lesson, topic,
or unit.

#### Who the gap harms

- The teacher must know Oak's MCP commands or manually reconstruct a workflow.
- The consuming agent can find content but may miss Oak's intended way of using and presenting it.
- Oak cannot confidently demonstrate that its quality and intent, rather than only its data, reach
  teachers in the host applications.

#### Causal mechanism

The richest workflow content is bound to a user-controlled prompt primitive. The agent-facing
orientation path carries only generic workflows. Resources can carry richer guidance but their
inclusion is controlled by each host. Consequently, natural-language intent, workflow acquisition,
and curriculum tool use are not yet joined into one reliable path.

#### Constraints

- Teacher authority is invariant over all interactions; the agent's role is facilitation only.
- Workflows and tools are curriculum-generic across any lesson, topic, or unit; demonstrations do
  not create special cases.
- The server remains deterministic; runtime interpretation belongs to the consuming agent.
- Public alpha should emphasise existing Oak content and materials, not promise a generation or
  artefact-editing product.
- Guidance must remain attributable, reviewable, and consistent across prompts, resources, and
  tools rather than fork into multiple authored copies.
- Target hosts differ in prompt UI, resource inclusion, resource reading, and tool selection.
- Always-loaded guidance has context and attention costs; detailed workflows should be bounded.
- Localisation must preserve a route to sophisticated future capability without describing all
  localisation as educational-content adaptation.

#### Success

Starting with the prompt surface unavailable, a teacher can use ordinary language and the agent:

1. recognises the relevant Oak-supported intent;
2. acquires the appropriate Oak-authored workflow guidance;
3. resolves the relevant lessons, topics, or units and preserves their educational anchors and
   provenance;
4. asks a small number of relevant refining questions as the need emerges;
5. presents content, materials, and options that advance the teacher's work; and
6. preserves teacher authority throughout the interaction.

For an internal demonstration, success is not merely a polished final answer. The demonstration
must make the behavioural chain inspectable: natural-language request, workflow acquisition,
curriculum calls, selective presentation, and visible teacher control. Photosynthesis and Watford
make that chain concrete; they do not by themselves establish the required curriculum-wide
generality.

### Movement 3: reflect on possible solutions

The fluent first answer is "move the prompt bodies into assistant-audience resources and add a tool
that tells the agent to read them". Reflection exposes four inherited assumptions in that answer.

#### Assumption 1: a resource annotation makes guidance model-accessible

It does not. The annotation is a client hint. A resource-only solution is elegant as a canonical
content home but cannot establish the cross-host interaction on its own.

#### Assumption 2: a discovery tool should only point elsewhere

A pointer preserves one source of truth, but it also requires a host and agent to complete a second
resource-reading step. Where that step is unsupported or not model-visible, the tool has discovered
guidance the agent still cannot use. A more robust tool response could return the selected workflow
guidance directly, or embed/reference the resource in a way verified to work in the target host.
The canonical content can still be shared beneath both deliveries.

#### Assumption 3: the existing prompt bodies are ready-made workflows

They are early source material, not neutral payloads. The lesson-planning prompt builds a complete
lesson; the adaptation prompt frames adaptation through EEF evidence. Re-exposing either body would
carry those product assumptions into natural-language interactions. The workflow content must first
be reviewed against the narrower alpha intent and teacher-as-expert boundary.

#### Assumption 4: one detailed workflow belongs in the always-loaded curriculum model

Adding one workflow is easy; adding every future intent makes the orientation resource large and
dilutes its purpose. The better unit may be a compact intent catalogue in the orientation surface,
with bounded workflow content retrieved only when relevant.

These reflections open a broader solution space:

- **Resource catalogue only:** compact assistant-audience index plus separate workflow resources.
  This is clean and browseable, but depends heavily on host resource behaviour.
- **Orientation expansion:** put full workflows into `curriculum://model` and
  `get-curriculum-model`. This is immediately available wherever orientation works, but adds
  permanent context cost and scales poorly.
- **Intent-scoped workflow tool:** a read-only tool returns the workflow relevant to a finite
  workflow identifier or described intent. This is model-controlled and portable wherever tools
  work, but its description must be sufficiently salient for the agent to select it before making
  unguided curriculum calls.
- **Guidance in individual tool descriptions:** add workflow triggers and next-step cues to the
  tools the agent already sees. This helps selection, but distributed prose is a weak home for a
  multi-turn refining interaction and creates drift risk.
- **Layered delivery from one authored source:** a compact trigger catalogue is visible in the
  existing orientation surface and relevant tool metadata; detailed workflows are separately
  bounded; the resource and a model-controlled retrieval path render the same canonical content;
  user-controlled prompts remain optional convenience adapters rather than the capability's only
  home.

The last shape is the most promising because it treats resources and tools as delivery adapters for
one workflow contract, rather than asking one MCP primitive to serve every host and audience.

### Movement 4: synthesise and propose

#### Changed framing

The question is no longer "should workflows use prompts, resources, or a small tool?" It is:

> How can Oak publish one reviewable teacher-workflow contract through complementary MCP surfaces
> so that consuming agents can discover the right bounded guidance from natural language across
> materially different hosts?

Prompts, resources, and tools then have distinct roles:

| Surface | Role in the concept | Boundary |
| --- | --- | --- |
| User-controlled prompt | Optional teacher-invoked shortcut | Cannot be the only home of the capability |
| Assistant-audience resource | Canonical, inspectable workflow delivery | Host decides whether and how it reaches model context |
| Model-controlled tool | Portable on-demand acquisition of relevant guidance | Must return usable guidance, not assume an unsupported second hop |
| Tool and server metadata | Compact natural-language trigger and orientation cues | Must remain concise; not a full workflow copy |

The candidate direction is therefore a **layered, single-source workflow surface**:

- keep a compact catalogue of supported teacher intents in the existing orientation path;
- keep each detailed workflow bounded and independently retrievable;
- expose the same canonical workflow content as an assistant-audience resource and through a
  model-controlled retrieval route;
- make tool descriptions say when the retrieval route applies in ordinary teacher language; and
- generate or adapt user-controlled prompts from the same source as optional UI shortcuts.

This is a concept direction, not a commitment to a new tool name or resource hierarchy. In
particular, it remains open whether intent-scoped retrieval belongs in `get-curriculum-model` or in
a small dedicated tool. That choice should be informed by context size, model-selection behaviour,
and host support rather than by a preference for fewer or more primitives.

#### Evaluation of the two demonstration fixtures

| Demonstration fixture | Generic capability exercised | Public-alpha value | Teacher authority | Beta horizon |
| --- | --- | --- | --- | --- |
| Prepare Year 9 photosynthesis | Prepare from any Oak lesson, topic, or unit | Resolve and selectively expose the relevant lesson, misconception, teacher tip, quizzes, transcript, and available materials | The agent asks what help matters and facilitates; the teacher controls what to emphasise, change, omit, or teach | Deeper adaptation, generated artefacts, or resource transformation |
| Localise Local Area for Watford, England | Facilitate localisation requests starting from any Oak lesson, topic, or unit without changing educational intent by default | Identify educational anchors and context-bearing elements; support simple Watford substitutions that improve engagement | The agent presents substitution points and options; the teacher controls what is locally meaningful and pedagogically appropriate | Systematic asset editing, external local-data integration, and pedagogical adaptation |

Both fixtures are credible public-alpha demonstrations if "support" is kept literal. The
photosynthesis fixture tests whether the agent can facilitate preparation without turning it into
lesson generation. The Watford Local Area fixture tests whether it can distinguish
engagement-focused localisation from educational-content change. Neither fixture relaxes the
requirement that the underlying workflows and tools work across the Oak curriculum. The second
fixture should not imply that the Oak MCP server itself can discover arbitrary local maps or edit
downloaded slide decks unless those capabilities are actually supplied by the consuming host or a
future integration.

#### Warrants and falsifiers

| Proposition | Warrant | What would falsify or weaken it |
| --- | --- | --- |
| Detailed workflows should be bounded rather than always loaded | Context and attention costs grow with every supported intent | Host/model evaluations show the full catalogue is small, consistently attended to, and cheaper than retrieval failures |
| Resources and a model-controlled path should share one source | Resources are canonical and inspectable; tools are more portable across current agents | Every target host reliably injects or exposes assistant-audience resources to the model without user action |
| The model-controlled path should return usable guidance | A pointer-only result relies on a second host-dependent resource hop | Target-host probes show resource links returned by tools are always followed correctly |
| Simple localisation can begin before sophisticated adaptation | Engagement substitutions can preserve the lesson's educational anchors | Teachers find simple substitutions offer no material value without artefact editing or deeper pedagogical change |

Teacher authority and curriculum generality are invariants, not propositions in this table. A flow
that takes authority from the teacher or only works for its demonstration fixture has failed the
concept; contrary behaviour is not evidence that weakens the invariant.

#### Discriminating probes, not an implementation plan

The concept can be reduced further by evidence before a delivery plan exists:

- In each target AI host, can the model see `curriculum://model` automatically, list/read a bounded
  workflow resource, and use a resource link returned from a tool?
- With MCP prompts deliberately unavailable, does a compact workflow-tool description cause the
  model to acquire guidance for both demonstration fixtures?
- Can the same workflow operate on unrelated lessons, topics, and units without changing its
  authored instructions or introducing entity-specific branches?
- Does the photosynthesis interaction preserve the source lesson's specific misconception and
  "word summary" teacher tip while avoiding an unsolicited rebuilt lesson?
- Does the Local Area interaction use Watford, England as its local context, preserve the learning
  outcome, and stop at engagement-level substitutions unless the teacher requests more?
- Do teachers experience the refining questions as helpful facilitation rather than an intake form
  or disguised prescription?

These probes decide between resource-only, pointer-tool, direct-return tool, and orientation-heavy
shapes. They also produce a more honest internal demonstration: not that one model once produced a
good answer, but that Oak's workflow understanding became discoverable and constrained the agent's
behaviour in the intended way.

## Expanded Concept Exploration: the full capability space

The first pass isolated the immediate delivery gap. This second pass deliberately widens the frame:
the product experience is not only the mechanism by which an agent acquires workflow instructions.
It is the whole relationship between a teacher's natural-language intent, Oak's curriculum corpus,
the consuming agent, the host application's capabilities, and the evidence Oak can present about
the resulting behaviour.

This remains concept exploration. The candidate shapes, evidence dimensions, and unresolved
questions below are not a delivery sequence or an implementation commitment.

### Movement 1: raw observations

#### Authority and initiative are different axes

- Teacher authority does not require the agent to ask permission before every reversible search or
  retrieval. Within an expressed goal, read-only operational initiative can reduce friction.
- The authority boundary concerns who decides the goal, what is relevant, what pedagogical choices
  are made, what changes are acceptable, and what is ultimately used. Those decisions remain with
  the teacher.
- An agent can therefore say, in effect, "I found these possible Oak starting points; which one did
  you mean?" It must not silently decide which curriculum pathway the teacher ought to teach.
- Questions are not intrinsically teacher-centred. A long mandatory intake form can shift work onto
  the teacher without increasing their control. Refinement should be progressive and useful.
- Recommendations need careful semantics. Presenting grounded options, consequences, and source
  evidence facilitates a decision; selecting a pedagogical outcome on the teacher's behalf does not.

#### Generality is not uniformity

- "Any lesson, any topic, any unit" means the capability contract cannot encode photosynthesis or
  Watford as special branches. It does not mean every request must traverse the same fixed steps or
  retrieve the same lesson components.
- A lesson slug, a topic phrase, and a unit request have different ambiguity and resolution shapes.
  One generic workflow may need typed branches while retaining the same authority and fidelity
  invariants.
- Curriculum coverage includes honest empty and partial outcomes. A query outside Oak's corpus, a
  lesson without downloadable assets, or an ambiguous topic is not made successful by inventing an
  answer.
- Demonstrating two fixtures can make a generic mechanism visible. It cannot prove curriculum-wide
  generality by itself.

#### The existing retrieval substrate is already broader than the examples

- `search` covers lessons, units, threads, and sequences and can filter by curriculum dimensions;
  `explore-topic` searches lessons, units, and threads together; and `fetch` accepts typed lesson,
  unit, subject, sequence, and thread identifiers.
- Lesson summaries are consistently available, while assets, video, transcript, quizzes, and other
  components are optional. A workflow must reason from actual availability rather than assume a
  complete bundle.
- Search can return a well-formed zero-result response with guidance. The workflow layer should
  preserve that honesty instead of turning absence into fabricated curriculum content.
- `download-asset` produces a short-lived asset link. It does not edit a slide deck, worksheet, or
  other artefact. Those are materially different capabilities.

#### The experience crosses an Oak-host boundary

- Oak can make its content, curriculum model, safeguards, provenance, and workflow understanding
  available. A consuming host decides how resources are exposed, what tools a model can select, how
  links are handled, and whether capabilities such as web search or file editing exist.
- A host may be able to find a local map or edit a presentation even when the Oak server cannot.
  Guidance may coordinate with those capabilities, but should not claim them as Oak capabilities or
  assume they are portable.
- MCP resource annotations express intended audience and priority; they do not guarantee that every
  host injects the resource into model context or permits a model to read it without user action.
- Host behaviour is therefore part of the product evidence, not incidental integration detail.

#### Localisation is multidimensional

- Localisation can change engagement without changing educational intent: a place name, journey,
  photo, landmark, map, comparison, or discussion prompt can make an example more immediate.
- It can also cross into factual adaptation, resource transformation, accessibility, cultural
  relevance, or pedagogical redesign. These have different evidence and risk profiles.
- Sophistication is not a single ladder. A simple text substitution may require high confidence in
  local facts, while a technically complex image replacement might leave educational content
  untouched.
- The source of local truth matters: teacher-provided knowledge, a host's web search, a licensed
  dataset, and model recollection are not equivalent.
- Watford is a useful demonstration context because it forces the flow to separate Oak's educational
  anchors from local additions. It must remain input data, not product logic.

#### Workflow content is product content

- Agent-facing workflow instructions influence behaviour and therefore need a canonical source,
  reviewability, provenance, versioning, and consistent safeguards.
- Copying the same workflow independently into prompts, resources, tool descriptions, and host
  instructions creates semantic drift even when every copy starts identical.
- Always loading every workflow avoids retrieval failure but spends context and model attention on
  irrelevant capabilities. On-demand retrieval saves context but adds a selection and delivery
  failure point.
- Tool descriptions can advertise intent compactly, but carrying a whole refining workflow in a
  description makes the tool catalogue an expensive and poorly governed instruction channel.

#### The milestone boundary changes what "support" should mean

- Public alpha primarily connects teacher intent to Oak content and understanding inside existing AI
  applications. Its strongest claim is facilitated discovery and use, not autonomous generation.
- Simple engagement-focused localisation can be explored at the alpha edge without implying that
  Oak can transform all artefacts or make pedagogical adaptations.
- Preserving a path to deeper adaptation matters. Prematurely promising beta-shaped behaviour in
  alpha would obscure which value comes from Oak's corpus and which comes from generation or a
  particular host.

### Movement 2: map the problem spaces

| Space | Gap or mechanism | Constraint carried into every candidate | Evidence of success | Characteristic failure |
| --- | --- | --- | --- | ---
| Teacher authority | An agent mediates between an open request and a structured curriculum corpus | The teacher owns goals, relevance, pedagogical judgement, changes, and final use | The agent makes source-grounded options easier to inspect and leaves consequential choices explicit | The flow prescribes, silently changes intent, or treats teacher confirmation as a rubber stamp |
| Intent recognition | Natural language does not invoke an MCP prompt automatically | Ordinary teacher phrasing must be enough to make the relevant capability discoverable | The agent acquires appropriate guidance without a special command | The teacher must know Oak's prompt name or MCP vocabulary |
| Curriculum entity resolution | Topic language can match several lessons, years, subjects, units, or programme variants | Ambiguity must be surfaced rather than hidden | Candidate anchors are accurate, distinguishable, and teacher-selectable | The agent commits to the first plausible result or fabricates a match |
| Curriculum-wide scope | Demonstrations start with named examples, while the service spans typed curriculum entities | No fixture-specific logic; partial and empty results remain valid | The same contract behaves coherently across subjects, stages, entity types, and data availability | A polished demo masks hard-coded assumptions |
| Progressive interaction | Useful support often needs context not present in the first message | Ask only questions that materially improve the next action | Each turn gives useful evidence or narrows a real ambiguity | A static questionnaire front-loads effort or gives the illusion of control |
| Content fidelity | Agents may summarise, select, or combine Oak content | Source facts, derived suggestions, and external additions remain distinguishable | Misconceptions, teacher tips, safeguards, and learning intent survive retrieval and presentation | Fluent output drops or alters load-bearing curriculum meaning |
| Material availability | Lessons expose different optional components and asset types | Never imply that missing content exists or that links equal editable files | The flow adapts to the components actually returned | The workflow assumes slides, transcripts, or quizzes everywhere |
| Local context | Oak educational anchors and local engagement context may come from different sources | Local claims need provenance; educational changes require teacher direction | The agent identifies candidate substitution points and explains the origin of proposed local material | It invents local facts, changes the learning outcome, or blurs Oak and external content |
| Host capability | Resources, tool selection, browsing, downloads, and file editing vary by AI application | The portable core cannot depend silently on optional host behaviour | Target hosts can execute the bounded interaction, with explicit degradation when they cannot | The demo works only because one host supplied an undeclared capability |
| MCP delivery | Prompts, resources, and tools have different control and discovery models | A user-controlled surface cannot be the only agent-facing path | Guidance is model-accessible from natural-language intent with acceptable context cost | Instructions exist in the server but not in the model's usable context |
| Workflow governance | Several protocol surfaces may expose the same semantic contract | One reviewed source must govern all projections | Every projection has equivalent authority, scope, and safeguard semantics | Prompt and tool behaviour diverge over time |
| Failure and recovery | No match, authentication, host limits, missing components, and ambiguity are normal states | Failures must be typed, informative, and recoverable where possible | The teacher sees what is known, what is missing, and what they can choose next | The agent compensates with ungrounded content or an opaque dead end |
| Demonstration and evaluation | A good transcript is persuasive but weak evidence of a reusable capability | Examples illustrate; a scenario matrix tests generality and invariants | Behaviour is reproducible across hosts, curriculum areas, and boundary cases | One successful output is presented as proof of product coverage |
| Milestone boundary | Alpha and beta value can blur when adaptation is visible | Alpha claims remain centred on Oak content and facilitation; later options remain open | The demo makes current value and future horizon separately legible | The experience depends on uncommitted generation or transformation capabilities |

These spaces expose several tensions that no single protocol primitive resolves:

- **Authority versus useful initiative:** excessive passivity makes the teacher operate the search
  engine; excessive initiative turns facilitation into prescription.
- **Generality versus relevance:** a universal monologue is generic in wording but poor in use; a
  generic contract should activate only the branches relevant to the current entity and intent.
- **Progressive refinement versus form-filling:** the agent needs context, but every question should
  earn its place by changing the next retrieval or presentation.
- **Portability versus context cost:** always-present instructions travel simply but consume scarce
  attention; on-demand instructions are efficient only if hosts deliver them reliably.
- **Single source versus multiple surfaces:** portability may require several MCP projections, while
  governance requires that their meaning cannot drift.
- **Alpha focus versus beta optionality:** a narrow, honest alpha should not close the architecture to
  deeper adaptation, but future flexibility is not a reason to imply present capability.
- **Demo legibility versus generalisation proof:** named fixtures help colleagues see the behaviour;
  only systematic variation shows that the mechanism is not fixture-bound.
- **Oak truth versus local truth:** combining them can be valuable, but provenance must survive the
  combination.

### Movement 3: explore possible shapes and inherited assumptions

#### Agent-facing delivery shapes

| Shape | Attractive property | Pressure or failure mode |
| --- | --- | --- |
| One always-loaded workflow manual | No acquisition step; all intents are visible | Context and attention cost grow with capability breadth; unrelated instructions can interfere |
| User-controlled prompts only | Existing MCP primitive and explicit teacher choice | Breaks natural-language activation and assumes the teacher knows the workflow catalogue |
| Assistant-audience resources only | Canonical, inspectable, and naturally suited to authored guidance | Application-driven exposure is not enough when a host does not surface or inject the resource |
| Pointer-only discovery tool | Very small tool response and a canonical resource address | Adds a second host-dependent resource-read hop; a visible pointer may still be unusable guidance |
| Direct-return workflow tool | Gives the model bounded instructions in the same model-controlled call | Adds a tool and requires careful intent descriptions; responses must not become an ungoverned copy |
| Compact catalogue plus bounded workflow retrieval | Balances initial discoverability, context cost, and workflow specificity | Needs evidence that models select the route consistently and that granularity is right |
| Workflow text embedded in domain-tool descriptions | Avoids an extra retrieval call | Bloats every tool, mixes operational schemas with behavioural guidance, and multiplies drift |
| Host-specific instruction packages | Can exploit each application's strongest integration surface | Weak portability and a high risk that the Oak experience differs semantically by host |

The layered, single-source shape remains the strongest hypothesis: a small orientation catalogue,
bounded workflow bodies projected as assistant-audience resources and model-controlled direct-return
retrieval, and optional user prompts generated from the same source. Its advantage is not the number
of MCP primitives. It is that no one host-dependent primitive has to carry the entire experience.

That hypothesis has limits. If target hosts reliably make annotated resources model-visible, the
tool projection may be redundant. If models fail to select a workflow retrieval tool from ordinary
language, the tool alone is not a discovery solution. If the bodies are too granular, acquisition
becomes conversational overhead; if too broad, the context saving disappears.

#### Interaction shapes

| Choice | One pole | Other pole | More promising synthesis |
| --- | --- | --- | --- |
| Refinement | Fixed questionnaire before any action | Immediate answer from assumed intent | Retrieve enough to make ambiguity concrete, then ask the smallest consequential question |
| Material use | Fetch the entire lesson bundle | Fetch only a single requested fact | Start with summary and anchors, then retrieve optional components when the teacher's goal makes them useful |
| Guidance | Agent selects a recommended pedagogical path | Agent repeats raw search results | Present a small set of grounded options and trade-offs; let the teacher direct the choice |
| Adaptation | Rewrite eagerly | Refuse any alteration | Separate source anchors from proposed changes and facilitate only the degree the teacher requests |
| Localisation | Substitute arbitrary local names | Require a complete formal local-data integration | Begin with teacher- or host-supplied, source-labelled context and bounded engagement substitutions |

#### General capability shapes

A fixture-specific template is easy to demonstrate and impossible to defend as the requested
capability. A more general shape is an entity-resolution and facilitation kernel with intent facets:

1. recognise whether the starting expression names a lesson, topic, unit, or unresolved curriculum
   idea;
2. search and resolve candidate Oak anchors without hiding ambiguity;
3. expose the source's educational intent, relevant components, provenance, and safeguards;
4. refine according to the teacher's expressed purpose rather than a hard-coded subject sequence;
5. retrieve only the material needed for that purpose;
6. distinguish source content from summaries, external context, and possible changes; and
7. return every consequential decision to the teacher.

The photosynthesis and Watford demonstrations then exercise different facets of the same kernel.
They do not define two product-specific workflows that happen to share tools.

#### Localisation capability shapes

Localisation is clearer when decomposed by purpose, object, evidence, and risk:

| Dimension | Lower-complexity example | More sophisticated example | Persistent authority boundary |
| --- | --- | --- | --- |
| Purpose | Improve recognition or engagement | Reframe a sequence around local enquiry | Teacher decides whether the change serves their pupils and intent |
| Object changed | Place name or discussion prompt | Slides, worksheet, map, imagery, or assessment | Teacher chooses the artefact and approves the result |
| Source of context | Teacher supplies a Watford landmark | Licensed local dataset or verified external research | Provenance and uncertainty remain visible |
| Educational effect | Preserve learning outcome and disciplinary anchor | Modify examples, task structure, or content emphasis | Pedagogical change is explicit, not inferred |
| Technical operation | Suggest substitution points in text | Transform downloadable assets and maintain layout/accessibility | Technical success is not treated as pedagogical approval |

This suggests an alpha edge that is useful without pretending to be the beta destination: identify
context-bearing elements, retain the educational anchors, help the teacher consider source-labelled
Watford substitutions, and make clear which artefact operations depend on the host or are not yet
available. Future integrated data sources and artefact transformation can deepen the capability
without changing the authority contract.

#### Assumptions changed by the exploration

- The problem is not two bespoke workflows. It is a generic facilitation protocol exercised by two
  deliberately different fixtures.
- "Works everywhere" does not mean every tool or lesson component is used everywhere. It means the
  contract produces an honest, useful outcome for every supported entity and a clear empty or
  refusal outside the available corpus or capability.
- Teacher authority does not mean agent passivity. It permits reversible operational initiative but
  never transfers pedagogical or final-use authority.
- Localisation is not a single sophistication scale and is not necessarily a change to educational
  content.
- An internal demonstration is evidence of legibility, not proof of generality.
- An assistant audience annotation is a useful signal, not a promise of model context across hosts.
- A tool that merely tells the agent to read a resource does not solve accessibility unless the
  second hop is proven in each target host.
- Deterministic server retrieval and model-led interaction are complementary: the server should not
  become an opaque planning agent, and the consuming agent should not invent curriculum facts that
  Oak can supply.

### Movement 4: synthesis and a falsifiable concept

#### Revised framing

The concept is a **generic, teacher-controlled facilitation protocol over typed Oak curriculum
anchors, delivered through layered MCP adapters**.

"Teacher-controlled" names the authority invariant. "Facilitation" allows useful operational
initiative without assigning pedagogical agency to the system. "Typed curriculum anchors" makes
lesson, topic, unit, and related curriculum structures part of one general contract without
pretending they are identical. "Layered MCP adapters" separates the canonical workflow content from
the host-dependent routes by which a model acquires it.

The conceptual interaction is:

1. **Recognise intent:** infer that the teacher wants to work with Oak material, without requiring a
   command or protocol term.
2. **Resolve a starting anchor:** search the relevant curriculum structures and present real
   ambiguity.
3. **Refine progressively:** ask only for details that change the next retrieval or presentation.
4. **Retrieve selectively:** use the components actually available and useful for the expressed
   purpose.
5. **Preserve meaning and provenance:** carry educational anchors, safeguards, and source identity
   into the response.
6. **Offer reversible options:** surface materials, interpretations, or possible substitutions
   without silently applying pedagogical changes.
7. **Return decisions to the teacher:** make relevance, adaptation, emphasis, and final use explicit
   teacher choices.

#### Public-alpha capability envelope

Within this framing, a defensible public-alpha envelope includes:

- natural-language recognition of preparation, exploration, and bounded localisation intents;
- generic resolution from lesson, topic, or unit language to Oak curriculum anchors;
- progressive, teacher-directed refinement rather than mandatory scripted intake;
- selective presentation of available Oak content, pedagogical context, safeguards, and materials;
- source links and downloadable-asset links where the current tools provide them;
- clear distinction between Oak source material, agent summaries, and external or teacher-provided
  context; and
- simple engagement-oriented localisation where the source of local context and the unchanged
  educational anchors remain explicit.

It does not by itself claim:

- arbitrary discovery of current local information by the Oak server;
- editing of slide decks, worksheets, maps, images, or other downloaded assets;
- autonomous lesson planning, pedagogical judgement, or approval;
- generation as a substitute for missing Oak material; or
- identical resource and tool behaviour in every host without integration evidence.

The public-beta horizon can include deeper adaptation, artefact transformation, integrated local
data, and more generation while preserving the same authority, fidelity, and provenance invariants.

#### What the demonstrations can and cannot show

| Fixture | Can show | Cannot establish alone |
| --- | --- | --- |
| Year 9 photosynthesis preparation | Natural-language workflow acquisition; topic/entity resolution; selective use of source misconception, teacher tip, quiz, transcript, and available assets; progressive teacher refinement | Curriculum-wide generality, cross-host portability, missing-data behaviour, or support for every preparation purpose |
| Local Area localised to Watford, England | Separation of educational anchors from local context; engagement-level substitutions; provenance; explicit teacher approval; honest host/asset boundary | Arbitrary local-data accuracy, systematic artefact editing, sophisticated adaptation, or generality across all subjects and localities |

A stronger evidence surface varies the conditions rather than polishing the two transcripts:

- lesson-, topic-, and unit-led starting messages;
- several subjects, key stages, and curriculum structures;
- one match, several plausible matches, and no match;
- complete, partial, and absent optional lesson components;
- programme, tier, and exam-board ambiguity where applicable;
- content guidance and supervision-level handling;
- requests that remain inside alpha and requests that cross the declared boundary; and
- each major target host's resource visibility, tool selection, link handling, and context behaviour.

This is an evaluation space, not a proposed rollout checklist. Its purpose is to prevent the two
fixtures being mistaken for the extent of the capability.

#### Hard failures and quality signals

Teacher-authority violations and demo-specific product branches are hard failures even if the final
answer looks useful. Other discriminating signals include:

| Signal | Strong behaviour | Weak behaviour |
| --- | --- | --- |
| Workflow acquisition | Guidance is acquired from ordinary teacher language without a prompt command | The model proceeds unguided or requires protocol knowledge |
| Anchor resolution | Real curriculum choices and uncertainty are visible | First-match selection is hidden |
| Fidelity | Load-bearing Oak facts, safeguards, and provenance survive | Fluent paraphrase changes or omits them |
| Question quality | Each question unlocks a materially better next action | Questions reproduce a generic planning form |
| Scope control | The agent facilitates the expressed request and labels boundaries | It generates or adapts beyond the teacher's request |
| Missing data | Absence is explicit and alternatives are bounded | Content or capabilities are implied or invented |
| Local provenance | Watford additions have a visible source and status | Local claims blend into Oak material |
| Portability | Equivalent authority and fidelity semantics survive host differences | The concept depends on undeclared host behaviour |
| Context efficiency | Only relevant workflow detail is loaded and attended to | The catalogue dominates context or retrieval repeatedly fails |

#### Stress cases

The framing should remain coherent when:

- a topic phrase has plausible matches in different subjects or years;
- a teacher begins from a unit rather than a lesson;
- Oak has no matching content;
- a lesson has no transcript, quiz, slide deck, or worksheet;
- a programme distinction such as tier or exam board changes the candidate set;
- content guidance or a supervision level must be surfaced;
- a teacher asks "what should I do?" and the agent must facilitate options without claiming their
  professional judgement;
- the requested change would alter educational intent rather than merely localise engagement;
- the local context includes pupil-, school-, or safeguarding-sensitive information;
- an external map, photograph, or dataset has licensing, attribution, currency, or accessibility
  constraints;
- a host cannot read a resource returned by the server;
- a host cannot browse, download, or edit the artefact implied by the request; or
- a short-lived asset link expires before the teacher uses it.

These cases widen "quality" beyond answer relevance. Privacy, safeguarding, accessibility,
licensing, attribution, link lifetime, and explicit capability boundaries all affect whether the
facilitation is usable and trustworthy.

#### Warrants, falsifiers, and unresolved empirical questions

| Current hypothesis | Warrant | Falsifier or material weakening evidence |
| --- | --- | --- |
| A generic facilitation kernel with typed branches is preferable to fixture workflows | Authority and fidelity are common, while entity resolution and available content vary | The common contract proves too abstract to constrain model behaviour across curriculum entities |
| Progressive dialogue is preferable to a fixed intake | Teacher requests contain different amounts of context and ambiguity | Teachers consistently prefer a known up-front form, or progressive questioning creates more turns without better outcomes |
| Layered delivery is preferable to any single MCP surface | Host support and control models differ | All target hosts expose one surface reliably and other projections only add selection confusion |
| Bounded direct-return retrieval is safer than a pointer-only tool | It removes an unproven resource-read hop | Target hosts consistently follow resource pointers and direct-return content causes worse context or governance outcomes |
| Simple localisation has alpha value | Engagement can improve while educational anchors remain fixed | Teachers find it trivial, misleading, or unusable without deeper artefact transformation |
| External/teacher context should remain explicitly separate from Oak source content | Provenance enables professional judgement and honest correction | User research shows the distinction cannot be communicated without making the workflow unusably complex |
| Reversible operational initiative is compatible with teacher authority | Searching and presenting evidence does not decide pedagogy | Teachers experience proactive retrieval as loss of control or the agent repeatedly narrows intent incorrectly |

The remaining questions are empirical rather than invitations to decide architecture by preference:

- Which target applications make assistant-audience resources visible to the model, and under what
  conditions?
- When prompts are unavailable, which compact descriptions reliably cause models to acquire the
  relevant workflow?
- What workflow granularity minimises both context cost and failed acquisition?
- How much authored guidance is needed to preserve authority and fidelity across different model
  families?
- Which questions do teachers experience as genuinely helpful at each ambiguity point?
- What sources can support Watford context with appropriate licensing, attribution, currency, and
  privacy?
- How should a consuming agent communicate that a requested artefact operation belongs to the host,
  not the Oak server?
- Which scenario matrix is sufficient to make a credible curriculum-wide and cross-host claim?

The important outcome of this wider exploration is a changed centre of gravity. MCP delivery remains
a crucial mechanism, but the capability is defined by the facilitation contract and its invariants.
The two demonstration fixtures should reveal that contract under different pressures; they should
not become the contract themselves.

## Concept Exploration exit assessment

The preceding passes explored the concept broadly. This pass asks a different pre-decision
question: **is further conceptual exploration likely to change the model, or do the remaining
uncertainties now require evidence from teachers, hosts, and live behaviour?** It uses the same four
movements to avoid both premature planning and endless inquiry.

### Movement 1: reflect on what the exploration now contains and omits

#### The evidence has unequal strength

The repository and protocol observations are strong enough to support claims about the current MCP
surfaces, deterministic Oak capabilities, optional lesson components, and the teacher-as-expert
product boundary. The exploration does not yet contain direct evidence about:

- how teachers describe these tasks without product vocabulary;
- which refining questions teachers find useful or burdensome;
- whether simple engagement localisation is valuable before artefact transformation;
- how target AI applications expose assistant-audience resources in practice; or
- whether models reliably acquire bounded workflow guidance from ordinary teacher language.

Those are not missing paragraphs. They are empirical gaps that more solitary conceptual writing
cannot close.

#### The capability labels still carry unwanted product assumptions

The source stories use “Plan a lesson” and “Topic adaptation”. The exploration already identifies
first phrase as linguistically dangerous, but has not yet stabilised replacement vocabulary.

- **Plan a lesson** commonly invites generation of a new lesson or a prescribed teaching sequence.
  The public-alpha story is more accurately **prepare to teach using existing Oak material**.
- **Topic adaptation** can imply changed educational content. The Watford story is more accurately
  **localise engagement context** while the educational anchors remain fixed.
- **Pedagogical adaptation** should name an explicit, teacher-directed change to teaching choices,
  support, sequencing, assessment, or intended learning.
- **Generation** should remain a separate capability term, not a silent consequence of “planning”
  or “adaptation”.

These are not cosmetic labels. A model uses the words as behavioural cues, so the vocabulary helps
enforce the alpha boundary.

#### One generic kernel over-unifies the concept

The previous synthesis proposed a generic facilitation kernel with intent facets. That is better
than fixture-specific workflows, but it still compresses two distinct requirements:

1. the same authority, provenance, fidelity, and capability-honesty rules should govern every
   teacher interaction; and
2. preparing to teach and localising engagement are different intents that may warrant different
   refining dialogues and stopping conditions.

Curriculum generality does not require one universal teacher workflow. A stronger composition is:

- one shared **facilitation constitution** containing the invariants;
- bounded, **intent-specific workflows** that are curriculum-agnostic; and
- generic deterministic curriculum operations used by those workflows.

This preserves common product semantics without forcing preparation and localisation through an
artificially uniform conversation.

#### The demonstration has two audiences and therefore two planes

The teacher-facing demonstration should feel like an ordinary conversation. Requiring the teacher
to watch MCP resource acquisition, tool selection, or provenance bookkeeping would damage the UX it
is meant to prove.

The internal audience needs the opposite evidence: enough trace to see that the agent acquired the
Oak-authored workflow, called the appropriate deterministic tools, preserved source/derived
boundaries, respected unavailable capabilities, and returned decisions to the teacher.

The demonstration is therefore one event with two projections:

1. **Experience plane:** the natural teacher-agent conversation and useful content/materials.
2. **Evidence plane:** an internal trace or walkthrough connecting behaviour to workflow guidance,
   Oak calls, source facts, boundary decisions, and teacher decision points.

A polished transcript without the evidence plane does not show how Oak influenced the behaviour. A
protocol trace without the experience plane does not show teacher value.

#### Authority needs allocation, not only repetition

“The teacher is the authority” is the invariant. A usable concept also needs to distinguish the
responsibilities of the other participants:

- the agent may take reversible operational initiative inside the expressed goal;
- the Oak server supplies deterministic curriculum facts, materials, provenance, and bounded
  capabilities;
- the consuming host supplies permissions and optional capabilities such as browsing or file
  editing; and
- pupils are affected stakeholders, not users of this surface. The workflow should not require
  pupil-identifiable information to become helpful.

Without that allocation, both over-passive and over-prescriptive implementations can claim to honour
teacher authority.

#### The top-level milestone does not yet name these specific workflows

The [Public Alpha Experience Contract](../plans/user-experience/public-alpha-experience-contract.md)
already places educator end users in scope and promises that teachers can ask for curriculum help
in supported AI clients without wrestling with tooling internals. The narrower unresolved question
sits in the top-level Open Public Alpha milestone record: it focuses on search reliability, MCP
Apps, observability, knowledge-graph alignment, staff/invited users, developers, and AI tool
builders, but does not yet name lesson preparation or engagement-localisation as ratified workflow
scope. Planning should therefore show how these workflows fulfil the existing educator promise and
either align them with the current milestone or record an explicit product-governance addition; it
should not imply that the educator direction is absent from the repository.

#### Review hygiene is not concept evidence

Passing repository checks and resolving review findings can establish that a research artefact is
reviewable and mechanically sound. They do not validate teacher value, host behaviour, or the
proposed workflow-delivery model.

### Movement 2: define the exploration-exit problem

#### Kind of problem

This is an **inquiry-boundary evaluation in a hybrid human and technical product system**. It is not
yet an architecture decision or a delivery plan.

#### Gap

The concept is broad enough to expose its main mechanisms and tensions, but conceptual questions,
empirical questions, product decisions, and implementation choices have been allowed to sit in one
list. Without classifying them, the work can fail in either direction:

- stop too early and carry category errors into planning; or
- keep “exploring” questions that can only be answered through observation and thereby avoid contact
  with reality.

#### Who the gap harms

- Teachers bear the cost if untested assumptions become a rigid or burdensome workflow.
- Oak bears the cost if a technically persuasive demo cannot show that Oak guidance caused the
  behaviour.
- Implementers bear the cost if a plan begins before workflow boundaries and product vocabulary are
  stable.
- Reviewers bear the cost if public-alpha claims and current milestone records describe different
  products.

#### Causal mechanism

The concept spans several reliability rungs. Repository and protocol facts are observations;
teacher interaction and host-portability claims are models. The fluent failure is to treat all of
them as equally established because they appear in one coherent document.

#### Constraints

- Teacher authority and curriculum generality remain invariants.
- This session is exploration, not planning or implementation.
- The internal examples must remain fixtures rather than scope.
- Empirical uncertainty must not be resolved by model confidence or additional prose.
- The public-alpha concept must remain useful without borrowing uncommitted beta capabilities.

#### Success

Exploration is sufficient when:

1. the central product concept and its boundaries can be stated without demo-specific language;
2. distinct intents are composed without being collapsed into one universal conversation;
3. decision authority and operational initiative are allocated clearly;
4. the teacher experience and the internal proof are both defined;
5. remaining uncertainties are classified by the kind of evidence or decision that can resolve
   them; and
6. there is a falsifiable reason to reopen the concept rather than an assumption that exploration
   should continue indefinitely.

### Movement 3: reflect on the responsible stopping shapes

Three shapes are available:

| Shape | Attractive property | Failure mode |
| --- | --- | --- |
| Stop with the existing synthesis | Avoids further abstraction and moves quickly | Preserves ambiguous capability language, over-unification, and the one-plane demo model |
| Keep exploring until the host and teacher questions are answered | Avoids declaring conceptual closure under uncertainty | Misclassifies empirical discovery as conceptual work and creates no stopping condition |
| Run one bounded conceptual close, then move unknowns to evidence | Resolves the remaining category errors while preserving contact with reality | Requires discipline not to turn the evidence agenda into an implementation plan |

The third shape is proportionate. The remaining conceptual changes are small in number but
load-bearing; the remaining large uncertainties cannot be reasoned away.

#### Revised composition model

The concept should no longer be described as one generic workflow kernel. It has four layers:

| Layer | Responsibility | What must remain generic |
| --- | --- | --- |
| Facilitation constitution | Teacher authority, provenance, fidelity, honest capability boundaries, source/derived distinction | Applies to every interaction and every intent |
| Intent-specific workflow | Progressive dialogue and stopping conditions for preparation, engagement localisation, or later capabilities | Works across any relevant Oak lesson, topic, or unit; contains no fixture branches |
| Curriculum capability substrate | Deterministic search, resolution, fetch, graph, content, material, and link operations | Operates over typed curriculum entities and returns honest partial/empty results |
| MCP delivery adapters | Resource, model-controlled retrieval, metadata, and optional prompt projections | Render one canonical workflow source without semantic drift |

This model allows more than one teacher workflow without duplicating the product boundary or
hard-coding subject content.

#### Decision-rights model

| Participant | May do | Must not do or assume |
| --- | --- | --- |
| Teacher | Set and change the goal; decide relevance; provide as much context as they choose; select materials and options; direct changes; approve final use | Be treated as an approval step after the agent has already made the pedagogical decision |
| Consuming agent | Search, retrieve, summarise, compare, ask consequential questions, expose uncertainty, and present grounded options within the expressed goal | Prescribe pedagogy, silently change educational intent, fabricate unavailable content, or imply host/Oak capabilities that are absent |
| Oak MCP server | Return deterministic curriculum facts, structure, resources, provenance, safeguards, and canonical workflow guidance | Make request-time pedagogical decisions or claim external/local facts it does not supply |
| Host application | Mediate permissions and provide optional capabilities such as resource access, web research, downloads, or editing | Be treated as a portable Oak capability unless observed and declared |

Pupils are affected by the teacher's decisions but are not direct users of this surface. Helpful
refinement should use class-level context where possible and should not depend on names, individual
profiles, or other pupil-identifiable information.

#### Dual-plane demonstration contract

| Claim | Teacher-facing evidence | Internal evidence |
| --- | --- | --- |
| Natural-language entry works | The teacher uses ordinary language and receives a relevant first response | The trace shows how the workflow was discovered without a user-invoked MCP prompt |
| Oak content and quality travel | The teacher sees accurate, selective lesson information and usable materials | The trace maps presented claims to Oak results and identifies omitted/unavailable components |
| Teacher authority holds | The conversation leaves relevance and pedagogical choices visibly open to the teacher | The walkthrough identifies each decision point and distinguishes operational initiative from teacher authority |
| Localisation stays bounded | Watford context is offered as source-labelled engagement material without silently changing the learning intent | The trace separates Oak anchors, teacher/external local context, host capabilities, and proposed substitutions |
| Capability limits are honest | Missing assets or unsupported editing are stated plainly | The evidence names which boundary belongs to Oak, the host, or a future milestone |

### Movement 4: synthesise the exit verdict

#### Revised concept

The concept is now:

> A shared teacher-authority and fidelity constitution, applied through bounded intent-specific
> workflows that orchestrate generic deterministic Oak curriculum capabilities, with the canonical
> workflow guidance delivered through complementary MCP adapters.

This supersedes the stronger “one generic facilitation kernel” wording. Preparation and engagement
localisation share a constitution and capability substrate; they do not have to share every
question, branch, or stopping condition.

#### Verdict

**One bounded piece of exploration remained, and this exit pass completes it.** Another broad
concept sweep is unlikely to improve the model without new evidence. The exploration should now be
treated as sufficient for pre-decision discovery, subject to review of this revised framing.

The remaining work before planning is evidence gathering rather than more solitary concept
expansion:

| Remaining uncertainty | Correct next mode | Evidence or authority needed |
| --- | --- | --- |
| Teacher vocabulary, useful questions, and value of simple localisation | Teacher discovery | Teacher walkthroughs or observed sessions using natural starting language |
| Resource visibility, workflow-tool selection, and link behaviour | Host capability probe | Live tests in each target AI application with prompts unavailable |
| Curriculum-wide generality and failure behaviour | Scenario evaluation | A small deliberately varied corpus matrix, including ambiguous, partial, and empty cases |
| Watford facts, maps, images, licensing, and attribution | Source research | Current authoritative or appropriately licensed local sources plus teacher judgement |
| The right workflow granularity and delivery adapter | Decision after probes | Measured context cost, acquisition reliability, and semantic-drift risk |
| Placement within the current Open Public Alpha milestone | Product governance | Owner-backed milestone truing or an explicit supersession/addition decision |
| Implementation sequence and acceptance gates | Planning | A subsequent planning session grounded in the evidence and product decision above |

These activities may change the concept. They should reopen exploration only if they falsify a
load-bearing claim—for example, teachers do not recognise the proposed intent boundaries, distinct
workflows create harmful fragmentation, proactive retrieval is experienced as loss of authority,
or the internal evidence plane cannot be produced without degrading the teacher experience.

Until such evidence appears, continued conceptual elaboration would add detail without increasing
contact with reality.
