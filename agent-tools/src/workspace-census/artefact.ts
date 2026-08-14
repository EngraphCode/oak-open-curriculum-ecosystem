/**
 * Rows-artefact IO: the structured row data the human matrix is
 * rendered from or cross-checked against, so validation parses data,
 * never prose. Reads narrow unknown JSON through type guards
 * (assertion-free); deep column validation belongs to `rows.js`.
 */
import fs from 'node:fs/promises';

import { err, ok, type Result } from '@oaknational/result';

import { isErrnoCode } from '../collaboration-state/errno.js';
import { getJsonValue, isJsonObject } from '../core/json.js';
import type { CensusRow } from './rows.js';

const ROWS_SCHEMA_VERSION = '1.0.0';

export const DEFAULT_ROWS_PATH = '.agent/reports/workspace-classification-census/rows.json';
export const DEFAULT_LEGACY_PATH =
  '.agent/plans-backlog-2026-07/architecture-and-infrastructure/future/oak-surface-isolation-and-generic-foundation-programme.plan.md';

export interface RowsArtefact {
  readonly schema_version: string;
  readonly plan: string;
  readonly rows: CensusRow[];
}

export function emptyRowsArtefact(): RowsArtefact {
  return {
    schema_version: ROWS_SCHEMA_VERSION,
    plan: '.agent/plans/delivery/workspace-classification-census.plan.md',
    rows: [],
  };
}

function isCensusRowShape(value: unknown): value is CensusRow {
  if (!isJsonObject(value)) {
    return false;
  }
  const publishedName = getJsonValue(value, 'publishedName');
  return (
    typeof getJsonValue(value, 'dirPath') === 'string' &&
    (publishedName === null || typeof publishedName === 'string') &&
    typeof getJsonValue(value, 'disposition') === 'string'
  );
}

function isRowsArtefactShape(value: unknown): value is RowsArtefact {
  if (
    !isJsonObject(value) ||
    typeof getJsonValue(value, 'schema_version') !== 'string' ||
    typeof getJsonValue(value, 'plan') !== 'string'
  ) {
    return false;
  }
  const rows = getJsonValue(value, 'rows');
  // Dense check (house pattern): Array.from so sparse holes cannot pass.
  return Array.isArray(rows) && Array.from(rows).every((row) => isCensusRowShape(row));
}

/**
 * Read the rows artefact. `ok(null)` means the file does not exist yet
 * (the skeleton command's create case); every other failure is an error.
 */
export async function readRowsArtefact(
  filePath: string,
): Promise<Result<RowsArtefact | null, string>> {
  let raw: string;
  try {
    raw = await fs.readFile(filePath, 'utf8');
  } catch (error) {
    if (isErrnoCode(error, 'ENOENT')) {
      return ok(null);
    }
    return err(`${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    return err(
      `${filePath}: invalid JSON — ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  if (!isRowsArtefactShape(parsed)) {
    return err(
      `${filePath}: not a rows artefact (schema_version, plan, and rows[] with dual identity required)`,
    );
  }
  return ok(parsed);
}
