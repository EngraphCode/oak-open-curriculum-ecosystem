/**
 * Unit tests for the pure widget-URI suffix resolver (deterministic
 * per-build cache-busting, MCP-187).
 *
 * The resolver is tested through injected values only — never
 * `process.env` — per `no-global-state-in-tests`, and the guarantee is
 * structural: `widget-uri-suffix.ts` is environment-free, so this suite's
 * import graph evaluates no ambient state. The `process.env` composition
 * point (`BASE_WIDGET_URI`) lives in `cross-domain-constants.ts` with its
 * own shape suite.
 *
 * @see widget-uri-suffix.ts — the module under test
 */

import { describe, it, expect } from 'vitest';
import { resolveWidgetUriSuffix } from './widget-uri-suffix.js';

describe('resolveWidgetUriSuffix', () => {
  const onVercel = {
    vercel: '1',
    gitCommitSha: 'fa1eade47b73733d6312d5abfad33ce9e4068081',
    deploymentId: 'dpl_7Gw5ZMBpQA8h9GF832KGp7nwbuh3',
  };

  it('returns the literal "local" when not on Vercel', () => {
    expect(
      resolveWidgetUriSuffix({
        vercel: undefined,
        gitCommitSha: undefined,
        deploymentId: undefined,
      }),
    ).toBe('local');
    expect(resolveWidgetUriSuffix({ ...onVercel, vercel: undefined })).toBe('local');
  });

  it('is deterministic: the same build identifier always yields the same suffix', () => {
    expect(resolveWidgetUriSuffix(onVercel)).toBe(resolveWidgetUriSuffix({ ...onVercel }));
  });

  it('matches the sha256 golden vector for a known build identifier', () => {
    // sha256("abc") = ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad
    expect(
      resolveWidgetUriSuffix({ vercel: '1', gitCommitSha: 'abc', deploymentId: undefined }),
    ).toBe('ba7816bf');
  });

  it('yields distinct suffixes for distinct build identifiers', () => {
    const a = resolveWidgetUriSuffix({ ...onVercel, gitCommitSha: 'commit-a' });
    const b = resolveWidgetUriSuffix({ ...onVercel, gitCommitSha: 'commit-b' });
    expect(a).not.toBe(b);
  });

  it('emits an 8-character lowercase hex suffix on Vercel builds', () => {
    expect(resolveWidgetUriSuffix(onVercel)).toMatch(/^[a-f0-9]{8}$/);
  });

  it('prefers the commit SHA over the deployment ID', () => {
    const withOtherDeployment = resolveWidgetUriSuffix({
      ...onVercel,
      deploymentId: 'dpl_completely-different',
    });
    expect(withOtherDeployment).toBe(resolveWidgetUriSuffix(onVercel));
    const fromDeploymentOnly = resolveWidgetUriSuffix({ ...onVercel, gitCommitSha: undefined });
    expect(fromDeploymentOnly).not.toBe(resolveWidgetUriSuffix(onVercel));
  });

  it('treats an empty-string commit SHA as absent and falls back to the deployment ID', () => {
    // Vercel exposes non-applicable system envs as empty strings (e.g. git
    // vars on non-git CLI deploys); bare `??` would hash the empty string.
    expect(resolveWidgetUriSuffix({ ...onVercel, gitCommitSha: '' })).toBe(
      resolveWidgetUriSuffix({ ...onVercel, gitCommitSha: undefined }),
    );
  });

  it('fails loud on a Vercel build with no usable build identifier', () => {
    expect(() =>
      resolveWidgetUriSuffix({ vercel: '1', gitCommitSha: '', deploymentId: undefined }),
    ).toThrow(/VERCEL_GIT_COMMIT_SHA.*VERCEL_DEPLOYMENT_ID/su);
  });
});
