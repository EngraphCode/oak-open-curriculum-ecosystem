/**
 * Candidate resolution for the baked landing-page artefact.
 *
 * @remarks
 * Pure branches with literal paths and an injected `exists` — the same
 * shape as `resolveStaticRoot`'s suite. The fail-fast throw is the branch
 * the deployment's "never a blank front door" guarantee rests on, so its
 * message contract (every candidate named, cwd included) is asserted, not
 * assumed.
 */

import { describe, expect, it } from 'vitest';

import {
  landingPageArtefactCandidates,
  LANDING_PAGE_ARTEFACT_RELATIVE_PATH,
  resolveLandingPageArtefact,
} from './landing-page-artefact.js';

const WORKSPACE = '/srv/app/apps/oak-curriculum-mcp-streamable-http';
const REPO_ROOT = '/srv/app';

describe('landingPageArtefactCandidates', () => {
  it('probes the working directory first, then the workspace under a repo-root cwd', () => {
    expect(landingPageArtefactCandidates(REPO_ROOT)).toStrictEqual([
      `${REPO_ROOT}/${LANDING_PAGE_ARTEFACT_RELATIVE_PATH}`,
      `${REPO_ROOT}/apps/oak-curriculum-mcp-streamable-http/${LANDING_PAGE_ARTEFACT_RELATIVE_PATH}`,
    ]);
  });
});

describe('resolveLandingPageArtefact', () => {
  it('resolves the first existing candidate', () => {
    const candidates = landingPageArtefactCandidates(WORKSPACE);

    const chosen = resolveLandingPageArtefact(
      candidates,
      (candidate) => candidate === candidates[0],
      WORKSPACE,
    );

    expect(chosen).toBe(candidates[0]);
  });

  it('falls through to the workspace-nested candidate (the Vercel repo-root cwd)', () => {
    const candidates = landingPageArtefactCandidates(REPO_ROOT);

    const chosen = resolveLandingPageArtefact(
      candidates,
      (candidate) => candidate === candidates[1],
      REPO_ROOT,
    );

    expect(chosen).toBe(candidates[1]);
  });

  it('fails fast with every candidate and the cwd in the message when none exists', () => {
    const candidates = landingPageArtefactCandidates(REPO_ROOT);

    expect(() => resolveLandingPageArtefact(candidates, () => false, REPO_ROOT)).toThrow(
      new RegExp(
        String.raw`No baked landing page found[\s\S]*${REPO_ROOT}/${LANDING_PAGE_ARTEFACT_RELATIVE_PATH}[\s\S]*cwd: ${REPO_ROOT}`,
      ),
    );
  });
});
