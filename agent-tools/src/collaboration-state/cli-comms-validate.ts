import { err, unwrapOrThrow } from '@oaknational/result';

import { resolveCoordinationHomeForOptions } from './cli-coordination-home.js';
import { type Options } from './cli-options.js';
import { type CliRuntime } from './cli-runtime.js';
import {
  formatCollaborationStateIntegrityReport,
  validateCollaborationStateIntegrity,
} from './state-integrity.js';

export async function validateComms(
  options: Options,
  _env: unknown,
  runtime: CliRuntime,
): Promise<string> {
  const report = await validateCollaborationStateIntegrity({
    repoRoot: resolveCoordinationHomeForOptions(options, runtime),
  });
  const formatted = formatCollaborationStateIntegrityReport(report);
  if (report.findings.length > 0) {
    return unwrapOrThrow<never>(err(new Error(formatted.trimEnd())));
  }

  return formatted;
}
