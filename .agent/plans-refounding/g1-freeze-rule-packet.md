# G1 packet — freeze-rule ratification (RATIFIED 2026-07-07 — see §9)

> Decision-complete briefing for the owner's G1 sitting, per
> [`plan-corpus-refounding.plan.md`](../plans/product-development-governance/active/plan-corpus-refounding.plan.md)
> §Owner-gate register (G1 row) and the
> [design record](../reports/agentic-engineering/plan-estate-refounding-design-2026-07-06.md).
> Drafted 2026-07-06 by Stoat rides Gloaming (432a41); schema-v2 parse target trued
> 2026-07-07 by Leopard spins Moonrise (b07d1d) after cycle 1 landed. Every measured
> number below is **indicative at draft time**; the binding denominator is recomputed by
> `refound-freeze` at S0 (P2). The machine form of §1 is
> [`freeze-rule.json`](./freeze-rule.json) (draft, `ratifiedBy: null` until this sitting;
> the freeze script refuses to run on an unratified rule). **Parse target of the ratified
> rule: freeze-rule schema v2** (`agent-tools/src/refounding/freeze-rule-schema.ts`, the
> landed v1|v2 discriminated union) — ratifying §5's path-scoped sanctioned-writer
> classes fills v2's required `sanctionedWriters` array (`{ id, globs, reason }`, strict,
> all non-empty), whose globs follow from the §4 rooting ratified at this sitting. A rule
> ratified without path-scoped classes stays a valid v1 document; `refound-merge-recheck`
> consumes the classes to classify matching deltas `sanctioned` (reported separately,
> never silent, never auto-frozen).

## 1. Surface-class verdict table (ratification item 1)

Semantics: any file matching no declared class is **out** by default; `out` rows are
recorded so deliberate exclusions stay checkable (kit-10 discipline).

| Class id | Globs | Verdict | Sub-reason (kit-10 discipline) | Indicative measure (2026-07-06, worktree tip c8314eed0) |
| --- | --- | --- | --- | --- |
| `plans` | `.agent/plans/**` (ALL extensions) | **in** | The estate being refounded. No extension filter — extension filtering is a per-file judgement; non-md files conserve by byte-identity + whole-file ledger rows. | 619 md / 165,574 lines; 29 non-md; 336 `*.plan.md`; 22 top-level dirs |
| `milestones` | `.agent/milestones/**` | **in** | Intent-bearing plan-adjacent surface; trivial cost; excluding needs a reason, including needs none. | 5 md / 363 lines |
| `proposals` | `.agent/proposals/**` (ALL extensions) | **in** | Recorded proposals awaiting triage ARE conservable planning concepts; the refounding's disposition machinery is their triage. | 6 md + 9 non-md (15 files) |
| `plans-old-archive` | `.agent/plans-old-archive/**` | **sweep** | Sub-reason (a) re-derivable-from-structure: immutable-by-convention relocated archive. Non-terminal concepts caught by the scripted sweep; hits promote via denominator amendment (the archive is never modified in place). | 571 md |
| `prompts` | `.agent/prompts/**` | **sweep** | Live operational surface (session entry points); freezing would perturb running-session tooling. Sub-reason (a): entry-point prose re-derives from the plans it points at. Bounded leakage caught by sweep. | 66 md (+1 since design time — the R0 session opener itself: live proof of the sanctioned-writer need) |
| `thread-records` | `.agent/memory/operational/threads/**` | **sweep** | History records, not intent carriers; annotate-never-rewrite (I12). Sweep catches plan-shaped intent parked in records. | — |
| `reports-research-evals` | `.agent/reports/**`, `.agent/research/**`, `.agent/evaluations/**` | **out** | Assessment inputs, not plans (the plans README already routes them so). Sub-reason (a): referenced BY plans — the ledger conserves the referencing lines; the referenced documents stay live and untouched. | — |
| (default) | everything else | **out** | Not a planning surface. Freezing non-planning surfaces copies live doctrine/code out from under active lanes for zero conservation gain. | — |

Owner question 1: ratify the class table + verdicts + sub-reasons as
`freeze-rule.json` v1 (closed schema; unknown keys rejected).

## 2. Net-C keyword list (ratification item 2)

Case-insensitive MATCH, verbatim CAPTURE, closed list versioned inside the inventory
script (per-line application is mechanical; this list is the placed judgement, J1):

`status:`, `todo`, `next step`, `pending`, `blocked`, `depends`, `serves_`,
`supersede`, `thread`, `gate`, `owner`, `decision`, `acceptance`,
`definition of done`, `dod`, `follow-up`, `deferred`, `promotion trigger`

Derivation: the donor estate's keyword-class net ported to oak's observed corpus
vocabulary (two status vocabularies, V0 axes, PDR-018 gate/promotion language).
Changes after ratification = versioned amendment + re-ratification +
discrimination-proof re-run.

The list applies to non-fenced lines only — fenced code content captures nothing on
any net and clusters to its opening-fence anchor (F1 §9). Matching is case-insensitive
SUBSTRING matching; stems capture derived forms (over-capture is conservation-safe;
adjudication filters).

Owner question 2: ratify the Net-C list.

### 2a. Census completion-keyword list (ratification item 2a — C2, added with R0a cycle 3)

`refound-claim-census` extracts completion-claim lines through a second placed-judgement
list (versioned in-script as `COMPLETION_KEYWORDS_V1`, same mechanics as Net C:
case-insensitive substring MATCH, verbatim CAPTURE, non-fenced lines only; over-capture
is conservation-safe — adjudication filters). Ordered by measured frequency in the live
plans estate (2026-07-07):

`completed`, `complete`, `landed`, `closed`, `resolved`, `archived`, `superseded`,
`done`, `merged`, `retired`, `implemented`, `executed`, `shipped`

The C2 planted-defect proof pins both directions (a planted completion line is caught; a
misspelt one is not). Changes after ratification = versioned amendment plus
re-ratification plus discrimination-proof re-run.

Owner question 2a: ratify the census completion-keyword list.

## 3. Residue-orphan bounds (ratification item 3)

An anchored block is an orphan candidate iff (F1 §9):

- (a) it is a `file-preamble` block containing any non-blank line; or
- (b) its non-blank line count exceeds **25**; or
- (c) its file's anchor ratio is below **5%**.

Run-level sanity: whole-corpus anchor ratio outside **20–70%** = automatic
halt-and-inspect (net mis-fit signal, never pushed through).

Owner question 3: ratify bounds (a)/(b)/(c) + the sanity band as declared starting
values (re-examined at SP3; any change re-runs the discrimination proofs).

## 4. Destination-corpus rooting (ratification item 4 — design-record row 14)

**Recommendation (verdict): destination lanes root INSIDE `.agent/plans/` as new lane
directories, covered by the `new-lane-directories` sanctioned-writer class.** The
refounded corpus is the plan estate's next form, not a parallel estate — a separate
root would mint the competing-taxonomy risk ADR-200 §Consequences names, and the
coexistence machinery (P2 sanctioned classes + accretion log + merge-recheck) exists
precisely so protocol-authored writes inside the denominator are never self-noise
arrivals. A paired red gate (design row 14) rejects non-conforming content under the
new lane roots.

Alternative considered and not recommended: a separate `.agent/plans-refounded/` root
— cleaner freeze arithmetic, but it creates a second estate during coexistence and a
mass-move at cutover (higher retirement risk, and the competing-taxonomy smell).

Owner question 4: ratify the rooting class (or rule the alternative).

## 5. Sanctioned-writer classes (ratification item 5 — P2)

Writes inside the frozen denominator that are protocol-authored, never arrivals:

1. **new-lane-directories** — destination plans authored by the refounding (V0.1,
   proof-typed, accretion-logged) under the Walk-A-ratified lane roots.
2. **ratified-banner-diff** — the two scripted additive banner classes on live
   originals (banner text dry-run through validators pre-use; banners land AFTER
   freeze so frozen copies stay banner-free).
3. **accretion-logged-plans** — sanctioned owner additions to not-yet-ratified
   destination plans during the coexistence window, each logged to the accretion
   log (kit item 8).

Everything else arriving on `in` surfaces post-S0 is an arrival: `refound-merge-recheck`
flags it; the G3 routing table disposes it.

**Machine form (schema v2, landed with R0a cycle 1):** classes 1 and 3 are PATH-scoped
and become the ratified rule's v2 `sanctionedWriters` entries (`{ id, globs, reason }`;
globs concretised from the §4 rooting this sitting ratifies). Class 2
(`ratified-banner-diff`) is CONTENT-scoped and deliberately absent from v2:
banner-awareness stays strict byte identity for the whole tranche-3 horizon (banners
cannot exist before the R2 F4 policy), and the banner diff class lands as its own schema
version bump WITH that policy.

Owner question 5: ratify the three classes.

## 6. Sweep single-net residue (ratification item 6 — design row 12, P4)

The sweep surfaces (~59% of in-scope text: old-archive + prompts + thread records)
sit behind ONE keyword net. **Recommendation (verdict): adopt the reader-sample cure**
— a declared-rate sample of NON-hit sweep windows runs through `refound-reader` as a
second blind net (rate declared in the R0c cost ledger; candidate 10% of non-hit
windows, re-priced at SP3) — rather than signing the bare single-net residue. Either
way the marker-free work-bearing paraphrase plant (P4) must be CAUGHT before any
sweep zero is trusted.

Sweep-net candidate marker set (J1, drafted; ratify with this packet):
`todo`, `next step`, `not yet`, `pending`, `blocked`, `open question`, `unresolved`,
`follow-up`, `deferred`, `still needs`, `remaining`, `incomplete`, `carry-over`,
`promotion trigger`, `reopen`

The sweep scans every non-binary file on the sweep surfaces, all extensions.

Owner question 6: reader-sample cure at declared rate, OR sign the single-net residue
declaration knowingly.

## 7. What G1 does NOT decide (already ratified or later gates)

G-ADR/V0.1: done (2026-07-06). G2 (S0 landing sanction: denominator totals, scoped
gate exclusions with reasons, secret-scan attestation, commit window) and G3
(arrivals-routing table) follow R0a; Walk A owns lane taxonomy; OG-2 (status-mapping
table v1) and OG-3 (warn→enforce escalation) ride their own packets per the F5
design (OG-1 was signed as part of V0.1).

## 8. Riding agenda (non-binding; owner-directed 2026-07-07)

One discussion item rides the G1 sitting without being a ratification item: the
owner's **structural convictions and expected-shape priors** for the
post-refounding corpus — gathered here so they can land in VISION/strategy (or be
recorded as derivation inputs) BEFORE the R2 lane-seed derivation runs. This is
input-gathering only: the binding organisational-structure decision is Walk A's
lane-taxonomy ratification (with the R1 source denominator + census/divergence
report as sitting inputs), and post-corpus size numbers stay priors until G-SP3
presents the projection from pilot-measured merge/supersede/disposition rates.

## 9. Ratification record (2026-07-07 owner sitting, in-chat)

The G1 sitting ran in owner chat on 2026-07-07 (session: Goshawk calls Sundog,
970bdc, recording; rulings are the owner's). Every ratification item is ruled:

1. **Verdict table — RATIFIED as drafted**, under the owner's scope principle
   "ALL plans and plan-adjacent documents". The old-archive edge was put as an
   explicit question; the owner ratified **sweep + reader-sample** for
   `plans-old-archive` (the drafted shape): live concepts caught by net, sample,
   and amendment-promotion; the archive is never modified and never discarded.
2. **Net-C list — RATIFIED as drafted** (18 keywords, §2).
   **2a. Census completion-keyword list — RATIFIED as drafted** (13 keywords).
   Both drift-guarded by `validate-ratified-lists`.
3. **Residue-orphan bounds — RATIFIED as detection calibration** ((a)/(b)/(c) +
   the 20–70% sanity band as declared starting values, SP3-re-examined), under
   the owner's disposition ruling: detected orphans/residue are **absorbed,
   processed, and turned into plans — LLM workers make schema non-compliance a
   non-limit**; bounds detect and halt-inspect, they never exclude.
4. **Destination rooting — the owner RULED the separate root**:
   `.agent/refounded-plans/` for the run's duration; the terminal cutover action
   (R5/R6) is **archive the old `.agent/plans/` directory and rename
   `refounded-plans/` → `plans/`** (link-swept, validator-proven, per
   repoint-before-retire). Consequence: the destination sits OUTSIDE the frozen
   denominator, so protocol writes are never self-noise arrivals and the
   competing-taxonomy risk is time-bounded by the named terminal rename. The
   packet §4 recommendation is superseded by this ruling.
5. **Sanctioned-writer classes — RATIFIED EMPTY** (consequence of ruling 4:
   drafted classes 1/3 write outside the frozen scope and dissolve; class 2 was
   already deferred to its own schema bump with the R2 F4 banner policy). The
   ratified rule is therefore a clean **v1** document; every post-S0 write on
   `in` surfaces is an arrival routed by the G3 table. A class may be added
   later only by versioned amendment + re-ratification.
6. **Sweep residue — the READER-SAMPLE CURE at 10% of non-hit windows** (the
   drafted rate; cost-ledger declared, SP3-re-priced), covering all sweep
   surfaces including the old archive. The marker-free paraphrase plant (P4)
   must be caught before any sweep-clean verdict is trusted. The §6 sweep-net
   marker set (`SWEEP_MARKERS_V1`) is RATIFIED as drafted with this item.

**Walk-A derivation input (owner, verbatim direction):** "we lose ZERO CONCEPTS
OR UNDERSTANDING, but we can consolidate and deduplicate; I expect a small
number of high-quality thread-level plans, each with a collection of
implementation plans, and a bucket for plans that are not part of the current
delivery focus — but we throw nothing away." Mapping: thread-level plans = the
lane taxonomy anchored on threads (cardinality lane-derived); implementation
collections = the V0 lineage hierarchy; the bucket = the holding lane.

**Harvest-scope note (owner, 2026-07-07 — binds ADR-200 WS6, not this freeze):**
when the eventual concept extraction / intent-graph creation runs, it includes
**ALL live plans AND ALL archived plans in full — achieved concepts are as
first-class as intended concepts.** The refounding's archive-as-sweep verdict
(item 1) is a REFOUNDING-scope economy only; it does not narrow the harvest.
Recorded also in `planning-estate-rewrite.plan.md` §ws6.

`freeze-rule.json` now carries `ratifiedBy` pointing at this section. G1 is
DISCHARGED; S0 remains gated on G2 (the landing sanction, authored at R1 from
the freeze dry-run).
