# .agent/plans/ — the release-planning corpus

The minimal live planning corpus, reborn 2026-07-21 by the
[release-planning corpus reset](practice/release-planning-corpus-reset.plan.md)
(owner-commissioned). The prior estate is conserved losslessly in
[`.agent/plans-backlog-2026-07/`](../plans-backlog-2026-07/BACKLOG.md) —
nothing was lost, and the transformation of the full corpus resumes
after the first major release.

## Corpus admission rule

A plan lives in this root if and only if it conforms to the
[V0 plan-node schema](plan-node-schema.v0.md) (frontmatter-valid,
`serves_strategic_choice` resolving against the published strategy
registry). Everything else stays in the backlog until migrated. The rule
is a directory boundary: the corpus validator's scan root is this
directory, so admission is structural, not aspirational.

## Layout (V0 §3.6 folder collapse)

| Path | Holds |
|---|---|
| [`milestone-first-major-release.plan.md`](milestone-first-major-release.plan.md) | The milestone plan — the corpus root node (authored 2026-07-21, S3) |
| [`delivery/`](delivery/README.md) | Delivery-class plans: the release lanes (Clerk promotion, PostHog, packaging, quarantine) |
| [`practice/`](practice/) | Practice-class plans: how the estate works (this reset, PR-state instrumentation) |
| [`templates/`](templates/README.md) | Plan templates ([delivery](templates/delivery-plan-template.md) and [runbook](templates/runbook-plan-template.md) forms are the V0 corpus forms) |
| [`plan-node-schema.v0.md`](plan-node-schema.v0.md) | The owner-signed V0 schema — the corpus's contract |
