/**
 * The baked landing page: where it lives and how boot reads it.
 *
 * @remarks
 * The page's content is fixed at BUILD time (owner ruling, ADR-217 lineage):
 * the bake step renders once with build-environment inputs and writes the
 * artefact; the request path serves that string and never renders. This
 * module is the runtime-neutral seam both sides share — the bake script
 * imports the path constant downward from `src/`, and the production entry
 * points read the artefact at boot through {@link readBakedLandingPageHtml}.
 *
 * The candidate resolution is pure ({@link resolveLandingPageArtefact},
 * `exists` injected — the `resolveStaticRoot` pattern) so its three branches
 * are unit-describable with literals; the IO wrapper below stays thin.
 */

import fs from 'node:fs';
import path from 'node:path';

/** Where the bake writes the page, workspace-relative (gitignored). */
export const LANDING_PAGE_ARTEFACT_RELATIVE_PATH = '.generated/landing-page.html';

/** The candidate artefact paths for a given working directory. */
export function landingPageArtefactCandidates(cwd: string): readonly string[] {
  return [
    path.resolve(cwd, LANDING_PAGE_ARTEFACT_RELATIVE_PATH),
    path.resolve(
      cwd,
      'apps/oak-curriculum-mcp-streamable-http',
      LANDING_PAGE_ARTEFACT_RELATIVE_PATH,
    ),
  ];
}

/**
 * Pure candidate resolution: the first existing candidate, or a throw whose
 * message names every path tried.
 *
 * @remarks
 * The throw is the deliberate boot-time exception to the Result pattern —
 * there is no caller above the entry point to hand a Result to, and a
 * missing artefact is a broken deployment that must fail loudly.
 */
export function resolveLandingPageArtefact(
  candidates: readonly string[],
  exists: (candidate: string) => boolean,
  cwd: string,
): string {
  const chosen = candidates.find((candidate) => exists(candidate));
  if (chosen === undefined) {
    throw new Error(
      `No baked landing page found. Tried: ${candidates.join(', ')} (cwd: ${cwd}). ` +
        'Run the build so bake-landing-page writes it; serving without it blanks the front door.',
    );
  }
  return chosen;
}

/**
 * Boot-time read of the baked landing page.
 *
 * @remarks
 * Same candidate probe as the static root (workspace directory locally,
 * repository root on Vercel), and the same fail-fast posture: a missing
 * artefact is a broken deployment, surfaced at boot rather than as a blank
 * page.
 */
export function readBakedLandingPageHtml(): string {
  const cwd = process.cwd();
  const chosen = resolveLandingPageArtefact(
    landingPageArtefactCandidates(cwd),
    (candidate) => fs.existsSync(candidate),
    cwd,
  );
  return fs.readFileSync(chosen, 'utf8');
}
