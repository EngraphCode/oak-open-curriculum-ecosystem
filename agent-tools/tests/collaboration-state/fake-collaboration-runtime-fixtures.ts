import { type CoordinationHomeResolver } from '../../src/collaboration-state/cli-runtime';
import { type ScopedContentBlockGroup } from '../../src/hook-policy/types';

/** Resolver fake that exposes every invocation cwd to its test. */
export function createCapturingCoordinationHomeResolver(result: string): {
  readonly calls: string[];
  readonly resolve: CoordinationHomeResolver;
} {
  const calls: string[] = [];
  return {
    calls,
    resolve: (cwd) => {
      calls.push(cwd);
      return result;
    },
  };
}

export const FAKE_COMMS_CONCEPT_GATE_BLOCKS = [
  {
    concept: 'expediency-hedging',
    kind: 'literal',
    patterns: ['carve-out'],
    include_paths: ['.agent/plans/'],
    exclude_paths: [],
    citation: 'PDR-044; principles.md §Architectural Excellence Over Expediency (fixture)',
    reappraisal: 'Describe the coordination directly (fixture).',
  },
  {
    concept: 'indefinite-deferral',
    kind: 'regex',
    patterns: [String.raw`\bparked\b`],
    include_paths: ['.agent/plans/'],
    exclude_paths: [],
    citation: 'no-hedging-vocabulary.md §Indefinite-deferral vocabulary (fixture)',
    reappraisal: 'Name the gate and the decision (fixture).',
  },
] as const satisfies readonly ScopedContentBlockGroup[];
