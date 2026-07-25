import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { buildPreToolUseDenyResponse } from './content-deny-response.js';
import { evaluateContentChanges, type PolicyDecision } from './evaluate.js';
import {
  extractContentChanges,
  parseHookInput,
  readStreamText,
  resolveContentPair,
} from './hook-input.js';
import { POLICY_URL } from './policy-loader.js';
import { loadPolicySnapshot, unwrapPolicySection } from './policy-snapshot.js';
import { type RunPreToolUseContentGuardOptions, type ScopedContentBlockGroup } from './types.js';

export type { PreToolUseDenyResponse, RunPreToolUseContentGuardOptions } from './types.js';

export { PreToolUseDenyResponseSchema } from './types.js';

export {
  extractContentChange,
  extractContentChanges,
  parseHookInput,
  readStreamText,
} from './hook-input.js';

export {
  findAddedBlockedContent,
  findAddedScopedBlock,
  isPathInScope,
  lineIsPredominantlyCodeShaped,
} from './matchers.js';

export {
  loadScopedContentBlocks,
  parseBlockedContentPolicy,
  parseScopedContentBlocks,
} from './policy-loader.js';

export { buildPreToolUseDenyResponse } from './content-deny-response.js';

/**
 * Read prior file content for the real hook adapter.
 */
function readPriorFileContent(filePath: string): string | null {
  try {
    return readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

/**
 * Apply default seams to the guard options. Extracted so the orchestrator's
 * complexity stays under the workspace's cap.
 */
function applyGuardDefaults(options: RunPreToolUseContentGuardOptions): {
  readonly stdin: AsyncIterable<string | Buffer>;
  readonly stdout: { write(text: string): void };
  readonly stderr: { write(text: string): void };
  readonly policyUrl: URL;
  readonly blockedPatterns: readonly string[] | undefined;
  readonly scopedBlocks: readonly ScopedContentBlockGroup[] | undefined;
  readonly readPriorContent: (filePath: string) => string | null;
} {
  return {
    stdin: options.stdin ?? process.stdin,
    stdout: options.stdout ?? process.stdout,
    stderr: options.stderr ?? process.stderr,
    policyUrl: options.policyUrl ?? POLICY_URL,
    blockedPatterns: options.blockedPatterns,
    scopedBlocks: options.scopedBlocks,
    readPriorContent: options.readPriorContent ?? readPriorFileContent,
  };
}

/**
 * Read + parse the hook stdin payload into resolved new/prior content pairs
 * plus optional file paths — one entry per content change the payload
 * carries (Claude object payloads yield one; a Copilot `apply_patch`
 * program yields one per file section). Extracted so the orchestrator stays
 * under the workspace's complexity cap.
 */
async function readResolvedContents(
  stdin: AsyncIterable<string | Buffer>,
  readPriorContent: (filePath: string) => string | null,
): Promise<readonly { newContent: string; priorContent: string; filePath?: string }[]> {
  const inputText = await readStreamText(stdin);
  const hookInput = parseHookInput(inputText);
  return extractContentChanges(hookInput).map((change) =>
    resolveOneContent(change, readPriorContent),
  );
}

/** Resolve one extracted change through the injected prior-content reader. */
function resolveOneContent(
  change: ReturnType<typeof extractContentChanges>[number],
  readPriorContent: (filePath: string) => string | null,
): { newContent: string; priorContent: string; filePath?: string } {
  const { newContent, priorContent } = resolveContentPair(change, readPriorContent);
  return { newContent, priorContent, filePath: change.filePath };
}

/**
 * Render a caught error's message for the stderr surface, preserving the
 * unknown-source convention used elsewhere in the workspace.
 */
function formatGuardError(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown PreToolUse content hook failure.';
}

/**
 * Resolve the two content policy sections through the injection overlay:
 * injected sections win, and the snapshot is loaded at most once, only when
 * a needed section is un-injected. Flat patterns unwrap before scoped
 * blocks, preserving the serial per-section load error precedence this
 * overlay replaces.
 */
async function resolveContentSections(seams: {
  readonly policyUrl: URL;
  readonly blockedPatterns: readonly string[] | undefined;
  readonly scopedBlocks: readonly ScopedContentBlockGroup[] | undefined;
}): Promise<{
  readonly patterns: readonly string[];
  readonly blocks: readonly ScopedContentBlockGroup[];
}> {
  if (seams.blockedPatterns !== undefined && seams.scopedBlocks !== undefined) {
    return { patterns: seams.blockedPatterns, blocks: seams.scopedBlocks };
  }
  const snapshot = await loadPolicySnapshot(seams.policyUrl);
  const patterns = seams.blockedPatterns ?? unwrapPolicySection(snapshot.contentPatterns);
  const blocks = seams.scopedBlocks ?? unwrapPolicySection(snapshot.scopedBlocks);
  return { patterns, blocks };
}

/**
 * Render a canonical deny decision through the unchanged Claude deny
 * payload contract. Returns false for an allow so the orchestrator writes
 * the explicit allow decision instead.
 */
function writeDenyDecision(
  decision: PolicyDecision,
  stdout: { write(text: string): void },
): boolean {
  if (decision.kind === 'deny-content-pattern') {
    stdout.write(
      `${JSON.stringify(buildPreToolUseDenyResponse({ kind: 'owner-marker', pattern: decision.pattern }))}\n`,
    );
    return true;
  }
  if (decision.kind === 'deny-scoped-block') {
    stdout.write(
      `${JSON.stringify(
        buildPreToolUseDenyResponse({
          kind: 'concept',
          pattern: decision.match.matchedText,
          concept: decision.match.group.concept,
          citation: decision.match.group.citation,
          reappraisal: decision.match.group.reappraisal,
        }),
      )}\n`,
    );
    return true;
  }
  return false;
}

/**
 * Write the explicit allow decision. Silence-means-allow is a Claude-only
 * convention; an inheriting host (Copilot CLI's compat route) needs the
 * decision stated. Explicit output is contract-valid for Claude too, so
 * every clean evaluation ends with a stated verdict rather than an implied
 * one (strict-and-complete).
 */
function writeAllowDecision(stdout: { write(text: string): void }): void {
  stdout.write(
    `${JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'allow',
        permissionDecisionReason: 'no policy match',
      },
    })}\n`,
  );
}

/**
 * Execute the content guard using the PreToolUse stdin/stdout contract.
 *
 * Every content change carried by the payload is evaluated (Claude payloads
 * carry one; a Copilot `apply_patch` program carries one per file section),
 * with two layers of detection per change, in order:
 *   1. Flat `blocked_patterns` — universal, path-agnostic block.
 *   2. `scoped_blocks` — path-scoped, citation-bearing doctrine blocks.
 *
 * The first match wins; only one deny payload is written. A clean pass over
 * every change writes an explicit allow decision.
 */
export async function runPreToolUseContentGuard(
  options: RunPreToolUseContentGuardOptions = {},
): Promise<{ exitCode: number }> {
  const seams = applyGuardDefaults(options);

  try {
    const changes = await readResolvedContents(seams.stdin, seams.readPriorContent);
    const { patterns, blocks } = await resolveContentSections(seams);
    const decision = evaluateContentChanges(changes, patterns, blocks);

    if (writeDenyDecision(decision, seams.stdout)) {
      return { exitCode: 0 };
    }

    writeAllowDecision(seams.stdout);
    return { exitCode: 0 };
  } catch (error) {
    seams.stderr.write(`${formatGuardError(error)}\n`);
    return { exitCode: 2 };
  }
}

const currentFilePath = fileURLToPath(import.meta.url);

if (process.argv[1] === currentFilePath) {
  const { exitCode } = await runPreToolUseContentGuard();
  process.exit(exitCode);
}
