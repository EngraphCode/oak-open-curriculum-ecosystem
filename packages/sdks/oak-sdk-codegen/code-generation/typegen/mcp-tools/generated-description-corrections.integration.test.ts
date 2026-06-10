import { describe, expect, it } from 'vitest';
import { getKeywords } from '../../../src/types/generated/api-schema/mcp-tools/tools/get-keywords.js';

/**
 * Drift-guard over the GENERATED get-keywords descriptor.
 *
 * The upstream OpenAPI description claims frequency ordering that the live
 * endpoint does not deliver (it sorts alphabetically and returns no frequency
 * field — see `.agent/plans/upstream-feature-requests/oak-open-api/keywords-finer-grained-control.md`).
 * The MCP tool description is corrected at codegen time
 * (`parts/tool-description.ts` corrections table). This test pins the served
 * surface: if a codegen run reintroduces the false claim — an upstream
 * rewording the exact-match correction no longer catches, or the pipeline wire
 * being dropped — it fails loudly here.
 */
describe('generated get-keywords description correction', () => {
  it('serves the observed alphabetical ordering, not the upstream frequency claim', () => {
    expect(getKeywords.description).not.toContain('in order of frequency');
    expect(getKeywords.description).toContain('alphabetical order');
    expect(getKeywords.description).toContain('no frequency field');
  });

  it('keeps the surrounding description intact (summary, scope sentence, prerequisite)', () => {
    expect(getKeywords.description).toContain('Keywords\n\n');
    expect(getKeywords.description).toContain(
      'This tool returns a list of keywords for a given key stage and subject',
    );
    expect(getKeywords.description).toContain('PREREQUISITE');
  });
});
