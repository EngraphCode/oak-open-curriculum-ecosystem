/**
 * Per-run stage data — substituted at run-artefact build time.
 *
 * @remarks
 * Stage entries import {@link RUN_DATA} and narrow it with their stage guard. This
 * default module exports an unseeded sentinel: a stage artefact bundled without the
 * run-data substitution fails its guard immediately with a clear error and zero spend.
 * `build-run-artefact` substitutes this module with `export const RUN_DATA = <json>;`
 * — the checkpoint data zod-validated and stage-projected at build time, so the sandbox
 * receives exactly the data the Node-side contract approved. The transport is the
 * artefact itself: nothing rides through operator context, and the harness script size
 * cap is asserted at build.
 *
 * @packageDocumentation
 */

/** Unseeded sentinel — every stage guard rejects it by shape, naming the cure. */
export const RUN_DATA: unknown = { unseeded: true };
