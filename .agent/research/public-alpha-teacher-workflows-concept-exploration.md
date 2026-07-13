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

The consuming agent should recognise the intent, ask useful refining questions, find and present
the appropriate Oak lesson and materials, and facilitate the teacher's requests. The teacher does
the planning. The agent supports that work; it does not silently turn the request into an
agent-authored lesson or make the pedagogical choices.

This is the product expression of
[ADR-194](../../docs/architecture/architectural-decisions/194-teacher-as-expert-product-boundary.md):
Oak surfaces inform and offer options, while the teacher remains the pedagogical expert and the
authority on what should happen.

For milestone scope:

- **Public alpha:** finding, understanding, presenting, and using Oak content and materials in the
  teacher's existing workflow. Generation is secondary; lesson adaptation is tangential.
- **Public beta horizon:** adaptation and localisation become a stronger product priority. The
  sophisticated end of that capability must remain visible on the roadmap even if delivery begins
  with simpler forms.

## The two use cases are not the same operation

### Prepare an existing [Year 9 photosynthesis lesson](https://www.thenational.academy/teachers/programmes/science-secondary-ks3/units/plant-nutrition-and-photosynthesis/lessons/photosynthesis)

The anchor is an existing Oak lesson, not a topic from which the agent should build a new lesson.
The useful flow is likely to include finding the exact lesson, establishing what the teacher wants
to prepare, and presenting the lesson's outcome, key learning points, misconceptions, transcript,
quizzes, and available assets selectively. Which of those matter, and what the teacher does with
them, are matters for the dialogue rather than a fixed output template.

This differs materially from the current `lesson-planning` MCP prompt. That prompt searches for an
Oak analogue and then instructs the model to assemble a complete lesson with a new outcome,
sequence, assessments, resources, and adaptation notes. Its content is useful candidate material,
but its current goal is broader and more generative than preparing to teach an existing lesson.

### Localise the existing [Local Area lesson](https://www.thenational.academy/teachers/programmes/geography-primary-ks1/units/local-area-where-do-we-live/lessons/our-local-area)

Localisation has degrees. In this use case it is generally about engagement and contextual
relevance, not changing the educational content itself. The source lesson already invites the
teacher to replace its example aerial maps with maps of the school's local area. The agent can help
the teacher inspect the lesson, identify context-bearing elements, gather teacher-supplied local
context, and present possible substitutions. The teacher decides what is locally and
pedagogically meaningful.

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
than an implied alpha promise. At every degree, the teacher is the arbiter of pedagogical output.

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

This section is the result of re-running Resonance's four-movement Concept Exploration workflow
after the preceding observations were committed. It evaluates the concept and the two user stories;
it does not turn the outcome into an implementation sequence.

### Movement 1: reflect on the raw observations

Several observations are load-bearing:

1. The teacher's natural-language request is the real entry point. Requiring prior knowledge of an
   Oak slash command would move discovery work back onto the teacher and break the intended UX.
2. The two user stories both start from an existing, identified Oak lesson. The initial value is
   fidelity, access, and selective use of what Oak already provides, not generation from a topic.
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
8. Teacher authority is not a disclaimer appended to an output. It changes the interaction: the
   agent asks what matters, offers relevant content and options, and leaves choices open rather than
   completing the teacher's thinking on their behalf.
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

Oak has the lesson content, tools, orientation substrate, and early workflow drafts. It does not yet
expose the detailed workflows on a sufficiently portable, model-accessible path that a consuming
agent can discover from natural-language teacher intent.

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

- The teacher remains the pedagogical expert and decision-maker.
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
3. finds the exact lesson and preserves its educational anchors and provenance;
4. asks a small number of relevant refining questions as the need emerges;
5. presents content, materials, and options that advance the teacher's work; and
6. leaves pedagogical decisions with the teacher.

For an internal demonstration, success is not merely a polished final answer. The demonstration
must make the behavioural chain inspectable: natural-language request, workflow acquisition,
curriculum calls, selective presentation, and a visible teacher decision point.

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

#### Evaluation of the two stories

| Story | Public-alpha value | Agent contribution | Teacher decision | Beta horizon |
| --- | --- | --- | --- | --- |
| Prepare Year 9 photosynthesis | Find and selectively expose the exact lesson, misconception, teacher tip, quizzes, transcript, and available materials | Ask what preparation help matters; present the relevant Oak content without rebuilding the lesson by default | What to emphasise, change, omit, or teach | Deeper adaptation, generated artefacts, or resource transformation |
| Localise Local Area | Identify the lesson's educational anchors and context-bearing elements; support simple local substitutions that improve engagement | Ask for the locality and relevant teacher context; present substitution points and options while preserving intent | What is locally meaningful and pedagogically appropriate | Systematic asset editing, external local-data integration, and pedagogical adaptation |

Both stories are credible public-alpha demonstrations if "support" is kept literal. The
photosynthesis story tests whether the agent can facilitate preparation without turning it into
lesson generation. The Local Area story tests whether it can distinguish engagement-focused
localisation from educational-content change. The second story should not imply that the Oak MCP
server itself can discover arbitrary local maps or edit downloaded slide decks unless those
capabilities are actually supplied by the consuming host or a future integration.

#### Warrants and falsifiers

| Proposition | Warrant | What would falsify or weaken it |
| --- | --- | --- |
| Detailed workflows should be bounded rather than always loaded | Context and attention costs grow with every supported intent | Host/model evaluations show the full catalogue is small, consistently attended to, and cheaper than retrieval failures |
| Resources and a model-controlled path should share one source | Resources are canonical and inspectable; tools are more portable across current agents | Every target host reliably injects or exposes assistant-audience resources to the model without user action |
| The model-controlled path should return usable guidance | A pointer-only result relies on a second host-dependent resource hop | Target-host probes show resource links returned by tools are always followed correctly |
| Alpha workflows should facilitate rather than generate by default | Public-alpha intent and ADR-194 both centre teacher effort and authority | Teacher research shows that a more active default is desired and can still leave decisions genuinely open |
| Simple localisation can begin before sophisticated adaptation | Engagement substitutions can preserve the lesson's educational anchors | Teachers find simple substitutions offer no material value without artefact editing or deeper pedagogical change |

#### Discriminating probes, not an implementation plan

The concept can be reduced further by evidence before a delivery plan exists:

- In each target AI host, can the model see `curriculum://model` automatically, list/read a bounded
  workflow resource, and use a resource link returned from a tool?
- With MCP prompts deliberately unavailable, does a compact workflow-tool description cause the
  model to acquire guidance for both natural-language stories?
- Does the photosynthesis interaction preserve the source lesson's specific misconception and
  "word summary" teacher tip while avoiding an unsolicited rebuilt lesson?
- Does the Local Area interaction ask for local context, preserve the learning outcome, and stop at
  engagement-level substitutions unless the teacher requests more?
- Do teachers experience the refining questions as helpful facilitation rather than an intake form
  or disguised prescription?

These probes decide between resource-only, pointer-tool, direct-return tool, and orientation-heavy
shapes. They also produce a more honest internal demonstration: not that one model once produced a
good answer, but that Oak's workflow understanding became discoverable and constrained the agent's
behaviour in the intended way.
