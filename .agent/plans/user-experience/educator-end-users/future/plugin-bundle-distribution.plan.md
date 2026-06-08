---
name: "Cross-vendor plugin bundle — package Oak's curriculum-assistance capability as a Claude + Codex plugin"
collection: user-experience
audience: educator-end-users
lane: future
status: future
type: strategic
last_updated: 2026-06-08
---

# Cross-vendor plugin bundle — Claude + Codex

> **Strategic (`future/`), benefits-led.** Owner decision (2026-06-08): Oak **will**
> package its external-facing curriculum-assistance capability as a **cross-vendor
> plugin bundle** (skills + MCP server, marketplace-distributed), shipping to
> **both Claude and Codex**, **owned in this (ecosystem) repo** because the MCP
> server lives here. This resolves **open decision #2 (packaging)** in the synthesis
> plan [`../current/external-facing-capability-distribution.plan.md`](../current/external-facing-capability-distribution.plan.md).
> This brief focuses on **benefits and user impact**; the build mechanism, vendor
> manifests, and risk detail were intentionally deferred until promotion and are
> now owned by the promoted creation plan.
>
> **Promoted (2026-06-08):** the build is now an executable plan —
> [`../current/plugin-package-creation.plan.md`](../current/plugin-package-creation.plan.md).
> This brief remains its benefits-and-rationale source; the engineering, vendor
> manifests, risk detail, validation, and completion proof live in the creation
> plan.

## Problem and intent

Oak holds the two halves of a plugin bundle — the **skills** (`oak-skills`) and an
**MCP app** (this repo's Oak Curriculum MCP server, incl. the EEF c4
`eef://interpretation` resource and c5 `adapt-lesson` prompt) — but ships them
through separate channels, so a teacher never gets the whole capability in one
install. The seed review
([`../external-facing-skills-and-mcp-surfaces-review.report.md`](../external-facing-skills-and-mcp-surfaces-review.report.md),
Part 2) verified that both Claude and Codex converged on the same shape: a plugin
is an installable bundle of `{skills + MCP server}` distributed via a marketplace,
with MCP as the common runtime.

**Intent:** state the case — the benefits and user impact — for one Oak plugin a
teacher installs once and gets the skills plus the live MCP tools together.

## Benefits and user impact

### For teachers (the primary audience)

- **One install, whole capability.** A teacher adds the Oak plugin in their agent
  (Claude or Codex) and immediately has curriculum-assistance skills *and* the live
  Oak Curriculum MCP tools/resources/prompts — no separate skill files, MCP config,
  and connector setup to assemble by hand.
- **Curriculum help where they already work.** The capability meets teachers inside
  the agent they use, not on a separate site — lesson adaptation, sequencing,
  misconception-awareness, and evidence-informed choices in the flow of planning.
- **Evidence-informed, not prescriptive.** The bundle carries the EEF surface
  (c4/c5) so suggestions come with research-graded evidence presented as options
  and trade-offs — the teacher decides; teacher-agency is preserved.
- **Trustworthy outputs.** Attribution travels with the material and produced
  artefacts meet the WCAG 2.2 AA floor by default.

### For Oak

- **One capability, both major agent ecosystems.** Reaching Claude *and* Codex from
  a single source maximises teacher reach without maintaining divergent products.
- **Coherence over drift.** Bundling skills + MCP from one source of truth removes
  the current split-channel duplication the discovery doctrine exists to prevent.
- **A real distribution surface.** A marketplace listing is a discoverable front
  door for Oak's open curriculum capability, not just an API other people must wire
  up.

### For the wider sector

- **Portable, open capability.** `SKILL.md` + MCP are vendor-neutral, so the same
  Oak capability is reusable across agents rather than locked to one vendor —
  consistent with Oak's open-curriculum mission.

## Decided (owner, 2026-06-08) — carried, not re-opened here

- **Packaging = cross-vendor plugin bundle** (resolves synthesis open decision #2).
- **Vendor scope = Claude + Codex together.**
- **Owning home = this ecosystem repo** (it holds the MCP server).

## End goal and mechanism (light — detail at promotion)

- **End goal.** A teacher installs one Oak plugin from the Claude or Codex
  marketplace and gets the agreed curriculum-assistance skills plus the live Oak
  Curriculum MCP surfaces, with attribution, teacher-agency, and the WCAG floor
  intact.
- **Mechanism (sketch).** A plugin is `{skills + MCP server}` behind a vendor
  manifest; owned here (where the MCP lives), the bundle references the deployed MCP
  and the agreed skills source, emitting both vendor manifests from one source. The
  concrete manifest shapes and build steps are finalised at promotion (vendor specs
  re-verified then; they move fast).

## Open questions carried by the creation plan (framed, not decided here)

- **Skills source** — the canonical `oak-skills`, Direction B's curated public
  mirror, or a manifest layer (shared with Direction A's `t0` topology decision and
  Direction B's WS1; resolved by the creation plan's `w0` gate before real-source
  binding).
- **First-tranche capability scope** — lesson adaptation + evidence framing are the
  strongest candidates (EEF c4/c5); the scope call is the owner's.
- **Marketplace + endpoint specifics** — submission paths for each vendor, and how
  each manifest references the deployed MCP and authenticates end users (resolved
  by the creation plan's `w0` gate before manifest implementation).

## Dependencies (creation-plan gates, not brief blocks)

This is a `future/` strategic brief retained after promotion — it builds nothing
itself, so nothing is "blocked" here. The live execution gates are owned by the
executable creation plan
([`../current/plugin-package-creation.plan.md`](../current/plugin-package-creation.plan.md)):

- **`creation-gate`** — the **skills-source** topology question must be decided
  before real-source binding in the creation plan (shared with Directions A and B).
- **`already-satisfied`** — the Oak Curriculum MCP is **deployed, reachable, and
  EEF-live** (verified 2026-06-08); a referencing bundle can function against it
  today.
- **`beneficial`** — Direction A's generator, so the two vendor manifests emit from
  one source rather than being hand-maintained.

## Strategic acceptance and success signals

- **Acceptance (this brief).** It reads true in one pass: the owner decisions are
  recorded; the benefits and user impact are stated clearly; the remaining
  questions are framed not made.
- **Success signals (post-build).** One Oak plugin installs from both the Claude and
  Codex marketplaces; installing it gives a teacher the agreed skills plus the live
  MCP surfaces in one step.

## Non-goals

- **Do not build here** — this is the retained strategic brief; the promoted
  `current/` creation plan owns the build and detailed mechanism/risk work.
- **Do not re-open the decided shape** (bundle / both-vendors / ecosystem-owned).
- **Do not duplicate** Direction A's MCP-emitter work or Direction B's skills-CLI
  distribution — the bundle **consumes** both.

## Promotion status and handoff

Promoted on 2026-06-08 to
[`../current/plugin-package-creation.plan.md`](../current/plugin-package-creation.plan.md).
The promotion intentionally moved the still-fast-moving vendor manifest specifics,
skills-source binding, authentication shape, assumptions review, and MCP review
into the creation plan's `w0` design gate. Do not treat those unresolved details as
missing promotion prerequisites in this brief; treat them as execution gates in the
current plan.

## Cross-references (authoritative homes — do not duplicate)

- Creation plan (promoted executable, `current/`): [`../current/plugin-package-creation.plan.md`](../current/plugin-package-creation.plan.md)
- Synthesis (sibling, `current/`): [`../current/external-facing-capability-distribution.plan.md`](../current/external-facing-capability-distribution.plan.md)
- Direction A — MCP skill-surfacing (sibling, `current/`): [`../current/oak-skills-ingest-and-resurfacing.plan.md`](../current/oak-skills-ingest-and-resurfacing.plan.md)
- Seed review (vendor plugin facts, Part 2): [`../external-facing-skills-and-mcp-surfaces-review.report.md`](../external-facing-skills-and-mcp-surfaces-review.report.md)
- Direction B — skills-CLI distribution (other repo): `oaknational/oak-skills` → `.agent/plans/public-distribution.plan.md`
