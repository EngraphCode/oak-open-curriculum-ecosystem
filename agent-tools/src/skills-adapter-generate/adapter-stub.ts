/**
 * The Practice-projection class marker.
 *
 * A Practice skill's source of truth lives under `.agent/skills/`; every
 * adapter stub this pipeline writes DERIVES from a canonical there and
 * records that derivation in its body as the pointer line built by
 * {@link adapterStubPointerLine}. That recorded derivation — not the
 * directory's name — is what makes an entry at a projection root a member
 * of the Practice class: names are configurable (the generation prefix is
 * a naming parameter), locations are shared with Vendor-class skills the
 * external machinery installs, but only our own emission writes a stub
 * that points home.
 *
 * The reconciliation sweep, the clear pass, and the portability
 * permission census all recognise class membership by parsing this
 * marker back ({@link parseAdapterStubPointer}). Builder and parser live
 * together here so the marker's shape has exactly one definition: a
 * change to the line's form is a change to class recognition across
 * every consumer, never a silent divergence.
 */

/**
 * Render the pointer line for an adapter stub body.
 *
 * @param canonicalRef - The canonical's path relative to
 *   `.agent/skills/` (e.g. `cognition/parallax/SKILL-CANONICAL.md`).
 * @returns The marker line recording the stub's derivation.
 */
export function adapterStubPointerLine(canonicalRef: string): string {
  return `Read and follow \`.agent/skills/${canonicalRef}\`.`;
}

/**
 * Parse the class marker from adapter-stub content.
 *
 * @param content - The full text of a `SKILL.md` found at a projection
 *   root.
 * @returns The canonical path relative to `.agent/skills/` the stub
 *   derives from, or `undefined` when the content carries no marker —
 *   which means the entry is NOT a Practice projection and is outside
 *   our tooling's jurisdiction.
 */
export function parseAdapterStubPointer(content: string): string | undefined {
  const match = /^Read and follow `\.agent\/skills\/([^`\n]+)`\.$/m.exec(content);
  return match?.[1];
}
