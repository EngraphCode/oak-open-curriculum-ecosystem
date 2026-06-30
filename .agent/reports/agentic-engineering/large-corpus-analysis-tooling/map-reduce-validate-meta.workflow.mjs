export const meta = {
  name: 'napkin-corpus-analysis-v2-rerun',
  description:
    'v2 large-corpus-analysis rerun over the napkin corpus: map->reduce->validate->meta, with deterministic mirror-driven Tier 0/1/2 adversary escalation',
  phases: [
    { title: 'map', detail: '15 windows, Sonnet/low — extract atomic LEAF signals' },
    { title: 'reduce', detail: 'Opus/high — cluster leaves into candidates + negative-space probe' },
    { title: 'validate', detail: 'Opus/high — tiered adversary, mirror-driven Tier 0/1/2' },
    { title: 'meta', detail: 'Opus/high — per-baseline recall match + corroboration claims' },
  ],
};

const PARTITION_WINDOWS = [
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
// SANDBOX MIRROR — verbatim copy of agent-tools/src/corpus-analysis/
// workflow-routing-mirror.ts (type-stripped), pinned to the source module by
// workflow-routing-mirror.conformance.test.ts (39 cases green). The validate
// stage routes tier escalation with these; the sandbox cannot import repo code.
// ----------------------------------------------------------------------------
const TESTS = (v) => [v.grounded, v.baseRateHolds, v.survivesNull, v.notArtefact];
function classifyVerdict(v) {
  if (TESTS(v).every((t) => t.pass)) return 'keep';
  const failsOnlyBaseRate =
    !v.baseRateHolds.pass && v.grounded.pass && v.survivesNull.pass && v.notArtefact.pass;
  if (failsOnlyBaseRate && v.importance === 'high') return 'reroute';
  return 'kill';
}
function isBorderline(v) {
  if (classifyVerdict(v) !== 'keep') return false;
  return TESTS(v).some((t) => t.pass && t.confidence !== 'high');
}
const TIER_2_LENSES = ['correctness-grounding', 'base-rate', 'null-reproduction'];
const TIER_2_ENSEMBLE_SIZE = TIER_2_LENSES.length;
const dispatchTier2From = (n) => ({
  kind: 'dispatch',
  tier: 'tier-2',
  voterCount: TIER_2_ENSEMBLE_SIZE - n,
  lenses: TIER_2_LENSES.slice(n),
});
const dispatchOne = (tier) => ({ kind: 'dispatch', tier, voterCount: 1 });
const terminal = (disposition, reason) =>
  reason === undefined ? { kind: 'terminal', disposition } : { kind: 'terminal', disposition, reason };
function adjudicatedVerdicts(outcomes) {
  return outcomes.filter((o) => o.status === 'adjudicated').map((o) => o.verdict);
}
function tallyDispositions(ds) {
  const t = { keep: 0, kill: 0, reroute: 0 };
  for (const d of ds) t[d] += 1;
  return t;
}
function finaliseQuorum(verdicts) {
  if (verdicts.length < 2) return terminal('held-for-review', 'retry-cap');
  const lenses = verdicts.map((v) => v.lens);
  if (lenses.some((l) => l === undefined) || new Set(lenses).size !== lenses.length)
    return terminal('held-for-review', 'lens-collision');
  const tally = tallyDispositions(verdicts.map(classifyVerdict));
  const refuters = verdicts.length - tally.keep;
  if (tally.keep > refuters) return terminal('keep');
  if (tally.keep === refuters) return terminal('held-for-review', 'quorum-tie');
  if (tally.reroute >= 1 && tally.reroute >= tally.kill) return terminal('reroute');
  return terminal('kill');
}
function decideAfterCleanKeep(tier1) {
  if (tier1.length === 0) return dispatchOne('tier-1');
  const confirmer = tier1[0];
  if (confirmer.status === 'unadjudicated') return dispatchTier2From(0);
  return classifyVerdict(confirmer.verdict) === 'keep' ? terminal('keep') : dispatchTier2From(0);
}
function decidePreEnsemble(tier0Outcome, tier1) {
  if (tier0Outcome.status === 'unadjudicated')
    return tier1.length === 0 ? dispatchOne('tier-1') : dispatchTier2From(0);
  const disposition = classifyVerdict(tier0Outcome.verdict);
  // A kill escalates to the Tier-2 diverse-lens quorum (never terminal on one voter); only a
  // quorum may discard — conserve by default. Byte-faithful to aggregation-adjudication.ts.
  if (disposition === 'kill' || disposition === 'reroute' || isBorderline(tier0Outcome.verdict))
    return dispatchTier2From(0);
  return decideAfterCleanKeep(tier1);
}
function adjudicate(input) {
  const outcomes = input.outcomes;
  if (outcomes.filter((o) => o.tier === 'tier-0').length === 0) return dispatchOne('tier-0');
  const tier2 = outcomes.filter((o) => o.tier === 'tier-2');
  if (tier2.length >= TIER_2_ENSEMBLE_SIZE) return finaliseQuorum(adjudicatedVerdicts(tier2));
  if (tier2.length > 0) return dispatchTier2From(tier2.length);
  const tier0Outcome = outcomes.find((o) => o.tier === 'tier-0');
  if (tier0Outcome === undefined) return dispatchOne('tier-0');
  return decidePreEnsemble(
    tier0Outcome,
    outcomes.filter((o) => o.tier === 'tier-1'),
  );
}

// ----------------------------------------------------------------------------
// ORCHESTRATION MIRROR — type-stripped copy of agent-tools/src/corpus-analysis/
// run-orchestration.ts (unit-tested THERE; NOT machine-pinned to this paste — re-check before each
// launch, README §Critical operational notes). postReduceRegate is computed directly here and equals
// the source's cost-model path only while DEFAULT_EFFORT_MULTIPLIERS.low === 1 (pinned by
// cost-and-coverage.unit.test.ts).
// ----------------------------------------------------------------------------
// __ORCH_MIRROR_START__
const ORCH_MAX_VOTERS_PER_CANDIDATE = 5; // mirrors cost-and-coverage MAX_VOTERS_PER_CANDIDATE
const OBSERVED_VALIDATE_TOKENS_PER_VOTER = 50000;
function resolveResumeSeed(seed, resolvedIds) {
  const resolved = new Set(resolvedIds);
  return seed.filter((candidate) => !resolved.has(candidate.id));
}
function assessValidateCompleteness(validated, candidates) {
  const incompleteCandidateIds = validated
    .filter((entry) => entry.disposition === 'held-for-review')
    .map((entry) => entry.candidateId);
  const validatedIds = new Set(validated.map((entry) => entry.candidateId));
  const missingCandidateIds = candidates
    .filter((candidate) => !validatedIds.has(candidate.id))
    .map((candidate) => candidate.id);
  const complete =
    incompleteCandidateIds.length === 0 &&
    missingCandidateIds.length === 0 &&
    validated.length === candidates.length;
  return { complete, incompleteCandidateIds, missingCandidateIds };
}
function postReduceRegate(input) {
  const tokensPerVoter = input.tokensPerVoter ?? OBSERVED_VALIDATE_TOKENS_PER_VOTER;
  const maxVoters = input.maxVotersPerCandidate ?? ORCH_MAX_VOTERS_PER_CANDIDATE;
  const worstCaseTokens = input.candidateCount * maxVoters * tokensPerVoter;
  const abort = worstCaseTokens > input.ceiling;
  const message = abort
    ? `POST-REDUCE HARD-ABORT: ${input.candidateCount} candidates x ${maxVoters} worst-case voters x ${tokensPerVoter} = ${worstCaseTokens} tokens > ceiling ${input.ceiling}. Re-derive the ceiling or split the run; do NOT dispatch validate.`
    : `post-reduce re-gate OK: worst-case validate ${worstCaseTokens} tokens <= ceiling ${input.ceiling}`;
  return { worstCaseTokens, abort, message };
}
function deterministicJitterMs(seed, maxMs) {
  if (maxMs <= 0) return 0;
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % (maxMs + 1);
}
// __ORCH_MIRROR_END__

// ----------------------------------------------------------------------------
// JSON Schemas — match the zod strictObjects in judgment-schemas.ts /
// recall-schemas.ts / real-world-signal.ts so the post-run tsx driver re-parses
// every judgment with the REAL zod boundary parsers without surprise.
// ----------------------------------------------------------------------------
const CONFIDENCE = { type: 'string', enum: ['low', 'med', 'high'] };
const TEST = {
  type: 'object',
  additionalProperties: false,
  required: ['pass', 'confidence'],
  properties: { pass: { type: 'boolean' }, confidence: CONFIDENCE },
};
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
const VERDICT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['grounded', 'baseRateHolds', 'survivesNull', 'notArtefact', 'importance'],
  properties: {
    grounded: TEST,
    baseRateHolds: TEST,
    survivesNull: TEST,
    notArtefact: TEST,
    importance: CONFIDENCE,
  },
};
const RECALL_VERDICT = {
  type: 'string',
  enum: ['subsumes', 'refines', 'equal', 'partial', 'missed'],
};
const META_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['recallMatches', 'corroborationClaims', 'discountNote', 'synthesisNotes'],
  properties: {
    recallMatches: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['baselineId', 'verdict', 'note'],
        properties: {
          baselineId: { type: 'string' },
          verdict: RECALL_VERDICT,
          matchedCandidateId: { type: 'string' },
          note: { type: 'string' },
        },
      },
    },
    corroborationClaims: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['candidateId', 'claimedHomePaths'],
        properties: {
          candidateId: { type: 'string' },
          claimedHomePaths: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    discountNote: { type: 'string' },
    synthesisNotes: { type: 'array', items: { type: 'string' } },
  },
};

// ----------------------------------------------------------------------------
// The 18 frozen recall baselines (id + statement + population), copied from
// recall-baseline-fixture.ts. 10 emergent (the headline-recall denominator),
// 8 single-window (out-of-remit; reported, not scored).
// ----------------------------------------------------------------------------
const BASELINES = [
  { id: 'capture-does-not-cure', population: 'emergent', statement: 'declarative capture is not procedural inhibition — an agent holding a rule still walks into the named failure seconds later; only a structural action-time interrupt has traction' },
  { id: 'inherited-state-is-a-hypothesis', population: 'emergent', statement: 'thread records, closeout broadcasts and prior grounding describe past disk state, not current truth; agents claimed "foundation complete" without running a gate' },
  { id: 'coordinator-amplifies-unseen-defect', population: 'emergent', statement: 'a coordinator writes coordination artefacts subject to the very gates and races it manages (over-write), with caution misread as licence to do nothing (under-write) as the inverse' },
  { id: 'commit-window-single-agent-assumption', population: 'emergent', statement: 'the multi-agent commit-window protocol assumes single-agent ownership, so cross-agent handover or concurrent staging produces wrong-attribution commits' },
  { id: 'repo-wide-autofix-sweep-footgun', population: 'emergent', statement: 'repo-wide auto-fix (format:root / markdownlint:root) lets pre-commit promote auto-fix output into the staged set, absorbing peer-owned files in a multi-agent dirty tree' },
  { id: 'cron-template-overrides-owner-direction', population: 'emergent', statement: 'a cron prompt body that says "return to whatever task is in flight" fires before the agent reads owner direction, silently overriding pause/stop/hold every cycle' },
  { id: 'compaction-is-a-checkpoint', population: 'emergent', statement: 'compaction is a checkpoint not a continuation: monitors are not preserved and crons only non-deterministically, so post-compaction must re-verify watcher, cron, staged set, and claims' },
  { id: 'peer-primary-topology-regime', population: 'emergent', statement: 'peer-primary topology (dual loops, disjoint lanes, no coordinator) is a distinct operating mode whose cost is shared-resource contention, not coordination protocol' },
  { id: 'claims-open-minimum-field-silent-reject', population: 'emergent', statement: 'omitting any required flag from `claims open` produces a silent rejection — a recurring helper friction at the claims boundary' },
  { id: 're-run-git-status-post-gate', population: 'emergent', statement: 'a long gate run can widen the diff surface while it runs, so a cleanliness or handoff claim from a pre-gate status is a recurring false-clean assertion; recompute status post-gate' },
  { id: 'completion-language-overload', population: 'single-window', statement: 'completion language conflates four distinct states (slice landed / claim closed / workstream accepted / user value delivered); truthful closeout needs an explicit verdict' },
  { id: 'commit-editmsg-single-writer', population: 'single-window', statement: '.git/COMMIT_EDITMSG is single-writer, so concurrent message-file writes during a handover produce a wrong-attribution commit' },
  { id: 'record-staged-full-index-fingerprint', population: 'single-window', statement: 'commit-queue `record-staged` fingerprints the full git index rather than the declared intent.files, so peer-staged content rides into unrelated commits' },
  { id: 'identity-tuple-insufficiency', population: 'single-window', statement: 'the (agent_name, platform, session_id_prefix) routing tuple cannot disambiguate whether three names are one renamed session or three separate sessions' },
  { id: 'presence-vs-ownership-collapse', population: 'single-window', statement: 'the team-start template "Claimed paths" field makes agents open source claims at presence-announcement time, turning rendezvous into a herd claim event' },
  { id: 'skill-invocation-not-owner-direction', population: 'single-window', statement: 'a skill invocation is not owner direction — the agent must not treat being handed a skill as a standing instruction superseding explicit owner input' },
  { id: 'reviewer-pre-execution-catch', population: 'single-window', statement: 'pre-execution review surfaces what the author cannot see because the reviewer lacks the author prior-context rationalisation — the mechanism static gates and post-review miss' },
  { id: 'reviewer-cycle-split-on-convergence', population: 'single-window', statement: 'when reviewers converge on blocking a planned cycle, scope-narrow to a successor cycle rather than carry known-bad scope forward' },
];

// ----------------------------------------------------------------------------
// Stage prompts
// ----------------------------------------------------------------------------
// mapPrompt + reducePrompt — kept byte-identical to map-reduce.workflow.template.mjs (no machine
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
// __MAP_REDUCE_PROMPTS_END__

function votePrompt(candidate, lens, supportingLeaves) {
  const grounding = supportingLeaves
    .flatMap((l) => (l.grounding || []).map((g) => `  - [${l.window} ${g.napkinDate}] ${g.quote}`))
    .join('\n');
  return [
    'You are an ADVERSARY voter judging ONE candidate emergent pattern from a corpus-analysis run. Be SKEPTICAL: a FALSE KEEP (ratifying a pattern that is not actually real) is the costly, asymmetric error — when uncertain, fail the test.',
    '',
    `Candidate: ${candidate.pattern}`,
    `Kind: ${candidate.kind}   Absence-claim: ${candidate.isAbsenceClaim}   Spans windows: ${(candidate.supportingWindows || []).join(', ')}`,
    'Supporting grounding (verbatim corpus excerpts clustered into this candidate):',
    grounding || '  (no grounding citations were attached)',
    '',
    lens
      ? `Judge PRIMARILY through the "${lens}" lens (correctness-grounding = is it truly anchored in the cited entries; base-rate = would it appear in any comparable corpus by chance; null-reproduction = does a plausible null hypothesis reproduce it).`
      : 'Judge across all four tests evenly.',
    '',
    'Emit, for EACH of the four conjunctive apophenia tests, pass (boolean) + confidence (low/med/high):',
    '  - grounded: genuinely anchored in the cited corpus entries (quotes real and on-point, not hallucinated or mis-attributed)?',
    '  - baseRateHolds: more than the base rate — would NOT trivially appear in any comparable corpus by coincidence?',
    '  - survivesNull: survives a null hypothesis — a real signal, not noise dressed as a pattern?',
    '  - notArtefact: a real phenomenon, NOT an artefact of how the corpus was written, sampled, or how leaves were clustered?',
    candidate.isAbsenceClaim
      ? '  (ABSENCE claim: "grounded" means shown GENUINELY ABSENT, not merely unsampled — the falsifier is finding it present somewhere in the corpus.)'
      : '',
    ['trajectory', 'regime', 'relational-lagged', 'distributional'].includes(candidate.kind)
      ? `  (LONGITUDINAL claim (kind=${candidate.kind}): "grounded" and "notArtefact" ADDITIONALLY require the cited grounding to PARTITION across the corpus timeline in a way that MATCHES the claim — a trajectory/distributional must show early-vs-late grounding that DIFFERS in the claimed direction; a regime must show the mode present in some windows and absent in others; a relational-lagged must show one mechanism's windows preceding the other's. Grounding that is UNIFORM across all the windows the candidate spans is an even-sampling artefact, not a longitudinal signal — fail notArtefact (and fail grounded when the temporal structure IS the substance of the claim).)`
      : '',
    '',
    'Also rate the candidate\'s importance (low/med/high). Do NOT emit any keep/kill/reroute decision — only the four test judgments and importance; the disposition is computed deterministically downstream.',
  ].join('\n');
}

function metaPrompt(candidatesWithDisposition, baselines) {
  return [
    'You are the META stage — the recall calibration. For EACH of the 18 known-present baseline patterns below (drawn from prior hand-authored syntheses of THIS corpus), judge whether this Discovery run RE-FOUND it, and via which candidate.',
    '',
    'The run\'s FINDINGS are the candidates with disposition "keep" or "reroute". A baseline matched only by a "kill"/"held-for-review" candidate counts as MISSED (the run did not surface it as a finding).',
    '',
    'For each baseline emit a RECALL-MATCH: baselineId, verdict, matchedCandidateId, note.',
    '  verdict ∈ subsumes (a finding fully covers and extends the baseline) | refines (captures it at finer grain) | equal (same grain) | partial (overlaps but misses substance) | missed (not re-found among findings).',
    '  matchedCandidateId: REQUIRED for any non-missed verdict (name the candidate id); OMIT IT ENTIRELY for "missed".',
    '  note: one sentence.',
    '',
    'ALSO, for each KEPT candidate that you believe has already graduated to a durable home, emit a corroboration claim: candidateId + claimedHomePaths (plausible on-disk file paths under .agent/memory/active/patterns/ or .agent/rules/ that encode this pattern). A downstream check verifies each path exists — name your best specific guesses; do not invent obviously-fake paths.',
    '',
    'ALSO emit discountNote (a qualitative caveat on this run\'s reliability) and synthesisNotes (3-8 key qualitative takeaways). Emit NO numbers, fractions, or aggregate recall — only per-item judgments and prose.',
    '',
    'BASELINES (18):',
    JSON.stringify(baselines),
    '',
    'CANDIDATES (with disposition):',
    JSON.stringify(candidatesWithDisposition),
  ].join('\n');
}

// ----------------------------------------------------------------------------
// Per-candidate tiered adversary, driven by the mirrored state machine.
// ----------------------------------------------------------------------------
let leafById = new Map();

async function adjudicateCandidate(candidate) {
  const supporting = (candidate.supportingLeafIds || [])
    .map((id) => leafById.get(id))
    .filter(Boolean);
  const outcomes = [];
  for (let round = 0; round < 8; round++) {
    const step = adjudicate({ outcomes });
    if (step.kind === 'terminal') {
      return {
        candidateId: candidate.id,
        disposition: step.disposition,
        reason: step.reason === undefined ? null : step.reason,
        outcomes,
      };
    }
    const tier = step.tier;
    const lenses = step.lenses || [];
    const voters = await parallel(
      Array.from({ length: step.voterCount }, (_, i) => async () => {
        const lens = lenses[i];
        const voterId = `${candidate.id}:${tier}:r${round}:${i}`;
        const verdict = await agent(votePrompt(candidate, lens, supporting), {
          label: `vote:${candidate.id}:${tier}:${lens || 'plain'}`,
          phase: 'validate',
          model: 'opus',
          effort: 'high',
          schema: VERDICT_SCHEMA,
        });
        if (!verdict) {
          return { status: 'unadjudicated', candidateId: candidate.id, voterId, tier, reason: 'retry-cap' };
        }
        const v = lens ? { ...verdict, lens } : verdict;
        return { status: 'adjudicated', candidateId: candidate.id, voterId, tier, verdict: v };
      }),
    );
    for (const o of voters) if (o) outcomes.push(o);
  }
  return { candidateId: candidate.id, disposition: 'held-for-review', reason: 'retry-cap', outcomes };
}

// ----------------------------------------------------------------------------
// Orchestration: map -> reduce -> validate -> meta
// ----------------------------------------------------------------------------
// Deterministic window->files partition, re-derived at launch (100 files, ~1.02M tokens,
// 15 token-balanced windows, 0 files split). Inlined rather than passed via `args` because
// the harness delivers `args` as a JSON string, not an object.
const partition = (typeof args === 'object' && args && args.windows ? args.windows : PARTITION_WINDOWS);
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
leafById = new Map(allLeaves.map((l) => [l.id, l]));
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
log(`reduce done: ${candidates.length} candidates (${candidates.filter((c) => c.isAbsenceClaim).length} absence)`);

// Post-reduce HARD-ABORT re-gate: now that reduce has produced its REAL candidate count, recompute
// the worst-case validate spend (corrected ~50k/voter) and abort BEFORE dispatching any voter if it
// breaches the ceiling. Re-derive VALIDATE_TOKEN_CEILING at launch from the partition (the stale 2M
// literal is wrong — the v2 run cost ~13.2M); never trust a frozen value.
const VALIDATE_TOKEN_CEILING = 16_000_000;
const regate = postReduceRegate({ candidateCount: candidates.length, ceiling: VALIDATE_TOKEN_CEILING });
log(regate.message);
if (regate.abort) {
  throw new Error(regate.message);
}

phase('validate');
const validated = (await parallel(candidates.map((c) => () => adjudicateCandidate(c)))).filter(Boolean);
const dispById = new Map(validated.map((d) => [d.candidateId, d.disposition]));
const allOutcomes = validated.flatMap((d) => d.outcomes);
const dispCounts = validated.reduce((acc, d) => {
  acc[d.disposition] = (acc[d.disposition] || 0) + 1;
  return acc;
}, {});
log(`validate done: ${JSON.stringify(dispCounts)}; ${allOutcomes.length} voter outcomes`);

// Completeness guard: refuse to score meta (recall calibration) over a PARTIAL validate. A
// held-for-review of ANY reason, or a candidate silently dropped from `validated`, marks validate
// INCOMPLETE. Mirrors the gate in validate-meta.workflow.template.mjs so the straight-through path
// never scores recall over an incomplete run.
const completeness = assessValidateCompleteness(validated, candidates);
let metaResult = null;
if (completeness.complete) {
  phase('meta');
  const candidatesForMeta = candidates.map((c) => ({
    id: c.id,
    pattern: c.pattern,
    kind: c.kind,
    isAbsenceClaim: c.isAbsenceClaim,
    supportingWindows: c.supportingWindows,
    disposition: dispById.get(c.id) || 'unknown',
  }));
  metaResult = await agent(metaPrompt(candidatesForMeta, BASELINES), {
    label: 'meta',
    phase: 'meta',
    model: 'opus',
    effort: 'high',
    schema: META_SCHEMA,
  });
  log('meta done');
} else {
  log(`validate INCOMPLETE — held=[${completeness.incompleteCandidateIds.join(',')}] missing=[${completeness.missingCandidateIds.join(',')}]; meta SKIPPED (completeness guard). Re-run validate, or seed validate-meta.workflow.template.mjs with RESOLVED_IDS.`);
}

return {
  partition: partition.map((w) => ({ window: w.window, fileCount: w.files.length })),
  coverage,
  leafCount: allLeaves.length,
  leaves: allLeaves,
  candidates,
  dispositions: validated.map((d) => ({
    candidateId: d.candidateId,
    disposition: d.disposition,
    reason: d.reason,
  })),
  voterOutcomes: allOutcomes,
  meta: metaResult,
};
