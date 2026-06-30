export const meta = {
  name: 'napkin-corpus-analysis-v2-meta',
  description:
    'Meta/recall stage over all 50 candidates with their CORRECTED (post-kill-escalation) dispositions: per-baseline recall match + corroboration claims.',
  phases: [{ title: 'meta', detail: 'Opus/high — per-baseline recall match + corroboration claims over all 50 candidates' }],
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

// All 50 candidates with their CORRECTED dispositions (injected post-top-up).
const CANDIDATES_FOR_META = __CANDIDATES_FOR_META__;

function metaPrompt(candidatesWithDisposition, baselines) {
  return [
    'You are the META stage — the recall calibration. For EACH of the 18 known-present baseline patterns below (drawn from prior hand-authored syntheses of THIS corpus), judge whether this Discovery run RE-FOUND it, and via which candidate.',
    '',
    'The run\'s FINDINGS are the candidates with disposition "keep" or "reroute". A baseline matched only by a "kill"/"held-for-review" candidate counts as MISSED (the run did not surface it as a finding).',
    '',
    'For each baseline emit a RECALL-MATCH: baselineId, verdict, matchedCandidateId, note.',
    '  verdict in subsumes (a finding fully covers and extends the baseline) | refines (captures it at finer grain) | equal (same grain) | partial (overlaps but misses substance) | missed (not re-found among findings).',
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

phase('meta');
const metaResult = await agent(metaPrompt(CANDIDATES_FOR_META, BASELINES), {
  label: 'meta-all-50',
  phase: 'meta',
  model: 'opus',
  effort: 'high',
  schema: META_SCHEMA,
});
log('meta over all 50 candidates done');

return { meta: metaResult };
