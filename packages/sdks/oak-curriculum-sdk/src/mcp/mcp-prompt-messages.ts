/**
 * Message generators for MCP prompt responses.
 *
 * Each function produces an array of messages that guide the model
 * to use the appropriate tools in the correct order for a workflow.
 *
 * @remarks Extracted from mcp-prompts.ts to keep file sizes within
 * ESLint max-lines limits. All content is static and added at SDK
 * compile time, complying with schema-first principles.
 */

import type { PromptMessage } from './mcp-prompt-types.js';

/**
 * Generates messages for the find-lessons prompt.
 *
 * @param args - User-provided arguments (topic, optional keyStage)
 * @returns Messages guiding the model to search with scope "lessons"
 */
export function getFindLessonsMessages(
  args: Readonly<Record<string, string | undefined>>,
): PromptMessage[] {
  const topic = args.topic ?? 'the topic';
  const keyStage = args.keyStage;

  const keyStageNote = keyStage ? ` Focus on ${keyStage} content.` : '';
  const keyStageParam = keyStage ? `, keyStage: "${keyStage}"` : '';

  return [
    {
      role: 'user',
      content: {
        type: 'text',
        text: `I want to find lessons about "${topic}".${keyStageNote}

Before searching, call get-curriculum-model for a complete understanding of the curriculum domain model and available tools.

Please:
1. Use search with scope "lessons" to find lessons matching this topic: search({ query: "${topic}", scope: "lessons"${keyStageParam} })
2. Review the results and identify the most relevant lessons
3. For the top 3-5 lessons, provide a brief summary of what each covers
4. Suggest which lesson might be best for different learning objectives
5. Use fetch to get full details for the most promising lesson`,
      },
    },
  ];
}

/**
 * Generates messages for the lesson-planning prompt — the complete
 * lesson-build workflow. Derived from the `oak-lesson-builder` skill
 * (oaknational/oak-skills): plan and build a teachable lesson grounded in
 * Oak's live curriculum data and six curriculum principles, with the
 * source skill's attribution carried (Oak data under OGL v3.0).
 *
 * @param args - User-provided arguments (topic, yearGroup)
 * @returns Messages guiding the model through the full lesson-build flow
 */
export function getLessonPlanningMessages(
  args: Readonly<Record<string, string | undefined>>,
): PromptMessage[] {
  const topic = args.topic ?? 'the topic';
  const yearGroup = args.yearGroup ?? 'the year group';

  return [
    {
      role: 'user',
      content: {
        type: 'text',
        text: `I'm planning a lesson on "${topic}" for ${yearGroup}. Help me build a complete, teachable lesson the way Oak National Academy does — grounded in Oak's live curriculum data and its six curriculum principles.

Call get-curriculum-model first for domain definitions, concept relationships, and tool usage guidance. MCP tool names may appear prefixed (e.g. mcp__<id>__get-lessons-summary); match them by the suffix.

Workflow:
1. Place the lesson. Use search with scope "lessons" to find Oak's analogue for "${topic}" for ${yearGroup} — narrow by the search tool's "year" parameter (lessons scope), passing the year number (for example, year: 4 for "Year 4") so results match the year group. Select the most relevant lesson, note the learning thread it belongs to, then take its unit slug and call get-prior-knowledge-graph({ unitSlugs: ["<unit-slug>"] }) to confirm the prior knowledge the lesson should assume.
2. Specify the knowledge. Pull the selected lesson's summary (get-lessons-summary) as a model and benchmark, and its transcript for the content delivery: draft one "I can…" pupil outcome, 3-5 precise key learning points, and keywords with pupil-facing definitions (get-keywords supplements the lesson's own list). Match Oak's precision.
3. Anticipate misconceptions from real data. Use get-misconception-graph plus the lesson summary's documented misconceptions; plan a diagnostic question and the teacher response around the errors pupils actually make, not guessed ones.
4. Sequence for learning. Open with retrieval of the prior knowledge from step 1; teach in chunks with worked examples; check understanding after each chunk.
5. Assess. Use get-lessons-quiz as the model: a starter quiz on the prerequisites and an exit quiz on the key learning points, with distractors that target the misconceptions so a wrong answer is diagnostic.
6. Gather resources. Get available assets (get-lessons-assets) and use download-asset to generate clickable download links for any assets I want. Components are optional and the data is live — check availability rather than assuming.

Assemble the lesson with: the pupil outcome; where it sits (thread and prior knowledge); key learning points; keywords; the lesson sequence; misconceptions to plan for; the starter quiz and exit quiz; resources and adaptation notes. Keep the same ambitious outcome for all pupils and vary the support, not the destination. Carry through any contentGuidance and supervisionLevel from the lesson summary.

The built lesson is a high-quality starting point, not a script — mark what is core and what I should adapt for my pupils; the teaching decisions are mine. If you produce slides, worksheets, or quizzes, meet WCAG 2.2 AA (alt text, heading and reading order, contrast).

Attribution: the lesson data is Oak National Academy's, published under the Open Government Licence v3.0 (https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/), which requires attribution — credit Oak National Academy and link to the lesson or unit on thenational.academy in anything derived from it. The Oak name and logo are trademarks, not covered by the OGL. This workflow follows Oak's six curriculum principles (Emma McCrea, "Our 6 principles guiding our approach to curriculum", Oak, 2023).`,
      },
    },
  ];
}

/**
 * Generates messages for the adapt-lesson prompt — the evidence-grounded lesson
 * adaptation workflow (EEF Toolkit). Evidence-grounding is how Oak adapts
 * lessons; the prompt instructs the agent to convert the free-form topic/year
 * group into finite EEF tool inputs, ground options in the EEF evidence, and
 * preserve caveats and attribution. The agent is the only reasoner (ADR-191).
 *
 * @param args - User-provided arguments (topic, yearGroup)
 * @returns Messages guiding the model through evidence-grounded adaptation
 */
export function getAdaptLessonMessages(
  args: Readonly<Record<string, string | undefined>>,
): PromptMessage[] {
  const topic = args.topic ?? 'the topic';
  const yearGroup = args.yearGroup ?? 'the year group';

  return [
    {
      role: 'user',
      content: {
        type: 'text',
        text: `I'm adapting a lesson on "${topic}" for ${yearGroup} and want it grounded in the EEF Teaching and Learning Toolkit evidence.

Call get-curriculum-model first for domain definitions and tool guidance. MCP tool names may appear prefixed (e.g. mcp__<id>__get-eef-evidence); match them by the suffix.

Workflow:
1. Use search (scope "lessons") to find the Oak material for "${topic}", narrowed to ${yearGroup}: the search tool filters lessons by year group through its "year" parameter — pass the year number (for example, year: 4 for "Year 4"), not a key stage, so results match ${yearGroup}. Then get the lesson summary, transcript, and quiz.
2. Surface the pedagogical signals: use get-misconception-graph (plus the quiz and transcript) to see the likely misconceptions for this lesson. For the prerequisite gaps, take the unit slug of the lesson you selected in step 1 and call get-prior-knowledge-graph({ unitSlugs: ["<unit-slug-from-step-1>"] }) — it returns the bounded prior-knowledge subgraph for that unit.
3. Name the pedagogical move each signal raises (this is your reasoning, not EEF data). Pick the real EEF strands for those moves from the strand index in the eef://interpretation resource — convert your free-form reasoning into the finite strand ids and axis values the tool accepts at the boundary.
4. Call get-eef-evidence with those finite inputs. Read eef://interpretation when applying the evidence so you interpret impact, cost, evidence strength, and caveats faithfully.
5. Give me the adapted lesson as evidence-calibrated options and trade-offs — not a single recommendation or selection, with a short rationale for each. The decision is mine to make.

Preserve attribution and caveats: cite EEF for the evidence (organisation, the EEF page link, and the named authors), and credit Oak National Academy under the Open Government Licence v3.0 for any reproduced Oak material, linking to the lesson. If you produce slides, worksheets, or quizzes, meet WCAG 2.2 AA (alt text, heading/reading order, contrast).`,
      },
    },
  ];
}

/**
 * Generates messages for the explore-curriculum prompt.
 *
 * @param args - User-provided arguments (topic, optional subject)
 * @returns Messages guiding the model to use explore-topic for broad discovery
 */
export function getExploreCurriculumMessages(
  args: Readonly<Record<string, string | undefined>>,
): PromptMessage[] {
  const topic = args.topic ?? 'the topic';
  const subject = args.subject;

  const subjectParam = subject ? `, subject: "${subject}"` : '';

  return [
    {
      role: 'user',
      content: {
        type: 'text',
        text: `I want to explore what Oak has about "${topic}".

Call get-curriculum-model first for domain definitions and tool guidance.

Please:
1. Use explore-topic to search across lessons, units, and threads in parallel: explore-topic({ query: "${topic}"${subjectParam} })
2. Review the topic map and summarise what is available
3. For the most relevant results, drill down using search with a specific scope
4. If there are learning threads, note how the topic develops across year groups
5. Suggest next steps based on what you find`,
      },
    },
  ];
}

/**
 * Generates messages for the learning-progression prompt.
 *
 * @param args - User-provided arguments (concept, subject)
 * @returns Messages guiding the model to map learning progressions via threads
 */
export function getLearningProgressionMessages(
  args: Readonly<Record<string, string | undefined>>,
): PromptMessage[] {
  const concept = args.concept ?? 'the concept';
  const subject = args.subject ?? 'the subject';

  return [
    {
      role: 'user',
      content: {
        type: 'text',
        text: `I want to understand how "${concept}" builds across year groups in ${subject}.

Call get-curriculum-model first for domain definitions and tool guidance.

Please:
1. Use search with scope "threads" to find progression threads: search({ query: "${concept}", scope: "threads", subject: "${subject}" })
2. Use get-thread-progressions for the full progression graph
3. Take the unit slugs of the thread units from steps 1-2 and call get-prior-knowledge-graph({ unitSlugs: ["<unit-slug-from-step-2>", "<another-unit-slug-from-step-2>"] }) with them for unit-level dependencies
4. Map out:
   - The progression from earliest to latest year group
   - Key prerequisites at each stage
   - How concepts build on previous learning
5. Identify any gaps or conceptual jumps
6. Suggest how to scaffold learning for students who need additional support`,
      },
    },
  ];
}
