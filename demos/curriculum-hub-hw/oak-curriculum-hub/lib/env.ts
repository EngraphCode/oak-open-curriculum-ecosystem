/**
 * Minimal validated env access (demo).
 *
 * In the monorepo proper, prefer `@oaknational/env-resolution` + the `env`
 * package (Zod-validated, fail-fast) and delete this file. Variable names match
 * the repo / turbo `globalPassThroughEnv` convention so the demo reads the same
 * credentials as the rest of the ecosystem.
 */
import 'server-only';

/** Narrow the index-target env value to its closed set (no type assertion). */
function resolveIndexTarget(value: string | undefined): 'primary' | 'sandbox' {
  return value === 'sandbox' ? 'sandbox' : 'primary';
}

export const serverEnv = {
  // Discovery plane — Elasticsearch Serverless (read credentials).
  ELASTICSEARCH_URL: process.env.ELASTICSEARCH_URL ?? '',
  ELASTICSEARCH_API_KEY: process.env.ELASTICSEARCH_API_KEY ?? '',
  SEARCH_INDEX_TARGET: resolveIndexTarget(process.env.SEARCH_INDEX_TARGET),
  SEARCH_INDEX_VERSION: process.env.SEARCH_INDEX_VERSION ?? '',
  // Content plane — Oak Open Curriculum REST API.
  OAK_API_KEY: process.env.OAK_API_KEY ?? '',
};

export function searchConfigured(): boolean {
  return Boolean(serverEnv.ELASTICSEARCH_URL && serverEnv.ELASTICSEARCH_API_KEY);
}

export function contentConfigured(): boolean {
  return Boolean(serverEnv.OAK_API_KEY);
}
