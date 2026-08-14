/**
 * The `facts` subcommand (census todo 2): gathers the mechanical
 * detector facts for every subject and writes the facts artefact.
 * Split from commands.js on size; shares the CommandContext shape.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

import { err, ok, type Result } from '@oaknational/result';

import { deriveLiveSubjects, type CommandContext } from './commands.js';
import { assembleFacts, type ManifestSummaryInput, type SubjectFacts } from './facts.js';
import { bucketTrackedFiles, grepSubjectCounts, readManifestSummary } from './facts-inputs.js';
import { listTrackedFiles } from './inputs.js';
import type { CensusSubject } from './subjects.js';

const FACTS_PATH = '.agent/reports/workspace-classification-census/facts.json';

async function gatherManifests(
  repoRoot: string,
  subjects: readonly CensusSubject[],
): Promise<Result<ManifestSummaryInput[], string>> {
  const manifests: ManifestSummaryInput[] = [];
  for (const subject of subjects) {
    const summary = await readManifestSummary(repoRoot, subject.dirPath);
    if (!summary.ok) {
      return err(summary.error);
    }
    if (summary.value !== null) {
      manifests.push(summary.value);
    }
  }
  return ok(manifests);
}

async function gatherFacts(context: CommandContext): Promise<Result<SubjectFacts[], string>> {
  const subjects = await deriveLiveSubjects(context.repoRoot);
  if (!subjects.ok) {
    return err(subjects.error);
  }
  const trackedFiles = await listTrackedFiles(context.repoRoot);
  if (!trackedFiles.ok) {
    return err(trackedFiles.error);
  }
  const manifests = await gatherManifests(context.repoRoot, subjects.value);
  if (!manifests.ok) {
    return err(manifests.error);
  }
  const buckets = bucketTrackedFiles(subjects.value, trackedFiles.value);
  const grepCounts = new Map<string, Awaited<ReturnType<typeof grepSubjectCounts>>>();
  for (const [dirPath, files] of buckets) {
    grepCounts.set(dirPath, await grepSubjectCounts(context.repoRoot, files));
  }
  return ok(
    assembleFacts({
      subjects: subjects.value,
      manifests: manifests.value,
      trackedFilesBySubject: buckets,
      grepCountsBySubject: grepCounts,
    }),
  );
}

export async function runFacts(context: CommandContext): Promise<number> {
  const facts = await gatherFacts(context);
  if (!facts.ok) {
    context.stderr.write(`workspace-census: ${facts.error}\n`);
    return 1;
  }
  const outPath = path.resolve(context.repoRoot, FACTS_PATH);
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  const artefact = {
    schema_version: '1.0.0',
    plan: '.agent/plans/delivery/workspace-classification-census.plan.md',
    note: 'Detector facts only — mechanical observations; judged readings live in rows.json.',
    facts: facts.value,
  };
  await fs.writeFile(outPath, `${JSON.stringify(artefact, null, 2)}\n`, 'utf8');
  context.stdout.write(
    `facts: ${String(facts.value.length)} subject entries written (${FACTS_PATH})\n`,
  );
  return 0;
}
