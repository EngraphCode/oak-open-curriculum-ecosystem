# F4 — Intent layer and destination lanes

Facet design for the Oak plan-corpus refounding protocol (brief:
`tmp/refounding-designs/brief.md`, 2026-07-06). This facet owns: the
intent-layer derivation, destination-lane derivation (top-down from strategy
AND bottom-up from what the estate expresses), the conserving holding lane,
the three owner walks (lane-taxonomy ratification; batched mid-flight
rulings; final recomputed-state ratification), the coexistence/accretion
policy, two-way supersession banners, and live-lane coordination during
freeze and repoint. It designs against the Kiln/Basalt invariants I1–I12 and
the Wildfire I1–I10 as ground truth, and against ADR-200's standing rulings.

Notation: decisions are `D-n`, each with warrant and falsifier. Interfaces to
other facets are named, not designed.

---

## 1. The intent layer (D-1): standing owner-ratified wording, quoted verbatim, never re-authored

**Decision D-1.** The refounded corpus's intent layer is the EXISTING
owner-ratified wording, anchored verbatim at the head of the new corpus's
destination carrier (the new plans-root README / lane registry). It is:

- **T0 — Oak's mission** (VISION.md, verbatim): _"improve pupil outcomes and
  close the disadvantage gap by supporting teachers to teach, and enabling
  pupils to access, a high-quality curriculum."_
- **T1 — the diagnosis one-liner** (docs/strategy/README.md, settled):
  **"Deliver Oak's rigour at reach and at pace."**
- **T2 — the three value streams + named capabilities** (docs/strategy/
  alignment-and-streams.md and the three stream docs; owner signed off
  2026-06-20): MCP app · engineering tools · agentic framework; capabilities:
  knowledge-as-graphs, Oak Innovation Kit (capability, fourth-stream decision
  open).
- **T3 — the strategic-choice registry** (docs/strategy/README.md): the
  signed-off per-stream choices `APP-1..4`, `TOOLS-1..4`, `FRAME-1..4`, with
  the sanctioned optional decomposition `SDK-*`/`SEARCH-*`/`GRAPH-*`/`EEF-*`.

**Warrant.** ADR-200 records "vision + strategy STAND, at most minor tweaks,
NOT re-authored" — so Oak's r3-equivalent differs from resonance's exactly
here: resonance ratified north-star *wording*; Oak's wording is already
ratified and standing. The owner walk (Walk A, §6) therefore ratifies the
**lane taxonomy** derived beneath the standing wording, never the wording
itself. This also keeps the owner-gate count scale-independent (invariant
I8/I11).

**Mechanism.** The destination carrier quotes T0 and T1 verbatim (quotation,
not paraphrase — the intent layer is the owner's words, not an agent summary
of them) and links T2/T3 by path. The lane registry (§2) declares
`derives_from: [VISION.md, docs/strategy/README.md]` so the traceability
spine reads upward per the strategy's own contract ("every plan → strategic
choice → vision element → Oak goal").

**Falsifier.** If, during derivation, the estate yields strong evidence that
the standing strategy cannot anchor a materially large coherent body of live
work (beyond what the holding lane conserves, §4), that is surfaced as an
owner re-ratification candidate at a ruling batch — never silently absorbed
and never used to re-author strategy inside this protocol. (Same posture as
the V0 schema's "the survey may challenge a LOCKED decision".)

**Rejected alternative.** Re-authoring or "refreshing" vision/strategy as
part of the refounding — rejected: contradicts ADR-200's standing ruling,
adds an unbounded owner surface, and the refounding's warrant is corpus
organisation, not strategy revision.

---

## 2. The lane model (D-2): lanes are registered axis values that partition the corpus

**Decision D-2.** A **destination lane** is a registered organising cell of
the new corpus. The lane set forms a **partition**: every re-expressed plan
lives in exactly one lane; every lane is anchored to intent in exactly one of
three ways:

1. **choice-anchored** — the lane's anchor is a non-empty set of strategic
   choice IDs from the T3 registry (usually one stream's choices or one
   decomposed sub-family);
2. **capability-anchored** — the lane's anchor is a named capability from T2
   (knowledge-as-graphs; Oak Innovation Kit if the owner rules it in);
3. **the holding lane** — exactly one, anchor = `conserve` (§4).

Per the governing invariant ("every organising axis needs a registry +
validation — no free-text axes"), lanes become **registered values**, and
the defective free-text `serves_stream` axis is retired by this registry
(routing recorded in the conservation ledger; interface F1/F5).

**The registry artefact.** `lane-registry.md` at the new corpus root, with a
machine-readable frontmatter block validated by `repo-validators`
(interface F5). Entry shape:

```yaml
lanes:
  - lane_id: mcp-app-delivery        # kebab slug; stable; never reused
    name: "MCP app delivery"
    anchor_kind: choice               # choice | capability | holding
    anchor: [APP-1, APP-2, APP-3, APP-4]
    boundary: ""                      # owner's verbatim boundary sentence (Walk A)
    status: candidate                 # candidate | ratified | retired
    provenance: both                  # top-down | bottom-up | both
    ratified: null                    # { date, ruling_ref } after Walk A / a ruling
```

**Folder navigates, registry governs** (V0 doctrine). Each lane is one
top-level directory of the new corpus named by `lane_id`. The lane is NOT a
frontmatter field on plans (V0 explicitly dropped `collection`/`lane` keys as
folder-duplicating); membership is the folder location, and the governing
join is the plan's `serves_strategic_choice` value, validated against the
enclosing lane's anchor set.

**Validator rules** (specified here; built by F1, run by F5, each
prove-it-fires with a planted violation per invariant I4):

- **LR-1** — the set of lane directories equals the set of `status: ratified`
  registry entries (no unregistered directory; no empty registered lane
  without a ruling).
- **LR-2** — every plan's `serves_strategic_choice` resolves to a member of
  its lane's `anchor` set (choice-anchored lanes) or to the lane's declared
  capability sentinel (capability-anchored lanes).
- **LR-3** — the `"pending"` sentinel is valid ONLY inside the holding lane.
  Anywhere else in the new corpus it is a red gate. (This converts V0's
  pending-gate from an open-ended tolerance into a located, countable state.)
- **LR-4** — holding-lane plans are `kind: strategic`, carry a
  `promotion_trigger`, and carry provenance to their frozen spec (§4).
- **LR-5** — registry entries are append-only: `lane_id` values are never
  renamed in place or reused; a wrong lane is `retired` with a routing note
  and a successor entry (mirrors the strategic-choice ID discipline:
  stable, additive, resolvable).

**Warrant.** The recorded estate defects (free-text `serves_stream`, ~30
emergent statuses, 149 unlinked docs) are all instances of one failure:
organising axes without registries. Lanes are a new organising axis; creating
them WITHOUT a registry would re-plant the defect the refounding exists to
cure. The partition property is what makes the per-lane conservation
arithmetic (F1 tiling per tranche) and the Walk C counts well-defined.

**Falsifier.** If evidence shows a material class of plans genuinely serving
two choices at equal weight (the V0 "exactly 1 (finest published ID)" rule
breaking on real content), that is a V0-schema escalation to the owner, not
a lane-model change — the lane partition survives by choosing the finest
resolvable anchor, per V0's own rule.

**Rejected alternatives.**
- *Lanes = the existing 17 area directories* — rejected: that is the cowpath
  (design-from-impact-not-the-cowpath); the census shows 2 areas ≈49% of
  plans and 149 unlinked docs — the current areas encode where work came
  from, not where it is going, which is precisely the harm resonance
  measured.
- *Lanes = threads* — rejected: strategy doc is explicit that streams and
  threads are different axes (a thread may cross streams); lanes are the
  destination axis, threads remain the continuity axis, joined via the
  V0 `thread` edge.
- *A `lane:` frontmatter field* — rejected: duplicates folder location; V0
  dropped exactly this key class as drift-generating.

---

## 3. Lane derivation (D-3): top-down seed × bottom-up evidence, converging on a candidate table

**Decision D-3.** Lanes are derived by a two-sided procedure — a top-down
candidate seed from the standing strategy, and a bottom-up evidence pass over
the frozen inventory — converging on a **candidate-lane table** that is the
sole input to Walk A. Neither side alone decides: strategy without estate
evidence produces empty cathedrals; estate clustering without strategy
anchors reproduces the cowpath.

### 3.1 Top-down seed (deterministic, zero LLM tokens — invariant I1)

Enumerate candidates mechanically from T2/T3:

- one candidate lane per stream's choice family (`APP-*`, `TOOLS-*`,
  `FRAME-*`);
- optional decomposition candidates where the registry already sanctions it
  (`SDK-*`/`SEARCH-*`/`GRAPH-*`/`EEF-*`);
- one candidate per named T2 capability (knowledge-as-graphs; Oak Innovation
  Kit — flagged with its open fourth-stream decision);
- the holding lane (always present, §4).

This is a script over the strategy corpus's registry table, not judgement.

### 3.2 Bottom-up evidence (a placed judgement stage — interface F3)

Every work-bearing inventory unit (F1's denominator; per-source briefs per
F2) receives a **lane-evidence verdict**: which candidate anchor(s) its
content serves, or `no-acceptable-anchor`. Placement of judgement (Kiln Q2
doctrine — judgement is placed and named):

- **Workers (F2) extract, never classify.** Worker output is verbatim
  evidence: the plan's own stated goal/`serves_*` values/thread references,
  quoted with file:line anchors. Any lane assignment by a worker is a
  refusal-clause firing.
- **Lane assignment is a quorum judgement stage** (F3 owns execution): cheap
  wide pass, 3 same-model lenses (n_eff ≈ 1.4 — treat agreement as weak
  evidence), assignment against the CLOSED candidate menu from §3.1 plus the
  two sentinels `no-acceptable-anchor` and `new-lane-candidate: <named>`.
  Contested units and all `no-acceptable-anchor` / `new-lane-candidate`
  verdicts escalate to cross-regime adjudication (the measured 40%
  one-directional cross-regime disagreement makes single-regime routing of
  material into the holding lane unsafe — routing to holding is
  loss-adjacent even though it conserves, because it removes material from
  strategic attention).
- **Conserve-by-default tie-break:** a unit contested between a
  choice-anchored lane and the holding lane goes to the choice-anchored lane
  candidate list and is flagged for a ruling batch — never silently held.

### 3.3 Convergence → the candidate-lane table

A script (F1) folds the verdicts into the table Walk A consumes. Per
candidate lane: anchor, one-sentence draft boundary, provenance
(top-down / bottom-up / both), evidence weight (unit count, line count,
source-file count — all recomputed from the inventory, never hand-tallied),
and 3–5 exemplar refs **by stable inventory id** (kit item 6 — never line
numbers). Plus two residue lists: `no-acceptable-anchor` clusters (holding
candidates) and `new-lane-candidate` clusters (§5).

**Seed hypothesis (hypothesis-grade, evidence decides — recorded so Walk A
prep can start; NOT a pre-decision).** Current areas → likely anchors:

| Current area (old estate) | Likely anchor | Note |
| --- | --- | --- |
| curriculum-mcp-path-to-ga, sdk-and-mcp-enhancements, compliance | `APP-*` | app release arc + packaging/vendor path |
| semantic-search | `SEARCH-*` or `TOOLS-4` | decomposition question for Walk A |
| connecting-oak-resources, exploring-open-education-resources | `GRAPH-*` / `TOOLS-3` | Oak vs third-party split may not survive intent-first re-cut |
| sector-engagement (eef) | `EEF-*` / `TOOLS-3` | |
| developer-experience, discovery | `TOOLS-*` | SDK publishing / being-found |
| agentic-engineering-enhancements, agent-tooling, product-development-governance | `FRAME-*` | the two-areas-≈49% concentration lives here — expect Walk A to consider splitting |
| observability, security-and-privacy, architecture-and-infrastructure | cross-cutting — mostly `APP-*`-serving | genuine Walk A question: per-choice absorption vs a quality-substrate lane candidate |
| school-data-search, user-experience, icebox | holding-lane candidates | each unit individually adjudicated, never area-wholesale |
| upstream-feature-requests | new-lane-candidate or FRAME | coordination surface, weak strategy fit — expect a ruling |

**Warrant.** Resonance's r3 derived four pillars from strategy alone and it
worked at 15 sources; Oak's owner directive explicitly names the difference
("not all Oak plans align with the current vision/strategy — understand them
fully, identify what they express") — so the bottom-up side is mandatory
here, and it is exactly the stage where "if they make judgements we lose
information" bites: hence workers extract, quorum classifies against a
closed menu, cross-regime guards the loss-adjacent routings.

**Falsifier.** If the wide pass yields > ~25% `no-acceptable-anchor`, the
candidate seed is wrong (too coarse or mis-cut), not the estate: halt
(interface F3 halt conditions), re-derive the seed, re-run — do not bulk-load
the holding lane. This threshold is a declared halt condition, set before the
pass runs.

**Rejected alternative.** Unsupervised clustering of the corpus to "discover"
lanes without the strategy seed — rejected: produces provenance-shaped
clusters (the disease), and the closed-menu design is what makes the
judgement stage quorum-checkable at all.

---

## 4. The holding lane (D-4): conserving, chartered, never an open holding state

**Decision D-4.** Exactly one holding lane, working name
`conserved-holding` (owner may rename at Walk A). It conserves material that
is **coherent but not currently strategic** — honouring never-discard — in a
form that satisfies the estate's no-open-holding-state doctrine.

**Shape of a held item.** A V0-conformant plan with:

- `kind: strategic` (the sanctioned indefinite form — V0's own model: a
  strategic plan with a `promotion_trigger` is legitimate durable intent, no
  expiring gate required; this is how the design avoids re-creating a
  `paused` dumping ground);
- `promotion_trigger`: the NAMED condition under which the material becomes
  strategic (e.g. "owner rules Oak Innovation Kit a fourth stream", "a
  committed user-facing product family with its own audience emerges", "the
  schools non-goal is revisited by explicit decision");
- `serves_strategic_choice: "pending"` — valid here and only here (LR-3);
- a **provenance block**: the frozen originals it conserves (frozen-archive
  paths), the conservation-ledger row ids, and the frozen-spec binding
  clause (the frozen sections remain the authoritative detail contract —
  kit item 2, applied from first draft);
- re-expression is real authoring: the held plan states what the material
  expresses in destination terms, it is not a link-farm to frozen files.

**The lane README** indexes every held item with its trigger (the
reachability invariant applies to the holding lane identically — held is
not hidden). The **held-item count and trigger census** are Walk C inputs
and a standing per-consolidation review surface thereafter.

**What may NOT enter the holding lane:** anything a choice-anchored lane
accepts (conserve-by-default tie-break, §3.2); duplicate/derived content
whose disposition is `merged-into` or `already-complete` (those are ledger
dispositions, F3's ownership — holding is for live coherent intent, not for
audit residue).

**Warrant.** The owner directive mandates a "safe holding lane for
not-currently-strategic material" and NEVER-discard; the estate's own
doctrine (V0 §3.4, no-hedging-vocabulary) forbids open-ended paused states.
`kind: strategic` + `promotion_trigger` is the pre-existing, owner-signed
reconciliation of exactly this tension — the design reuses it rather than
inventing a parallel state. The icebox collection is the precedent and a
Wave-input: its contents are adjudicated item-by-item like everything else.

**Falsifier.** If Walk C finds the holding lane holding > ~20% of
re-expressed plans, the lane taxonomy failed the estate (the strategy
anchors less of the live corpus than believed) — that is an owner
re-ratification conversation (D-1 falsifier path), not a bigger holding
lane.

**Rejected alternatives.** (a) Discarding or archive-only routing of
non-strategic material — forbidden by the directive and
knowledge-preservation doctrine. (b) A `HOLD` sentinel added to the
strategic-choice registry — rejected: pollutes an owner-signed strategy
registry with a non-strategy value; `pending`-scoped-to-lane achieves the
same validation with no strategy edit. (c) Per-area holding sub-lanes —
rejected: multiplies registry entries with no consumer; the trigger census
is the useful structure.

---

## 5. Newly-identified lanes (D-5): two exits, both owner-gated, neither silent

**Decision D-5.** A `new-lane-candidate` cluster (from §3.2, or discovered
mid-flight) has exactly two exits:

1. **Capability/choice-anchored lane via additive strategy extension** — if
   the cluster is coherent AND arguably strategic, the ruling batch presents
   it as a proposed **additive strategic choice** (the choice IDs are
   contractually "stable, additive, resolvable" — addition is the sanctioned
   change path) or as a named T2 capability lane. Owner rules; if accepted,
   the registry gains the choice/capability AND the lane in one ruling.
2. **Holding lane** — if coherent but not currently strategic: held per §4
   with a trigger naming what would revisit it.

There is no third exit. A cluster may never become a lane with no anchor
(that would be a free-text axis value wearing a directory's clothes), and
may never be dropped.

**Warrant.** The brief says "expect newly-identified lanes"; the governing
invariant says no free-text axis values; strategy stands but is additively
extensible by its own ID contract. This routes novelty to the owner at a
batched moment instead of either suppressing it or letting agents amend
strategy.

**Falsifier.** A cluster that resists both exits (incoherent residue) is a
mis-clustering: re-adjudicate its units individually (F3); units are never
forced into a lane to make a cluster tidy.

---

## 6. Walk A (D-6) — the lane-taxonomy ratification walk (r3-equivalent)

**Decision D-6.** One interactive owner walk, after the bottom-up evidence
pass and before ANY authoring into choice-anchored lanes. Scale-independent
duration: the walk is over the candidate table (expected 8–16 rows), never
over files.

**Inputs (prepared, all recomputed):** the candidate-lane table (§3.3); the
two residue lists with exemplars by stable id; the seed-hypothesis deltas
(where evidence contradicted the seed table — surfaced, not smoothed); the
holding-lane charter draft (§4); the accretion policy draft (§9); the
proposed banner texts (§10).

**Protocol, per candidate lane:** owner verdict ∈
`ratify | rename | re-bound | merge-with | split | reject→route`. The
boundary sentence is captured in the **owner's verbatim words** (r3
principle: the intent layer is the owner's words) into the registry's
`boundary` field. For `split`/`merge`, the affected evidence rows re-run
through §3.3 folding (script) and return at the next ruling batch — the walk
never blocks on re-tallying.

**Also ratified at Walk A (one sitting, because these are taxonomy-adjacent
policy, not new mechanisms):** the holding-lane charter + its name; LR-1..5
as the validation contract; the accretion policy (§9); the banner texts
(§10). NOT ratified here: proof-typed todos (F5's owner gate — separate
concern, separate sitting; noted as interface).

**Output:** one commit flipping ratified lanes to `status: ratified` in the
registry + a ratification record (a `ratified`-proof-kind decision record
naming date, verdicts verbatim, and the evidence table hash) — the record
recomputes (the record exists and matches), the decision does not (V0/PDR
`ratified` semantics).

**Warrant.** Resonance's r3 was the load-bearing owner moment; audit-adjusted
boundaries (their pillar that shrank by the proven-done set) require the
two-verdict audit results to be visible at the walk — hence sequencing after
the evidence pass. Bundling the policy ratifications keeps the owner-gate
count scale-independent (I8/I11).

**Falsifier.** If the walk cannot complete in ~2 hours because verdicts keep
demanding file-level reads, the candidate table was not decision-complete
(kit item 7 — a critic's/owner's brief is decision-complete or its findings
are noise): stop the walk, repair the table, resume. A walk that degrades
into corpus-reading is a prep failure, not an owner burden to push through.

---

## 7. Ruling batches (D-7) — batched mid-flight owner rulings

**Decision D-7.** Mid-flight owner questions accumulate in a structured
queue and are ruled in **batches at stable points** (F1/F6's batch
boundaries), except declared halt-class items which escalate immediately
(ping-before-escalate applies).

**Queue artefact:** `owner-rulings-queue.md` in the protocol's working
surface, append-only, one entry per question:

```yaml
- ruling_id: RQ-014                # stable, never reused
  class: lane-assignment           # see classes below
  question: ""                     # one sentence
  evidence: [inv-0231, inv-0245]   # stable inventory/ledger ids only
  options: []                      # closed options incl. recommendation + warrant
  blocking: false                  # true ⇒ halt-class, immediate escalation
  verdict: null                    # owner's words, verbatim, + date, at ruling
```

**Question classes** (closed; a question fitting no class is itself a
protocol-design finding): `lane-assignment` (cross-regime escalations from
§3.2), `new-lane-candidate` (§5), `holding-boundary` (strategic-vs-held
calls), `strategy-conflict` (old plan content contradicting standing
strategy — e.g. schools-serving material vs the owner-confirmed non-goal:
route to holding with the non-goal's own revisit trigger, or owner rules
otherwise), `additive-choice-proposal` (§5 exit 1), `taxonomy-amendment`
(post-Walk-A lane re-bound/split).

**Batch protocol:** at each stable point, the batch presents ≤ ~15 rulings,
each decision-complete (evidence by stable id, closed options, a
recommendation with warrant — present-verdicts-not-menus). Ruled verdicts
are recorded verbatim in the queue AND applied: registry amendments land in
the same commit as the ruling record. Expected volume: 3–6 batches across
the arc (one per major stable point), 15–30 minutes each.

**Warrant.** Resonance ran "a handful of mid-flight rulings" as the r3→r7
connective tissue; at 37× scale, unbatched rulings would either interrupt
the owner continuously or (worse) get answered by agents. Batching at stable
points matches owner-attention-at-action-moments; the blocking flag
preserves the halt path (F3's halt conditions must never queue behind a
batch).

**Falsifier.** If a single batch exceeds ~25 open rulings, the upstream
judgement stages are under-deciding (routing decidable items to the owner) —
audit the escalation criteria before running the batch.

---

## 8. Walk C (D-8) — the final recomputed-state ratification walk (r7-equivalent)

**Decision D-8.** One closing owner walk over the NEW estate, every number
recomputed at walk time (validators-must-recompute; resonance r7: "todo
counts recomputed at walk time, not read from records").

**Inputs, all live-derived at the walk (interface F5 — the plan-state
recomputation tool is the walk's instrument; if F5's build-first
recommendation lands, Walk C consumes tool output directly):**

- lane census: per-lane plan counts, per-lane conservation-ledger tiling
  result (rows green / total; zero gaps, zero overlaps — recomputed, F1);
- the holding-lane census: held items, triggers, per-item ledger rows;
- the `attested`-count per lane (F5's honest quality signal), presented as a
  number to drive down in the destination estate, never a blocker;
- the expected-deltas list from the accretion log (§9) — so growth since
  authoring is expected, not explained ad hoc (kit item 8);
- the two-verdict divergence summary (claim-vs-derived, F3/F5);
- residue: any inventory line without a green ledger row (must be zero or
  each carried by a metaloss declaration with sub-reason — kit item 10).

**Protocol:** owner walks lane by lane; verdicts: ratify the lane's
re-expressed estate; ratify or defer each retirement tranche (repoint-
before-retire landings, F1/F6, may be sanctioned per-tranche — the walk can
green some areas and hold others); rule any surprises (which become
final-batch rulings, same record shape as §7).

**Output:** the closing ratification record; sanction list for retirement
tranches; the refounding's self-archival trigger (F6 owns sequencing).

**Warrant.** The walk is what converts "the agents finished" into "the owner
ratified a recomputed state"; consuming only recomputed numbers is the
structural cure for ratifying a stale picture — the exact drift class the
estate's memory doctrine documents.

**Falsifier.** Any Walk C input that turns out to be hand-maintained rather
than recomputed is a protocol defect: halt the walk, wire the recomputation,
re-derive. A ratification over remembered state is void by design.

---

## 9. Coexistence and accretion policy (D-9): pre-declared, logged, mechanical where possible

**Decision D-9.** The coexistence window runs from the freeze commit (F1) to
the last retirement landing (F6). Policy, pre-declared and ratified at
Walk A (kit item 8):

**The old estate stays the live execution surface, per area, until that
area's tranche cuts over.** Post-freeze writes to old-estate files are
limited to three sanctioned classes:

- **C1 — live execution updates** (status/todo edits on actively-worked
  plans): allowed; caught mechanically by denominator re-derivation at every
  merge into the working branch (I2/I6) — deltas enter the inventory as
  addenda at the next stable point (scripted diff of freeze manifest vs main
  HEAD; F1).
- **C2 — genuinely new plans needed by live work**: authored where the work
  is. Before Walk A: into the old estate, V0-form, AND appended to the
  accretion log. After Walk A: **directly into the ratified lane** in the
  new corpus (new work never lands in a surface already scheduled for
  retirement once a home exists), accretion-logged.
- **C3 — banner insertions** (§10): scripted, coordinated (§11).

Any other write class to a frozen-covered file is drift the re-derivation
surfaces for adjudication — not forbidden by fiat (the estate is live and
sovereign), but never silent.

**The new estate accretes only under named sanction.** Before Walk A: only
scaffolding + the candidate registry. After Walk A, into not-yet-ratified
new plans: owner additions (ruling-referenced) and C1-mirroring state syncs
from old-estate deltas (source-referenced). Every accretion appends to the
**accretion log** (append-only, `{date, target, class, source_ref}`) — the
artefact that makes Walk C's deltas expected.

**Per-area cutover** (the moment the new lane becomes authoritative for an
area): requires that area's ledger rows green + loss-bearing-class rows
adversarially challenged (F3) + banners in place (§10) + coordination clear
(§11). From cutover, first-read routing points at the new lane; old files
remain bannered-live until their retirement tranche lands (repoint-before-
retire, one commit per tranche, F1/F6).

**Warrant.** Resonance's one post-freeze arrival was caught by a critic —
"luck-shaped diligence"; at Oak's daily-merge velocity, uncoordinated
coexistence is a certainty, not a risk. Pre-declared write classes + a
mechanical re-derivation net + an accretion log turn the live estate from a
threat to the denominator into ordinary, expected inputs.

**Falsifier.** A Walk C delta not covered by the accretion log or the
re-derivation addenda means a write class escaped the policy — that is a
protocol defect to root-cause (which class? which surface?), and the tranche
containing it does not retire until resolved.

---

## 10. Two-way supersession banners (D-10): two banner classes, scripted, additive

**Decision D-10.** Two banner classes, both inserted by script (F1 —
mechanical, zero judgement, idempotent, self-excluding from probes per kit
item 4), both **additive** (history is annotated, never rewritten — I12;
consistent with the no-tombstones seam: these are history-record surfaces,
not living doctrine).

**B1 — "under refounding"** (at freeze, on every in-scope live original):

```markdown
> **Under refounding (2026-MM-DD).** This file is within the plan-corpus
> refounding's frozen denominator (freeze manifest: <path>). It remains the
> live surface for its area until cutover, but do not treat its lane
> placement or status vocabulary as destination truth. Protocol record:
> <path>.
```

**B2 — "superseded by"** (at tranche cutover, per file, generated from the
conservation ledger — the ledger's `named-home` rows are the data source, so
the banner can never point somewhere the ledger did not prove):

```markdown
> **Superseded (2026-MM-DD).** The content of this plan is conserved and
> re-expressed in <new-lane>/<new-plan> (conservation ledger rows <ids>).
> The frozen original is <frozen-archive-path> — it remains the
> authoritative detail contract for any conserved todo that binds to it.
> This file is retained for history and retires with tranche <id>; do not
> execute from it.
```

Where a frontmatter block exists, the script also sets
`superseded_by: <new-plan-id>` (and `disposition: superseded` where a
`status`-bearing block permits it without schema breakage); for the ~38
frontmatterless files the body banner alone is load-bearing. Frozen archive
copies are NEVER bannered (byte-identity is inviolable); banner-only diffs
on live files are a known, closed diff class the denominator re-derivation
recognises by exact banner-text match (closed sanctioned-survivor set).

**The forward direction** is carried by the new plan itself from its first
landed draft (r4 discipline): `supersedes:` frontmatter edges + a Provenance
section naming the frozen originals, ledger rows, and the frozen-spec
binding clause. **First-read surfaces** (`.agent/plans/README.md`,
`.agent/plans/high-level-plan.md`, the VISION.md "How we achieve this" link
row) get one routing update per event: a refounding notice at Walk A, a
routing-row update at each tranche cutover, durable pointers at retirement.
(Resonance's interim/durable two-step was context economics, per their
do-not-copy list — Oak collapses it to per-event updates on three named
surfaces.)

**Warrant.** The two-way banner is what keeps the coexistence window honest:
no fresh reader is ever routed into an unsigned estate in either direction.
Generating B2 from ledger rows makes the banner a projection of proven
conservation rather than a hand-written claim.

**Falsifier.** A B2 banner whose ledger rows do not recompute green is a
generator defect and red-gates the tranche; a first-read surface still
routing to a retired path after its tranche's landing fails the link/
reachability validation (F1's probe set, closed-survivor form).

---

## 11. Live-lane coordination (D-11): claims registry + shared comms log + commit queue, per tranche

**Decision D-11.** The estate is live (active threads, daily merges, running
multi-agent sessions). Every refounding operation that WRITES to a surface a
live lane may own coordinates through the estate's existing mechanisms —
named concretely:

- **The claims registry** — `.agent/state/collaboration/active-claims.json`
  via `pnpm agent-tools:collaboration-state`. The refounding seat registers
  an area-scoped claim BEFORE freeze-bannering (B1), cutover-bannering (B2),
  first-read routing edits, or a retirement tranche touches that area
  (register-active-areas-at-session-open; the claim names the operation and
  its window).
- **The consultation tripwire** — respect-active-agent-claims: before
  operating on an area named in another agent's active claim or recent comms
  entry, consult → decide → log. The decision options are the rule's own
  (proceed-with-caution with the overlap documented on the claim; a directed
  comms ping citing the other agent's `claim_id`; a decision thread under
  `.agent/state/collaboration/conversations/`; joint decision; owner
  escalation). **Default for the refounding: an area under an active
  third-party claim is DEFERRED to a later batch rather than contested** —
  batch order is F6's to re-sequence, and the freeze COPY (read-only) is
  always safe; only the writes wait.
- **The shared comms log** —
  `.agent/state/collaboration/shared-comms-log.md`: a freeze-window
  declaration event at freeze; a per-tranche cutover announcement (what
  routes where, from when); directed pings for overlaps. All timestamps UTC.
- **The commit queue** — `pnpm agent-tools:commit-queue` declared commit
  windows serialise the two commit classes that must not interleave with a
  concurrent merge: the atomic freeze+denominator commit (I2) and each
  repoint-before-retire tranche commit (I9/I10).
- **Daily merges to main** are not fought, they are absorbed: denominator
  re-derivation at every merge into the working branch (I2/I6, F1's
  mechanism) plus the §9 addenda diff. Coordination prevents collisions on
  writes; recomputation makes the reads immune.

**Warrant.** Resonance ran three concurrent seats through the same shape
(claims + all-channels watcher + declared commit windows) with zero
collisions — and Oak already operates every one of these mechanisms as
standing rules; the design adds no new coordination machinery, only the
per-tranche claim discipline and the defer-don't-contest default.

**Falsifier.** Any refounding write that lands on an area with an active
third-party claim and no logged consultation decision is a protocol breach
regardless of outcome — the logged decision is the artefact that proves
coordination (the rule's own standard).

---

## 12. Interfaces to other facets

| Facet | This design consumes | This design supplies |
| --- | --- | --- |
| F1 mechanical-substrate | freeze manifest + denominator; inventory with stable ids; per-lane tiling arithmetic; banner-insertion + registry-validation + candidate-table-folding scripts; merge re-derivation + addenda diff | LR-1..5 validator specs; B1/B2 banner texts + generation rule (ledger-driven); the closed banner-diff class; first-read probe targets |
| F2 worker-layer | verbatim lane-evidence extraction (goal statements, `serves_*` values, thread refs) under refusal clauses | the rule that lane assignment is never worker work (a worker emitting a lane is a refusal-clause task-design failure) |
| F3 judgement + error-correction | quorum execution of the lane-assignment stage; cross-regime adjudication of `no-acceptable-anchor` / `new-lane-candidate` / holding routings; halt conditions | the closed candidate menu + sentinels; the conserve-by-default tie-break; the >25% residue halt threshold; escalation classes feeding the rulings queue |
| F5 recomputable-state | the recomputation tool as Walk C's instrument; attested-count signal; registry validation runtime | LR-3/LR-4 as validator rules; the holding-lane trigger census as a standing recomputable view; note: proof-typed-todos owner gate stays F5's, separate sitting from Walk A |
| F6 sequencing | stable points hosting ruling batches; tranche ordering; pilot-area choice | per-area cutover preconditions (§9); the defer-on-active-claim re-sequencing constraint (§11); Walk A/C as phase boundaries |

---

## 13. Owner gates (F4's contribution to the scale-independent spine)

1. **Walk A** — lane taxonomy + boundaries (verbatim), holding-lane charter
   + name, LR validation contract, accretion policy, banner texts. One
   sitting, ~60–120 min.
2. **Ruling batches** — 3–6 batches × 15–30 min at stable points; halt-class
   items escalate immediately.
3. **Additive strategic-choice / capability-lane proposals** — inside ruling
   batches (§5), never agent-decided.
4. **Walk C** — recomputed-state ratification + per-tranche retirement
   sanction, ~60–90 min.

Total owner wall-clock for F4's gates: ≈ 3.5–6 h across the arc,
scale-independent (driven by lane count and ruling count, not file count).

---

## 14. Cost model sketch (grounded in the measured priors)

- **Top-down seed, candidate folding, registry validation, banners:**
  scripts; zero LLM tokens (I1). Build cost sits in F1's estimate.
- **Bottom-up lane-evidence pass:** ~618 files (minus F3's mechanical
  pre-partition of terminal/sweep-class sources — Kiln Q1.4 suggests the
  live work-bearing subset is materially smaller; assume 350–450 enter the
  judgement stage). Per file: decision-complete brief ~2–4k tokens in,
  ~0.3k out, 3 cheap lenses ⇒ ~4–7M tokens cheap tier. Cross-regime
  escalations: with the measured 40% cross-regime disagreement applied to
  the contested + sentinel subset (est. 15–25% of files), ~60–110 files ×
  ~10k tokens expensive regime ⇒ ~0.6–1.1M tokens. Dominant lever confirmed
  as turns × context, not tier — briefs are single-turn, closed-menu.
- **Walk preparation:** candidate table + census generation is scripted;
  the human-readable walk pack is one authoring session (~50–100k tokens).
- **Wall-clock:** evidence pass 1–2 sessions batched per F1's batch
  structure; walks and batches as §13. F4 adds no long-pole to F6's
  critical path except the Walk A ordering constraint (no choice-anchored
  authoring before ratification; holding-lane and scaffolding work may
  proceed under candidate status only as drafts).

---

## 15. Open questions

1. **Lane granularity for the TOOLS decomposition** (`SDK/SEARCH/GRAPH/EEF`
   as separate lanes vs one tools lane) — evidence-weighted, Walk A decides.
2. **Cross-cutting quality surfaces** (observability, security, compliance,
   architecture): per-choice absorption vs a quality-substrate lane — a
   genuine Walk A question; the seed table deliberately does not pre-decide.
3. **Oak Innovation Kit** — capability lane now vs waits on the open
   fourth-stream decision; interacts with the strategy README's recorded
   graduation trigger.
4. **Where the new corpus roots** (`.agent/plans/` refounded in place vs a
   new sibling root during the window) — F1/F6 own the mechanics; F4's only
   constraint is that lane directories and the registry are co-located and
   LR-1 can compute.
5. **Whether `.agent/milestones/` and `.agent/proposals/` fold into lanes or
   remain adjacent surfaces** — F1's freeze-rule verdict per surface class
   decides inclusion; if included, their content routes through the same
   candidate menu.
6. **`serves_stream` retirement path** — replaced by lane membership +
   `serves_strategic_choice`; the ledger records the routing; confirm no
   live tooling consumes the free-text field before retirement (verify at
   plan-author time, kit item 5).

---

## 16. Rejected alternatives (consolidated)

| Alternative | Reason rejected |
| --- | --- |
| Re-author vision/strategy wording as part of refounding | ADR-200: vision + strategy STAND; unbounded owner surface; wrong warrant |
| Lanes = existing 17 areas | The cowpath; encodes provenance, not destination; measured harms (49% concentration, 149 unlinked) |
| Lanes = threads | Streams and threads are different axes by the strategy's own contract |
| `lane:` frontmatter field / free-text lane values | Re-plants the free-text-axis defect; V0 dropped the key class; violates the governing invariant |
| Discard or archive-only routing of non-strategic material | Owner directive: NEVER discard; knowledge-preservation doctrine |
| Holding lane as an open `paused` state | V0 §3.4 / no-hedging-vocabulary forbid it; `kind: strategic` + `promotion_trigger` is the sanctioned form |
| `HOLD` value in the strategic-choice registry | Pollutes an owner-signed strategy registry with non-strategy |
| Unsupervised corpus clustering to discover lanes | Produces provenance-shaped clusters; destroys quorum-checkability of the judgement stage |
| Workers assigning lanes | The owner's "if they make judgements we lose information"; resonance's measured judgement-leakage taxonomy |
| Unbatched ad hoc owner rulings | Interrupt cost at 37× scale; batching at stable points preserves owner-attention-at-action-moments; halt class keeps the escape valve |
| Interim + durable pointer two-step on first-read surfaces | Resonance's own do-not-copy list marks it context economics, not method |
| Contesting active claims to keep batch order | Defer-don't-contest is cheaper and the claims rule's consultation artefact makes deferral auditable |
