import { err, ok, type Result } from '@oaknational/result';

import { splitLineBytes } from './refounding-artefacts.js';
import { RESIDUE_BOUNDS_V1 } from './refound-residue-model.js';

/**
 * Pure logic for `refound-plant-orphan` (F1 §9's discrimination proof plus
 * the plan-todo's wider plant set): the planted texts themselves,
 * deterministic target selection, and byte-exact insertion helpers. All
 * plants land on SCRATCH COPIES only — the runner owns staging; nothing
 * here touches a filesystem. The outcome shape and committed-transcript
 * rendering live in `refound-plant-orphan-transcript.ts`.
 *
 * @remarks
 * The plant texts are the proof's sharp edges, so they are versioned
 * constants whose net-invisibility is asserted MECHANICALLY in unit tests
 * (running the real nets over them), never by eyeball:
 *
 * - {@link PREAMBLE_PLANT_LINES_V1}: 30 work-bearing prose lines with no
 *   net-matching surface — keywords deliberately misspelt, no list markers,
 *   no headings (F1 §9 plant 1).
 * - {@link MISSPELT_KEYWORD_PLANT_LINE_V1} /
 *   {@link CONTROL_KEYWORD_PLANT_LINE_V1}: a single work line differing
 *   ONLY in the Net-C keyword's spelling. The misspelt form must land in
 *   residue, not inventory; the control form must shift the per-net diff by
 *   exactly one, in Net C alone — proving the nets never "almost-match"
 *   (F1 §9 plant 2).
 * - {@link SWEEP_PARAPHRASE_PLANT_LINE_V1} /
 *   {@link SWEEP_CONTROL_PLANT_LINE_V1}: the MARKER-FREE work-bearing
 *   paraphrase for the sweep net plus its live-scanner control. In ONE scan
 *   over the planted copy the paraphrase must return ZERO hits while the
 *   control HITS — honest single-net blindness proven against a scanner
 *   demonstrably alive, the residue signal the G1 item-6 reader-sample cure
 *   exists for (plan P4; F2 §6 canary hygiene).
 *
 * @packageDocumentation
 */

/**
 * Plant 1: the anchorless work-bearing 30-line preamble. Every line carries
 * meaning a reader would conserve; no line offers the nets any surface.
 */
export const PREAMBLE_PLANT_LINES_V1: readonly string[] = [
  'this preamble records work that was never captured by the plan body below',
  'the migration of the ledger checker remains unfinishedd and unrecorded here',
  'someone must revisit the parser rewrite because the stauts was never settled',
  'the acceptence criteria for the exporter were sketched but never ratified',
  'a decission about the index layout is still owed to the working group',
  'the crawler work is blockd on a credential nobody has requested yet',
  'the review queue holds three unansweredd questions about the schema shape',
  'a follow up was promised for the tokeniser audit and never scheduled',
  'the export path depnds on a bucket that was renamed last quarter',
  'the summary tables were drafted without the counts they were meant to carry',
  'nobody transcribed the whiteboard notes from the second design sitting',
  'the retry logic still lacks the backoff curve the incident review asked for',
  'the glossary entries for the lane vocabulary were promised and forgotten',
  'an unfinished sketch of the batching arithmetic sits in a private notebook',
  'the validator inventory misses two checks that exist only in shell history',
  'the fixture corpus was trimmed by hand and the trimming rule went unwritten',
  'a rename of the artefact home was agreed verbally and never enacted',
  'the costing sheet for the reader sample was started twice and finished never',
  'the encoding audit covered half the estate before attention moved elsewhere',
  'the archived branch holds a fix that was never ported to the mainline',
  'the interview notes name a failure mode no current probe can reproduce',
  'the calibration window arithmetic was checked on paper and nowhere else',
  'a quiet assumption about sort order underpins the merge and is undocumented',
  'the rollback drill was rehearsed once and the transcript was misplaced',
  'the capacity estimate ignores the archive surfaces entirely and knowingly',
  'the reviewer rota for the challenge stream was drafted and not circulated',
  'the sampling seed for the reader windows lives in a message, not a file',
  'the deprecation notice for the old tooling was written and never posted',
  'the handover memo lists four risks and offers remedies for none of them',
  'this entire preamble is the planted proof that anchorless work is visible',
];

/**
 * Plant 2, misspelt form: one work-bearing line whose Net-C keyword is
 * deliberately misspelt (`stauts`). Must appear in residue, never in
 * inventory.
 */
export const MISSPELT_KEYWORD_PLANT_LINE_V1 =
  'the stauts of the ledgerr work was never captured and someone must revisit it';

/**
 * Plant 2, control form: the SAME line with the keyword spelt correctly
 * (`status:`). Must be captured by Net C alone.
 */
export const CONTROL_KEYWORD_PLANT_LINE_V1 = MISSPELT_KEYWORD_PLANT_LINE_V1.replace(
  'stauts',
  'status:',
);

/**
 * Plant 3: the marker-free work-bearing paraphrase for the sweep net. The
 * sweep MUST stay blind to it (zero hits) while it sits verifiably in the
 * staged copy.
 */
export const SWEEP_PARAPHRASE_PLANT_LINE_V1 =
  'we never finished porting the ledger checks and someone must return to this';

/**
 * Plant 3's live-scanner CONTROL: a marker-bearing line planted into the
 * SAME staged copy and scanned in the SAME sweep run as the paraphrase. It
 * MUST hit — an always-empty (dead) scanner would otherwise fake the
 * blindness disclosure with a vacuous zero.
 */
export const SWEEP_CONTROL_PLANT_LINE_V1 = 'todo: port me (sweep live-scanner control plant)';

/**
 * Judge plant 3's scan facts: the sweep must be BLIND to the paraphrase yet
 * ALIVE on the control, both measured in one scan. Returns operator-readable
 * failure strings; empty means the proof fired.
 */
export function sweepBlindnessFailures(facts: {
  readonly plantPresentInCopy: boolean;
  readonly sweepHitsForPlant: number;
  readonly sweepHitsForControl: number;
}): readonly string[] {
  const failures: string[] = [];
  if (!facts.plantPresentInCopy) {
    failures.push('the paraphrase plant is not present in the staged copy');
  }
  if (facts.sweepHitsForPlant !== 0) {
    failures.push('the sweep saw the marker-free paraphrase — the blindness disclosure is false');
  }
  if (facts.sweepHitsForControl === 0) {
    failures.push(
      'the live-scanner control line did not hit — an always-empty scanner cannot prove blindness',
    );
  }
  return failures;
}

/** One file's shape, as the plant-target selector sees it. */
export interface PlantTargetCandidate {
  readonly path: string;
  readonly lines: number;
  readonly anchors: number;
  readonly firstLineIsHeading: boolean;
  readonly orphanCandidates: number;
}

/**
 * Deterministically pick the preamble-plant target: the FIRST candidate (in
 * denominator order) that keeps the proof sharp — line 1 a HEADING anchor
 * specifically (so the planted preamble is exactly lines 1–30 and the
 * keyword plant at line 2 sits in prose; a frontmatter-led file whose line 1
 * is a `---` fence breaks BOTH proofs — the first post-plant anchor moves to
 * line 32, and a line-2 insertion lands INSIDE frontmatter, a Net-A
 * capture), no baseline orphan candidates in the file (so the diff is
 * exactly one), and a post-plant anchor ratio still at or above the residue
 * floor (so rule (c) cannot fire as a side effect).
 */
export function selectPlantTarget(
  candidates: readonly PlantTargetCandidate[],
): Result<string, Error> {
  const plantLineCount = PREAMBLE_PLANT_LINES_V1.length;
  for (const candidate of candidates) {
    const postPlantRatioSafe =
      candidate.anchors * 100 >=
      (candidate.lines + plantLineCount) * RESIDUE_BOUNDS_V1.minFileAnchorRatioPercent;
    if (
      candidate.lines > 0 &&
      candidate.firstLineIsHeading &&
      candidate.orphanCandidates === 0 &&
      postPlantRatioSafe
    ) {
      return ok(candidate.path);
    }
  }
  return err(
    new Error(
      'no plant target qualifies: need a file whose first line is a HEADING anchor (not a ' +
        'frontmatter fence), with no baseline orphan candidates, whose post-plant anchor ratio ' +
        'stays at or above the residue floor',
    ),
  );
}

const LF = Buffer.from('\n');

/**
 * Prepend plant lines verbatim (LF-terminated) to a file's bytes. Every
 * original byte is preserved untouched after the plant.
 */
export function insertLinesAtTop(bytes: Uint8Array, lines: readonly string[]): Uint8Array {
  return Buffer.concat([Buffer.from(`${lines.join('\n')}\n`, 'utf8'), bytes]);
}

/**
 * Insert one line after the given 1-based line. Surrounding lines keep
 * their exact bytes (CRs included); the file's final-LF presence is
 * preserved; the planted line itself is LF-separated.
 */
export function insertLineAfter(bytes: Uint8Array, afterLine: number, text: string): Uint8Array {
  const lines = splitLineBytes(bytes).map((line) => Buffer.from(line));
  const clamped = Math.min(Math.max(afterLine, 0), lines.length);
  lines.splice(clamped, 0, Buffer.from(text, 'utf8'));
  const endsWithLf = bytes.length > 0 && bytes.at(-1) === 0x0a;
  const parts: Buffer[] = [];
  for (let index = 0; index < lines.length; index += 1) {
    if (index > 0) {
      parts.push(LF);
    }
    parts.push(lines[index] ?? Buffer.alloc(0));
  }
  if (endsWithLf) {
    parts.push(LF);
  }
  return Buffer.concat(parts);
}
