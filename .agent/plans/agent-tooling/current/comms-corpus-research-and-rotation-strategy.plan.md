---
name: "Comms-Corpus Research and Rotation Strategy"
overview: "Dedicated research pass over the preserved .agent/state/collaboration/comms/ corpus (~3,150 events; 3,153 as of 2026-06-12T07:05Z — re-derive at WS0): blind cold read, automated survey, failure-mode taxonomy, prioritised theme deep-dives, mechanism recommendations routed to the comms/coordination plan cluster, and a ratification-ready non-held rotation strategy that ends the preservation hold without losing unprocessed signal. Companion to the agent-collaboration-research thread record, which owns the hypothesis, analysis vectors, and seeded themes."
status: "QUEUED — DRAFT FOR OWNER REVIEW; readiness reviewers not yet run"
todos:
  - id: ws0-grounding
    content: "WS0: read the agent-collaboration-research thread record (resume contract) EXCEPT its two Candidate Themes sections, which are deferred until the WS1 surprises log is recorded (blind-pass exception in the record's Resume Contract); read the comms-event schema and this plan; confirm corpus size/span first-hand."
    status: pending
  - id: ws1-open-discovery
    content: "WS1: open-discovery cold read — read corpus date-windows BLIND to the seeded theme catalogue AND to the comms-pattern files in .agent/memory/active/patterns/ (notably substrate-pointer-read-as-current-state, cross-session-pattern-emergence, behaviour-nudge-pressure-design-constraints — do not open these or the thread record's themes sections until this pass is recorded); the 2026-05-20 -> 2026-05-24 window precedes BOTH theme seedings and is prime blind-read territory; note everything surprising, unexplained, or unclassifiable across all three lenses (failures, things that worked well, emergent behaviour); emit the surprises log. This pass runs FIRST among analysis passes so priors cannot anchor it."
    status: pending
  - id: ws2-automated-survey
    content: "WS2: automated corpus survey — scripted counts by kind/tag/author/day (partitioned by the three event-schema shapes BEFORE aggregating), burst and silence windows, response-linkage reconstruction (in_response_to is unpopulated across the corpus as of 2026-06-12 — reconstruct chains from body-text event-id citations, subject threading, and temporal adjacency), heartbeat-volume share, PLUS an anomaly scan (outlier events, unexplained clusters, chains fitting no known shape); emit the survey report with a prioritised shortlist that draws from BOTH the WS1 surprises log and the seeded catalogue."
    status: pending
  - id: ws3-failure-mode-taxonomy
    content: "WS3: failure-mode taxonomy — read every failure-mode and behaviour-note tagged event plus untagged failure captures WS1/WS2 surface; cluster by class (substrate-failure vs agent-failure per theme 2); emit the taxonomy report with cure-shape patterns and doctrine-grade vs note-grade verdicts."
    status: pending
  - id: ws4-theme-deep-dives
    content: "WS4: deep-dives — for each prioritised item (WS1 surprises outrank seeded-theme confirmations at equal evidence), produce a research artefact with worked instances, classified by lens (deficit / strength / emergent behaviour) and carrying a steering verdict: fix, encourage, discourage, or observe-only. Cure- and steering-bearing artefacts route a recommendation to the named consumer plan in the comms/coordination cluster; understanding-only conclusions are legitimate."
    status: pending
    depends_on: [ws1-open-discovery, ws2-automated-survey]
  - id: ws5-rotation-strategy
    content: "WS5: non-held rotation strategy — evaluate the candidate shapes in the thread record's rotation section against WS1-WS4 evidence and the five invariants; produce a ratification-ready proposal (PDR-class portable contract + ADR-class repo phenotype outline) and put it to the owner. NO deletion executes inside this plan."
    status: pending
    depends_on: [ws2-automated-survey, ws3-failure-mode-taxonomy]
  - id: ws6-consolidation-closeout
    content: "WS6: consolidation and closeout — run the consolidation workflow over research outputs; update the thread record (what was processed, what remains, new themes discovered, identity row); archive or queue follow-ons per lifecycle triggers."
    status: pending
    depends_on: [ws4-theme-deep-dives, ws5-rotation-strategy]
isProject: false
---

# Comms-Corpus Research and Rotation Strategy

**Created**: 2026-06-12 under owner direction (in-session to Director Firefly seeks Temper).
**Substrate home**: the
[`agent-collaboration-research` thread record](../../../memory/operational/threads/agent-collaboration-research.next-session.md)
owns the hypothesis, the four analysis vectors, seventeen seeded candidate themes, the
preservation boundary, the rotation-strategy framing, and the dedicated-session profile. This
plan does not duplicate that substance — it is the dispatch vehicle and execution contract.
**Cluster registration**: the comms/coordination cluster index is
[`agent-tooling/future/README.md` §Comms / coordination cluster](../future/README.md#comms--coordination-cluster);
overlapping-plan disposition routes through the rightsizing keystone's M4.

## End goal

Two user-impact outcomes:

1. **Understanding that improves the mechanisms — across three lenses, not one.** This is
   explicitly NOT a find-and-fix-problems pass (owner direction, 2026-06-12). The lenses:
   - *Failure modes* — what went wrong, clustered with cure-shapes;
   - *What worked well* — practices and substrate behaviours that succeeded, named so they
     can be protected and propagated rather than accidentally regressed;
   - *Surprising emergent behaviour* — most valuable of all: behaviours nobody designed,
     surfaced by the corpus, that can be **encouraged or discouraged by tuning activation
     enthalpy** — nudges in comms tool design, defaults, affordances, and ceremony cost that
     make a desired behaviour cheaper to do and an undesired one costlier, rather than
     mandating or forbidding it.
   Findings land as routed recommendations in the named consumer plans
   (cost-of-collaboration, comms-watch trilogy, liveness plans, rightsizing M4).
2. **A ratified steady-state for the comms stream**: the preservation hold ends through an
   owner-ratified non-held rotation strategy, restoring watcher drain health permanently
   without losing unprocessed signal.

## Mechanism

The corpus is structured enough for cheap automated triage (events come in three schema
shapes — `narrative` with `author`/`title`, `directed` with `from`/`to`/`subject`, and
`lifecycle`; all carry `created_at`, `kind`, `body`, and optional `tags`; the survey must
partition by shape before aggregating, and `in_response_to` is unpopulated corpus-wide —
linkage lives in body-text citations) and rich enough that qualitative agent
reading adds value beyond extraction. **Discovery is protected structurally**: the cold read
(WS1) runs blind to the seeded theme catalogue and BEFORE the survey, so the researcher's
priors cannot anchor what counts as interesting — the owner's direction is that the corpus
holds surprises not yet recognised, and the seeded themes are a floor, never a fence. The
survey (WS2) then makes expensive reading targeted; the taxonomy (WS3) and deep-dives (WS4)
produce evidence; the rotation strategy (WS5) is determined from evidence rather than
speculation, which is what makes it ratifiable.

## Means

The six workstreams in the frontmatter todos. WS1 runs first among analysis passes (blind);
WS2 and WS3 follow; WS4 depends on WS1+WS2 prioritisation; WS5 depends on WS2+WS3; WS6
closes.

## Prerequisites

- **Blocking**: owner marks this plan ready (readiness reviewers run; see §Readiness).
- **Blocking for WS4 ratification only**: owner decision on the proposal — the plan completes
  WS4 by *putting the proposal to the owner*; ratification and any subsequent deletion are
  outside this plan.
- **Beneficial**: `comms-watch-storage-redesign` direction known (the rotation proposal must
  state composition with it either way; minimum shippable shape without it is a
  directory-level rotation proposal with an explicit storage-shape contingency note).

## Execution profile

Per the thread record's §Dedicated-Session Profile: reflective research profile, not execution
profile. The receiving agent follows the record's Resume Contract **including its blind-pass
exception**: the record is read end to end EXCEPT the two Candidate Themes sections, which are
opened only after the WS1 surprises log is recorded. The sequencing composes an open cold read
first, then the record's shapes 1 (corpus survey), 4 (failure-mode taxonomy), and 2 (theme
deep-dives), then the rotation determination.

### WS2 survey commands (reference, deterministic)

From the repo root; no new machinery — recorded one-liners only:

```bash
# Events are a 3-way oneOf (narrative author/title, directed from/to/subject, lifecycle);
# segment by shape before interpreting kind/tag distributions.
ls .agent/state/collaboration/comms | wc -l
for f in .agent/state/collaboration/comms/*.json; do node -e "
  const e=require('./$f');
  console.log([e.created_at,e.kind,(e.tags||[]).join('+')||'-',
    (e.author?.agent_name||e.from?.agent_name||'?')].join('|'))
" ; done > /tmp/corpus-index.psv
cut -d'|' -f2 /tmp/corpus-index.psv | sort | uniq -c | sort -rn   # by kind
cut -d'|' -f3 /tmp/corpus-index.psv | sort | uniq -c | sort -rn   # by tag
cut -d'|' -f1 /tmp/corpus-index.psv | cut -dT -f1 | sort | uniq -c # by day
```

(One `node` process per file is slow but dependency-free; the agent may batch with a single
node script in `/tmp` — analysis scratch, not product code.)

## Acceptance criteria and proof contract

All proof levels are `non-code` (research artefacts) unless stated.

| Id | Acceptance | Proof |
| --- | --- | --- |
| ws0 | Record (minus deferred themes sections) + schema read; corpus size/span re-derived first-hand and recorded | non-code: WS2 report's grounding section cites the re-derived counts and attests the blind-pass order was honoured |
| ws1 | A surprises log exists recording the cold read: date-windows covered, everything surprising/unexplained/unclassifiable noted with event ids, written BEFORE the themes sections were opened. A mandatory "we did not expect this" section — it may be empty only alongside evidence the blind pass genuinely ran (windows covered, time spent) | non-code: surprises log file; its timestamp/ordering attested in WS2's report |
| ws2 | Survey report exists under `.agent/reports/agentic-engineering/` with kind/tag/author/day distributions, burst/silence windows, heartbeat-volume share, anomaly scan, and a prioritised shortlist drawing from BOTH the surprises log and the seeded catalogue, with selection rationale | non-code: report file; distributions reproducible from the recorded commands |
| ws3 | Taxonomy report clusters every tagged failure-mode/behaviour-note event (count derived at execution time per the disposition-ledger discipline) into named classes with cure-shape patterns; each class carries a doctrine-grade vs note-grade verdict and a routing decision (PDR draft / pending-graduations / note) | non-code: report file + disposition ledger covering all tagged events |
| ws4 | Each prioritised item has a research artefact with ≥2 worked instances (event ids cited), a lens classification (deficit / strength / emergent), and a steering verdict (fix / encourage / discourage / observe-only); cure- and steering-bearing artefacts carry a recommendation routed to a named consumer plan; understanding-only conclusions are explicitly legitimate; the deep-dive set as a whole must not be deficit-only unless the evidence genuinely is | non-code: artefact files + routing records |
| ws5 | A ratification-ready rotation proposal exists naming: mechanism, trigger, owner-role, archive home, heartbeat-class handling, the five invariants' satisfaction, storage-redesign composition, and the migration path for the current held corpus (item-level disposition); proposal surfaced to the owner as a decision | non-code: proposal artefact + owner-decision surfacing |
| ws6 | Consolidation run; thread record updated (processed/remaining, new themes discovered, identity row); follow-ons queued | non-code: record diff + consolidation evidence |

Completion language: this plan claims complete only when ws0–ws6 are proven as above.
WS5's *ratification* is explicitly out of scope — "proposal put to owner" is the completion
bar, per research-outputs-name-decisions discipline.

## Non-goals

- **No deletion, archival movement, or rotation execution** of any corpus event inside this
  plan — determination only; execution follows owner ratification under a successor slice.
- **No new coordination machinery** (CLIs, watchers, hooks) — recommendations route to the
  cluster's owning plans; the rightsizing keystone's anti-accretion stance governs.
- **No doctrine changes** — doctrine-grade findings become PDR drafts or pending-graduations
  entries, ratified through the normal pipeline.
- **No re-litigation of cluster plan overlap** — disposition routes through rightsizing M4.

## Risks

- **Anchoring on the seeded catalogue** — seventeen pre-named themes can convert discovery
  into confirmation; the owner's direction is that the corpus holds unrecognised surprises.
  Mitigated structurally: the WS1 cold read runs blind and first, the WS2 shortlist must draw
  from the surprises log, surprises outrank seeded-theme confirmation at equal evidence, and
  ws1's acceptance demands a "we did not expect this" section.
- **Corpus volume swamps the session** — mitigated by WS2 triage and the record's
  date-window/theme-scoped session shapes; a session that exhausts budget mid-WS retires per
  PDR-063 with the survey index as the handoff asset.
- **Convenient-claim drift in qualitative reading** — every claimed pattern must cite event
  ids; ground-convenient-claims discipline applies (verify against the artefact before
  asserting).
- **Live-stream movement during analysis** — the corpus grows while being analysed; counts
  are derivation-anchored ("N as of <date/command>") per the disposition-ledger discipline.
- **Rotation proposal forecloses the storage redesign** — the proposal must state its
  composition with `comms-watch-storage-redesign` explicitly (beneficial prerequisite above).

## Foundation alignment and first-principles check

- `principles.md`: simplicity-first — no new machinery; evidence before mechanism.
- `testing-strategy.md` / `schema-first-execution.md`: no product code in scope; if any
  follow-on tooling is recommended, it lands via its consumer plan under full TDD discipline —
  never inside this research pass.
- Plan-body first-principles check (`plan-body-first-principles-check`): fires at WS4 before
  the proposal is drafted (is rotation still the right cure given what WS1–WS3 found?) and at
  WS3 before any cure-shape recommendation is routed (does the consumer plan still exist and
  own that surface?).

## Readiness

`assumptions-expert` readiness review RAN 2026-06-12: verdict READY-WITH-AMENDMENTS; all four
Important findings applied in-place (response-linkage reconstruction wording, three-shape
schema partitioning, derivation-anchored corpus counts, the active-patterns blind-pass fence).
Its confirmations: proportionality sound (six workstreams, none ceremony), blocking
relationships genuine, ratification boundary correct. Remaining gate: owner marks ready and
confirms the WS5 decision boundary.

## Learning loop and lifecycle

WS5 runs the consolidation workflow (`oak-consolidate-docs`) over the research outputs and
updates the thread record. Lifecycle touch points per
[`templates/components/lifecycle-triggers.md`](../../templates/components/lifecycle-triggers.md):
plan completion archives this file with its outputs mined into permanent homes; the rotation
proposal's ratification spawns the successor execution slice in this collection.
