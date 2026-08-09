/*
 * Pure path-resolution guards for the demo apps' static export servers — a
 * leaf module (no IO, no module-init side effects) so the traversal and
 * decode guards' behaviour tests import exactly what they describe. These
 * are security-critical path/IO guards: per consolidate-at-second-consumer
 * they live here, once, and every app server imports them. Each app keeps
 * its own server (single-root or overlay) on top of these decisions.
 */
import path from 'node:path';

/** Decode a raw request URL to its query-stripped path, or undefined on a
 *  malformed percent-escape. This runs inside an http request listener —
 *  a throw there kills the run raw, outside any runTool process boundary —
 *  so malformed input is a 404 decision, never an exception. */
export function decodeUrlPath(rawUrl: string): string | undefined {
  const queryIdx = rawUrl.indexOf('?');
  const encoded = queryIdx === -1 ? rawUrl : rawUrl.slice(0, queryIdx);
  try {
    return decodeURIComponent(encoded);
  } catch {
    return undefined;
  }
}

/**
 * Resolve a request URL to a filesystem path inside `rootDir`, or undefined
 * when the request is malformed or escapes the root. Pure decision:
 * canonicalise FIRST (resolve() normalises any ../ segments), then validate
 * with a sep-suffixed prefix check — which also rejects sibling directories
 * that share `rootDir` as a string prefix. No filesystem access here.
 */
export function resolveWithinRoot(rootDir: string, rawUrl: string): string | undefined {
  const urlPath = decodeUrlPath(rawUrl);
  if (urlPath === undefined) {
    return undefined;
  }
  const resolved = path.resolve(rootDir, `.${urlPath}`);
  return resolved.startsWith(rootDir + path.sep) ? resolved : undefined;
}
