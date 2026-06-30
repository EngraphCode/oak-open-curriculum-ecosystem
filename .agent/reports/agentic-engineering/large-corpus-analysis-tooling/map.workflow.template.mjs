export const meta = {
  name: 'napkin-corpus-analysis-map',
  description:
    'Checkpoint-1a: map ONLY (Sonnet/low) over a window partition — extract atomic actuator-grained LEAF signals. Returns leaves + coverage for commit to disk. The reduce stage runs separately (reduce.workflow.template.mjs) over the committed leaves, so a reduce failure never re-spends this map.',
  phases: [{ title: 'map', detail: 'N windows, Sonnet/low — extract atomic actuator-grained LEAF signals' }],
};

// PARTITION — the window->files set, inlined at launch (re-derive token-balanced from the LIVE
// corpus; never trust a frozen count). The map stage is committed to disk before reduce so reduce
// is independently resumable (the map->reduce checkpoint the probe proved was needed).
const partition = __PARTITION__;

// ----------------------------------------------------------------------------
// JSON Schema — match the zod strictObject so the post-run tsx driver re-parses leaves with the
// REAL zod boundary parser without surprise.
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

// ----------------------------------------------------------------------------
// Stage prompt
// ----------------------------------------------------------------------------
// mapPrompt — kept byte-identical to map-reduce-validate-meta.workflow.mjs (no machine pin yet;
// re-diff at launch, README §Critical operational notes). Edit both together.
// __MAP_PROMPT_START__
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
// __MAP_PROMPT_END__

// ----------------------------------------------------------------------------
// Orchestration: map ONLY. Commit the returned leaves to disk, then run reduce.workflow.template.mjs.
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

return {
  partition: partition.map((w) => ({ window: w.window, fileCount: w.files.length })),
  coverage,
  leafCount: allLeaves.length,
  leaves: allLeaves,
};
