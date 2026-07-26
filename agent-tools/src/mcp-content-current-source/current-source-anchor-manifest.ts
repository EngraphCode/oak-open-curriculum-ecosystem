import { typeSafeKeys } from '@oaknational/type-helpers';
import type {
  ContentRevision,
  CurrentItemEvidence,
  CurrentSourceAnchorManifest,
} from './current-source-model.js';
import { buildTokenAnchor } from './item-anchor-evidence.js';

const alphabetical = (left: string, right: string) => left.localeCompare(right);

export interface BaselineAnchorRow {
  readonly id: string;
  readonly file: string;
  readonly lines: string;
}

export interface AnchorManifestInput {
  readonly baselineCommit: string;
  readonly baselineSha256: string;
  readonly rows: readonly BaselineAnchorRow[];
  readonly targetsByAuditId: ReadonlyMap<string, readonly string[]>;
  readonly baselineContentByFile: ReadonlyMap<string, string>;
  readonly currentContentByFile: ReadonlyMap<string, string>;
  readonly overrides: Readonly<Record<string, Readonly<Record<string, readonly string[]>>>>;
  readonly revisionOverrides: Readonly<Record<string, ContentRevision>>;
}

function sourceFragments(content: string, lineSpec: string): readonly string[] {
  const lines = content.split('\n');
  const ranges = [...lineSpec.matchAll(/\b(\d+)(?:-(\d+))?/g)].map((match) => ({
    start: Number(match[1]),
    end: Number(match[2] ?? match[1]),
  }));
  if (ranges.length === 0) {
    throw new Error(`Audit line specification has no ranges: ${lineSpec}`);
  }
  return ranges.map(({ start, end }) => lines.slice(start - 1, end).join('\n'));
}

function requireSameTargets(
  auditId: string,
  expected: readonly string[],
  actual: readonly string[],
): void {
  const sortedExpected = [...expected].sort(alphabetical);
  const sortedActual = [...actual].sort(alphabetical);
  if (JSON.stringify(sortedExpected) !== JSON.stringify(sortedActual)) {
    throw new Error(
      `Current anchor override targets differ for ${auditId}\n` +
        `expected: ${JSON.stringify(sortedExpected)}\n` +
        `actual: ${JSON.stringify(sortedActual)}`,
    );
  }
}

function evidenceRevision(
  row: BaselineAnchorRow,
  targets: readonly string[],
  revisionOverrides: Readonly<Record<string, ContentRevision>>,
): ContentRevision {
  const override = revisionOverrides[row.id];
  if (override !== undefined) {
    return override;
  }
  return targets.length === 1 && targets[0] === row.file ? 'unchanged' : 'relocated';
}

function buildEvidence(
  input: AnchorManifestInput,
  row: BaselineAnchorRow,
  targets: readonly string[],
): CurrentItemEvidence {
  const override = input.overrides[row.id];
  if (override !== undefined) {
    requireSameTargets(row.id, targets, typeSafeKeys(override));
  } else if (targets.length !== 1 || targets[0] !== row.file) {
    throw new Error(`Relocated current audit item ${row.id} has no reviewed anchor override`);
  }
  const baselineContent = input.baselineContentByFile.get(row.file);
  if (baselineContent === undefined) {
    throw new Error(`Immutable baseline source is absent for ${row.id}: ${row.file}`);
  }
  return {
    revision: evidenceRevision(row, targets, input.revisionOverrides),
    targets: targets.map((file) => {
      const currentContent = input.currentContentByFile.get(file);
      if (currentContent === undefined) {
        throw new Error(`Current anchor target is absent for ${row.id}: ${file}`);
      }
      const anchorContents = override?.[file] ?? sourceFragments(baselineContent, row.lines);
      return {
        file,
        anchors: anchorContents.map((content) => {
          try {
            return buildTokenAnchor(content, currentContent);
          } catch (error: unknown) {
            throw new Error(
              `Cannot build current item anchor for ${row.id} in ${file}: ` +
                `${error instanceof Error ? error.message : String(error)}\n` +
                `anchor: ${JSON.stringify(content)}`,
              { cause: error },
            );
          }
        }),
      };
    }),
  };
}

/** Builds reviewed, item-level current-source evidence for every non-retired row. */
export function buildCurrentSourceAnchorManifest(
  input: AnchorManifestInput,
): CurrentSourceAnchorManifest {
  const knownIds = new Set(input.rows.map((row) => row.id));
  const unknownOverrides = typeSafeKeys(input.overrides).filter((id) => !knownIds.has(id));
  if (unknownOverrides.length > 0) {
    throw new Error(
      `Current item anchor overrides contain unknown audit ids: ${unknownOverrides.sort(alphabetical).join(', ')}`,
    );
  }
  const revisionWithoutOverrides = typeSafeKeys(input.revisionOverrides).filter(
    (id) => input.overrides[id] === undefined,
  );
  if (revisionWithoutOverrides.length > 0) {
    throw new Error(
      `Revision-overridden current audit ids have no reviewed anchor override: ${revisionWithoutOverrides.sort(alphabetical).join(', ')}`,
    );
  }
  const items = input.rows.flatMap((row) => {
    const targets = input.targetsByAuditId.get(row.id);
    if (targets === undefined) {
      throw new Error(`Current targets are unaccounted for audit item ${row.id}`);
    }
    return targets.length === 0
      ? []
      : [{ auditId: row.id, evidence: buildEvidence(input, row, targets) }];
  });
  return {
    schemaVersion: 1,
    baselineCommit: input.baselineCommit,
    baselineSha256: input.baselineSha256,
    items,
  };
}
