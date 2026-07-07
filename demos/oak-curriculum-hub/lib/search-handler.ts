/**
 * HTTP contract for `/api/search`, with the search function INJECTED so the
 * status/body mapping is testable without environment or SDK wiring. Demo by
 * Heather W.
 *
 * Not `server-only`: this module holds no secrets and imports types only —
 * the route binds it to the real server-side `search` at the edge.
 */
import { ok, err, isOk, type Result } from '@oaknational/result';
import type { SearchError } from './search-core';
import type { SearchResults, SearchSizes } from './search-types';

const SIZE_PARAMS = ['lessons', 'units', 'threads'] as const;
const MAX_SIZE = 50;

/**
 * Parse + validate the optional per-scope size params at the trust boundary.
 * The contract is plain decimal strings for integers 1-50: exponent, hex,
 * sign, and whitespace forms are rejected, never coerced (settled with the
 * consumer, comms 2026-07-02). Absent params yield `undefined` (the seam
 * applies the hub defaults); a provided-but-invalid param is rejected
 * outright — never silently clamped.
 */
function parseSizes(searchParams: URLSearchParams): Result<SearchSizes | undefined, 'invalid'> {
  const sizes: SearchSizes = {};
  let provided = false;
  for (const key of SIZE_PARAMS) {
    const raw = searchParams.get(key);
    if (raw === null) {
      continue;
    }
    if (!/^\d+$/.test(raw)) {
      return err('invalid');
    }
    const value = Number(raw);
    if (value < 1 || value > MAX_SIZE) {
      return err('invalid');
    }
    sizes[key] = value;
    provided = true;
  }
  return ok(provided ? sizes : undefined);
}

/**
 * Bind a search function to the route's HTTP contract: 200 + results envelope
 * (empty for a blank query, which short-circuits without searching), 400 for
 * invalid size params, 503 for an unconfigured backend, 502 for a failed
 * search.
 */
export function createSearchHandler(
  searchFn: (q: string, sizes?: SearchSizes) => Promise<Result<SearchResults, SearchError>>,
): (req: Request) => Promise<Response> {
  return async function GET(req: Request): Promise<Response> {
    const { searchParams } = new URL(req.url);

    const sizesResult = parseSizes(searchParams);
    if (!isOk(sizesResult)) {
      return Response.json(
        {
          error: 'invalid_request',
          message: `Size params (lessons, units, threads) must be integers 1-${MAX_SIZE}.`,
        },
        { status: 400 },
      );
    }

    const q = searchParams.get('q')?.trim() ?? '';
    if (!q) {
      return Response.json({ lessons: [], units: [], threads: [] });
    }

    const result = await searchFn(q, sizesResult.value);
    if (result.ok) {
      return Response.json(result.value);
    }
    if (result.error.kind === 'not_configured') {
      return Response.json(
        {
          error: 'search_not_configured',
          message: 'Set ELASTICSEARCH_URL and ELASTICSEARCH_API_KEY.',
        },
        { status: 503 },
      );
    }
    return Response.json({ error: 'search_failed' }, { status: 502 });
  };
}
