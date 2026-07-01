export const meta = {
  name: 'napkin-corpus-analysis-reduce',
  description:
    'Checkpoint-1b: reduce ONLY (Opus/high) over committed leaves — cluster into mechanism-grained + longitudinal candidates. Reads the map-only stage output (the leaves placeholder substituted at launch). A reduce failure (rate-limit, truncation, kind-error) re-runs from the SAME leaves; map is never re-spent.',
  phases: [{ title: 'reduce', detail: 'Opus/high — cluster committed leaves into candidates' }],
};

// LEAVES — the committed map-only stage output (leaves.json), inlined at launch. Splitting map and
// reduce makes reduce independently resumable: a reduce failure re-runs this stage from disk without
// re-spending the (full-run: expensive) map stage. This is the map->reduce checkpoint the probe proved
// was needed (the combined template cannot self-checkpoint: the sandbox has no file-write).
const leaves = __LEAVES__;

// ----------------------------------------------------------------------------
// JSON Schemas — match the zod strictObjects so the post-run tsx driver re-parses candidates with
// the REAL zod boundary parsers without surprise.
// ----------------------------------------------------------------------------
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
// Stage prompt
// ----------------------------------------------------------------------------
// reducePrompt — kept byte-identical to map-reduce-validate-meta.workflow.mjs (no machine pin yet;
// re-diff at launch, README §Critical operational notes). Edit both together.
// __REDUCE_PROMPT_START__
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
    'For each candidate emit: a unique id (e.g. C01); a one-sentence pattern statement (CONCISE — name the actuator and, for longitudinal kinds, the temporal structure; do not pad); a kind (see the KIND rule below); isAbsenceClaim (true ONLY for negative-space findings); supportingWindows (ALL the DISTINCT window ids it appears in); supportingLeafIds (UP TO 10 of the MOST REPRESENTATIVE leaf ids that best ground the candidate — NOT all of them); and groundingCount (the TRUE total count of leaves you clustered, even though you list only the representative ids).',
    'KIND RULE: `kind` is the PATTERN\'s type, NEVER a leaf category. It MUST be EXACTLY one of: recurrence | trajectory | relational-lagged | regime | distributional | behavioural | absence | meta. Do NOT emit a leaf category (motif | surprise | tension | shift | behavioural-reflex) as a kind — map a "shift" leaf to kind "trajectory" or "regime", and "motif"/"surprise"/"tension" leaves to the mechanism\'s kind (usually "recurrence" or "behavioural").',
    '',
    'ALSO run the NEGATIVE-SPACE probe and emit any findings as absence candidates (isAbsenceClaim:true, kind:"absence"):',
    '  - temporal: a pattern clearly present early in the corpus then absent later (or vice-versa).',
    '  - structural: the napkin is declared to track "mistakes, corrections, surprises, and what works" — is any one of those declared categories conspicuously absent from the actual contents?',
    '',
    'Output COMPACT JSON only — the structured object and nothing else (no prose, no markdown, no preamble).',
    '',
    'LEAVES:',
    JSON.stringify(leaves),
  ].join('\n');
}
// __REDUCE_PROMPT_END__

// ----------------------------------------------------------------------------
// Orchestration: reduce ONLY. Commit the returned candidates to disk, then seed validate-meta.
// ----------------------------------------------------------------------------
log(`reduce-only: ${leaves.length} leaves`);
phase('reduce');
const reduceResult = await agent(reducePrompt(leaves), {
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

// NOTE: candidates carry supportingLeafIds + groundingCount but NO grounding field (`candidateSchema`
// is a strictObject without one). validate-meta assembles voter grounding from these ids + the
// committed leaves.json at vote-time (leafById) — do NOT add grounding here or parseCandidate's strict
// re-parse rejects it. Commit BOTH leaves.json and candidates.json; validate-meta is seeded from both.
return {
  leafCount: leaves.length,
  candidates,
};
