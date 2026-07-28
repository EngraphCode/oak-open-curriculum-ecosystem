import { describe, expect, it } from 'vitest';

import { validateCliState, type CliState } from '../../src/mcp-conformance/cli-validation.js';

const RUNNABLE: CliState = {
  help: false,
  unattended: false,
  seed: false,
  target: 'https://curriculum-mcp-alpha.oaknational.dev/mcp',
  suites: ['protocol'],
  credentialsFile: undefined,
  reportDir: undefined,
  baselineDir: undefined,
  suiteErrors: [],
};

describe('validateCliState — refusals are loud, the runnable state is silent', () => {
  it('a runnable state validates clean', () => {
    expect(validateCliState({ ...RUNNABLE })).toBeUndefined();
  });

  it('an oauth-only invocation with --credentials-file is refused naming the cure (the flag would be silently dropped)', () => {
    const refusal = validateCliState({
      ...RUNNABLE,
      suites: ['oauth'],
      credentialsFile: 'tmp/creds.json',
    });
    expect(refusal).toContain('not consumed by the oauth suite');
    expect(refusal).toContain('protocol | apps');
  });

  it('a mixed suite set keeps --credentials-file (protocol and apps consume it)', () => {
    expect(
      validateCliState({
        ...RUNNABLE,
        suites: ['oauth', 'apps'],
        credentialsFile: 'tmp/creds.json',
      }),
    ).toBeUndefined();
  });

  it('--unattended with --credentials-file is refused (the unattended plan is credential-free)', () => {
    const refusal = validateCliState({
      ...RUNNABLE,
      unattended: true,
      credentialsFile: 'tmp/creds.json',
    });
    expect(refusal).toContain('credential-free');
  });

  it('a missing target is refused', () => {
    expect(validateCliState({ ...RUNNABLE, target: undefined })).toBe('--target is required');
  });

  it('duplicate suites are refused naming the duplicates', () => {
    const refusal = validateCliState({ ...RUNNABLE, suites: ['protocol', 'protocol'] });
    expect(refusal).toContain('duplicate --suite');
    expect(refusal).toContain('protocol');
  });
});
