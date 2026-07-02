/**
 * Static "In the training courses" content for the unified hub search — the LOCAL half's
 * training-section index. Demo by Heather W.
 *
 * SOURCE (verified first-hand): the canonical Claude Design export's `Oak Hub.dc.html`
 * `courseIndex()` (lines 229-253) — 21 authored training-course sections, each a
 * `{ sid, module, title, kw }` row. (Supersedes an earlier stub that wrongly claimed "no decoded
 * source exists": the
 * source is this inline index in the canonical hub page itself.) This is STATIC content — the local
 * complement to the live curriculum group (`useCurriculumSearch`) in the unified hero search.
 *
 * Match + result shape mirror the canonical `renderVals()`: filter on `title + module + kw`, and a
 * hit links to the course section (`/course#section=<sid>`). The JSON-free typed literal is
 * validated by TypeScript's compile-time check — no runtime guard at this controlled boundary.
 */

/** A single training-course section, mirroring the canonical `courseIndex()` row + a link-out. */
export interface TrainingCourse {
  /** Section id, e.g. `m4s4` — also the `#section=<id>` anchor on the course page. */
  id: string;
  /** The module the section belongs to, e.g. "Checks for understanding". */
  module: string;
  title: string;
  href: string;
  /** Search keywords (not displayed) — widens matching beyond title/module, per the canonical. */
  kw: string;
}

/** Build a section row with its canonical course-section link. */
function section(id: string, module: string, title: string, kw: string): TrainingCourse {
  return { id, module, title, href: `/course#section=${id}`, kw };
}

/** The 21 training-course sections, extracted verbatim from `Oak Hub.dc.html` `courseIndex()`. */
export const trainingCourses: readonly TrainingCourse[] = [
  section('u1m1s1', 'Oak lessons', 'Why Oak lessons matter', 'purpose reach classrooms'),
  section(
    'u1m1s2',
    'Oak lessons',
    'The eight lesson components',
    'slide deck worksheet quiz video components',
  ),
  section(
    'u1m1s4',
    'Oak lessons',
    'Lesson structure & vocabulary',
    'learning cycle outcome outline key learning points',
  ),
  section(
    'u1m2s1',
    'Curriculum information',
    'What is curriculum information?',
    'fit it cat curriculum authoring tool',
  ),
  section(
    'u1m2s3',
    'Curriculum information',
    'Review, create or iterate',
    'misconceptions outcome cat',
  ),
  section(
    'u1m3s1',
    'Core considerations',
    'Five areas to consider',
    'safety safeguarding accessibility',
  ),
  section(
    'u1m3s2',
    'Core considerations',
    'Accessibility & scaffolding',
    'send wcag contrast scaffold accessible accessibility',
  ),
  section(
    'u1m3s3',
    'Core considerations',
    'Diversity',
    'diversity diverse inclusive language gender stereotypes representation protected characteristics inclusion',
  ),
  section(
    'u1m3s4',
    'Core considerations',
    'Safety, safeguarding & content guidance',
    'safeguarding safety content guidance external links age appropriate',
  ),
  section(
    'm1s2',
    'The learning framework',
    'What is the learning framework?',
    'learning framework mccrea evidence',
  ),
  section(
    'm1s3',
    'The learning framework',
    'The seven stages',
    'fit own frame get use keep check stages',
  ),
  section(
    'm2s1',
    'High-quality explanation',
    'What is explanation?',
    'explanation explaining teaching strategy',
  ),
  section(
    'm2s2',
    'High-quality explanation',
    'Types of knowledge',
    'declarative procedural conditional knowledge',
  ),
  section(
    'm2s3',
    'High-quality explanation',
    'Three principles',
    'connected chunked clear explanation principles',
  ),
  section(
    'm2s4',
    'High-quality explanation',
    'Delivering explanations',
    'simple to complex part whole cognitive load small steps',
  ),
  section(
    'm3s1',
    'Enriching explanation',
    'Six ways to enrich',
    'examples non-examples images discussion modelling stories analogies',
  ),
  section(
    'm3s2',
    'Enriching explanation',
    'Worked examples in depth',
    'worked examples expertise reversal',
  ),
  section(
    'm4s1',
    'Checks for understanding',
    'What is a check for understanding?',
    'checks for understanding cfu cfus check responsiveness',
  ),
  section(
    'm4s2',
    'Checks for understanding',
    'Principles of good CfUs',
    'checks for understanding cfu cfus mini-whiteboard guessing misconceptions',
  ),
  section(
    'm4s3',
    'Checks for understanding',
    'Question types',
    'multiple choice short answer true false why checks cfu',
  ),
  section(
    'm4s4',
    'Checks for understanding',
    'Feedback',
    'feedback model response praise checks cfu',
  ),
];

/**
 * Filter training-course sections by a free-text query (case-insensitive across title, module, and
 * keywords), mirroring the canonical hub's local search. An empty query returns no results — parity
 * with the live curriculum group's idle state. Results are capped at `limit` for the results UI.
 *
 * @param query - the live search string (shared with the hero, like `useCurriculumSearch`)
 * @param limit - maximum results to return (default 24)
 */
export function searchTrainingCourses(query: string, limit = 24): TrainingCourse[] {
  const q = query.trim().toLowerCase();
  if (q === '') {
    return [];
  }
  return trainingCourses
    .filter((c) => `${c.title} ${c.module} ${c.kw}`.toLowerCase().includes(q))
    .slice(0, limit);
}
