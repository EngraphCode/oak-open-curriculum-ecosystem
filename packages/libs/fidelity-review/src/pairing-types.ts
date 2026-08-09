/*
 * Structural pairing types — the package-boundary view of an app's
 * declared pairing map. Each app owns its zod pair schema (kinds, extra
 * fields and refinements genuinely differ per app: the hub declares a
 * section-element kind with a sectionId, the showcase does not), so the
 * schemas deliberately do NOT consolidate. The renderer consumes only
 * this structural surface, and every app's zod-inferred map type
 * satisfies it by assignability — no shared schema, no cast.
 */

/** One declared comparison pair, as the report renderer consumes it.
 *  `notes` is declared `string | undefined` because that is what a
 *  zod-inferred optional produces — the wider form stays assignable if
 *  exactOptionalPropertyTypes ever lands. */
export interface FidelityPair {
  readonly id: string;
  readonly kind: string;
  readonly exportPng: string;
  readonly livePng: string;
  readonly liveRoute: string;
  readonly notes?: string | undefined;
}

/** An app's declared pairing map, as the report renderer consumes it —
 *  which is the exempt-surfaces declaration ALONE. The per-pair data the
 *  renderer needs arrives inside each PairResult, so this boundary type
 *  deliberately omits `pairs`: apps still pass their full zod-parsed map
 *  (excess fields are fine on a variable reference), and the package
 *  never obliges them to a shape it does not read. */
export interface PairingMap {
  readonly exemptSurfaces: readonly {
    readonly route: string;
    readonly reason: string;
  }[];
}
