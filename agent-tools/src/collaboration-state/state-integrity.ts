import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

import {
  createCollaborationJsonSchemaValidator,
  type CollaborationJsonSchemaValidator,
  type CollaborationSchemaId,
} from './collaboration-json-validation.js';
import { isErrnoCode } from './errno.js';
import { checkCollaborationSurfaceContract, isContractSchemaId } from './surface-contract.js';

const COLLABORATION_ROOT = '.agent/state/collaboration';

interface JsonSurface {
  // One schemaId, one vocabulary: the shared check owns the parser dispatch
  // (no injectable parser seam), and isContractSchemaId decides which
  // surfaces carry a runtime contract — no second field for drift to split.
  readonly path: string;
  readonly schemaId: CollaborationSchemaId;
  // Untracked-by-design surfaces (ADR-199 Phase-3 untrack) are absent in a fresh
  // checkout (e.g. CI) and present-on-disk on a working instance. An absent such
  // surface is the expected clean state, not an integrity fault.
  readonly optionalWhenAbsent?: boolean;
}

interface CollaborationStateIntegrityFinding {
  readonly path: string;
  readonly message: string;
}

export interface CollaborationStateIntegrityReport {
  readonly checkedCount: number;
  readonly findings: readonly CollaborationStateIntegrityFinding[];
}

export async function validateCollaborationStateIntegrity(input: {
  readonly repoRoot: string;
}): Promise<CollaborationStateIntegrityReport> {
  const surfaces = await jsonSurfaces(input.repoRoot);
  const validator = await createCollaborationJsonSchemaValidator();
  const findings = (
    await Promise.all(
      surfaces.map((surface) => validateJsonSurface(input.repoRoot, validator, surface)),
    )
  ).flat();

  return {
    checkedCount: surfaces.length,
    findings,
  };
}

export function formatCollaborationStateIntegrityReport(
  report: CollaborationStateIntegrityReport,
): string {
  if (report.findings.length === 0) {
    return `collaboration-state validate: OK (${report.checkedCount} JSON file(s) checked)\n`;
  }

  return [
    `collaboration-state validate: ${report.findings.length} invalid JSON file(s) found:`,
    '',
    ...report.findings.map((finding) => `- ${finding.path}: ${finding.message}`),
    '',
  ].join('\n');
}

async function validateJsonSurface(
  repoRoot: string,
  validator: CollaborationJsonSchemaValidator,
  surface: JsonSurface,
): Promise<readonly CollaborationStateIntegrityFinding[]> {
  const text = await readSurfaceText(repoRoot, surface);
  if (text === undefined) {
    // Optional-when-absent surface not present in this checkout — the clean state.
    return [];
  }

  try {
    JSON.parse(text);
  } catch (error) {
    return [finding(surface.path, jsonError(error))];
  }

  if (isContractSchemaId(surface.schemaId)) {
    const checked = checkCollaborationSurfaceContract({
      schemaId: surface.schemaId,
      path: surface.path,
      text,
    });
    if (!checked.ok) {
      // Byte-parity with the deleted seam's catch: the original parser
      // error's message, whichever failure kind carried it.
      return [finding(surface.path, checked.error.causeError.message)];
    }
  }

  const validated = validator.validateText(surface.schemaId, text);
  if (validated.ok) {
    return [];
  }
  return [finding(surface.path, errorMessage(validated.error))];
}

async function jsonSurfaces(repoRoot: string): Promise<readonly JsonSurface[]> {
  return [
    {
      path: `${COLLABORATION_ROOT}/active-claims.json`,
      schemaId: 'active-claims.schema.json',
      optionalWhenAbsent: true,
    },
    {
      path: `${COLLABORATION_ROOT}/closed-claims.archive.json`,
      schemaId: 'closed-claims.schema.json',
      optionalWhenAbsent: true,
    },
    ...(await directorySurfaces({
      repoRoot,
      directory: `${COLLABORATION_ROOT}/comms`,
      schemaId: 'comms-event.schema.json',
      // comms/ is untracked-by-design (ADR-199 Phase-3 untrack): absent in a
      // fresh checkout (e.g. CI), present-on-disk on a working instance. An
      // absent comms/ is the expected clean state, not an integrity fault.
      optionalWhenAbsent: true,
    })),
    ...(await directorySurfaces({
      repoRoot,
      directory: `${COLLABORATION_ROOT}/commit-queue`,
      schemaId: 'commit-queue-intent.schema.json',
      // Machine-local ephemera (QUEUE-LOCAL, 2026-08-17): untracked by
      // design and absent until the first enqueue; absence is the expected
      // clean state, not an integrity fault.
      optionalWhenAbsent: true,
    })),
    ...(await directorySurfaces({
      repoRoot,
      directory: `${COLLABORATION_ROOT}/conversations`,
      schemaId: 'conversation.schema.json',
      excludeExamples: true,
    })),
    ...(await directorySurfaces({
      repoRoot,
      directory: `${COLLABORATION_ROOT}/escalations`,
      schemaId: 'escalation.schema.json',
      excludeExamples: true,
    })),
  ];
}

async function directorySurfaces(input: {
  readonly repoRoot: string;
  readonly directory: string;
  readonly schemaId: CollaborationSchemaId;
  readonly excludeExamples?: boolean;
  readonly optionalWhenAbsent?: boolean;
}): Promise<readonly JsonSurface[]> {
  const entries = await readDirOrEmpty(
    join(input.repoRoot, input.directory),
    input.optionalWhenAbsent === true,
  );
  return entries
    .filter((entry) => entry.endsWith('.json'))
    .filter((entry) => input.excludeExamples !== true || !entry.endsWith('.example.json'))
    .toSorted((left, right) => left.localeCompare(right))
    .map((entry) => ({
      path: `${input.directory}/${entry}`,
      schemaId: input.schemaId,
    }));
}

async function readSurfaceText(
  repoRoot: string,
  surface: JsonSurface,
): Promise<string | undefined> {
  try {
    return await readFile(join(repoRoot, surface.path), 'utf8');
  } catch (error) {
    if (surface.optionalWhenAbsent === true && isErrnoCode(error, 'ENOENT')) {
      return undefined;
    }
    throw new Error(`failed to read ${surface.path}`, { cause: error });
  }
}

async function readDirOrEmpty(
  directory: string,
  optionalWhenAbsent: boolean,
): Promise<readonly string[]> {
  try {
    return await readdir(directory);
  } catch (error) {
    if (optionalWhenAbsent && isErrnoCode(error, 'ENOENT')) {
      return [];
    }
    throw error;
  }
}

function finding(path: string, message: string): CollaborationStateIntegrityFinding {
  return { path, message };
}

function jsonError(error: unknown): string {
  return `malformed JSON: ${errorMessage(error)}`;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
