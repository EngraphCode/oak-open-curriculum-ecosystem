/**
 * The 2026-04-28 baseline parser and the delta derivation, keyed on
 * directory path so renames read as renames, never as a disappearance
 * plus an appearance.
 */
import type { CensusRow } from './rows.js';
import type { Classification } from './vocabulary.js';

export interface LegacyRow {
  readonly dirPath: string;
  readonly classification: Classification;
}

const LEGACY_CLASSIFICATION_MAP: Readonly<Record<string, Classification>> = {
  generic: 'generic-foundation',
  mixed: 'mixed',
  'oak-leaf': 'oak-leaf',
};

/**
 * Parse the 2026-04-28 matrix table (the surface-isolation brief) into
 * rows keyed on directory path, mapping the legacy `generic` label onto
 * `generic-foundation`. Mechanical extraction from the pipe table —
 * backticked first column, classification in the second.
 */
export function parseLegacyMatrix(markdown: string): LegacyRow[] {
  const rows: LegacyRow[] = [];
  for (const line of markdown.split('\n')) {
    const match = /^\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|/.exec(line);
    if (!match) {
      continue;
    }
    const [, dirPath, legacyLabel] = match;
    const classification = LEGACY_CLASSIFICATION_MAP[legacyLabel ?? ''];
    if (dirPath === undefined || classification === undefined) {
      continue;
    }
    rows.push({ dirPath, classification });
  }
  return rows;
}

export interface DeltaInput {
  readonly legacyRows: readonly LegacyRow[];
  readonly rows: readonly CensusRow[];
}

export interface DeltaResult {
  readonly appeared: readonly { readonly dirPath: string }[];
  readonly disappeared: readonly { readonly dirPath: string }[];
  readonly changed: readonly {
    readonly dirPath: string;
    readonly from: Classification;
    readonly to: Classification;
  }[];
  readonly renamed: readonly { readonly fromDirPath: string; readonly toDirPath: string }[];
}

function pairDeclaredRenames(
  classified: readonly CensusRow[],
  legacyByDir: ReadonlyMap<string, LegacyRow>,
): { renamed: { fromDirPath: string; toDirPath: string }[]; renamedFromDirs: Set<string> } {
  const renamed: { fromDirPath: string; toDirPath: string }[] = [];
  const renamedFromDirs = new Set<string>();
  for (const row of classified) {
    if (row.renamedFrom !== undefined && legacyByDir.has(row.renamedFrom)) {
      renamed.push({ fromDirPath: row.renamedFrom, toDirPath: row.dirPath });
      renamedFromDirs.add(row.renamedFrom);
    }
  }
  return { renamed, renamedFromDirs };
}

/**
 * Delta over the two keyed row sets, restricted to classified rows
 * (exclusions and falsifier rows have no classification to compare). A
 * rename is a DECLARED fact on the new row (`renamedFrom`), paired here.
 */
export function computeDelta(input: DeltaInput): DeltaResult {
  const legacyByDir = new Map(input.legacyRows.map((row) => [row.dirPath, row]));
  const classified = input.rows.filter((row) => row.disposition === 'classified');
  const currentByDir = new Map(classified.map((row) => [row.dirPath, row]));

  const { renamed, renamedFromDirs } = pairDeclaredRenames(classified, legacyByDir);

  const appeared = classified
    .filter((row) => !legacyByDir.has(row.dirPath) && row.renamedFrom === undefined)
    .map((row) => ({ dirPath: row.dirPath }));

  const disappeared = input.legacyRows
    .filter((row) => !currentByDir.has(row.dirPath) && !renamedFromDirs.has(row.dirPath))
    .map((row) => ({ dirPath: row.dirPath }));

  const changed = classified.flatMap((row) => {
    const legacy = legacyByDir.get(row.dirPath);
    if (
      legacy === undefined ||
      row.classification === undefined ||
      legacy.classification === row.classification
    ) {
      return [];
    }
    return [{ dirPath: row.dirPath, from: legacy.classification, to: row.classification }];
  });

  return { appeared, disappeared, changed, renamed };
}
