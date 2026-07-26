import { describe, expect, it } from 'vitest';

import {
  baselineFileName,
  loadBaselines,
  type BaselineRead,
} from '../../src/mcp-conformance/load-baselines.js';
import { loadBaseline } from './test-helpers/fixture-loader.js';

const VALID_PROTOCOL_BASELINE = JSON.stringify(loadBaseline('protocol-unattended.json'));

/** Branch-free fake reader: behaviour is a lookup table keyed by file name. */
function readerOf(reads: Readonly<Record<string, BaselineRead>>) {
  return (fileName: string): BaselineRead => reads[fileName] ?? { kind: 'absent' };
}

describe('baselineFileName — oauth carries the pinned DCR strategy', () => {
  it('names oauth baselines with the dcr strategy and others mechanically', () => {
    expect(baselineFileName('oauth', 'unattended')).toBe('oauth-dcr-unattended.json');
    expect(baselineFileName('protocol', 'unattended')).toBe('protocol-unattended.json');
    expect(baselineFileName('apps', 'attended')).toBe('apps-attended.json');
  });
});

describe('loadBaselines — absent, invalid, and loaded are never conflated', () => {
  it('a valid baseline file loads', () => {
    const outcomes = loadBaselines({
      reader: readerOf({
        'protocol-unattended.json': { kind: 'ok', content: VALID_PROTOCOL_BASELINE },
      }),
      suites: ['protocol'],
      mode: 'unattended',
    });
    expect(outcomes.protocol?.kind).toBe('loaded');
  });

  it('an absent file yields no entry (the verdict-less state)', () => {
    const outcomes = loadBaselines({
      reader: readerOf({}),
      suites: ['protocol', 'oauth'],
      mode: 'unattended',
    });
    expect(outcomes.protocol).toBeUndefined();
    expect(outcomes.oauth).toBeUndefined();
  });

  it('malformed JSON is invalid with the syntax cause, never a crash and never absent', () => {
    const outcomes = loadBaselines({
      reader: readerOf({ 'protocol-unattended.json': { kind: 'ok', content: '{ not json' } }),
      suites: ['protocol'],
      mode: 'unattended',
    });
    expect(outcomes.protocol?.kind).toBe('invalid');
    expect(outcomes.protocol?.kind === 'invalid' && outcomes.protocol.reason).toContain(
      'not valid JSON',
    );
  });

  it('a schema-rejected baseline is invalid with the zod cause preserved', () => {
    const outcomes = loadBaselines({
      reader: readerOf({
        'protocol-unattended.json': { kind: 'ok', content: '{"schema_version":"9.9.9"}' },
      }),
      suites: ['protocol'],
      mode: 'unattended',
    });
    expect(outcomes.protocol?.kind).toBe('invalid');
    expect(outcomes.protocol?.kind === 'invalid' && outcomes.protocol.reason).toContain(
      'failed validation',
    );
  });

  it('a non-absent read error is invalid with the read cause, never silently dropped', () => {
    const outcomes = loadBaselines({
      reader: readerOf({
        'protocol-unattended.json': { kind: 'error', message: 'EACCES: permission denied' },
      }),
      suites: ['protocol'],
      mode: 'unattended',
    });
    expect(outcomes.protocol?.kind).toBe('invalid');
    expect(outcomes.protocol?.kind === 'invalid' && outcomes.protocol.reason).toContain('EACCES');
  });
});
