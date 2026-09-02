/**
 * Pagination echo: the structured, in-payload form of the upstream API's
 * `Link: rel="next"` pagination signal, and its derivation.
 *
 * Split from mcp-protocol-types.ts at that module's line cap; the contract
 * surface re-exports these names, so generated code and consumers keep a
 * single import home.
 */

/**
 * Structured echo of the upstream API's pagination signal.
 *
 * The upstream API signals further pages solely through an HTTP
 * `Link: <url>; rel="next"` response header, which MCP tool results
 * cannot carry. Paginated tools surface the signal here instead, so an
 * agent can tell from the payload alone whether more data exists.
 */
export interface PaginationEcho {
  readonly hasMore: boolean;
  readonly nextOffset?: number;
  readonly nextLimit?: number;
}

function parseNonNegativeInteger(value: string | null): number | undefined {
  if (value === null || !/^\d+$/.test(value)) {
    return undefined;
  }
  return Number(value);
}

/**
 * Finds the `<target>` of the `rel="next"` segment in a `Link` header, by
 * linear scan — each `<target>` is paired with the parameter text up to the
 * following `<` (or the header's end).
 */
function nextLinkTarget(linkHeader: string): string | undefined {
  let cursor = 0;
  for (;;) {
    const open = linkHeader.indexOf('<', cursor);
    if (open === -1) {
      return undefined;
    }
    const close = linkHeader.indexOf('>', open + 1);
    if (close === -1) {
      return undefined;
    }
    const paramsEnd = linkHeader.indexOf('<', close + 1);
    const params = linkHeader.slice(close + 1, paramsEnd === -1 ? linkHeader.length : paramsEnd);
    if (params.includes('rel="next"')) {
      return linkHeader.slice(open + 1, close);
    }
    cursor = close + 1;
  }
}

/**
 * Derives the {@link PaginationEcho} for a paginated operation from its
 * upstream `Link` response header.
 *
 * Presence of a `rel="next"` link means more pages exist; its URL's
 * `offset` and `limit` query parameters, when well-formed, name the next
 * page. A malformed next-link URL still reports `hasMore: true` — the
 * relation is the signal, the URL parameters are a convenience.
 */
export function derivePaginationFromLinkHeader(linkHeader: string | null): PaginationEcho {
  if (linkHeader === null) {
    return { hasMore: false };
  }
  const target = nextLinkTarget(linkHeader);
  if (target === undefined) {
    return { hasMore: false };
  }
  let nextUrl: URL;
  try {
    nextUrl = new URL(target);
  } catch {
    return { hasMore: true };
  }
  const nextOffset = parseNonNegativeInteger(nextUrl.searchParams.get('offset'));
  const nextLimit = parseNonNegativeInteger(nextUrl.searchParams.get('limit'));
  return {
    hasMore: true,
    ...(nextOffset === undefined ? {} : { nextOffset }),
    ...(nextLimit === undefined ? {} : { nextLimit }),
  };
}
