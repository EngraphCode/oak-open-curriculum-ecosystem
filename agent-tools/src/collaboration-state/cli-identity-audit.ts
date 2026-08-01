import { auditCodexIdentityRecords } from './identity-audit.js';
import { required, type Options } from './cli-options.js';
import { cliIo, type CliRuntime } from './cli-runtime.js';

/**
 * Run the report-only Codex identity audit over explicit file paths and the
 * canonical comms event directory. Communication history is read from the
 * event stream, never from the rendered shared log (a generated read model).
 * All reads go through the injected runtime IO seam so the CLI boundary
 * stays hermetically testable.
 *
 * @param options - Parsed collaboration-state CLI options.
 * @param runtime - CLI runtime carrying the IO seam.
 * @returns Pretty-printed JSON audit report.
 */
export async function auditIdentity(options: Options, runtime: CliRuntime): Promise<string> {
  const io = cliIo(runtime);
  const report = auditCodexIdentityRecords({
    nowIso: required(options, 'now'),
    activeText: await io.readTextFile(required(options, 'active')),
    closedText: await io.readTextFile(required(options, 'closed')),
    threadRecordText: await io.readTextFile(required(options, 'thread-record')),
    commsEvents: await io.readCommsEvents(required(options, 'comms-dir')),
  });

  return `${JSON.stringify(report, null, 2)}\n`;
}
