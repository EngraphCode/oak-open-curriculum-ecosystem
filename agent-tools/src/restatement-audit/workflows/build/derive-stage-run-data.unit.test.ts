import { isErr } from '@oaknational/result';
import { describe, expect, it } from 'vitest';

import { deriveRunData } from './derive-stage-run-data.js';

describe('deriveRunData path containment', () => {
  it('refuses an absolute checkpoint path outside the repository — the CLI must never read or inline external JSON', async () => {
    const result = await deriveRunData({
      stage: 'reduce',
      mapResult: '/etc/hosts',
      validateResults: [],
    });
    expect(isErr(result)).toBe(true);
    expect(String(!result.ok && result.error)).toContain(
      'Refusing path outside the permitted base',
    );
  });

  // Every stage flag funnels through the same contained readJson, so containment is
  // demonstrated on each stage's FIRST-read flag; later flags share the identical path.
  it('refuses a ".."-escaping relative checkpoint path at each stage entry flag', async () => {
    const escape = '../'.repeat(12) + 'etc/hosts';
    const viaPartition = await deriveRunData({
      stage: 'map',
      partition: escape,
      gazetteer: escape,
      validateResults: [],
    });
    expect(isErr(viaPartition)).toBe(true);
    expect(String(!viaPartition.ok && viaPartition.error)).toContain(
      'Refusing path outside the permitted base',
    );
    const viaValidateResult = await deriveRunData({
      stage: 'meta',
      mapResult: escape,
      reduceResult: escape,
      validateResults: [escape],
    });
    expect(isErr(viaValidateResult)).toBe(true);
    expect(String(!viaValidateResult.ok && viaValidateResult.error)).toContain(
      'Refusing path outside the permitted base',
    );
  });
});
