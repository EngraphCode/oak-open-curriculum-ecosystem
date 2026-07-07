/**
 * The committed transcript of `refound-plant-orphan` (F1 §9): the proof
 * outcome shape and its rendering to `proofs/orphan-discrimination.v1.md`.
 * Pure — the plant texts and selection logic live in
 * `refound-plant-orphan-model.ts`; the orchestration in
 * `refound-plant-orphan-runner.ts`.
 *
 * @packageDocumentation
 */

/** Discrimination-proof transcript path relative to the artefact home. */
export const DISCRIMINATION_PROOF_SEGMENT = 'proofs/orphan-discrimination.v1.md';

/** What the three discrimination proofs measured (all detectors fired). */
export interface PlantOrphanOutcome {
  readonly preamble: {
    readonly file: string;
    readonly lineStart: number;
    readonly lineEnd: number;
    readonly reasons: readonly string[];
  };
  readonly keyword: {
    readonly file: string;
    readonly plantedLine: number;
    readonly misspeltInInventory: boolean;
    readonly misspeltInResidueBlock: boolean;
    readonly controlNets: readonly string[];
    readonly netCShift: number;
  };
  readonly sweep: {
    readonly file: string;
    readonly plantedLine: number;
    readonly plantPresentInCopy: boolean;
    readonly sweepHitsForPlant: number;
    readonly sweepHitsForControl: number;
  };
}

/**
 * Render the committed transcript for
 * `proofs/orphan-discrimination.v1.md`: a human narrative plus a fenced
 * machine-readable JSON block. Deliberately timestamp-free — the transcript
 * is a pure function of the proof outcome, so double runs are
 * byte-identical (the determinism contract).
 */
export function buildDiscriminationTranscript(outcome: PlantOrphanOutcome): string {
  const machine = JSON.stringify(outcome, null, 2);
  return [
    '# Orphan-discrimination proof (v1)',
    '',
    'Planted-defect discrimination proofs for the refounding nets (F1 §9 plus the',
    'plan-todo plant set). Every plant ran on a STAGED SCRATCH COPY; the frozen',
    'tree was never touched. A zero-orphan residue result is acceptable only',
    'alongside this transcript, and the proof re-runs after ANY net or bound',
    'change.',
    '',
    '## Plant 1 — anchorless work-bearing preamble',
    '',
    `Planted 30 net-invisible work-bearing lines at the top of \`${outcome.preamble.file}\`.`,
    `Residue gained EXACTLY ONE orphan candidate at lines ` +
      `${String(outcome.preamble.lineStart)}-${String(outcome.preamble.lineEnd)} ` +
      `(reasons: ${outcome.preamble.reasons.join(', ')}); every other file's candidates`,
    'were unchanged.',
    '',
    '## Plant 2 — misspelt Net-C keyword work line',
    '',
    `Planted one work line with a misspelt keyword at line ` +
      `${String(outcome.keyword.plantedLine)} of \`${outcome.keyword.file}\`. It appeared in`,
    'residue, NOT in inventory, and the correctly-spelt control shifted the per-net',
    `diff by exactly one, in Net C alone (nets: ${outcome.keyword.controlNets.join(', ')}) —`,
    'the nets do not silently almost-match.',
    '',
    '## Plant 3 — marker-free sweep paraphrase (honest blindness)',
    '',
    `Planted a MARKER-FREE work-bearing paraphrase at line ` +
      `${String(outcome.sweep.plantedLine)} of a staged copy of \`${outcome.sweep.file}\`.`,
    'The sweep net returned ZERO hits for it while the plant was verifiably present',
    `in the copy, and a marker-bearing control line planted in the SAME copy hit ` +
      `${String(outcome.sweep.sweepHitsForControl)} time(s) in the SAME scan — the scanner`,
    'was live, and the sweep net ALONE still cannot see marker-free work. This is',
    'the honest residue signal the G1 item-6 reader-sample cure exists for; it is a',
    'blindness DISCLOSURE, not a pass.',
    '',
    '## Machine-readable outcome',
    '',
    '```json',
    machine,
    '```',
    '',
  ].join('\n');
}
