import { type ConformanceSuite } from './types.js';

/**
 * Parsed CLI state for the `agent-tools mcp-conformance` bin — extracted
 * here with its validator so the pure validation contract is testable
 * without importing the self-executing bin module.
 */
export interface CliState {
  help: boolean;
  unattended: boolean;
  seed: boolean;
  target: string | undefined;
  suites: ConformanceSuite[];
  credentialsFile: string | undefined;
  reportDir: string | undefined;
  baselineDir: string | undefined;
  suiteErrors: string[];
}

/**
 * The credentials-file rules, separated from the structural checks: the
 * unattended plan is credential-free, and the oauth suite never consumes
 * credentials (its argv carries no --credentials-file; the suite drives
 * its own DCR flow), so an oauth-only invocation with the flag would
 * silently drop it — refuse loudly instead. Mixed suite sets keep the
 * flag: protocol/apps consume it.
 */
function validateCredentialsUsage(state: CliState): string | undefined {
  if (state.credentialsFile === undefined) {
    return undefined;
  }
  if (state.unattended) {
    return '--unattended forbids --credentials-file (the unattended plan is credential-free by definition)';
  }
  if (state.suites.length > 0 && state.suites.every((suite) => suite === 'oauth')) {
    return '--credentials-file is not consumed by the oauth suite — drop the flag, or include a suite that uses it (protocol | apps)';
  }
  return undefined;
}

/**
 * Validates the scanned CLI state, returning the bare refusal reason (no
 * usage text — the bin appends its help text at the print site) or
 * undefined when the state is runnable.
 */
export function validateCliState(state: CliState): string | undefined {
  if (state.suiteErrors.length > 0) {
    return state.suiteErrors.join('; ');
  }
  const duplicates = [...new Set(state.suites.filter((s, i) => state.suites.indexOf(s) !== i))];
  if (duplicates.length > 0) {
    return `duplicate --suite value(s): ${duplicates.join(', ')} — each suite runs once and writes one <suite>.json raw report`;
  }
  if (state.target === undefined || state.target.trim() === '') {
    return '--target is required';
  }
  return validateCredentialsUsage(state);
}
