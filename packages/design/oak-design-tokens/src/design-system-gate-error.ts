/**
 * Failure surface of the design-system dtcg contrast gate.
 *
 * @remarks
 * Every variant names its source (`design-system-dtcg`) and its stage so a
 * red build during the dual-gate window (ADR-213 §2 amendment, 2026-07-20)
 * sends the engineer to the right tree, never the hand-authored one.
 *
 * @packageDocumentation
 */
import type {
  ContrastValidationError,
  DisallowedRootGroupsError,
  InvalidNodeError,
  ManifestShapeError,
  OverlayCoverageError,
  UnresolvedColourReference,
} from '@oaknational/design-tokens-core';
import type { DesignSystemTheme } from './design-system-expectations.js';

/** The source tag every design-system gate error carries. */
export const DESIGN_SYSTEM_GATE_SOURCE = 'design-system-dtcg';

/** Failure surface of the design-system gate; every variant names its source and stage. */
export type DesignSystemGateError =
  | {
      readonly source: typeof DESIGN_SYSTEM_GATE_SOURCE;
      readonly stage: 'manifest';
      readonly error: ManifestShapeError;
    }
  | {
      readonly source: typeof DESIGN_SYSTEM_GATE_SOURCE;
      readonly stage: 'roots';
      readonly tree: string;
      readonly error: DisallowedRootGroupsError;
    }
  | {
      readonly source: typeof DESIGN_SYSTEM_GATE_SOURCE;
      readonly stage: 'coverage';
      readonly error: OverlayCoverageError;
    }
  | {
      readonly source: typeof DESIGN_SYSTEM_GATE_SOURCE;
      readonly stage: 'composition';
      readonly theme: DesignSystemTheme;
      readonly error: InvalidNodeError;
    }
  | {
      readonly source: typeof DESIGN_SYSTEM_GATE_SOURCE;
      readonly stage: 'resolution';
      readonly theme: DesignSystemTheme;
      readonly unresolvable: readonly UnresolvedColourReference[];
    }
  | {
      readonly source: typeof DESIGN_SYSTEM_GATE_SOURCE;
      readonly stage: 'comparand_count';
      readonly theme: DesignSystemTheme;
      readonly expected: number;
      readonly actual: number;
    }
  | {
      readonly source: typeof DESIGN_SYSTEM_GATE_SOURCE;
      readonly stage: 'pairings';
      readonly theme: DesignSystemTheme;
      readonly error: ContrastValidationError;
    };

/** Name the offending theme and token paths for each overlay-coverage failure shape. */
function formatCoverageDetail(error: OverlayCoverageError): string {
  if (error.kind === 'orphan_overrides') {
    return error.orphans
      .map(
        (orphan) =>
          `theme '${orphan.theme}' overrides paths absent from the base: ${orphan.paths.join(', ')}`,
      )
      .join('; ');
  }

  if (error.kind === 'invalid_theme_node') {
    return `malformed node at '${error.path}' in theme '${error.theme}'`;
  }

  // Exhaustive by narrowing: 'reserved_theme_identifier' is the only remaining variant.
  return `overlay uses the reserved theme identifier '${error.theme}'`;
}

/** Render a gate error as a build-failure message naming the source and stage. */
export function formatDesignSystemGateError(gateError: DesignSystemGateError): string {
  const prefix = `Design-system dtcg gate [${gateError.stage}]`;

  if (gateError.stage === 'manifest') {
    return `${prefix}: manifest shape error at '${gateError.error.path}' — ${gateError.error.message}`;
  }

  if (gateError.stage === 'roots') {
    return `${prefix}: tree '${gateError.tree}' has disallowed root groups: ${gateError.error.disallowed.join(', ')}`;
  }

  if (gateError.stage === 'coverage') {
    return `${prefix}: overlay coverage failed (${gateError.error.kind}) — ${formatCoverageDetail(gateError.error)}`;
  }

  if (gateError.stage === 'composition') {
    return `${prefix}: malformed node at '${gateError.error.path}' in theme '${gateError.theme}'`;
  }

  if (gateError.stage === 'resolution') {
    return `${prefix}: theme '${gateError.theme}' has unresolvable references: ${gateError.unresolvable
      .map((entry) => `${entry.path} -> ${entry.reference}`)
      .join(', ')}`;
  }

  if (gateError.stage === 'comparand_count') {
    return `${prefix}: theme '${gateError.theme}' comparand size ${String(gateError.actual)} != pinned ${String(gateError.expected)} (re-baseline design-system-expectations.ts only after diagnosing the drift)`;
  }

  // Exhaustive by narrowing: 'pairings' is the only remaining variant.
  return `${prefix}: theme '${gateError.theme}' unresolved manifest token — foreground="${gateError.error.foreground}" background="${gateError.error.background}"`;
}
