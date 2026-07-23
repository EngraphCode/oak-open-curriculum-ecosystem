# V0 sketch corpus (2026-07-21) — archive dispositions

The V0 release-planning corpus, authored 2026-07-21 and owner-reclassified
the next day as an **unratified sketch** (executed ≠ ratified). The rebuilt
estate replaces it by **redoing its creation** from the owner-ratified
decisions (planning sitting part 1, 2026-07-22 — decisions register D23),
expressly not by iterating these files. They are conserved here as
evidence, moved by `git mv` (nothing deleted), each with its disposition
and successor:

| Artefact | Disposition | Successor |
| --- | --- | --- |
| `plan-node-schema.v0.md` | Superseded | `.agent/plans/plan-node-schema.md` (the D23 contract, authored fresh) |
| `milestone-first-major-release.plan.md` | Superseded | The Linear project milestones (named observable states; D23 makes milestones a Linear projection) + `.agent/plans/strategic/first-major-release.plan.md` |
| `delivery/clerk-production-promotion.plan.md` | Superseded at pickup | The MCP-67 lane pours a fresh delivery plan under the new schema at pickup; this content is its evidence base |
| `delivery/README.md` | Superseded | `.agent/plans/README.md` (the corpus README carries the delivery-lane convention) |
| `practice/release-planning-corpus-reset.plan.md` | Archived, executed 2026-07-21 | None — its `disposition: done` self-assessment was owner-corrected to "executed, never ratified"; conserved as the worked instance of that lesson |
| `practice/pr-state-instrumentation.plan.md` | Superseded at pickup | Delivered slice landed (PR #462); follow-ups tracked at MCP-56; a fresh plan pours if the lane reopens |
| `practice/linear-bot-identity.plan.md` | Superseded at pickup | Plan ratified via PR #467; implementation tracked at MCP-68; a fresh delivery plan pours at pickup |

## Pre-D23 authoring templates (moved 2026-07-23, MCP-120 propagation sweep)

The ADR-117-era plan-authoring templates, superseded as a set by the three
plan-node templates ([ADR-216](../../docs/architecture/architectural-decisions/216-plan-node-estate.md);
`.agent/plans/templates/README.md`). Moved by `git mv` (nothing deleted);
they instantiate the lifecycle-lane model and must not seed new plans:

| Artefact | Disposition | Successor |
| --- | --- | --- |
| `templates/active-atomic-implementation-plan-template.md` | Superseded | `delivery-plan-template.md` |
| `templates/feature-workstream-template.md` | Superseded | `delivery-plan-template.md` |
| `templates/quality-fix-plan-template.md` | Superseded | `delivery-plan-template.md` |
| `templates/adoption-rollout-plan-template.md` | Superseded | `delivery-plan-template.md` or `runbook-plan-template.md` by shape |
| `templates/team-session-plan-template.md` | Superseded | Session coordination rides comms + claims + delivery plans; no template successor |
| `templates/active-plan-index-template.md`, `current-plan-index-template.md`, `future-plan-index-template.md` | Superseded | None — lifecycle lanes and their indices are retired; delivery state is a Linear projection |
| `templates/collection-readme-template.md`, `collection-roadmap-template.md` | Superseded | None — collections are retired; the corpus README is the single index |

The `templates/components/` library remains in the live tree for now: its
files are cited as live PDR-phenotype substrate (e.g. PDR-037 →
`substrate-vs-axis-plans.md`) and by the thread-continuity surfaces whose
value-preserving migration is a separately routed lane. It is retired as
authoring doctrine (nothing references it from the D23 templates) and its
disposition completes with that migration.

The conserved pre-reset estate remains untouched in
`.agent/plans-backlog-2026-07/` (see its `BACKLOG.md`). This directory is
outside the live corpus validator's scan root by construction.
