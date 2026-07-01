import { describe, it, expect } from 'vitest';

import { resolveSchemaSource } from './resolve-schema-source.js';

describe('resolveSchemaSource', () => {
  it('defaults to the cached schema when no online opt-in is present', () => {
    expect(resolveSchemaSource({ args: [], sdkCodegenMode: undefined, vercel: undefined })).toBe(
      'cached',
    );
  });

  it('selects online with the --online flag', () => {
    expect(
      resolveSchemaSource({ args: ['--online'], sdkCodegenMode: undefined, vercel: undefined }),
    ).toBe('online');
  });

  it('selects online with SDK_CODEGEN_MODE=online', () => {
    expect(resolveSchemaSource({ args: [], sdkCodegenMode: 'online', vercel: undefined })).toBe(
      'online',
    );
  });

  it('selects online on a Vercel build (VERCEL=1 or VERCEL=true)', () => {
    expect(resolveSchemaSource({ args: [], sdkCodegenMode: undefined, vercel: '1' })).toBe(
      'online',
    );
    expect(resolveSchemaSource({ args: [], sdkCodegenMode: undefined, vercel: 'true' })).toBe(
      'online',
    );
  });

  it('treats the retired --ci / SDK_CODEGEN_MODE=ci sentinels as inert (cached stays default)', () => {
    expect(resolveSchemaSource({ args: ['--ci'], sdkCodegenMode: 'ci', vercel: undefined })).toBe(
      'cached',
    );
  });
});
