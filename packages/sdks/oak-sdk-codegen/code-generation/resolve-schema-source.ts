/**
 * Resolve the OpenAPI schema source for code generation.
 *
 * @remarks
 * The committed schema cache is the **default** source, so a plain
 * `pnpm sdk-codegen` is hermetic and deterministic — no network, reproducible
 * from the committed cache. Refreshing from the live upstream spec is **opt-in**:
 *
 * - the `--online` CLI flag,
 * - `SDK_CODEGEN_MODE=online`, or
 * - a Vercel build (`VERCEL=1`/`true`), which always wants the freshest schema
 *   baked into the deployment.
 *
 * The former `--ci` / `SDK_CODEGEN_MODE=ci` sentinels (which meant "read the
 * cache") are retired: cached is now the default, so they are inert. Staleness
 * of the committed cache is surfaced separately by the schema-drift check.
 */
export interface SchemaSourceInput {
  /** CLI arguments passed to the codegen script (typically `process.argv.slice(2)`). */
  readonly args: readonly string[];
  /** Value of `SDK_CODEGEN_MODE`, or `undefined` when unset. */
  readonly sdkCodegenMode: string | undefined;
  /** Value of `VERCEL`, or `undefined` when unset. */
  readonly vercel: string | undefined;
}

/** The resolved schema source: the committed cache, or a live upstream fetch. */
export type SchemaSource = 'cached' | 'online';

/**
 * Decide whether codegen reads the committed cache or fetches the live upstream
 * schema. Cached is the default; online requires an explicit opt-in.
 */
export function resolveSchemaSource(input: SchemaSourceInput): SchemaSource {
  const online =
    input.args.includes('--online') ||
    input.sdkCodegenMode === 'online' ||
    input.vercel === '1' ||
    input.vercel === 'true';
  return online ? 'online' : 'cached';
}
