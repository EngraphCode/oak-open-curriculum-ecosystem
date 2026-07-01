/**
 * Harness artefact emitter.
 *
 * @remarks
 * Turns an esbuild ESM bundle of a stage entry (which exports `main`) into the exact
 * shape the harness Workflow tool executes:
 *
 * 1. `export const meta = <literal>` as the first statement (the harness reads it
 *    statically before running the body);
 * 2. the bundled body with esbuild's trailing `export { ... };` footer removed (the
 *    harness wraps the body in an AsyncFunction, where `export` is illegal);
 * 3. a trailing top-level `return await main();` that yields the stage result (legal
 *    only inside that AsyncFunction wrap — which is why `node --check` rejects the
 *    artefact and the output contract validates it the way the harness runs it).
 *
 * The stage's meta literal lives in a dedicated `<stage>.meta.ts` module that the entry
 * never imports, so the bundle contains no `meta` binding to collide with the prepended
 * export; {@link emitHarnessArtefact} enforces that invariant.
 *
 * @packageDocumentation
 */

import { err, ok, type Result } from '@oaknational/result';

import type { WorkflowMeta } from '../workflow-meta.js';

/** esbuild's trailing ESM export footer, e.g. `export {\n  main\n};`. */
const EXPORT_FOOTER = /\nexport\s*\{[^}]*\};\s*$/;

/** Any `meta` binding in the bundle body would collide with the prepended meta export. */
const META_BINDING = /^\s*(?:var|let|const|function)\s+meta\b/m;

/**
 * Remove esbuild's trailing export footer so the body is legal inside the harness's
 * AsyncFunction wrap. A bundle without one means the stage entry stopped exporting
 * `main` and the build is malformed.
 */
export function stripExportFooter(bundleSource: string): Result<string, Error> {
  if (!EXPORT_FOOTER.test(bundleSource)) {
    return err(
      new Error(
        'Bundle has no trailing export footer — the stage entry must `export async function main()`.',
      ),
    );
  }
  return ok(bundleSource.replace(EXPORT_FOOTER, '\n'));
}

/**
 * Produce the harness artefact from one stage's bundle and its meta literal.
 *
 * The meta literal is serialised with `JSON.stringify` — exact for the pure-literal meta
 * modules, and guaranteed computed-value-free by construction.
 */
export function emitHarnessArtefact(input: {
  readonly bundleSource: string;
  readonly meta: WorkflowMeta;
}): Result<string, Error> {
  if (META_BINDING.test(input.bundleSource)) {
    return err(
      new Error(
        'Bundle declares its own `meta` binding — stage entries must not import or declare meta; it lives in <stage>.meta.ts only.',
      ),
    );
  }
  const body = stripExportFooter(input.bundleSource);
  if (!body.ok) {
    return body;
  }
  const metaLine = `export const meta = ${JSON.stringify(input.meta, null, 2)};\n`;
  return ok(`${metaLine}${body.value}\nreturn await main();\n`);
}
