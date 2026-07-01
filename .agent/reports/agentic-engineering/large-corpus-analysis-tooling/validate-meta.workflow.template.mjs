export const meta = {
  name: 'napkin-corpus-analysis-v2-validate-meta',
  description:
    'Rate-controlled seeded completion of the v2 corpus-analysis rerun: validate (mirror-driven Tier 0/1/2) + meta over the already-committed 50 candidates, at a tunable concurrency cap.',
  phases: [
    { title: 'validate', detail: 'Opus/high — tiered adversary over 50 seeded candidates, concurrency-capped' },
    { title: 'meta', detail: 'Opus/high — per-baseline recall match + corroboration claims (only if validate fully resolved)' },
  ],
};

// THROUGHPUT KNOB — max candidate-loops in flight at once. Pure rate control: fewer in flight
// = lower instantaneous token rate, identical total analysis and rigour (every candidate, every
// tier, every test runs regardless). The only trade is wall-clock latency. Each candidate loop
// dispatches at most 3 voters at once (the Tier-2 ensemble), so peak agents ~= MAX_CONCURRENCY * 3.
const MAX_CONCURRENCY = 3;

// RESUME — candidate ids already resolved in a prior (quota-tripped) run, substituted at launch
// (default [] = fresh run). resolveResumeSeed filters these from CANDIDATES_SEED so a re-seed
// re-dispatches ONLY the unresolved tail (~1M), not the whole validate stage (~8.6M).
const RESOLVED_IDS = __RESOLVED_IDS__;
// POST-REDUCE HARD-ABORT CEILING — worst-case validate tokens above this abort the run BEFORE any
// voter is dispatched. Re-derive at launch from the real candidate count (see launch pre-flight).
// ON A RESUME the re-gate guards only the TAIL spend (the resumed count), so re-derive the ceiling
// for the TAIL — never reuse a prior full-run ceiling literal, or a small tail will never trip it.
const VALIDATE_TOKEN_CEILING = __VALIDATE_TOKEN_CEILING__;
// JITTER — max deterministic per-voter dispatch delay (ms) to flatten the rate burst; 0 disables.
const JITTER_MS = 250;

// ----------------------------------------------------------------------------
// SANDBOX MIRROR — verbatim copy of workflow-routing-mirror.ts, pinned to the source by
// workflow-routing-mirror.conformance.test.ts (39 cases) and re-checked (20 known-answer cases).
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
// run-orchestration.ts (the resume / completeness / re-gate / jitter primitives; the sandbox cannot
// import repo code). Unit-tested THERE; NOT machine-pinned to this paste — re-check before each
// launch (README §Critical operational notes). postReduceRegate is computed directly here and equals
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

// ---- JSON schemas (match the zod strictObjects; downstream re-parses with the real parsers) ----
const CONFIDENCE = { type: 'string', enum: ['low', 'med', 'high'] };
const TEST = {
  type: 'object',
  additionalProperties: false,
  required: ['pass', 'confidence'],
  properties: { pass: { type: 'boolean' }, confidence: CONFIDENCE },
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
const RECALL_VERDICT = { type: 'string', enum: ['subsumes', 'refines', 'equal', 'partial', 'missed'] };
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

// ---- The 18 frozen recall baselines (id + statement + population) ----
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

// ---- Seeded candidates (the committed reduce output) ----
const CANDIDATES_SEED = __CANDIDATES_SEED__;

// LEAVES — the committed map-only leaves.json (the SAME file reduce was seeded from), substituted at
// launch. `candidateSchema` (a zod strictObject, judgment-schemas.ts) carries NO grounding field — so
// voter grounding is assembled HERE at vote-time from each candidate's supportingLeafIds via leafById
// (the window lives on the LEAF, not the citation), matching the retired straight-through workflow
// (votePrompt/leafById). WITHOUT this the voters see no grounding, the `grounded` test fails, and
// candidates mass-kill — silent recall collapse on the one-way run. On a resume, splice the SAME
// leaves.json. Do NOT instead add grounding to the candidate in reduce: parseCandidate's strict
// re-parse would reject the extra key.
const leaves = __LEAVES__;
const leafById = new Map((leaves || []).map((l) => [l.id, l]));

// ---- Prompts ----
function votePrompt(candidate, lens) {
  const grounding = (candidate.supportingLeafIds || [])
    .map((id) => leafById.get(id))
    .filter(Boolean)
    .flatMap((leaf) => (leaf.grounding || []).map((g) => `  - [${leaf.window} ${g.napkinDate}] ${g.quote}`))
    .join('\n');
  return [
    'You are an ADVERSARY voter judging ONE candidate emergent pattern from a corpus-analysis run over an AI engineering agent\'s working-memory "napkin" corpus. Be SKEPTICAL: a FALSE KEEP (ratifying a pattern that is not actually real) is the costly, asymmetric error — when uncertain, fail the test.',
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

// ---- Per-candidate tiered adversary, driven by the mirrored state machine ----
async function adjudicateCandidate(candidate) {
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
        // Deterministic per-voter jitter (no Math.random — resume-safe) to flatten the dispatch burst.
        if (typeof setTimeout === 'function' && JITTER_MS > 0) {
          await new Promise((done) => setTimeout(done, deterministicJitterMs(voterId, JITTER_MS)));
        }
        const verdict = await agent(votePrompt(candidate, lens), {
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

// ---- Concurrency-capped runner — the throughput control (chunked barrier at MAX_CONCURRENCY) ----
async function runCapped(items, limit, fn) {
  const out = [];
  for (let i = 0; i < items.length; i += limit) {
    const chunk = items.slice(i, i + limit);
    const r = await parallel(chunk.map((it) => () => fn(it)));
    out.push(...r);
  }
  return out;
}

// ---- Orchestration ----
// Candidate-granular resume: drop the ids resolved in a prior run; re-validate only the tail.
const seededCandidates = CANDIDATES_SEED;
const candidates = resolveResumeSeed(seededCandidates, RESOLVED_IDS);
const isResume = RESOLVED_IDS.length > 0;
log(`seeded validate: ${seededCandidates.length} seeded, ${seededCandidates.length - candidates.length} already resolved, ${candidates.length} to validate, MAX_CONCURRENCY=${MAX_CONCURRENCY}`);

// Post-reduce HARD-ABORT re-gate: recompute validate cost from the REAL (resumed) candidate count
// with the corrected ~50k/voter calibration, and abort BEFORE dispatching any voter if it breaches
// the ceiling — the v2 run overran to ~13.2M because the old gate only logged.
const regate = postReduceRegate({ candidateCount: candidates.length, ceiling: VALIDATE_TOKEN_CEILING });
log(regate.message);
if (regate.abort) {
  throw new Error(regate.message);
}

phase('validate');
const validated = (await runCapped(candidates, MAX_CONCURRENCY, adjudicateCandidate)).filter(Boolean);
const allOutcomes = validated.flatMap((d) => d.outcomes);
const dispById = new Map(validated.map((d) => [d.candidateId, d.disposition]));
const dispCounts = validated.reduce((acc, d) => {
  acc[d.disposition] = (acc[d.disposition] || 0) + 1;
  return acc;
}, {});
log(`validate done: ${JSON.stringify(dispCounts)}; ${allOutcomes.length} voter outcomes`);

// Completeness guard (extended): validate is INCOMPLETE if ANY candidate is held-for-review (for
// any reason — retry-cap / quorum-tie / lens-collision) OR if a candidate was silently dropped
// from `validated` (count mismatch). Meta runs ONLY on a fresh, fully-resolved run; a RESUME run
// validates just the tail, so its meta is deferred to meta.workflow.template.mjs over the MERGED
// dispositions (this run's tail + the prior run's resolved set).
const completeness = assessValidateCompleteness(validated, candidates);
const incompleteIds = completeness.incompleteCandidateIds;
const validateComplete = completeness.complete;
if (completeness.missingCandidateIds.length > 0) {
  log(`validate INCOMPLETE — ${completeness.missingCandidateIds.length} candidates missing from validated: ${completeness.missingCandidateIds.join(',')}`);
}

let metaResult = null;
if (validateComplete && !isResume) {
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
} else if (isResume && validateComplete) {
  log(`resume tail COMPLETE (${candidates.length} candidates) — meta deferred to meta.workflow.template.mjs over the MERGED dispositions (this tail + the prior resolved set).`);
} else {
  log(`validate INCOMPLETE — ${incompleteIds.length} held, ${completeness.missingCandidateIds.length} missing. Re-seed via RESOLVED_IDS; unresolved this run: ${[...incompleteIds, ...completeness.missingCandidateIds].join(',')}.`);
}

// Candidates that reached a TERMINAL disposition in THIS run — accumulate into RESOLVED_IDS for any resume.
const resolvedCandidateIds = validated
  .filter((d) => d.disposition !== 'held-for-review')
  .map((d) => d.candidateId);

return {
  validateComplete,
  isResume,
  resolvedCandidateIds,
  incompleteCandidateIds: incompleteIds,
  missingCandidateIds: completeness.missingCandidateIds,
  dispositions: validated.map((d) => ({ candidateId: d.candidateId, disposition: d.disposition, reason: d.reason })),
  voterOutcomes: allOutcomes,
  meta: metaResult,
};
