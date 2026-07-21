# Public-alpha delivery plan × planning-estate resumption — concept exploration

**Date:** 2026-07-21
**Seat:** Moth mends Dreamscape (92e9d6), Implementer
**Trigger:** Owner aside (2026-07-21, in-session): "once the current PRs are in, then the next
piece of work is to resume the planning estate work, and to create a delivery plan for the
public alpha over the next 3 weeks."
**Status:** Concept exploration only — no plan authored, no implementation. Runs the
four-movement workflow (`.agent/skills/concept-exploration/SKILL-CANONICAL.md`).

## Movement 1 — raw observations

Load-bearing observations, each verified first-hand this session:

1. **The owner named two work items as one "next piece"**: (a) resume the planning-estate
   work, (b) create a delivery plan for the public alpha over the next 3 weeks. The
   conjunction is the owner's, not an inference.
2. **"Current PRs" is a small, near-term set**: #458 (AIP-165), #460 (AIP-166), #461
   (AIP-167) open; #459 is the draft coordination-branch PR; #437 (WAD projection) remains
   open with a stale claim. The precondition clears on the order of days, not weeks.
3. **M2 "Open Public Alpha" reads ~95% in the path-to-GA roadmap** (frontmatter
   last-updated 2026-07-14), with named residuals: Sentry+OTel foundation IN PROGRESS,
   deployment evidence bundle, user-facing widget search UI (WS3/WS4) NOT STARTED.
4. **The public-alpha experience contract** (`.agent/plans/user-experience/
   public-alpha-experience-contract.md`) sets a deliberately minimal UX baseline (SDK works;
   search works; MCP server works; basic ChatGPT branding), seven no-go conditions
   (observability evidence among them), and an undecided **Option X / Option Y** UI-surface
   gate (Claude MCP-Apps branding before alpha vs ChatGPT-only first).
5. **The teacher-workflows concept exploration** (`.agent/research/
   public-alpha-teacher-workflows-concept-exploration.md`, exit pass 2026-07-13) concluded:
   remaining work is *evidence gathering* (teacher discovery, host capability probes,
   scenario evaluation) plus a **product-governance decision** — the M2 milestone record does
   not yet name lesson-preparation / engagement-localisation as ratified workflow scope.
   Planning is explicitly listed as the mode *after* those.
6. **The planning-estate arc is gated**: restatement-remediation is the active effort
   (d1 pr-lifecycle hardening ✅, d2 audit module ✅, d2-fleet-run PENDING on the v2 cycle,
   prevention validators pending). The refounding lanes resume at the
   cures-landed + freeze-recut gate; then the owner sequences the big push. Within the
   estate work, WS2 (idea-node schema) is owner top priority and **WS4 thin-slice proof is a
   HARD GATE** before the full harvest (ADR-200; thread record).
7. **ADR-200 declares V0 = "the form new plans take."** New plans are supposed to be born
   in the refounded shape once it exists.
8. **The restatement-remediation defect class** — authored restatement of derivable state —
   was exposed by a *plan-adjacent docs PR* (#390, 8 rounds / ~38 findings, one generator).
   Any newly authored delivery plan is prime habitat for the same class.
9. Three weeks from the directive ≈ **2026-08-11**.

## Movement 2 — the problem space

**Kind of thing:** a sequencing-and-authoring problem across two co-active programmes that
share owner attention and fleet capacity — not a feature-build problem.

**The gap.** No single artefact sequences the alpha's residual scope against a date. The
milestone truth is distributed across surfaces with different snapshot dates (roadmap says
~95%; the contract names an undecided UI gate; the workflows exploration names an
unresolved scope decision). Meanwhile the planning system that would naturally host a
delivery plan is itself mid-refounding.

**Who it harms.** The owner (no legible 3-week commitment surface); teachers (alpha slips
or ships with an incoherent scope claim); implementers (ambiguity about which lane has
priority when both bid for the same seats).

**Causal mechanism.** Milestone state is derivable but not currently derived in one place;
the estate deliberately keeps dates out of permanent docs (no-moving-targets), so a *delivery
plan* is the one legitimate home for a dated sequence — and it doesn't exist yet.

**Constraints carried into any solution:**

- The seven no-go conditions bind the alpha claim regardless of the date.
- Three owner-gated decisions sit upstream of scope certainty: Option X/Y; teacher-workflow
  milestone scope; the alpha evidence bar (what "verified" means for Sentry+OTel).
- The restatement-remediation gate is not bypassable (no escape hatches); the refounding's
  freeze windows constrain plan-corpus writes at specific moments.
- Small-PR / ticket-first / DORA discipline applies to the plan's execution.
- 3-week wall-clock with a fleet that is also finishing the current PR set.

**Success.** A delivery plan exists that (a) derives the alpha's residual scope from live
evidence rather than restating snapshots, (b) sequences it into ~3 weeks with the owner
decision-gates scheduled *early*, (c) is authored in a form deliberately chosen relative to
the refounding (not accidentally either side of it), and (d) does not fork authority from
the path-to-GA programme index — it sequences; the sub-plans own the work.

## Movement 3 — inherited shapes interrogated

1. **"Write a plan file listing the remaining M2 items" — the fluent first answer — is the
   restatement defect class.** A delivery plan that copies check-states, percentages, and
   PR statuses into prose is exactly the generator behind PR #390's eight rounds. The plan
   must *point* at live surfaces and derive its residual-scope claims at authoring time,
   citing the derivation.
2. **"Resume estate work, THEN author the plan" inherits an execution-order reading the
   owner has explicitly rejected elsewhere** — the estate doctrine is informational
   dependence, not execution order. The two items can and probably should interleave.
3. **The tempting coupling — author the alpha plan as the ADR-200/V0 thin-slice proof
   (WS4) — is attractive and risky.** Attractive: the alpha plan becomes the first
   idea-graph-native plan, discharging WS4 with a real artefact. Risky: it makes a dated,
   owner-priority commitment surface hostage to an unproven substrate. WS4 is a hard gate
   for the *harvest*, not a licence to put a delivery date on unproven rails.
4. **"Delivery plan" need not mean a new authority.** The path-to-GA programme index
   already owns sequencing; the missing layer is *dates + capacity + decision-gate
   scheduling*. The plan should be a thin dated overlay consuming the programme index, not
   a rival restatement of it.
5. **"Public alpha over the next 3 weeks" is ambiguous** between "the alpha ships within
   3 weeks" (a launch window) and "the plan covers the next 3 weeks" (a planning horizon).
   The two produce different plans. This is an owner-vocabulary question, not decidable
   from the repo.

## Movement 4 — synthesis and proposals

**Changed framing.** This is **one planning act with two products**: resuming the
planning-estate arc supplies the *form and discipline*; the public-alpha delivery plan is
the first high-stakes *consumer* of that discipline. The alpha plan is itself a
planning-estate artefact — where and how it is born is a deliberate estate decision, not an
accident of timing.

**Proposed next steps** (each with warrant and falsifier; none started):

| # | Proposal | Warrant | Falsifier |
|---|---|---|---|
| 1 | **Pre-plan truth pass**: before any plan text, recompute M2 residual scope from live surfaces (Sentry+OTel plan state, widget WS3/WS4, deployment evidence bundle, Option X/Y evidence, workflow-scope decision status, Linear board) and publish the derivation | The roadmap (~95%), contract, and exploration snapshots carry different dates; restatement doctrine requires derivation over restatement | A fresh recompute exactly matches the roadmap row — the pass was cheap insurance and the plan cites it anyway |
| 2 | **Schedule the owner decision-gates in week 1** of the window: Option X/Y; teacher-workflow M2 scope (the governance decision the workflows exploration exit named); the alpha evidence bar | These gates bound scope; a late gate burns the window on work that may be out of scope | The owner resolves all three in the plan-authoring sitting itself, collapsing the gate step into authoring |
| 3 | **Decide the plan's substrate deliberately, as an owner call** — recommended: author under current conventions with explicit ADR-200 lineage marks, flagged as early harvest input; do NOT make it the WS4 thin-slice proof | The dated commitment must not be load-bearing on an unproven substrate; WS4 stays a hard gate discharged on lower-stakes material | WS2+WS4 are already proven by authoring time, making V0-native authoring cheap and strictly better |
| 4 | **Capacity verdict to the owner via the Director**: for the 3 weeks, the alpha lane takes fleet execution priority; the estate arc advances at owner-sitting cadence (decisions and gates, not fleet execution), with remediation v2/fleet-run sequenced so it never contends with alpha-critical seats | The alpha has a date; the estate has a gate. Gates wait; dates do not | The owner states the reverse priority, or the truth pass shows the alpha residuals are smaller than they read and both fit |
| 5 | **The delivery plan is a thin dated overlay** on the path-to-GA programme index — it owns dates, capacity, decision-gate schedule, and the go/no-go evidence checklist; the sub-plans keep owning the work | Prevents authority forking and the restatement class structurally | Review shows the overlay cannot express a needed sequencing constraint without owning work detail, forcing a scope amendment |

**Assumptions that changed during the exploration:**

- "Two work items" → one planning act, two products.
- "Plan = new document enumerating work" → plan = dated derivation-citing overlay.
- "Estate first, then plan" (or vice versa) → interleaved, with the substrate choice made
  explicitly.

**Unresolved evidence that could materially change the synthesis:**

- Owner intent on "3 weeks": launch window vs planning horizon (proposal shapes differ).
- Live state of the Sentry+OTel foundation and widget WS3/WS4 (the truth pass, proposal 1).
- Whether the teacher-workflow M2 scope decision has already been taken somewhere not yet
  read (Linear / owner notes).
- Fleet shape over the window (how many seats, and whether the remediation v2 cycle is
  owner-scheduled inside or outside it).

## Routing

Per the exploration skill's boundary: this synthesis hands to the plan workflow when the
owner opens that work — it is not itself a plan. The owner-decision items above route
through the Director (Forge rides Brimstone, 398e24) per owner-directs-through-Director.
