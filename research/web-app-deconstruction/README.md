# web-app-deconstruction

What really makes a web app?

A turbo pnpm monorepo for research, experimentation, recording and sharing on the theme of "what makes a web app", with a particular focus on what makes an Oak web app.

This repository does not treat the current Oak Web Application as a blueprint or a refactoring target. It deconstructs OWA and Oak Components to understand what Oak needs to make possible, why each element exists, and which accumulated product, curriculum, design and engineering knowledge must survive. It then tests how the Oak Innovation Kit can provide those capabilities through simpler, idiomatic architecture and uncompromising excellence.

## Publication and private-source citations

This is the public projection of a research record whose full-fidelity master lives in Oak's private `web-app-deconstruction` repository. The projection carries the complete prose, findings, hypotheses, evidence tooling, and live permalinks into the public Oak repositories (Oak-Web-Application, oak-components, oak-open-curriculum-ecosystem).

Permalinks into Oak's two private repositories (Database-Tools, oak-openapi) are reduced here to plain-text citations, because those URLs would disclose the internal file layout of private, security-relevant code. The citing prose (file name, line range, pinned revision) is preserved so each reference stays legible. To resolve a private-source citation to its live pinned permalink, use the stable index in the private master: `web-app-deconstruction/docs/oce-projection-and-private-source-index.md` (accessible to Oak; not public). Validation of private-repo source anchors (`pnpm research:concept-links`) runs against that master, where the pinned checkouts and live links are present.

## Research record

- [Research index](./docs/README.md)
- [Research charter](./docs/research-charter.md)
- [Research practice](./docs/research-practice.md)
- [Operational continuity](./.agent/README.md)
- [Pre-OCE-move handoff](./pre-oce-move-handoff.md)
- [Ecosystem enablement model](./docs/synthesis/ecosystem-enablement.md)
- [Meta-analysis: a truer basis for Oak systems](./docs/synthesis/meta-analysis.md)
- [Capability coverage](./docs/investigations/capability-coverage.md)
- [Premise record template](./docs/investigations/premise-record-template.md)
- [Architecture option register](./docs/investigations/architecture-option-register.md)
- [Current-state system map](./docs/current-state/system-map.md)
- [Database-Tools deconstruction](./docs/current-state/database-tools/README.md)
- [OCE current-state system map](./docs/current-state/oce-system-map.md)
- [OWA and Components cross-lens synthesis](./docs/current-state/owa-components-concept-lenses/synthesis.md)
- [Concept lens portfolio](./docs/current-state/owa-components-concept-lenses/README.md)
- [Working model of an Oak product](./docs/synthesis/working-model.md)
- [Architecture hypotheses](./docs/hypotheses/README.md)
- [Investigation backlog](./docs/investigations/backlog.md)
- [Executable research evidence harnesses](./packages/research-evidence/README.md)

Claims in the research record are labelled as observed, inferred, unknown, or hypothesis. Architecture hypotheses include explicit invalidators so that the repository can record learning rather than defend an initial design.

## Prerequisites

- [Node.js](https://nodejs.org/) >= 24
- [pnpm](https://pnpm.io/) >= 11

## Getting started

Install dependencies:

```bash
pnpm install
```

## Available scripts

| Script                              | Description                                               |
| ----------------------------------- | --------------------------------------------------------- |
| `pnpm build`                        | Build all packages and apps                               |
| `pnpm check`                        | Run the complete CI research-integrity gate               |
| `pnpm dev`                          | Start all apps in development mode                        |
| `pnpm format`                       | Format repository files                                   |
| `pnpm format:check`                 | Check repository formatting                               |
| `pnpm lint`                         | Lint all packages and apps                                |
| `pnpm lint:fix`                     | Auto-fix lint issues                                      |
| `pnpm test`                         | Run all tests                                             |
| `pnpm type-check`                   | Type-check all packages and apps                          |
| `pnpm research:check`               | Verify research links, indexing, metadata and portability |
| `pnpm research:evidence:test`       | Test the dependency-free evidence tooling                 |
| `pnpm research:inventory`           | Reproduce the Components/OWA static inventory             |
| `pnpm research:oce`                 | Reproduce the OCE source and payload inventory            |
| `pnpm research:database-api-chain`  | Reproduce the database-to-OCE authority-chain inventory   |
| `pnpm research:openapi-oce`         | Compare the pinned provider and OCE OpenAPI contracts     |
| `pnpm research:components`          | Reproduce the Components artifact and Next runtime probes |
| `pnpm research:concept-links`       | Validate pinned portfolio and authority-chain anchors     |
| `pnpm research:curriculum-redirect` | Reproduce the curriculum export redirect finding          |
| `pnpm clean`                        | Remove all build artefacts and caches                     |

## Structure

```
.
|-- .agent/      # Cross-session operational continuity
|-- apps/        # Executable demonstrations and experiments
|-- docs/        # Evidence, maps, hypotheses and decisions
|-- packages/    # Shared experimental packages and tools
|-- turbo.json   # Turborepo task configuration
`-- pnpm-workspace.yaml
```

Add executable experiments under `apps/`. Put Innovation Kit capabilities under `packages/` when semantics, authority, invariants, lifecycle or assurance justify that framework boundary; an existing consumer count is not a prerequisite.
