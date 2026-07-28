/**
 * Ambient module shape for `.html` imports.
 *
 * @remarks
 * esbuild inlines `.html` imports as strings via the `text` loader
 * (`build-scripts/esbuild-config.ts`); vitest mirrors the seam with the
 * scoped plugin in `vitest.config.ts`. The wildcard declaration keeps
 * `tsc` green whether or not the gitignored artefact exists on disk —
 * wildcard ambient modules resolve without touching the filesystem.
 */
declare module '*.html' {
  const html: string;
  export default html;
}
