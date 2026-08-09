/**
 * Leg (b) of the workspace-config-isolation validator: `$TURBO_ROOT$`
 * inputs in turbo.json must resolve.
 *
 * @remarks turbo silently hashes zero files for an input that matches
 * nothing (measured: five stale entries contributed nothing, with no
 * warning), so cache invalidation rots invisibly. The predicate:
 * negated entries are existence-exempt; a glob entry requires only its
 * leading literal prefix to exist; a literal entry must exist. Only
 * `inputs` arrays are scanned — `outputs` globs legitimately match
 * nothing before a build. turbo.json is JSONC, so the scan uses the
 * `jsonc-parser` visitor rather than `JSON.parse`.
 *
 * @packageDocumentation
 */

import path from 'node:path';

import { visit } from 'jsonc-parser';

import { lineOf } from './text-position.js';

/** One `$TURBO_ROOT$` input entry that resolves to nothing on disk. */
export interface TurboInputFinding {
  readonly entry: string;
  readonly line: number;
}

const GLOB_METACHARACTER = /[*?[{]/;

/**
 * Is one `$TURBO_ROOT$` input entry stale?
 */
export function isStaleTurboRootInput(
  entry: string,
  fileExists: (repoRelativePath: string) => boolean,
): boolean {
  if (entry.startsWith('!')) {
    return false;
  }
  const relative = entry.replace('$TURBO_ROOT$/', '');
  const metaIndex = relative.search(GLOB_METACHARACTER);
  if (metaIndex === -1) {
    return !fileExists(relative);
  }
  const prefix = relative.slice(0, metaIndex);
  const literalDir = prefix.endsWith('/') ? prefix.slice(0, -1) : path.posix.dirname(prefix);
  if (literalDir === '' || literalDir === '.') {
    return false;
  }
  return !fileExists(literalDir);
}

/**
 * Scan turbo.json (JSONC) for stale `$TURBO_ROOT$` entries inside
 * `inputs` arrays, reporting each occurrence with its line.
 */
export function scanTurboRootInputs(input: {
  readonly turboJsonText: string;
  readonly fileExists: (repoRelativePath: string) => boolean;
}): readonly TurboInputFinding[] {
  const { turboJsonText, fileExists } = input;
  const findings: TurboInputFinding[] = [];
  let currentProperty = '';
  let inInputs = false;
  let arrayDepth = 0;

  visit(turboJsonText, {
    onObjectProperty(property) {
      currentProperty = property;
    },
    onArrayBegin() {
      if (arrayDepth === 0 && currentProperty === 'inputs') {
        inInputs = true;
      }
      if (inInputs) {
        arrayDepth += 1;
      }
    },
    onArrayEnd() {
      if (inInputs) {
        arrayDepth -= 1;
        if (arrayDepth === 0) {
          inInputs = false;
        }
      }
    },
    onLiteralValue(value, offset) {
      if (!inInputs || typeof value !== 'string' || !value.includes('$TURBO_ROOT$')) {
        return;
      }
      if (isStaleTurboRootInput(value, fileExists)) {
        findings.push({ entry: value, line: lineOf(turboJsonText, offset) });
      }
    },
  });

  return findings;
}
