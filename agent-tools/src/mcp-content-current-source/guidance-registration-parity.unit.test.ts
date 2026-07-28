import { requireGuidanceRegistrationParity } from './guidance-registration-parity.js';

const expected = [
  ['guidance/one.ts', 'docs://guidance/one.md'],
  ['guidance/two.ts', 'docs://guidance/two.md'],
] as const;

function registration(selector: string) {
  return {
    rootId: 'http',
    state: 'live' as const,
    primitive: 'resource' as const,
    selector,
    surfaces: [],
    channels: ['resources/list.resources[]'],
  };
}

describe('requireGuidanceRegistrationParity', () => {
  it('accepts exact source-to-selector attribution', () => {
    expect(() =>
      requireGuidanceRegistrationParity(expected, {
        'guidance/one.ts': registration('docs://guidance/one.md'),
        'guidance/two.ts': registration('docs://guidance/two.md'),
      }),
    ).not.toThrow();
  });

  it('rejects swapped valid selectors', () => {
    expect(() =>
      requireGuidanceRegistrationParity(expected, {
        'guidance/one.ts': registration('docs://guidance/two.md'),
        'guidance/two.ts': registration('docs://guidance/one.md'),
      }),
    ).toThrow('Current guidance selector differs for guidance/one.ts');
  });
});
