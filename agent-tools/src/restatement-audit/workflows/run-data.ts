/**
 * Per-run stage data — substituted at run-artefact build time.
 *
 * @remarks
 * Mirrors `corpus-analysis/workflows/run-data.ts`: stage entries import {@link RUN_DATA}
 * and {@link RUN_DATA_STAGE} and narrow them with their stage guard. This default module
 * exports the unseeded sentinels — a stage artefact bundled without the run-data
 * substitution fails its guard immediately with a clear error and zero spend.
 *
 * @packageDocumentation
 */

/** Unseeded stage discriminant — every guard rejects it, naming the cure. */
export const RUN_DATA_STAGE = 'unseeded';

/** Unseeded sentinel — every stage guard rejects it by shape. */
export const RUN_DATA: unknown = { unseeded: true };
