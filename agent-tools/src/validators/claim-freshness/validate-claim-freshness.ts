import fs from 'node:fs/promises';
import path from 'node:path';

import { isJsonObject } from '../../core/json.js';
import { resolveRepoRoot } from '../../core/repo-root.js';
import { writeLine, writeErrorLine } from '../../core/terminal-output.js';

import {
  decideFreshnessOutcome,
  findFreshnessFindings,
} from './validate-claim-freshness-helpers.js';

/**
 * Standalone validator for the perishable-claim freshness contract (ADR-223)
 * over registered surfaces. Deterministic and clock-free: it enforces only
 * completeness and integrity of the freshness metadata (`grounded_at`,
 * `pinned_to`, `review_by`) — defects in the record being edited. Expiry,
 * null-pin obligations, and pin drift are session-open concerns owned by the
 * `check-claim-freshness` drift instrument, never by this gate.
 *
 * Wired into root `repo-validators:check`, so it runs on every pre-commit,
 * pre-push, and CI run alongside the sibling validators.
 *
 * @packageDocumentation
 */

/**
 * The registered perishable surfaces and their risk-classified review-interval
 * ceilings (referent hazard × reliance impact — ADR-223). Adding a surface is
 * a reviewed change to this list.
 */
const REGISTERED_SURFACES = [
  {
    id: '.agent/hooks/policy.json platform_support',
    policyPath: '.agent/hooks/policy.json',
    /** Fast-referent × high-reliance: the 30-day owner-ruled ceiling. */
    maxIntervalDays: 30,
  },
] as const;

const repoRoot = resolveRepoRoot(import.meta.url);

/** Extract `platform_support` from parsed policy, or undefined. */
function platformSupportFrom(policy: unknown): unknown {
  return isJsonObject(policy) ? policy.platform_support : undefined;
}

async function main(): Promise<void> {
  let failed = false;
  for (const surface of REGISTERED_SURFACES) {
    const filePath = path.join(repoRoot, surface.policyPath);
    const parsed: unknown = JSON.parse(await fs.readFile(filePath, 'utf8'));
    const findings = findFreshnessFindings(platformSupportFrom(parsed), surface.maxIntervalDays);
    const outcome = decideFreshnessOutcome(findings);
    if (outcome.exitCode !== 0) {
      failed = true;
      writeErrorLine(
        `validate-claim-freshness: freshness-metadata integrity check failed for ${surface.id}:\n\n` +
          `${outcome.reportLines.join('\n')}\n\n` +
          `Every claim on a registered perishable surface carries grounded_at (the date it was last ` +
          `verified first-hand), pinned_to (the version verified against, or null for explicitly ` +
          `unverified — PDR-133 §8), and review_by (at most ${String(surface.maxIntervalDays)} days ` +
          `after grounded_at for this surface). See ADR-223 and .agent/hooks/README.md. Expired ` +
          `claims never fail this gate — re-verification obligations surface at session open.`,
      );
    }
  }
  if (!failed) {
    writeLine(
      'validate-claim-freshness: OK (every registered perishable claim carries complete, ' +
        'well-formed freshness metadata within its surface ceiling)',
    );
    return;
  }
  process.exit(1);
}

await main();
