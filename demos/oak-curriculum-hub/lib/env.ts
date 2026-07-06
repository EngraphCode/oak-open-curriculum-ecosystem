/**
 * Minimal validated env access (demo).
 *
 * In the monorepo proper, prefer `@oaknational/env-resolution` + the `env`
 * package (Zod-validated, fail-fast) and delete this file. Variable names match
 * the repo / turbo `globalPassThroughEnv` convention so the demo reads the same
 * credentials as the rest of the ecosystem.
 */
import 'server-only';

import { unwrap } from '@oaknational/result';

import { resolveIndexTarget } from './env-index-target';

export const serverEnv = {
  // Discovery plane — Elasticsearch Serverless (read credentials).
  ELASTICSEARCH_URL: process.env.ELASTICSEARCH_URL ?? '',
  ELASTICSEARCH_API_KEY: process.env.ELASTICSEARCH_API_KEY ?? '',
  // Module-scope config validation, the same deliberate fail-loud boundary as
  // `data/load-quality-standards.ts`: there is no runtime caller to hand a
  // Result to, and a mistyped index target must fail server start loud, never
  // silently search the primary index.
  SEARCH_INDEX_TARGET: unwrap(resolveIndexTarget(process.env.SEARCH_INDEX_TARGET)),
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
