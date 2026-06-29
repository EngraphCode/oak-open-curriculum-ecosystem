/**
 * Composition root for the `session-metadata` topic.
 *
 * @remarks
 * Vendor + model + session-id in, session metadata out. Parses argv, resolves
 * the model window, locates and reads the session transcript, computes
 * occupancy, and emits text or JSON. Pure pieces do the work; this layer wires
 * them and translates failures into exit codes (no throw escapes; ADR-088).
 *
 * @packageDocumentation
 */

import { parseArgs, SESSION_METADATA_HELP_TEXT } from './cli-options.js';
import { computeMetadata } from './compute.js';
import type { SessionMetadataFileSystem } from './file-system.js';
import { nodeSessionMetadataFileSystem } from './file-system-node.js';
import { formatJson, formatText, type SessionMetadataReport } from './format.js';
import { resolveTranscriptPath } from './transcript-locator.js';
import { parseLatestUsage } from './usage.js';
import { resolveWindowTokens } from './window-registry.js';

/** Inputs for {@link runSessionMetadataCli}. */
export interface SessionMetadataCliInput {
  readonly argv: readonly string[];
  readonly cwd: string;
  readonly env: { readonly HOME?: string };
  readonly fs?: SessionMetadataFileSystem;
  readonly stdout?: Pick<NodeJS.WritableStream, 'write'>;
  readonly stderr?: Pick<NodeJS.WritableStream, 'write'>;
}

/** Result of {@link runSessionMetadataCli}. */
export interface SessionMetadataCliResult {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
}

type ReportOutcome =
  | { readonly ok: true; readonly report: SessionMetadataReport }
  | { readonly ok: false; readonly error: string };

/**
 * Execute the `session-metadata` CLI.
 *
 * @param input - argv, cwd, env, and optional injected fs / streams.
 * @returns Exit code and captured stdout/stderr.
 */
export async function runSessionMetadataCli(
  input: SessionMetadataCliInput,
): Promise<SessionMetadataCliResult> {
  const parsed = parseArgs(input.argv);
  if (!parsed.ok) {
    return emit(input, { exitCode: 2, stdout: '', stderr: `${parsed.error}\n` });
  }

  if (parsed.options.help) {
    return emit(input, { exitCode: 0, stdout: `${SESSION_METADATA_HELP_TEXT}\n`, stderr: '' });
  }

  const outcome = await buildReport(parsed.options, input);
  if (!outcome.ok) {
    return emit(input, { exitCode: 2, stdout: '', stderr: `${outcome.error}\n` });
  }

  const stdout = parsed.options.json ? formatJson(outcome.report) : formatText(outcome.report);
  return emit(input, { exitCode: 0, stdout, stderr: '' });
}

async function buildReport(
  options: { readonly vendor: string; readonly model: string; readonly sessionId: string },
  input: SessionMetadataCliInput,
): Promise<ReportOutcome> {
  const windowTokens = resolveWindowTokens(options.model);
  if (windowTokens === undefined) {
    return { ok: false, error: `unknown model: ${options.model} (no window size registered)` };
  }

  const home = input.env.HOME;
  if (home === undefined || home.length === 0) {
    return { ok: false, error: 'HOME environment variable is not set' };
  }

  const located = resolveTranscriptPath({
    vendor: options.vendor,
    home,
    cwd: input.cwd,
    sessionId: options.sessionId,
  });
  if (!located.ok) {
    return { ok: false, error: located.error };
  }

  const content = await readTranscript(input.fs ?? nodeSessionMetadataFileSystem, located.path);
  if (!content.ok) {
    return content;
  }

  const usage = parseLatestUsage(content.text);
  if (usage === undefined) {
    return { ok: false, error: `no context usage found in transcript: ${located.path}` };
  }

  const metrics = computeMetadata({ usedTokens: usage.usedTokens, windowTokens });
  return {
    ok: true,
    report: {
      vendor: options.vendor,
      model: options.model,
      sessionId: options.sessionId,
      ...metrics,
    },
  };
}

async function readTranscript(
  fs: SessionMetadataFileSystem,
  path: string,
): Promise<
  { readonly ok: true; readonly text: string } | { readonly ok: false; readonly error: string }
> {
  try {
    return { ok: true, text: await fs.readFileUtf8(path) };
  } catch (error) {
    return {
      ok: false,
      error: `failed to read transcript ${path}: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

function emit(
  input: SessionMetadataCliInput,
  result: SessionMetadataCliResult,
): SessionMetadataCliResult {
  input.stdout?.write(result.stdout);
  input.stderr?.write(result.stderr);
  return result;
}
