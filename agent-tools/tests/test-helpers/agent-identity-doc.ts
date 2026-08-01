/**
 * Real-IO loader for the committed agent-identity doc: the doc ITSELF is the
 * fixture for the visual-disambiguator docs-drift test, which pins the
 * generated example block against the live renderer. Lives in `test-helpers/`
 * per the no-real-io-in-tests structural allowlist — real IO performed on
 * behalf of tests belongs on a helper surface, not the `.test.ts` import
 * surface. The doc is resolved relative to this file (same package), so a
 * worktree run can never read another checkout's copy.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const DOC_URL = new URL('../../docs/agent-identity.md', import.meta.url);

export function readAgentIdentityDoc(): string {
  return readFileSync(fileURLToPath(DOC_URL), 'utf8');
}
