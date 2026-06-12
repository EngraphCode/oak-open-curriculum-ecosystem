---
fitness_line_target: 400
fitness_line_limit: 525
fitness_char_limit: 35000
fitness_line_length: 100
fitness_content_role: reference
overflow_disposition: 'leave-if-live; else conserve-insight-and-delete — never archive/split/rotate/shard (see continuity-practice.md §Disposition of Continuity Surfaces)'
merge_class: index-narrative-tables
---

# Repo Continuity

Repo-level operational index for active thread state. Historical session-close
prose is archived under [`archive/`](archive/), with the latest pre-compaction
source snapshot preserved at
[`archive/repo-continuity-current-state-2026-05-31-foamy-docs-consolidation.md`](archive/repo-continuity-current-state-2026-05-31-foamy-docs-consolidation.md).
Detailed lane histories live in thread records, curator reports, completed
plans, and prior continuity archives; this file should stay a compact pickup
surface.

## Current State

- **OWNER ROADMAP AFTER THE COMMS RESEARCH (owner direction in-session 2026-06-12, sequenced
  "not all at once"; Director Firefly seeks Temper / `ce44ae` recording).** Next dispatch is
  the comms-corpus research session
  ([opener](../../prompts/agentic-engineering/comms-corpus-research-session.prompt.md) →
  [plan](../../plans/agent-tooling/current/comms-corpus-research-and-rotation-strategy.plan.md),
  readiness-reviewed READY-WITH-AMENDMENTS, amendments applied; owner gate: mark ready).
  Queued behind it, owner-named: (1) organise the research's follow-ons; (2) complete naming
  v3 (shape decision input:
  [sample sheets + maths](../../reports/agentic-engineering/naming-v3-shape-sample-sheets-2026-06-12.md);
  era-pinning cure lands FIRST — Director ruling 10cb3a10); (3) protocols/skills for examining
  production issues in Sentry; (4) organise the Sentry logging improvements those discoveries
  will surface; (5) refine the PostHog plan (home:
  [`mcp-product-analytics` thread](threads/mcp-product-analytics.next-session.md));
  (6) begin planning integration of the oak api repo into this ecosystem repo;
  (7) EEF data unexploited-value: initial gap research landed at
  [`eef-data-surfacing-gap-research-2026-06-12.md`](../../plans/sector-engagement/eef/reference/eef-data-surfacing-gap-research-2026-06-12.md)
  — organise its follow-ons; (8) identify high-impact graphs latent in the bulk data not yet
  extracted; (9) apply the new graph-tool capabilities to the Oak curriculum-ontology repo
  contents (formerly Oak knowledge graphs; sibling checkout `oak-curriculum-ontology`);
  (10) build out React MCP-app capabilities via a user-facing search experience that fully
  shows off hybrid semantic search — update the search-experience intent in the
  [08-experience-surfaces cluster](../../plans/semantic-search/future/08-experience-surfaces-and-extensions/README.md)
  and integrate it into the active
  [`mcp-app-extension-migration.plan.md`](../../plans/sdk-and-mcp-enhancements/active/mcp-app-extension-migration.plan.md)
  WS3 rebuild (this roadmap item is that intent's owner-agreed gate);
  (11) keep the plan discovery surfaces current (`plans/README.md`, `high-level-plan.md`,
  `good-first-issues.md`, `completed-plans.md`) and analyse `plans/notes/` for useful
  substance then retire it. **NAMING v3 SHAPE DECIDED: C (noun + agentive), owner
  2026-06-12** — recorded in the
  [sample-sheets artefact](../../reports/agentic-engineering/naming-v3-shape-sample-sheets-2026-06-12.md);
  sequence stays era-pinning cure → C wordlist curation (full v2 gates, ~120 agentives) → v3
  registry entry. **Comms research dispatch RELEASED by owner (2026-06-12), gated only on
  this team session's closeout.** The 2026-06-11/12 handover-team arc itself is COMPLETE:
  both lanes landed (#189–#194), both implementers closed out cleanly; the coordination
  branch's continuity bundle MERGED to main as PR #195 (`063b2d43a`).

- **TRACK-G COMPLETE + CURED — graph implementation team, seventh Director (2026-06-11).**
  Live NOW: **Iridescent Threading Constellation (`f9454b`, Fable 5) is the Director**
  (seventh holder; PDR-064 Moment 2 at ~11:16Z 06-11, event `3985ce20` on Sunlit's Moment-1
  `9c8326a1`; Sunlit closed out zero-retained, closeout `7ad83f44`; coordination home =
  primary checkout, branch `docs/graph-team-direction-2026-06-10`). **TRACK-G COMPLETE IN
  FULL — G4b PR #173 MERGED `c868bb52e` 10:33Z** (get-keyword-graph owner-signed-off; four
  seat holders through three clean PDR-063 rotations; plan g4 todo completed; the re-proof
  has since RECORDED the G4b determination: NOT on the EEF path, no signal). **ARC
  reliability DISSOLVED in full** (all duties discharged: #169/#170/#172 + ARC synthesis #174
  `6340c595b` + item-5 #175 `5310d1e4e`; residue = PR #176 conservation [Hushed shepherding]
  plus Hushed's team closeout; follow-on (b) trigger-gated). MERGED across the arc: S1 #152,
  G1a #153, #154, S2 #155, U1 #156, comms-watch #157, G4a #158, resync #159, turbo-env #160,
  **G1b #161, G2 #163, G3 #164, year-axis re-chain #165, S3 #162** (`curriculum-mapping`
  owner-approved), fifth directorship #166–#170 + origin/main merged into the coordination
  home (`ae1802da1`, Q-008 resolved) — all three whole-corpus graph tools are
  anchored+bounded on the one-graph corpus, the factory is retired, the falsified
  within-thread-ordering premise is cured end-to-end, and **all eef-revalidation signals are
  raised**. **SESSION ARC COMPLETE (14:30Z 06-11)**: the re-proof EXECUTED (#177, value path
  INTACT), the multiplicity dedup landed (#180, corpus v1.4.0), the seventh prompt live as
  `continue-progression` (#178) with w2-c1 alignment (#181) and todo flips (#182), the
  loop-hygiene rule amendment (#183, curation-lane drafted), and the **session operations +
  experience report on main** —
  [`graph-team-session-operations-and-experience-2026-06-10-11.md`](../../reports/graph-team-session-operations-and-experience-2026-06-10-11.md)
  (owner-directed; substrate-under-load findings + tooling considerations; the predecessor
  witness-synthesis carried to main alongside it). All implementer seats closed zero-retained;
  live at this writing: the seventh Director + the Pearly Snorkelling Compass doctrine-curation
  lane (claim `d24e22f7`, write-lane grant `c8432d36`). Open owner items: principles-prompt
  attribution validation (gates the owner-pinned S3 principles follow-on, plan s3 todo);
  bulk-export-lags-live (hold as-is, owner 06-11); output-schemas execution routing (gate
  satisfied — see its entry below). Authority: the graph plan's todos + the eef thread record
  (seventh-holder entry). **SESSION AT REST (16:12Z 06-11)**: the host-DOS safety rule
  (#185, owner max-severity), the team-opener generalisation exploration plan (#186), and the
  dedicated consolidation (Thermal: ADR-195/196/197 + working-with-graphs skill + PDR
  amendments + register drain, three push-proven waves through `0a32ea36d`, zero-retained) all
  landed; zero open PRs; the seventh directorship closes at this waypoint with no successor
  (team dissolved cleanly). **Next safe step** (no live agent; register + plan statuses are the
  pickup surface): the Director-queue agent-tools lanes (control-byte gate-check, CLI
  relative-path hardening, comms-reply prefix resolution, watcher-non-exit fix, comms-store
  scalability); the approved-unauthored Core amendment queue (register-recorded; next dedicated
  session authors without re-asking); the generalisation plan's x5 owner walk; w3-c1 + S3
  principles + next product tranche (observed alpha use) at owner direction.
- **GRAPH-TOOLS READINESS → 🟢 DECISION-COMPLETE (2026-06-09, Fragrant Spreading Sapling
  `47f78a`) — since EXECUTED in full (see the TRACK-G entry above).** The owner overturned the
  crude Step-0 split ("find the real membranes"); the seam analysis
  [`graph-tools-readiness-seam-analysis-2026-06-09.md`](../../reports/graph-tools-readiness-seam-analysis-2026-06-09.md)
  produced the owner-ratified deliverables map (S1/S2/S3, G1–G4, U1), the settled mechanisms
  (new `./graph-corpus` subpath; per-view `GraphView`, no substrate change; factory deleted at
  G3), and the pinned data facts; the plan's `get-keywords` bulk-corpus claim was FALSIFIED
  (live-API pass-through with narrowing params; owner disposition added U1 + G4). Detail and
  authority live in
  [`graph-tools-value-redesign.plan.md`](../../plans/connecting-oak-resources/knowledge-graph-integration/current/graph-tools-value-redesign.plan.md)
  (frontmatter todos + §Cycles and proof contract) and the merged readiness arc PRs #143–#148
  (incl. the indefinite-deferral trip-list, v1.18.0). Team shape (owner-ratified 2026-06-10):
  Director + Opus implementers in per-session worktrees; opener =
  [`graph-implementation-team.prompt.md`](../../prompts/connecting-oak-resources/graph-implementation-team.prompt.md).
- **A-i/C REVIEWS + GRAPH-TOOLS PROMOTION (2026-06-09, Brazen Roasting Cinder `527005`; PR
  #142 MERGED → v1.17.0).** The five deferred specialist reviews ran, every finding
  adjudicated first-hand (code/types/tests SOUND; verified findings landed);
  `graph-tools-value-redesign.plan.md` PROMOTED future/→current/ (owner-decided). Skills §C
  licence framing (content is Oak's; preserve external-research attribution; `oak-brand` out,
  `oak-tone-of-voice` open) is carried in the plan's S3 deliverable.
- **OUTPUT-SCHEMAS PLAN — 🟢 DECISION-COMPLETE (owner-ratified 2026-06-09).**
  [`output-schemas-for-mcp-tools.plan.md`](../../plans/sdk-and-mcp-enhancements/current/output-schemas-for-mcp-tools.plan.md):
  every MCP tool's `outputSchema` = `composeEnvelopeSchema(payloadSchema)`, payload Zod
  derived at the one source of truth per provenance; `composeEnvelopeSchema` lives in
  `oak-sdk-codegen`; the EEF tie is type-level, never `satisfies`-on-value. Its named
  execution gate — the graph-tools mechanism settle — has since SETTLED and executed
  (TRACK-G); execution routing is now an open Director/owner call. Cross-cutting: auto-memory
  `project_specialist_agent_design_overhaul` — verify every load-bearing specialist claim
  first-hand until the overhaul lands.
- **EXTERNAL-FACING CAPABILITY CORPUS — merged (PR #140 → v1.16.1).** The
  [`external-facing-capability-distribution.plan.md`](../../plans/user-experience/educator-end-users/current/external-facing-capability-distribution.plan.md)
  corpus map is live (Direction A; plugin-package-creation; app-submission-standards;
  `future/` bundle brief; cross-repo Direction B). **Open owner decisions:** source-of-truth
  topology (#4) and first-tranche capability scope (#5). **Next safe step:** execute Direction
  A `t0` / plugin-package `w0` design gates once the owner resolves #4/#5.
- **EEF build arc (D0–D7) DELIVERED + SHIPPED (v1.16.0, 2026-06-08).** `get-eef-evidence` is
  live by default at `curriculum-mcp-alpha.oaknational.dev` (kill-switch flag, default ON;
  ADR-193 boundary holds). Potential teacher value proven by release-and-observe (owner
  2026-06-08); delivered-value stays with
  [`eef-outcome-evaluation-infrastructure.plan.md`](../../plans/sector-engagement/eef/future/eef-outcome-evaluation-infrastructure.plan.md).
  Full arc: the [`eef` record][eef].
- **OAK-PROD MCP SNAGGING (2026-06-11 evening, Dawnlit Glimmering Orbit `50c2d1`) — write-up
  landed, fixes deferred by owner direction (next agent will not be a Cursor instance).**
  The live oak-prod MCP was exercised end-to-end (graph tools doctrine-clean, no soft stubs);
  the one material finding — the ratified `content: []` + structuredContent-only
  `get-eef-evidence` success is fully invisible to the Cursor agent harness — is pinned with
  proof, replay recipe, and Cursor-specifics in
  [`oak-prod-mcp-cursor-visibility-writeup-2026-06-11.md`](../../reports/oak-prod-mcp-cursor-visibility-writeup-2026-06-11.md);
  the tracker is the
  [snag register](../../plans/sdk-and-mcp-enhancements/current/oak-prod-mcp-snagging-2026-06-11.plan.md)
  (S0 non-Cursor client probe → S1 owner decision; S2–S5 queued). First-wave evidence
  (verification record) is on branch `docs/graph-team-direction-2026-06-10` (`ae5372e2c`).
  **Next safe step**: run S0 per the write-up §6 replay recipe, then put S1 to the owner.
  Deep consolidation status: not due — session captures routed to permanent homes (write-up,
  snag register, thread record); a dedicated consolidation ran earlier today (Thermal).
- **AGENT NAMING LANE (2026-06-12, Moss weaves Blossom `10438c`) — landed and closed.**
  PR #189 merged (`289b3e036`): versioned naming-schema registry, v1 era frozen, NVN v2 active,
  ADR-198, `naming_schema_version` provenance. Plan archived (PR #194, `9a74eefd1`); full arc in
  the [completed plan](../../plans/agent-tooling/archive/completed/agent-naming-schema-v2.plan.md)
  and handoff record `2a080642-naming-lane-handoff.md`. **Next safe step**: author the
  era-pinning cure plan — hooks pin `OAK_AGENT_NAMING_SCHEMA_ID`, not the rendered name; cures
  the one-seed-two-names P1 (diagnosis accepted 2026-06-12, comms 75696ec5) and the
  `"override"` provenance mis-record; prerequisite for any v3 schema activation (owner is
  exploring v3 shapes — four sample sheets + Zephyr's column-allocation maths in comms).
  Own claim + owner-informed-pre-execution per Director conditions (comms 10cb3a10 ruling 3).
- **DFE DATA SDK SEED + EEF GAP-RESEARCH SESSION CLOSED (2026-06-12, Forge turns Basalt
  `c4b882`).** Three artefacts: the EEF surfacing-gap research report (roadmap item 7 above;
  committed by the Director, `32bcd9d1b`), the
  [DfE data SDK strategic seed](../../plans/sector-engagement/future/dfe-data-sdk.plan.md)
  (+ future-lane README row; assumptions-expert verdict sound-with-amendments, all amendments
  applied), and the owner-commissioned
  [Oak×EEF executive briefing](../../plans/sector-engagement/eef/reference/oak-eef-executive-briefing-2026-06-12.md)
  (standalone C-suite companion to the research; the partnership-asks outreach vehicle).
  Seed + briefing are working-tree edits, uncommitted at close by design — handoff does not
  commit. Session-close `pnpm check` GREEN (exit 0, zero warnings, full-log verified);
  doc-only edits after the run are markdownlint+prettier-clean individually. ARC coordination
  with Firefly seeks Temper opened per owner direction (channel + directed announce
  `596fcb9a`, deadline-and-default declared; Firefly dark at open). Seed substance: thin transport-agnostic SDK over the DfE Explore
  Education Statistics public API (Beta, anonymous, OpenAPI-documented, OGL v3.0);
  COMPLEMENTARY to the EEF corpus, never a replacement (owner posture 2026-06-12); workspace
  language TypeScript-or-Python is a named promotion-time decision (owner authorised Python +
  sketched the integration shape; all named tooling illustrative only — deep critical
  analysis before choices). Promotion gate: a named Oak consumer with a ratified value
  statement. **Next safe step**: owner roadmap item 7 (organise the EEF research follow-ons —
  report §8 carries the ten unowned items); the seed waits on its promotion gate. Deep
  consolidation status: due — `napkin.md` is over its fitness line limit (386 > 300) after
  the 2026-06-11/12 multi-team capture window; rotation/convergence is a deliberate
  next-session curation pass, not bounded for this closeout (this session's own captures are
  routed: report, seed, thread records, napkin).
- **Current product focus**: `eef` graph-tooling rebuild is the only active product lane. The
  `agentic-engineering-enhancements` activity is a temporary knowledge-curation lane — its live
  WS1→2b→2c→WS2 feedback-mechanism work lives in its thread record, not a product thread.
- **Collaboration-state lifecycle**: `.agent/state/` files are live signal
  sources, not long-term documentation. Outside explicit owner-gated research
  windows, process useful substance into memory/docs/plans and clear stale state.

## Active Threads

A **thread** is the continuity unit. Full identity tables and lane state live in
each thread record; this table is the repo-level index.

| Thread | Purpose | Record | Latest identity |
| --- | --- | --- | --- |
| `eef` | EEF graph-tooling rebuild | [record][eef] | claude-code / Fable 5 / Forge turns Basalt / eef-data-surfacing-gap-research / 2026-06-12, claude / Fable 5 / Cosmos turns Equinox / snagging-execution-successor-pickup (handoff record 7fb69812; arc landed #190/#191/#192/#193, closed out) / 2026-06-12, claude / Fable 5 / Dusky Passing Mist / snagging-execution-token-metric-pr190-eef-dual-shape-then-midcycle-handoff (retired) / 2026-06-11, cursor / Fable 5 / Dawnlit Glimmering Orbit / oak-prod-live-mcp-exercise-snagging-and-cursor-visibility-writeup / 2026-06-11 (NOTE: this branch lags the eef arc — TRACK-G completion + the seventh directorship live on branch `docs/graph-team-direction-2026-06-10`; reconcile on merge; prior: claude / Fable 5 / Fragrant Spreading Sapling graph-plan-readiness-seam-analysis-and-decision-complete 2026-06-10, Brazen Roasting Cinder aic-deferred-reviews-and-graph-tools-plan-promotion 2026-06-09, Incandescent Smouldering Brazier post-d7-answertype-headline-adr194-and-output-schema-integration 2026-06-09, Briny Charting Lagoon d6-completion-and-live-exercise 2026-06-08, Lanternlit Shrouding Raven c4-c5-reflection-and-attribution-fix 2026-06-08, Luminous Drifting Dawn c6-tool-gating-fix 2026-06-08, Evergreen Blossoming Copse adr-193-vendor-boundary-and-egress-membrane 2026-06-08, Pelagic Charting Rudder c1-c3-authoring-and-strict-type-flow 2026-06-07, Hidden Prowling Owl c1-finite-domain-prereq-and-type-widening-doctrine 2026-06-07, Arboreal Shedding Canopy d6-reshape-and-phase-e-handoff 2026-06-07, Moonlit Orbiting Moon d6-execution-reshaped 2026-06-07, Zephyrous Kiting Squall d6-readiness-regrounding 2026-06-06, Floating Darting Cloud d7-golive-plan-edit 2026-06-06, Dusky Dimming Candle author-d6-execution-plan 2026-06-06, Masked Creeping Lantern eef-deep-review-resolutions-adr191 2026-06-05, Dim Dimming Threshold eef-d5-execution 2026-06-05, Prismatic Twinkling Planet eef-d5-fresh-dual-review 2026-06-04, Windward Gliding Squall eef-d5-plan-authoring 2026-06-04, Shadowed Creeping Secret eef-d4-ratify 2026-06-04, Burnished Glowing Spark 2026-06-04, Lacustrine Swimming Beacon 2026-06-03, Seaworthy Swimming Sextant 2026-06-03, Galactic Glowing Prism + Opalescent Cascading Planet + Stellar Waning Planet + Silvered Lurking Mask 2026-06-02), claude / Fable 5 / Sunlit Waxing Asteroid / graph-implementation-director-sixth-holder / 2026-06-11, claude / Fable 5 / Cindery Forging Volcano / g4b-implementer-third-seat-holder / 2026-06-11 (full prior-identity history: the thread record identity table) |
| `oak-kg-ontology-planning-review` | Plan the `oak-kg`/ontology work, starting with a deep review of the Oak Curriculum Ontology repo (separate concern from the bulk-derived graph redesign) | [record][oak-kg-ontology] | claude / Opus 4.8 / Twilit Cascading Supernova / thread-opener-brief-only / 2026-06-04 — **opened, not started; deep review is a fresh session** |
| `agentic-mechanisms-discovery` | Web-based agent discovery mechanisms for Oak data and tools | [record][agentic-mechanisms-discovery] | claude / Opus 4.8 / Zephyrous Buffeting Falcon / skills-lane-relocated-to-educator-end-users / 2026-06-08 (prior: Blustery Lifting Gale skills-taxonomy-and-distribution 2026-06-03, Umbral Whispering Silhouette 2026-06-01) |
| `agentic-engineering-enhancements` | Practice continuity and temporary curation | [record][agentic] | claude / Fable 5 / Thermal Circling Updraft / dedicated-consolidation-owner-walk / 2026-06-11 (prior: Arboreal Swaying Thicket dedicated-knowledge-curation 2026-06-11, Fruited Twining Canopy dedicated-knowledge-curation 2026-06-09, Coppery Crackling Crucible pending-graduations-drain-and-pdr-091 2026-06-08, Cosmic Illuminating Planet dedicated-continuity-surface-consolidation 2026-06-08, Lofty Spiralling Plume continuity-surface-fitness-and-prose-awareness 2026-06-08, Briny Plumbing Beacon feedback-mechanism-follow-ons 2026-06-07, Eclipsed Watching Veil items-4+1 2026-06-07, Glittering Weaving Comet 2026-06-07, Volcanic Blazing Magma 2026-06-06, Lanternlit Passing Mask 2026-06-05, Hidden Hiding Dusk 2026-06-04, Arboreal Sprouting Branch 2026-06-04, Opalescent Illuminating Prism 2026-06-03, Lacustrine Swimming Beacon, Ashen Burning Magma, Solar Glowing Meteor, Stratospheric Buffeting Breeze, Lofty Sweeping Falcon, Shaded Veiling Mirror) |
| `repo-professionalism-assessment` | Repo professionalism / engineering-quality report → planability triage | [record][repo-professionalism-assessment] | codex / GPT-5 / Airy Whirling Wing / report-author-and-planability-router / 2026-06-03 |
| `school-data-search` | Oak School Data Search service (POC MVP): briefs → report → plan → gate walk → **deep review complete** → build | [record][school-data-search] | claude / Opus 4.8 / Fiery Sparking Caldera / deep-review-and-refinement / 2026-06-04 (prior: Mossy Whispering Bark 2026-06-04, Furnace Roasting Brazier + Hushed Lurking Mask 2026-06-03) |
| `semantic-search` | Search data foundations: upstream-schema alignment, bulk sourcing, minimal-adaptation arc | [record][semantic-search] | claude / Opus 4.8 / Moonlit Waxing Nebula / upstream-realignment-specialist / 2026-06-03 |

## Paused Threads

Paused threads retain their next-session records and identity history; they are
not the current session-priority lane. Reactivation is owner-directed.

| Thread | Purpose | Record | Latest identity |
| --- | --- | --- | --- |
| `connecting-oak-resources` | Oak resource graph substrate for EEF | [record][connecting] | claude / Opus 4.8 / Galactic Glowing Prism / jc4-plan-authoring (kg collection) / 2026-06-02 (prior: Opalescent Cascading Planet, Stellar Waning Planet, Silvered Lurking Mask, all 2026-06-02) |
| `branch-fitness-and-push-cadence` | Small-PR, push-often, branch-fitness, PR/Sonar protocol substrate | [record][branch-fitness] | Pelagic Snorkelling Sextant / codex / GPT-5 / Cycle 1 substrate capture / 2026-05-24 |
| `mcp-product-analytics` | MCP product analytics design and Path-to-GA Programme | [record][mcp-analytics] | Stellar Glowing Satellite / claude / claude-opus-4-7 / Programme landed + amendments / 2026-05-26 |
| `observability-sentry-otel` | Sentry/OTel integration | [record][observability] | Umbral Creeping Night / claude-code / opus-4.7 / 2026-05-10 |
| `main-critical-sonar-remediation` | Sonar remediation | [record][main-critical] | Stormy / claude-code / 2026-05-06 |
| `exploring-open-education-resources` | Third-party OER | [record][oer] | Gnarled / claude-code / 2026-05-01 |
| `sector-engagement` | External adoption | [record][sector] | claude-code / Fable 5 / Forge turns Basalt / dfe-data-sdk-seed-authoring / 2026-06-12 (prior: Squally / cursor / 2026-04-30) |
| `architectural-budget-system` | Architectural budget | [record][budget] | Nebulous / codex / 2026-04-29 |
| `cloudflare-mcp-security-and-token-economy-plans` | Cloudflare MCP | [record][cloudflare] | Glassy / codex / 2026-04-28 |
| `agent-collaboration-research` | Comms-corpus pattern research | [record][collab-research] | claude / Fable 5 / Firefly seeks Temper / record-deep-dive + companion-plan + dispatch-released (research READY FOR DISPATCH, owner 2026-06-12; standalone session via the opener prompt) / 2026-06-12, claude / claude-opus-4-8 / Twilit Orbiting Satellite / routing-sunset execution / 2026-05-29 |

## Next Safe Steps

### School Data Search

All nine owner gates decided 2026-06-04, plus a high-stakes verification pass
(reopened/resolved three: G-1 F-C→F-B; G-6 NI register + Scotland geospatial;
coordinates dropped). **Deep review complete (2026-06-04, Fiery Sparking
Caldera): sound, faithful, build-ready** — refinements committed `1839e9b8`
(WS9 reuses `@oaknational/logger` stdio-only + `@oaknational/observability`;
new WS11 access-gated value-proof school-picker page; canonical-ID a tested
invariant + per-nation sourceId-identity check at WS4; England/GIAS
front-loaded; change_events/import-run-inspection deferred post-go; report §6
reframed; C-10 path fixed). **WS-D1 / G-8 DONE (2026-06-04): the 4-workspace
bundle is ratified** (contracts + sdk [data/ingest/search modules] + client +
apps/api under a new top-level `school-data-search/` tier; auth in apps/api;
authored boundary rules — betty + fred reviewed/validated, 6-way split
rejected; see the
[decomposition doc](../../plans/school-data-search/current/school-data-search-wsd1-decomposition.md)).
**Next: ADR-041 amendment (school-data-search/ tier matrix row + authored
boundary rules) + draft ADR-190 (F-B produced-spec) → `docs-adr-expert`;
promote to `active/`; begin WS1+.** Carry the verification discipline +
licensing guardrail. See the
[`school-data-search` thread record][school-data-search].

### Agentic Mechanisms Discovery

1. Treat the parent plan
   [`agentic-mechanisms-discovery.plan.md`](../../plans/discovery/future/agentic-mechanisms-discovery.plan.md)
   as the layer map for skills, MCP Server Cards, MCP runtime discovery, A2A,
   registry metadata, and generic AI discovery proposals.
2. Resume executable work from
   [`agent-readiness-discovery-hub.plan.md`](../../plans/discovery/current/agent-readiness-discovery-hub.plan.md),
   starting with `ar1-refresh-standards-and-live-estate`.
3. Keep Web Bot Auth in Phase 1 as a decision-ledger and security-evidence
   bridge; the future child plan owns any later enabled-control rollout.
4. Do not implement gated `future/` endpoints or metadata until the owner
   explicitly promotes the relevant child plan.

### Repo Professionalism Assessment

1. Start from the report:
   [`oak-repo-professionalism-engineering-quality-report-2026-06-03.md`](../../reports/oak-repo-professionalism-engineering-quality-report-2026-06-03.md).
2. Treat the plan-index links added 2026-06-03 as routing evidence, not
   execution authority. The report is an assessment input, not a plan.
3. Decide Q-005 in
   [`open-questions.md`](open-questions.md#q-005--can-the-repo-professionalism-assessment-be-cut-into-practical-plans):
   can a practical plan be made, and if yes, should it be one cross-cutting
   plan or separate plans under architecture/quality gates, DevX,
   agentic-engineering, and agent-tooling?
4. If plan work is justified, create or route it through the owning collection
   indexes; if not, record the no-plan verdict and retire this thread with a
   banner.

### EEF Graph-Tooling Rebuild

**NEXT SAFE STEP (2026-06-08): D6 COMPLETE; the EEF surface is LIVE BY DEFAULT (kill-switch
flag, default ON) and was EXERCISED live over MCP HTTP this session (Briny Charting Lagoon).**
The owner-directed next step is to **exercise the running app via the standard MCP tools** —
the EXERCISE RECIPE banner in the [`eef` record](threads/eef.next-session.md) carries the
server-start command (port 3333, no-auth) and the four working JSON-RPC calls — then **D7**,
the teacher-value round-trip proof (the go-live flag mechanism is done; the delivered-value
proof against independent ground truth remains, per the master `d7-teacher-value-round-trip`
todo). The numbered history below is retained for context.
Open execution-time items (not blockers — G0/TDD surface them) + the full verdict
are in the `eef` next-session record banner. **D5 LANDED green as one commit (`2e9021ff`; Dim Dimming
Threshold, 2026-06-05)** — graph-core generic query layer + graph-native EEF view
(`inspectStrand`/`evidenceForMove`/envelope); the `d5-graph-construction-methods`
todo is `completed`; the runtime `projection?` param was dropped by owner decision
(see the `eef` thread banner + the D4 "Projection deferred" amendment). The
graph-tools-value-redesign lane stays parked on EEF D6 + D7. The numbered history
below is retained for context.

**Post-D5 deep review (2026-06-05, Masked Creeping Lantern) — resolutions landed:**
`NodeProjection`/`DeepKeyPath` removed (no consumer); status currency +
strategy-brief reconciliation (crosswalk — shared-intent kept, server-scoring
superseded, §5 orthogonal); **ADR-191 ratified** (deterministic data surface; the
agent is the only reasoner — Decision 10 promoted repo-wide); contributor-
attribution/PII policy codified (`documentation-hygiene` §2 + `ATTRIBUTION.md`;
personal emails only in `package.json`). Substantive set landed via `10c5aeac` +
`0d99dc00` (Jim Cresswell); ADR-191 file + PII-sweep remainder + handoff committed
this session.

1. Re-ground in the `eef` thread banner and current git state.
2. D0 (fixed-data doctrine + validator removal + estate decontamination) and D1
   (teacher value contract) are complete and committed (`ce9745c7`, `f8548985`).
   The live plan reads as positive design, carried by one invariant: every tool,
   resource, prompt, graph operation, and handler is implemented with real
   graph-derived logic and tests, or it is absent. `EEF_TOOLKIT_DATA` is the only
   source of truth; relevance is by pedagogical move on EEF-native finite axes,
   and the value intersects Oak's misconception/prior-knowledge tools at the
   workflow level.
3. The two reviews (whole-plan + D2) are COMPLETE (2026-06-01, Windswept Floating
   Summit). The plan was corrected and enhanced: graph-view status truth, V1
   source-path fixes, optionality made first-class with verified corpus
   cardinalities, Decision 10 (deterministic data; the agent is the only reasoner),
   and a rewritten `## Sequencing` carrying the seam taxonomy + the "seams compose,
   never reconciled" law.
4. **D2 IS COMPLETE (2026-06-01, Lunar Transiting Eclipse, commit `9019bb86`,
   green + reviewed by code/type/test experts).** The typed raw-corpus foundation
   is built in `graph-corpus-sdk` (`EefStrand`/`EefStrandId`/`EefStrandById`/
   `isValidStrandKey`, raw domains, declared-vs-observed divergence, related-strand
   edges, corpus provenance); the old list-shaped EEF surface was removed across
   three workspaces; `OAK_CURRICULUM_MCP_EEF_ENABLED` is a dormant seam for D6. The
   source-path table is at `eef/current/eef-d2-source-path-table.md`.
5. **Contamination-correction arc (2026-06-01, commits `fb7ad234`, `70ccbef8`,
   `75b0734a`).** A fabricated key-stage→phase concept (the corpus holds phase and
   key-stage as two independent fields with no mapping) reached the canonical plan
   from a deleted prompt and was caught by the owner; removed, then an independent
   grounding audit + tombstone disposition pass cleared it. Lesson in Claude
   auto-memory (`harvest-from-deleted-is-contamination-vector`). The cite-or-tag
   corpus-grounding discipline is now a real `trigger-loaded` rule
   ([`.agent/rules/eef-corpus-grounding.md`](../../rules/eef-corpus-grounding.md));
   the stopgap doc was retired (graduated 2026-06-01).
6. **D3 (MCP tool/resource/prompt contract) is the next plan deliverable** —
   owner-ratified, `mcp-expert` SDK-registration verification pending. The D3/D4
   PENDING reviewers fire against the ratified D3/D4 outputs once those exist.
   **This session (2026-06-01, Dawnlit Dancing Satellite)** reviewed the whole plan
   and D3 with every corpus claim grounded against `EEF_TOOLKIT_DATA` (all
   cardinalities, the phase/key-stage independence, and the divergence verified
   exact; no fabrication). Applied post-D2 currency truth-fixes to the plan (D2
   `completed`; the never-built `EefKeyStage`/`EefPriority` replaced with the real
   projection inventory; already-removed surfaces corrected) and added the missing
   attribution rows to the source-path table. A session-built `field-cardinality.ts`
   projection was **backed out** (owner-directed) as a zero-consumer surface
   restating an inherent type fact — the floor/sparse split **is** `keyof EefStrand`,
   carried by the corpus type, derived at D6 from the graph-native view via the
   `satisfies` tie; there is no separate structure to build. The thread banner now
   carries an explicit GOOD/GREAT quality bar. **D3 is advanced to ratifiable
   output (2026-06-02, Seaworthy Swimming Sextant)**: the whole-plan and D3
   reviews ran (4-lens refutation workflow, findings applied), the declared-only
   filter-exclusions edit is applied in D3, and the contract + SDK/app
   verification record are authored in
   [`eef-d3-mcp-contract.md`](../../plans/sector-engagement/eef/current/eef-d3-mcp-contract.md)
   with all four D3 PENDING reviewers run and their conditions applied. An
   owner-directed adversarial audit (2026-06-03) removed three author-invented
   surfaces; a pinned-target mcp-expert re-pass returned SIGN-OFF. **The
   review-then-ratify gate CLOSED 2026-06-03 (Lacustrine Swimming Beacon):
   D3 is owner-ratified + committed (`a0fd7b0f`). **D4 (graph capability shape)
   is now AUTHORED + RATIFIABLE (2026-06-04, Burnished Glowing Spark, committed
   `ca927e40`):** owner decision B made EEF a homogeneous strand graph (guidance
   reports inline; nine bound names → eight); the fundamental heterogeneous
   node/edge model is deferred-and-homed in the migration plan. **That migration
   plan was OVERHAULED → value-driven redesign and renamed
   `graph-tools-value-redesign.plan.md` (2026-06-04, Twilit Cascading Supernova);
   the `graph-migration-plan-overhaul.plan.md` metaplan is COMPLETED.** The
   node/edge model is now scoped there as one-bulk-graph + views with a deliberate
   identity model. **D4 + the whole EEF plan were REVIEWED and D4 OWNER-RATIFIED
   (2026-06-04, Shadowed Creeping Secret): 11 review corrections applied, the EEF
   and value-redesign plans verified coherent (manifest disposition mirrored both
   ways), the `d4` todo flipped to `completed`. D5 — build the new graph-core query
   layer (`GraphView<TNode, TNodeId, TEdgeType>`, `subgraph` only) + the EEF
   strand-view fresh — is the next safe step.** The redesign stays parked on EEF
   D6 + D7. See the `eef` thread banner.** **(Update 2026-06-04, Prismatic
   Twinkling Planet): the FRESH DUAL-REVIEW of the D5 plan + parent is DONE —
   verdict READY WITH CONDITIONS; all conditions C1–C8 owner-resolved and folded in
   (keep `projection?` + implement/test; per-graph depth-ceiling factory input; D4
   doc-fix in both places; C3–C7 clarifications). Every empirical claim was
   re-grounded first-hand; four adversarial attacks on the load-bearing claims were
   rejected as false-positives. NEXT: **execute D5** — build the new graph-core
   query layer (`GraphView<TNode, TNodeId, TEdgeType>`, `subgraph` only with
   `projection?` retained) + the graph-native EEF view fresh as TDD cycles, landing
   as ONE green commit, per the condition-folded `eef-d5-execution.plan.md`. The
   graph-tools-value-redesign lane stays parked on EEF D6 + D7.**
7. **Graph-estate-consolidation: t2–t5+t7 EXECUTED and pushed at `c3b78eec`;
   scoped t8 verification PASSED (2026-06-02, Opalescent Cascading Planet)**.
   The estate reads true in one pass: eleven plans archived with banners +
   index entries, the four misconception feature plans consolidated into
   `kg/future/oak-misconceptions-graph-features.plan.md`, both
   assumptions-expert park-header conditions honoured at the t4 move,
   the KG README rewritten, `graph-stack.plan.md` re-framed per ADR-173,
   surviving live references de-linked. `t6` + the full `t8` close are the
   only remaining graph-estate items and stay D7-gated (the `t8` todo is
   `pending` by design). **The Judgement-call-4 unified substrate-migration
   plan is AUTHORED (2026-06-02, Galactic Glowing Prism):**
   `kg/future/graph-tools-value-redesign.plan.md`, parked on the named
   promotion trigger EEF D6 + D7. **The next step in the ratified one-thread
   order is EEF D3 per item 6.**
8. The seam-mapping taxonomy + "seams compose" law is a candidate for a reusable
   plan template/archetype (owner-confirmed intent); tracked in
   [`pending-graduations.md`](pending-graduations.md).

### Agentic-Engineering Curation

1. The 2026-06-03 docs bundles are committed (`a0fd7b0f`, `88d8da9d`,
   `6379f1e4`, `422e57e0`); current curation is Opalescent's dedicated pass.
2. `napkin.md` has been processed through the Opalescent item-level ledger and
   preserved as `active/archive/napkin-2026-06-03-opalescent-curation.md`.
   The PDF-only ChatGPT report-normalisation protocol graduated into the
   canonical skill and pattern; the pre-archive ledger tripwire graduated into
   the consolidation/handoff skills. Remaining register items are owner-gated
   or trigger-gated.
3. The abandoned commit-queue residue entries in `active-claims.json` remain a
   secondary cleanup signal; do not treat them as current commit authority.
4. The relative-link integrity item is accepted as a future validator lane, not
   implemented tooling; promote the plan only on its recorded trigger.
5. Comms-event rotation remains paused until a dedicated comms research plan
   exists.

### Docs Consolidation Repair

1. For a later ordinary continuation, use
   [`codex-docs-consolidation.brief.md`](codex-docs-consolidation.brief.md).
2. Treat fitness as routing evidence only; do not archive, split, shard, rename,
   pointer-replace, or move unprocessed content to improve scores.
3. Continue item-level dispositions from active buffers and the canonical
   [`pending-graduations.md`](pending-graduations.md). Owner-gated items remain
   there until their trigger fires.
4. Comms-event rotation remains paused until a dedicated comms research plan
   exists.

### Connecting-Oak / PR History

Before resuming paused graph-substrate work, re-check current PR, CI, Sonar,
CodeQL, active claims, commit queue, and git state. Do not rely on historical
issue counts in archived prose.

### Agent Tooling (collaboration CLI + PreToolUse guard) — LANDED + PUSHED

Both WIP lanes have landed and pushed (verified 2026-06-06, Starlit Scattering
Twilight curation pass — the prior "uncommitted, commit when greenlit" framing was
stale): Fiery's collaboration-state CLI (F-35 `--tag heartbeat` help + F-07
`comms list`/`show`) in `562b97f3`; Skyward's PreToolUse guard
fail-open-on-unbuilt-artefact (+ the pure `decideMissingGuardArtifact`) in
`89ec8dcf`. No open next step. Owner-gated residuals are tracked in
`pending-graduations.md`: the ADR-167 exit-0-log amendment (recommended not needed)
and F-36 (pnpm-wrapper porcelain-stdout) + F-07 list-filters
(owner-directed-optional).

### MCP Test Estate + Observability Sinks (both DECISION-COMPLETE 2026-06-06)

Both plans are `🟢 DECISION-COMPLETE`, execution owner-scheduled. Neither has a
dedicated thread record yet — the session-level home is the § Current State entry +
this section; create a thread record when execution is scheduled.

1. **Test estate** —
   [`unified-mcp-server-test-harness.plan.md`](../../plans/sdk-and-mcp-enhancements/current/unified-mcp-server-test-harness.plan.md):
   WS0 (built-server smoke harness) + WS3 (network-free e2e rebalance) are
   EEF-independent and executable now; WS1 (= EEF D7) is gated on EEF D6 landing.
   Cross-plan: sequence WS3's live-executor consolidation BEFORE the MCP slice of
   `no-io-test-boundary-and-di-recovery.plan.md` (collision risk, per the plan's
   §Cross-Plan Coordination).
2. **Observability sinks** —
   [`observability-sinks-decoupling.plan.md`](../../plans/observability/current/observability-sinks-decoupling.plan.md):
   C1+C2 (atomic: forcing-function test + standalone OTel `NodeTracerProvider`, adds
   `@opentelemetry/sdk-trace-node` + amends ADR-171) → C2b (build the `SENTRY_MODE`
   bridge in env-resolution + reconcile the sink-enum) → C3 (migrate consumers) → C4
   (renames) → C5 (close). Execution gated on the relevant feature branch(es) merging.

## Open Owner-Decision Items

1. `pending-graduations.md` carries the owner-walked estate (2026-06-11): items with
   `owner-approved 2026-06-11` are an authoring queue needing no re-asking; `routed` items
   belong to the agent-tools lane; remaining `owner-gated`/`pending` items were confirmed
   genuinely event-gated at the walk.
2. MCP product analytics execution-plan promotion is deferred. Production PostHog
   capture still needs the legal/privacy gates named in the exploration record.
3. Monorepo workspace topology is held by owner decision (2026-05-09) until after
   the graph MVP implementation tranche, unless the owner reopens it.
4. Comms-event lifecycle research is owner-gated; do not rotate the event corpus
   from calendar age alone.

## Repo-Wide Invariants / Non-Goals

Each invariant below has a canonical home; this section is a resume aid, not the
authority.

- Comms-log rotation is paused until a dedicated comms research plan exists.
- No compatibility layers; replace, do not bridge.
- Distinct architectural layers live in distinct workspaces.
- TDD at all levels; tests prove product behaviour, not file presence.
- Strict validation happens only at boundaries.
- No `process.env` read/write in test files or setup files.
- `--no-verify` requires fresh per-invocation owner authorisation.
- No warning toleration.
- Owner direction beats plan.
- Curriculum data in this monorepo comes through the published Oak Open
  Curriculum HTTP API and generated SDK.
- Knowledge preservation is absolute; fitness warnings route work, not deletion.
- Shared memory/state files are always writable and commit-includable when dirty.

[main-critical]: threads/main-critical-sonar-remediation.next-session.md
[mcp-analytics]: threads/mcp-product-analytics.next-session.md
[observability]: threads/observability-sentry-otel.next-session.md
[agentic]: threads/agentic-engineering-enhancements.next-session.md
[connecting]: threads/connecting-oak-resources.next-session.md
[oer]: threads/exploring-open-education-resources.next-session.md
[budget]: threads/architectural-budget-system.next-session.md
[cloudflare]: threads/cloudflare-mcp-security-and-token-economy-plans.next-session.md
[sector]: threads/sector-engagement.next-session.md
[eef]: threads/eef.next-session.md
[oak-kg-ontology]: threads/oak-kg-ontology-planning-review.next-session.md
[school-data-search]: threads/school-data-search.next-session.md
[semantic-search]: threads/semantic-search.next-session.md
[agentic-mechanisms-discovery]: threads/agentic-mechanisms-discovery.next-session.md
[repo-professionalism-assessment]: threads/repo-professionalism-assessment.next-session.md
[collab-research]: threads/agent-collaboration-research.next-session.md
[branch-fitness]: threads/branch-fitness-and-push-cadence.next-session.md
