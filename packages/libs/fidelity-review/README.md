# @oaknational/fidelity-review

Shared fidelity capture/diff/report core for the demo apps, consolidated
at its second consumer (`consolidate-at-second-consumer`): the
curriculum hub built the mechanism, the design showcase's port hardened
it, and this package is the canonical owner of the parts both apps
share. Each app keeps its own pairing map, capture arms, export server,
and runner CLI; this package owns the invariant machinery.

## Modules (per-module subpath exports, no barrel)

There is deliberately no `src/index.ts`: consumers import exactly the
modules they use, and app migration diffs stay mechanical
(`'./support'` becomes `'@oaknational/fidelity-review/support'`).

- `support` — `runTool` (process boundary: exit codes in band),
  `describeThrown`, `stripTrailing`.
- `image-diff` — `diffPngs`: pixelmatch over decoded PNGs with
  common-intersection cropping and caveat reporting. Corrupt input is a
  `Result` error, never a throw.
- `dev-server` — `ensureDevServer(base, demoDir)`: attach to a
  responding dev server or spawn `pnpm dev` in `demoDir` and wait for
  readiness. `demoDir` is a required parameter — the module must never
  guess the app root from its own location. Refuses a relative
  `npm_execpath` (PATH-lookup guard, Sonar S4036).
- `static-path-guard` — `decodeUrlPath` (malformed percent-escapes are
  a decision, never a `URIError` inside an http listener) and
  `resolveWithinRoot` (canonicalise-then-prefix-check traversal guard).
  Security-critical path/IO guards; the consolidation floor of
  `consolidate-at-second-consumer` applies to this module first.
- `fidelity-register` — the disposition-register schema
  (`strictObject`; owner-edited JSON boundary, so unknown fields are
  rejected loudly) and `parseRegister`.
- `fidelity-report` — the report renderer over structural
  `FidelityPair`/`PairingMap` types. The pairing map is a required
  parameter: apps declare their own zod pair schemas and pass the
  parsed map in; this package never imports app configuration.
  (`fidelity-html` and `fidelity-report-sections` are internal
  renderer modules — no subpath export, no app consumers.) POSITIONAL
  CONTRACT: the internal `fromReportDir` resolves `../../<path>`, so
  every app's report directory must sit exactly two levels below its
  demo root (`demo-evidence/fidelity-report/`); moving a report dir
  means changing that resolver in the same commit.
- `review-helpers` — the app-neutral runner pieces (`loadRegister`,
  `summariseToStdout`, `writeReport`); each app composes them in its
  own `tools/fidelity-review.ts` CLI, whose flags and behaviour stay
  app-owned.

## What stays app-local, and why

Pairing maps (each app's declared comparison surface, including its own
zod schema and pair kinds), capture arms (Playwright usage, geometry,
self-checks), export servers (the hub serves one root; the showcase
serves a bounded two-root studio overlay), `capture-checks` (flag
parsing and blank-capture heuristics whose strictness the apps chose
independently), and each runner CLI. The byte-identical serve mechanics
(`portOf`, content-type table) are a recorded follow-up consolidation,
not a silent omission.
