/**
 * The workspace-census subcommands. Each returns a process exit code;
 * failures arrive as Result errors from the gatherers and are written
 * to stderr here, at the process boundary.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

import { err, ok, type Result } from '@oaknational/result';

import { emptyRowsArtefact, readRowsArtefact, type RowsArtefact } from './artefact.js';
import { computeDelta, parseLegacyMatrix, type DeltaResult } from './delta.js';
import { listMembers, listTrackedFiles } from './inputs.js';
import { validateRows } from './rows.js';
import { deriveSubjects, type CensusSubject } from './subjects.js';

export interface CommandContext {
  readonly repoRoot: string;
  readonly rowsPath: string;
  readonly legacyPath: string;
  readonly json: boolean;
  readonly stdout: Pick<NodeJS.WriteStream, 'write'>;
  readonly stderr: Pick<NodeJS.WriteStream, 'write'>;
}

export async function deriveLiveSubjects(
  repoRoot: string,
): Promise<Result<CensusSubject[], string>> {
  const [members, trackedFiles] = await Promise.all([
    listMembers(repoRoot),
    listTrackedFiles(repoRoot),
  ]);
  if (!members.ok) {
    return err(members.error);
  }
  if (!trackedFiles.ok) {
    return err(trackedFiles.error);
  }
  return ok(deriveSubjects({ members: members.value, trackedFiles: trackedFiles.value }));
}

export async function runSubjects(context: CommandContext): Promise<number> {
  const subjects = await deriveLiveSubjects(context.repoRoot);
  if (!subjects.ok) {
    context.stderr.write(`workspace-census: ${subjects.error}\n`);
    return 1;
  }
  if (context.json) {
    context.stdout.write(`${JSON.stringify(subjects.value, null, 2)}\n`);
    return 0;
  }
  for (const subject of subjects.value) {
    const name = subject.publishedName ?? '(no published name)';
    context.stdout.write(`${subject.dirPath}\t${name}\t[${subject.sources.join(', ')}]\n`);
  }
  context.stdout.write(`total subjects: ${String(subjects.value.length)}\n`);
  return 0;
}

function mergeSkeletonRows(artefact: RowsArtefact, subjects: readonly CensusSubject[]): string[] {
  const existingDirs = new Set(artefact.rows.map((row) => row.dirPath));
  const added: string[] = [];
  for (const subject of subjects) {
    if (existingDirs.has(subject.dirPath)) {
      continue;
    }
    artefact.rows.push({
      dirPath: subject.dirPath,
      publishedName: subject.publishedName,
      disposition: 'pending',
    });
    added.push(subject.dirPath);
  }
  artefact.rows.sort((a, b) => a.dirPath.localeCompare(b.dirPath));
  return added;
}

export async function runSkeleton(context: CommandContext): Promise<number> {
  const subjects = await deriveLiveSubjects(context.repoRoot);
  if (!subjects.ok) {
    context.stderr.write(`workspace-census: ${subjects.error}\n`);
    return 1;
  }
  const rowsAbsolute = path.resolve(context.repoRoot, context.rowsPath);
  const readResult = await readRowsArtefact(rowsAbsolute);
  if (!readResult.ok) {
    context.stderr.write(`workspace-census: ${readResult.error}\n`);
    return 1;
  }
  const artefact = readResult.value ?? emptyRowsArtefact();
  const added = mergeSkeletonRows(artefact, subjects.value);

  await fs.mkdir(path.dirname(rowsAbsolute), { recursive: true });
  await fs.writeFile(rowsAbsolute, `${JSON.stringify(artefact, null, 2)}\n`, 'utf8');

  context.stdout.write(
    `skeleton: ${String(added.length)} row(s) added, ${String(artefact.rows.length)} total (${context.rowsPath})\n`,
  );
  for (const dirPath of added) {
    context.stdout.write(`  + ${dirPath}\n`);
  }
  return 0;
}

export async function loadRowsArtefact(
  context: CommandContext,
): Promise<Result<RowsArtefact, string>> {
  const readResult = await readRowsArtefact(path.resolve(context.repoRoot, context.rowsPath));
  if (!readResult.ok) {
    return err(readResult.error);
  }
  if (readResult.value === null) {
    return err(`${context.rowsPath}: missing — run skeleton first`);
  }
  return ok(readResult.value);
}

export async function runCheck(context: CommandContext): Promise<number> {
  const subjects = await deriveLiveSubjects(context.repoRoot);
  if (!subjects.ok) {
    context.stderr.write(`workspace-census: ${subjects.error}\n`);
    return 1;
  }
  const artefact = await loadRowsArtefact(context);
  if (!artefact.ok) {
    context.stderr.write(`workspace-census: ${artefact.error}\n`);
    return 1;
  }
  const result = validateRows({ subjects: subjects.value, rows: artefact.value.rows });
  if (result.ok) {
    context.stdout.write(
      `workspace-census check: PASS (${String(subjects.value.length)} subjects, all rows valid)\n`,
    );
    return 0;
  }
  context.stderr.write(
    `workspace-census check: FAIL — ${String(result.problems.length)} problem(s)\n`,
  );
  for (const problem of result.problems) {
    context.stderr.write(`  - ${problem}\n`);
  }
  return 1;
}

function renderDeltaText(legacyCount: number, delta: DeltaResult): string {
  const orNone = (parts: readonly string[]): string =>
    parts.length === 0 ? '(none)' : parts.join(', ');
  return [
    `legacy rows: ${String(legacyCount)}`,
    `appeared:    ${orNone(delta.appeared.map((row) => row.dirPath))}`,
    `disappeared: ${orNone(delta.disappeared.map((row) => row.dirPath))}`,
    `changed:     ${orNone(delta.changed.map((row) => `${row.dirPath} (${row.from} -> ${row.to})`))}`,
    `renamed:     ${orNone(delta.renamed.map((row) => `${row.fromDirPath} -> ${row.toDirPath}`))}`,
    '',
  ].join('\n');
}

export async function readLegacyMarkdown(context: CommandContext): Promise<Result<string, string>> {
  try {
    return ok(await fs.readFile(path.resolve(context.repoRoot, context.legacyPath), 'utf8'));
  } catch (error) {
    return err(`${context.legacyPath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function runDelta(context: CommandContext): Promise<number> {
  const artefact = await loadRowsArtefact(context);
  if (!artefact.ok) {
    context.stderr.write(`workspace-census: ${artefact.error}\n`);
    return 1;
  }
  const legacyMarkdown = await readLegacyMarkdown(context);
  if (!legacyMarkdown.ok) {
    context.stderr.write(`workspace-census: ${legacyMarkdown.error}\n`);
    return 1;
  }
  const legacyRows = parseLegacyMatrix(legacyMarkdown.value);
  const delta = computeDelta({ legacyRows, rows: artefact.value.rows });
  if (context.json) {
    context.stdout.write(`${JSON.stringify(delta, null, 2)}\n`);
    return 0;
  }
  context.stdout.write(renderDeltaText(legacyRows.length, delta));
  return 0;
}
