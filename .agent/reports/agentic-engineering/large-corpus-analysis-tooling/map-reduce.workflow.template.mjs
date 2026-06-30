export const meta = {
  name: 'napkin-corpus-analysis-map-reduce',
  description:
    'Checkpoint-1 of the large-corpus-analysis pipeline: map ×N (Sonnet/low) -> reduce (Opus/high) ONLY. Returns leaves + candidates for commit to disk; validate+meta run separately from the seeded validate-meta template (no expensive stage runs until this output is committed). Also the cheap grain-probe runnable over a 3-window partition.',
  phases: [
    { title: 'map', detail: 'N windows, Sonnet/low — extract atomic actuator-grained LEAF signals' },
    { title: 'reduce', detail: 'Opus/high — cluster leaves into mechanism-grained + longitudinal candidates' },
  ],
};

// PARTITION — the window->files set to run over, inlined at launch (never trust a frozen count;
// re-derive token-balanced from the LIVE corpus). For the cheap grain-probe this is the 3 windows
// carrying the failing baselines (w08/w10/w11); for checkpoint-1 of the full run it is all ~15.
const partition = __PARTITION__;

// ----------------------------------------------------------------------------
// JSON Schemas — match the zod strictObjects in judgment-schemas.ts so the post-run tsx driver
// re-parses every leaf/candidate with the REAL zod boundary parsers without surprise.
// ----------------------------------------------------------------------------
const CONFIDENCE = { type: 'string', enum: ['low', 'med', 'high'] };
const LEAVES_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['leaves'],
  properties: {
    leaves: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'window', 'category', 'statement', 'grounding', 'confidence'],
        properties: {
          id: { type: 'string' },
          window: { type: 'string' },
          category: {
            type: 'string',
            enum: ['motif', 'surprise', 'tension', 'shift', 'behavioural-reflex'],
          },
          statement: { type: 'string' },
          grounding: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['napkinDate', 'quote'],
              properties: { napkinDate: { type: 'string' }, quote: { type: 'string' } },
            },
          },
          confidence: CONFIDENCE,
        },
      },
    },
  },
};
const KIND = {
  type: 'string',
  enum: [
    'recurrence',
    'trajectory',
    'relational-lagged',
    'regime',
    'distributional',
    'behavioural',
    'absence',
    'meta',
  ],
};
const CANDIDATES_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['candidates'],
  properties: {
    candidates: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'id',
          'pattern',
          'kind',
          'isAbsenceClaim',
          'supportingWindows',
          'supportingLeafIds',
          'groundingCount',
        ],
        properties: {
          id: { type: 'string' },
          pattern: { type: 'string' },
          kind: KIND,
          isAbsenceClaim: { type: 'boolean' },
          supportingWindows: { type: 'array', items: { type: 'string' } },
          supportingLeafIds: { type: 'array', items: { type: 'string' } },
          groundingCount: { type: 'integer', minimum: 0 },
        },
      },
    },
  },
};

// ----------------------------------------------------------------------------
// Stage prompts
// ----------------------------------------------------------------------------
// mapPrompt + reducePrompt — kept byte-identical to map-reduce-validate-meta.workflow.mjs (no machine
// pin yet; re-diff the marked block at launch, README §Critical operational notes). Edit both together.
// __MAP_REDUCE_PROMPTS_START__
function mapPrompt(w) {
  return [
    'You are the MAP stage of a corpus-analysis pipeline over an AI engineering agent\'s working-memory "napkin" corpus (dated session notes capturing mistakes, corrections, surprises, and what works).',
    `This is ONE time-contiguous window: ${w.window}.`,
    'Use the Read tool to read EVERY one of these files IN FULL before extracting (paths are relative to the repository root):',
    w.files.map((f) => `  - ${f}`).join('\n'),
    '',
    'Extract high-recall atomic LEAF signals across these five spanning categories:',
    '  - motif: a recurring theme, practice, or idea',
    '  - surprise: something unexpected, counter-intuitive, or that violated an expectation',
    '  - tension: a conflict, trade-off, friction, or competing pull',
    '  - shift: a change over time, a regime change, an abandoned or adopted approach',
    '  - behavioural-reflex: a repeated agent action or habit (good or bad)',
    '',
    'GRAIN — name the ACTUATOR, not just the theme. Every leaf statement MUST name the concrete mechanism the signal operates THROUGH: the specific file or path, the command or script, the lifecycle moment (session-open / pre-commit / compaction / closeout / heartbeat / …), the prompt or template, the identity tuple, or the config/flag. "commit hygiene improved" is a theme; "pre-commit promoted peer-owned files into the staged set because format:root auto-fix ran repo-wide" names the actuator. Two signals that share a theme but operate through DIFFERENT actuators are TWO leaves, never one — distinct actuators MUST stay separable downstream.',
    'TIME-POINT — for a shift or behavioural-reflex that changed over time, the statement MUST name WHEN (the dated entry / this window) the change occurred and in which DIRECTION, and the grounding should cite the time-point(s) that anchor the before/after.',
    '',
    'Recall over precision — FALSE POSITIVES ARE WELCOME. A typical window yields 20-40 leaves.',
    'Each leaf: a unique id prefixed with the window (e.g. ' + w.window + '-L01), the window id, the category, a one-sentence statement (naming its actuator per GRAIN above), grounding (>=1 citation: napkinDate = the dated entry, quote = a short verbatim excerpt that anchors the signal), and your confidence (low/med/high).',
    'Emit ONLY leaves for THIS window.',
  ].join('\n');
}

function reducePrompt(leaves) {
  return [
    'You are the REDUCE stage. Below are atomic LEAF signals extracted across the time-contiguous windows of an AI-agent napkin corpus (each leaf names the concrete ACTUATOR it operates through). Cluster them into CANDIDATE patterns.',
    '',
    'CLUSTER BY MECHANISM, NOT THEME. A candidate is ONE coherent mechanism — the specific actuator (file / command / lifecycle-moment / template / identity-tuple / config) a set of leaves share. Keep DISTINCT actuators as SEPARATE candidates even when they share a broad theme: do NOT merge distinct mechanisms into a broad thematic parent — that dissolves the grain this run exists to preserve. Equally, do NOT shatter a single genuinely-broad recurring mechanism into per-window fragments — a real broad pattern that spans many windows stays ONE coherent candidate.',
    '',
    'There is NO target candidate count. Emit as many distinct-mechanism candidates as the leaves genuinely support — neither pad nor merge to hit a number. A mechanism strongly attested even within a SINGLE window MAY be a candidate (its remit is judged downstream); cross-window recurrence is valuable but is NOT a precondition for emitting a candidate.',
    '',
    'SURFACE LONGITUDINAL PATTERNS as first-class candidates, not only flat recurrences. Use the kind field precisely:',
    '  - trajectory: a mechanism whose character or strength changes across the corpus timeline (name the direction).',
    '  - regime: a distinct operating MODE active in some windows and not others (name which windows).',
    '  - relational-lagged: one mechanism\'s appearance systematically PRECEDING another\'s later.',
    '  - distributional: a mechanism\'s frequency or spread shifting across the timeline.',
    'For ANY longitudinal candidate (trajectory / regime / relational-lagged / distributional), supportingWindows MUST span the windows the claim actually covers, and the pattern statement MUST name the direction of change (or which windows the regime is active in) with its time-points. A longitudinal claim whose grounding is UNIFORM across all the windows it spans is an artefact of even sampling — do NOT emit it as longitudinal.',
    '',
    'For each candidate emit: a unique id (e.g. C01), a one-sentence pattern statement (naming its actuator and, for longitudinal kinds, its temporal structure), a kind (recurrence | trajectory | relational-lagged | regime | distributional | behavioural | absence | meta), isAbsenceClaim (true ONLY for negative-space findings), supportingWindows (the DISTINCT window ids it appears in), supportingLeafIds (the leaf ids you clustered into it), and groundingCount (total grounding citations across those leaves).',
    '',
    'ALSO run the NEGATIVE-SPACE probe and emit any findings as absence candidates (isAbsenceClaim:true, kind:"absence"):',
    '  - temporal: a pattern clearly present early in the corpus then absent later (or vice-versa).',
    '  - structural: the napkin is declared to track "mistakes, corrections, surprises, and what works" — is any one of those declared categories conspicuously absent from the actual contents?',
    '',
    'Output JSON only.',
    '',
    'LEAVES:',
    JSON.stringify(leaves),
  ].join('\n');
}
// __MAP_REDUCE_PROMPTS_END__

// ----------------------------------------------------------------------------
// Orchestration: map -> reduce. NO validate/meta — this is checkpoint-1. Commit the returned
// leaves + candidates to disk, then seed validate-meta.workflow.template.mjs.
// ----------------------------------------------------------------------------
log(`partition: ${partition.length} windows, ${partition.reduce((s, w) => s + w.files.length, 0)} files`);

phase('map');
const mapResults = await parallel(
  partition.map((w) => () =>
    agent(mapPrompt(w), {
      label: `map:${w.window}`,
      phase: 'map',
      model: 'sonnet',
      effort: 'low',
      schema: LEAVES_SCHEMA,
    }),
  ),
);
const windowLeaves = mapResults.map((r, i) => ({
  window: partition[i].window,
  leaves: r ? r.leaves : [],
}));
const allLeaves = windowLeaves.flatMap((w) => w.leaves);
const coverage = windowLeaves.map((w) => ({ window: w.window, leafCount: w.leaves.length }));
log(`map done: ${allLeaves.length} leaves; per-window=[${coverage.map((c) => c.leafCount).join(',')}]`);

phase('reduce');
const reduceResult = await agent(reducePrompt(allLeaves), {
  label: 'reduce',
  phase: 'reduce',
  model: 'opus',
  effort: 'high',
  schema: CANDIDATES_SCHEMA,
});
const candidates = reduceResult ? reduceResult.candidates : [];
const kindCounts = candidates.reduce((acc, c) => {
  acc[c.kind] = (acc[c.kind] || 0) + 1;
  return acc;
}, {});
log(`reduce done: ${candidates.length} candidates (${candidates.filter((c) => c.isAbsenceClaim).length} absence); kinds=${JSON.stringify(kindCounts)}`);

// Forward signal only (no abort here — validate is not dispatched in checkpoint-1). The HARD-ABORT
// re-gate fires at validate launch from the seeded validate-meta template, recomputed from this count.
const projectedWorstValidateTokens = candidates.length * 5 * 50000;
log(`projected worst-case validate spend if seeded straight through: ~${Math.round(projectedWorstValidateTokens / 1000)}k tokens (candidates x 5 voters x ~50k). The validate-meta template HARD-ABORTS on the real ceiling.`);

return {
  partition: partition.map((w) => ({ window: w.window, fileCount: w.files.length })),
  coverage,
  leafCount: allLeaves.length,
  leaves: allLeaves,
  candidates,
};
