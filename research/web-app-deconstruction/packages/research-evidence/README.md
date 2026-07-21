# Research evidence harnesses

This package makes quantitative OWA, Oak Components, Database-Tools, oak-openapi
and OCE evidence repeatable without changing any source repository. It contains
eight kinds of probe:

- a TypeScript-checker inventory of the Components public surface and static OWA
  consumers;
- a static OWA architecture inventory covering routers, source areas, local
  dependency directions, client reachability, cycles and assurance artefacts;
- artifact, isolated tree-shaking, Node and synthetic Next App Router probes for
  OWA's installed Oak Components release;
- a Jest characterization of the curriculum export handler when materialized-view
  refresh metadata is missing;
- a dependency-free inventory of tracked OCE repository structure and selected
  committed payloads cited by the current-state map;
- a revision-exact, dependency-free inventory of the Database-Tools to
  oak-openapi to OCE contract chain, including SQL projections, resolver names,
  API/schema populations and generated-consumer entry points;
- a pinned runtime comparison of oak-openapi's generated provider document with
  OCE's committed OpenAPI cache; and
- a dependency-free validator for every pinned source line anchor in the
  OWA/Components Concept Explorer portfolio and the complete Database/API/OCE
  authority-chain research tree.

The package has no dependencies of its own. It deliberately resolves tools from
the repositories being measured so that their locked TypeScript, Jest, Next,
Rollup and Terser versions are part of the relevant evidence. Install each source
repository's locked dependencies before running those probes. The OCE inventory
uses only Node.js built-ins and Git and does not require OCE dependencies.

## Repository layout

The default checkout layout: the measured repositories are siblings of
`oak-open-curriculum-ecosystem`, and this record is the nested projection at
`oak-open-curriculum-ecosystem/research/web-app-deconstruction/` (defaults
resolve five levels up from this package to the common checkout parent).

```text
<common parent>/
|-- Oak-Web-Application/
|-- oak-components/
|-- Database-Tools/
|-- oak-openapi/
`-- oak-open-curriculum-ecosystem/
    `-- research/web-app-deconstruction/   <- this record
```

Override a source with `--owa <path>`, `--components <path>`,
`--database-tools <path>`, `--oak-openapi <path>` or `--oce <path>`, as
applicable. Defaults are resolved from this package's location, not the shell's
current directory. Every result records the source revision, package version and
whether the source worktree was clean when the run began.

## Commands

Run these from `web-app-deconstruction`:

```sh
pnpm --filter @oaknational/research-evidence inventory
pnpm --filter @oaknational/research-evidence inventory:owa-architecture
pnpm --filter @oaknational/research-evidence inventory:oce
pnpm --filter @oaknational/research-evidence inventory:database-api-chain
pnpm --filter @oaknational/research-evidence compare:openapi-oce
pnpm --filter @oaknational/research-evidence validate:concept-links
pnpm --filter @oaknational/research-evidence runtime:artifact
pnpm --filter @oaknational/research-evidence runtime:next
pnpm --filter @oaknational/research-evidence curriculum-redirect
```

Each command writes normalized JSON to standard output. To keep a raw run while
investigating, pass an ignored output path to the underlying script:

```sh
pnpm --filter @oaknational/research-evidence inventory -- \
  --output ../../.research-evidence/component-boundary.json
```

The `../../` is relative to this package because pnpm runs package scripts from
the package directory. Generated JSON is intentionally ignored: it includes
large export lists and build logs and is not a reviewed research conclusion.
Record durable observations, limitations and changes in the relevant document.
Do not commit raw output without first checking it for environment data.

The exact OCE inventory command used by the current-state map is dependency-free
and may be run directly from `web-app-deconstruction`:

```sh
pnpm exec tsx packages/research-evidence/scripts/oce-inventory.ts
```

The enclosing OCE checkout is the script's location-based default; pass
`--oce <path>` only to measure a different checkout.

It writes JSON to stdout. Add
`--output .research-evidence/oce-inventory.json` to retain an ignored local
result.

The Database-Tools, oak-openapi and OCE chain inventory is also dependency-free:

```sh
pnpm exec tsx packages/research-evidence/scripts/database-api-chain-inventory.ts
```

All three checkouts default from the script's own location (Database-Tools
and oak-openapi as siblings of the enclosing OCE checkout); pass the
`--database-tools` / `--oak-openapi` / `--oce` overrides only for
non-default layouts.

It reads Git `HEAD` trees and committed blobs. It reports worktree cleanliness
but never uses changed working-tree bytes for its measurements.

## Probe boundaries

`inventory` reads Git-tracked `src/**/*.ts(x)` files, applies the production
exclusions recorded in its JSON, and uses the Components checkout's TypeScript
checker. Its working layer classification is an explicit research model in the
script, not a repository-enforced boundary.

`inventory:owa-architecture` reads Git-tracked OWA TypeScript sources and uses
OWA's locked TypeScript parser. Its analysed population excludes test, spec,
story, mock and snapshot names/paths but retains fixture-shaped and Storybook
support files, so it is not a deployment manifest. It records route-convention
modules, Pages data lifecycles, a top-level runtime-shaped import matrix,
static client-boundary reachability from explicit `use client` roots, local
import cycles and tracked assurance artefacts. This reachability is an
upper-bound source-graph model, not a Next.js bundle or runtime measurement,
and it does not include the implicit browser graph of Pages Router entries
without that directive. Counts are structural noticers, not quality judgments.

`runtime:artifact` measures the Oak Components package installed by OWA. It uses
Rollup and Terser from the Components checkout. Bare package imports remain
external, so isolated sizes exclude React, styled-components, Next and other
peers. They are package-code probes, not browser payload measurements.

`runtime:next` stages five minimal fixtures in the operating system's temporary
directory, symlinks OWA's existing `node_modules`, and deletes the fixtures after
the builds. The two expected Server Component failures count as reproduced only
when the build fails with the recorded `createContext` signature.

`curriculum-redirect` stages the checked-in test template in a temporary
directory and invokes OWA's Jest configuration. OWA configuration currently
creates `.env.local` while loading; the harness restores the previous bytes or
removes the generated file before returning. It does not change tracked OWA
files.

`inventory:oce` asserts the OCE root package identity, records its Git revision
and clean state, and uses `git ls-files` as the file population. It resolves
pnpm workspace patterns against tracked package manifests; counts numbered ADR
and test/spec paths; sums uncompressed working-tree bytes for tracked generated
vocabulary files; parses the committed graph, Hub course and quality-standard
JSON; derives Hub routes from tracked App Router page paths; measures the
generated widget module file; and reconciles `RULES_INDEX.md` with canonical
rule files.

The OCE probe does not fetch upstream data, run code generation, execute
application schemas, establish byte-for-byte derivation from ignored bulk inputs,
measure compressed or browser payloads, inspect deployment/runtime state, or
provide user and impact evidence. Its byte counts describe current tracked
working-tree files, not filesystem allocation. Treat them as revision-exact only
when the emitted `input.clean` value is `true`.

`inventory:database-api-chain` asserts all three repository package identities,
records their revisions and clean state, and reads committed blobs at those
revisions. It classifies migrations, SQL schema-doc objects, Hasura metadata,
manual and generated schema populations, mutation routes, OpenAPI handler paths,
resolver constants and OCE generated-schema entry points. Its cross-system match
normalises parsed `schema.relation` names into Hasura's `schema_relation` form.
Regex parsing is deliberately reported as a limitation: an unparsed or unmatched
object is a prompt for inspection, not evidence that no dependency exists. It
does not connect to PostgreSQL or Hasura, fetch the live OpenAPI document, execute
handlers, establish deployed versions, or prove semantic/runtime conformance.

`compare:openapi-oce` requires clean oak-openapi and OCE checkouts. It verifies
that oak-openapi's installed pnpm lock snapshot matches the committed lockfile,
imports the pinned provider route under fixed configuration after blocking common
Node network entry points, reads OCE's cached document from its committed Git
blob, and compares canonical semantic and prose-free structural projections. It
establishes document correspondence for those projections at the two recorded
revisions. It does not execute endpoint responses, establish data or policy
correctness, prove future generator totality, provide operating-system network
isolation, or content-verify installed dependency files.

`validate:concept-links` runs the OWA/Components Concept Explorer portfolio and
the Database/API/OCE authority-chain research tree's retained public anchors.
In this public projection it requires sibling OWA, Components and OCE checkouts
whose HEAD revisions match the relevant records; pinned links into the private
Database-Tools and oak-openapi repositories were reduced to plain-text
citations (ADR-215 Decision 4), so their full anchor validation runs in the
private master and those checkouts are consumed only when supplied
explicitly. It reads
committed blobs rather than working-tree files, reports checkout cleanliness,
and verifies that each GitHub source link uses the exact revision, resolves to a
committed file and names an in-range line or line span when present. It does not
fetch GitHub, validate the prose interpretation, establish runtime
correspondence, or prove that OWA's declared Components consumer version
executes the inspected Components source revision.
