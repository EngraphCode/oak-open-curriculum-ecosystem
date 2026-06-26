# @oaknational/safe-path

Path-containment guard for the monorepo. `assertPathWithinBase(candidate, baseDir)`
canonicalises both paths with `realpathSync` — resolving `..` segments **and**
symlinks, unlike `path.resolve` — and asserts the candidate resolves inside the
base, returning the canonical contained path for safe use.

Use it to guard filesystem sinks against path-injection from caller-influenced
input (for example a value taken from `process.argv`).

## Usage

```ts
import { assertPathWithinBase } from '@oaknational/safe-path';

const safe = assertPathWithinBase(untrustedPath, baseDir);
const contents = readFileSync(safe, 'utf-8');
```

Single source of truth: consumed by `@oaknational/agent-tools` and the
`oak-search-cli` app. The injectable `realpath` seam keeps tests off real IO.
