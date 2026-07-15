---
name: "External-facing capability distribution — the plan corpus map"
collection: user-experience
audience: educator-end-users
lane: current
status: current
type: executable
last_updated: 2026-06-08
---

# External-facing capability distribution — corpus map

> **Executable, queued (`current/`).** This is the **corpus map** for Oak's
> external-facing curriculum-assistance capability distribution. Its deliverable
> is the minimal, coherent set of live plans that executes the owner-decided
> work, plus the residual open decisions named cleanly. Design rationale is
> recorded in
> [`../external-facing-capability-corpus-synthesis.report.md`](../external-facing-capability-corpus-synthesis.report.md).

## Problem and intent

Oak's forward intent for external-facing curriculum-assistance is now decided in
shape — pursue both distribution directions; package as a cross-vendor plugin
bundle to Claude and Codex. The remaining job is to **map the live corpus that
executes those decisions** and surface the residual open decisions that are
still the owner's call.

**Intent:** present one coherent corpus a future executor can navigate from
this map, with the decided work in executable plans and the open decisions
named cleanly.

## End goal, mechanism, and means

- **End goal.** A coherent corpus that reads true in one pass: the decided work
  has executable plans; the residual open decisions are named; a future session
  can pick the work up from this map and the indexes alone.
- **Mechanism.** This plan is the map; the executable work lives in the sibling
  plans it points to; this hub owns the map and the open decisions, nothing
  else.
- **Means.** The corpus is live and the decisions are grounded — executable
  now, with no blocking external dependency.

## Verified facts to carry (grounded first-hand 2026-06-08; re-verify platform facts at use)

- Oak holds two external-facing packagings of curriculum-assistance: the
  `oaknational/oak-skills` library (Agent Skills + a Claude plugin, a separate repo
  not edited from here) and this repo's MCP server (incl. EEF c4/c5
  `eef://interpretation` resource + `adapt-lesson` prompt).
- The **plugin bundle** is the cross-vendor packaging layer: Claude plugins and
  OpenAI Codex plugins both bundle skills + MCP via a marketplace; MCP is the
  common runtime; `SKILL.md` is the portable skill format. The OpenAI equivalent is
  the **Codex plugin** (not ChatGPT apps).
- The EEF surface is **default-ON in this repo** (commit `d3109d7c`) **and live on
  the deployed Oak Curriculum MCP** — `get-eef-evidence` is a production tool on
  `oak-prod` (verified 2026-06-08; API version 0.7.0). The earlier "deployment is
  the gate" caveat has fired: the surface is reachable in production today.
- The MCP app also carries a **legacy static `workflows` surface**
  (`toolGuidanceWorkflows`): seven hand-authored tool-orchestration recipes — an
  early skill-precursor — now **deprecated** and migrated into the generated path by
  Direction A (its t5).
- The EEF↔oak-skills reciprocal announcement splits across the repo boundary; the
  oak-skills-side half is an upstream request
  ([`reference-eef-evidence-once-live.md`](../../../upstream-feature-requests/oak-skills/reference-eef-evidence-once-live.md)).

These are current-state facts. That `oak-skills` is *currently* the external
generator is a fact; that it *remains* the canonical source is an open decision
(below), not carried here.

## The plan corpus (the map)

The minimal, coherent set that lands the decided work. Each plan owns one job;
this hub owns the map and the open decisions, nothing else.

| Plan | Lane | Owns |
|------|------|------|
| **This plan** — corpus map | `current/` | The corpus map + open decisions + index routing. No execution work of its own. |
| [`oak-skills-ingest-and-resurfacing.plan.md`](oak-skills-ingest-and-resurfacing.plan.md) — **Direction A** | `current/` | The generator path from `SKILL.md` sources into MCP-native surfaces; folds the EEF c4/c5 surfaces (t4) and migrates+deprecates the legacy `workflows` surface (t5). |
| [`plugin-package-creation.plan.md`](plugin-package-creation.plan.md) — **plugin package** | `current/` | Creating and shipping the cross-vendor plugin: emit Claude + Codex manifests from one source, reference the deployed MCP + agreed skills, clear directory-policy, prove install. Consumes Directions A and B. |
| [`app-submission-standards.plan.md`](app-submission-standards.plan.md) — **submission standards** | `current/` | App submission required standards for the Claude + OpenAI directories (governance/ADR, privacy, graph token-efficiency, tool-interface discipline); the directory-policy home referenced by the plugin package's w3. |
| [`../future/plugin-bundle-distribution.plan.md`](../future/plugin-bundle-distribution.plan.md) — bundle brief | `future/` | The benefits-led strategic rationale for the bundle; promoted into the plugin-package-creation plan, which it now feeds. |
| `oaknational/oak-skills` → `.agent/plans/public-distribution.plan.md` — **Direction B** | cross-repo | The public skills-CLI source (`npx skills add`); owned in that repo, not edited here. |

## Todos

```yaml
todos:
  - id: t2-corpus-map-and-status
    content: >-
      Keep the corpus map and the owner-decisions status current and accurate as
      the sibling plans evolve. Every forward claim is grounded first-hand (cited)
      or tagged as a named open decision. Acceptance: the map names every live plan
      and what it owns; the decided/open status matches the sibling plans; zero
      unsupported future assumptions. Validation: each map row resolves to an
      existing plan; each open decision resolves to its owning plan.
    status: pending
  - id: t5-update-indexes
    content: >-
      Keep the educator-end-users README and repo-continuity Active-threads /
      next-safe-step pointing at this hub as the external-facing-capability home,
      and the current/ and future/ README tables listing every plan in the corpus
      map. Acceptance: the indexes route to this hub and list all corpus plans; the
      next session can pick it up from the indexes alone. Validation: links resolve;
      repo-continuity names the next safe step.
    status: pending
    depends_on: [t2-corpus-map-and-status]
  - id: t6-coherence-validation
    content: >-
      Whole-corpus coherence pass: pnpm markdownlint + format + link-resolve green
      across the corpus; a one-pass internal-consistency read (no surviving
      contradictions; every forward claim grounded or decision-tagged). Acceptance:
      gates green and the corpus reads true in one pass. Validation: pnpm
      markdownlint:root + the repo link check on the touched files; self-review pass
      recorded in the closeout.
    status: pending
    depends_on: [t5-update-indexes]
```

## Owner decisions — status

1. **Pursue both distribution directions — DECIDED (2026-06-08).** Direction A —
   this repo re-surfaces `SKILL.md` capability through the MCP app
   ([`oak-skills-ingest-and-resurfacing.plan.md`](oak-skills-ingest-and-resurfacing.plan.md));
   Direction B — `oak-skills` becomes a public skills-CLI source
   (`oaknational/oak-skills` → `.agent/plans/public-distribution.plan.md`).
2. **Packaging — DECIDED: a cross-vendor plugin bundle** (skills + MCP) shipping to
   **both Claude and Codex**, owned in this repo. Rationale in
   [`../future/plugin-bundle-distribution.plan.md`](../future/plugin-bundle-distribution.plan.md);
   **now executed** by [`plugin-package-creation.plan.md`](plugin-package-creation.plan.md).
3. **Hosts/marketplaces — DECIDED: the Claude and Codex marketplaces** (via the
   plugin package). Per-vendor submission specifics are re-verified at the creation
   plan's w0.
4. **Source-of-truth topology — OPEN.** Whether the ingest/publish source is the
   canonical `oak-skills`, a curated public mirror (`oak-curriculum-skills`), or a
   manifest layer — owned by Direction A's `t0` and Direction B's WS1, and shared by
   the plugin-creation plan's w0. The one genuinely cross-cutting open decision.
5. **First-tranche capability scope — OPEN.** Lesson adaptation + evidence framing
   are the strongest candidates given the live EEF surface; the scope call is the
   owner's.

## Non-goals

- Do not re-decide the decided shape (both-directions / cross-vendor bundle /
  Claude+Codex / ecosystem-owned).
- Do not resolve the *open* decisions (#4 source-of-truth topology, #5 first-tranche
  scope) — name them; they are owned by the sibling plans / the owner.
- Do not edit `oak-skills` (separate repo; upstream requests only).
- Do not duplicate the discovery parent's layer map or the ADR-189 taxonomy.
- Do not build a generator/registry here — that is Direction A and the
  plugin-creation plan.

## Prerequisite classification

- This hub is a corpus map over live plans with no blocking external prerequisite —
  it is executable now.
- **`beneficial`** — a live check against the `oaknational/oak-skills` directory for
  count reconciliation at execution time. *Without it:* defer the count to "the live
  directory as of execution" rather than asserting a number.

## Quality gates

Per-cycle: the validation line in each todo. Whole-corpus (t6): `pnpm
markdownlint:root`, `pnpm format:root` (or staged-file equivalents), and the repo
link-resolve check on the touched files, plus a one-pass internal-consistency read.
The commit runs the full pre-commit gate.

## Acceptance / proof contract

Proof level **non-code**. Done when: the corpus map is accurate and the
decided/open status matches the sibling plans (t2); the indexes route here and
list every corpus plan (t5); and markdownlint/format/link gates are green with a
recorded one-pass coherence read (t6). Completion is the coherent corpus + the
commit, not a count.

## Risks and unknowns

| Risk / unknown | Impact | Mitigation |
| --- | --- | --- |
| Corpus map falling out of sync with sibling plans | Stale routing for future executors | t2 keeps the map current; each map row resolves to a live plan |
| Re-importing stale forward intent | Incoherence returns | t2 carries only grounded-or-decision-tagged claims |
| Platform facts drift | Vendor specifics go stale | Verified-facts block is dated; re-verify platform facts at use |

## Foundation alignment

`principles.md` (replace-don't-bridge, no special cases, YAGNI),
`testing-strategy.md` (validation-as-proof, here non-code), ADR-189 (audience-led
taxonomy), ADR-191 (deterministic data; agent reasons), ADR-125 (artefact
portability — incl. the prose-counts-drift / directory-is-authoritative clause),
the discovery parent (layer map), `consolidate-docs` supersession discipline, and
`research-outputs-name-not-make-decisions`.

## Plan-body first-principles check

Fires per [`../../../../rules/plan-body-first-principles-check.md`](../../../../rules/plan-body-first-principles-check.md):
**shape** — `current/` executable is correct: mapping a live corpus of decisions
has no blocking external dependency. **landing-path** — one docs commit producing
the coherent corpus; each todo ends markdownlint/link green. **vendor-literal** —
the verified-facts block was grounded first-hand 2026-06-08; platform specifics
are re-verified at use.

## First Question

Could it be simpler without compromising quality? **Yes — and the discipline is the
simplification.** The corpus is deliberately small: two executable code plans
(Directions A + the plugin package), one submission-standards plan, one strategic
rationale brief, one cross-repo plan, and this map. The hub owns the map and the
open decisions, nothing else.

## Readiness reviewers

`assumptions-expert` reviewed the prior draft and validated the underlying facts.
Re-dispatch a focused `assumptions-expert` pass on the corpus shape if the
dispositions surface new scope; dispatch `docs-adr-expert` if supersession
pointers touch ADR-cited content.

## Learning loop & lifecycle triggers

On completion: run `oak-consolidate-docs`; keep repo-continuity pointing at this
hub; route any durable doctrine (the capability-first / reciprocal-announcement
framing) to its permanent home if it stabilises. Lifecycle triggers per
[`../../../templates/components/lifecycle-triggers.md`](../../../templates/components/lifecycle-triggers.md).
