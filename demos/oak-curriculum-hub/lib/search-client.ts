/**
 * THE ONLY oak-search-sdk seam. Demo by Heather W.
 *
 * Pure WIRING: environment, the Elasticsearch client, and the retrieval-service
 * singleton. The search behaviour itself (mappers, per-scope degradation) lives
 * in `lib/search-core.ts` with the retrieval service injected — this module
 * supplies the real one. Everything outside this pair talks to the local
 * `SearchResults` view model, never to the SDK directly.
 *
 * Capability boundary (ADR-134): import from `/read` only — never `/admin`
 * or internal paths.
 */
import 'server-only';
import { Client } from '@elastic/elasticsearch';
import { createRetrievalService, type RetrievalService } from '@oaknational/oak-search-sdk/read';
import { err, type Result } from '@oaknational/result';
import { runScopedSearch, type SearchError } from './search-core';
import type { SearchResults, SearchSizes } from './search-types';
import { serverEnv, searchConfigured } from './env';

// The view models (Hit, SearchResults) and the client-safe `isSearchResults`
// guard live in ./search-types; the error surface lives in ./search-core.
// Re-exported as types (erased at build) so type-only consumers may import
// from either home.
export type { Hit, SearchResults } from './search-types';
export type { SearchError } from './search-core';

/* ---------- SDK wiring ---------- */

let _retrieval: RetrievalService | undefined;

function getRetrieval(): RetrievalService {
  if (!_retrieval) {
    const esClient = new Client({
      node: serverEnv.ELASTICSEARCH_URL,
      auth: { apiKey: serverEnv.ELASTICSEARCH_API_KEY },
    });
    _retrieval = createRetrievalService(esClient, {
      indexTarget: serverEnv.SEARCH_INDEX_TARGET,
      ...(serverEnv.SEARCH_INDEX_VERSION ? { indexVersion: serverEnv.SEARCH_INDEX_VERSION } : {}),
    });
  }
  return _retrieval;
}

/* ---------- public API ---------- */

export async function search(
  q: string,
  sizes?: SearchSizes,
): Promise<Result<SearchResults, SearchError>> {
  if (!searchConfigured()) {
    return err({ kind: 'not_configured' });
  }

  try {
    // The try also guards ES Client construction inside getRetrieval, so a
    // bad node URL surfaces as err({kind: 'failed'}) exactly as before the
    // core extraction.
    return await runScopedSearch(getRetrieval(), q, sizes);
  } catch (error: unknown) {
    return err({
      kind: 'failed',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
