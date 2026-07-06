# F6 — Sequencing and Roadmap

**Facet:** F6-sequencing-and-roadmap · **Panel:** PDR-123-shape six-facet fan-out ·
**Date:** 2026-07-06 · **Ground truth honoured:** Kiln's I1–I12 draft invariants, the
resonance synthesis kit (items 1–10), oak's I1–I10 channel invariants, ADR-200,
planning-estate-rewrite.plan.md, corpus-generalisation plan, PDR-117.

This facet owns WHEN and IN WHAT ORDER — the long-term roadmap, the batch structure,
the re-sequencing of the rewrite plan, the relationship to the corpus-generalisation
lane, the pilot choice, the multi-session cast, and the repo surfaces the protocol
writes. Mechanism internals (scripts, workers, quorums, lanes, recomputation) are
interfaces to F1–F5, named in §9.

---

## 0. Measured grounding delta (2026-07-06, first-hand)

The brief's census says 17 area directories. Measured today: **22 top-level
directories** under `.agent/plans/` (the census predates `curriculum-hub-demo`,
`curriculum-mcp-path-to-ga`, `school-data-search`, and counts `templates/`, `notes/`,
`speculative/` as non-areas). Per-area sizes (md files / `*.plan.md` / lines):

| Area | md | plans | lines |
| --- | ---: | ---: | ---: |
| agentic-engineering-enhancements | 122 | 87 | 36,354 |
| agent-tooling | 92 | 77 | 33,365 |
| semantic-search | 65 | 11 | 12,516 |
| architecture-and-infrastructure | 53 | 36 | 15,389 |
| sdk-and-mcp-enhancements | 40 | 33 | 10,792 |
| observability | 36 | 31 | 14,223 |
| sector-engagement | 36 | 11 | 8,147 |
| developer-experience | 29 | 12 | 5,129 |
| templates | 21 | 0 | 2,773 |
| user-experience | 19 | 7 | 3,850 |
| security-and-privacy | 18 | 1 | 1,936 |
| discovery | 16 | 9 | 3,537 |
| product-development-governance | 13 | 4 | 5,113 |
| connecting-oak-resources | 13 | 10 | 4,286 |
| speculative | 13 | 0 | 2,671 |
| upstream-feature-requests | 6 | 0 | 405 |
| compliance | 6 | 0 | 396 |
| exploring-open-education-resources | 4 | 2 | 614 |
| curriculum-hub-demo | 4 | 2 | 1,259 |
| curriculum-mcp-path-to-ga | 4 | 1 | 644 |
| school-data-search | 4 | 1 | 1,045 |
| notes | 2 | 0 | 166 |

The two dominant areas hold 164/335 plan files (49% — the census figure confirmed).
`connecting-oak-resources` carries two `active/` plans (`graph-stack`,
`agent-guidance-consolidation`); `discovery` carries none (current + future only).
Sequencing consequence: **the roadmap never hardcodes an area count** — the F1
denominator script enumerates areas at freeze, and this design's batch ordering is a
rule over that enumeration, not a frozen list (though the concrete assignment below is
given against today's measurement).

---

## 1. The cohesive long-term roadmap

Three eras, one line of intent. Every stable point's exit criterion is a **proof,
never the clock** (Kiln Q1.6 — "the exit criterion is the proof, never the clock; that
rule did real work").

```text
ERA A — current estate            ERA B — refounded corpus           ERA C — intent graph
(organised by provenance,     →   (organised by intent/value,    →   (ADR-200: idea-graph SSOT,
 drifted, free-text axes)          V0-authored, recomputable,         documents as co-equal
                                   provably lossless vs frozen        projections; WS6 harvests
                                   originals — USABLE NOW)            the ERA-B corpus)
```

**ERA B is a committed, independently valuable milestone**, per the owner directive
("stabilise part of the pipeline and make it immediately useful as the new plan
corpus"). It is not scaffolding for ERA C — if ERA C were cancelled the day ERA B
closes, the estate would still be strictly better: intent-organised, schema-valid,
state-recomputable, loss-proven.

### Phases and committed stable points

| Phase | Name | Content | Stable point (exit proof — never a date) |
| --- | --- | --- | --- |
| R0 | Instruments | Build + prove the tooling: plan-state recomputation tool (kit item 9, F5), freeze/inventory/tiling/residue scripts (F1), worker templates + verification harness (F2), versioned status-mapping table (F3/F5). Owner gates: proof-typed-todo V0 extension; mapping-table ratification. | **SP1** — every script/tool landed on `main` with a planted-defect / mutation-probe transcript proving it can fire (I4); the recomputation tool's first full-estate claim-vs-derived divergence report committed. |
| R1 | Taxonomy + freeze + pilot | Lane-taxonomy owner walk (F4); the whole-estate atomic freeze + denominator commit (I2, I6); pilot batch B1 (`discovery`, §5) end-to-end. | **SP2** — freeze landed, byte-identity green, inventory + residue audit committed, planted synthetic orphan proven to fire. **SP3** — pilot ledger exactly tiles the pilot slice; stratified challenge complete; refounded discovery plans live in new lanes; per-batch loss check green; cost actuals vs pre-declaration recorded; owner pilot-close ruling + re-priced declaration for the remainder. |
| R2 | Production waves — self-contained areas | Batches B2–B6 (§6); Wave-0 archive sweep of `.agent/plans-old-archive/` runs in parallel (mechanical grep for non-terminal markers → adjudication; hits route as inventory additions to owning-lane batches). | **SP4** — cumulative ledgers green over ≥50% of the frozen denominator; owner batched-rulings walk; Wave-0 sweep hit-list fully adjudicated or routed. Per-batch stable points throughout: committed ledger + green loss check (I5). |
| R3 | Dominant areas | `agent-tooling` and `agentic-engineering-enhancements`, sub-batched by mechanical subdirectory boundary (§6); maximum live-lane coordination (F4 policy); scheduled after the corpus-generalisation P0 landing set if it is ready, absorbed by denominator re-derivation if not (§4). | **SP5** — every enumerated area's ledger green; estate-wide tiling recomputed: zero gaps, zero overlaps over the full frozen denominator. |
| R4 | Adjacents + retirement + closure | `product-development-governance` last (the protocol's own governing surfaces — mirrors resonance's self-archiving close); `milestones/` + `proposals/` batch; prompts/thread-record intent-leakage sweep; repoint-before-retire tranches (I9, I10, one commit each); final recomputed-state owner walk (I11, F4/F5). | **SP6 = the ERA-B milestone** — old estate retired against green ledger + challenge; corpus fully live in intent-derived lanes; estate-wide loss check green; recomputation tool green over the entire new corpus; durable pointers on first-read surfaces (I12). |
| G1 | Graph foundations (parallel — never waited) | ADR-200 WS2 (idea schema + id-minting), WS5 (projection types), WS4 thin-slice. These run in parallel with R0–R4 (§3). | **SP7** — WS4's own acceptance (unchanged hard gate): loop end-to-end, validator catches deliberate breaks, merge op rewrites edges. |
| G2 | Harvest the refounded corpus | WS3 vocabulary grounding re-scoped over the refounded corpus; WS6 deep harvest = corpus-generalisation P2 planning family module over the ERA-B corpus + the frozen archive (§4); WS6b. | **SP8** — WS6/WS6b acceptance as written in the rewrite plan (coverage logged, graph validates, friction dispositioned). |
| G3 | Synthesise + graph-authoritative | WS7 over the harvested graph; the no-loss audit **composes transitively** (§3): refounding proved old→refounded; WS7 proves refounded→graph; composition gives old→graph. | **SP9** — ADR-200 substrate-value milestone: recoverable, drift-free, traceable, dual-legible, conserved. |

**Decision D1 — the refounding is an inserted conservation stage under ADR-200, not a
rival architecture.** *Warrant:* the owner directive says "an intermediate step ON THE
ROAD TO the ADR-200 intent graph (not instead of it)"; ADR-200's §Goals flow
(observe → analyse → synthesise → new corpus) is exactly what the refounding executes
at document altitude, leaving idea altitude to WS6–WS7. *Falsifier:* if executing the
refounding forces a change to ADR-200's Decision sections (not merely its §Sequence),
D1 is wrong and a new ADR is required instead of an amendment.

**Decision D2 — ERA B is a committed stable point with standalone acceptance, not a
best-effort waypoint.** *Warrant:* owner directive ("immediately useful"); resonance's
measured result that a proven-conserved, state-audited corpus pays for itself before
any downstream consumer (their 7 done-but-recorded-pending finds "justified the entire
arc"). *Falsifier:* if at SP6 the corpus still requires the graph to be navigable or
truthful (e.g. lanes unusable without idea-edges), ERA B failed as a milestone and the
phase gating was mis-drawn.

---

## 2. How the refounding re-sequences the rewrite plan

Current plan state: WS1 done; WS2 next; WS4 = hard gate before WS6; WS6 harvests
"every `.agent/plans/` doc"; WS7 synthesises, rewrites, audits, retires.

The refounding **takes over the document-altitude half of WS7 and moves it before
WS6**, and in doing so changes WS6's substrate:

- **WS6 harvests the NEW corpus.** After SP6, "every `.agent/plans/` doc" *is* the
  refounded corpus: V0-authored, schema-valid frontmatter (parsed deterministically in
  code — the P2 design), typed edges, registered lanes, recomputable state, and a
  frozen-spec binding clause per conserved todo pointing into the frozen originals
  archive. Harvest coverage becomes near-mechanical instead of a 165k-line prose
  crawl. The frozen archive remains available to WS6 for provenance depth, but the
  harvest denominator is the refounded corpus.
- **The no-loss audit composes transitively.** The refounding's chain (freeze →
  denominator → two-verdict → tiling ledger → challenge-the-clean → repoint-retire)
  proves old-estate → refounded-corpus conservation. WS7's two-direction audit then
  proves refounded-corpus → graph. Composition yields old-estate → graph without WS7
  re-auditing 165k frozen lines. *This is the roadmap's central economic warrant.*
- **WS3 shrinks.** The broad-shallow vocabulary-discovery pass re-scopes to the
  refounded corpus, and the refounding's own by-products (the ratified lane taxonomy,
  the ledger's disposition distribution, the status-mapping table) are first-class
  vocabulary-grounding evidence. WS3's owner confirms the re-scope at WS3 (the plan's
  own confirm-at-the-workstream discipline); this design flags it, not decides it.
- **WS2 / WS4 / WS5 are untouched and unblocked** (§3).

**Decision D3 — re-sequence by amendment, never by rewriting WS todos.** The
amendment shape for `planning-estate-rewrite.plan.md` (additive, no-moving-targets,
dated — the discipline in §8):

1. Frontmatter: add one new todo, stable id `ws-r-corpus-refounding`, kind executable,
   `depends_on` nothing in-plan (it has its own governing plan; the todo is the
   projection into this plan's dependency graph), and add
   `ws-r-corpus-refounding` to `ws6-deep-harvest.depends_on` **additively** (the
   existing `[ws3, ws4]` entries stay).
2. Body: a dated section `## Amendment (2026-07-XX) — the plan-corpus refounding as an
   inserted conservation stage` stating: WS6's harvest substrate becomes the refounded
   corpus; the conservation ledger is the recall-audit accelerant; WS7's audit scope is
   the transitive composition; WS3's re-scope is flagged for confirmation at WS3. The
   original WS6/WS7 todo text is **not** edited except one appended, dated,
   clearly-marked clause on `ws6-deep-harvest` naming the substrate change
   ("AMENDED 2026-07-XX: substrate = the refounded corpus per §Amendment") — an
   additive supersession note in-place, mirroring I12.

*Warrant:* `no-moving-targets-in-permanent-docs` + the V0 change discipline + I12
(history annotated, never rewritten); resonance's additive-supersession pattern
survived adversarial review. *Falsifier:* if a reader of the amended plan can still
execute the un-amended WS6 (harvest the old estate) without hitting a signpost, the
amendment shape is insufficient and the todo text must carry more.

### Non-interference with WS2/WS4 (they must NOT wait — owner-stated, twice)

Four concrete mechanisms:

1. **Write-surface disjointness.** WS2/WS4 write: idea-node schema, SDK code under
   `packages/`, the frontmatter↔store validator, and ONE new V0 plan. The refounding
   writes: the frozen archive, ledgers/inventories, new-lane plans, banners on
   originals. The only genuinely shared file is `planning-estate-rewrite.plan.md`
   itself (WS status updates vs the D3 amendment) — coordinated via the claims
   registry and, on divergence, `oak-semantic-merge` (concept-level, never line-merge).
2. **Additive-authoring channel.** New plans authored during the window (WS4's proof
   plan, any V0-bridge plan) land in the **new lane structure** once the taxonomy is
   ratified (post-SP2); before that, they land in the old structure and are picked up
   mechanically by **denominator re-derivation at merge** (I6) when their area's batch
   opens. Either way, no one waits and nothing is lost — the accretion policy is
   pre-declared (kit item 8; the policy text itself is F4's).
3. **Schema pinning.** Refounded plans are authored to V0 (plus the proof-typed
   extension if the owner signs it at the R0 gate), and each carries the schema
   version it was authored against. V0 is LOCKED; if WS2's idea-node work motivates a
   V0 change, that is an owner re-ratification event, and the version stamps make the
   later migration mechanical rather than archaeological.
4. **Owner-attention scheduling.** The Director (§7) sequences the refounding's owner
   gates around the WS4 gate and the P0 restart session so the owner never faces two
   ratification walks in one sitting.

**Decision D4 — WS4 stays the hard gate for WS6, and the refounding adds itself as a
second, independent WS6 gate.** *Warrant:* the gates guard different failure classes —
WS4 guards architecture (can the graph loop work at all), the refounding guards
substrate (is the input corpus clean and conserved); removing either re-opens its
risk. They are parallel, so the critical path to WS6 is `max(WS4, SP6)`, not the sum.
*Falsifier:* if WS4's thin-slice proof turns out to need the refounded corpus (it must
not — it harvests "a handful of ideas from a few docs", any docs), the parallelism
claim fails.

---

## 3. Relationship to corpus-generalisation Phase 0 / P1 / P2

The corpus-generalisation plan's P0 is executed-to-a-stable-point but its **landing
set is pending** (PDR-122 amendment + companion rule + code-site derivation + plan
promotion, restarting on a new branch). P2 (planning corpus → intent graph) is gated
on P0 and on ADR-200 WS2.

**Decision D5 — the refounding borrows doctrine and deterministic code; it must not
wait for any corpus-generalisation landing.**

Borrows (available today, no landing dependency):

- **PDR-122 invariants + the ratified D1–D9 kernel topology as design doctrine** —
  calibration-first canaries behind a deterministic abort breaker; pilot-first sizing;
  pre-run cost declaration in every billing denomination; batch-sequential validate;
  output-bounding + completion tracking. These are ratified text, consumed by F1–F3
  as constraints.
- **The measured priors** — ≈1.4 effective votes of 3 same-model lenses; 40%
  one-directional cross-regime disagreement → irreversible dispositions need
  cross-regime concurrence (F3 consumes).
- **The tested deterministic modules** in `agent-tools/src/corpus-analysis/`
  (aggregation-adjudication/recall/verdict, cost-and-coverage) — adopted as code where
  they fit F1/F3's needs, brought into whole-tree lint/knip conformance at adoption
  (the plan's own recorded condition), never re-built.
- **The miner-context doctrine** (context-minimal by construction; briefs derived from
  a profiling pass; blindness probe; file:line + verbatim quote per claim) — F2
  consumes.

Must NOT wait for (and must not duplicate):

- The P0 ratification session and its atomic landing set. If it lands mid-run, adopt
  additively at the next batch boundary; if not, the refounding's borrowed-doctrine
  set above is sufficient.
- P1's kernel extraction, family-module machinery, and the regime registry **as
  code**. The refounding's worker layer is bespoke-thin (F2's scripts + zero-judgement
  briefs), not a family module.
- **P2's planning-corpus family module.** The boundary that prevents duplicate
  machinery: the refounding is a **conservation transform at document altitude**
  (plans in → plans out, loss-proven); P2/WS6 is an **extraction instrument at idea
  altitude** (plans in → idea-nodes out, calibrated). One reads the estate to
  re-express it; the other reads it to mine it. The refounding builds no closed-IE
  extraction, no regime registry, no graph renderer.

Produces FOR P2/WS6 (the hand-off contract):

- The refounded V0 corpus — P2's harvest substrate with deterministic frontmatter.
- The frozen originals archive + conservation ledger — P2's recall-audit accelerant
  and unbroken provenance chain (node → refounded plan → ledger row → frozen
  `file:line`).
- The versioned status-mapping table — P2's deterministic status-parse input.
- The plan-state recomputation tool (F5) — the sibling of WS4's frontmatter↔store
  validator, already proven on the corpus P2 will read.

*Warrant for D5:* `consolidate-at-second-consumer` — the refounding is the FIRST
consumer of a would-be shared refounding kernel; extracting shared machinery now is
premature. The corpus-generalisation plan itself states WS2/WS4 "do NOT depend on
this plan", and symmetric independence holds here. *Falsifier:* if F1/F2's designs
find themselves re-implementing >1 of the tested corpus-analysis modules rather than
adopting them, the borrow/build boundary was drawn wrong.

Coordination note: both this protocol and the P0 restart write into
`agentic-engineering-enhancements/` — one reason that area sits late in the batch
order (§6): its refounding batch opens after the P0 landing set has (ideally) landed,
and denominator re-derivation absorbs it if the timing inverts.

---

## 4. Pilot-area choice

**Decision D6 — the pilot is `discovery` (batch B1), a whole small self-contained
area; a slice of a dominant area is rejected.**

Why a whole area, not a dominant-area slice:

- The batch boundary must be **mechanically derivable** (I1). An area directory is a
  mechanical boundary; a slice of `agentic-engineering-enhancements` needs an
  intra-area filter, and a subjective file filter is "the single biggest conservation
  risk" (resonance r1). A subdirectory slice would be mechanical, but then the pilot
  cannot close an **area-level ledger** — intra-area cross-references straddle the
  slice, so the pilot would never exercise the very stable-point proof (per-area
  ledger close) that every later batch repeats.
- Dominant areas carry the most live lanes; the pilot should measure **protocol**
  cost, not coordination cost.

Why `discovery` specifically (16 md / 9 plans / 3,537 lines):

- **Zero live-lane coordination:** no `active/` plans, no current claims — pilot cost
  is a clean protocol measurement.
- **Exercises the full mechanism set:** mixed lifecycle (`current/` + `future/` +
  per-folder READMEs), both `*.plan.md` and non-plan forms (reports), index chains
  (README linkage), and — decisively — content whose subject matter (agent-discovery
  standards: DNS-AID, web-bot-auth, MCP server cards, A2A cards) is plausibly
  **not-currently-strategic**, so the pilot exercises the conserving holding lane
  (F4), the hardest routing class, at pilot scale rather than discovering its frictions
  at production scale. Several claimed-pending discovery items likely already landed
  elsewhere (skills work shipped via other lanes), so the two-verdict audit's
  did-it-already-land direction fires too.
- **Calibration comparability:** at 3,537 lines it is ≈0.8× resonance's whole measured
  run (4,452 lines), so the only wall-clock/token prior in existence transfers to the
  pilot near-directly, and the pilot's actuals re-price everything else (PDR-122
  pre-run declaration + pilot-first sizing).

Rejected pilot alternatives:

- **`connecting-oak-resources`** (best size match, 4,286 lines): rejected — two
  `active/` plans (`graph-stack`, `agent-guidance-consolidation`) put live-lane
  coordination inside the calibration measurement, and its graph-lane content couples
  to the very ADR-200/WS2 work running in parallel.
- **A subdirectory slice of `agentic-engineering-enhancements`**: rejected per the
  whole-area argument above, plus maximal liveness (the P0 restart writes there).
- **`upstream-feature-requests` / `compliance` / `notes`** (tiny): rejected — no
  `*.plan.md` at all; they would not exercise plan-specific machinery (status
  mapping, todo conservation, two-verdict probes) and the "pilot passed" claim would
  be hollow.

*Falsifier for D6:* if the freeze-time claims-registry check shows `discovery`
claimed by a live lane, the pilot moves to `user-experience` (19 md / 7 plans /
3,850 lines — the named fallback, same properties minus the holding-lane richness).

Pilot-scale note: `discovery` is ~2% of the estate by lines. PDR-122's ~1/10th
pilot-sizing prior is honoured **cumulatively**: the pilot (B1) calibrates the
protocol; the first production batch (B2+B3, §6) brings cumulative coverage past
1/10th before the SP4 mid-scale owner walk. Calibration spend scales up in two
steps, never one jump (progressive power, D-doctrine).

---

## 5. Batch ordering across the areas

Ordering rule (applies to whatever the denominator script enumerates): **ascending
live-lane coordination cost, self-contained before dominant, the protocol's own
governing area last.** Concrete assignment against today's measurement:

| Batch | Areas | md files | Rationale |
| --- | --- | ---: | --- |
| B1 (pilot) | discovery | 16 | §4 |
| B2 | upstream-feature-requests, compliance, exploring-open-education-resources, school-data-search, curriculum-mcp-path-to-ga, notes | 26 | Tiny areas; heavy on non-plan forms → exercises surface-class dispositions cheaply right after the pilot. |
| B3 | user-experience, security-and-privacy, speculative, templates | 71 | Quiet areas + the two non-area classes (`speculative/`, `templates/`) whose freeze-rule verdicts (F1) and holding/reference-lane routing (F4) get exercised at moderate scale. Cumulative after B3 ≈ 113 md ≈ 18% — past the 1/10th calibration threshold before SP4. |
| B4 | sector-engagement, developer-experience, connecting-oak-resources, curriculum-hub-demo | 82 | Moderate liveness: `connecting-oak-resources` has active lanes (coordinate per F4's live-lane policy); `curriculum-hub-demo` just merged (PR #295) and is still warm. |
| B5 | semantic-search, observability, sdk-and-mcp-enhancements | 141 | Larger product areas; by now the mapping tables and challenge briefs are mature. |
| B6 | architecture-and-infrastructure | 53 | Cross-cutting references into everything — benefits from most other ledgers existing first. |
| B7–B8 | agent-tooling (sub-batched by subdirectory) | 92 | Dominant area 1; live daily lanes. |
| B9–B10 | agentic-engineering-enhancements (sub-batched by subdirectory) | 122 | Dominant area 2; scheduled after the P0 landing set where timing allows (§3). |
| B11 | product-development-governance + `.agent/milestones/` + `.agent/proposals/` + the prompts/thread-record intent-leakage sweep | 24 + adjacents | LAST: hosts the rewrite plan, V0 schema, and this protocol's own governing plan — refounded at closure so the protocol never transforms the ground it stands on mid-run (resonance's self-archiving close). |

Dominant-area sub-batches use **mechanical subdirectory boundaries only** (lifecycle
folders or named sub-collections), and the area's ledger closes only when all its
sub-batches close — the per-area stable point is never split.

Wave-0 sweep of `.agent/plans-old-archive/` (571 md — sweep input, NOT a freeze
source): starts during R2, runs parallel (scripted grep for non-terminal markers →
adjudication of hits, F3); each hit routes as an inventory addition to the owning
lane's batch or to the holding lane; the sweep must be fully dispositioned before
R4 closure. *Warrant for parallel-early:* the sweep is cheap and its hits inform lane
population while lanes are still being filled; leaving it to R4 would re-open closed
ledgers. *Falsifier:* if sweep hits materially rewrite already-closed batch ledgers
(more than additive rows), the sweep should have preceded the batches — pull it to R1
for the remainder.

**Decision D7 — one whole-estate freeze at SP2, not per-batch freezes.** *Warrant:*
a single denominator makes cross-area concept moves (a plan re-expressed in a lane
whose source spans two areas) accountable in one tiling; per-batch freezes let
inter-area references straddle frozen/unfrozen state, and the denominator
re-derivation at merge (I6) already handles the live-estate churn a long freeze
window implies. *Falsifier:* if denominator re-derivation deltas exceed ~5% of the
denominator before R3 (the estate churning faster than batches close), the single
freeze is fighting the estate and the remaining batches should re-freeze at SP4.

---

## 6. The multi-session cast (PDR-117)

The arc is multi-session **by design** (Kiln Q1.6: at 40×, design the stable points
in; resonance's one-session ambition is on the do-not-copy list).

- **Director** (one seat, exactly one holder, PDR-064 two-moment handoffs): carries
  the roadmap map across implementer generations; schedules batches and owner gates;
  proposes the commit train at every stable point (PDR-117 amendment clause 4);
  routes lanes, never executes; owns the `director-handoff.md` entry-point updates
  and the thread record's load-bearing continuity. The refounding's owner-gate spine
  (I8/I11) is Director-scheduled so gate count stays scale-independent.
- **Implementer seats, one worktree each, per batch:**
  - *Mechanical runner* — runs the F1 scripts, commits inventories/ledgers/diff
    transcripts (deterministic work still needs a seat to run and land it).
  - *Dispatcher* — runs F2 worker fan-outs where LLM reading is unavoidable; owns
    the four-step verification on 100% of replies; dispatcher recomputation is the
    binding proof.
  - *Adjudicator* — the placed-judgement seat (F3): net set-differences, residue
    blocks, unmappable-status residue, disposition proposals.
  - *Author* — drafts new-lane plans (V0 + frozen-spec binding from draft one,
    kit item 2), stable ids from draft one (kit item 6).
  - *Challengers* — **fresh-context sessions, never worktree-mates of the batch they
    attack** (the fresh-context property is structural, not a vibe): stratified by
    disposition class per F3.
- **Where the work lives — Decision D8: no long-lived working branch; each batch is
  a short-lived branch/worktree off `main`, landing its stable point via PR.**
  The freeze+denominator commit is itself the first PR. Retirement tranches are
  separate single commits (I9). *Warrant:* the estate is live with daily remediation
  merges; a months-long working branch maximises divergence and turns every
  denominator re-derivation into an archaeology dig; the refounding's intermediate
  states are **designed-valid** (frozen copies + banners + new lanes coexisting with
  bannered originals is the I12 coexistence window, safe on `main`), so mainline
  landing is safe and makes stable points real — committed, survivable, resumable by
  any successor session. *Falsifier:* if a mid-arc reader is demonstrably misrouted
  despite banners + README routing (an agent executes a bannered original as a work
  queue), the coexistence window is unsafe on `main` and the fallback is a working
  branch with scheduled merge trains.
- **Claims discipline:** each batch seat registers its area claim at session open
  (`register-active-areas-at-session-open`); the Director verifies claim freshness
  before routing (PDR-117); freeze never copies out from under an active claim
  without coordination (F4's live-lane policy executes this).

---

## 7. Repo surfaces the protocol writes

| Surface | What lands | Discipline |
| --- | --- | --- |
| `.agent/plans/product-development-governance/current/plan-corpus-refounding.plan.md` (NEW — the governing plan) | The protocol as an executable V0 plan: phases R0–R4 as todos with typed proofs (once the F5 extension is signed), pre-declared batch budgets, halt conditions. Promoted to `active/` at SP2. Self-archives at SP6 with a pointer to the refounded corpus (resonance r7). | V0 schema; `oak-plan` skill; plan-body first-principles check fires per phase. |
| `planning-estate-rewrite.plan.md` (AMENDMENT) | The D3 amendment (§2): one new todo + one additive `depends_on` entry + a dated body section + one dated appended clause on ws6. | Additive only; no todo text rewritten; dated; `oak-semantic-merge` on any collision with WS2/WS4 status updates. |
| `docs/architecture/architectural-decisions/200-intent-as-a-living-idea-graph.md` (AMENDMENT, owner-gated) | A dated `## Amendment — plan-corpus refounding as an inserted conservation stage` recording: the inserted step between §Sequence 5 and 6; WS6's substrate change; the transitive-audit composition; the ERA-B milestone. | ADR amendments are additive and dated; the original §Sequence text stays verbatim (I12). No new ADR (D1) unless D1's falsifier fires. |
| `.agent/memory/operational/threads/` (NEW thread record) | Thread `plan-corpus-refounding`: session-by-session record, stable-point ledger, owner rulings verbatim, handoff briefs. | Handoff messages self-contained; SHA-prefixed content per the collaboration rules. |
| The frozen archive (dated directory; exact rule = F1) | Byte-identical copies of the freeze set + the diff transcript + the standing diff-gate over the frozen tree. | Never edited after SP2; `never-use-git-to-remove-work`. |
| Ledger + inventory + mapping-table artefacts (under the governing plan's directory) | The line-level inventory, tiling ledger, versioned status-mapping table, per-batch loss-check reports, cost declarations + actuals. | Committed at each stable point (important state never in temp files); recomputable by the F1/F5 tools at any time. |
| New intent-derived lanes under `.agent/plans/` (taxonomy = F4) | The refounded corpus, batch by batch, including the holding lane. | V0-authored; frozen-spec binding clauses; stable ids; two-way banners during coexistence (I12). |
| PDR (DEFERRED) | A candidate protocol PDR is minted only at the post-run retrospective, from evidence. | Pre-committing doctrine before the run contradicts the falsifiability culture (PDR-026); resonance's kit already carries the cross-estate protocol until then. |

Amendment/supersession discipline, stated once for all surfaces: **additive dated
notes route the reader; original text stays verbatim; retired files get a durable
supersession blockquote at their frozen copy and pointers on first-read surfaces;
nothing is rewritten to pretend the past was different** (I12,
`no-moving-targets-in-permanent-docs`, `no-tombstones-for-removed-ideas` applies to
living doctrine surfaces, not to these history records — the seam ADR-200's reference
doc already names).

---

## 8. Interfaces to other facets

- **F1 (mechanical substrate):** owns the freeze rule text, denominator script, per
  surface-class verdicts (incl. `templates/`, `notes/`, `speculative/`, `milestones/`,
  `proposals/`, prompts leakage), tiling arithmetic, and the standing frozen-tree
  diff-gate. F6 consumes: the area enumeration (batch units), the atomic
  freeze+denominator commit at SP2, re-derivation at every merge (D8 depends on it).
- **F2 (worker layer):** owns briefs/envelopes/verification. F6 consumes: per-batch
  worker budgets for the cost declarations; the rule that a refusal firing =
  task-mis-design feeds the batch retro at each stable point.
- **F3 (judgement + error correction):** owns quorum design, disposition-class
  stratification, per-batch loss checks, halt conditions. F6 consumes: the halt
  condition (a failed loss check halts the RUN, not just the batch — I5) as a roadmap
  event: a halt freezes the batch sequence, triggers a Director-routed diagnosis, and
  no later batch opens until the halted batch's ledger is green.
- **F4 (intent layer + lanes):** owns the lane taxonomy walk (gate G4), the holding
  lane, live-lane coordination policy, the accretion policy (§2 mechanism 2), and the
  final-walk design. F6 consumes: the walk dates relative to SP2/SP6 and the batched
  mid-flight ruling cadence (per ~2–3 batches).
- **F5 (recomputable state):** owns the recomputation tool (R0's centrepiece — kit
  item 9, "the single largest structural saving available to a second runner"), the
  proof-typed-todo extension gate, the mapping table mechanics, the two-verdict probe
  set. F6 consumes: tool-lands-first is a **phase-ordering commitment** (R0 before
  any freeze); the final owner walk consumes tool output, never records.

---

## 9. Owner-gate items (the scale-independent spine, I8/I11)

1. ~~Commission~~ (this directive — done).
2. **G2 (R0):** proof-typed todos as an additive V0 extension — sign-off (V0 todos are
   LOCKED; owner re-ratification is the documented change path).
3. **G3 (R0):** the versioned status-mapping table — ratification (judgement placed at
   the table, zero judgement per item).
4. **G4 (R1):** the lane-taxonomy walk (F4 designs it) — before any pilot authoring.
5. **G5 (SP3):** pilot-close review + ratification of the re-priced cost declaration
   for B2–B11, and the D3/ADR-200 amendments land here (one sitting).
6. **G6 (recurring):** batched mid-flight rulings, per ~2–3 batches (unmappable
   residues, cross-lane conflicts, not-currently-strategic dispositions) — batched,
   pre-analysed, never a raw dump.
7. **G7 (per retirement tranche, or folded into G8):** retirement authorisation —
   retire only against a green ledger + completed challenge (I9).
8. **G8 (SP6):** the final recomputed-state walk — live tool output, never remembered
   state (I11).

---

## 10. Cost model sketch (grounded in the measured priors)

Priors: resonance = 15 sources / 4,452 lines / 1,443 inventory lines / 223 ledger
rows ≈ 17h wall including owner gates, ~1.3M+ subagent tokens **with worker-run
mechanical layers** (the known-to-strip cost). Oak = 618 files / 165,066 lines ≈ 37×
lines, 41× sources. Dominant cost lever = turns × context, not model tier (PDR-122).

Derived sizing (to be re-priced at SP3 by pilot actuals — every number below is a
pre-declaration input, not a promise):

- **Inventory:** at resonance's 32% work-bearing ratio → ~53k inventory lines; at
  ~6.5 lines/ledger-row → **~8,000 ledger rows**. All scripted (zero LLM tokens).
- **R0 (instruments):** 2–4 implementer sessions; LLM spend trivial (code + probe
  transcripts). This is the largest structural saving vs resonance (kit item 9) and
  is why it is a phase, not a task.
- **Pilot B1** (0.8× resonance lines, scripted mechanicals, stratified challenge):
  ~1.5–2 sessions, ~8–12h wall, **~1.5–3M LLM tokens** (adjudication + challenge +
  authoring ~9–12 refounded/routed plans). Resonance's 17h included unscripted
  mechanicals and the r3/r7 walks; the pilot should come in under it.
- **Challenge layer (the dominant LLM spend):** per-source briefs, cost scales with
  source count not line count (Kiln Q1.4). 618 sources × ~15–25k tokens/brief ≈
  10–15M tokens un-stratified; disposition-class stratification (challenge ALL
  loss-bearing rows, probe the rest) cuts an estimated 40–50% → **~6–9M tokens**.
- **Adjudication + dispositions:** routed residues and disposition proposals across
  ~8k rows, quorum-governed at F3's design → **~4–8M tokens**.
- **Authoring:** consolidation is real (that is the point) — expect ~100–170
  refounded plans from 335. Fable-tier authoring + frozen-spec binding ≈ 10–20k
  tokens each → **~2–4M tokens**.
- **Whole arc:** order **20–40M LLM tokens**; **12–18 batch working sessions**;
  **4–8 calendar weeks** at oak's cadence with stable points landing on `main`
  throughout; owner attention ≈ 8 gate moments, each bounded (walks ≤ ~1h; batched
  rulings ≤ ~30min) — scale-independent in count, per I8.
- **Wall-clock shape:** the exit criterion of every phase is its proof; the calendar
  figures above are capacity estimates only and never gate anything.

Each batch opens with its own pre-run declaration in every billing denomination and
closes with actuals recorded next to it (D-doctrine); a batch exceeding its declared
budget without a green loss check is a halt condition (F3).

---

## 11. Rejected alternatives (with reasons)

1. **Skip the refounding; run WS6 over the raw estate** (the status-quo plan) —
   rejected by owner directive, and economically: WS6/WS7 would carry the full
   165k-line prose crawl AND the full no-loss burden in one arc, with no usable
   corpus until the very end. The refounding delivers a committed middle milestone
   and shrinks the graph arc's audit to a composition.
2. **Fold the refounding into corpus-generalisation P2** — rejected: P2 is gated on
   P0 + WS2 ("must not wait" violated), and the refounding is a conservation
   transform, not an extraction instrument (§3 boundary).
3. **Pause WS2/WS4 until SP6** — rejected: owner-stated twice that they proceed;
   also P2 needs WS2, so pausing WS2 would serialise the whole roadmap.
4. **A long-lived `refound/plan-corpus` working branch** — rejected (D8): daily-merge
   divergence, denominator churn, and stable points that exist only on a branch are
   not stable. Fallback only if the coexistence-window falsifier fires.
5. **Pilot = a slice of a dominant area** — rejected (D6): slice boundaries either
   import the subjective-filter conservation risk or cannot close an area-level
   ledger; maximal liveness contaminates calibration.
6. **Pilot = `connecting-oak-resources`** (best size match) — rejected: two active
   lanes inside the calibration measurement.
7. **Per-batch freezes** — rejected (D7): inter-area references straddle
   frozen/unfrozen state; one denominator + re-derivation at merge is strictly
   stronger.
8. **A new ADR for the refounding** — deferred (D1): it inserts a stage under
   ADR-200's accepted architecture; a dated amendment carries it. A protocol PDR is
   post-run, evidence-first.
9. **Refounding `product-development-governance` early** ("eat the vegetables
   first") — rejected: transforming the protocol's own governing surfaces mid-run
   makes every later batch's governing references unstable; resonance's
   self-archiving close is the proven shape.

---

## 12. Open questions

1. **WS3's re-scope** — how much of the vocabulary-grounding evidence the refounding
   by-products actually supply is decidable only at WS3 (flagged in the D3 amendment;
   confirm-at-the-workstream).
2. **P0 restart timing vs B9–B10** — if the P0 landing set has not landed when
   `agentic-engineering-enhancements` batches open, the Director sequences the two
   lanes explicitly (denominator re-derivation covers the mechanics; the open
   question is owner-attention scheduling, not correctness).
3. **Governing-plan granularity** — one plan vs plan + per-batch runbook files.
   Resonance ran plan + runbook; at 11 batches a runbook-per-batch may be noise.
   Decide at R0 from the F1/F2 mechanism sizes.
4. **New-area arrivals mid-run** (a new top-level area directory created after SP2)
   — mechanically caught by re-derivation; the open policy question is whether new
   areas are born IN the new taxonomy (preferred — they should never enter the old
   structure once lanes exist) — F4's accretion policy should say so explicitly.
5. **The 149 unlinked docs** — whether unlinked-ness itself becomes a ledger
   disposition input (F3) or is purely descriptive. Sequencing-neutral, flagged for
   F3.
6. **Thread-record and prompts intent-leakage sweep scope** (B11 adjacents) — the
   freeze-rule verdict on these surface classes is F1's; if F1 verdicts them OUT of
   the freeze with a sub-reason (kit item 10), B11's sweep shrinks accordingly.
