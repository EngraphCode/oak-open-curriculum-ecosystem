import { describe, expect, it } from 'vitest';

import { resolveCoordinationHomeForOptions } from '../../src/collaboration-state/cli-coordination-home';
import { parseOptions } from '../../src/collaboration-state/cli-options';
import { createCapturingCoordinationHomeResolver } from './fake-collaboration-runtime-fixtures';

const LINKED = '/workspace/oak-worktrees/lane-b';
const PRIMARY = '/workspace/oak';

describe('resolveCoordinationHomeForOptions integration', () => {
  it('preserves an explicit --repo-root without requiring runtime resolution seams', () => {
    const options = parseOptions(['comms', 'validate', '--repo-root', '/explicit/home']);

    expect(resolveCoordinationHomeForOptions(options, {})).toBe('/explicit/home');
  });

  it('passes the injected invocation cwd to the injected resolver', () => {
    const resolver = createCapturingCoordinationHomeResolver(PRIMARY);
    const options = parseOptions(['comms', 'validate']);

    expect(
      resolveCoordinationHomeForOptions(options, {
        cwd: LINKED,
        resolveCoordinationHome: resolver.resolve,
      }),
    ).toBe(PRIMARY);
    expect(resolver.calls).toStrictEqual([LINKED]);
  });

  it('fails loudly when cwd was not provided by the composition layer', () => {
    const resolver = createCapturingCoordinationHomeResolver('/unexpected-coordination-home');
    const options = parseOptions(['comms', 'validate']);

    expect(() =>
      resolveCoordinationHomeForOptions(options, {
        resolveCoordinationHome: resolver.resolve,
      }),
    ).toThrow('coordination-home cwd must be provided by the composition layer');
    expect(resolver.calls).toStrictEqual([]);
  });

  it('fails loudly when the resolver was not provided by the composition layer', () => {
    const options = parseOptions(['comms', 'validate']);

    expect(() => resolveCoordinationHomeForOptions(options, { cwd: LINKED })).toThrow(
      'coordination-home resolver must be provided by the composition layer',
    );
  });
});
