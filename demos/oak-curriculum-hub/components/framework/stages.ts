/**
 * The seven stages of the Oak learning framework, extracted verbatim from the canonical export's
 * `embeds/LearningFramework.jsx` `STAGES` array (adapted from McCrea, P., Developing Expert Teaching,
 * 2023). Static vendored content — validated by TypeScript's compile-time type check at this
 * controlled boundary, no runtime guard. The per-stage `color`/`ink` are the export's raw diagram
 * palette (a chart-style colour set, correctly inline rather than tokenised — like a data-derived
 * chart palette).
 */

/** A single stage of the learning framework. */
export interface FrameworkStage {
  /** 1-based stage number (1 = "Fit it" … 7 = "Check it"). */
  readonly n: number;
  /** The stage's short name, e.g. "Fit it". */
  readonly key: string;
  /** When the stage happens, e.g. "Before the lesson". */
  readonly phase: string;
  /** One-line summary of what the stage ensures. */
  readonly desc: string;
  /** The fuller explanation of the stage. */
  readonly long: string;
  /** The Oak features that support the stage. */
  readonly features: readonly string[];
  /** Ring-segment fill colour (raw hex, the export's diagram palette). */
  readonly color: string;
  /** Label ink colour on the ring segment (raw hex). */
  readonly ink: string;
}

const GREEN = '#287c34';
const WHITE = '#ffffff';

/** The seven stages, in walk-through order. */
export const FRAMEWORK_STAGES: readonly FrameworkStage[] = [
  {
    n: 1,
    key: 'Fit it',
    phase: 'Before the lesson',
    desc: 'Ensuring pupils are learning the right knowledge.',
    long: 'The teacher fits learning to the pupil — working out the next thing pupils need to learn, based on what they already know.',
    features: ['Curriculum sequence & information', 'Unit & lesson information on the website'],
    color: '#cacaca',
    ink: '#222222',
  },
  {
    n: 2,
    key: 'Own it',
    phase: 'In a lesson',
    desc: 'Ensuring pupils are motivated to learn.',
    long: 'We pay attention to what we’re motivated to do. Build motivation by engineering success and piquing pupils’ interest.',
    features: [
      'Prior knowledge starter quiz',
      'Motivational nudges, enthusiasm & tone',
      'An accessible web experience',
    ],
    color: GREEN,
    ink: WHITE,
  },
  {
    n: 3,
    key: 'Frame it',
    phase: 'In a lesson',
    desc: 'Ensuring pupils build on and link to existing knowledge.',
    long: 'New knowledge is built on prior knowledge — like laying bricks. Prime pupils to bring to mind what they already know.',
    features: ['Prior knowledge starter quiz', 'Explanation linking new to prior learning'],
    color: GREEN,
    ink: WHITE,
  },
  {
    n: 4,
    key: 'Get it',
    phase: 'In a lesson',
    desc: 'Helping pupils to understand the knowledge.',
    long: 'Break knowledge into manageable chunks and explain it — using modelling and analogy so pupils think hard about it.',
    features: ['Explicit explanation phases', 'Modelling'],
    color: GREEN,
    ink: WHITE,
  },
  {
    n: 5,
    key: 'Use it',
    phase: 'In a lesson',
    desc: 'Ensuring pupils practise application of the knowledge.',
    long: 'Practice — where pupils put their new learning to use and make it their own.',
    features: ['Explicit practice phases', 'Quizzing'],
    color: GREEN,
    ink: WHITE,
  },
  {
    n: 6,
    key: 'Keep it',
    phase: 'Over time',
    desc: 'Ensuring the knowledge sticks.',
    long: 'The most effective learning takes months to secure. We forget naturally — so we revisit knowledge at spaced intervals to boost retention.',
    features: ['Implicit retrieval throughout a unit', 'Unit-level quiz'],
    color: '#15401d',
    ink: WHITE,
  },
  {
    n: 7,
    key: 'Check it',
    phase: 'Throughout',
    desc: 'Checking and course-correcting throughout.',
    long: 'Teachers check understanding and respond to what they find — and this happens alongside every other stage, enclosing the whole model.',
    features: [
      'Checks for understanding',
      'Explicit feedback phases',
      'Model task responses',
      'Assessment exit quiz',
    ],
    color: '#575757',
    ink: WHITE,
  },
];
