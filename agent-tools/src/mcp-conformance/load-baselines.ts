/**
 * Baseline loading for `agent-tools mcp-conformance` (MCP-189), behind an
 * injected reader seam so the load semantics are unit-testable without
 * filesystem access.
 *
 * The load outcome distinguishes the three states an operator must never
 * see conflated: ABSENT (no baseline file — the suite is verdict-less),
 * INVALID (a file exists but is unreadable, malformed JSON, or rejects the
 * baseline schema — the true cause is preserved verbatim), and LOADED.
 */
import { isErr } from '@oaknational/result';

import { parseWithSchema } from '../core/schema-parse.js';
import { type BaselineLoadOutcome } from './report.js';
import { baselineSchema, type ConformanceMode, type ConformanceSuite } from './types.js';

/** What one baseline-file read yields at the seam. */
export type BaselineRead =
  | { readonly kind: 'ok'; readonly content: string }
  | { readonly kind: 'absent' }
  | { readonly kind: 'error'; readonly message: string };

/** Reader seam: fetch one baseline file's text by file name. */
export type BaselineReader = (fileName: string) => BaselineRead;

/** Baseline file naming: oauth baselines carry the pinned DCR strategy in the name. */
export function baselineFileName(suite: ConformanceSuite, mode: ConformanceMode): string {
  return suite === 'oauth' ? `oauth-dcr-${mode}.json` : `${suite}-${mode}.json`;
}

function loadOne(
  reader: BaselineReader,
  suite: ConformanceSuite,
  mode: ConformanceMode,
): BaselineLoadOutcome | undefined {
  const fileName = baselineFileName(suite, mode);
  const read = reader(fileName);
  if (read.kind === 'absent') {
    return undefined;
  }
  if (read.kind === 'error') {
    return { kind: 'invalid', reason: `${fileName} could not be read: ${read.message}` };
  }
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(read.content);
  } catch (error) {
    return {
      kind: 'invalid',
      reason: `${fileName} is not valid JSON: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
  const parsed = parseWithSchema({
    label: `baseline ${fileName}`,
    schema: baselineSchema,
    value: parsedJson,
  });
  if (isErr(parsed)) {
    return { kind: 'invalid', reason: parsed.error.message };
  }
  return { kind: 'loaded', baseline: parsed.value };
}

/** Load every requested suite's baseline through the reader seam. */
export function loadBaselines(input: {
  readonly reader: BaselineReader;
  readonly suites: readonly ConformanceSuite[];
  readonly mode: ConformanceMode;
}): Partial<Record<ConformanceSuite, BaselineLoadOutcome>> {
  const outcomes: Partial<Record<ConformanceSuite, BaselineLoadOutcome>> = {};
  for (const suite of input.suites) {
    const outcome = loadOne(input.reader, suite, input.mode);
    if (outcome !== undefined) {
      outcomes[suite] = outcome;
    }
  }
  return outcomes;
}
