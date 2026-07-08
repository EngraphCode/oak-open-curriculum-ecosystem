import { compareByCodeUnit } from './refounding-artefacts.js';

/**
 * The tiling verifier's RED vocabulary (F1 §5 row `refound-tile`): every
 * violation kind as a typed value, the deterministic sort, and the
 * operator-readable rendering. The arithmetic that produces these lives in
 * `refound-tile-model.ts`; keeping the vocabulary separate keeps both
 * modules within budget and lets the entry render without importing the
 * arithmetic.
 *
 * @packageDocumentation
 */

/** One RED finding from the tiling verifier, as a typed value. */
export type TilingViolation =
  | {
      readonly kind: 'gap';
      readonly file: string;
      readonly lineStart: number;
      readonly lineEnd: number;
    }
  | {
      readonly kind: 'overlap';
      readonly file: string;
      readonly lineStart: number;
      readonly lineEnd: number;
    }
  | {
      readonly kind: 'non-anchor-start';
      readonly file: string;
      readonly lineStart: number;
      readonly blockId: string;
    }
  | {
      readonly kind: 'unknown-file';
      readonly file: string;
      readonly lineStart: number;
      readonly blockId: string;
    }
  | {
      readonly kind: 'span-past-eof';
      readonly file: string;
      readonly lineStart: number;
      readonly lineEnd: number;
      readonly blockId: string;
      readonly fileLines: number;
    }
  | {
      readonly kind: 'inverted-span';
      readonly file: string;
      readonly lineStart: number;
      readonly lineEnd: number;
      readonly blockId: string;
    }
  | {
      readonly kind: 'whole-file-partial-row';
      readonly file: string;
      readonly lineStart: number;
      readonly lineEnd: number;
      readonly blockId: string;
      readonly fileLines: number;
    }
  | {
      readonly kind: 'whole-file-multiple-rows';
      readonly file: string;
      readonly lineStart: number;
      readonly rowCount: number;
    }
  | {
      readonly kind: 'duplicate-block-id';
      readonly file: string;
      readonly lineStart: number;
      readonly blockId: string;
    };

/** Sort violations by `(file, lineStart, kind)` — the determinism contract. */
export function sortTilingViolations(
  violations: readonly TilingViolation[],
): readonly TilingViolation[] {
  return [...violations].sort(
    (a, b) =>
      compareByCodeUnit(a.file, b.file) ||
      a.lineStart - b.lineStart ||
      compareByCodeUnit(a.kind, b.kind),
  );
}

/** `file:lineStart`, the coordinate prefix every rendering shares. */
function coordinate(violation: TilingViolation): string {
  return `${violation.file}:${String(violation.lineStart)}`;
}

type CoverageViolation = Extract<
  TilingViolation,
  { kind: 'gap' | 'overlap' | 'non-anchor-start' | 'unknown-file' }
>;

/** Render the coverage/citation kinds. */
function formatCoverageViolation(violation: CoverageViolation): string {
  const at = coordinate(violation);
  switch (violation.kind) {
    case 'gap':
      return `gap at ${at}-${String(violation.lineEnd)}: lines covered by no ledger row`;
    case 'overlap':
      return `overlap at ${at}-${String(violation.lineEnd)}: lines covered more than once`;
    case 'non-anchor-start':
      return (
        `block '${violation.blockId}' starts at ${at}, which is neither an anchor line nor ` +
        'the line-1 preamble'
      );
    case 'unknown-file':
      return (
        `block '${violation.blockId}' cites unknown file ${at} (outside the verified ` +
        'denominator slice)'
      );
    default: {
      // Exhaustiveness: a new CoverageViolation member fails to compile here.
      const exhaustive: never = violation;
      return `Unhandled TilingViolation kind: ${JSON.stringify(exhaustive)}`;
    }
  }
}

/** Render the row-shaped, whole-file, and duplicate kinds. */
function formatRowViolation(violation: Exclude<TilingViolation, CoverageViolation>): string {
  const at = coordinate(violation);
  switch (violation.kind) {
    case 'span-past-eof':
      return (
        `block '${violation.blockId}' at ${at}-${String(violation.lineEnd)} runs past EOF ` +
        `(${String(violation.fileLines)} line(s))`
      );
    case 'inverted-span':
      return (
        `block '${violation.blockId}' at ${at} has an inverted span ` +
        `(line_end ${String(violation.lineEnd)} < line_start)`
      );
    case 'whole-file-partial-row':
      return (
        `whole-file entry ${violation.file} takes exactly one whole-span row; block ` +
        `'${violation.blockId}' covers ${String(violation.lineStart)}-` +
        `${String(violation.lineEnd)} of ${String(violation.fileLines)}`
      );
    case 'whole-file-multiple-rows':
      return (
        `whole-file entry ${violation.file} takes exactly one whole-span row; found ` +
        String(violation.rowCount)
      );
    case 'duplicate-block-id':
      return `duplicate block_id '${violation.blockId}' at ${at}`;
    default: {
      // Exhaustiveness: a new row/whole-file/duplicate member fails to compile.
      const exhaustive: never = violation;
      return `Unhandled TilingViolation kind: ${JSON.stringify(exhaustive)}`;
    }
  }
}

/** Render one violation as an operator-readable line. */
export function formatTilingViolation(violation: TilingViolation): string {
  switch (violation.kind) {
    case 'gap':
    case 'overlap':
    case 'non-anchor-start':
    case 'unknown-file':
      return formatCoverageViolation(violation);
    // The row/whole-file/duplicate family; `formatRowViolation` owns its own
    // `never`-default exhaustiveness, so a new non-coverage member fails to
    // compile there rather than falling silently through this dispatcher.
    default:
      return formatRowViolation(violation);
  }
}
