/*
 * The static server over the Claude Design canonical export for the fidelity
 * review's export-render arm (ported from the hub's export-server; the
 * overlay is new behaviour). The export pages are NOT self-contained under
 * `studio-source/`: the studio's layout was flat, so `specimen.html` and
 * `Identity Switchboard.html` link kit CSS (`../colors_and_type.css`,
 * `components.css`, …) that the repo homes at the design-system PACKAGE
 * root, not under `studio-source/` (studio-source/README.md: "the
 * consumable files map root ⇄ root"). Serving one directory therefore
 * renders both pages unstyled — and unstyled markup still passes the blank
 * classifier, a silently wrong diff target.
 *
 * Cure: a TWO-ROOT OVERLAY reproducing the studio's layout — resolve every
 * request against `studio-source/` first, then fall back to the package
 * root (kit CSS, `fonts/`, `assets/`). Path resolution stays a pure,
 * separately-testable decision (canonicalise, then prefix-check per root,
 * existence injected) so the traversal guard has behaviour tests without
 * IO. Roots are resolved through the declared `@oaknational/oak-design-system`
 * dependency, never a relative escape from this workspace.
 */
import fs from 'node:fs';
import http from 'node:http';
import { createRequire } from 'node:module';
import path from 'node:path';

import { err, ok, type Result } from '@oaknational/result';

/** The design-system package root, resolved through the declared workspace
 *  dependency (its exports map exposes `./styles.css` at the package root —
 *  the same idiom as tools/dev-open.ts). */
const KIT_ROOT = path.dirname(
  createRequire(import.meta.url).resolve('@oaknational/oak-design-system/styles.css'),
);

/** The overlay, first root wins: the tracked canonical export tree, then the
 *  kit CSS/fonts/assets its pages reference studio-relatively. */
export const EXPORT_ROOTS: readonly string[] = [path.join(KIT_ROOT, 'studio-source'), KIT_ROOT];

const CONTENT_TYPES = new Map<string, string>([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.ttf', 'font/ttf'],
  ['.woff2', 'font/woff2'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.pdf', 'application/pdf'],
]);

/**
 * Resolve a request URL to a filesystem path inside `rootDir`, or undefined
 * when the request escapes the root. Pure decision: canonicalise FIRST
 * (resolve() normalises any ../ segments), then validate with a
 * sep-suffixed prefix check — which also rejects sibling directories that
 * share `rootDir` as a string prefix. No filesystem access here.
 */
export function resolveWithinRoot(rootDir: string, rawUrl: string): string | undefined {
  const queryIdx = rawUrl.indexOf('?');
  const urlPath = decodeURIComponent(queryIdx === -1 ? rawUrl : rawUrl.slice(0, queryIdx));
  const resolved = path.resolve(rootDir, `.${urlPath}`);
  return resolved.startsWith(rootDir + path.sep) ? resolved : undefined;
}

/**
 * Resolve a request across the ordered overlay roots: the first root whose
 * traversal guard admits the path AND whose tree contains the file wins. A
 * URL that escapes a root resolves nowhere in that root — escape is never
 * retried as another root's in-tree path. Existence is injected so the
 * decision stays pure.
 */
export function resolveAcrossRoots(
  roots: readonly string[],
  rawUrl: string,
  exists: (candidate: string) => boolean,
): string | undefined {
  for (const root of roots) {
    const resolved = resolveWithinRoot(root, rawUrl);
    if (resolved !== undefined && exists(resolved)) {
      return resolved;
    }
  }
  return undefined;
}

function handleStaticRequest(
  roots: readonly string[],
  req: http.IncomingMessage,
  res: http.ServerResponse,
): void {
  const resolved = resolveAcrossRoots(
    roots,
    req.url ?? '/',
    (candidate) => fs.existsSync(candidate) && !fs.statSync(candidate).isDirectory(),
  );
  if (resolved === undefined) {
    res.writeHead(404);
    res.end();
    return;
  }
  res.writeHead(200, {
    'content-type':
      CONTENT_TYPES.get(path.extname(resolved).toLowerCase()) ?? 'application/octet-stream',
  });
  fs.createReadStream(resolved).pipe(res);
}

/** Serve the overlay roots on an ephemeral localhost port. */
export function serveRoots(roots: readonly string[]): Promise<http.Server> {
  const server = http.createServer((req, res) => {
    handleStaticRequest(roots, req, res);
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      resolve(server);
    });
  });
}

/** The bound TCP port of a listening server, narrowed from Node's address union. */
export function portOf(server: http.Server): Result<number, Error> {
  const address = server.address();
  if (address === null || typeof address === 'string') {
    return err(new Error('static server did not bind a TCP port'));
  }
  return ok(address.port);
}

/** Fail loud when either overlay root is absent. Both are TRACKED repo
 *  content reached through the workspace link, so absence means a broken
 *  install (re-run `pnpm install`), never a missing re-pull. */
export function assertExportRoots(): Result<void, string> {
  for (const root of EXPORT_ROOTS) {
    if (!fs.existsSync(root)) {
      return err(
        `export overlay root not found: ${root} — the @oaknational/oak-design-system workspace link is broken; re-run pnpm install`,
      );
    }
  }
  return ok(undefined);
}
