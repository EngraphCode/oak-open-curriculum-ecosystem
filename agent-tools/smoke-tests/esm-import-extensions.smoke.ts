import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The workspace compiles with `tsc` (no bundler) and runs the emitted `dist`
 * under plain Node ESM, which resolves relative specifiers literally: an
 * extensionless relative import compiles cleanly (moduleResolution "bundler")
 * but throws ERR_MODULE_NOT_FOUND the moment the emitted file is loaded by
 * `node`. Vitest and tsx both use bundler-style resolution, so only this
 * static conformance check catches the defect before a dist entrypoint hits
 * it at runtime — including latent defects in modules no dist entrypoint
 * imports YET (the 2026-07-21 collaboration-state outage was exactly such a
 * latent module being newly wired into the dist CLI graph).
 *
 * Every relative import/export specifier in src must therefore carry an
 * explicit extension. Type-only imports are erased at emit but are held to
 * the same convention so a later change from `import type` to `import`
 * cannot reintroduce the failure.
 */
const SOURCE_ROOT = fileURLToPath(new URL('../src', import.meta.url));

/** Recursively collect all TypeScript source files under a directory. */
function collectSourceFiles(directory: string): string[] {
  const collected: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      collected.push(...collectSourceFiles(entryPath));
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      collected.push(entryPath);
    }
  }
  return collected;
}

/** Match static import/export-from and dynamic import() relative specifiers. */
const RELATIVE_SPECIFIER_PATTERN = /(?:from\s*|import\s*\(\s*)['"](\.[^'"]*)['"]/gu;

/** Extensions Node ESM resolves literally without guessing. */
const EXPLICIT_EXTENSION_PATTERN = /\.(?:js|mjs|cjs|json)$/u;

const violations: string[] = [];
for (const filePath of collectSourceFiles(SOURCE_ROOT)) {
  const content = readFileSync(filePath, 'utf8');
  for (const match of content.matchAll(RELATIVE_SPECIFIER_PATTERN)) {
    const specifier = match[1];
    if (specifier !== undefined && !EXPLICIT_EXTENSION_PATTERN.test(specifier)) {
      violations.push(`${filePath}: '${specifier}'`);
    }
  }
}

if (violations.length > 0) {
  process.stderr.write(
    `extensionless relative ESM specifiers found (Node cannot resolve these from dist):\n` +
      `${violations.join('\n')}\n`,
  );
  process.exit(1);
}
process.stdout.write(`esm-import-extensions smoke: all relative specifiers carry extensions\n`);
