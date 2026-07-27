/**
 * Build-output guardrails for the deployed MCP HTTP artefacts.
 *
 * @remarks
 * These checks codify the repaired Vercel deploy boundary:
 *
 * - esbuild warnings are blocking failures, not advisory output;
 * - the deployed `dist/server.js` artefact must default-export a function
 *   that satisfies the verified `@vercel/node` import contract.
 *
 * The esbuild composition root calls these guards immediately after writing
 * the bundle so the next entry-shape regression fails at build time rather
 * than after a preview deploy boots.
 *
 * @packageDocumentation
 */

import type { PartialMessage } from 'esbuild';

const INVALID_VERCEL_EXPORT_MESSAGE =
  'dist/server.js must default-export a function that satisfies the verified @vercel/node import contract.';

function escapeForRegExp(value: string): string {
  return value.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
}

function hasInlineDefaultFunctionExport(bundleSource: string): boolean {
  return (
    /export\s+default\s+(?:async\s+)?function\b/m.test(bundleSource) ||
    /export\s+default\s+(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/m.test(bundleSource)
  );
}

function findDefaultExportBinding(bundleSource: string): string | null {
  const reExportMatch = bundleSource.match(
    /export\s*\{[^}]*?\b([A-Za-z_$][\w$]*)\s+as\s+default\b[^}]*\}/m,
  );
  if (reExportMatch?.[1]) {
    return reExportMatch[1];
  }

  const directExportMatch = bundleSource.match(/export\s+default\s+([A-Za-z_$][\w$]*)\s*;/m);
  return directExportMatch?.[1] ?? null;
}

function isFunctionBinding(
  bundleSource: string,
  identifier: string,
  seen: Set<string> = new Set<string>(),
): boolean {
  if (seen.has(identifier)) {
    return false;
  }
  seen.add(identifier);

  const escapedIdentifier = escapeForRegExp(identifier);
  const declarationPatterns = [
    new RegExp(
      String.raw`(?:^|\n)\s*(?:export\s+)?(?:async\s+)?function\s+${escapedIdentifier}\b`,
      'm',
    ),
    new RegExp(
      String.raw`(?:^|\n)\s*(?:const|let|var)\s+${escapedIdentifier}\s*=\s*(?:async\s+)?function\b`,
      'm',
    ),
    new RegExp(
      String.raw`(?:^|\n)\s*(?:const|let|var)\s+${escapedIdentifier}\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>`,
      'm',
    ),
  ] satisfies readonly RegExp[];

  if (declarationPatterns.some((pattern) => pattern.test(bundleSource))) {
    return true;
  }

  const aliasPattern = new RegExp(
    String.raw`(?:^|\n)\s*(?:const|let|var)\s+${escapedIdentifier}\s*=\s*([A-Za-z_$][\w$]*)\s*;`,
    'm',
  );
  const aliasMatch = bundleSource.match(aliasPattern);
  if (!aliasMatch?.[1]) {
    return false;
  }

  return isFunctionBinding(bundleSource, aliasMatch[1], seen);
}

/**
 * Fail the build when esbuild emitted any warnings.
 *
 * @remarks
 * Warnings are surfaced as a deterministic error message so the build log
 * names the exact contract violation that must be fixed before deploy.
 */
export function assertNoEsbuildWarnings(warnings: readonly Pick<PartialMessage, 'text'>[]): void {
  if (warnings.length === 0) {
    return;
  }

  throw new Error(
    ['Esbuild emitted warnings:', ...warnings.map((warning) => `- ${warning.text}`)].join('\n'),
  );
}

/**
 * Fail when the built deploy entry does not default-export the deploy handler.
 *
 * @remarks
 * The source-level function proof lives in `src/server.unit.test.ts`. This
 * guard checks the emitted artefact shape after bundling so the build still
 * fails if `dist/server.js` loses its default export at the deploy boundary.
 */
export function assertBuiltServerDefaultExport(bundleSource: string): void {
  if (hasInlineDefaultFunctionExport(bundleSource)) {
    return;
  }

  const binding = findDefaultExportBinding(bundleSource);
  if (binding !== null && isFunctionBinding(bundleSource, binding)) {
    return;
  }

  throw new Error(INVALID_VERCEL_EXPORT_MESSAGE);
}

/** react or react-dom, with any subpath — tested against a lone specifier. */
const REACT_MODULE_SPECIFIER = /^(?:react|react-dom)(?:\/[\w-]+)?$/;

/**
 * Module specifiers quoted after `from` (ESM) — a tiny linear extraction;
 * the specifier itself is judged separately so no single pattern needs
 * alternation or ambiguous quantifiers.
 */
const ESM_SPECIFIER_PATTERN = /\bfrom\s*["']([^'"\n]+)["']/g;

/** Module specifiers inside `require(...)` (CJS) — same shape. */
const CJS_SPECIFIER_PATTERN = /\brequire\(\s*["']([^'"\n]+)["']\s*\)/g;

/**
 * Fail when a deploy-graph bundle still imports react or react-dom.
 *
 * @remarks
 * react and react-dom are devDependencies: the page is rendered ONCE at
 * build time, so no runtime bundle may import them. With
 * `packages: 'external'`, a re-introduced server-side render import
 * survives bundling as an external import — green everywhere locally (tsx
 * resolves the workspace copy) and a hard `ERR_MODULE_NOT_FOUND` on the
 * deployed function, where devDependencies are pruned. This guard is what
 * makes the devDependencies placement safe rather than assumed. Inlined
 * string CONTENT (the widget bundle's text mentions `react-dom` inside
 * backticks) carries no quoted import specifier and must not match. Since
 * the boot-throw cure, `server.js` also carries the baked landing page
 * inline — more string content in this guard's input, same
 * no-quoted-specifier reasoning; a future false positive should be read
 * against that enlarged input first.
 */
export function assertNoReactModuleImport(bundleName: string, bundleSource: string): void {
  const specifiers = [
    ...bundleSource.matchAll(ESM_SPECIFIER_PATTERN),
    ...bundleSource.matchAll(CJS_SPECIFIER_PATTERN),
  ].map((match) => match[1] ?? '');

  if (!specifiers.some((specifier) => REACT_MODULE_SPECIFIER.test(specifier))) {
    return;
  }

  throw new Error(
    `${bundleName} imports react/react-dom, which are devDependencies pruned on deploy. ` +
      'The page renders at build time only — remove the runtime import.',
  );
}

/**
 * The structural marker the baked page always carries: its stylesheet link
 * (`landing-page-document.tsx`). Quote-free by requirement — esbuild picks
 * the inlined literal's quote character by escape minimisation, so a marker
 * containing `"`, `'`, or a backslash would be encoding-fragile.
 */
const BAKED_LANDING_PAGE_MARKER = '/landing-page.css';

/**
 * Fail when the built deploy bundle does not carry the baked page inline.
 *
 * @remarks
 * The deployed function's filesystem does not include the gitignored
 * `.generated/` artefact (the PR 583 boot-throw: every request died on the
 * missing file before any log line). The cure inlines the page into the
 * bundle via esbuild's `text` loader; this guard fails the BUILD if that
 * property regresses. Two-sided so it can never pass vacuously: the marker
 * must be present in the baked HTML (else the marker has stopped marking)
 * AND in the bundle (else the inline did not happen).
 */
export function assertBundleCarriesBakedLandingPage(
  bundleName: string,
  bundleSource: string,
  bakedHtml: string,
): void {
  if (!bakedHtml.includes(BAKED_LANDING_PAGE_MARKER)) {
    throw new Error(
      `The baked landing page no longer contains its marker ${BAKED_LANDING_PAGE_MARKER}; ` +
        'the bundle guard cannot verify inlining. Restore the stylesheet link or update the marker.',
    );
  }

  if (!bundleSource.includes(BAKED_LANDING_PAGE_MARKER)) {
    throw new Error(
      `${bundleName} does not carry the baked landing page inline ` +
        `(marker ${BAKED_LANDING_PAGE_MARKER} absent). The deploy filesystem has no .generated/ ` +
        'artefact — the page must ship inside the bundle.',
    );
  }
}
