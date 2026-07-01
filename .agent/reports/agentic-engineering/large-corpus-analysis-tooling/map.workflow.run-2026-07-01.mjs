export const meta = {
  name: 'napkin-corpus-analysis-map',
  description:
    'Checkpoint-1a: map ONLY (Sonnet/low) over a window partition — extract atomic actuator-grained LEAF signals. Returns leaves + coverage for commit to disk. The reduce stage runs separately (reduce.workflow.template.mjs) over the committed leaves, so a reduce failure never re-spends this map.',
  phases: [{ title: 'map', detail: 'N windows, Sonnet/low — extract atomic actuator-grained LEAF signals' }],
};

// ============================================================================
// INSTANTIATED RUN SCRIPT — checkpoint-1a (MAP ONLY). Generated; do not hand-edit the partition.
// Instantiated 2026-07-01 (Flare hunts Obsidian) from map.workflow.template.mjs by filling
// __PARTITION__ with the 15-window PARTITION_WINDOWS array (byte-identical to the array in
// map-reduce-validate-meta.workflow.mjs). mapPrompt + schema are the template's, re-diffed clean.
//
// CORPUS PIN: the 100 corpus files are byte-identical to commit 194fdc704 (verified 2026-07-01):
// file-set 100 partition files = 100 on disk (no drift); napkin.md (w15) is byte-identical at
// 194fdc704 and HEAD; every w01-w14 archive napkin is frozen; w15 total ~63k tokens (within a
// Sonnet/low map-agent budget). This run script + the meta-template glyph reconciliation land in
// the preflight commit ON TOP of 194fdc704 and touch NO corpus file. AT LAUNCH re-verify the tree
// is clean and the 100 corpus files still match 194fdc704 before spending. Partition reuse is
// known-valid, not assumed.
//
// LAUNCH (checkpoint-1a): Workflow({ scriptPath: <this file> }) -> commit the returned `leaves`
// to data/discovery-run-leaves-2026-07-01.json -> then reduce.workflow.template.mjs seeded from
// that file (a reduce failure re-runs from the SAME leaves; no map re-spend).
//
// VALIDATE_TOKEN_CEILING (later validate stage): 30_000_000 = 120-candidate upper projection x
// MAX_VOTERS_PER_CANDIDATE(5) x OBSERVED_VALIDATE_TOKENS_PER_VOTER(50k). The post-reduce re-gate
// hard-aborts iff realCandidateCount x 250k > ceiling. A larger LEGITIMATE set costs no spend to
// re-admit (leaves+candidates are committed): raise the ceiling and resume validate.
// ============================================================================

// PARTITION — the window->files set, inlined at launch (re-derive token-balanced from the LIVE
// corpus; never trust a frozen count). The map stage is committed to disk before reduce so reduce
// is independently resumable (the map->reduce checkpoint the probe proved was needed).
const partition = [
  { window: 'w01', files: ['.agent/memory/active/archive/napkin-2026-02-16.md', '.agent/memory/active/archive/napkin-2026-02-22.md', '.agent/memory/active/archive/napkin-2026-02-24.md', '.agent/memory/active/archive/napkin-2026-02-26.md', '.agent/memory/active/archive/napkin-2026-02-28.md'] },
  { window: 'w02', files: ['.agent/memory/active/archive/napkin-2026-03-02.md', '.agent/memory/active/archive/napkin-2026-03-05.md', '.agent/memory/active/archive/napkin-2026-03-07.md', '.agent/memory/active/archive/napkin-2026-03-11.md', '.agent/memory/active/archive/napkin-2026-03-14.md', '.agent/memory/active/archive/napkin-2026-03-21.md', '.agent/memory/active/archive/napkin-2026-03-24.md', '.agent/memory/active/archive/napkin-2026-03-28.md'] },
  { window: 'w03', files: ['.agent/memory/active/archive/napkin-2026-03-31.md', '.agent/memory/active/archive/napkin-2026-04-01.md', '.agent/memory/active/archive/napkin-2026-04-02.md', '.agent/memory/active/archive/napkin-2026-04-03.md', '.agent/memory/active/archive/napkin-2026-04-04.md', '.agent/memory/active/archive/napkin-2026-04-06.md', '.agent/memory/active/archive/napkin-2026-04-07.md', '.agent/memory/active/archive/napkin-2026-04-10.md', '.agent/memory/active/archive/napkin-2026-04-10b.md', '.agent/memory/active/archive/napkin-2026-04-11.md'] },
  { window: 'w04', files: ['.agent/memory/active/archive/napkin-2026-04-13.md', '.agent/memory/active/archive/napkin-2026-04-14.md', '.agent/memory/active/archive/napkin-2026-04-16.md', '.agent/memory/active/archive/napkin-2026-04-17.md', '.agent/memory/active/archive/napkin-2026-04-18.md', '.agent/memory/active/archive/napkin-2026-04-19.md', '.agent/memory/active/archive/napkin-2026-04-19b.md'] },
  { window: 'w05', files: ['.agent/memory/active/archive/napkin-2026-04-21.md', '.agent/memory/active/archive/napkin-2026-04-22.md', '.agent/memory/active/archive/napkin-2026-04-22b.md'] },
  { window: 'w06', files: ['.agent/memory/active/archive/napkin-2026-04-25.md', '.agent/memory/active/archive/napkin-2026-04-26b.md', '.agent/memory/active/archive/napkin-2026-04-26.md', '.agent/memory/active/archive/napkin-2026-04-27a.md', '.agent/memory/active/archive/napkin-2026-04-27-agentic-engineering-identity-and-queue.md', '.agent/memory/active/archive/napkin-2026-04-28-current-overflow.md', '.agent/memory/active/archive/napkin-2026-04-28.md', '.agent/memory/active/archive/napkin-2026-04-29.md', '.agent/memory/active/archive/napkin-2026-04-30.md'] },
  { window: 'w07', files: ['.agent/memory/active/archive/napkin-2026-05-03.md', '.agent/memory/active/archive/napkin-2026-05-04-evening.md', '.agent/memory/active/archive/napkin-2026-05-04.md', '.agent/memory/active/archive/napkin-2026-05-05.md', '.agent/memory/active/archive/napkin-2026-05-06-evening.md', '.agent/memory/active/archive/napkin-2026-05-06-evening-graduation-pass.md'] },
  { window: 'w08', files: ['.agent/memory/active/archive/napkin-2026-05-06.md', '.agent/memory/active/archive/napkin-2026-05-07-graph-mvp-planning.md', '.agent/memory/active/archive/napkin-2026-05-07-doctor-safe-merge.md', '.agent/memory/active/archive/napkin-2026-05-09.md', '.agent/memory/active/archive/napkin-2026-05-10.md', '.agent/memory/active/archive/napkin-2026-05-11.md', '.agent/memory/active/archive/napkin-2026-05-12.md'] },
  { window: 'w09', files: ['.agent/memory/active/archive/napkin-2026-05-12b.md', '.agent/memory/active/archive/napkin-2026-05-13.md', '.agent/memory/active/archive/napkin-2026-05-14.md', '.agent/memory/active/archive/napkin-2026-05-17.md', '.agent/memory/active/archive/napkin-2026-05-21.md'] },
  { window: 'w10', files: ['.agent/memory/active/archive/napkin-2026-05-22-evening.md', '.agent/memory/active/archive/napkin-2026-05-22.md', '.agent/memory/active/archive/napkin-2026-05-24-curator-fourth-rotation.md', '.agent/memory/active/archive/napkin-2026-05-24-curator-third-rotation.md', '.agent/memory/active/archive/napkin-2026-05-24-post-m1-cleanups-window.md', '.agent/memory/active/archive/napkin-2026-05-24-pelagic-hard-napkin-window.md', '.agent/memory/active/archive/napkin-2026-05-24-knowledge-curator-continuation.md'] },
  { window: 'w11', files: ['.agent/memory/active/archive/napkin-2026-05-24-shaded-silencing-dusk.md', '.agent/memory/active/archive/napkin-2026-05-25-misty-director-session.md', '.agent/memory/active/archive/napkin-2026-05-25-breezy-critical-hard-curation.md', '.agent/memory/active/archive/napkin-2026-05-26-feathered-hard-curation.md', '.agent/memory/active/archive/napkin-2026-05-26-thermal-critical-curation.md'] },
  { window: 'w12', files: ['.agent/memory/active/archive/napkin-2026-05-27-hidden-dimming-threshold-curation.md', '.agent/memory/active/archive/napkin-2026-05-28-sylvan-curation.md', '.agent/memory/active/archive/napkin-2026-05-31-foamy-docs-consolidation.md', '.agent/memory/active/archive/napkin-2026-06-01-moonless-curation.md', '.agent/memory/active/archive/napkin-2026-06-02-shaded-veiling-curation.md', '.agent/memory/active/archive/napkin-2026-06-03-opalescent-curation.md', '.agent/memory/active/archive/napkin-2026-06-04-arboreal-curation.md', '.agent/memory/active/archive/napkin-2026-06-05-lanternlit-curation.md', '.agent/memory/active/archive/napkin-2026-06-06-starlit-curation.md'] },
  { window: 'w13', files: ['.agent/memory/active/archive/napkin-2026-06-08-ferny-curation.md', '.agent/memory/active/archive/napkin-2026-06-09-fruited-curation.md', '.agent/memory/active/archive/napkin-2026-06-11-pearly-curation.md', '.agent/memory/active/archive/napkin-2026-06-11-arboreal-curation.md', '.agent/memory/active/archive/napkin-2026-06-12-thyme-curation.md', '.agent/memory/active/archive/napkin-2026-06-14-comms-research-closeout.md', '.agent/memory/active/archive/napkin-2026-06-16-skunk-consolidation.md'] },
  { window: 'w14', files: ['.agent/memory/active/archive/napkin-2026-06-16-dedicated-consolidation-snapper.md', '.agent/memory/active/archive/napkin-2026-06-18-sandpiper-consolidation.md', '.agent/memory/active/archive/napkin-2026-06-19-finch-consolidation.md', '.agent/memory/active/archive/napkin-2026-06-21-ferret-consolidation.md', '.agent/memory/active/archive/napkin-2026-06-22-petrel-consolidation.md', '.agent/memory/active/archive/napkin-2026-06-23-narwhal-consolidation.md', '.agent/memory/active/archive/napkin-2026-06-25-zephyr-consolidation.md'] },
  { window: 'w15', files: ['.agent/memory/active/archive/napkin-2026-06-27-hawthorn-consolidation.md', '.agent/memory/active/archive/napkin-2026-06-28-clover-consolidation.md', '.agent/memory/active/napkin.md', '.agent/memory/active/archive/napkin-2026-06-29-falcon-consolidation.md', '.agent/memory/active/archive/napkin-2026-06-29-quoll-consolidation.md'] },
];

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
