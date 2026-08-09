/*
 * Pure path-resolution decisions for the export overlay server — a leaf
 * module (no IO, no module-init side effects) so the traversal and
 * surface guards' behaviour tests import exactly what they describe. The
 * server half (root resolution, HTTP, existence) lives in export-server.ts.
 */
import path from 'node:path';

/** One overlay root: a directory, optionally bounded by an admit predicate
 *  over the decoded URL path (the declared-surface guard). */
export interface OverlayRoot {
  readonly dir: string;
  readonly admits?: (urlPath: string) => boolean;
}

/** Decode a raw request URL to its query-stripped path, or undefined on a
 *  malformed percent-escape. This runs inside the http request listener —
 *  a throw there kills the run raw, outside runTool's process boundary —
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

/**
 * Build an admit predicate from a package exports map's keys — the
 * declared-surface guard for a fallback root: exact keys ('./styles.css')
 * admit exactly that path; wildcard keys ('./fonts/*') admit the prefix;
 * the bare '.' key names the root itself (a directory, never servable) and
 * is ignored. Pure.
 */
export function exportsSurfaceAdmits(exportKeys: readonly string[]): (urlPath: string) => boolean {
  const exact = new Set<string>();
  const prefixes: string[] = [];
  for (const key of exportKeys) {
    if (key === '.' || !key.startsWith('./')) {
      continue;
    }
    const urlPath = key.slice(1);
    if (urlPath.endsWith('/*')) {
      prefixes.push(urlPath.slice(0, -1));
    } else {
      exact.add(urlPath);
    }
  }
  return (urlPath) => exact.has(urlPath) || prefixes.some((prefix) => urlPath.startsWith(prefix));
}

/**
 * Resolve a request across the ordered overlay roots: the first root whose
 * admit predicate (when present) and traversal guard admit the path AND
 * whose tree contains the file wins. A URL that escapes a root resolves
 * nowhere in that root — escape is never retried as another root's in-tree
 * path. Existence is injected so the decision stays pure.
 */
export function resolveAcrossRoots(
  roots: readonly OverlayRoot[],
  rawUrl: string,
  exists: (candidate: string) => boolean,
): string | undefined {
  const urlPath = decodeUrlPath(rawUrl);
  if (urlPath === undefined) {
    return undefined;
  }
  // The admit predicate judges the CANONICAL path, matching what per-root
  // resolution actually serves (path.resolve applies the same dot-segment
  // collapse): `/fonts/../package.json` canonicalises to `/package.json`
  // BEFORE the surface check, so an admitted-looking prefix on a relative
  // hop can never smuggle an undeclared file through the fallback root.
  const canonical = path.posix.normalize(urlPath);
  for (const root of roots) {
    if (root.admits !== undefined && !root.admits(canonical)) {
      continue;
    }
    const resolved = resolveWithinRoot(root.dir, rawUrl);
    if (resolved !== undefined && exists(resolved)) {
      return resolved;
    }
  }
  return undefined;
}
