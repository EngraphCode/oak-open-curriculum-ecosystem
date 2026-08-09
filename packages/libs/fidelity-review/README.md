# @oaknational/fidelity-review

Shared fidelity capture/diff/report core for the demo apps, extracted
when its second consumer arrived (`consolidate-at-second-consumer`): the
curriculum hub built the mechanism; the design showcase's port (PR #834)
duplicated it, hardened it, and thereby forced this consolidation — the
hardened versions are canonical here, the hub consumes the package as of
this landing, and the showcase swaps its ported copies for these imports
as that PR completes. Each app keeps its own pairing map, capture arms,
export server, and runner CLI; this package owns the invariant
machinery.

## Modules (per-module subpath exports, no barrel)

There is deliberately no `src/index.ts`: consumers import exactly the
modules they use, and app migration diffs stay mechanical
(`'./support'` becomes `'@oaknational/fidelity-review/support'`).

- `support` — `runTool` (the tool process boundary: runs a
  Result-returning main, prints the failure, sets the exit code),
  `describeThrown`, `stripTrailing`.
- `image-diff` — `diffPngs`: pixelmatch over decoded PNGs with
  common-intersection cropping and caveat reporting. Corrupt input is a
  `Result` error, never a throw.
- `dev-server` — `ensureDevServer(base, demoDir)`: attach to a
  responding dev server or spawn `pnpm dev` in `demoDir` and wait for
  readiness. `demoDir` is a required parameter — the module must never
  guess the app root from its own location. Refuses a relative
  `npm_execpath` (PATH-lookup guard, Sonar S4036).
- `static-path-guard` — `decodeUrlPath` (malformed percent-escapes and
  embedded NULs are a decision, never a throw inside an http listener)
  and `resolveWithinRoot` (absolute-root contract, then
  canonicalise-then-prefix-check traversal guard). Security-critical
  path/IO guards; the consolidation floor of
  `consolidate-at-second-consumer` applies to this module first.
  CONTAINMENT IS LEXICAL: a symlink inside a served root is followed —
  fine for the demos' tool-generated local roots; a consumer serving a
  root that can carry untrusted symlinks must add a realpath check.
- `capture-flags` — `resolveWidth` (strict: `1440px` rejects, never
  truncates), `resolveBase(argv, env, defaultBase)`, and the
  blank-render classifier `isSuspect`. Each app supplies its own
  default base and keeps its app-specific classifiers.
- `register` — the disposition-register schema
  (`strictObject`; owner-edited JSON boundary, so unknown fields are
  rejected loudly), `parseRegister`, `GLOBAL_PAIR_ID`, `entriesForPair`,
  and `newEntryTemplate`.
- `report` — the report renderer over structural
  `FidelityPair`/`PairingMap` types (declared in the internal
  `pairing-types` module, whose header states why the apps' zod schemas
  deliberately do NOT consolidate — each app's zod-inferred map
  satisfies the structural surface by assignability). The pairing map
  is a required parameter: apps declare their own zod pair schemas and
  pass the parsed map in; this package never imports app configuration.
  (`fidelity-html`, `fidelity-report-sections`, and `pairing-types` are
  internal modules — no subpath export.) POSITIONAL
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
zod schema and pair kinds), capture arms (Playwright usage, geometry),
export servers (the hub serves one root; the showcase serves a bounded
two-root studio overlay), each app's default base constant and
app-specific classifiers (route slugging, hydration witnesses,
frame-aware render checks), and each runner CLI. The byte-identical
serve mechanics (`portOf`, content-type table, the response half of the
request handler) are a recorded follow-up consolidation (Linear
MCP-534), not a silent omission.

## Architectural decisions

- [ADR-041 — workspace structure](../../../docs/architecture/architectural-decisions/041-workspace-structure-option-a.md)
  (dated amendment 2026-08-09 classifies this package as a foundation
  lib).

## License

MIT.
