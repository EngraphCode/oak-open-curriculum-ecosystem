/**
 * The published `@oaknational/sdk-codegen/mcp-tools` subpath is a
 * hand-authored barrel that enumerates its exports, so a type reachable
 * only from an internal module is not reachable by consumers at all.
 *
 * PaginationEcho appears on the public ToolResultForName shape (the
 * pagination echo derived from the upstream Link header), so a consumer
 * narrowing that field must be able to name its type. PR 949 review,
 * round 3: the first cure reached the generated internal barrel only.
 */

import { describe, it, expect } from 'vitest';
import type { PaginationEcho, ToolResultForName } from './mcp-tools.js';

/**
 * Compile-time anchor: fails `pnpm type-check` if PaginationEcho stops
 * being reachable from the published subpath, or if the pagination field
 * on a paginated tool result stops being assignable from it.
 */
const ECHO_ANCHOR = { hasMore: true, nextOffset: 20, nextLimit: 20 } satisfies PaginationEcho;

const RESULT_ANCHOR: Pick<ToolResultForName<'get-keywords'>, 'pagination'> = {
  pagination: ECHO_ANCHOR,
};

describe('published mcp-tools barrel', () => {
  it('exposes PaginationEcho to consumers of the public subpath', () => {
    expect(ECHO_ANCHOR.hasMore).toBe(true);
    // The discriminated union forces the narrowing a paging consumer must
    // do anyway: next values are reachable only on the has-more branch.
    const echo = RESULT_ANCHOR.pagination;
    expect(echo?.hasMore === true && echo.nextOffset).toBe(20);
  });
});
