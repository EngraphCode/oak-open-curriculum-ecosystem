# ADR-215: Top-Level `research/` Surface for Imported Research Records

- **Status:** Superseded (2026-08-30)
- **Date:** 2026-07-20
- **Relates to:** [ADR-041](041-workspace-structure-option-a.md) (workspace tier
  structure — unchanged by this ADR in both its original and superseded states)

## Decision (as originally accepted)

Introduced `research/` as a top-level, out-of-band surface for imported research
records, outside the ADR-041 product dependency lattice: records self-contained,
documents preserved byte-faithfully and exempt from house prose formatting, record
code held to OCE gates, private-repository permalinks reduced to plain-text
citations resolved by a stable index in the private source repository, and only a
record's dependency-free leaf packages registered in the workspace.

## Supersession record

On 2026-08-30 the imported `web-app-deconstruction` record relocated to
[`.agent/research/innovation-kit/web-app-deconstruction/`](../../../.agent/research/innovation-kit/web-app-deconstruction/README.md)
and the top-level surface retired with it. The corpus README's preservation
boundary states what the relocation preserves and pins the exact pre-relocation
record at commit `4915fe182`. Repository tooling now treats `.agent/research/` as
the research surface.

The durable research-import pattern this decision carried — copy content
faithfully, exclude owner-directed private material, reduce private-repository
permalinks to plain-text citations with a private-source index, and keep a
record's own harness authoritative for its internal discipline — now lives in the
[research index](../../../.agent/research/README.md#importing-external-research-records).

Git history holds the full original decision text.
