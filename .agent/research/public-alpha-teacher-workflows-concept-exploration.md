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

### Prepare an existing Year 9 photosynthesis lesson

The anchor is an existing Oak lesson, not a topic from which the agent should build a new lesson.
The useful flow is likely to include finding the exact lesson, establishing what the teacher wants
to prepare, and presenting the lesson's outcome, key learning points, misconceptions, transcript,
quizzes, and available assets selectively. Which of those matter, and what the teacher does with
them, are matters for the dialogue rather than a fixed output template.

This differs materially from the current `lesson-planning` MCP prompt. That prompt searches for an
Oak analogue and then instructs the model to assemble a complete lesson with a new outcome,
sequence, assessments, resources, and adaptation notes. Its content is useful candidate material,
but its current goal is broader and more generative than preparing to teach an existing lesson.

### Localise the existing Local Area lesson

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
