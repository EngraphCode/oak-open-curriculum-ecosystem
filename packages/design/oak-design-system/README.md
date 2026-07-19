# @oaknational/oak-design-system

The Oak design system — a first-class part of this repository and the estate's
**design source of truth** ([ADR-213](../../../docs/architecture/architectural-decisions/213-design-system-integration-and-component-architecture.md)).

Three strict token tiers (primitives → `light-dark()` semantic roles + dialect
aliases → component tokens), a `.oak-*` class library and four compiled React
components consuming the same tier-3 tokens, five theme values
(light / dark / system / high-contrast / colour-safe) plus an independent
`data-motion` axis, print and multi-medium layers, a white-label override
contract with working counter-brand proofs, a machine-readable contrast
manifest, and a DTCG JSON export **generated from the CSS** (the CSS is the
token source; regenerate the export after any token change).

## One system, two first-class surfaces

This workspace and the Claude Design studio project ("Oak Open Curriculum
Design System") are two working surfaces of the **same** system:

- **This workspace** is the system's home: git history is its history, repo
  review gates are its review gates, and the semver `CHANGELOG.md` here is the
  consumer contract.
- **The studio** is a first-class team surface where design sessions run with
  affordances the repo lacks (live specimen rendering, the design compiler,
  in-page probes, the live contrast audit). Never a fork, never a record.

### The design-sync runbook

- **Studio → repo**: after a design session, pull the changed files (DesignSync
  reads; the studio's `HANDOFF.md`/`CHANGELOG.md` name what changed) and land
  them as a normal reviewed PR — incremental, per-component, never a wholesale
  replace.
- **Repo → studio**: before a design session, bring the studio current from
  this workspace (structural diff via `list_files`, then targeted writes).
- **Conflict rule**: git review is the merge authority. A sync never
  overwrites unreviewed repo changes; disagreements resolve in the PR, and the
  studio re-syncs from the merged result.
- Sync runs are deliberate session actions — no background automation.

## Consumption

Consult the system's own docs (`docs/consuming-nextjs.md`, the pairing guides,
`docs/wrapped-widget-a11y-checklist.md`) and ADR-213 §3 for the
component-system decision table. The public surface of this package is CSS
plus the DTCG export; the compiled React components under `components/` are
deliberately **not** exported (ADR-213 §3).

## Licensing

Code is MIT; Oak marks (name, logo, brand imagery) are **not** MIT-licensed —
see [BRANDING.md](../../../BRANDING.md) and this workspace's
[LICENSING-MANIFEST.md](LICENSING-MANIFEST.md) for the per-file-class
dispositions and the held-out classes' re-obtain path.
