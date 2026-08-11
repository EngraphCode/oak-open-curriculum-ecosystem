/*
 * Target-state identity naming for surfaces that must stay clean under the
 * identity-naming ratchet (census-exact contract,
 * .agent/reports/design/pds-identity-rename/census.json): new tracked files
 * never write the outgoing brand slug, so anything keyed by identity in a
 * NEW file derives its names here instead. This module is framework-free
 * and, by construction, token-free — the pending slug is only ever reached
 * through the caller-supplied identity list (imported from its existing
 * carrier, components/useIdentity.ts), never written.
 */
import { err, ok, type Result } from '@oaknational/result';

/** The ratified target-state identity names (wow-verdict-register roster). */
export type TargetIdentity = 'oak' | 'pds' | 'emc2';

/** Identities already carrying their target name, mapped explicitly. The one
 *  identity still pending its rename is derived by exclusion below. */
const RENAMED: Readonly<Partial<Record<string, TargetIdentity>>> = {
  oak: 'oak',
  creature: 'emc2',
};

/**
 * Map every identity slug to its target-state fragment. Exactly one slug may
 * be pending a rename (it maps to `pds`); zero or several pending slugs fail
 * loud, so a later identity addition trips this boundary instead of silently
 * colliding onto `pds`. Pure — callers unwrap at module load so a drifted
 * identity list fails the import, the zod-at-module-init precedent.
 */
export function targetFragmentsFor(
  identities: readonly string[],
): Result<Readonly<Record<string, TargetIdentity>>, string> {
  const fragments: Record<string, TargetIdentity> = {};
  const pending: string[] = [];
  for (const slug of identities) {
    const renamed = RENAMED[slug];
    if (renamed === undefined) {
      pending.push(slug);
    } else {
      fragments[slug] = renamed;
    }
  }
  if (pending.length !== 1) {
    return err(
      `identities: expected exactly one identity pending its rename to pds, found ${pending.length} of ${identities.length} — update RENAMED in lib/identities.ts alongside the identity change`,
    );
  }
  const pendingSlug = pending[0];
  if (pendingSlug === undefined) {
    return err('identities: pending slug unexpectedly absent');
  }
  fragments[pendingSlug] = 'pds';
  return ok(fragments);
}
