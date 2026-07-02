/**
 * HTTP contract for `/api/search`, with the search function INJECTED so the
 * status/body mapping is testable without environment or SDK wiring. Demo by
 * Heather W.
 *
 * Not `server-only`: this module holds no secrets and imports types only —
 * the route binds it to the real server-side `search` at the edge.
 */
import type { Result } from '@oaknational/result';
import type { SearchError } from './search-core';
import type { SearchResults } from './search-types';

/**
 * Bind a search function to the route's HTTP contract: 200 + results envelope
 * (empty for a blank query, which short-circuits without searching), 503 for
 * an unconfigured backend, 502 for a failed search.
 */
export function createSearchHandler(
  searchFn: (q: string) => Promise<Result<SearchResults, SearchError>>,
): (req: Request) => Promise<Response> {
  return async function GET(req: Request): Promise<Response> {
    const q = new URL(req.url).searchParams.get('q')?.trim() ?? '';
    if (!q) {
      return Response.json({ lessons: [], units: [], threads: [] });
    }

    const result = await searchFn(q);
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
