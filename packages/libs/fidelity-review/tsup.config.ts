import { createLibConfig } from '../../../tsup.config.base.js';

/*
 * No src/index.ts barrel by design: the package exposes per-module subpath
 * exports (see package.json `exports`) so each consumer pulls only the
 * modules it uses and app migration diffs stay mechanical. Every subpath
 * source is therefore its own build entry.
 */
export default createLibConfig({
  entry: [
    'src/support.ts',
    'src/image-diff.ts',
    'src/dev-server.ts',
    'src/static-path-guard.ts',
    'src/fidelity-register.ts',
    'src/fidelity-report.ts',
    'src/review-helpers.ts',
  ],
});
