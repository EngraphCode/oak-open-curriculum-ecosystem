# Oak MCP agent-facing content registry

> Visibility artefact only. No validator/guard is derived from this (shapes are not yet ratified). Curriculum DATA bytes from the Oak API/bulk export are exempt; repo-authored framing/templates/guidance are in scope.

**716 content items** across 143 files. Generated from a two-pass exhaustive audit. This is a **visibility artefact** — a discoverable, auditable index of every piece of repo-controlled content that reaches an MCP consumer. It asserts *what exists and who should review it*, not whether it is good.

See [`report.md`](./report.md) for the analysis, the i18n/content-workspace reframe, findings, and gaps. Machine-readable source: [`registry.json`](./registry.json). To read the surfaces **assembled as an agent receives them** (exact or with `{{placeholders}}`), see [`rendered-wholes.md`](./rendered-wholes.md).

## How to read this

Each item has a **review domain** (which expert should audit it) and an **extraction kind** (whether it is leaf-authored content that could move to a content catalog, or generated/external content that cannot). Item ids (`C001`…) are stable references into `registry.json`.

## Summary

### By impact tier (gates protocol weight)
| Impact tier | Items |
| --- | --- |
| high-impact | 612 |
| simple-config | 104 |

_high-impact items require review + eval protocols (owner design 2026-07-09); simple-config (branding/UI/structural metadata) does not. impact_tier is orthogonal to source_locus: a high-impact item authored upstream still needs protocols, run cross-repo against the assembled output._

### By review domain (who should audit)
| Review domain | Items |
| --- | --- |
| tool-usability | 269 |
| recovery-copy | 151 |
| engineering-structural | 95 |
| pedagogy | 81 |
| other | 39 |
| curriculum-accuracy | 27 |
| legal-licensing | 19 |
| pedagogy-external | 19 |
| ux-accessibility | 16 |

### By extraction kind (i18n-style movability)
| Extraction kind | Items |
| --- | --- |
| leaf-authored | 418 |
| generated-from-openapi | 130 |
| authored-template | 98 |
| generated-from-repo-code | 26 |
| authored-framing-of-external | 24 |
| external-copy | 20 |

- **leaf-authored** — pure authored strings; catalog-extractable (the i18n-movable core).
- **generated-from-openapi** — base tool text transformed from the upstream OpenAPI spec; would *invert* (generator reads catalog), not move.
- **generated-from-repo-code** — emitted by a repo generator (server instructions, per-response hint); stays generated.
- **authored-template** — authored sentence frame + interpolated data; the template extracts, the data stays.
- **authored-framing-of-external** — Oak-authored framing wrapped around external EEF corpus.
- **external-copy** — verbatim external data (EEF corpus); cannot be rewritten, only cited.

### By source locus (where to point reviewers)
| Source locus | Items |
| --- | --- |
| this-repo | 563 |
| upstream-in-house-api | 130 |
| external-third-party | 20 |
| upstream-in-house-skills | 2 |
| upstream-in-house-ontology | 1 |

**Where reviewers go for non-`this-repo` content:**

- **upstream-in-house-api** — Oak Open Curriculum API OpenAPI spec — IN-HOUSE (oaknational/oak-api). Authoritative source: https://open-api.thenational.academy/api/v0/swagger.json. Local committed snapshot reviewers can read: packages/sdks/oak-sdk-codegen/schema-cache/api-schema-original.json. Base tool/param prose is authored upstream; to change it, change the spec.
- **upstream-in-house-bulk** — Oak bulk download data — IN-HOUSE (Oak bulk export). Local snapshot: apps/oak-search-cli/bulk-downloads. Vocabulary/graph content derives from this pipeline at codegen time.
- **upstream-in-house-ontology** — Oak Curriculum Ontology — IN-HOUSE (oaknational/oak-curriculum-ontology). The formal semantic curriculum representation; knowledge-graph content and the OAK_KG attribution derive from it. Review the graph/ontology source there.
- **upstream-in-house-skills** — Oak Skills — IN-HOUSE (oaknational/oak-skills). This prompt workflow is DERIVED/ADAPTED from a named skill (oak-curriculum-mapper / oak-lesson-builder); the authoritative pedagogy workflow lives there. Review the source skill, and keep the two in step.
- **external-third-party** — EEF Teaching & Learning Toolkit — EXTERNAL third party. Cite, do not rewrite; verify citation accuracy and any Oak editorial framing wrapped around it.

### Risk flags (heuristic — for a review look, not confirmed defects)
| Flag | Items |
| --- | --- |
| user-input-interpolation | 166 |
| upstream-owned-base-text | 89 |
| boundary-owner-call | 24 |
| possible-defect-reported | 8 |
| pii-adjacent | 7 |

- `user-input-interpolation` is a deliberately **broad superset** flag for a safety pass; the *confirmed* unguarded interpolation is teacher free-text `classNotes`.
- `upstream-owned-base-text` marks tool text whose base prose is authored in the oak-api OpenAPI spec, not this repo.
- `possible-defect-reported` marks items the audit flagged for a defect check (e.g. the "Use the this type" typo, stale "lessons" wording).

---

## Index by review domain

### pedagogy — 81 items

Teaching/learning framing — prompts, orientation, curriculum-model doctrine, EEF interpretation. **Primary education-expert review target.**

<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/landing-page/create-snippet.ts</code> — 1</summary>

- **C354** _[orientation-content · leaf-authored]_ **⚑high-impact** **MCP client config JSON snippet template** — "mcpServers": { "oak-curriculum": { "type": "http", "url": "${mcpServerUrl}" } } `user-input-interpolation`

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/landing-page/render-landing-page.ts</code> — 5</summary>

- **C343** _[orientation-content · leaf-authored]_ **⚑high-impact** **h1 page heading (alpha status)** — <h1 id="title">Oak Curriculum MCP - Invite Only Public Alpha</h1>
- **C344** _[orientation-content · leaf-authored]_ **⚑high-impact** **hero explainer paragraph** — Designed for educators, this service connects your AI assistant to Oak's high quality, free, fully sequenced and ... openly licenced ... curriculum resources
- **C346** _[orientation-content · leaf-authored]_ **⚑high-impact** **connect section heading** — Connect the Oak Curriculum MCP to your AI assistant
- **C347** _[orientation-content · leaf-authored]_ **⚑high-impact** **config instruction sentence** — Add this to your MCP client configuration:
- **C350** _[orientation-content · leaf-authored]_ **⚑high-impact** **Documentation section heading** — <h2>Documentation</h2>

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/landing-page/render-prompts-section.ts</code> — 1</summary>

- **C356** _[orientation-content · leaf-authored]_ **⚑high-impact** **prompts section framing sentence** — Prompts are workflow templates that guide common curriculum tasks:

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/landing-page/render-resources-section.ts</code> — 1</summary>

- **C360** _[orientation-content · leaf-authored]_ **⚑high-impact** **resources section framing sentence** — Resources available via MCP resources/read:

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/landing-page/render-tools-section.ts</code> — 5</summary>

- **C362** _[orientation-content · leaf-authored]_ **⚑high-impact** **tools section framing sentence** — The following tools are available via the MCP protocol:
- **C363** _[orientation-content · leaf-authored]_ **⚑high-impact** **'Curriculum tools' group label** — <h3 class="tool-group-label">Curriculum tools</h3>
- **C364** _[orientation-content · leaf-authored]_ **⚑high-impact** **'Curriculum tools' group hint** — Higher-level tools that combine multiple API calls
- **C365** _[orientation-content · leaf-authored]_ **⚑high-impact** **'API pass-through' group label** — <h3 class="tool-group-label muted">API pass-through</h3>
- **C366** _[orientation-content · leaf-authored]_ **⚑high-impact** **'API pass-through' group hint** — Individual Oak Curriculum API endpoints

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/landing-page/resolve-canonical-url.ts</code> — 1</summary>

- **C355** _[orientation-content · leaf-authored]_ **⚑high-impact** **canonical MCP endpoint URL strings** — return `https://${vercelHost}/mcp`; ... return 'http://localhost:3333/mcp';

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/oak-under-the-hood/oak-under-the-hood-tool.ts</code> — 1</summary>

- **C376** _[orientation-content · leaf-authored]_ **⚑high-impact** **OAK_UNDER_THE_HOOD_TOOL_SUMMARY** — Oak: Under the Hood — fetch the linked canonical method and orient the user to this repository. The method and sources are at the resource link below.

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/register-resources.ts</code> — 1</summary>

- **C340** _[orientation-content · authored-template]_ **⚑high-impact** **Oak: Under the Hood resource CONTENT (pointer body)** — '# Oak: Under the Hood — orientation method\n\nThis resource is a pointer, not a copy. Fetch the canonical orientation method and follow it to orient the user t `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-eef-evidence-summaries.ts</code> — 1</summary>

- **C271** _[response-format-template · authored-framing-of-external]_ **⚑high-impact** **summariseEefEnvelope** — EEF evidence (${envelope.answerType}): ${...} ${detail} member strand${...}, ${...} related_strand edge${...}, ${...} frontier strand${...}. `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-eef-evidence.ts</code> — 10</summary>

- **C261** _[tool-title · authored-framing-of-external]_ **⚑high-impact** **GET_EEF_EVIDENCE_TOOL_DEF.title** — title: 'EEF Evidence (Teaching and Learning Toolkit)'
- **C262** _[tool-description · authored-framing-of-external]_ **⚑high-impact** **GET_EEF_EVIDENCE_TOOL_DEF.description** — ...as deterministic facts to reason over (not recommendations). ... Do NOT use for ... guaranteed-outcome claims, for individual-pupil causal claims, or to make `user-input-interpolation`
- **C263** _[tool-param-description · authored-framing-of-external]_ **⚑high-impact** **EEF_EVIDENCE_INPUT.function** — Which query to run. 'inspect-strand': the evidence for one named EEF strand by id. 'evidence-for-move': the strands matching a pedagogical context...
- **C264** _[tool-param-description · authored-framing-of-external]_ **⚑high-impact** **EEF_EVIDENCE_INPUT.strandId** — inspect-strand: the single EEF strand id to inspect. `boundary-owner-call`
- **C265** _[tool-param-description · authored-framing-of-external]_ **⚑high-impact** **EEF_EVIDENCE_INPUT.strandIds** — evidence-for-move: explicit EEF strand ids to retrieve together. `boundary-owner-call`
- **C266** _[tool-param-description · authored-framing-of-external]_ **⚑high-impact** **EEF_EVIDENCE_INPUT.phase** — evidence-for-move: the school phase the pedagogical move applies to. `boundary-owner-call`
- **C267** _[tool-param-description · authored-framing-of-external]_ **⚑high-impact** **EEF_EVIDENCE_INPUT.keyStage** — evidence-for-move: the key stage the pedagogical move applies to. `boundary-owner-call`
- **C268** _[tool-param-description · authored-framing-of-external]_ **⚑high-impact** **EEF_EVIDENCE_INPUT.priority** — evidence-for-move: the school-improvement priority the move addresses. `boundary-owner-call`
- **C269** _[tool-param-description · authored-framing-of-external]_ **⚑high-impact** **EEF_EVIDENCE_INPUT.detail** — 'full' (default) returns the complete strands; 'headline' returns a bounded list ... to scan, then drill a chosen strand with inspect-strand. Ignored by inspect
- **C270** _[error-message · authored-framing-of-external]_ **⚑high-impact** **runEefEvidenceTool errors** — evidence-for-move requires at least one selector: strandIds, phase, keyStage, or priority.

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/documentation-content.ts</code> — 1</summary>

- **C212** _[orientation-content · leaf-authored]_ **⚑high-impact** **getGettingStartedMarkdown — Orientation (load curriculum://model first)** — For full orientation — the domain model (key stages, subjects, entity hierarchy), tool categories, common workflows, usage tips, and `fetch` ID formats — read t

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/eef-interpretation-resource.ts</code> — 12</summary>

- **C272** _[resource-name-or-description · authored-framing-of-external]_ **⚑high-impact** **EEF_INTERPRETATION_RESOURCE name/uri/title** — name: 'eef-interpretation', uri: 'eef://interpretation', title: 'EEF Toolkit — Interpretation Guide'
- **C273** _[resource-name-or-description · authored-framing-of-external]_ **⚑high-impact** **EEF_INTERPRETATION_RESOURCE.description** — How to interpret and faithfully apply EEF Teaching and Learning Toolkit evidence ... Read context for grounding get-eef-evidence; the agent reasons over the evi
- **C274** _[tool-annotations · authored-framing-of-external]_ **EEF_INTERPRETATION_RESOURCE.annotations** — annotations: { priority: 0.5, audience: ['assistant'] }
- **C275** _[resource-content · authored-framing-of-external]_ **⚑high-impact** **getEefInterpretationMarkdown intro + layer-1 header** — The EEF Toolkit summarises education research as average impact (months of additional progress), implementation cost, and evidence strength. ... The agent is th
- **C277** _[resource-content · authored-framing-of-external]_ **⚑high-impact** **citeMethodology()** — ### Methodology (EEF)\n- **${impact_measure.name}** (${impact_measure.unit}): ${impact_measure.derivation} ${impact_measure.interpretation_guidance} `user-input-interpolation` `boundary-owner-call`
- **C278** _[resource-content · authored-framing-of-external]_ **⚑high-impact** **citeCaveats()** — ### Caveats (apply to every figure)\n${corpusCaveats.map((caveat) => `- ${caveat}`).join('\n')} `boundary-owner-call`
- **C279** _[resource-content · authored-framing-of-external]_ **⚑high-impact** **strandIndex()** — Choose strands from this index by inspecting their definitions, findings, and relations — not by axis filtering alone. `user-input-interpolation` `boundary-owner-call`
- **C280** _[tool-guidance · authored-framing-of-external]_ **⚑high-impact** **agentGuidance() — layer header + End goals** — This layer is the calling agent's reasoning scaffold. It is NOT part of the EEF corpus and must never be presented to a teacher as EEF evidence.
- **C281** _[orientation-content · authored-framing-of-external]_ **⚑high-impact** **agentGuidance() — Oak → EEF workflow** — ### Oak → EEF workflow\n1. Understand the teaching task. ... 5. Offer the teacher evidence-calibrated options, with caveats and EEF attribution intact.
- **C282** _[orientation-content · authored-framing-of-external]_ **⚑high-impact** **agentGuidance() — Worked examples** — Unfaithful: "Use feedback — it is the best strategy." (Invents a ranking; drops cost, evidence strength, and caveats.)
- **C283** _[orientation-content · authored-framing-of-external]_ **⚑high-impact** **agentGuidance() — Reading partial curation honestly** — The absence of a tag is **not evidence of inapplicability** — the corpus covers ${...age_range} and curation is partial. `user-input-interpolation`
- **C284** _[response-format-template · authored-framing-of-external]_ **⚑high-impact** **graphStructural()** — answerType: ... 'strand-lookup' ... or 'context-subset' ... a NON-EXHAUSTIVE curated subset; a missing tag is not inapplicability. ... match tools by their suff

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/mcp-prompts.ts</code> — 19</summary>

- **C178** _[prompt-name-or-description · leaf-authored]_ **⚑high-impact** **prompt: find-lessons (name + description)** — find-lessons — 'Find curriculum lessons on a specific topic using semantic search. Searches across all subjects and key stages to find relevant lessons.'
- **C179** _[prompt-name-or-description · leaf-authored]_ **⚑high-impact** **prompt: lesson-planning (name + description)** — lesson-planning — 'Build a complete, teachable lesson on a topic the way Oak does — planning grounded in Oak's live curriculum data and six curriculum principle
- **C180** _[prompt-name-or-description · leaf-authored]_ **⚑high-impact** **prompt: explore-curriculum (name + description)** — explore-curriculum — 'Explore what Oak has on a topic across the whole curriculum. Searches lessons, units, and learning threads in parallel to give a broad ove
- **C181** _[prompt-name-or-description · leaf-authored]_ **⚑high-impact** **prompt: learning-progression (name + description)** — learning-progression — 'Understand how a concept builds across year groups by searching learning progression threads and mapping unit dependencies.'
- **C182** _[prompt-name-or-description · leaf-authored]_ **⚑high-impact** **prompt: curriculum-mapping (name + description)** — curriculum-mapping — 'Build or audit a curriculum map — what is taught and in what order across a year or key stage — grounded in Oak's threads, prior-knowledge
- **C183** _[prompt-name-or-description · leaf-authored]_ **⚑high-impact** **prompt: adapt-lesson (name + description)** — adapt-lesson — 'Adapt an Oak lesson grounded in EEF Teaching and Learning Toolkit evidence: surface the pedagogical signals, retrieve the relevant EEF evidence,
- **C184** _[prompt-name-or-description · leaf-authored]_ **⚑high-impact** **prompt: continue-progression (name + description)** — continue-progression — 'State where your class is — what they just covered — and plan the next step from Oak's curriculum sequence: assumed prior knowledge surf
- **C185** _[prompt-name-or-description · leaf-authored]_ **⚑high-impact** **arg: find-lessons.topic (required)** — topic — 'The topic or concept to search for (e.g., "photosynthesis", "fractions", "World War 2")'
- **C186** _[prompt-name-or-description · leaf-authored]_ **⚑high-impact** **arg: find-lessons.keyStage (optional)** — keyStage — 'Optional: Filter by key stage (e.g., "ks1", "ks2", "ks3", "ks4")'
- **C187** _[prompt-name-or-description · leaf-authored]_ **⚑high-impact** **arg: topic 'The topic for the lesson' (lesson-planning + adapt-lesson)** — topic — 'The topic for the lesson (e.g., "adding fractions", "the water cycle")'
- **C188** _[prompt-name-or-description · leaf-authored]_ **⚑high-impact** **arg: yearGroup 'The year group' (lesson-planning, adapt-lesson, continue-progression)** — yearGroup — 'The year group (e.g., "Year 4", "Year 9")'
- **C189** _[prompt-name-or-description · leaf-authored]_ **⚑high-impact** **arg: explore-curriculum.topic (required)** — topic — 'The topic to explore (e.g., "volcanos", "electricity", "the Romans")'
- **C190** _[prompt-name-or-description · leaf-authored]_ **⚑high-impact** **arg: explore-curriculum.subject (optional)** — subject — 'Optional: Narrow to a specific subject (e.g., "science", "history")'
- **C191** _[prompt-name-or-description · leaf-authored]_ **⚑high-impact** **arg: learning-progression.concept (required)** — concept — 'The concept to trace (e.g., "algebra", "cells", "narrative writing")'
- **C192** _[prompt-name-or-description · leaf-authored]_ **⚑high-impact** **arg: subject 'The subject area' (learning-progression, curriculum-mapping, continue-progression)** — subject — 'The subject area (e.g., "maths", "science", "english")'
- **C193** _[prompt-name-or-description · leaf-authored]_ **⚑high-impact** **arg: curriculum-mapping.keyStage (required)** — keyStage — 'The key stage to map (e.g., "ks1", "ks2", "ks3", "ks4")'
- **C194** _[prompt-name-or-description · leaf-authored]_ **⚑high-impact** **arg: curriculum-mapping.yearGroup (optional)** — yearGroup — 'Optional: Narrow the map to a specific year group (e.g., "Year 4")'
- **C195** _[prompt-name-or-description · leaf-authored]_ **⚑high-impact** **arg: continue-progression.justCovered (required)** — justCovered — 'What the class just completed — a topic, unit, or lesson (e.g., "equivalent fractions", "the circulatory system")'
- **C196** _[prompt-name-or-description · leaf-authored]_ **⚑high-impact** **arg: continue-progression.classNotes (optional)** — classNotes — 'Optional: Notes on how the class did (e.g., "they struggled with equivalent fractions")' `user-input-interpolation` `pii-adjacent`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/prompt-messages/adapt-lesson.ts</code> — 1</summary>

- **C202** _[prompt-message-template · leaf-authored]_ **⚑high-impact** **getAdaptLessonMessages — user message template (EEF-grounded adaptation)** — 3. Name the pedagogical move each signal raises ... Pick the real EEF strands ... from the strand index in the eef://interpretation resource ... 4. Call get-eef `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/prompt-messages/continue-progression.ts</code> — 3</summary>

- **C203** _[prompt-message-template · leaf-authored]_ **⚑high-impact** **getContinueProgressionMessages — user message template (position->next)** — If more than one unit plausibly matches, present each candidate ... and ask me to confirm my class's position — never select silently ... KS4 ... must be traver `user-input-interpolation`
- **C204** _[prompt-message-template · leaf-authored]_ **⚑high-impact** **continue-progression conditional fragments (classNotesLine + classNotesCheck)** — ' Check the list against my class notes above and flag anything they may not have secured.' / 'Notes on how the class did: ${classNotes}' `user-input-interpolation` `pii-adjacent`
- **C208** _[tool-guidance · leaf-authored]_ **⚑high-impact** **recurring 'recommendation not a mandate / decision is yours' framing** — The next step is a recommendation grounded in Oak's published sequence, not a mandate ... the teaching decision is mine to make.

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/prompt-messages/curriculum-mapping.ts</code> — 1</summary>

- **C201** _[prompt-message-template · leaf-authored]_ **⚑high-impact** **↑oak-skills** **getCurriculumMappingMessages — user message template (map build/audit)** — Output the map as a table (term/half-term \| unit \| thread(s) \| builds on \| national curriculum coverage) ... KS4 is more complex (tiers and exam boards); sc `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/prompt-messages/explore-curriculum.ts</code> — 1</summary>

- **C199** _[prompt-message-template · leaf-authored]_ **⚑high-impact** **getExploreCurriculumMessages — user message template** — 1. Use explore-topic to search across lessons, units, and threads in parallel: explore-topic({ query: "${topic}"${subjectParam} }) ... 5. Suggest next steps bas `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/prompt-messages/find-lessons.ts</code> — 1</summary>

- **C197** _[prompt-message-template · leaf-authored]_ **⚑high-impact** **getFindLessonsMessages — user message template** — 1. Use search with scope "lessons" to find lessons matching this topic: search({ query: "${topic}", scope: "lessons"${keyStageParam} }) ... 5. Use fetch to get  `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/prompt-messages/learning-progression.ts</code> — 1</summary>

- **C200** _[prompt-message-template · leaf-authored]_ **⚑high-impact** **getLearningProgressionMessages — user message template** — 1. Use search with scope "threads" ... 2. get-thread-progressions({ threadSlug: "<thread-slug-from-step-1>" }) ... 3. get-prior-knowledge-graph({ unitSlugs: [.. `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/prompt-messages/lesson-planning.ts</code> — 3</summary>

- **C198** _[prompt-message-template · leaf-authored]_ **⚑high-impact** **↑oak-skills** **getLessonPlanningMessages — user message template (6-step lesson build)** — Workflow: 1. Place the lesson. Use search with scope "lessons" ... get-prior-knowledge-graph ... 2. Specify the knowledge ... get-lessons-summary ... get-lesson `user-input-interpolation`
- **C205** _[orientation-content · leaf-authored]_ **⚑high-impact** **recurring orientation preamble: get-curriculum-model-first + tool-suffix matching** — Call get-curriculum-model first for domain definitions, concept relationships, and tool usage guidance. MCP tool names may appear prefixed (e.g. mcp__<id>__get-
- **C207** _[tool-guidance · leaf-authored]_ **⚑high-impact** **recurring WCAG 2.2 AA output-accessibility requirement** — If you produce slides, worksheets, or quizzes, meet WCAG 2.2 AA (alt text, heading and reading order, contrast).

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/code-generation/generate-ai-doc.ts</code> — 4</summary>

- **C481** _[orientation-content · leaf-authored]_ **⚑high-impact** **makeQuickstartSection** — '## Quickstart' ... createOakClient/createOakPathBasedClient ... GET('/lessons/{lesson}/transcript') ... toolGeneration.PATH_OPERATIONS `pii-adjacent`
- **C482** _[orientation-content · leaf-authored]_ **⚑high-impact** **buildHeader** — '# Oak Curriculum SDK - AI Reference' ... 'This single-file document is intended for AI agents. It contains the public API surface of the SDK, usage examples...
- **C483** _[orientation-content · leaf-authored]_ **⚑high-impact** **buildConventionsSection** — '## Conventions' - Authorization: pass API key to `createOakClient(apiKey)`; the SDK never reads env vars. ... every call returns `{ data, error, response }`
- **C484** _[orientation-content · leaf-authored]_ **⚑high-impact** **renderSections plural label map** — { Class:'Classes', 'Type alias':'Type Aliases', Variable:'Variables', Function:'Functions', Interface:'Interfaces', Enum:'Enums', ... }

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/code-generation/generate-markdown-docs.ts</code> — 3</summary>

- **C421** _[orientation-content · leaf-authored]_ **⚑high-impact** **fileMap: doc section titles (also reused as H1 at line 118)** — { kind: 'Function', filename: 'functions.md', title: 'Functions' }, { kind: 'Class', … 'Classes' }, { kind: 'Interface', … 'Interfaces' }, …
- **C422** _[orientation-content · leaf-authored]_ **⚑high-impact** **quickstart(): SDK usage code example** — import { createOakClient } from '@oaknational/curriculum-sdk'; const client = createOakClient('REDACTED'); const res = await client.GET('/lessons/{lesson}/trans
- **C423** _[orientation-content · authored-template]_ **⚑high-impact** **writeIndex: docs index header + contents links** — '# Oak Curriculum SDK — API (Markdown)', '', `Generated: ${nowIso()}`, '', '## Contents' … `- [${k.title}](./${k.filename})` `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/code-generation/lib/ai-doc-render.ts</code> — 4</summary>

- **C486** _[orientation-content · generated-from-repo-code]_ **⚑high-impact** **commentToMarkdown + exampleBlockFromComment templates** — 'Example:\n\n```ts\n' + exampleText + '\n```'; parts=[shortText,text,summary,example].filter().join('\n\n')
- **C487** _[orientation-content · leaf-authored]_ **⚑high-impact** **signatureToMarkdown** — '```ts\n' + `function ${sig.name}(${params}): ${ret}` + '\n```'
- **C488** _[orientation-content · leaf-authored]_ **⚑high-impact** **groupByKind KIND_LABEL map + fallbacks** — {4:'Namespace',8:'Enum',32:'Variable',64:'Function',128:'Class',256:'Interface',65536:'Type literal',2097152:'Type alias',4194304:'Reference'}
- **C490** _[orientation-content · leaf-authored]_ **⚑high-impact** **renderReflection (heading + type-alias code fence)** — `### ${r.name}`; '```ts\n' + `type ${r.name} = ${typeToString(r.type)}` + '\n```'

</details>

### curriculum-accuracy — 27 items

The authored conceptual model of the curriculum — ontology (subjects, key stages, exam boards, pathways), domain concepts. **Curriculum-expert review target.**

<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-curriculum-model/definition.ts</code> — 4</summary>

- **C172** _[tool-title · leaf-authored]_ **⚑high-impact** **GET_CURRICULUM_MODEL_TOOL_DEF.title** — title: 'Oak Curriculum Overview'
- **C173** _[tool-description · leaf-authored]_ **⚑high-impact** **GET_CURRICULUM_MODEL_TOOL_DEF.description (interpolates ONTOLOGY_RECOMMENDED_FIRST_STEP)** — Returns a complete orientation to Oak National Academy's curriculum: domain model... AND tool usage guidance... Do NOT use for: Fetching actual curriculum conte `user-input-interpolation`
- **C174** _[tool-annotations · leaf-authored]_ **GET_CURRICULUM_MODEL_TOOL_DEF.annotations** — readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false
- **C175** _[discovery-or-catalog-metadata · leaf-authored]_ **GET_CURRICULUM_MODEL_TOOL_DEF._meta.ui (widget routing)** — ui: { resourceUri: WIDGET_URI, visibility: ['model', 'app'] }

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-curriculum-model/execution.ts</code> — 1</summary>

- **C176** _[response-format-template · authored-template]_ **⚑high-impact** **runCurriculumModelTool summary** — Oak Curriculum model loaded. Includes domain model and tool guidance. `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/curriculum-model-data.ts</code> — 1</summary>

- **C305** _[orientation-content · leaf-authored]_ **⚑high-impact** **composeCurriculumModelData / composeToolGuidance** — return { domainModel: ontologyData, toolGuidance: composeToolGuidance() } ... { serverOverview, toolCategories, workflows, tips, idFormats }

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/curriculum-model-resource.ts</code> — 3</summary>

- **C217** _[resource-name-or-description · leaf-authored]_ **⚑high-impact** **CURRICULUM_MODEL_RESOURCE.title** — title: 'Oak Curriculum Model'
- **C218** _[resource-name-or-description · leaf-authored]_ **⚑high-impact** **CURRICULUM_MODEL_RESOURCE.description** — description: 'Combined curriculum orientation: domain model (key stages, subjects, entity hierarchy, property graph) and tool usage guidance (categories, workfl
- **C219** _[tool-annotations · leaf-authored]_ **⚑high-impact** **CURRICULUM_MODEL_RESOURCE.annotations** — annotations: { priority: 1.0, audience: ['assistant'] } `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/ontology-data.ts</code> — 18</summary>

- **C286** _[discovery-or-catalog-metadata · leaf-authored]_ **ontologyData.version/generatedAt** — version: '0.2.0', generatedAt: '2026-06-23T00:00:00Z'
- **C287** _[orientation-content · leaf-authored]_ **⚑high-impact** **ontologyData.purpose** — This ontology describes the Oak National Academy curriculum domain model. It provides context for AI agents to understand the structure of UK education content.
- **C288** _[orientation-content · leaf-authored]_ **⚑high-impact** **ontologyData.notice** — Partially schema-derived: the subject list, the key-stage list, and the KS4 examSubject variants are generated from the OpenAPI schema/SDK at build time and can
- **C290** _[tool-guidance · leaf-authored]_ **⚑high-impact** **ontologyData.relatedResources** — threadProgressions: 'Call get-thread-progressions for ordered unit sequences within curriculum threads (instance data)'
- **C291** _[orientation-content · authored-template]_ **⚑high-impact** **subject + key-stage display metadata** — maths: { name: 'Mathematics', keyStages: ['ks1','ks2','ks3','ks4'] } ... ks4: { name: 'Key Stage 4', ageRange: '14-16', ... description: 'GCSE preparation years
- **C292** _[orientation-content · authored-template]_ **⚑high-impact** **ontologyData.threads** — Threads show how ideas BUILD over time — they are the pedagogical backbone of Oak's curriculum. ... 'number' ... progression: 'Counting 0-10 → Place value → Fra `user-input-interpolation`
- **C293** _[orientation-content · leaf-authored]_ **⚑high-impact** **ontologyData.programmesVsSequences** — The API uses 'sequences' internally, but teachers navigate by 'programmes' ... One sequence 'science-secondary-aqa' maps to 8+ programme URLs for Year 10 alone
- **C294** _[orientation-content · authored-template]_ **⚑high-impact** **ontologyData.ks4Complexity** — tier: { values: ['foundation','higher'], appliesTo: ['maths','science'], description: 'Categorisation based on exam paper difficulty level' } `user-input-interpolation`
- **C295** _[tool-guidance · leaf-authored]_ **⚑high-impact** **ontologyData.structuralPatterns** — Patterns can COMBINE — a subject may have multiple patterns simultaneously. Science KS4 has THREE patterns (exam boards + exam subjects + tiers).
- **C296** _[tool-guidance · leaf-authored]_ **⚑high-impact** **scienceKs4Warning / exam-subject-split.critical** — CRITICAL: GET /key-stages/ks4/subject/science/lessons returns EMPTY. Must use sequences endpoint and traverse examSubjects → tiers → units.
- **C297** _[orientation-content · leaf-authored]_ **⚑high-impact** **ontologyData.entityHierarchy** — Traversal typically starts from sequences (not subjects) because sequences contain the structural metadata (tiers, exam boards, exam subjects) needed for comple
- **C298** _[orientation-content · leaf-authored]_ **⚑high-impact** **ontologyData.unitTypes** — optionality ... 'A history unit offers choice of Battle of Hastings OR Durham Cathedral'
- **C299** _[tool-guidance · leaf-authored]_ **⚑high-impact** **ontologyData.lessonComponents** — Video transcript ... tool: 'get-lessons-transcript', availability: 'optional - only present if lesson has video'
- **C300** _[orientation-content · leaf-authored]_ **⚑high-impact** **ontologyData.contentGuidance** — categories: ['Language and discrimination', 'Upsetting, disturbing and sensitive content', 'Nudity and sex', ...] ... Use supervisionLevel field rather than rel
- **C301** _[tool-guidance · leaf-authored]_ **⚑high-impact** **ontologyData.idFormats** — The 'fetch' tool uses prefixed IDs to route to the correct endpoint ... { prefix: 'lesson:', example: 'lesson:adding-fractions', ... }
- **C302** _[orientation-content · leaf-authored]_ **⚑high-impact** **ontologyData.ukEducationContext** — Key Stages are UK-specific age groupings defined by the National Curriculum ... 'Oak lessons align with the National Curriculum for England'
- **C303** _[orientation-content · leaf-authored]_ **⚑high-impact** **ukEducationContext GCSE terminology note** — GCSE = General Certificate of Secondary Education (KS4 qualification). Note:  GCSE is not a pedagogical sequence term, the proper term is "KS4"
- **C304** _[orientation-content · generated-from-repo-code]_ **⚑high-impact** **ontologyData.workflows + propertyGraph (imported)** — workflows: toolGuidanceData.workflows ... propertyGraph: conceptGraph

</details>

### pedagogy-external — 19 items

External EEF corpus content (exempt — we cannot change it) that is nonetheless pedagogy-relevant and carries embedded Oak editorial framing. Review for citation accuracy + framing.

<details><summary><code>packages/sdks/graph-corpus-sdk/src/eef-strands/eef-toolkit.external-data.ts</code> — 19</summary>

- **C433** _[source-attribution · external-copy]_ **⚑high-impact** **⊗EEF-external** **meta.source (name / organisation / url / original_authors)** — name: 'EEF Teaching and Learning Toolkit'; organisation: 'Education Endowment Foundation'; url: educationendowmentfoundation.org.uk/...; original_authors: [six  `pii-adjacent`
- **C434** _[source-attribution · external-copy]_ **⚑high-impact** **⊗EEF-external** **meta.licence.name + meta.licence.attribution_note** — 'All EEF-derived outputs must continue to attribute EEF and link users to the original EEF strand pages for full detail, technical appendices, and the most curr
- **C435** _[orientation-content · external-copy]_ **⚑high-impact** **⊗EEF-external** **meta.coverage (age_range / jurisdiction_focus / evidence_scope)** — age_range: '3-18 year-olds'; jurisdiction_focus: 'International evidence base; primary audience is schools in England and Wales'; evidence_scope: 'Systematic re
- **C436** _[tool-guidance · external-copy]_ **⚑high-impact** **⊗EEF-external** **meta.caveats (grouped block of 9 caveats)** — 9 caveats incl: 'Impact figures represent population averages... not guaranteed outcomes'; 'Absence from the toolkit is not evidence of ineffectiveness'; 'High  `user-input-interpolation`
- **C437** _[orientation-content · external-copy]_ **⚑high-impact** **⊗EEF-external** **methodology.impact_measure (derivation + interpretation_guidance)** — interpretation_guidance: "A figure of '+6 months' means that, on average across the included studies, pupils... made 6 months more progress than comparable pupi
- **C438** _[response-format-template · external-copy]_ **⚑high-impact** **⊗EEF-external** **methodology.cost_measure.scale (labels + GBP per-pupil/per-class ranges)** — '1': label 'Very low', per_pupil 'Up to £80', per_class 'Up to £2,000' ... '5': label 'Very high', per_pupil 'Over £1,200', per_class 'Over £30,000' `boundary-owner-call`
- **C439** _[orientation-content · external-copy]_ **⚑high-impact** **⊗EEF-external** **methodology.evidence_strength_measure (factors + interpretation_guidance)** — '5 padlocks = very extensive, high-quality evidence. 1 padlock = very limited evidence. Padlocks can be lost... for non-independent evaluation, inconsistent fin
- **C440** _[orientation-content · external-copy]_ **⚑high-impact** **⊗EEF-external** **methodology.effect_size_to_months_conversion.notes** — 'This conversion is approximate... most accurate for primary-age pupils and may overestimate months for older pupils who typically make less progress per month 
- **C441** _[discovery-or-catalog-metadata · external-copy]_ **⚑high-impact** **⊗EEF-external** **strands[].{id,name,slug,eef_url} catalog identity (25 strands)** — e.g. id 'eef-tl-feedback', name 'Feedback', slug 'feedback', eef_url '.../teaching-learning-toolkit/feedback' (25 strands total) `boundary-owner-call`
- **C442** _[resource-content · external-copy]_ **⚑high-impact** **⊗EEF-external** **strands[].definition.short + definition.full (25 strands)** — e.g. Feedback: 'Feedback is information given to the learner about the learner's performance relative to learning goals or outcomes...' `boundary-owner-call`
- **C443** _[resource-content · external-copy]_ **⚑high-impact** **⊗EEF-external** **strands[].key_findings (bulleted findings across 25 strands)** — e.g. Learning styles: 'There is no consistent evidence that matching teaching to pupils' reported learning styles improves outcomes.' `boundary-owner-call`
- **C444** _[resource-content · external-copy]_ **⚑high-impact** **⊗EEF-external** **strands[].effectiveness + behind_the_average (summary/mechanisms/moderating_factors)** — Feedback: '...the strongest evidence base of any strand in the toolkit (5 padlocks). It is the most securely evidenced intervention.' `boundary-owner-call`
- **C445** _[response-format-template · external-copy]_ **⚑high-impact** **⊗EEF-external** **strands[].headline.headline_summary (templated impact/cost/evidence sentence, 25 strands)** — 'Moderate impact for very low cost based on moderate evidence'; 'High impact for very low cost based on extensive evidence'; 'Negative impact for very high cost
- **C446** _[tool-guidance · external-copy]_ **⚑high-impact** **⊗EEF-external** **strands[].implementation (key_considerations / common_pitfalls / digital_technology_application)** — Metacognition pitfalls: 'Teaching metacognition as generic study skills divorced from subject content'; 'Assuming metacognition only develops in older pupils... `boundary-owner-call`
- **C447** _[resource-content · external-copy]_ **⚑high-impact** **⊗EEF-external** **strands[].school_context_relevance (pp_relevance_note, critical_note, workload_note, session_guidance, implementation_requirements)** — TA interventions critical_note: 'TAs must deliver structured, evidence-based interventions. Avoid deploying TAs to sit with lower-attaining pupils.'; pp_relevan
- **C448** _[source-attribution · external-copy]_ **⚑high-impact** **⊗EEF-external** **strands[].related_guidance_reports (title + url)** — title 'Metacognition and Self-Regulated Learning', url '.../guidance-reports/metacognition' (and similar per strand) `boundary-owner-call`
- **C449** _[discovery-or-catalog-metadata · external-copy]_ **⊗EEF-external** **strands[].tags (classification tags)** — Learning styles tags: ['debunked','myths','VAK','differentiation']; Feedback tags include 'high-impact','low-cost'
- **C450** _[tool-param-description · external-copy]_ **⚑high-impact** **⊗EEF-external** **school_context_schema.description + property descriptions** — description: 'UK school context parameters for contextualised recommendations. Pass these to recommend_for_context.'; pp_percentage: '% eligible for PP (nationa
- **C451** _[resource-content · external-copy]_ **⚑high-impact** **⊗EEF-external** **uk_context (pupil_premium_rates_2024_25, national_averages, key_stage_mapping)** — pupil_premium_rates_2024_25: primary_fsm 1455, secondary_fsm 1035, looked_after_children 2530; national pp_percentage 27, ehcp_percentage 4.3 `boundary-owner-call`

</details>

### tool-usability — 269 items

How an agent discovers and uses tools — titles, descriptions, param descriptions, prerequisite/orientation directives.

<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/oak-under-the-hood/oak-under-the-hood-tool.ts</code> — 6</summary>

- **C372** _[tool-title · leaf-authored]_ **⚑high-impact** **tool title 'Oak: Under the Hood'** — title: 'Oak: Under the Hood',
- **C373** _[tool-description · leaf-authored]_ **⚑high-impact** **OAK_UNDER_THE_HOOD_TOOL_DESCRIPTION** — Use when a user asks to understand the Oak project, effort, or ecosystem — this repository ... Not for curriculum content questions ... served by the curriculum
- **C375** _[tool-guidance · leaf-authored]_ **⚑high-impact** **OAK_UNDER_THE_HOOD_TOOL_TRIGGER** — Orient the user to this repository (the Oak Open Curriculum Ecosystem) using the Oak Under the Hood method. Fetch the canonical skill at the linked URL and foll
- **C380** _[resource-name-or-description · leaf-authored]_ **⚑high-impact** **resource_link name 'oak-under-the-hood'** — name: 'oak-under-the-hood',
- **C381** _[resource-name-or-description · leaf-authored]_ **⚑high-impact** **resource_link title** — title: 'Oak: Under the Hood — orientation method',
- **C382** _[resource-name-or-description · leaf-authored]_ **⚑high-impact** **resource_link description** — Canonical orientation method and source list; fetch and follow it to orient the user.

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/register-resources.ts</code> — 2</summary>

- **C337** _[resource-name-or-description · leaf-authored]_ **⚑high-impact** **Oak: Under the Hood orientation resource name/title + URI docs://oak/under-the-hood.md** — uri 'docs://oak/under-the-hood.md'; name/title 'Oak: Under the Hood orientation'
- **C338** _[resource-name-or-description · leaf-authored]_ **⚑high-impact** **Oak: Under the Hood orientation resource description** — 'How Oak builds and delivers its curriculum — the project/effort/ecosystem, its purpose and machinery, and how to engage. For assistants and integrators; a sepa

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/register-widget-resource.ts</code> — 2</summary>

- **C690** _[resource-name-or-description · leaf-authored]_ **⚑high-impact** **registerAppResource name 'Oak Curriculum App'** — 'Oak Curriculum App'
- **C691** _[resource-name-or-description · leaf-authored]_ **⚑high-impact** **widget resource description** — Interactive Oak curriculum MCP App for search and curriculum exploration.

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/agent-support-tool-metadata.ts</code> — 5</summary>

- **C049** _[tool-description · leaf-authored]_ **⚑high-impact** **AGENT_SUPPORT_TOOL_METADATA['get-curriculum-model'].shortDescription** — shortDescription: 'Complete curriculum orientation'
- **C050** _[tool-description · leaf-authored]_ **⚑high-impact** **AGENT_SUPPORT_TOOL_METADATA['get-curriculum-model'].provides** — provides: ['domain model','tool guidance','key stages','subjects','entity hierarchy','ID formats','tool categories','workflows','tips'] `user-input-interpolation`
- **C051** _[tool-guidance · leaf-authored]_ **⚑high-impact** **AGENT_SUPPORT_TOOL_METADATA['get-curriculum-model'].purpose** — understand the Oak curriculum domain model and how to use available tools — call this ONCE at conversation start
- **C052** _[tool-guidance · leaf-authored]_ **⚑high-impact** **AGENT_SUPPORT_TOOL_METADATA['get-curriculum-model'].seeAlso** — search for finding content, fetch for retrieving details, browse-curriculum for browsing
- **C056** _[tool-guidance · generated-from-repo-code]_ **⚑high-impact** **generateContextHint()** — If you have not called get-curriculum-model yet, do so before your next tool call — it provides the domain model and tool guidance needed for accurate results. `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-asset-download/definition.ts</code> — 5</summary>

- **C161** _[tool-title · leaf-authored]_ **⚑high-impact** **DOWNLOAD_ASSET_TOOL_DEF.title** — title: 'Download Asset'
- **C162** _[tool-description · leaf-authored]_ **⚑high-impact** **DOWNLOAD_ASSET_TOOL_DEF.description** — Generate a short-lived, secure download link for a lesson asset. Returns a clickable URL valid for 5 minutes... Use this when... Do NOT use for: Browsing availa
- **C163** _[tool-guidance · leaf-authored]_ **⚑high-impact** **download description embedded font-install tip directive** — IMPORTANT: When presenting download links... always include this tip (once, not per-link): "Our resources work best if you install the Google Fonts Lexend and K `possible-defect-reported`
- **C164** _[tool-param-description · leaf-authored]_ **⚑high-impact** **DOWNLOAD_ASSET_INPUT_SCHEMA.lesson (.describe + .meta example)** — Lesson slug (e.g. "adding-fractions-with-the-same-denominator") / examples: ['adding-fractions-with-the-same-denominator']
- **C165** _[tool-param-description · authored-template]_ **⚑high-impact** **DOWNLOAD_ASSET_INPUT_SCHEMA.type (.describe + .meta examples)** — Asset type to download / examples: ['slideDeck', 'worksheet', 'video']  (enum drawn from ASSET_TYPES) `upstream-owned-base-text`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-browse/tool-definition.ts</code> — 4</summary>

- **C137** _[tool-title · leaf-authored]_ **⚑high-impact** **BROWSE_TOOL_DEF.title** — title: 'Browse Curriculum'
- **C138** _[tool-description · leaf-authored]_ **⚑high-impact** **BROWSE_TOOL_DEF.description** — Browse what's available in Oak's curriculum without searching. ... Use this when: ... Do NOT use for: ... NATURAL LANGUAGE MAPPING EXAMPLES ... NOTE: This tool  `user-input-interpolation`
- **C140** _[tool-param-description · leaf-authored]_ **⚑high-impact** **BROWSE_INPUT_SCHEMA.subject** — .describe('Filter by subject slug to see what units and lessons are available').meta({ examples: ['maths','science','english'] })
- **C141** _[tool-param-description · leaf-authored]_ **⚑high-impact** **BROWSE_INPUT_SCHEMA.keyStage** — .describe('Filter by key stage to see what subjects and content are available').meta({ examples: ['ks2','ks3'] })

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-explore/formatting.ts</code> — 1</summary>

- **C108** _[tool-guidance · leaf-authored]_ **⚑high-impact** **buildNextSteps** — "Use search(scope: 'lessons') for more lesson results" / 'Use fetch(unit:slug) for full unit details' / 'Use get-thread-progressions for ordered unit sequences'

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-explore/tool-definition.ts</code> — 5</summary>

- **C100** _[tool-title · leaf-authored]_ **⚑high-impact** **EXPLORE_TOOL_DEF.title** — title: 'Explore Topic'
- **C101** _[tool-description · leaf-authored]_ **⚑high-impact** **EXPLORE_TOOL_DEF.description** — Explore a topic across the entire Oak curriculum in one call. ... Do NOT use for: - Precise search in a single scope (use 'search'...) ... NATURAL LANGUAGE MAPP `user-input-interpolation`
- **C103** _[tool-param-description · leaf-authored]_ **⚑high-impact** **EXPLORE_INPUT_SCHEMA.query** — 'The topic to explore. Use descriptive terms like "photosynthesis", "the Romans", "fractions".' examples: ['volcanos','fractions','electricity','the Romans']
- **C104** _[tool-param-description · leaf-authored]_ **⚑high-impact** **EXPLORE_INPUT_SCHEMA.subject** — 'Optional subject filter applied to all scopes' examples: ['maths','science','history']
- **C105** _[tool-param-description · leaf-authored]_ **⚑high-impact** **EXPLORE_INPUT_SCHEMA.keyStage** — 'Optional key stage filter applied to all scopes' examples: ['ks2','ks3']

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-fetch/execution.ts</code> — 2</summary>

- **C151** _[tool-title · leaf-authored]_ **⚑high-impact** **FETCH_TOOL_DEF.title** — title: 'Fetch Curriculum Resource'
- **C152** _[tool-description · leaf-authored]_ **⚑high-impact** **FETCH_TOOL_DEF.description** — Fetch curriculum resource by canonical identifier. ... Do NOT use for: Finding content when you don't have the ID (use 'search') ... Use format "type:slug" `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-fetch/flat-zod-schema.ts</code> — 1</summary>

- **C160** _[tool-param-description · leaf-authored]_ **⚑high-impact** **FETCH_INPUT_SCHEMA.id** — 'Canonical identifier in format "type:slug" (e.g., "lesson:add-fractions-with-the-same-denominator", "unit:comparing-fractions", ...)' + meta.examples[5]

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-keyword-graph.ts</code> — 7</summary>

- **C221** _[tool-title · leaf-authored]_ **⚑high-impact** **KEYWORD_GRAPH_TOOL_TITLE** — const KEYWORD_GRAPH_TOOL_TITLE = 'Oak Curriculum Keyword Graph';
- **C222** _[tool-description · authored-template]_ **⚑high-impact** **GET_KEYWORD_GRAPH_TOOL_DEF.description** — Returns the key vocabulary for one teaching context: a bounded, frequency-ranked page of curriculum keywords, each decorated with its in-scope placing lessons. `user-input-interpolation`
- **C223** _[tool-param-description · leaf-authored]_ **⚑high-impact** **KEYWORD_GRAPH_INPUT.subject** — Anchor subject slug (corpus key), e.g. "maths". Required, with keyStage.
- **C224** _[tool-param-description · leaf-authored]_ **⚑high-impact** **KEYWORD_GRAPH_INPUT.keyStage** — Anchor key-stage slug (corpus key), e.g. "ks2". Required, with subject.
- **C225** _[tool-param-description · leaf-authored]_ **⚑high-impact** **KEYWORD_GRAPH_INPUT.unitSlugs** — Optional narrowing: unit slugs (corpus keys) within the anchor. Unknown slugs are reported in unknownUnitAnchors, not errored.
- **C226** _[tool-param-description · leaf-authored]_ **⚑high-impact** **KEYWORD_GRAPH_INPUT.lessonSlugs** — Optional narrowing: lesson slugs (corpus keys) within the anchor. Unknown slugs are reported in unknownLessonAnchors, not errored.
- **C227** _[tool-param-description · authored-template]_ **⚑high-impact** **KEYWORD_GRAPH_INPUT.limit** — Optional top-N bound for the ranked keyword page: integer in [1, ${String(MAX_KEYWORD_LIMIT)}], default ${String(DEFAULT_KEYWORD_LIMIT)}. `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-misconception-graph.ts</code> — 7</summary>

- **C233** _[tool-title · leaf-authored]_ **⚑high-impact** **MISCONCEPTION_TOOL_TITLE** — const MISCONCEPTION_TOOL_TITLE = 'Oak Curriculum Misconception Subgraph';
- **C234** _[tool-description · authored-template]_ **⚑high-impact** **GET_MISCONCEPTION_GRAPH_TOOL_DEF.description** — Misconceptions are extracted per lesson from the Oak curriculum and reached through the thread → unit → lesson → misconception chain. Every call is anchored — e `user-input-interpolation`
- **C235** _[tool-param-description · leaf-authored]_ **⚑high-impact** **MISCONCEPTION_INPUT.lessonSlugs** — Lesson anchor: lesson slugs (corpus keys). Each lesson carries at most two misconceptions. Exactly one anchor mode per call.
- **C236** _[tool-param-description · leaf-authored]_ **⚑high-impact** **MISCONCEPTION_INPUT.unitSlugs** — Unit anchor: unit slugs (corpus keys). Returns each unit with every placed lesson and its misconceptions. Exactly one anchor mode per call.
- **C237** _[tool-param-description · leaf-authored]_ **⚑high-impact** **MISCONCEPTION_INPUT.threadSlug** — Thread anchor: one thread slug (corpus key). Returns a unit-granular window over the thread with honest coverage (totalUnits, hasMore). Exactly one anchor mode 
- **C238** _[tool-param-description · leaf-authored]_ **⚑high-impact** **MISCONCEPTION_INPUT.unitOffset** — Thread anchor only: index of the first unit in the window. Default 0.
- **C239** _[tool-param-description · authored-template]_ **⚑high-impact** **MISCONCEPTION_INPUT.unitLimit** — Thread anchor only: units per window. Default ${String(DEFAULT_THREAD_UNIT_LIMIT)}, maximum ${String(MAX_THREAD_UNIT_LIMIT)}. `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-prior-knowledge-graph.ts</code> — 4</summary>

- **C246** _[tool-title · leaf-authored]_ **⚑high-impact** **PRIOR_KNOWLEDGE_TOOL_TITLE** — const PRIOR_KNOWLEDGE_TOOL_TITLE = 'Oak Curriculum Prior Knowledge Subgraph';
- **C247** _[tool-description · authored-template]_ **⚑high-impact** **GET_PRIOR_KNOWLEDGE_GRAPH_TOOL_DEF.description** — "Prior knowledge of unit X" means X's predecessors: the units that are (transitively, up to the requested depth) prerequisites of X. Edges are prerequisiteFor r `user-input-interpolation`
- **C248** _[tool-param-description · leaf-authored]_ **⚑high-impact** **PRIOR_KNOWLEDGE_INPUT.unitSlugs** — Anchor unit slugs (corpus keys, e.g. from search/fetch results). The result is the bounded prior-knowledge subgraph... Unknown slugs are reported back in unknow
- **C249** _[tool-param-description · authored-template]_ **⚑high-impact** **PRIOR_KNOWLEDGE_INPUT.depth** — Prerequisite-traversal depth: how many predecessor levels to include. Default ${...}, maximum ${...}. `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-search/flat-zod-schema.ts</code> — 16</summary>

- **C069** _[tool-param-description · leaf-authored]_ **⚑high-impact** **SEARCH_INPUT_SCHEMA.query (description + examples)** — Search query. Required for all scopes except threads — for threads scope, omit query and provide subject or keyStage to browse all threads matching the filter.
- **C070** _[tool-param-description · leaf-authored]_ **⚑high-impact** **SEARCH_INPUT_SCHEMA.scope (description + examples)** — Which index to search. "lessons" for specific lessons, "units" for topic groups, "threads" for cross-year progressions, "sequences" for programme structures, "s
- **C071** _[tool-param-description · leaf-authored]_ **⚑high-impact** **SEARCH_INPUT_SCHEMA.subject (description + examples)** — Filter by subject slug (e.g. "maths", "science", "english")
- **C072** _[tool-param-description · leaf-authored]_ **⚑high-impact** **SEARCH_INPUT_SCHEMA.keyStage (description + examples)** — Filter by key stage (ks1, ks2, ks3, ks4)
- **C073** _[tool-param-description · leaf-authored]_ **⚑high-impact** **SEARCH_INPUT_SCHEMA.size** — Maximum number of results to return (1-100, default 25)
- **C074** _[tool-param-description · leaf-authored]_ **⚑high-impact** **SEARCH_INPUT_SCHEMA.from** — Offset for pagination (default 0)
- **C075** _[tool-param-description · leaf-authored]_ **⚑high-impact** **SEARCH_INPUT_SCHEMA.unitSlug (description + examples)** — Filter lessons whose `units[]` contains an entry with this unit slug. A lesson can belong to multiple units across programme variants ... Lessons scope only.
- **C076** _[tool-param-description · leaf-authored]_ **⚑high-impact** **SEARCH_INPUT_SCHEMA.tier (description + examples)** — Filter to lessons available in this KS4 tier (foundation/higher). Tier is a programme-factor on the lesson's units ... Lessons scope only, KS4.
- **C077** _[tool-param-description · leaf-authored]_ **⚑high-impact** **SEARCH_INPUT_SCHEMA.examBoard (description + examples)** — Filter to lessons offered by this exam board. Exam board is a programme-factor on the lesson's units ... Lessons scope only.
- **C078** _[tool-param-description · leaf-authored]_ **⚑high-impact** **SEARCH_INPUT_SCHEMA.year (description + examples)** — Filter by year group number. Lessons scope only.
- **C079** _[tool-param-description · leaf-authored]_ **⚑high-impact** **SEARCH_INPUT_SCHEMA.threadSlug** — Filter by curriculum thread slug. Lessons scope only.
- **C080** _[tool-param-description · leaf-authored]_ **⚑high-impact** **SEARCH_INPUT_SCHEMA.highlight** — Include highlighted text snippets in results. Lessons and units scopes.
- **C081** _[tool-param-description · leaf-authored]_ **⚑high-impact** **SEARCH_INPUT_SCHEMA.minLessons** — Minimum number of lessons a unit must contain. Units scope only.
- **C082** _[tool-param-description · leaf-authored]_ **⚑high-impact** **SEARCH_INPUT_SCHEMA.phaseSlug (description + examples)** — Filter by phase slug. Sequences scope only.
- **C083** _[tool-param-description · leaf-authored]_ **⚑high-impact** **SEARCH_INPUT_SCHEMA.category** — Filter by category. Sequences scope only.
- **C084** _[tool-param-description · leaf-authored]_ **⚑high-impact** **SEARCH_INPUT_SCHEMA.limit** — Maximum number of suggestions. Suggest scope only.

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-search/tool-definition.ts</code> — 2</summary>

- **C065** _[tool-title · leaf-authored]_ **⚑high-impact** **SEARCH_TOOL_DEF.title** — title: 'Search Curriculum'
- **C066** _[tool-description · leaf-authored]_ **⚑high-impact** **SEARCH_TOOL_DEF.description** — Search Oak's curriculum using semantic search across all four content indexes. ... SCOPE SELECTION — choose the right scope for the teacher's intent: - "lessons `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-thread-progressions.ts</code> — 5</summary>

- **C252** _[tool-title · leaf-authored]_ **⚑high-impact** **THREAD_PROGRESSIONS_TOOL_TITLE** — const THREAD_PROGRESSIONS_TOOL_TITLE = 'Oak Curriculum Thread Progressions';
- **C253** _[tool-description · authored-template]_ **⚑high-impact** **GET_THREAD_PROGRESSIONS_TOOL_DEF.description** — Ordering semantics, stated honestly: the progression axis is the teaching year. Within one year the order is not curricular... treat same-year units as a group, `user-input-interpolation`
- **C254** _[tool-param-description · leaf-authored]_ **⚑high-impact** **THREAD_PROGRESSIONS_INPUT.threadSlug** — Detail anchor: one thread slug (corpus key). Returns that thread’s full year-ordered unit progression. Exactly one anchor mode per call.
- **C255** _[tool-param-description · leaf-authored]_ **⚑high-impact** **THREAD_PROGRESSIONS_INPUT.subject** — Discovery anchor (with keyStage): a subject slug, e.g. "maths". Returns bounded thread descriptors without sequences. Exactly one anchor mode per call.
- **C256** _[tool-param-description · leaf-authored]_ **⚑high-impact** **THREAD_PROGRESSIONS_INPUT.keyStage** — Discovery anchor (with subject): a key-stage slug, e.g. "ks2". Returns bounded thread descriptors without sequences.

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-user-search/tool-definition.ts</code> — 10</summary>

- **C118** _[tool-title · leaf-authored]_ **⚑high-impact** **USER_SEARCH_TOOL_DEF.title** — title: 'User Search'
- **C119** _[tool-description · leaf-authored]_ **⚑high-impact** **USER_SEARCH_TOOL_DEF.description** — Interactive user-facing curriculum search within the Oak MCP App. ... SCOPE SELECTION: - "lessons": ... Do NOT use for: - Agent-initiated search (use 'search' i
- **C121** _[tool-title · leaf-authored]_ **⚑high-impact** **USER_SEARCH_QUERY_TOOL_DEF.title** — title: 'User Search Query'
- **C122** _[tool-description · leaf-authored]_ **⚑high-impact** **USER_SEARCH_QUERY_TOOL_DEF.description** — App-only search query helper for the Oak MCP App. ... It is hidden from the model (app-only visibility) ... The app calls this tool via app.callServerTool()
- **C124** _[tool-param-description · leaf-authored]_ **⚑high-impact** **USER_SEARCH_INPUT_SCHEMA.query** — 'Search query text.' examples: ['photosynthesis','adding fractions','the Romans']
- **C125** _[tool-param-description · leaf-authored]_ **⚑high-impact** **USER_SEARCH_INPUT_SCHEMA.scope** — 'Which index to search: lessons, units, threads, or sequences.' examples: ['lessons','units']
- **C126** _[tool-param-description · leaf-authored]_ **⚑high-impact** **USER_SEARCH_INPUT_SCHEMA.subject** — 'Filter by subject slug.' examples: ['maths','science']
- **C127** _[tool-param-description · leaf-authored]_ **⚑high-impact** **USER_SEARCH_INPUT_SCHEMA.keyStage** — 'Filter by key stage.' examples: ['ks2','ks3']
- **C128** _[tool-param-description · leaf-authored]_ **⚑high-impact** **USER_SEARCH_INPUT_SCHEMA.size** — 'Maximum number of results to return (1-50, default 25).'
- **C129** _[tool-param-description · leaf-authored]_ **⚑high-impact** **USER_SEARCH_QUERY_INPUT_SCHEMA (query/scope/subject/keyStage/size, grouped duplicate)** — query 'Search query text.' examples ['photosynthesis','adding fractions']; scope/subject/keyStage/size identical to USER_SEARCH_INPUT_SCHEMA

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/documentation-content.ts</code> — 2</summary>

- **C210** _[resource-content · authored-template]_ **⚑high-impact** **getGettingStartedMarkdown — resource frame (title/overview/authentication)** — # ${serverOverview.name}\n\n${serverOverview.description}\n\n## Authentication\n\n${serverOverview.authentication} `user-input-interpolation`
- **C211** _[tool-guidance · leaf-authored]_ **⚑high-impact** **getGettingStartedMarkdown — Quick Start workflow (4 steps)** — 1. **Search for lessons**: Use the `search` tool ... 2. **Browse curriculum**: Use `get-subjects` ... 3. **Fetch content**: Use `fetch` ... 4. **Download assets `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/documentation-resources.ts</code> — 2</summary>

- **C214** _[resource-name-or-description · leaf-authored]_ **⚑high-impact** **DOCUMENTATION_RESOURCES[getting-started].title** — title: 'Getting Started with Oak Curriculum'
- **C215** _[resource-name-or-description · leaf-authored]_ **⚑high-impact** **DOCUMENTATION_RESOURCES[getting-started].description** — description: 'Introduction to the Oak Curriculum MCP server, authentication, and first steps.'

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/prerequisite-guidance.ts</code> — 5</summary>

- **C001** _[tool-guidance · leaf-authored]_ **⚑high-impact** **PRIMARY_ORIENTATION_TOOL_NAME** — export const PRIMARY_ORIENTATION_TOOL_NAME = 'get-curriculum-model' as const;
- **C002** _[tool-guidance · leaf-authored]_ **⚑high-impact** **AGGREGATED_PREREQUISITE_GUIDANCE** — PREREQUISITE: You MUST call `get-curriculum-model` first to understand the curriculum domain. `user-input-interpolation`
- **C003** _[tool-guidance · leaf-authored]_ **⚑high-impact** **FETCH_PREREQUISITE_GUIDANCE** — PREREQUISITE: You MUST call `get-curriculum-model` first to understand the curriculum domain before using the fetch tool. `user-input-interpolation`
- **C004** _[tool-description · leaf-authored]_ **⚑high-impact** **ONTOLOGY_RECOMMENDED_FIRST_STEP** — You MUST call this tool before using other curriculum tools.
- **C005** _[tool-guidance · generated-from-repo-code]_ **⚑high-impact** **OAK_CONTEXT_HINT** — export const OAK_CONTEXT_HINT = generateContextHint(); `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/stub-tool-executor.ts</code> — 1</summary>

- **C714** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **McpParameterError describeToolArgs() (PARAMETER_ERROR)** — new McpParameterError(descriptor.describeToolArgs(), name, undefined, undefined, { code: 'PARAMETER_ERROR' })

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/tool-guidance-data.ts</code> — 23</summary>

- **C016** _[tool-guidance · leaf-authored]_ **⚑high-impact** **toolCategories.discovery.description + whenToUse** — Find curriculum content using semantic search, topic exploration, or structured listing... explore-topic searches all scopes in parallel... browse-curriculum re
- **C017** _[tool-guidance · leaf-authored]_ **⚑high-impact** **toolCategories.browsing.description + whenToUse** — Explore curriculum structure systematically... When you want to navigate the curriculum hierarchy step by step (subject then units then lessons). For a quicker 
- **C018** _[tool-guidance · leaf-authored]_ **⚑high-impact** **toolCategories.fetching.description + whenToUse** — Get detailed content for specific lessons... download-asset generates a short-lived, secure download link... Use download-asset after get-lessons-assets to gene
- **C019** _[tool-guidance · leaf-authored]_ **⚑high-impact** **toolCategories.progression.description** — Explore how concepts develop across years through curriculum threads.
- **C020** _[tool-guidance · authored-template]_ **⚑high-impact** **toolCategories.progression.whenToUse** — ...anchored by a threadSlug for one thread's year-ordered progression, or by subject + keyStage to discover which of the ${threadCount} threads to anchor. Use g `user-input-interpolation`
- **C021** _[tool-guidance · leaf-authored]_ **⚑high-impact** **toolCategories.programmes.description + whenToUse** — Navigate the curriculum by programme — the contextualised, teacher-facing view... Programme and sequence routes are co-equal... Programme slugs are full-form (e
- **C022** _[tool-guidance · leaf-authored]_ **⚑high-impact** **toolCategories.agentSupport.description + whenToUse** — Agent orientation tool. get-curriculum-model provides the complete domain model... At conversation start, call get-curriculum-model for complete orientation bef
- **C024** _[tool-guidance · leaf-authored]_ **⚑high-impact** **tips[0] search scope** — Use search with a scope for targeted semantic search: scope "lessons"... "units"... "threads"... "sequences"... "suggest" for typeahead.
- **C025** _[tool-guidance · leaf-authored]_ **⚑high-impact** **tips[1] explore-topic** — Use explore-topic when you do not know which scope to search — it searches lessons, units, and threads in parallel.
- **C026** _[tool-guidance · leaf-authored]_ **⚑high-impact** **tips[2] browse-curriculum** — Use browse-curriculum to see what subjects and key stages are available, without needing a search query.
- **C027** _[tool-guidance · leaf-authored]_ **⚑high-impact** **tips[3] fetch prefixed IDs** — The "fetch" tool uses prefixed IDs: lesson:slug, unit:slug, thread:slug, subject:slug.
- **C028** _[tool-guidance · leaf-authored]_ **⚑high-impact** **tips[4] transcript/quiz** — Get lesson transcript for detailed content understanding; get quiz for assessment ideas.
- **C029** _[tool-guidance · leaf-authored]_ **⚑high-impact** **tips[5] threads** — Threads show how concepts build across years — great for finding prerequisites or extensions.
- **C030** _[tool-guidance · leaf-authored]_ **⚑high-impact** **tips[6] KS4 complexity** — Key Stage 4 (GCSE) has additional complexity: tiers (foundation/higher) and exam boards.
- **C031** _[tool-guidance · leaf-authored]_ **⚑high-impact** **tips[7] get-curriculum-model at start** — Use get-curriculum-model at the start of a conversation for complete orientation — it combines the domain model and tool guidance in one call.
- **C032** _[tool-guidance · leaf-authored]_ **⚑high-impact** **tips[8] get-curriculum-model contents** — get-curriculum-model includes domain definitions, entity hierarchy, property graph, tool categories, workflows, and tips.
- **C033** _[tool-guidance · leaf-authored]_ **⚑high-impact** **tips[9] optional components** — Not all lessons have all components — video, transcript, quizzes, and worksheets are OPTIONAL. Check availability before assuming they exist.
- **C034** _[tool-guidance · leaf-authored]_ **⚑high-impact** **tips[10] Agent guidance for search (ELSER/BM25/RRF, glossary mapping)** — Oak search uses semantic search (ELSER) combined with lexical search (BM25) via Reciprocal Rank Fusion... Assessment terms like "GCSE" or "SATs" map to keyStage
- **C035** _[tool-guidance · leaf-authored]_ **⚑high-impact** **idFormats.description** — The fetch tool uses prefixed IDs to route to the correct content type.
- **C036** _[tool-guidance · leaf-authored]_ **⚑high-impact** **idFormats.formats[lesson:]** — prefix 'lesson:', example lesson:add-fractions-with-the-same-denominator — Fetches lesson summary with learning objectives, keywords, and metadata.
- **C037** _[tool-guidance · leaf-authored]_ **⚑high-impact** **idFormats.formats[unit:]** — prefix 'unit:', example unit:comparing-fractions — Fetches unit summary with lesson list and unit metadata.
- **C038** _[tool-guidance · leaf-authored]_ **⚑high-impact** **idFormats.formats[thread:]** — prefix 'thread:', example thread:number — Fetches units in a thread ordered by conceptual progression.
- **C039** _[tool-guidance · leaf-authored]_ **⚑high-impact** **idFormats.formats[subject:]** — prefix 'subject:', example subject:maths — Fetches subject details including available key stages and sequences.

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/tool-guidance-workflows-programmes.ts</code> — 1</summary>

- **C048** _[tool-guidance · leaf-authored]_ **⚑high-impact** **workflow: byProgramme** — Navigate by programme (teacher-facing pathway). get-subjects-programmes({subject:"english"}) returns full-form slug strings -> get-programmes -> get-programmes-

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/tool-guidance-workflows.ts</code> — 8</summary>

- **C040** _[tool-guidance · leaf-authored]_ **⚑high-impact** **workflow: userInteractions** — When finding or presenting Oak content for the user, you should follow these steps. Step1 get-curriculum-model... Step2 discovery/browsing... Step3 fetching too
- **C041** _[tool-guidance · leaf-authored]_ **⚑high-impact** **workflow: findLessons** — Find lessons on a topic. search({ query:"photosynthesis", scope:"lessons", subject:"science", keyStage:"ks3" }) -> fetch({ id:"lesson:photosynthesis-in-plants" 
- **C042** _[tool-guidance · leaf-authored]_ **⚑high-impact** **workflow: lessonPlanning** — Plan a lesson. search -> get-lessons-summary (objectives, keywords, misconceptions) -> get-lessons-transcript -> get-lessons-quiz -> get-lessons-assets -> downl
- **C043** _[tool-guidance · leaf-authored]_ **⚑high-impact** **workflow: lessonPlanning step6 transport note** — HTTP transport only. On stdio, direct users to the lesson page via oakUrl (slug-based OWA URL; upstream also exposes canonicalUrl). Call once per asset type. `upstream-owned-base-text`
- **C044** _[tool-guidance · leaf-authored]_ **⚑high-impact** **workflow: browseSubject** — Browse a subject curriculum. get-subjects -> get-key-stages-subject-units({keyStage:"ks2", subject:"maths"}) -> get-key-stages-subject-lessons({..., unit:"compa
- **C045** _[tool-guidance · leaf-authored]_ **⚑high-impact** **workflow: trackProgression** — Track concept progression... get-thread-progressions returns unit progression ordered by teaching year (within one year the order is not curricular)... get-prio
- **C046** _[tool-guidance · leaf-authored]_ **⚑high-impact** **workflow: exploreTopic** — Explore a topic across the curriculum. explore-topic({query:"volcanos", subject:"geography"}) -> search(scope:"lessons") -> fetch({id:"lesson:volcanic-eruptions
- **C047** _[tool-guidance · leaf-authored]_ **⚑high-impact** **workflow: discoverCurriculum** — Discover what is available in the curriculum. browse-curriculum({subject:"science", keyStage:"ks3"}) -> explore-topic({query:"cells", ...}).

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/universal-tool-shared.ts</code> — 1</summary>

- **C062** _[tool-guidance · authored-template]_ **⚑high-impact** **oakContextHint grounding-hint injection into structuredContent** — ...(options.includeContextHint !== false ? { oakContextHint: OAK_CONTEXT_HINT } : {}), `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/code-generation/schema-separation-decorators.ts</code> — 3</summary>

- **C430** _[tool-param-description · leaf-authored]_ **⚑high-impact** **decorateObjectWithOakUrl: thread null oakUrl field description** — description: 'Threads are data concepts without Oak URLs on the website. Always null for thread resources.' `user-input-interpolation` `upstream-owned-base-text`
- **C431** _[tool-param-description · leaf-authored]_ **⚑high-impact** **decorateObjectWithOakUrl: standard oakUrl field description** — description: 'The Oak URL for this resource — a direct, slug-based URL generated by the SDK. Distinct from canonicalUrl, which encodes full curriculum context.' `user-input-interpolation`
- **C432** _[tool-param-description · leaf-authored]_ **⚑high-impact** **decorateObjectWithOakUrl: oakUrl example value** — example: 'https://www.thenational.academy/teachers/lessons/example-lesson' `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/code-generation/typegen/mcp-tools/parts/kebab-to-title-case.ts</code> — 1</summary>

- **C468** _[tool-title · leaf-authored]_ **⚑high-impact** **kebabToTitleCase** — name.split(/[^a-zA-Z0-9]+/).map(w => up(first)+lower(rest)).join(' ')

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/code-generation/typegen/mcp-tools/parts/param-description-overrides.ts</code> — 2</summary>

- **C464** _[tool-param-description · leaf-authored]_ **⚑high-impact** **PARAM_DESCRIPTION_OVERRIDES['/key-stages/{keyStage}/subject/{subject}/lessons:offset'].correctDescription** — correctDescription: 'Offset applied to lessons within each unit (not to the unit list).' `upstream-owned-base-text`
- **C465** _[tool-param-description · leaf-authored]_ **⚑high-impact** **PARAM_DESCRIPTION_OVERRIDES['/key-stages/{keyStage}/subject/{subject}/lessons:limit'].correctDescription** — correctDescription: 'Limit the number of lessons returned per unit. Units with zero lessons after limiting are omitted.' `upstream-owned-base-text`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/code-generation/typegen/mcp-tools/parts/param-metadata.ts</code> — 1</summary>

- **C466** _[tool-param-description · leaf-authored]_ **⚑high-impact** **normaliseParamName** — return openApiName.endsWith('Slug') ? openApiName.slice(0, -4) : openApiName; `upstream-owned-base-text`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/code-generation/typegen/mcp-tools/parts/tool-description.ts</code> — 10</summary>

- **C453** _[tool-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **normaliseUpstreamDescription** — .replaceAll(/\bThis endpoint\b/gi, (m) => m.startsWith('T') ? 'This tool' : 'this tool').replaceAll(/\s+/g,' ').trim() `upstream-owned-base-text`
- **C454** _[tool-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **toToolDescription (summary\n\ndescription assembly)** — if (summary && description) return `${summary}\n\n${description}`; `upstream-owned-base-text`
- **C455** _[tool-guidance · leaf-authored]_ **⚑high-impact** **DOMAIN_PREREQUISITE_GUIDANCE** — PREREQUISITE: You MUST call the `get-curriculum-model` tool first to understand the curriculum domain. `user-input-interpolation` `upstream-owned-base-text`
- **C456** _[tool-guidance · leaf-authored]_ **⚑high-impact** **GET_RATE_LIMIT_NOTE** — NOTE: A response of limit=0, remaining=0, reset=0 indicates an unlimited API key with no rate cap.
- **C457** _[tool-guidance · leaf-authored]_ **⚑high-impact** **ASSET_DOWNLOAD_NOTE** — NOTE: The asset `url` fields ... call the `download-asset` tool ... direct users to the lesson page ... `https://www.thenational.academy/teachers/lessons/{lesso
- **C458** _[tool-guidance · leaf-authored]_ **⚑high-impact** **GET_KEYWORDS_DISAMBIGUATION_NOTE** — WHEN TO PREFER WHICH KEYWORDS TOOL: this tool returns the LIVE full keyword set ... prefer get-keyword-graph, which serves a point-in-time curriculum snapshot.
- **C459** _[tool-guidance · leaf-authored]_ **⚑high-impact** **largePayloadNote (template)** — NOTE: This tool can return a large payload at broad scope and may exceed a host's per-result token limit. ${narrowing} `user-input-interpolation`
- **C460** _[tool-guidance · leaf-authored]_ **⚑high-impact** **PROGRAMME_SLUG_NOTE** — NOTE: Programme slugs are the full form - `<subject>-<phase>-year-<year>` plus any KS4 factor - e.g. `english-secondary-year-7` ... not the short `y7` shorthand `upstream-owned-base-text`
- **C461** _[tool-guidance · leaf-authored]_ **⚑high-impact** **TOOL_DESCRIPTION_ADDITIONS['get-key-stages-subject-assets'] narrowing sentence** — Narrow with `unit` and/or `type` (asset type), or use `get-lessons-assets` for one lesson.
- **C462** _[tool-guidance · leaf-authored]_ **⚑high-impact** **TOOL_DESCRIPTION_ADDITIONS['get-sequences-assets'] narrowing sentence** — Narrow with `year` and/or `type` (asset type), or use `get-lessons-assets` for one lesson.

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/contract/tool-descriptor.contract.ts</code> — 1</summary>

- **C685** _[tool-guidance · leaf-authored]_ **⚑high-impact** **requiresDomainContext contract field + doc-comment grounding guidance** — readonly requiresDomainContext: boolean;  // 'the model should ideally call get-curriculum-model before using this tool to understand the Oak curriculum structu `user-input-interpolation` `boundary-owner-call`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-changelog-latest.ts</code> — 2</summary>

- **C491** _[tool-title · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-changelog-latest annotations.title (+ tool name)** — name: 'get-changelog-latest'; annotations.title: "Get Changelog Latest" `upstream-owned-base-text`
- **C492** _[tool-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-changelog-latest description (base prose, noauth)** — Latest API version\n\nUse when you only need the current API version — e.g. a version banner or deployment check. Returns the most recent changelog entry. Not f `user-input-interpolation` `upstream-owned-base-text`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-changelog.ts</code> — 2</summary>

- **C495** _[tool-title · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-changelog annotations.title (+ tool name)** — name: 'get-changelog'; annotations.title: "Get Changelog" `upstream-owned-base-text`
- **C496** _[tool-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-changelog description (base prose, noauth)** — API changelog\n\nUse when you need the full history of API changes... Returns every changelog entry with version and date. Not for: the current version (GET /ch `user-input-interpolation` `upstream-owned-base-text`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-key-stages-subject-assets.ts</code> — 8</summary>

- **C499** _[tool-title · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-key-stages-subject-assets annotations.title (+ tool name)** — name: 'get-key-stages-subject-assets'; annotations.title: "Get Key Stages Subject Assets"
- **C500** _[tool-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-key-stages-subject-assets description (base prose)** — Downloadable assets by key stage and subject\n\nUse when you want every downloadable asset for a key stage + subject... Not for: assets across a sequence (GET / `user-input-interpolation` `upstream-owned-base-text`
- **C502** _[tool-guidance · leaf-authored]_ **⚑high-impact** **get-key-stages-subject-assets PREREQUISITE injection** — PREREQUISITE: You MUST call the `get-curriculum-model` tool first to understand the curriculum domain. `user-input-interpolation`
- **C503** _[tool-guidance · leaf-authored]_ **⚑high-impact** **get-key-stages-subject-assets NOTE download-asset/oakUrl injection** — NOTE: The asset `url` fields... are authenticated API endpoints and cannot be used as direct browser download links... call the `download-asset` tool... or the  `user-input-interpolation`
- **C505** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-key-stages-subject-assets param keyStage** — Key stage slug to filter by, e.g. 'ks2' - note that casing is important here, and should be lowercase (enum ks1,ks2,ks3,ks4) `upstream-owned-base-text`
- **C506** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-key-stages-subject-assets param subject** — Subject slug to search by, e.g. 'science' - note that casing is important here (always lowercase) (enum art..spanish, 17 values) `upstream-owned-base-text`
- **C507** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-key-stages-subject-assets param type** — Use the this type and the lesson slug in conjunction to get a signed download URL to the asset type from the /api/lessons/{slug}/assets/{type} endpoint (enum sl `upstream-owned-base-text` `possible-defect-reported`
- **C508** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-key-stages-subject-assets param unit** — Optional unit slug to additionally filter by `upstream-owned-base-text`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-key-stages-subject-lessons.ts</code> — 8</summary>

- **C511** _[tool-title · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-key-stages-subject-lessons annotations.title (+ tool name)** — name: 'get-key-stages-subject-lessons'; annotations.title: "Get Key Stages Subject Lessons"
- **C512** _[tool-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-key-stages-subject-lessons description (base prose)** — List lessons in a key stage and subject\n\nUse when you want every published lesson in a key stage + subject, grouped by unit... Supports offset/limit paginatio `user-input-interpolation` `upstream-owned-base-text`
- **C513** _[tool-guidance · leaf-authored]_ **⚑high-impact** **get-key-stages-subject-lessons PREREQUISITE injection** — PREREQUISITE: You MUST call the `get-curriculum-model` tool first to understand the curriculum domain. `user-input-interpolation`
- **C514** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-key-stages-subject-lessons param keyStage** — Key stage slug to filter by, e.g. 'ks2' - note that casing is important here, and should be lowercase (enum ks1..ks4) `upstream-owned-base-text`
- **C515** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-key-stages-subject-lessons param subject** — Subject slug to filter by, e.g. 'english' - note that casing is important here, and should be lowercase (enum art..spanish) `upstream-owned-base-text`
- **C516** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-key-stages-subject-lessons param unit** — Optional unit slug to additionally filter by `upstream-owned-base-text`
- **C517** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-key-stages-subject-lessons param offset** — Offset applied to lessons within each unit (not to the unit list). Default: 0 `upstream-owned-base-text`
- **C518** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-key-stages-subject-lessons param limit** — Limit the number of lessons returned per unit. Units with zero lessons after limiting are omitted. Default: 10 `upstream-owned-base-text`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-key-stages-subject-questions.ts</code> — 8</summary>

- **C521** _[tool-title · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-key-stages-subject-questions annotations.title (+ tool name)** — name: 'get-key-stages-subject-questions'; annotations.title: "Get Key Stages Subject Questions"
- **C522** _[tool-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-key-stages-subject-questions description (base prose)** — Quiz questions by key stage and subject\n\nUse when you want every quiz question for a key stage + subject... Returns lessons each with starter and exit quiz qu `upstream-owned-base-text`
- **C523** _[tool-guidance · leaf-authored]_ **⚑high-impact** **get-key-stages-subject-questions PREREQUISITE injection** — PREREQUISITE: You MUST call the `get-curriculum-model` tool first to understand the curriculum domain. `user-input-interpolation`
- **C524** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-key-stages-subject-questions param keyStage** — Key stage slug to filter by, e.g. 'ks2' - note that casing is important here, and should be lowercase (enum ks1..ks4) `upstream-owned-base-text`
- **C525** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-key-stages-subject-questions param subject** — Subject slug to search by, e.g. 'science' - note that casing is important here (enum art..spanish) `upstream-owned-base-text`
- **C526** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-key-stages-subject-questions param offset** — If limiting results returned, this allows you to return the next set of results, starting at the given offset point Default: 0 `upstream-owned-base-text`
- **C527** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-key-stages-subject-questions param limit** — Limit the number of lessons, e.g. return a maximum of 100 lessons Default: 10 `upstream-owned-base-text`
- **C528** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-key-stages-subject-questions param filter** — Optional filter for question results. Use `images` to return only questions with a question image or image answer. (enum images) `upstream-owned-base-text`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-key-stages-subject-units.ts</code> — 5</summary>

- **C531** _[tool-title · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-key-stages-subject-units annotations.title (+ tool name)** — name: 'get-key-stages-subject-units'; annotations.title: "Get Key Stages Subject Units"
- **C532** _[tool-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-key-stages-subject-units description (base prose)** — Units in a key stage and subject\n\nUse when you want a flat list of every unit with published lessons... Pass examBoard to restrict KS4 (one of: aqa, edexcel ( `upstream-owned-base-text`
- **C533** _[tool-guidance · leaf-authored]_ **⚑high-impact** **get-key-stages-subject-units PREREQUISITE injection** — PREREQUISITE: You MUST call the `get-curriculum-model` tool first to understand the curriculum domain. `user-input-interpolation`
- **C534** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-key-stages-subject-units param keyStage** — Key stage slug to filter by, e.g. 'ks2' (enum ks1..ks4) `upstream-owned-base-text`
- **C535** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-key-stages-subject-units param subject** — Subject slug to search by, e.g. 'science' - note that casing is important here (always lowercase) (enum art..spanish) `upstream-owned-base-text`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-key-stages.ts</code> — 3</summary>

- **C538** _[tool-title · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-key-stages annotations.title (+ tool name)** — name: 'get-key-stages'; annotations.title: "Get Key Stages"
- **C539** _[tool-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-key-stages description (base prose)** — All key stages\n\nUse when you need the master list of key stages. Returns every key stage with its title and slug. Not for: key stages restricted to a subject  `upstream-owned-base-text`
- **C540** _[tool-guidance · leaf-authored]_ **⚑high-impact** **get-key-stages PREREQUISITE injection** — PREREQUISITE: You MUST call the `get-curriculum-model` tool first to understand the curriculum domain. `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-keywords.ts</code> — 4</summary>

- **C543** _[tool-title · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-keywords annotations.title (+ tool name)** — name: 'get-keywords'; annotations.title: "Get Keywords"
- **C544** _[tool-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-keywords description (base prose)** — Keywords by subject and key stage\n\nUse when you want the vocabulary for a key stage, subject, unit, lesson, or phase... All filters are optional, but pass at  `user-input-interpolation` `upstream-owned-base-text`
- **C545** _[tool-guidance · leaf-authored]_ **⚑high-impact** **get-keywords PREREQUISITE injection** — PREREQUISITE: You MUST call the `get-curriculum-model` tool first to understand the curriculum domain. `user-input-interpolation`
- **C546** _[tool-guidance · leaf-authored]_ **⚑high-impact** **get-keywords WHEN-TO-PREFER injection** — WHEN TO PREFER WHICH KEYWORDS TOOL: this tool returns the LIVE full keyword set for a key stage + subject... prefer get-keyword-graph, which serves a point-in-t `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-lessons-assets.ts</code> — 6</summary>

- **C549** _[tool-title · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-lessons-assets annotations.title (+ tool name)** — name: 'get-lessons-assets'; annotations.title: "Get Lessons Assets"
- **C550** _[tool-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-lessons-assets description (base prose)** — Downloadable assets for a lesson\n\nUse when you have a lesson slug and need the list of what's downloadable. Returns every available asset type with a signed d `upstream-owned-base-text`
- **C552** _[tool-guidance · leaf-authored]_ **⚑high-impact** **get-lessons-assets PREREQUISITE injection** — PREREQUISITE: You MUST call the `get-curriculum-model` tool first to understand the curriculum domain. `user-input-interpolation`
- **C553** _[tool-guidance · leaf-authored]_ **⚑high-impact** **get-lessons-assets NOTE download-asset/oakUrl injection** — NOTE: The asset `url` fields... are authenticated API endpoints and cannot be used as direct browser download links... call the `download-asset` tool... or the  `user-input-interpolation`
- **C554** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-lessons-assets param lesson** — The lesson slug identifier (example: child-workers-in-the-victorian-era) `upstream-owned-base-text`
- **C555** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-lessons-assets param type** — Use the this type and the lesson slug in conjunction to get a signed download URL to the asset type from the /api/lessons/{slug}/assets/{type} endpoint (enum sl `upstream-owned-base-text` `possible-defect-reported`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-lessons-quiz.ts</code> — 5</summary>

- **C558** _[tool-title · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-lessons-quiz annotations.title (+ tool name)** — name: 'get-lessons-quiz'; annotations.title: "Get Lessons Quiz"
- **C559** _[tool-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-lessons-quiz description (base prose)** — Quiz questions for a lesson\n\nUse when you have a lesson slug and need its starter and exit quiz questions with correct answers marked. Returns two arrays, sta `upstream-owned-base-text`
- **C560** _[tool-guidance · leaf-authored]_ **⚑high-impact** **get-lessons-quiz PREREQUISITE injection** — PREREQUISITE: You MUST call the `get-curriculum-model` tool first to understand the curriculum domain. `user-input-interpolation`
- **C561** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-lessons-quiz param lesson** — The lesson slug identifier (example: imagining-you-are-the-characters-the-three-billy-goats-gruff) `upstream-owned-base-text`
- **C562** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-lessons-quiz param filter** — Optional filter for question results. Use `images` to return only questions with a question image or image answer. (enum images) `upstream-owned-base-text`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-lessons-summary.ts</code> — 4</summary>

- **C565** _[tool-title · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-lessons-summary annotations.title (+ tool name)** — name: 'get-lessons-summary'; annotations.title: "Get Lessons Summary"
- **C566** _[tool-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-lessons-summary description (base prose)** — Lesson summary by slug\n\nUse when you have a lesson slug and need its full metadata: title, key stage, subject, unit, keywords, key learning points, misconcept `upstream-owned-base-text`
- **C567** _[tool-guidance · leaf-authored]_ **⚑high-impact** **get-lessons-summary PREREQUISITE injection** — PREREQUISITE: You MUST call the `get-curriculum-model` tool first to understand the curriculum domain. `user-input-interpolation`
- **C568** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-lessons-summary param lesson** — The slug of the lesson (example: joining-using-and) `upstream-owned-base-text`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-lessons-transcript.ts</code> — 4</summary>

- **C571** _[tool-title · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-lessons-transcript annotations.title (+ tool name)** — name: 'get-lessons-transcript'; annotations.title: "Get Lessons Transcript"
- **C572** _[tool-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-lessons-transcript description (base prose)** — Lesson video transcript\n\nUse when you have a lesson slug and need the video transcript — for accessibility, captioning, or text analysis. Returns the transcri `upstream-owned-base-text`
- **C573** _[tool-guidance · leaf-authored]_ **⚑high-impact** **get-lessons-transcript PREREQUISITE injection** — PREREQUISITE: You MUST call the `get-curriculum-model` tool first to understand the curriculum domain. `user-input-interpolation`
- **C574** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-lessons-transcript param lesson** — The slug of the lesson (example: checking-understanding-of-basic-transformations) `upstream-owned-base-text`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-programmes-assets.ts</code> — 8</summary>

- **C577** _[tool-title · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-programmes-assets annotations.title (+ tool name)** — name: 'get-programmes-assets'; annotations.title: "Get Programmes Assets"
- **C578** _[tool-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-programmes-assets description (base prose)** — Downloadable assets in a programme\n\nUse when you need every downloadable asset for a single programme (year group) within a subject. Returns assets grouped by `upstream-owned-base-text`
- **C580** _[tool-guidance · leaf-authored]_ **⚑high-impact** **get-programmes-assets PREREQUISITE injection** — PREREQUISITE: You MUST call the `get-curriculum-model` tool first to understand the curriculum domain. `user-input-interpolation`
- **C581** _[tool-guidance · leaf-authored]_ **⚑high-impact** **get-programmes-assets NOTE download-asset/oakUrl injection** — NOTE: The asset `url` fields... are authenticated API endpoints and cannot be used as direct browser download links... call the `download-asset` tool... or the  `user-input-interpolation`
- **C582** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-programmes-assets param programme** — The programme slug identifier (example: computing-secondary-year-7) `upstream-owned-base-text`
- **C583** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-programmes-assets param offset** — If limiting results returned, this allows you to return the next set of results, starting at the given offset point Default: 0 `upstream-owned-base-text`
- **C584** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-programmes-assets param limit** — Limit the number of lessons, e.g. return a maximum of 100 lessons Default: 10 `upstream-owned-base-text`
- **C585** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-programmes-assets param type** — Use the this type and the lesson slug in conjunction to get a signed download URL... /api/lessons/{slug}/assets/{type} endpoint (enum slideDeck..worksheetAnswer `upstream-owned-base-text` `possible-defect-reported`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-programmes-questions.ts</code> — 7</summary>

- **C588** _[tool-title · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-programmes-questions annotations.title (+ tool name)** — name: 'get-programmes-questions'; annotations.title: "Get Programmes Questions"
- **C589** _[tool-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-programmes-questions description (base prose)** — Quiz questions in a programme\n\nUse when you want every quiz question in a single programme (year group) within a subject. Get programme slugs from GET /subjec `upstream-owned-base-text`
- **C590** _[tool-guidance · leaf-authored]_ **⚑high-impact** **get-programmes-questions PREREQUISITE injection** — PREREQUISITE: You MUST call the `get-curriculum-model` tool first to understand the curriculum domain. `user-input-interpolation`
- **C591** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-programmes-questions param programme** — The programme slug identifier (example: computing-secondary-year-7) `upstream-owned-base-text`
- **C592** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-programmes-questions param offset** — If limiting results returned, this allows you to return the next set of results, starting at the given offset point Default: 0 `upstream-owned-base-text`
- **C593** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-programmes-questions param limit** — Limit the number of lessons, e.g. return a maximum of 100 lessons Default: 10 `upstream-owned-base-text`
- **C594** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-programmes-questions param filter** — Optional filter for question results. Use `images` to return only questions with a question image or image answer. (enum images) `upstream-owned-base-text`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-programmes-units.ts</code> — 4</summary>

- **C597** _[tool-title · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-programmes-units annotations.title (+ tool name)** — name: 'get-programmes-units'; annotations.title: "Get Programmes Units"
- **C598** _[tool-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-programmes-units description (base prose)** — Units in a programme\n\nUse when you need the unit sequence for one programme — units as an ordered arrangement designed to build knowledge progressively. Get p `upstream-owned-base-text`
- **C599** _[tool-guidance · leaf-authored]_ **⚑high-impact** **get-programmes-units PREREQUISITE injection** — PREREQUISITE: You MUST call the `get-curriculum-model` tool first to understand the curriculum domain. `user-input-interpolation`
- **C600** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-programmes-units param programme** — The programme slug identifier (example: english-secondary-year-10-edexcel) `upstream-owned-base-text`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-programmes.ts</code> — 3</summary>

- **C603** _[tool-title · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **name / annotations.title** — name: "get-programmes"; annotations.title: "Get Programmes" `user-input-interpolation`
- **C604** _[tool-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **description** — Get a programme by slug\n\nUse when you need to get the metadata of one programme... PREREQUISITE: You MUST call the `get-curriculum-model` tool first... NOTE:  `user-input-interpolation` `upstream-owned-base-text`
- **C605** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **params.programme.describe** — programme: "The programme slug identifier" (example: english-secondary-year-10-edexcel) `upstream-owned-base-text`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-rate-limit.ts</code> — 2</summary>

- **C608** _[tool-title · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **name / annotations.title** — name: "get-rate-limit"; annotations.title: "Get Rate Limit"
- **C609** _[tool-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **description** — Current rate-limit status\n\nUse when you need rate-limit status as a JSON body... Does not count against your quota.\n\nNOTE: A response of limit=0, remaining= `user-input-interpolation` `upstream-owned-base-text`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-sequences-assets.ts</code> — 5</summary>

- **C612** _[tool-title · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **name / annotations.title** — name: "get-sequences-assets"; annotations.title: "Get Sequences Assets"
- **C613** _[tool-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **description** — Downloadable assets in a sequence... Attribution required — see https://open-api.thenational.academy/docs/about-oaks-api/terms... PREREQUISITE... NOTE: The asse `user-input-interpolation` `upstream-owned-base-text`
- **C614** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **params.sequence.describe** — sequence: "The sequence slug identifier, including the key stage 4 option where relevant." (example: english-primary) `upstream-owned-base-text`
- **C615** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **params.year.describe** — year: "The year group to filter by. For the physical-education-primary sequence, a value of all-years can also be used." `upstream-owned-base-text`
- **C616** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **params.type.describe** — type: "Optional asset type specifier\n\nAvailable values: slideDeck, exitQuiz, exitQuizAnswers, starterQuiz, starterQuizAnswers, supplementaryResource, video, w `upstream-owned-base-text`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-sequences-questions.ts</code> — 7</summary>

- **C619** _[tool-title · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **name / annotations.title** — name: "get-sequences-questions"; annotations.title: "Get Sequences Questions"
- **C620** _[tool-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **description** — Quiz questions across a sequence... Supports offset and limit; Link: rel="next" header signals more pages... PREREQUISITE: You MUST call the `get-curriculum-mod `user-input-interpolation` `upstream-owned-base-text`
- **C621** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **params.sequence.describe** — sequence: "The sequence slug identifier, including the key stage 4 option where relevant." `upstream-owned-base-text`
- **C622** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **params.year.describe** — year: "The year group to filter by. For the physical-education-primary sequence, a value of all-years can also be used." `upstream-owned-base-text`
- **C623** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **params.offset.describe** — offset: "If limiting results returned, this allows you to return the next set of results, starting at the given offset point" (default 0) `upstream-owned-base-text`
- **C624** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **params.limit.describe** — limit: "Limit the number of lessons, e.g. return a maximum of 100 lessons" (default 10) `upstream-owned-base-text` `possible-defect-reported`
- **C625** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **params.filter.describe** — filter: "Optional filter for question results. Use `images` to return only questions with a question image or image answer." `upstream-owned-base-text`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-sequences-units.ts</code> — 4</summary>

- **C628** _[tool-title · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **name / annotations.title** — name: "get-sequences-units"; annotations.title: "Get Sequences Units"
- **C629** _[tool-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **description** — Units in a curriculum sequence... If the sequence slug includes an exam board (e.g. science-secondary-aqa)... Example: sequence=science-secondary-aqa or maths-p `user-input-interpolation` `upstream-owned-base-text`
- **C630** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **params.sequence.describe** — sequence: "The sequence slug identifier, including the key stage 4 option where relevant." `upstream-owned-base-text`
- **C631** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **params.year.describe** — year: "The year group to filter by. For the physical-education-primary sequence, a value of all-years can also be used." `upstream-owned-base-text`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-sequences.ts</code> — 3</summary>

- **C634** _[tool-title · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **name / annotations.title** — name: "get-sequences"; annotations.title: "Get Sequences"
- **C635** _[tool-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **description** — Sequencing information for a given sequence slug... A sequence is a subject's curriculum across a phase (e.g. maths-primary, science-secondary-aqa)... PREREQUIS `user-input-interpolation` `upstream-owned-base-text`
- **C636** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **params.sequence.describe** — sequence: "The sequence slug identifier" (example: english-secondary) `upstream-owned-base-text`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-subject-detail.ts</code> — 3</summary>

- **C639** _[tool-title · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **name / annotations.title** — name: "get-subject-detail"; annotations.title: "Get Subject Detail"
- **C640** _[tool-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **description** — Single subject with sequences, key stages, and years... Returns subjectTitle, subjectSlug, sequenceSlugs, keyStages, and years... PREREQUISITE: You MUST call... `user-input-interpolation` `upstream-owned-base-text`
- **C641** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **params.subject.describe** — subject: "The slug identifier for the subject" enum: art,citizenship,computing,...,science,spanish (example: art) `upstream-owned-base-text`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-subjects-key-stages.ts</code> — 3</summary>

- **C644** _[tool-title · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **name / annotations.title** — name: "get-subjects-key-stages"; annotations.title: "Get Subjects Key Stages"
- **C645** _[tool-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **description** — Key stages for a subject... Returns key-stage titles and slugs. Not for: every key stage (GET /key-stages)... Example: 'subject=history'. PREREQUISITE: You MUST `user-input-interpolation` `upstream-owned-base-text`
- **C646** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **params.subject.describe** — subject: "The subject slug identifier" enum: art,...,spanish (example: art) `upstream-owned-base-text`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-subjects-programmes.ts</code> — 3</summary>

- **C649** _[tool-title · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **name / annotations.title** — name: "get-subjects-programmes"; annotations.title: "Get Subjects Programmes"
- **C650** _[tool-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **description** — Get all programmes for a subject slug... Returns programmes grouped by key stage... PREREQUISITE... NOTE: Programme slugs are the full form — `<subject>-<phase> `user-input-interpolation` `upstream-owned-base-text`
- **C651** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **params.subject.describe** — subject: "The subject slug identifier" enum: art,...,spanish (example: english) `upstream-owned-base-text`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-subjects-years.ts</code> — 3</summary>

- **C654** _[tool-title · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **name / annotations.title** — name: "get-subjects-years"; annotations.title: "Get Subjects Years"
- **C655** _[tool-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **description** — Year groups for a subject... Returns an array of year numbers, derived from the subject's key stages... Example: 'subject=english'. PREREQUISITE: You MUST call. `user-input-interpolation` `upstream-owned-base-text`
- **C656** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **params.subject.describe** — subject: "Subject slug to filter by" enum: art,...,spanish (example: cooking-nutrition) `upstream-owned-base-text`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-subjects.ts</code> — 2</summary>

- **C659** _[tool-title · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **name / annotations.title** — name: "get-subjects"; annotations.title: "Get Subjects"
- **C660** _[tool-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **description** — All subjects\n\nUse when you need every subject in one call — the entry point for a subject picker or for crawling the whole curriculum... PREREQUISITE: You MUS `user-input-interpolation` `upstream-owned-base-text`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-threads-units.ts</code> — 3</summary>

- **C663** _[tool-title · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **name / annotations.title** — name: "get-threads-units"; annotations.title: "Get Threads Units"
- **C664** _[tool-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **description** — Units in a thread... A thread is an attribute on a unit that groups units across the curriculum... thread order is independent of unit sequence order... PREREQU `user-input-interpolation` `upstream-owned-base-text`
- **C665** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **params.thread (no describe; example only)** — thread: (no description) example: number-multiplication-and-division; maps to path param threadSlug

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-threads.ts</code> — 2</summary>

- **C668** _[tool-title · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **name / annotations.title** — name: "get-threads"; annotations.title: "Get Threads"
- **C669** _[tool-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **description** — All threads\n\nUse when you want the catalogue of every thread. A thread is an attribute on a unit that groups units across the curriculum... making vertical co `user-input-interpolation` `upstream-owned-base-text`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-units-summary.ts</code> — 3</summary>

- **C672** _[tool-title · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **name / annotations.title** — name: "get-units-summary"; annotations.title: "Get Units Summary"
- **C673** _[tool-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **description** — Unit summary by slug... title, description, key stage, subject, year, threads, prior-knowledge requirements, national-curriculum statements... Unit variant slug `user-input-interpolation` `upstream-owned-base-text`
- **C674** _[tool-param-description · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **params.unit.describe** — unit: "The unit slug" (example: programming-subroutines); examBoard/pathway/tier/childSubject: enum-only, no description `upstream-owned-base-text`

</details>

### recovery-copy — 151 items

What the agent receives on failure/empty — validation errors, empty-state, degradation. Shapes whether it recovers or fabricates.

<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/asset-download/asset-download-route.ts</code> — 6</summary>

- **C693** _[error-message · leaf-authored]_ **⚑high-impact** **validateRequestParams 'Missing lesson parameter'** — 'Missing lesson parameter'
- **C694** _[error-message · leaf-authored]_ **⚑high-impact** **validateRequestParams 'Invalid asset type'** — 'Invalid asset type'
- **C695** _[error-message · leaf-authored]_ **⚑high-impact** **validateRequestParams 'Invalid sig parameter'** — 'Invalid sig parameter'
- **C696** _[error-message · leaf-authored]_ **⚑high-impact** **validateRequestParams 'Invalid exp parameter'** — 'Invalid exp parameter'
- **C697** _[empty-or-refusal-copy · leaf-authored]_ **⚑high-impact** **403 signature-rejection reason (result.reason)** — res.status(403).json({ error: result.reason }) // reason: 'Download link has expired' \| 'Invalid signature'
- **C698** _[rate-limit-or-degradation-message · leaf-authored]_ **⚑high-impact** **'Proxy error'** — res.status(502).json({ error: 'Proxy error' })

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/asset-download/asset-proxy.ts</code> — 3</summary>

- **C699** _[rate-limit-or-degradation-message · leaf-authored]_ **⚑high-impact** **'Download stream error'** — res.status(502).json({ error: 'Download stream error' })
- **C700** _[rate-limit-or-degradation-message · leaf-authored]_ **⚑high-impact** **'Upstream error'** — res.status(502).json({ error: 'Upstream error' })
- **C701** _[rate-limit-or-degradation-message · leaf-authored]_ **⚑high-impact** **'Upstream response has no body'** — res.status(502).json({ error: 'Upstream response has no body' })

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/auth-error-response.ts</code> — 1</summary>

- **C687** _[error-message · leaf-authored]_ **⚑high-impact** **AuthErrorResponse.content text** — Authentication Error: ${description}

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/auth-routes.ts</code> — 1</summary>

- **C705** _[empty-or-refusal-copy · leaf-authored]_ **⚑high-impact** **servePrm 403 { error:'forbidden', error_description }** — res.status(403).json({ error: 'forbidden', error_description: msg })

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/auth/mcp-auth/mcp-auth.ts</code> — 2</summary>

- **C399** _[error-message · leaf-authored]_ **⚑high-impact** **unknown-validation-error-fallback** — validation.reason ?? 'Unknown validation error'
- **C400** _[error-message · leaf-authored]_ **⚑high-impact** **handleAuthError-forbidden** — res.status(403).json({ error: 'Forbidden' })

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/host-validation-error.ts</code> — 3</summary>

- **C702** _[empty-or-refusal-copy · leaf-authored]_ **⚑high-impact** **hostValidationErrorMessage missing_host** — Cannot generate OAuth metadata: missing host header
- **C703** _[empty-or-refusal-copy · leaf-authored]_ **⚑high-impact** **hostValidationErrorMessage invalid_format** — Rejected Host header '${error.host}': invalid host header format `pii-adjacent`
- **C704** _[empty-or-refusal-copy · leaf-authored]_ **⚑high-impact** **hostValidationErrorMessage not_allowed** — Rejected Host header '${error.hostname}': not in allowed hosts list

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/oauth-proxy/oauth-proxy-handlers.ts</code> — 1</summary>

- **C401** _[rate-limit-or-degradation-message · leaf-authored]_ **⚑high-impact** **respondProxyError-upstream-unavailable** — formatProxyErrorResponse('temporarily_unavailable', 'Upstream authorization server is not responding')

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/oauth-proxy/oauth-proxy-response.ts</code> — 3</summary>

- **C402** _[error-message · leaf-authored]_ **⚑high-impact** **readUpstreamBody-body-read-error** — formatProxyErrorResponse('server_error', 'Could not read upstream response body')
- **C403** _[error-message · leaf-authored]_ **⚑high-impact** **parseJsonBody-malformed-json** — formatProxyErrorResponse('server_error', 'Upstream returned malformed JSON')
- **C405** _[error-message · leaf-authored]_ **⚑high-impact** **mapNonJsonSuccessAsError** — formatProxyErrorResponse('server_error', 'Upstream returned non-JSON success body')

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/oauth-proxy/oauth-proxy-routes.ts</code> — 1</summary>

- **C406** _[error-message · leaf-authored]_ **⚑high-impact** **asyncRoute-internal-proxy-error** — res.status(500).json(formatProxyErrorResponse('server_error', 'Internal proxy error'))

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/rate-limiting/rate-limit-profiles.ts</code> — 4</summary>

- **C409** _[rate-limit-or-degradation-message · leaf-authored]_ **⚑high-impact** **MCP_RATE_LIMIT.message** — { error: 'Too Many Requests', message: 'Rate limit exceeded. Try again later.' }
- **C410** _[rate-limit-or-degradation-message · leaf-authored]_ **⚑high-impact** **OAUTH_RATE_LIMIT.message** — { error: 'too_many_requests', error_description: 'Rate limit exceeded. Try again later.' }
- **C411** _[rate-limit-or-degradation-message · leaf-authored]_ **⚑high-impact** **METADATA_RATE_LIMIT.message** — { error: 'too_many_requests', error_description: 'Rate limit exceeded. Try again later.' }
- **C412** _[rate-limit-or-degradation-message · leaf-authored]_ **⚑high-impact** **ASSET_RATE_LIMIT.message** — { error: 'Too Many Requests', message: 'Rate limit exceeded. Try again later.' }

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/register-resources.ts</code> — 1</summary>

- **C336** _[empty-or-refusal-copy · authored-template]_ **⚑high-impact** **documentation resource fallback 'Content not found' template** — text: content ?? `# ${resource.title}\n\nContent not found.` `user-input-interpolation`

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/widget/src/App.tsx</code> — 2</summary>

- **C386** _[error-message · leaf-authored]_ **⚑high-impact** **openLink failure fallback message** — openLinkError instanceof Error ? openLinkError.message : 'Host link opening failed'
- **C387** _[error-message · leaf-authored]_ **⚑high-impact** **styling sync failure fallback message** — error instanceof Error ? error.message : 'Host styling synchronisation failed'

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/widget/src/app-runtime-state.ts</code> — 1</summary>

- **C389** _[error-message · leaf-authored]_ **⚑high-impact** **safe-dispatch failure fallback template** — error instanceof Error ? error.message : `Dispatch failed for action "${action.type}"` `user-input-interpolation`

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/widget/src/main.tsx</code> — 1</summary>

- **C388** _[error-message · leaf-authored]_ **⚑high-impact** **root-element-missing mount error** — throw new Error('Root element #root not found — MCP App cannot mount');

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-asset-download/download-token.ts</code> — 2</summary>

- **C170** _[error-message · leaf-authored]_ **⚑high-impact** **validateDownloadSignature expired reason** — reason: 'Download link has expired'
- **C171** _[error-message · leaf-authored]_ **⚑high-impact** **validateDownloadSignature invalid-signature reason (x2)** — reason: 'Invalid signature'  (returned for both hex-length mismatch and timingSafeEqual failure) `possible-defect-reported`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-asset-download/execution.ts</code> — 2</summary>

- **C168** _[error-message · authored-template]_ **⚑high-impact** **validateDownloadAssetArgs invalid-field error** — Invalid "${field}": ${firstIssue?.message ?? 'validation failed'} `user-input-interpolation`
- **C169** _[error-message · authored-template]_ **⚑high-impact** **validateDownloadAssetArgs invalid-type error** — Missing or invalid "type" — expected one of: ${ASSET_TYPES.join(', ')} `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-browse/execution.ts</code> — 2</summary>

- **C142** _[error-message · authored-template]_ **⚑high-impact** **browse error template** — formatError(`Browse error: ${result.error.message} (${result.error.type})`) `user-input-interpolation`
- **C143** _[error-message · leaf-authored]_ **⚑high-impact** **unexpected-shape error** — formatError('Unexpected response shape from fetchSequenceFacets')

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-browse/formatting.ts</code> — 1</summary>

- **C145** _[empty-or-refusal-copy · authored-template]_ **⚑high-impact** **buildBrowseSummary empty case** — `No curriculum programmes found${filterText}. Try broader filters or no filters to see everything.` `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-browse/validation.ts</code> — 4</summary>

- **C147** _[error-message · leaf-authored]_ **⚑high-impact** **keyStage validation error** — 'keyStage must be one of ks1, ks2, ks3, ks4'
- **C148** _[error-message · leaf-authored]_ **⚑high-impact** **subject validation error** — 'subject must be a recognised subject slug'
- **C149** _[error-message · leaf-authored]_ **⚑high-impact** **browse input-type error** — 'browse-curriculum expects an object input or no arguments'
- **C150** _[error-message · leaf-authored]_ **⚑high-impact** **browse invalid-input fallback** — parsed.error.issues[0]?.message ?? 'Invalid browse input'

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-explore/execution.ts</code> — 2</summary>

- **C111** _[error-message · authored-template]_ **⚑high-impact** **searchScope error templates (Lessons/Units/Threads)** — `${scopeName} search failed: ${result.error?.message ?? 'unknown error'}` / `${scopeName} search error: ${message}` `user-input-interpolation`
- **C112** _[error-message · authored-template]_ **⚑high-impact** **runExploreTool all-failed error** — formatError(`All searches failed: ${errors}`) `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-explore/formatting.ts</code> — 1</summary>

- **C107** _[empty-or-refusal-copy · authored-template]_ **⚑high-impact** **buildTopicMapSummary (empty branch)** — `No content found for "${topic}". Try different terms or check available subjects with browse-curriculum.` `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-explore/validation.ts</code> — 5</summary>

- **C113** _[error-message · leaf-authored]_ **⚑high-impact** **explore query-required error** — 'explore-topic requires a non-empty query'
- **C114** _[error-message · leaf-authored]_ **⚑high-impact** **explore keyStage narrow error** — 'keyStage must be one of ks1, ks2, ks3, ks4'
- **C115** _[error-message · leaf-authored]_ **⚑high-impact** **explore subject narrow error** — 'subject must be a recognised subject slug'
- **C116** _[error-message · leaf-authored]_ **⚑high-impact** **explore non-object input error** — 'explore-topic expects an object input with a query field'
- **C117** _[error-message · leaf-authored]_ **⚑high-impact** **explore invalid-input fallback** — parsed.error.issues[0]?.message ?? 'Invalid explore input'

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-fetch/execution.ts</code> — 4</summary>

- **C154** _[error-message · leaf-authored]_ **⚑high-impact** **fetch id-required validation message** — 'fetch requires an "id" string'
- **C155** _[error-message · leaf-authored]_ **⚑high-impact** **fetch input-type error** — 'fetch expects a string or object input'
- **C156** _[error-message · authored-template]_ **⚑high-impact** **unsupported-id-prefix error** — formatError(`Unsupported id prefix in ${args.id}`) `user-input-interpolation`
- **C159** _[error-message · authored-template]_ **⚑high-impact** **unsupported-content-type error** — err(new McpParameterError('fetch', `Unsupported content type: ${String(type)}`)) `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-keyword-graph.ts</code> — 2</summary>

- **C229** _[empty-or-refusal-copy · authored-template]_ **⚑high-impact** **summariseKeywords (empty)** — No keywords matched ${subject} at ${keyStage}${narrowed ? ' with the given narrowing' : ''}. `user-input-interpolation`
- **C230** _[error-message · authored-template]_ **⚑high-impact** **runKeywordGraphTool errors** — Invalid get-keyword-graph limit: ${String(result.error.limit)} (must be an integer in [1, ${String(result.error.maxLimit)}]) `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-misconception-graph.ts</code> — 2</summary>

- **C240** _[error-message · authored-template]_ **⚑high-impact** **MISCONCEPTION_INPUT_VALIDATED superRefine messages** — exactly one anchor mode is required (lessonSlugs, unitSlugs, or threadSlug); received ${String(anchorModes)} `user-input-interpolation`
- **C241** _[error-message · authored-template]_ **⚑high-impact** **runMisconceptionGraphTool errors** — get-misconception-graph failed: ${result.error.kind} — window offset ${...}, limit ${...} (maximum ${...}).

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-prior-knowledge-graph.ts</code> — 1</summary>

- **C251** _[error-message · authored-template]_ **⚑high-impact** **runPriorKnowledgeGraphTool errors** — get-prior-knowledge-graph failed: ${error.kind} — requested depth ${...} exceeds the view limit ${...}.

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-search/execution.ts</code> — 2</summary>

- **C091** _[error-message · authored-template]_ **⚑high-impact** **formatRetrievalError (error-message family)** — Elasticsearch error: ${error.message}${suffix} \| Search timed out: … \| Invalid search parameters: … \| Unexpected search error: … `user-input-interpolation`
- **C092** _[error-message · authored-template]_ **⚑high-impact** **dispatchByScope exhaustiveness throw** — Unhandled search scope: ${String(exhaustive)}

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-search/formatting.ts</code> — 2</summary>

- **C086** _[empty-or-refusal-copy · authored-template]_ **⚑high-impact** **buildSearchSummary (zero-result copy)** — No ${plural} found for "${query}". Try broadening your search or using a different scope. `user-input-interpolation`
- **C088** _[empty-or-refusal-copy · authored-template]_ **⚑high-impact** **buildSuggestSummary (zero-result copy)** — No suggestions found for "${prefix}" `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-search/validation.ts</code> — 7</summary>

- **C093** _[error-message · leaf-authored]_ **⚑high-impact** **SearchSdkObjectSchema.scope error** — scope is required
- **C094** _[error-message · leaf-authored]_ **⚑high-impact** **SearchSdkObjectSchema.refine (query/threads) message** — search requires a non-empty query (threads scope can omit query when subject or keyStage filter is provided)
- **C095** _[error-message · leaf-authored]_ **⚑high-impact** **normaliseKeyStage error** — keyStage must be one of ks1, ks2, ks3, ks4
- **C096** _[error-message · leaf-authored]_ **⚑high-impact** **normaliseSubject error** — subject must be a recognised subject slug
- **C097** _[error-message · authored-template]_ **⚑high-impact** **narrowEnums scope error** — scope must be one of: ${SEARCH_SCOPES.join(', ')} `user-input-interpolation`
- **C098** _[error-message · leaf-authored]_ **⚑high-impact** **validateSearchSdkArgs non-object error** — search expects an object input with query and scope fields
- **C099** _[error-message · leaf-authored]_ **⚑high-impact** **validateSearchSdkArgs fallback error** — Invalid search input

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-thread-progressions.ts</code> — 2</summary>

- **C257** _[error-message · leaf-authored]_ **⚑high-impact** **THREAD_PROGRESSIONS_INPUT_VALIDATED superRefine messages** — exactly one anchor mode is required: threadSlug, OR subject + keyStage (both together)
- **C260** _[error-message · leaf-authored]_ **⚑high-impact** **runThreadProgressionsTool errors / invariant breach** — get-thread-progressions invariant breach: discovery anchor missing subject or keyStage after validated parse

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-user-search/validation.ts</code> — 7</summary>

- **C130** _[error-message · leaf-authored]_ **⚑high-impact** **user-search query-required error** — z.string({ error: 'query is required' })
- **C131** _[error-message · leaf-authored]_ **⚑high-impact** **user-search scope-required error** — z.string({ error: 'scope is required' })
- **C132** _[error-message · leaf-authored]_ **⚑high-impact** **user-search keyStage error (duplicate of explore)** — 'keyStage must be one of ks1, ks2, ks3, ks4'
- **C133** _[error-message · leaf-authored]_ **⚑high-impact** **user-search subject error (duplicate of explore)** — 'subject must be a recognised subject slug'
- **C134** _[error-message · authored-template]_ **⚑high-impact** **user-search scope-enum error** — `scope must be one of: ${USER_SEARCH_SCOPES.join(', ')}` `user-input-interpolation`
- **C135** _[error-message · leaf-authored]_ **⚑high-impact** **user-search non-object input error** — 'user-search expects an object input with query and scope'
- **C136** _[error-message · leaf-authored]_ **⚑high-impact** **user-search invalid-input fallback** — firstIssue?.message ?? 'Invalid user search input'

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/classify-error-response.ts</code> — 7</summary>

- **C306** _[error-message · leaf-authored]_ **⚑high-impact** **UPSTREAM_MESSAGE_PREFIX.CONTENT_NOT_AVAILABLE** — 'Resource unavailable due to copyright restrictions. The original may be viewed at www.thenational.academy'
- **C307** _[error-message · leaf-authored]_ **⚑high-impact** **UPSTREAM_MESSAGE_PREFIX.UPSTREAM_SERVER_ERROR** — UPSTREAM_SERVER_ERROR: 'Upstream server error'
- **C308** _[error-message · leaf-authored]_ **⚑high-impact** **UPSTREAM_MESSAGE_PREFIX.UPSTREAM_API_ERROR** — UPSTREAM_API_ERROR: 'Upstream API error'
- **C309** _[error-message · leaf-authored]_ **⚑high-impact** **classifyDocumentedErrorResponse 401 fallback message** — new McpToolError(message ?? 'Authentication required', toolName, { code: 'AUTHENTICATION_REQUIRED' ... })
- **C310** _[error-message · leaf-authored]_ **⚑high-impact** **classifyDocumentedErrorResponse 404 fallback message** — new McpToolError(message ?? 'Resource not found', toolName, { code: 'RESOURCE_NOT_FOUND' ... })
- **C311** _[error-message · authored-template]_ **⚑high-impact** **classifyDocumentedErrorResponse other-4xx template** — message ?? `Upstream API error (${String(httpStatus)})` `user-input-interpolation`
- **C313** _[error-message · leaf-authored]_ **⚑high-impact** **DocumentedErrorCode / UpstreamErrorCode vocabulary** — RESOURCE_NOT_FOUND \| AUTHENTICATION_REQUIRED \| CONTENT_NOT_AVAILABLE \| UPSTREAM_API_ERROR (+ UPSTREAM_SERVER_ERROR)

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/error-types.ts</code> — 1</summary>

- **C314** _[error-message · leaf-authored]_ **⚑high-impact** **McpToolError/McpParameterError names + PARAMETER_ERROR default code** — this.name = 'McpToolError' / this.name = 'McpParameterError' / this.code = options?.code ?? 'PARAMETER_ERROR'

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/execute-tool-call.ts</code> — 4</summary>

- **C315** _[error-message · authored-template]_ **⚑high-impact** **generic Error 'Execution failed' template + EXECUTION_ERROR** — new McpToolError(`Execution failed: ${error.message}`, toolName, { cause: error, code: 'EXECUTION_ERROR' }) `user-input-interpolation`
- **C316** _[error-message · authored-template]_ **⚑high-impact** **unknown-error 'Execution failed: UNKNOWN ERROR' template** — new McpToolError(`Execution failed: UNKNOWN ERROR: ${String(error)}`, toolName, { code: 'EXECUTION_ERROR' })
- **C317** _[error-message · authored-template]_ **⚑high-impact** **output-validation-error message + OUTPUT_VALIDATION_ERROR** — error.message.startsWith('Output validation error: ') ... 'Execution failed: ' + message ... code: 'OUTPUT_VALIDATION_ERROR' `user-input-interpolation`
- **C318** _[error-message · authored-template]_ **⚑high-impact** **unknown-tool message + UNKNOWN_TOOL** — new McpToolError(`Unknown tool: ${String(maybeToolName)}`, String(maybeToolName), { code: 'UNKNOWN_TOOL' }) `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/search-retrieval-stub.ts</code> — 1</summary>

- **C319** _[empty-or-refusal-copy · leaf-authored]_ **⚑high-impact** **createStubSearchRetrieval empty-result payloads** — searchLessons: () => Promise.resolve(ok({ scope: 'lessons', total: 0, took: 0, timedOut: false, results: [] }))

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/search-retrieval-types.ts</code> — 1</summary>

- **C321** _[error-message · leaf-authored]_ **⚑high-impact** **SearchRetrievalError discriminant vocabulary** — type: 'es_error' \| 'timeout' \| 'validation_error' \| 'unknown' (each with readonly message: string)

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/stub-tool-executor.ts</code> — 5</summary>

- **C710** _[error-message · leaf-authored]_ **⚑high-impact** **McpToolError 'Stub result content is empty'** — new McpToolError('Stub result content is empty', name, { code: 'STUB_DECODE_ERROR' })
- **C711** _[error-message · leaf-authored]_ **⚑high-impact** **McpToolError 'Stub result is not valid JSON'** — new McpToolError('Stub result is not valid JSON', name, { code: 'STUB_DECODE_ERROR', cause })
- **C712** _[error-message · leaf-authored]_ **⚑high-impact** **deriveErrorMessage fallback + STUB_EXECUTION_ERROR** — 'Stub execution failed without diagnostic text content' (code 'STUB_EXECUTION_ERROR')
- **C713** _[error-message · leaf-authored]_ **⚑high-impact** **McpToolError 'Execution failed: ' + message** — new McpToolError('Execution failed: ' + outputValidation.message, name, { code: 'OUTPUT_VALIDATION_ERROR' })
- **C715** _[error-message · leaf-authored]_ **⚑high-impact** **assertStubAvailable TypeError** — throw new TypeError(`Stub payload not available for tool: ${String(name)}`)

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/universal-tool-shared.ts</code> — 3</summary>

- **C059** _[error-message · authored-template]_ **⚑high-impact** **formatUnknownTool string-name copy `Unknown tool: <name>`** — return formatError(`Unknown tool: ${value}`); `user-input-interpolation`
- **C060** _[error-message · leaf-authored]_ **⚑high-impact** **formatUnknownTool non-string fallback `Unknown tool`** — return formatError('Unknown tool'); `user-input-interpolation`
- **C061** _[error-message · leaf-authored]_ **⚑high-impact** **toErrorMessage 'Unknown error' fallbacks (2 occurrences grouped)** — value.message.length > 0 ? value.message : 'Unknown error' ... return 'Unknown error';

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/universal-tools/descriptor-utils.ts</code> — 2</summary>

- **C063** _[error-message · authored-template]_ **⚑high-impact** **requireGeneratedToolMetadata missing-metadata fail-fast error** — `Generated tool "${toolName}" missing required metadata: title=..., description=... Fix the generator template or OpenAPI spec.`
- **C064** _[error-message · authored-template]_ **⚑high-impact** **requireGeneratedToolInputShape missing-flat-schema fail-fast error** — `Generated tool "${toolName}" missing required flat input schema: toolMcpFlatInputSchema must be a ZodObject. Fix the generator output or test registry.` `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/universal-tools/executor.ts</code> — 1</summary>

- **C058** _[rate-limit-or-degradation-message · leaf-authored]_ **⚑high-impact** **download-asset transport-unavailable error** — formatError('download-asset is not available in this transport (HTTP-only)')

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/code-generation/generate-ai-doc-catalog.ts</code> — 2</summary>

- **C416** _[empty-or-refusal-copy · leaf-authored]_ **⚑high-impact** **renderParamSummary: '_No parameters_' empty copy** — return '_No parameters_';
- **C420** _[empty-or-refusal-copy · leaf-authored]_ **⚑high-impact** **listParamObjectKeys: '_None_' empty copy** — return keys.length === 0 ? '_None_' : keys.join(', ');

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/code-generation/generate-markdown-docs.ts</code> — 3</summary>

- **C424** _[error-message · leaf-authored]_ **⚑high-impact** **readProject: 'TypeDoc JSON not found' error with remediation command** — throw new Error('TypeDoc JSON not found at ' + jsonPath + '. Run: pnpm -F @oaknational/curriculum-sdk docs:api:json:ai');
- **C425** _[error-message · leaf-authored]_ **⚑high-impact** **readProject: 'Failed to parse TypeDoc JSON' error** — throw new Error('Failed to parse TypeDoc JSON');
- **C426** _[error-message · authored-template]_ **⚑high-impact** **formatZodIssues + 'TypeDoc JSON validation failed' error** — 'TypeDoc JSON validation failed:\n' + formatZodIssues(err.issues)   // `- ${i.path.join('.') \|\| '<root>'}: ${i.message}`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/code-generation/schema-enhancement-404.ts</code> — 2</summary>

- **C428** _[error-message · leaf-authored]_ **⚑high-impact** **add404ResponsesWhereExpected: 'schema is missing paths object' error** — throw new Error('OpenAPI schema is missing paths object; cannot decorate responses.');
- **C429** _[error-message · authored-template]_ **⚑high-impact** **add404 / readOperation: 'Configured legitimate 404 endpoint … not found / no operation' errors** — `Configured legitimate 404 endpoint ${descriptor.method.toUpperCase()} ${descriptor.path} was not found in the schema.` … `… has no operation in the schema.` `user-input-interpolation` `possible-defect-reported`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/code-generation/typegen/mcp-tools/parts/emit-error-description.ts</code> — 1</summary>

- **C467** _[error-message · leaf-authored]_ **⚑high-impact** **toolArgsDescription / describeToolArgs template** — 'Invalid request parameters. Please match the following schema:' / `Schema: ${json}` / `Required: ${requiredList}` ; empty required -> '(none)'

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/code-generation/typegen/mcp-tools/parts/emit-index.ts</code> — 2</summary>

- **C477** _[error-message · leaf-authored]_ **⚑high-impact** **validateOutput no-match message** — ok: false, message: 'Response does not match any documented schema for statuses: ${documentedStatusesMessage}'
- **C478** _[error-message · leaf-authored]_ **⚑high-impact** **invoke-time guard TypeErrors (missing response descriptor / invalid method)** — throw new TypeError('Missing response descriptor for documented status <s> on <op>.'); 'Invalid method on endpoint: <METHOD> for <path>' `boundary-owner-call`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/code-generation/typegen/mcp-tools/parts/generate-definitions-file.ts</code> — 1</summary>

- **C472** _[error-message · leaf-authored]_ **⚑high-impact** **getToolEntryFromToolName / getToolNameFromOperationId / getOperationIdFromToolName guard messages** — throw new TypeError('Unknown tool: ' + String(toolName)); throw new TypeError('Unknown operation: ' + String(operationId)); `boundary-owner-call`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/code-generation/typegen/mcp-tools/parts/generate-undocumented-response-error-file.ts</code> — 1</summary>

- **C474** _[error-message · leaf-authored]_ **⚑high-impact** **UndocumentedResponseError message template** — `Undocumented response status ${status} for ${operationId}. Documented statuses: ${documentedStatuses.join(', ')}` (+ `. Upstream: ${upstreamMessage}`) `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/contract/undocumented-response-error.ts</code> — 3</summary>

- **C682** _[error-message · leaf-authored]_ **⚑high-impact** **UndocumentedResponseError base message template** — `Undocumented response status ${status} for ${operationId}. Documented statuses: ${documentedStatuses.join(', ')}` `user-input-interpolation`
- **C683** _[error-message · authored-template]_ **⚑high-impact** **'. Upstream: ' + upstreamMessage suffix** — const message = upstreamMessage ? `${base}. Upstream: ${upstreamMessage}` : base;  // upstreamMessage = string body or body.message `user-input-interpolation`
- **C684** _[error-message · leaf-authored]_ **⚑high-impact** **error name literal 'UndocumentedResponseError'** — this.name = 'UndocumentedResponseError';

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/definitions.ts</code> — 2</summary>

- **C679** _[error-message · leaf-authored]_ **⚑high-impact** **TypeError 'Unknown tool: ' + toolName** — throw new TypeError('Unknown tool: ' + String(toolName)); `user-input-interpolation`
- **C680** _[error-message · leaf-authored]_ **⚑high-impact** **TypeError 'Unknown operation: ' + operationId** — throw new TypeError('Unknown operation: ' + String(operationId)); `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-changelog-latest.ts</code> — 1</summary>

- **C493** _[error-message · leaf-authored]_ **⚑high-impact** **get-changelog-latest toolArgsDescription (validation template)** — Invalid request parameters. Please match the following schema:\nSchema: {"type":"object","properties":{},"additionalProperties":false}\nRequired: (none) `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-changelog.ts</code> — 1</summary>

- **C497** _[error-message · leaf-authored]_ **⚑high-impact** **get-changelog toolArgsDescription (validation template)** — Invalid request parameters. Please match the following schema:\nSchema: {"type":"object","properties":{},"additionalProperties":false}\nRequired: (none) `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-key-stages-subject-assets.ts</code> — 2</summary>

- **C504** _[rate-limit-or-degradation-message · leaf-authored]_ **⚑high-impact** **get-key-stages-subject-assets NOTE token-limit injection** — NOTE: This tool can return a large payload at broad scope and may exceed a host's per-result token limit. Narrow with `unit` and/or `type` (asset type), or use  `user-input-interpolation`
- **C509** _[error-message · leaf-authored]_ **⚑high-impact** **get-key-stages-subject-assets toolArgsDescription (validation template)** — Invalid request parameters. Please match the following schema:\nSchema: {...}\nRequired: keyStage, subject `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-key-stages-subject-lessons.ts</code> — 1</summary>

- **C519** _[error-message · leaf-authored]_ **⚑high-impact** **get-key-stages-subject-lessons toolArgsDescription (validation template)** — Invalid request parameters. Please match the following schema:\nSchema: {...}\nRequired: keyStage, subject `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-key-stages-subject-questions.ts</code> — 1</summary>

- **C529** _[error-message · leaf-authored]_ **⚑high-impact** **get-key-stages-subject-questions toolArgsDescription (validation template)** — Invalid request parameters. Please match the following schema:\nSchema: {...}\nRequired: keyStage, subject `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-key-stages-subject-units.ts</code> — 1</summary>

- **C536** _[error-message · leaf-authored]_ **⚑high-impact** **get-key-stages-subject-units toolArgsDescription (validation template)** — Invalid request parameters. Please match the following schema:\nSchema: {..."examBoard":{...enum:[aqa,edexcel,eduqas,ocr,wjec,edexcelb]}}\nRequired: keyStage, s `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-key-stages.ts</code> — 1</summary>

- **C541** _[error-message · leaf-authored]_ **⚑high-impact** **get-key-stages toolArgsDescription (validation template)** — Invalid request parameters. Please match the following schema:\nSchema: {"type":"object","properties":{},"additionalProperties":false}\nRequired: (none)

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-keywords.ts</code> — 1</summary>

- **C547** _[error-message · leaf-authored]_ **⚑high-impact** **get-keywords toolArgsDescription (validation template)** — Invalid request parameters. Please match the following schema:\nSchema: {...subject,keyStage,phase,unit,lesson...}\nRequired: (none) `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-lessons-assets.ts</code> — 1</summary>

- **C556** _[error-message · leaf-authored]_ **⚑high-impact** **get-lessons-assets toolArgsDescription (validation template)** — Invalid request parameters. Please match the following schema:\nSchema: {...}\nRequired: lesson `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-lessons-quiz.ts</code> — 1</summary>

- **C563** _[error-message · leaf-authored]_ **⚑high-impact** **get-lessons-quiz toolArgsDescription (validation template)** — Invalid request parameters. Please match the following schema:\nSchema: {...}\nRequired: lesson `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-lessons-summary.ts</code> — 1</summary>

- **C569** _[error-message · leaf-authored]_ **⚑high-impact** **get-lessons-summary toolArgsDescription (validation template)** — Invalid request parameters. Please match the following schema:\nSchema: {..."lesson":{...}}\nRequired: lesson `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-lessons-transcript.ts</code> — 1</summary>

- **C575** _[error-message · leaf-authored]_ **⚑high-impact** **get-lessons-transcript toolArgsDescription (validation template)** — Invalid request parameters. Please match the following schema:\nSchema: {..."lesson":{...}}\nRequired: lesson `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-programmes-assets.ts</code> — 1</summary>

- **C586** _[error-message · leaf-authored]_ **⚑high-impact** **get-programmes-assets toolArgsDescription (validation template)** — Invalid request parameters. Please match the following schema:\nSchema: {...}\nRequired: programme `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-programmes-questions.ts</code> — 1</summary>

- **C595** _[error-message · leaf-authored]_ **⚑high-impact** **get-programmes-questions toolArgsDescription (validation template)** — Invalid request parameters. Please match the following schema:\nSchema: {...}\nRequired: programme `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-programmes-units.ts</code> — 1</summary>

- **C601** _[error-message · leaf-authored]_ **⚑high-impact** **get-programmes-units toolArgsDescription (validation template)** — Invalid request parameters. Please match the following schema:\nSchema: {..."programme":{...}}\nRequired: programme `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-programmes.ts</code> — 1</summary>

- **C606** _[error-message · authored-template]_ **⚑high-impact** **toolArgsDescription / describeToolArgs** — Invalid request parameters. Please match the following schema:\nSchema: {...programme...}\nRequired: programme

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-rate-limit.ts</code> — 1</summary>

- **C610** _[error-message · authored-template]_ **⚑high-impact** **toolArgsDescription / describeToolArgs** — Invalid request parameters. Please match the following schema:\nSchema: {...}\nRequired: (none)

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-sequences-assets.ts</code> — 1</summary>

- **C617** _[error-message · authored-template]_ **⚑high-impact** **toolArgsDescription / describeToolArgs** — Invalid request parameters. Please match the following schema:\nSchema: {...sequence...year...type...}\nRequired: sequence

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-sequences-questions.ts</code> — 1</summary>

- **C626** _[error-message · authored-template]_ **⚑high-impact** **toolArgsDescription / describeToolArgs** — Invalid request parameters. Please match the following schema:\nSchema: {...}\nRequired: sequence

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-sequences-units.ts</code> — 1</summary>

- **C632** _[error-message · authored-template]_ **⚑high-impact** **toolArgsDescription / describeToolArgs** — Invalid request parameters. Please match the following schema:\nSchema: {...}\nRequired: sequence

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-sequences.ts</code> — 1</summary>

- **C637** _[error-message · authored-template]_ **⚑high-impact** **toolArgsDescription / describeToolArgs** — Invalid request parameters. Please match the following schema:\nSchema: {...}\nRequired: sequence

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-subject-detail.ts</code> — 1</summary>

- **C642** _[error-message · authored-template]_ **⚑high-impact** **toolArgsDescription / describeToolArgs** — Invalid request parameters. Please match the following schema:\nSchema: {...subject enum...}\nRequired: subject

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-subjects-key-stages.ts</code> — 1</summary>

- **C647** _[error-message · authored-template]_ **⚑high-impact** **toolArgsDescription / describeToolArgs** — Invalid request parameters. Please match the following schema:\nSchema: {...subject enum...}\nRequired: subject

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-subjects-programmes.ts</code> — 1</summary>

- **C652** _[error-message · authored-template]_ **⚑high-impact** **toolArgsDescription / describeToolArgs** — Invalid request parameters. Please match the following schema:\nSchema: {...subject enum...}\nRequired: subject

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-subjects-years.ts</code> — 1</summary>

- **C657** _[error-message · authored-template]_ **⚑high-impact** **toolArgsDescription / describeToolArgs** — Invalid request parameters. Please match the following schema:\nSchema: {...subject enum...}\nRequired: subject

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-subjects.ts</code> — 1</summary>

- **C661** _[error-message · authored-template]_ **⚑high-impact** **toolArgsDescription / describeToolArgs** — Invalid request parameters. Please match the following schema:\nSchema: {...}\nRequired: (none)

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-threads-units.ts</code> — 1</summary>

- **C666** _[error-message · authored-template]_ **⚑high-impact** **toolArgsDescription / describeToolArgs** — Invalid request parameters. Please match the following schema:\nSchema: {...thread...}\nRequired: thread

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-threads.ts</code> — 1</summary>

- **C670** _[error-message · authored-template]_ **⚑high-impact** **toolArgsDescription / describeToolArgs** — Invalid request parameters. Please match the following schema:\nSchema: {...}\nRequired: (none)

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-units-summary.ts</code> — 1</summary>

- **C675** _[error-message · authored-template]_ **⚑high-impact** **toolArgsDescription / describeToolArgs** — Invalid request parameters. Please match the following schema:\nSchema: {...unit...examBoard...}\nRequired: unit

</details>
<details><summary><code>packages/sdks/oak-search-sdk/src/retrieval/retrieval-error.ts</code> — 1</summary>

- **C452** _[error-message · leaf-authored]_ **⚑high-impact** **RetrievalError discriminant tags ('timeout' / 'es_error') + message passthrough** — return { type: 'timeout', message }; ... return { type: 'es_error', message, statusCode };

</details>

### legal-licensing — 19 items

Attribution, licensing (OGL v3.0), trademark, EEF-citation obligations.

<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/landing-page/render-landing-page.ts</code> — 2</summary>

- **C351** _[source-attribution · leaf-authored]_ **⚑high-impact** **curriculum-API doc link sentence** — For details about the underlying curriculum data, see the Oak Curriculum API documentation.
- **C352** _[source-attribution · leaf-authored]_ **⚑high-impact** **GitHub source link sentence (WORKSPACE_GITHUB_URL)** — Browse the MCP server implementation: <a ...>code on GitHub</a> -> github.com/oaknational/oak-open-curriculum-ecosystem/tree/main/apps/oak-curriculum-mcp-stream

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/oak-under-the-hood/oak-under-the-hood-tool.ts</code> — 3</summary>

- **C377** _[source-attribution · leaf-authored]_ **⚑high-impact** **CANONICAL_SKILL_URL** — https://raw.githubusercontent.com/oaknational/oak-open-curriculum-ecosystem/main/.agent/skills/under-the-hood/SKILL-CANONICAL.md
- **C378** _[source-attribution · leaf-authored]_ **⚑high-impact** **OAK_WHO_WE_ARE_URL** — const OAK_WHO_WE_ARE_URL = 'https://www.thenational.academy/about-us/who-we-are';
- **C379** _[source-attribution · leaf-authored]_ **⚑high-impact** **OAK_STRATEGY_DOCS_URL** — const OAK_STRATEGY_DOCS_URL = 'https://www.thenational.academy/about-us/meet-the-team#documents';

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/widget/src/BrandBanner.tsx</code> — 1</summary>

- **C390** _[source-attribution · leaf-authored]_ **⚑high-impact** **OAK_URL brand link target** — const OAK_URL = 'https://www.thenational.academy';

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/curriculum-model-resource.ts</code> — 1</summary>

- **C220** _[source-attribution · leaf-authored]_ **⚑high-impact** **CURRICULUM_MODEL_RESOURCE._meta.attribution (OAK_API_ATTRIBUTION)** — _meta: { attribution: OAK_API_ATTRIBUTION }

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/documentation-content.ts</code> — 1</summary>

- **C213** _[source-attribution · authored-template]_ **⚑high-impact** **getGettingStartedMarkdown — Documentation link pointer** — ## Documentation\n\nFor detailed API documentation, visit: <${serverOverview.documentation}> `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/eef-interpretation-resource.ts</code> — 1</summary>

- **C276** _[source-attribution · authored-framing-of-external]_ **⚑high-impact** **citeSource()** — ### Source and attribution\n- **Source**: ${source.name} (${source.organisation})\n- **EEF page**: ${source.url}\n- **Authors**: ${source.original_authors.join( `user-input-interpolation` `pii-adjacent` `boundary-owner-call`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/ontology-data.ts</code> — 1</summary>

- **C289** _[source-attribution · leaf-authored]_ **⚑high-impact** **officialDocs + oakUrls** — officialDocs: 'https://open-api.thenational.academy/docs/about-oaks-data/glossary' ... lesson: 'https://www.thenational.academy/teachers/lessons/{lessonSlug}'

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/prompt-messages/lesson-planning.ts</code> — 2</summary>

- **C206** _[source-attribution · leaf-authored]_ **⚑high-impact** **recurring source-attribution block (Oak / OGL v3.0)** — Attribution: the lesson data is Oak National Academy's, published under the Open Government Licence v3.0 (...), which requires attribution ... The Oak name and 
- **C209** _[source-attribution · leaf-authored]_ **⚑high-impact** **recurring pedagogy citations (six curriculum principles / Mary Myatt / EEF authors)** — This workflow follows Oak's six curriculum principles (Emma McCrea, "Our 6 principles guiding our approach to curriculum", Oak, 2023). / cite EEF ... (organisat `pii-adjacent`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/source-attribution.ts</code> — 3</summary>

- **C008** _[source-attribution · leaf-authored]_ **⚑high-impact** **OAK_API_ATTRIBUTION** — source: 'Oak Open Curriculum API' ... attributionNote: 'Contains Oak National Academy open curriculum data licensed under the Open Government Licence v3.0.'
- **C009** _[source-attribution · leaf-authored]_ **⚑high-impact** **↑oak-curriculum-ontology** **OAK_KG_ATTRIBUTION** — source: 'Oak Curriculum Ontology' ... attributionNote: 'Contains data from the Oak Curriculum Ontology by Oak National Academy, licensed under OGL v3.0 (data) a
- **C010** _[source-attribution · leaf-authored]_ **⚑high-impact** **EEF_ATTRIBUTION** — source: 'EEF Teaching and Learning Toolkit' ... attributionNote: 'Contains evidence data from the Education Endowment Foundation Teaching and Learning Toolkit. 

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/code-generation/lib/ai-doc-render.ts</code> — 1</summary>

- **C489** _[source-attribution · leaf-authored]_ **⚑high-impact** **renderSources** — `Source: [${loc}](${s.url})` / `Source: ${loc}`  (loc = `${fileName}:${line}`)

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-key-stages-subject-assets.ts</code> — 1</summary>

- **C501** _[source-attribution · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-key-stages-subject-assets licensing/attribution sentence** — Lesson content is under OGL v3.0; assets are either Oak-owned or third-party under an OGL-compatible licence. Attribution required — see https://open-api.thenat

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-lessons-assets.ts</code> — 1</summary>

- **C551** _[source-attribution · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-lessons-assets licensing/attribution sentence** — Lesson content is under OGL v3.0; assets are either Oak-owned or third-party under an OGL-compatible licence. Attribution required — see https://open-api.thenat

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-programmes-assets.ts</code> — 1</summary>

- **C579** _[source-attribution · generated-from-openapi]_ **⚑high-impact** **↑oak-api** **get-programmes-assets licensing/attribution sentence** — Lesson content is under OGL v3.0; assets are either Oak-owned or third-party under an OGL-compatible licence. Attribution required — see https://open-api.thenat

</details>

### ux-accessibility — 16 items

Human-facing surfaces — landing page, widget UI, auth/consent copy (WCAG 2.2 AA applies).

<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/auth-error-response.ts</code> — 2</summary>

- **C686** _[auth-consent-copy · leaf-authored]_ **createAuthErrorResponse / wwwAuthenticate** — Bearer resource_metadata="${metadataUrl}", error="${errorType}", error_description="${description}"
- **C688** _[auth-consent-copy · leaf-authored]_ **AuthErrorType union** — 'invalid_token' \| 'insufficient_scope' \| 'token_expired' \| 'missing_token'

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/auth/mcp-auth/mcp-auth.ts</code> — 3</summary>

- **C395** _[auth-consent-copy · leaf-authored]_ **⚑high-impact** **sendMissingAuthResponse** — WWW-Authenticate: Bearer resource_metadata="${prmUrl}" ; body { error: 'Unauthorized' } `user-input-interpolation`
- **C396** _[auth-consent-copy · leaf-authored]_ **sendInvalidFormatResponse** — error="invalid_request", error_description="Invalid Authorization header format. Must be 'Bearer <token>'." ; body message: 'Invalid Authorization header format
- **C397** _[auth-consent-copy · leaf-authored]_ **sendVerificationFailedResponse** — error="invalid_token", error_description="Token verification failed" ; body { error: 'Unauthorized' }

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/generated/widget-html-content.ts</code> — 1</summary>

- **C394** _[widget-ui-content · generated-from-repo-code]_ **WIDGET_HTML_CONTENT (generated widget bundle)** — GENERATED FILE — DO NOT EDIT ... Re-generate by running: pnpm build:widget ... export const WIDGET_HTML_CONTENT = `<!doctype html>...<title>Oak MCP App</title>.

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/landing-page/render-landing-page.ts</code> — 2</summary>

- **C348** _[widget-ui-content · leaf-authored]_ **config snippet aria-label** — aria-label="JSON configuration snippet"
- **C349** _[auth-consent-copy · leaf-authored]_ **OAuth / access-restriction copy** — This server uses OAuth 2.1 authorization. You will be prompted to log in. Access is currently for internal staff or by invitation.

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/landing-page/render-prompts-section.ts</code> — 1</summary>

- **C370** _[widget-ui-content · leaf-authored]_ **'Click to expand' hint (grouped)** — <span class="expand-hint">Click to expand</span>

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/landing-page/render-tools-section.ts</code> — 1</summary>

- **C367** _[widget-ui-content · leaf-authored]_ **'How to use' collapsible label** — <summary>How to use</summary>

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/register-widget-resource.ts</code> — 1</summary>

- **C692** _[widget-ui-content · leaf-authored]_ **WIDGET_UI_META** — csp: { resourceDomains: ['https://fonts.googleapis.com','https://fonts.gstatic.com'] }, prefersBorder: false

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/widget/src/App.tsx</code> — 1</summary>

- **C385** _[widget-ui-content · leaf-authored]_ **visually-hidden <h1> heading** — <h1 className="visually-hidden">Oak National Academy Curriculum</h1>

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/widget/src/BrandBanner.tsx</code> — 2</summary>

- **C391** _[widget-ui-content · leaf-authored]_ **brand banner label 'Oak National Academy'** — <span>Oak National Academy</span>
- **C392** _[widget-ui-content · leaf-authored]_ **visually-hidden 'opens in a new tab' hint** — <span className="visually-hidden"> (opens in a new tab)</span>

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-search/tool-definition.ts</code> — 1</summary>

- **C068** _[auth-consent-copy · leaf-authored]_ **SEARCH_TOOL_DEF.securitySchemes / _meta.securitySchemes** — securitySchemes: [{ type: 'oauth2', scopes: [...SCOPES_SUPPORTED] }]

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/tool-guidance-data.ts</code> — 1</summary>

- **C014** _[auth-consent-copy · leaf-authored]_ **serverOverview.authentication** — OAuth2 with Clerk - sign in with your email to access curriculum resources.

</details>

### engineering-structural — 95 items

Annotations, schemas, scopes, discovery/branding metadata — structural, engineer-owned.

<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/app/core-endpoints.ts</code> — 2</summary>

- **C323** _[server-branding · leaf-authored]_ **McpServer Implementation name (oak-curriculum-http) + version** — new McpServer({ name: 'oak-curriculum-http', version: '0.1.0', ...OAK_SERVER_BRANDING }, { instructions: SERVER_INSTRUCTIONS })
- **C324** _[server-instructions · leaf-authored]_ **⚑high-impact** **SERVER_INSTRUCTIONS (top-level server instructions, wired here, content in SDK)** — import { SERVER_INSTRUCTIONS } from '@oaknational/curriculum-sdk/public/mcp-tools.js'; ... { instructions: SERVER_INSTRUCTIONS } `boundary-owner-call`

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/auth-error-response.ts</code> — 1</summary>

- **C689** _[discovery-or-catalog-metadata · generated-from-repo-code]_ **generateMetadataUrl** — ${protocol}//${host}/.well-known/oauth-protected-resource${url.pathname}

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/auth-routes.ts</code> — 3</summary>

- **C706** _[discovery-or-catalog-metadata · leaf-authored]_ **servePrm PRM response body** — { resource: `${selfOrigin}/mcp`, authorization_servers: [selfOrigin], scopes_supported: SCOPES_SUPPORTED }
- **C707** _[discovery-or-catalog-metadata · external-copy]_ **⚑high-impact** **⊗EEF-external** **oauth-authorization-server rewriteAuthServerMetadata** — res.json(rewriteAuthServerMetadata(upstreamMetadata, originResult.value)) `boundary-owner-call`
- **C708** _[discovery-or-catalog-metadata · leaf-authored]_ **/.well-known/mcp-stub-mode { stubMode: true }** — app.get('/.well-known/mcp-stub-mode', ...(_req,res)=> res.json({ stubMode: true }))

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/auth/public-resources.ts</code> — 1</summary>

- **C413** _[discovery-or-catalog-metadata · leaf-authored]_ **PUBLIC_RESOURCE_URIS / under-the-hood.md** — const PUBLIC_RESOURCE_URIS = [...DOCUMENTATION_RESOURCES.map(r=>r.uri), WIDGET_URI, 'docs://oak/under-the-hood.md']

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/landing-page/html-head.ts</code> — 1</summary>

- **C341** _[server-branding · leaf-authored]_ **HTML_HEAD <title>** — <title>Oak Curriculum MCP (HTTP)</title>

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/landing-page/render-landing-page.ts</code> — 3</summary>

- **C342** _[server-branding · leaf-authored]_ **logo alt text** — alt="Oak National Academy logo"
- **C345** _[discovery-or-catalog-metadata · leaf-authored]_ **status/route/auth meta line** — Status: ok • Route: <code>/mcp</code> • Auth: OAuth 2.1
- **C353** _[discovery-or-catalog-metadata · authored-template]_ **⚑high-impact** **app-version meta template** — <meta name="app-version" content="${appVersion}" /> `user-input-interpolation`

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/landing-page/render-prompts-section.ts</code> — 1</summary>

- **C357** _[discovery-or-catalog-metadata · authored-template]_ **⚑high-impact** **section count headings (Prompts/Resources/Tools)** — <h2>Prompts (${promptCount})</h2>  /  Resources (${count})  /  Tools (${count}) `user-input-interpolation`

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/landing-page/render-tools-section.ts</code> — 1</summary>

- **C369** _[discovery-or-catalog-metadata · leaf-authored]_ **AGGREGATED_TOOL_ORDER curation list** — ['get-curriculum-model','browse-curriculum','explore-topic','search','fetch','get-thread-progressions',...,'download-asset']

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/oak-under-the-hood/oak-under-the-hood-tool.ts</code> — 3</summary>

- **C371** _[discovery-or-catalog-metadata · leaf-authored]_ **OAK_UNDER_THE_HOOD_TOOL_NAME** — export const OAK_UNDER_THE_HOOD_TOOL_NAME = 'oak-under-the-hood';
- **C374** _[tool-annotations · leaf-authored]_ **tool annotations {readOnlyHint, openWorldHint}** — annotations: { readOnlyHint: true, openWorldHint: true },
- **C383** _[tool-annotations · leaf-authored]_ **resource_link annotations {audience:['assistant'], priority:0.9}** — annotations: { audience: ['assistant'], priority: 0.9 },

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/oauth-proxy/oauth-proxy-upstream.ts</code> — 1</summary>

- **C408** _[discovery-or-catalog-metadata · authored-template]_ **⚑high-impact** **rewriteAuthServerMetadata** — issuer: localOrigin, authorization_endpoint: `${localOrigin}/oauth/authorize`, token_endpoint: .../oauth/token, registration_endpoint: .../oauth/register `user-input-interpolation`

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/register-resources.ts</code> — 1</summary>

- **C339** _[tool-annotations · leaf-authored]_ **Oak: Under the Hood resource annotations (priority 0.2, audience ['assistant'])** — annotations: { priority: 0.2, audience: ['assistant'] }

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/server-branding.ts</code> — 4</summary>

- **C325** _[server-branding · leaf-authored]_ **OAK_SERVER_BRANDING.title** — title: 'Oak National Academy'
- **C326** _[server-branding · leaf-authored]_ **OAK_SERVER_BRANDING.description** — "Search, explore, download and use Oak's free, fully sequenced and resourced curriculum resources, for KS1 to KS4."
- **C327** _[server-branding · leaf-authored]_ **OAK_SERVER_BRANDING.websiteUrl** — websiteUrl: 'https://www.thenational.academy'
- **C328** _[server-branding · leaf-authored]_ **OAK server icons (light #287c34 / dark #ffffff acorn SVG data URIs)** — icons: [OAK_ICON_LIGHT, OAK_ICON_DARK] — data:image/svg+xml;base64 acorn, fill #287c34 (light theme) / #ffffff (dark theme), viewBox 0 0 32 42

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/widget/src/App.tsx</code> — 1</summary>

- **C384** _[discovery-or-catalog-metadata · leaf-authored]_ **appInfo.name 'oak-curriculum-mcp-app'** — appInfo: { name: 'oak-curriculum-mcp-app', version: __APP_VERSION__ }

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/widget/src/BrandBanner.tsx</code> — 1</summary>

- **C393** _[server-branding · leaf-authored]_ **OakLogo inline acorn SVG** — <svg aria-hidden="true" viewBox="0 0 32 42" ...><path fill="currentColor" d="M16.983 7.198c.86.15 ..."/></svg>

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/agent-support-tool-metadata.ts</code> — 3</summary>

- **C053** _[server-instructions · generated-from-repo-code]_ **⚑high-impact** **generateServerInstructions() scaffold** — Oak Curriculum MCP Server - AI Agent Guidance. For optimal results, call these agent support tools at conversation start... These tools are read-only and idempo
- **C054** _[server-instructions · leaf-authored]_ **⚑high-impact** **generateServerInstructions() 'fully sequenced' paragraph** — Oak's curriculum is fully sequenced: year-ordered progressions, prior-knowledge, misconception, and keyword graphs are served by the anchored graph tools (get-t
- **C055** _[server-instructions · leaf-authored]_ **⚑high-impact** **generateServerInstructions() 'under-the-hood' paragraph** — For questions that are not about curriculum content... use the oak-under-the-hood tool to orient yourself to the Oak Open Curriculum Ecosystem.

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-asset-download/definition.ts</code> — 2</summary>

- **C166** _[tool-annotations · leaf-authored]_ **DOWNLOAD_ASSET_TOOL_DEF.annotations** — readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false
- **C177** _[discovery-or-catalog-metadata · leaf-authored]_ **securitySchemes / _meta.securitySchemes oauth2 scope declaration (both tools)** — securitySchemes: [{ type: 'oauth2', scopes: [...SCOPES_SUPPORTED] }]

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-browse/tool-definition.ts</code> — 1</summary>

- **C139** _[tool-annotations · leaf-authored]_ **BROWSE_TOOL_DEF.annotations** — readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-explore/formatting.ts</code> — 1</summary>

- **C110** _[discovery-or-catalog-metadata · leaf-authored]_ **formatTopicMap response metadata (toolName, annotationsTitle)** — toolName: 'explore-topic', annotationsTitle: 'Explore Topic'

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-explore/tool-definition.ts</code> — 1</summary>

- **C102** _[tool-annotations · leaf-authored]_ **EXPLORE_TOOL_DEF.annotations** — readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-fetch/execution.ts</code> — 1</summary>

- **C153** _[tool-annotations · leaf-authored]_ **FETCH_TOOL_DEF.annotations** — readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-keyword-graph.ts</code> — 2</summary>

- **C231** _[tool-annotations · leaf-authored]_ **tool annotations (readOnly/destructive/idempotent/openWorld)** — readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false
- **C232** _[discovery-or-catalog-metadata · leaf-authored]_ **securitySchemes (oauth2 SCOPES_SUPPORTED)** — securitySchemes: [{ type: 'oauth2' as const, scopes: SCOPES_SUPPORTED }]

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-search/formatting.ts</code> — 1</summary>

- **C090** _[tool-annotations · leaf-authored]_ **SCOPE_TITLES** — lessons:'Search Lessons', units:'Search Units', threads:'Search Threads', sequences:'Search Sequences', suggest:'Search Suggestions'

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-search/tool-definition.ts</code> — 1</summary>

- **C067** _[tool-annotations · leaf-authored]_ **SEARCH_TOOL_DEF.annotations** — readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-user-search/tool-definition.ts</code> — 2</summary>

- **C120** _[tool-annotations · leaf-authored]_ **USER_SEARCH / USER_SEARCH_QUERY annotations (grouped, 2 identical blocks)** — readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false
- **C123** _[discovery-or-catalog-metadata · leaf-authored]_ **USER_SEARCH_QUERY_TOOL_DEF._meta.ui.visibility** — ui: { visibility: ['app'] satisfies ('model' \| 'app')[] }

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/documentation-resources.ts</code> — 1</summary>

- **C216** _[tool-annotations · leaf-authored]_ **DOCUMENTATION_RESOURCES[getting-started].annotations** — annotations: { priority: 0.8, audience: ['user', 'assistant'] }

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/eef-evidence-egress.ts</code> — 1</summary>

- **C285** _[discovery-or-catalog-metadata · leaf-authored]_ **eefEvidenceToCallToolResult toolName** — toolName: 'get-eef-evidence', annotationsTitle: GET_EEF_EVIDENCE_TOOL_DEF.title

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/prerequisite-guidance.ts</code> — 1</summary>

- **C006** _[server-instructions · generated-from-repo-code]_ **⚑high-impact** **SERVER_INSTRUCTIONS** — export const SERVER_INSTRUCTIONS = generateServerInstructions();

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/scopes-supported.ts</code> — 1</summary>

- **C007** _[discovery-or-catalog-metadata · generated-from-repo-code]_ **SCOPES_SUPPORTED** — export { SCOPES_SUPPORTED } from '@oaknational/sdk-codegen/mcp-tools';

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/search-retrieval-types.ts</code> — 1</summary>

- **C322** _[discovery-or-catalog-metadata · leaf-authored]_ **search-result scope discriminant vocabulary** — scope: 'lessons' / scope: 'units' / scope: 'sequences' / scope: 'threads'

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/stub-tool-executor.ts</code> — 1</summary>

- **C716** _[tool-annotations · leaf-authored]_ **stub error code vocabulary** — code: 'STUB_DECODE_ERROR' \| 'STUB_EXECUTION_ERROR' \| 'PARAMETER_ERROR' \| 'OUTPUT_VALIDATION_ERROR'

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/tool-guidance-data.ts</code> — 5</summary>

- **C011** _[server-branding · leaf-authored]_ **serverOverview.name / version** — name: 'Oak Curriculum MCP Server', version: '1.0.0'
- **C012** _[server-branding · leaf-authored]_ **serverOverview.aboutOak / oakWebsite** — Oak National Academy is the UK's national curriculum body, providing free, high-quality, fully-resourced curriculum resources for teachers and students.
- **C013** _[server-branding · leaf-authored]_ **serverOverview.description** — Access Oak National Academy curriculum resources including lessons, units, quizzes, transcripts, and teaching materials. Covers Key Stages 1-4 across all Nation
- **C015** _[discovery-or-catalog-metadata · leaf-authored]_ **serverOverview.documentation** — documentation: 'https://open-api.thenational.academy/docs'
- **C023** _[discovery-or-catalog-metadata · leaf-authored]_ **toolCategories.*.tools (6 arrays)** — discovery.tools: ['search','user-search','user-search-query','explore-topic','browse-curriculum','get-subjects','get-key-stages'] (and 5 other category arrays)

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/code-generation/generate-ai-doc-catalog.ts</code> — 3</summary>

- **C414** _[discovery-or-catalog-metadata · leaf-authored]_ **renderEndpointCatalog: '## Endpoint Catalog' header** — const lines: string[] = ['## Endpoint Catalog'];
- **C418** _[discovery-or-catalog-metadata · leaf-authored]_ **renderToolCatalog: '## MCP Tool Catalog' header** — const lines: string[] = ['## MCP Tool Catalog'];
- **C419** _[discovery-or-catalog-metadata · authored-template]_ **⚑high-impact** **renderToolCatalog: per-tool entry template (path/method/operationId/path params/query params)** — lines.push(`### ${name}`,`- path: …`,`- method: …`); …`- operationId: …`; lines.push(`- path params: …`,`- query params: …`,'') `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/code-generation/generate-ai-doc.ts</code> — 1</summary>

- **C485** _[discovery-or-catalog-metadata · leaf-authored]_ **collectExports ignoreNames filter** — ignoreNames = new Set(['typeSafeKeys','typeSafeValues','typeSafeEntries','typeSafeGet','typeSafeSet','typeSafeHas','typeSafeHasOwn']); drop src includes 'types/

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/code-generation/typegen/cross-domain-constants.ts</code> — 2</summary>

- **C479** _[discovery-or-catalog-metadata · leaf-authored]_ **BASE_WIDGET_URI** — ui://widget/oak-curriculum-app-${hash}.html  (hash = 'local' or sha256(timestamp).slice(0,8))
- **C480** _[discovery-or-catalog-metadata · leaf-authored]_ **WIDGET_TOOL_NAMES** — WIDGET_TOOL_NAMES = new Set(['get-curriculum-model', 'user-search'])

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/code-generation/typegen/mcp-tools/mcp-tool-generator.ts</code> — 2</summary>

- **C470** _[discovery-or-catalog-metadata · leaf-authored]_ **SKIPPED_PATHS** — SKIPPED_PATHS = new Set(['/search/lessons','/search/transcripts','/lessons/{lesson}/assets/{type}'])
- **C471** _[discovery-or-catalog-metadata · generated-from-repo-code]_ **⚑high-impact** **operationId fallback template** — const operationId = operation.operationId ?? `${method}-${path.replaceAll(/[{}]/g,'')}`; `boundary-owner-call`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/code-generation/typegen/mcp-tools/name-generator.ts</code> — 1</summary>

- **C469** _[discovery-or-catalog-metadata · leaf-authored]_ **generateMcpToolName (endpoint->tool rewrite + special cases)** — `${method.toLowerCase()}-${nameSegments.join('-')}`; special: 'get-lessons-assets-by-type', 'get-subject-detail'

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/code-generation/typegen/mcp-tools/parts/emit-index.ts</code> — 2</summary>

- **C475** _[tool-annotations · leaf-authored]_ **annotations block (readOnlyHint/destructiveHint/idempotentHint/openWorldHint + title)** — annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: <title> }
- **C476** _[tool-annotations · leaf-authored]_ **requiresDomainContext flag** — requiresDomainContext: ${requiresDomainContext ? 'true' : 'false'} (securitySchemes[0]?.type !== NOAUTH_SCHEME_TYPE)

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/code-generation/typegen/mcp-tools/parts/generate-scopes-supported-file.ts</code> — 1</summary>

- **C473** _[discovery-or-catalog-metadata · generated-from-repo-code]_ **generateScopesSupportedFile / SCOPES_SUPPORTED emitter** — export const SCOPES_SUPPORTED = [${quotedScopes}] as const;

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/code-generation/typegen/mcp-tools/parts/tool-description.ts</code> — 1</summary>

- **C463** _[discovery-or-catalog-metadata · leaf-authored]_ **TOOL_DESCRIPTION_ADDITIONS map + appendToolEnhancements** — TOOL_DESCRIPTION_ADDITIONS = new Map([['get-rate-limit',...],['get-keywords',...],['get-lessons-assets',...],['get-subjects-programmes',...],...])

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/definitions.ts</code> — 2</summary>

- **C677** _[discovery-or-catalog-metadata · generated-from-openapi]_ **↑oak-api** **MCP_TOOL_ENTRIES tool-name catalogue (29 kebab-case tool names)** — MCP_TOOL_ENTRIES = [{name:'get-changelog'...},{name:'get-key-stages'},{name:'get-lessons-quiz'},{name:'get-lessons-transcript'},{name:'get-subjects'},{name:'get
- **C678** _[discovery-or-catalog-metadata · generated-from-openapi]_ **↑oak-api** **operationId identifiers per tool (29)** — operationId per entry e.g. 'changelog-changelog','getKeyStages-getKeyStages','getLessonTranscript-getLessonTranscript','getUnits-getUnit','getRateLimit-getRateL

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/scopes-supported.ts</code> — 1</summary>

- **C681** _[discovery-or-catalog-metadata · generated-from-openapi]_ **↑oak-api** **SCOPES_SUPPORTED = ['email']** — export const SCOPES_SUPPORTED = ['email'] as const;

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-changelog-latest.ts</code> — 1</summary>

- **C494** _[tool-annotations · generated-from-repo-code]_ **get-changelog-latest annotations (behaviour hints)** — readOnlyHint:true, destructiveHint:false, idempotentHint:true, openWorldHint:false

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-changelog.ts</code> — 1</summary>

- **C498** _[tool-annotations · generated-from-repo-code]_ **get-changelog annotations (behaviour hints)** — readOnlyHint:true, destructiveHint:false, idempotentHint:true, openWorldHint:false

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-key-stages-subject-assets.ts</code> — 1</summary>

- **C510** _[tool-annotations · generated-from-repo-code]_ **get-key-stages-subject-assets annotations (behaviour hints)** — readOnlyHint:true, destructiveHint:false, idempotentHint:true, openWorldHint:false

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-key-stages-subject-lessons.ts</code> — 1</summary>

- **C520** _[tool-annotations · generated-from-repo-code]_ **get-key-stages-subject-lessons annotations (behaviour hints)** — readOnlyHint:true, destructiveHint:false, idempotentHint:true, openWorldHint:false

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-key-stages-subject-questions.ts</code> — 1</summary>

- **C530** _[tool-annotations · generated-from-repo-code]_ **get-key-stages-subject-questions annotations (behaviour hints)** — readOnlyHint:true, destructiveHint:false, idempotentHint:true, openWorldHint:false

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-key-stages-subject-units.ts</code> — 1</summary>

- **C537** _[tool-annotations · generated-from-repo-code]_ **get-key-stages-subject-units annotations (behaviour hints)** — readOnlyHint:true, destructiveHint:false, idempotentHint:true, openWorldHint:false

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-key-stages.ts</code> — 1</summary>

- **C542** _[tool-annotations · generated-from-repo-code]_ **get-key-stages annotations (behaviour hints)** — readOnlyHint:true, destructiveHint:false, idempotentHint:true, openWorldHint:false

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-keywords.ts</code> — 1</summary>

- **C548** _[tool-annotations · generated-from-repo-code]_ **get-keywords annotations (behaviour hints)** — readOnlyHint:true, destructiveHint:false, idempotentHint:true, openWorldHint:false

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-lessons-assets.ts</code> — 1</summary>

- **C557** _[tool-annotations · generated-from-repo-code]_ **get-lessons-assets annotations (behaviour hints)** — readOnlyHint:true, destructiveHint:false, idempotentHint:true, openWorldHint:false

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-lessons-quiz.ts</code> — 1</summary>

- **C564** _[tool-annotations · generated-from-repo-code]_ **get-lessons-quiz annotations (behaviour hints)** — readOnlyHint:true, destructiveHint:false, idempotentHint:true, openWorldHint:false

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-lessons-summary.ts</code> — 1</summary>

- **C570** _[tool-annotations · generated-from-repo-code]_ **get-lessons-summary annotations (behaviour hints)** — readOnlyHint:true, destructiveHint:false, idempotentHint:true, openWorldHint:false

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-lessons-transcript.ts</code> — 1</summary>

- **C576** _[tool-annotations · generated-from-repo-code]_ **get-lessons-transcript annotations (behaviour hints)** — readOnlyHint:true, destructiveHint:false, idempotentHint:true, openWorldHint:false

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-programmes-assets.ts</code> — 1</summary>

- **C587** _[tool-annotations · generated-from-repo-code]_ **get-programmes-assets annotations (behaviour hints)** — readOnlyHint:true, destructiveHint:false, idempotentHint:true, openWorldHint:false

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-programmes-questions.ts</code> — 1</summary>

- **C596** _[tool-annotations · generated-from-repo-code]_ **get-programmes-questions annotations (behaviour hints)** — readOnlyHint:true, destructiveHint:false, idempotentHint:true, openWorldHint:false

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-programmes-units.ts</code> — 1</summary>

- **C602** _[tool-annotations · generated-from-repo-code]_ **get-programmes-units annotations (behaviour hints)** — readOnlyHint:true, destructiveHint:false, idempotentHint:true, openWorldHint:false

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-programmes.ts</code> — 1</summary>

- **C607** _[tool-annotations · generated-from-openapi]_ **↑oak-api** **annotations block** — readOnlyHint:true, destructiveHint:false, idempotentHint:true, openWorldHint:false

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-rate-limit.ts</code> — 1</summary>

- **C611** _[tool-annotations · generated-from-openapi]_ **↑oak-api** **annotations block** — readOnlyHint:true, destructiveHint:false, idempotentHint:true, openWorldHint:false

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-sequences-assets.ts</code> — 1</summary>

- **C618** _[tool-annotations · generated-from-openapi]_ **↑oak-api** **annotations block** — readOnlyHint:true, destructiveHint:false, idempotentHint:true, openWorldHint:false

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-sequences-questions.ts</code> — 1</summary>

- **C627** _[tool-annotations · generated-from-openapi]_ **↑oak-api** **annotations block** — readOnlyHint:true, destructiveHint:false, idempotentHint:true, openWorldHint:false

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-sequences-units.ts</code> — 1</summary>

- **C633** _[tool-annotations · generated-from-openapi]_ **↑oak-api** **annotations block** — readOnlyHint:true, destructiveHint:false, idempotentHint:true, openWorldHint:false

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-sequences.ts</code> — 1</summary>

- **C638** _[tool-annotations · generated-from-openapi]_ **↑oak-api** **annotations block** — readOnlyHint:true, destructiveHint:false, idempotentHint:true, openWorldHint:false

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-subject-detail.ts</code> — 1</summary>

- **C643** _[tool-annotations · generated-from-openapi]_ **↑oak-api** **annotations block** — readOnlyHint:true, destructiveHint:false, idempotentHint:true, openWorldHint:false

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-subjects-key-stages.ts</code> — 1</summary>

- **C648** _[tool-annotations · generated-from-openapi]_ **↑oak-api** **annotations block** — readOnlyHint:true, destructiveHint:false, idempotentHint:true, openWorldHint:false

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-subjects-programmes.ts</code> — 1</summary>

- **C653** _[tool-annotations · generated-from-openapi]_ **↑oak-api** **annotations block** — readOnlyHint:true, destructiveHint:false, idempotentHint:true, openWorldHint:false

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-subjects-years.ts</code> — 1</summary>

- **C658** _[tool-annotations · generated-from-openapi]_ **↑oak-api** **annotations block** — readOnlyHint:true, destructiveHint:false, idempotentHint:true, openWorldHint:false

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-subjects.ts</code> — 1</summary>

- **C662** _[tool-annotations · generated-from-openapi]_ **↑oak-api** **annotations block** — readOnlyHint:true, destructiveHint:false, idempotentHint:true, openWorldHint:false

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-threads-units.ts</code> — 1</summary>

- **C667** _[tool-annotations · generated-from-openapi]_ **↑oak-api** **annotations block** — readOnlyHint:true, destructiveHint:false, idempotentHint:true, openWorldHint:false

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-threads.ts</code> — 1</summary>

- **C671** _[tool-annotations · generated-from-openapi]_ **↑oak-api** **annotations block** — readOnlyHint:true, destructiveHint:false, idempotentHint:true, openWorldHint:false

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/src/types/generated/api-schema/mcp-tools/tools/get-units-summary.ts</code> — 1</summary>

- **C676** _[tool-annotations · generated-from-openapi]_ **↑oak-api** **annotations block** — readOnlyHint:true, destructiveHint:false, idempotentHint:true, openWorldHint:false

</details>

### other — 39 items

Uncategorised / mixed.

<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/auth/mcp-auth/mcp-auth.ts</code> — 1</summary>

- **C398** _[response-format-template · authored-template]_ **⚑high-impact** **sendInvalidResourceResponse** — error="invalid_token", error_description="${reason}" ; body { error: 'Unauthorized', message: reason } `user-input-interpolation` `possible-defect-reported`

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/landing-page/render-prompts-section.ts</code> — 2</summary>

- **C358** _[response-format-template · authored-template]_ **⚑high-impact** **prompt list-item display template** — <li><code>${escapeHtml(prompt.name)}</code><span class="tool-desc">${escapeHtml(prompt.description)}</span>${argList}</li> `user-input-interpolation`
- **C359** _[response-format-template · authored-template]_ **⚑high-impact** **prompt arguments labels ('Arguments:', '(optional)')** — Arguments: <code>${a.name}</code>${a.required ? '' : ' (optional)'} `user-input-interpolation`

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/landing-page/render-resources-section.ts</code> — 1</summary>

- **C361** _[response-format-template · authored-template]_ **⚑high-impact** **resource list-item display template** — <li><code>${resource.uri}</code><span class="resource-title">${resource.title}</span><span class="tool-desc">${resource.description}</span></li> `user-input-interpolation`

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/landing-page/render-tools-section.ts</code> — 1</summary>

- **C368** _[response-format-template · authored-template]_ **⚑high-impact** **tool list-item display template** — <details class="tool-item"><summary><code>${tool.name}</code></summary>${descContent}</details> `user-input-interpolation`

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/oauth-proxy/oauth-proxy-response.ts</code> — 1</summary>

- **C404** _[response-format-template · authored-template]_ **⚑high-impact** **mapNonJsonErrorResponse** — description = trimmed==='' ? `Upstream returned ${status}` : sanitise(trimmed); status 429?temporarily_unavailable:server_error; headers Retry-After `user-input-interpolation`

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/oauth-proxy/oauth-proxy-upstream.ts</code> — 1</summary>

- **C407** _[response-format-template · authored-template]_ **⚑high-impact** **formatProxyErrorResponse** — return { error, error_description: errorDescription }

</details>
<details><summary><code>apps/oak-curriculum-mcp-streamable-http/src/register-prompts.ts</code> — 7</summary>

- **C329** _[prompt-name-or-description · leaf-authored]_ **⚑high-impact** **prompt find-lessons (title 'Find Lessons' + description)** — name:'find-lessons' title:'Find Lessons' — 'Find curriculum lessons on a specific topic. Searches across all subjects and key stages.'
- **C330** _[prompt-name-or-description · leaf-authored]_ **⚑high-impact** **prompt lesson-planning (title 'Lesson Planning' + description)** — 'Build a complete, teachable lesson on a topic, grounded in Oak's live curriculum data and six curriculum principles — outcome, key learning points, keywords, m
- **C331** _[prompt-name-or-description · leaf-authored]_ **⚑high-impact** **prompt explore-curriculum (title 'Explore Curriculum' + description)** — 'Explore what Oak has on a topic across the whole curriculum. Searches lessons, units, and threads in parallel.'
- **C332** _[prompt-name-or-description · leaf-authored]_ **⚑high-impact** **prompt learning-progression (title 'Learning Progression' + description)** — 'Understand how a concept builds across year groups by searching progression threads and mapping dependencies.'
- **C333** _[prompt-name-or-description · leaf-authored]_ **⚑high-impact** **prompt curriculum-mapping (title 'Curriculum Mapping' + description)** — "Build or audit a curriculum map — unit order across a year or key stage — grounded in Oak's threads, prerequisites, and national-curriculum coverage."
- **C334** _[prompt-name-or-description · leaf-authored]_ **⚑high-impact** **prompt adapt-lesson (title 'Adapt Lesson with EEF Evidence' + description, EEF-gated)** — 'Adapt an Oak lesson grounded in EEF Teaching and Learning Toolkit evidence, presenting evidence-calibrated options with caveats and attribution intact.'
- **C335** _[prompt-name-or-description · leaf-authored]_ **⚑high-impact** **prompt continue-progression (title 'Continue Progression' + description)** — "Plan the next step from where your class is: state what they just covered and get the next unit from Oak's sequence, a checkable readiness list, and the miscon

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-asset-download/execution.ts</code> — 1</summary>

- **C167** _[response-format-template · authored-template]_ **⚑high-impact** **runDownloadAssetTool summary template** — Download link (valid for 5 minutes): ${url} `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-browse/execution.ts</code> — 1</summary>

- **C144** _[response-format-template · authored-template]_ **⚑high-impact** **browse annotationsTitle** — annotationsTitle: 'Browse Curriculum'

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-browse/formatting.ts</code> — 1</summary>

- **C146** _[response-format-template · authored-template]_ **⚑high-impact** **buildBrowseSummary found case** — `Found ${String(count)} curriculum ${word}${filterText}`  // word=programme/programmes; filterText=` for ...` `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-explore/formatting.ts</code> — 2</summary>

- **C106** _[response-format-template · authored-template]_ **⚑high-impact** **buildTopicMapSummary (found branch + plural labels)** — `Found ${parts.join(', ')} about "${topic}"` ; labels: 'learning thread'/'learning threads' `user-input-interpolation`
- **C109** _[response-format-template · authored-template]_ **⚑high-impact** **formatTopicMap summary composition** — summary: `${summary}. ${nextSteps}` `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-fetch/execution.ts</code> — 2</summary>

- **C157** _[response-format-template · authored-template]_ **⚑high-impact** **buildFetchSummary** — `Fetched ${typeName}: ${slug}${urlPart}`  // urlPart=` (${oakUrl})` `user-input-interpolation`
- **C158** _[response-format-template · authored-template]_ **⚑high-impact** **fetch annotationsTitle** — annotationsTitle: 'Fetch Curriculum Resource'

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-keyword-graph.ts</code> — 1</summary>

- **C228** _[response-format-template · authored-template]_ **⚑high-impact** **summariseKeywords (populated)** — Top ${shown} of ${total} keywords for ${subject} at ${keyStage}${narrowed ? ' (narrowed)' : ''}, ranked by in-scope lesson placements. `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-misconception-graph-summaries.ts</code> — 4</summary>

- **C242** _[response-format-template · authored-template]_ **⚑high-impact** **withUnknownClause** — ${base} ${String(unknownAnchors.length)} unknown anchor slug${...} reported in unknownAnchors. `user-input-interpolation`
- **C243** _[response-format-template · authored-template]_ **⚑high-impact** **summariseLessons** — Misconceptions for ${...} anchor lesson(s): ${...} misconception(s). `user-input-interpolation`
- **C244** _[response-format-template · authored-template]_ **⚑high-impact** **summariseUnits** — Misconceptions for ${...} anchor unit(s): ${...} lesson(s) with their misconceptions. `user-input-interpolation`
- **C245** _[response-format-template · authored-template]_ **⚑high-impact** **summariseThread** — Misconceptions for thread window: units ${from}–${to} of ${total}${hasMore ? ' (more available via unitOffset)' : ''}. `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-prior-knowledge-graph.ts</code> — 1</summary>

- **C250** _[response-format-template · authored-template]_ **⚑high-impact** **summariseSubgraph** — Prior-knowledge subgraph for ${...} anchor unit${...} at depth ${...}: ${...} units, ${...} prerequisiteFor edges. `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-search/formatting.ts</code> — 3</summary>

- **C085** _[response-format-template · authored-template]_ **⚑high-impact** **SCOPE_LABELS** — lessons:'lesson', units:'unit', threads:'learning thread', sequences:'sequence', suggest:'suggestion' `user-input-interpolation`
- **C087** _[response-format-template · authored-template]_ **⚑high-impact** **buildSearchSummary (found copy)** — Found ${String(total)} ${plural} matching "${query}" `user-input-interpolation`
- **C089** _[response-format-template · authored-template]_ **⚑high-impact** **buildSuggestSummary (found copy)** — Found ${String(count)} ${word} for "${prefix}" `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/aggregated-thread-progressions.ts</code> — 2</summary>

- **C258** _[response-format-template · authored-template]_ **⚑high-impact** **summariseProgression** — Thread "${progression.thread.title}": ${...} unit placements${span}, ordered by teaching year. `user-input-interpolation`
- **C259** _[response-format-template · authored-template]_ **⚑high-impact** **summariseDiscovery** — ${...} thread(s) with ${discovery.subject} units at ${discovery.keyStage}. Anchor get-thread-progressions with a threadSlug for the ordered progression. `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/classify-error-response.ts</code> — 1</summary>

- **C312** _[response-format-template · authored-template]_ **⚑high-impact** **classifyUndocumentedResponse message templates** — error.upstreamMessage ? `${prefix} (${statusStr}): ${error.upstreamMessage}` : `${prefix}: status ${statusStr}` `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/search-retrieval-stub.ts</code> — 1</summary>

- **C320** _[other · leaf-authored]_ **⚑high-impact** **stub suggest cache metadata (version '1', ttlSeconds 300)** — suggest: () => Promise.resolve(ok({ suggestions: [], cache: { version: '1', ttlSeconds: 300 } }))

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/stub-tool-executor.ts</code> — 1</summary>

- **C709** _[other · leaf-authored]_ **⚑high-impact** **stub-mode ships-to-production (OWNER CALL)** — const stubExecutor = runtimeConfig.useStubTools ? createStubToolExecutionAdapter() : undefined `boundary-owner-call`

</details>
<details><summary><code>packages/sdks/oak-curriculum-sdk/src/mcp/universal-tools/executor.ts</code> — 1</summary>

- **C057** _[response-format-template · authored-template]_ **⚑high-impact** **generated-tool result summary template `${title}: ${status}`** — summary: `${title}: ${String(result.value.status)}`, `user-input-interpolation`

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/code-generation/generate-ai-doc-catalog.ts</code> — 2</summary>

- **C415** _[response-format-template · authored-template]_ **⚑high-impact** **renderSingleEndpoint: per-endpoint entry template** — lines.push(`### ${method.toUpperCase()} ${path}`); maybePush('operationId'…); maybePush('summary'…); maybePush('description'…); lines.push('Parameters:', …) `user-input-interpolation`
- **C417** _[response-format-template · authored-template]_ **⚑high-impact** **renderParamLine: parameter line template** — return `- ${info.loc} ${info.name} (${info.typeName}${enumText})${requiredText}`; // enumText=` enum:N`, requiredText=' - required'

</details>
<details><summary><code>packages/sdks/oak-sdk-codegen/code-generation/schema-enhancement-404.ts</code> — 1</summary>

- **C427** _[response-format-template · authored-template]_ **⚑high-impact** **add404ResponsesWhereExpected: injected 404 response description template** — description: ['Temporary: Documented locally until the upstream schema captures this legitimate 404 response.', descriptor.reason, `Tracking: ${descriptor.upstr `user-input-interpolation`

</details>

---

_Generated deterministically from `registry.json`. Regenerate with the build scripts recorded in the report's Method section._
