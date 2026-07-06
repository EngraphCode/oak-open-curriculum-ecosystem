/*
 * The shared static server over the canonical Claude Design export
 * (deduplicated from render-canonical-targets.ts and
 * drive-export-sections.ts): the .dc.html pages hydrate via _ds_bundle.js
 * and fetch data/quality-standards.json, so file:// is CORS-blocked — the
 * export must be served over local HTTP. Path resolution is a pure,
 * separately-testable decision (canonicalise, then prefix-check against the
 * served root) so the traversal guard has behaviour tests without IO.
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { err, ok, type Result } from '@oaknational/result';

const TOOLS_DIR = path.dirname(fileURLToPath(import.meta.url));

/** The untracked, byte-sacred canonical export directory. */
export const EXPORT_DIR = path.resolve(TOOLS_DIR, '..', 'claude-design-canonical-export');

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

function handleStaticRequest(
  dir: string,
  req: http.IncomingMessage,
  res: http.ServerResponse,
): void {
  const resolved = resolveWithinRoot(dir, req.url ?? '/');
  if (resolved === undefined || !fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) {
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

/** Serve `dir` on an ephemeral localhost port. */
export function serveDir(dir: string): Promise<http.Server> {
  const server = http.createServer((req, res) => {
    handleStaticRequest(dir, req, res);
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

/** Fail loud when the untracked export is absent (fresh clone, MCP re-pull owed). */
export function assertExportDir(): Result<void, string> {
  if (!fs.existsSync(EXPORT_DIR)) {
    return err(`export dir not found: ${EXPORT_DIR}`);
  }
  return ok(undefined);
}
