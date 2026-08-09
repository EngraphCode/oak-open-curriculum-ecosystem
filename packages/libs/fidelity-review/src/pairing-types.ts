/*
 * Structural pairing types — the package-boundary view of an app's
 * declared pairing map. Each app owns its zod pair schema (kinds, extra
 * fields and refinements genuinely differ per app: the hub declares a
 * section-element kind with a sectionId, the showcase does not), so the
 * schemas deliberately do NOT consolidate. The renderer consumes only
 * this structural surface, and every app's zod-inferred map type
 * satisfies it by assignability — no shared schema, no cast.
 */

/** One declared comparison pair, as the report renderer consumes it. */
export interface FidelityPair {
  readonly id: string;
  readonly kind: string;
  readonly exportPng: string;
  readonly livePng: string;
  readonly liveRoute: string;
  readonly notes?: string;
}

/** An app's declared pairing map, as the report renderer consumes it. */
export interface PairingMap {
  readonly pairs: readonly FidelityPair[];
  readonly exemptSurfaces: readonly {
    readonly route: string;
    readonly reason: string;
  }[];
}
