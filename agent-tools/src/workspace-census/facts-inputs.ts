/**
 * Side-effectful gatherers for the detector-fact sweep: manifest
 * summaries from each subject's package.json, tracked files bucketed
 * by subject, and Oak-marker counts from the tracked file contents.
 * Everything recomputes from the live tree; oversized files are
 * skipped by a declared bound so the sweep stays deterministic and
 * cheap. Pure assembly stays in `facts.js`.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

import { err, ok, type Result } from '@oaknational/result';
import { typeSafeKeys } from '@oaknational/type-helpers';

import { isErrnoCode } from '../collaboration-state/errno.js';
import { getJsonValue, isJsonObject, parseJsonTextResult, type JsonObject } from '../core/json.js';
import type { CensusSubject } from './subjects.js';
import { CODE_EXTENSIONS } from './vocabulary.js';
import type { ManifestSummaryInput, SubjectGrepCounts } from './facts.js';

/** Files above this size are skipped by the marker scan (declared bound). */
const MAX_SCANNED_FILE_BYTES = 1024 * 1024;

const INTERNAL_SCOPE = '@oaknational/';

function countMatches(text: string, pattern: RegExp): number {
  return text.match(pattern)?.length ?? 0;
}

function isCodeFile(filePath: string): boolean {
  return CODE_EXTENSIONS.some((extension) => filePath.endsWith(extension));
}

function isDocsFile(filePath: string): boolean {
  return filePath.endsWith('.md') || filePath.endsWith('.mdx');
}

/** Bucket the repo's tracked files under their owning subject (longest dirPath wins). */
export function bucketTrackedFiles(
  subjects: readonly CensusSubject[],
  trackedFiles: readonly string[],
): Map<string, string[]> {
  const byLengthDesc = [...subjects].sort((a, b) => b.dirPath.length - a.dirPath.length);
  const buckets = new Map<string, string[]>(subjects.map((subject) => [subject.dirPath, []]));
  for (const filePath of trackedFiles) {
    const owner = byLengthDesc.find(
      (subject) =>
        subject.dirPath === '.' ||
        filePath === subject.dirPath ||
        filePath.startsWith(`${subject.dirPath}/`),
    );
    if (owner !== undefined) {
      buckets.get(owner.dirPath)?.push(filePath);
    }
  }
  return buckets;
}

function collectInternalDependencies(manifest: JsonObject): string[] {
  const names = new Set<string>();
  for (const key of ['dependencies', 'devDependencies', 'peerDependencies']) {
    const block = getJsonValue(manifest, key);
    if (!isJsonObject(block)) {
      continue;
    }
    for (const dependencyName of typeSafeKeys(block)) {
      if (dependencyName.startsWith(INTERNAL_SCOPE)) {
        names.add(dependencyName);
      }
    }
  }
  return [...names].sort((a, b) => a.localeCompare(b));
}

function summariseManifest(parsed: JsonObject, dirPath: string): ManifestSummaryInput {
  const name = getJsonValue(parsed, 'name');
  const licence = getJsonValue(parsed, 'license');
  return {
    dirPath,
    name: typeof name === 'string' ? name : '(unnamed)',
    isPrivate: getJsonValue(parsed, 'private') === true,
    licence: typeof licence === 'string' ? licence : null,
    hasExports: getJsonValue(parsed, 'exports') !== undefined,
    internalDependencies: collectInternalDependencies(parsed),
  };
}

/** Read and summarise one subject's package.json; ok(null) when absent. */
export async function readManifestSummary(
  repoRoot: string,
  dirPath: string,
): Promise<Result<ManifestSummaryInput | null, string>> {
  const manifestPath = path.join(repoRoot, dirPath === '.' ? '' : dirPath, 'package.json');
  let raw: string;
  try {
    raw = await fs.readFile(manifestPath, 'utf8');
  } catch (error) {
    if (isErrnoCode(error, 'ENOENT')) {
      return ok(null);
    }
    return err(`${manifestPath}: ${error instanceof Error ? error.message : String(error)}`);
  }
  const parsed = parseJsonTextResult(raw, manifestPath);
  if (!parsed.ok) {
    return err(parsed.error.message);
  }
  if (!isJsonObject(parsed.value)) {
    return err(`${manifestPath}: not an object`);
  }
  return ok(summariseManifest(parsed.value, dirPath));
}

async function readScannable(repoRoot: string, filePath: string): Promise<string | null> {
  const absolute = path.join(repoRoot, filePath);
  try {
    const stats = await fs.stat(absolute);
    if (stats.size > MAX_SCANNED_FILE_BYTES) {
      return null;
    }
    return await fs.readFile(absolute, 'utf8');
  } catch {
    return null;
  }
}

/** Count Oak markers across one subject's tracked files. */
export async function grepSubjectCounts(
  repoRoot: string,
  files: readonly string[],
): Promise<SubjectGrepCounts> {
  let oakInDocs = 0;
  let oakInSource = 0;
  let cssOakVariables = 0;
  let dottedOakNamespaces = 0;
  let oakEnvKeys = 0;
  for (const filePath of files) {
    const content = await readScannable(repoRoot, filePath);
    if (content === null) {
      continue;
    }
    const oakCount = countMatches(content, /oak/gi);
    if (isDocsFile(filePath)) {
      oakInDocs += oakCount;
    } else if (isCodeFile(filePath)) {
      oakInSource += oakCount;
    }
    cssOakVariables += countMatches(content, /--oak-/g);
    if (isCodeFile(filePath)) {
      dottedOakNamespaces += countMatches(content, /\boak\.[a-z]/g);
    }
    oakEnvKeys += countMatches(content, /\bOAK_[A-Z_]+/g);
  }
  return { oakInDocs, oakInSource, cssOakVariables, dottedOakNamespaces, oakEnvKeys };
}
