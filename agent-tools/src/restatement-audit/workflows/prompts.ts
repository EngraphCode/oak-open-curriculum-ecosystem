/**
 * Stage prompts for the restatement-audit workflow pipeline.
 *
 * @remarks
 * Pure string builders; unit tests pin the load-bearing clauses (the compiled decision
 * procedure's trigger classes, the banned-vocabulary list, the no-cross-file-reasoning
 * ban, the closed cure menu). The prompt text is behaviour — a wording change changes
 * what finders extract or voters judge — so edits here are design changes, not copy
 * tweaks, per the same discipline as `corpus-analysis/workflows/prompts.ts`.
 *
 * @packageDocumentation
 */

import type { Cluster } from '../schemas.js';
import { flattenGazetteerSubjects, type Gazetteer } from './gazetteer.js';
import type { GroundingInstance, MetaCluster, PartitionWindow } from './stage-io.js';

/**
 * Vocabulary that lets a model claim a fact without grounding it in the text actually in
 * front of it — the finder decision procedure bans every instance from resting on one of
 * these words; only what the source text explicitly states counts.
 */
const BANNED_GAP_BRIDGING_VOCABULARY = [
  'likely',
  'probably',
  'appears to',
  'seems to',
  'presumably',
  'should be',
  'typically',
  'generally',
  'implies',
  'suggests',
] as const;

/** The banned list rendered for prompt text, hoisted so no template literal nests (S4624). */
const bannedGapBridgingList = BANNED_GAP_BRIDGING_VOCABULARY.map((w) => `"${w}"`).join(', ');

/** MAP — extract atomic, quote-anchored restatement instances from one T3 file set. */
export function finderPrompt(window: PartitionWindow, gazetteer: Gazetteer): string {
  const subjects = flattenGazetteerSubjects(gazetteer);
  return [
    "You are the MAP stage of a restatement-audit fleet over this repository's T3 corpus (protocol + coordination + doctrine + active plans). The fleet hunts AUTHORED RESTATEMENT OF DERIVABLE STATE: a fact copied into prose at more than one place, which a later edit at one site silently makes wrong at the others.",
    `This is ONE window: ${window.window}.`,
    'Use the Read tool to read EVERY one of these files IN FULL before extracting (paths are relative to the repository root):',
    window.files.map((f) => `  - ${f}`).join('\n'),
    '',
    "GAZETTEER — canonical subject ids for this sweep. When a statement's subject matches one of these EXACTLY (or unambiguously — e.g. the gazetteer id is the plain-English name of the same thing), you MUST use the gazetteer id verbatim as `subject` and set subjectFromGazetteer=true. Anything else is free text: invent a short, stable, kebab-case subject label and set subjectFromGazetteer=false. Entries are join keys, not exhaustive vocabulary — most true subjects in this corpus will NOT be in this list.",
    subjects.map((id) => `  - ${id}`).join('\n'),
    '',
    'DECISION PROCEDURE — apply these five trigger classes mechanically, in order, to every sentence. A sentence may trigger more than one; emit one instance per trigger.',
    `  1. STATUS / AUTHORIZATION LANGUAGE — a workflow, gate, PR, or task state word or marker asserted about a named subject. This sweep's gazetteer status vocabulary: ${gazetteer.statusVocabulary.join(', ')} — indicative, not exhaustive: any equivalent state word or marker (🟢/🟡/🔴, DECISION-COMPLETE, …) also triggers. -> factClass: status-assertion.`,
    '  2. CLOSED-SET / MEMBERSHIP LANGUAGE — a claim that a set, population, or list is exhaustive or has N members ("the seven lanes", "all 137 files", "the six falsifiers"). -> factClass: closed-set-membership.',
    '  3. BARE NUMERIC RESTATEMENT — a count, denominator, or threshold value stated in prose, not computed inline from a source the reader can see in this same sentence. -> factClass: count | denominator | threshold (pick the one the number actually is).',
    '  4. COVERAGE / MAPPING CLAIM — a claim that one thing covers, maps to, handles, or gates another ("X gates Y", "the validator covers Z"). -> factClass: coverage-mapping.',
    '  5. NAMED-ENTITY OR DATE CLAIM — a specific tool/artefact/file name asserted to have some property or behaviour, OR a specific calendar date asserted as a fact. -> factClass: named-tool-or-artefact | date-claim (pick the one that fits).',
    '',
    'MANDATORY GROUNDING — every instance MUST carry the exact 1-indexed line number and a verbatim quote (<=200 chars) copied from the file, never paraphrased or reconstructed from memory. If you cannot point to a specific line and copy its text exactly, do NOT emit the instance.',
    `BANNED GAP-BRIDGING VOCABULARY — never ground an instance in your own inference. If your reasoning for extracting an instance leans on words like ${bannedGapBridgingList}, the source text does not actually state the fact — do not emit it.`,
    "NO CROSS-FILE REASONING — judge each file only against itself and the gazetteer above. Do NOT compare this window's files against each other, and do NOT reason about files outside this window's list; the join and reduce stages, not you, detect cross-file duplication.",
    '',
    'ASSERTION KIND — classify every instance:',
    "  - authored: freshly stated as fact in this document's own prose.",
    '  - citation: explicitly quoting, referencing, or pointing at another document as the source ("see X", "per Y", a fenced quote of another file).',
    '  - history: narrated in the past tense as something that already happened, in a section that reads as a log/changelog entry rather than current-state prose.',
    "  - generated: the FILE ITSELF is a generator or generated-data artefact (e.g. a `.json` manifest, a machine-written report) — the fact is the artefact's own output, not authored prose.",
    'Only `authored` instances are the anti-pattern this fleet targets; the other three are legitimate and exist so downstream code and voters can tell them apart — extract them too, honestly classified, never skipped.',
    '',
    'Recall over precision within this decision procedure — if in doubt whether a trigger fires, emit the instance; the join layer and voters filter false positives downstream. Do NOT invent facts, and do NOT infer subject/predicate/value from anything not in the quoted text.',
    'Each instance: a unique id prefixed with the window (e.g. ' +
      window.window +
      '-I01), file, line, quote, factClass, subject, subjectFromGazetteer, predicate (a short label for what property is being asserted, e.g. "status", "member-count", "behaviour-claim"), valueNorm (the asserted value, as stated), assertionKind, confidence (low/med/high).',
    'Output the single required structured-output call only — no prose, no markdown, no preamble.',
  ].join('\n');
}

/** REDUCE — propose clusters among free-text-subject instances only; never a verdict. */
export function reducerPrompt(freeTextInstances: readonly GroundingInstance[]): string {
  return [
    'You are the REDUCE stage of a restatement-audit fleet. Below are finder instances whose subject did NOT match the gazetteer (free text) — the exact-key gazetteer matches are already clustered deterministically by code and are not shown here.',
    '',
    'Propose CLUSTERS: groups of instances that assert the SAME fact (the same real-world subject and the same predicate) using different subject wording. Only propose a cluster when you are confident the instances genuinely refer to the same thing — a cluster of unrelated instances is worse than no cluster.',
    '',
    'You NEVER emit a verdict, a conflict/latent label, or a count — code recomputes the verdict deterministically from the instances you group. Emit ONLY membership: for each proposed cluster, a temporary id and the list of instance ids you believe share one fact.',
    '',
    'Do not propose a cluster of fewer than two instances. Output the single required structured-output call only.',
    '',
    'INSTANCES:',
    JSON.stringify(freeTextInstances),
  ].join('\n');
}

/** VALIDATE — one voter's judgment of one judgment-needed cluster. */
export function votePrompt(input: {
  readonly cluster: Cluster;
  readonly members: readonly GroundingInstance[];
}): string {
  const { cluster, members } = input;
  const memberLines = members
    .map((m) => `  - [${m.file}:${m.line}] (${m.assertionKind}) "${m.quote}" -> ${m.valueNorm}`)
    .join('\n');
  return [
    "You are a VOTER judging ONE cluster from a restatement-audit fleet. Be SKEPTICAL: a FALSE FLAG (ratifying a cluster that is not actually a genuine authored-restatement problem) wastes the Director's fix effort — when uncertain, fail the test.",
    '',
    `Fact: factClass=${cluster.factClass}  subject=${cluster.subject}  predicate=${cluster.predicate}`,
    `Code-computed verdict: ${cluster.verdict} (distinct values: ${cluster.distinctValueNorms.join(' | ')})`,
    'Member instances (verbatim quotes, as extracted):',
    memberLines,
    '',
    'Judge ONLY from the evidence supplied above — you have no tools: flagged clusters are byte-verified deterministically downstream, and your turn budget is tight. Respond with the single required structured output call — nothing else.',
    '',
    'Emit, for EACH of the four conjunctive tests, pass (boolean) + confidence (low/med/high):',
    '  - sameFact: every member genuinely asserts the SAME real-world fact (not a false-positive join — different things that merely share wording fail this).',
    '  - authoredNotCited: at least one member is an AUTHORED restatement (not every member is a citation, history entry, or generated artefact — a cluster where the only "authored" member is legitimately deriving from a generated/cited source fails this).',
    '  - genuineConflict: for a `conflict` cluster, the distinct values truly disagree in substance (not merely differ in phrasing of the same value); for a `latent` cluster, the repetition is a genuine same-fact copy, not two coincidentally-identical but unrelated statements.',
    '  - liveSurface: the member files are live, current surfaces (not an archived, superseded, or historical record where restating an old value is expected and harmless).',
    '',
    "Also rate the cluster's importance (low/med/high) — how much a future edit at one site silently invalidating the others would matter. Do NOT emit a flagged/dismissed disposition — only the four test judgments and importance; the disposition is computed deterministically downstream.",
  ].join('\n');
}

/** META — byte-verify every flagged cluster's quotes and assign the fix. */
export function metaPrompt(clusters: readonly MetaCluster[]): string {
  return [
    'You are the META stage of a restatement-audit fleet — the final, byte-verifying pass over clusters that survived voting as genuine authored-restatement problems.',
    '',
    'For EACH cluster below: use Glob/Grep/Read to byte-verify every member quote is still present, verbatim, at its stated file and line in the LIVE tree (grep -F the exact quote). If a quote has drifted or the line has moved, correct it or drop that member and note why in metaNotes; never trust the extracted quote unread.',
    '',
    'Then assign, from evidence you can point to:',
    '  - sourceOfTruth: the single file path that SHOULD be the one place this fact is stated (a generator, a register, a canonical doc) — or `null` if no such single source exists yet (this row then feeds prevention design, not just a patch).',
    '  - proposedCure: EXACTLY one of the closed menu — cite-register (point at an existing register/generator instead of restating) | extract-to-data (the fact belongs in a generated/data file, not prose) | derive-from-generator (a generator should compute this, not an author) | delete-restatement (this copy is simply redundant and should be removed) | mark-as-history (this is a legitimate historical record, not a live restatement — reclassify, do not delete) | new-single-source (no source of truth exists; one must be created).',
    '  - severity: low/med/high, weighing how consequential a future drift would be.',
    '',
    "Each row's `id` MUST be its cluster's `id`, copied verbatim — coverage is recomputed in code and any mismatch fails the whole stage.",
    '',
    'Resolve any SPLIT: if a cluster actually bundles two distinct facts (a false-positive join the voters missed), say so in metaNotes and still emit your best single row for it — do not silently drop a cluster.',
    '',
    'Output the single required structured-output call only — one ledger row per cluster.',
    '',
    'CLUSTERS:',
    JSON.stringify(clusters),
  ].join('\n');
}

export { BANNED_GAP_BRIDGING_VOCABULARY };
