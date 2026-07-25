import fs from 'node:fs/promises';

import { err, isErr, ok, type Result } from '@oaknational/result';

import {
  POLICY_URL,
  parseBlockedContentPolicy,
  parseBlockedPatternPolicy,
  parseScopedContentBlocks,
} from './policy-loader.js';
import type { RawBlockedPattern, ScopedContentBlockGroup } from './types.js';

/**
 * One validated read of the canonical hook policy.
 *
 * Section outcomes are held independently so a malformed section only fails
 * the guards that need it: the Bash guard must stay operational when a
 * content section is broken (and vice versa), because a fail-closed Bash
 * guard blocks the very rebuild command that would repair the policy — the
 * lived brick class the runners' fail-open bootstrap exists to prevent.
 *
 * @packageDocumentation
 */
export interface PolicySnapshot {
  /** `hooks.preToolUse.blocked_patterns` — the Bash guard section. */
  readonly bashPatterns: Result<readonly RawBlockedPattern[], Error>;
  /** `hooks.preToolUseContent.blocked_patterns` — flat content patterns. */
  readonly contentPatterns: Result<readonly string[], Error>;
  /** `hooks.preToolUseContent.scoped_blocks` — path-scoped doctrine blocks. */
  readonly scopedBlocks: Result<readonly ScopedContentBlockGroup[], Error>;
}

/** Injectable read seam so tests can count reads and simulate failures. */
export type ReadPolicyText = (policyUrl: URL) => Promise<string>;

/** Real filesystem read for the production seam default. */
function readPolicyTextFromFile(policyUrl: URL): Promise<string> {
  return fs.readFile(policyUrl, 'utf8');
}

/** Capture one section parse as an independent outcome. */
function sectionOutcome<T>(parseSection: () => T): Result<T, Error> {
  try {
    return ok(parseSection());
  } catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Load the canonical hook policy with exactly one read and one parse.
 *
 * Read and JSON-parse failures throw raw — they poison every section alike,
 * and the raw message is the observable stderr contract the runners already
 * expose. Section-level validation failures are captured per section; each
 * consumer unwraps only the sections its route needs via
 * {@link unwrapPolicySection}.
 */
export async function loadPolicySnapshot(
  policyUrl: URL = POLICY_URL,
  readPolicyText: ReadPolicyText = readPolicyTextFromFile,
): Promise<PolicySnapshot> {
  const policyText = await readPolicyText(policyUrl);
  const policy: unknown = JSON.parse(policyText);

  return {
    bashPatterns: sectionOutcome(() => parseBlockedPatternPolicy(policy)),
    contentPatterns: sectionOutcome(() => parseBlockedContentPolicy(policy)),
    scopedBlocks: sectionOutcome(() => parseScopedContentBlocks(policy)),
  };
}

/**
 * Unwrap one section outcome at a consumption boundary, rethrowing the
 * original section error so the guard's stderr text stays identical to the
 * serial per-section loaders this snapshot replaces.
 */
export function unwrapPolicySection<T>(section: Result<T, Error>): T {
  if (isErr(section)) {
    throw section.error;
  }
  return section.value;
}
