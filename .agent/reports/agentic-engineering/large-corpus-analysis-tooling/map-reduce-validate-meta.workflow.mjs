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
  if (disposition === 'kill') return terminal('kill');
  if (disposition === 'reroute' || isBorderline(tier0Outcome.verdict)) return dispatchTier2From(0);
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
    'Recall over precision — FALSE POSITIVES ARE WELCOME. A typical window yields 20-40 leaves.',
    'Each leaf: a unique id prefixed with the window (e.g. ' + w.window + '-L01), the window id, the category, a one-sentence statement, grounding (>=1 citation: napkinDate = the dated entry, quote = a short verbatim excerpt that anchors the signal), and your confidence (low/med/high).',
    'Emit ONLY leaves for THIS window.',
  ].join('\n');
}

function reducePrompt(leaves) {
  return [
    'You are the REDUCE stage. Below are atomic LEAF signals extracted across 15 time-contiguous windows of an AI-agent napkin corpus. Cluster them into CANDIDATE emergent patterns — phenomena that RECUR ACROSS MULTIPLE WINDOWS (cross-window emergence is the whole point; a single-window signal is usually NOT an emergent candidate).',
    '',
    'For each candidate emit: a unique id (e.g. C01), a one-sentence pattern statement, a kind (recurrence | trajectory | relational-lagged | regime | distributional | behavioural | absence | meta), isAbsenceClaim (true ONLY for negative-space findings), supportingWindows (the DISTINCT window ids it appears in), supportingLeafIds (the leaf ids you clustered into it), and groundingCount (total grounding citations across those leaves).',
    '',
    'ALSO run the NEGATIVE-SPACE probe and emit any findings as absence candidates (isAbsenceClaim:true, kind:"absence"):',
    '  - temporal: a pattern clearly present early in the corpus then absent later (or vice-versa).',
    '  - structural: the napkin is declared to track "mistakes, corrections, surprises, and what works" — is any one of those declared categories conspicuously absent from the actual contents?',
    '',
    'Aim for 15-25 candidates. Output JSON only.',
    '',
    'LEAVES:',
    JSON.stringify(leaves),
  ].join('\n');
}

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

phase('validate');
const validated = (await parallel(candidates.map((c) => () => adjudicateCandidate(c)))).filter(Boolean);
const dispById = new Map(validated.map((d) => [d.candidateId, d.disposition]));
const allOutcomes = validated.flatMap((d) => d.outcomes);
const dispCounts = validated.reduce((acc, d) => {
  acc[d.disposition] = (acc[d.disposition] || 0) + 1;
  return acc;
}, {});
log(`validate done: ${JSON.stringify(dispCounts)}; ${allOutcomes.length} voter outcomes`);

phase('meta');
const candidatesForMeta = candidates.map((c) => ({
  id: c.id,
  pattern: c.pattern,
  kind: c.kind,
  isAbsenceClaim: c.isAbsenceClaim,
  supportingWindows: c.supportingWindows,
  disposition: dispById.get(c.id) || 'unknown',
}));
const metaResult = await agent(metaPrompt(candidatesForMeta, BASELINES), {
  label: 'meta',
  phase: 'meta',
  model: 'opus',
  effort: 'high',
  schema: META_SCHEMA,
});
log('meta done');

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
