---
id: pr-846-review-fleet
node_type: delivery
name: "PR #846 review fleet — multi-lens, multi-scale review of the identity-switchboard rebuild"
overview: >-
  An independently verified, adjudicated review verdict on PR #846 and its
  landed doctrine (DDR-009, the reference-first rule, the playbook additions),
  sufficient to decide un-draft readiness — produced by a goal-blind reviewer
  fleet with adversarial verification and a release-readiness synthesis.
status: sketch
ratified_by: null
ratified_date: null
ratified_where: null
serves: design-system-as-configured-framework
impact_areas:
  - design-system
  - practice-and-estate
tickets: []
depends_on: []
owner_gates:
  - awaiting: owner-decision
    clears_when: >-
      Jim sanctions fleet execution (W1) after reading this plan and the
      plan-review fleet's verdicts, with the agent-count and token estimate
      visible.
    expires: 2026-08-13
last_updated: 2026-08-10
---

# PR #846 review fleet — multi-lens, multi-scale review

## Goal

A trustworthy answer to one question: **is PR #846 ready to un-draft, and is
the doctrine that landed around it sound?** Today the only assessor of the
rebuilt estate (specimen, picker, side-by-side, their proof surface, the
fidelity register, DDR-009, the reference-first rule, the playbook additions)
is its author. What is true after this plan lands that is not true now: every
part of that estate has been examined by independent eyes at every scale that
matters, every finding carries a verified failure scenario or a recorded
refutation, the known open items have each been engaged or their misses named,
and the owner holds a GO / GO-WITH-CONDITIONS / NO-GO synthesis to rule on.

## First-principles check

- **Could it be simpler?** Yes — a solo re-read, or one code-expert pass. Both
  rejected on the merits: the risk being bought down is precisely
  single-perspective author blindness, which no amount of the same
  perspective cures. The fleet is the smallest instrument that buys
  *independence* across the scales the work spans. Conversely, anything
  larger (loop-until-dry finder rounds, mutation-style seeding) buys
  thoroughness the un-draft decision does not need — rejected as
  disproportionate.
- **Ends before means.** The review serves the un-draft decision and the
  soundness of doctrine other lanes will now consume. It is not review for
  its own sake; every leg exists because its absence would leave a class of
  defect invisible to the decision.
- **Goal-blind first, goals injected at adjudication** (standing review
  doctrine): reviewers examine artefacts and the reference without the
  owner's rulings, so ruled divergences surface as findings and prove the
  lens works; adjudication then injects the rulings. The exception is the
  frame-challenger, which is goal-AWARE by design — its question is whether
  the work serves the ruling, which cannot be asked blind.
- **Verified or refuted, never merely asserted.** Nothing reaches the owner
  as a finding without an adversarial verification pass; refuters default to
  *refuted* under uncertainty so plausible-but-wrong findings die in Phase 2.
- **Vendor call shapes verified at author time**: the Workflow tool's
  `agentType`, `schema`, `effort`, `pipeline`/`parallel` contracts are
  confirmed against the live tool schema this session; every `agentType`
  named below exists verbatim in the session's agent registry.

## Object and manifest (multi-part × multi-scale)

Parts:

| Part | Contents |
| --- | --- |
| P1 product code | specimen regions + CSS, picker (3 controls), side-by-side, shared components/hooks (`useScaledViewport`, `canonical-widths`, brand-identity binding, `LabelledSelect`, `Switchboard` export), brand sheets (studio-source + public copies) |
| P2 proof surface | 108 unit + 63 Playwright cells across 5 spec files + `apply-state.ts` helpers + `measurement-widths` unit tests |
| P3 design-system conformance | tokens-only discipline, kit class vocabulary, brand recomposition as data, `validate-authored-css` / `validate-kit-assets` coverage |
| P4 fidelity claims | `fidelity-register.json` (6 dispositions) vs the export reference, the fidelity instrument's residual ratios |
| P5 accessibility claims | the 18-cell identity×theme matrix, forced-colors cells (incl. the axe#3978 contrast disable), 320 reflow, focus/skip-link/sticky cures, picker control semantics |
| P6 doctrine | DDR-009 + README graph, `render-the-reference-before-reproducing` rule + projections, playbook §two governing rules + §Reference first, PR #846 body |

Scales: **S1 micro** (line/declaration/type), **S2 meso** (component/page
composition), **S3 macro** (system shape, boundaries, extractions), **S4
meta** (goal-alignment and frame), **S5 viewport** (the DDR-009 canonical
widths — visual legs measure at 320/390/768/1024/1440/1920).

Every P×relevant-S cell is assigned to at least one leg below; exclusions are
in **Out of scope** with reasons. That completeness claim is itself checked
twice: by the plan-review fleet before sanction, and by W2's completeness
critic after the run.

## Mechanism

Two Workflow invocations with the seat adjudicating between them — the fleet
is deterministic orchestration; judgement stays at the seat.

### W1 — goal-blind review + adversarial verification

**Phase 1 (parallel, 12 legs).** Each leg receives: the worktree path, the
diff range (`main...jimcresswell/design-identity-switchboard-pr2`), its
assigned parts/scales/questions, first-hand access instructions (below), and
the reference-first obligation (render the export before judging fidelity).
No leg receives the owner's rulings, the fidelity register's *rationales*
(the register file is repo-visible; legs are instructed to form their own
view of each divergence BEFORE reading rationales), or this plan's knowns
list. Findings are schema-forced.

| Leg | agentType | Effort | Parts / scales | Charge (summary) |
| --- | --- | --- | --- | --- |
| L1 | `code-expert` | high | P1 S1-S2 | Gateway correctness/maintainability sweep of the diff; name specialist signals |
| L2 | `react-component-expert` | high | P1 S1-S2 | Hooks/effects correctness: frame readiness races, `useScaledViewport`, theme binding, binder re-runs |
| L3 | `design-system-expert` | xhigh | P1+P3 S1,S3 | Token discipline, kit vocabulary fit, brand recomposition, light-dark arm pairing in both counter-brand sheets |
| L4 | `accessibility-expert` | xhigh | P5 S2,S5 | WCAG 2.2 AA: matrix coverage and validity, the forced-colors contrast disable's warrant, reflow probe soundness, focus management, control semantics; probes at canonical widths |
| L5 | `test-expert` | xhigh | P2 all | Describe-vs-audit, atomic landing, what behaviour is unproven, sentinel-pattern strength, helper honesty |
| L6 | `type-expert` | high | P1 S1 | Boundary narrowing (`?brand`, theme/width guards), zero assertions, closed unions |
| L7 | `architecture-expert-barney` | xhigh | P1 S3 | Simplification: the second-consumer extractions, the `canonical-widths` client mirror vs the tools module, module placement |
| L8 | `architecture-expert-wilma` | xhigh | P1+P2 S3 | Adversarial failure modes: cross-document lifecycles, ResizeObserver, dev-vs-prod divergence, the post-merge state with main |
| L9 | `docs-adr-expert` | high | P6 | DDR-009 pair audit (decision ↔ module), playbook accuracy vs implemented reality, rule projection consistency, register-as-record quality |
| L10 | `prose-expert` | high | P6 | Doctrine prose craft: DDR-009, the rule, the playbook additions, PR body |
| L11 | *(default)* fidelity instrument | high | P4 S5 | Run the fidelity pipeline against the export at canonical widths; judge each pair's residual on its own eyes before reading dispositions |
| L12 | *(default)* frame-challenger | xhigh | S4 | Goal-AWARE: given the owner's verbatim rulings, is this estate the right shape — what would a better shape look like, and is the difference worth anything? |

Model: every leg inherits the session model (exceeds the estate's Opus floor
for reviewer dispatches; the standing fallback rule permits only
capability-upward substitution).

**Dedup (deterministic script code, the one barrier).** Findings keyed by
`file :: line-bucket(±5) :: category`; residual near-duplicates merge at
adjudication. If deduped findings exceed **40**, the top 40 by leg-assigned
severity proceed to verification and the drop count is `log()`ed loudly (no
silent caps); dropped findings still reach adjudication unverified and are
marked so.

**Phase 2 (dynamic, ≤80 legs).** Each surviving finding gets two independent
goal-blind refuters, both instructed to default to *refuted* under
uncertainty: (a) **empirical** — reproduce the failure scenario first-hand or
refute it; (b) **evidence-quality** — is the scenario concrete, the evidence
first-hand, the claim about the artefact rather than about taste. Survival
requires both non-refuted. Effort `high`. Materiality and goal-alignment are
deliberately NOT Phase-2 questions — they are adjudication's, so refuters
stay goal-blind.

**Exit criteria.** W1 is single-pass by construction: 12 + (2 × ≤40) + zero
loops. No open-ended iteration exists to bound.

### Between W1 and W2 — adjudication (the seat, inline)

1. Merge residual duplicates; classify every verified survivor on the two
   axes (correctness, goal-alignment — rulings injected here):
   **fix-now** (blocks un-draft) / **register** (deliberate divergence,
   record with rationale) / **route** (trunk or another lane's item) /
   **refuse** (with the refutation recorded). Every disposition carries its
   verified failure scenario or its verified absence.
2. **Knowns engagement scoring.** The planted-knowns list (below) is checked
   against Phase-1 output: each known must have been *engaged* (evaluated on
   its merits — agreement or challenge, not silence) by at least one leg
   whose charge covers it. Un-engaged knowns are named as coverage misses in
   the final report — the fleet's blind spots are reported, never presented
   as completeness.
3. Unverified overflow findings (if the cap fired) are dispositioned by the
   seat with the cap noted per item.

**Planted knowns** (documented in-repo; the calibration is engagement, not
rediscovery): K1-K6 the six register dispositions (util band non-inverted;
band rhythm; no `<form>`; CSS keyword separator; footer blurb wording;
picker chrome divergence); K7 the axe#3978 forced-colors contrast disable;
K8 the fidelity stdout global-scope presentation gap (routed to the
claude-design-pipeline lane); K9 the five-item DS trunk slice (routed to the
trunk); K10 the light-dark substitution oddity (open investigation, homed at
the design lane); K11 the `canonical-widths` client mirror of the tools
module (deliberate, precedent-recorded); K12 the two ruled divergences
carrying most of the diff mass.

### W2 — synthesis (2 legs)

- **Completeness critic** (default agent, xhigh): receives the manifest,
  what ran, all findings and verdicts, the adjudication record; asks what is
  missing — a modality not run, a claim unverified, a part unexamined.
- **`release-readiness-expert`** (xhigh): receives the adjudication record
  and the critic's answer; renders GO / GO-WITH-CONDITIONS / NO-GO on
  un-drafting #846, conditions named concretely.

The seat then writes the final report to
`.agent/reports/design/pr-846-review-fleet/report.md` with the per-leg
token/runtime tally from the workflow journals, the knowns-engagement score,
every finding with its disposition, and the readiness verdict — and raises
the owner card on the un-draft decision.

### Environment and instrument allocation (decision-complete)

- All legs work in the PR-2 worktree
  (`.claude/worktrees/identity-switchboard-pr2/demos/oak-design-showcase`),
  read-only with respect to tracked files.
- Live probes target the running dev server (`http://localhost:3020`) and
  the export static server (`http://localhost:3030`); the seat verifies both
  respond before launching W1, and rebuilds the production bundle
  (`pnpm build`) so instrument legs measure the built artefact.
- `vitest` (`pnpm test`) is free for every leg (no ports). The Playwright
  suites and the fidelity pipeline own ports, so **only L4 runs
  `test:a11y`/targeted Playwright, and L11 runs `tool:fidelity`, chained
  L4 → L11 in the script** (one pipeline chain; everything else parallel).
  Other legs verify runtime claims via the running servers (curl / node
  probes) or by reading the specs.
- No leg commits, pushes, or writes tracked files. Fleet outputs live in the
  workflow journal and the seat-authored report.

### Schemas (verbatim, used by the script)

```json
{
  "FINDINGS": {
    "type": "object",
    "required": ["findings", "coverage_notes", "knowns_engaged"],
    "properties": {
      "findings": {
        "type": "array",
        "maxItems": 12,
        "items": {
          "type": "object",
          "required": ["part", "scale", "file", "claim", "evidence", "severity", "failure_scenario"],
          "properties": {
            "part": { "type": "string" },
            "scale": { "type": "string" },
            "file": { "type": "string" },
            "line": { "type": "number" },
            "category": { "type": "string" },
            "claim": { "type": "string" },
            "evidence": { "type": "string" },
            "severity": { "type": "number", "minimum": 1, "maximum": 4 },
            "failure_scenario": { "type": "string" }
          }
        }
      },
      "coverage_notes": { "type": "string" },
      "knowns_engaged": { "type": "array", "items": { "type": "string" } }
    }
  },
  "VERDICT": {
    "type": "object",
    "required": ["refuted", "reasoning", "evidence"],
    "properties": {
      "refuted": { "type": "boolean" },
      "reasoning": { "type": "string" },
      "evidence": { "type": "string" }
    }
  }
}
```

(`knowns_engaged` is free-listing by the leg — "documented decisions you
evaluated" — never a disclosure of the knowns list, which no Phase-1 leg
receives.)

### Cost, plainly

12 + ≤80 + 2 + the seat = **≤94 agents, expected 40–70**, estimated
**1.5M–4M tokens** depending on Phase-1 yield. This exceeds the default
15-agent workflow guideline deliberately; the owner gate above is the
pricing decision, taken with these numbers visible.

## Acceptance criteria (each with a proof)

1. **Every manifest cell reviewed or excluded-with-reason** — proof
   `repo-safe`: the report's manifest table shows a leg or a named exclusion
   per cell; W2's completeness critic found no unnamed gap (its output is in
   the report).
2. **Every finding verified or refuted, none asserted** — proof `repo-safe`:
   the report lists zero findings without a Phase-2 verdict or a seat
   disposition noting the cap.
3. **Every planted known engaged or its miss named** — proof `repo-safe`:
   the knowns-engagement table in the report covers K1–K12 with
   engaged-by-leg or named-miss per row.
4. **Readiness verdict delivered and decidable** — proof `owner-held`: Jim
   reads the report and rules on un-drafting #846; the ruling is recorded on
   the owner card and in the thread record.

## Todos

- T1: Plan-review fleet (5 legs, below) reviews this plan; seat adjudicates;
  plan revised in place with a dated note. *(Runs before ratification —
  this is the plan-readiness review the plan skill requires.)*
- T2: Present plan + review verdicts + cost to the owner; ratification and
  the execution gate are the owner's word. Mint the thin visibility ticket
  (MCP team) at sanction.
- T3: Pre-flight: verify servers, rebuild production bundle, confirm suite
  green at the reviewed SHA; record the SHA in the report header.
- T4: Execute W1; adjudicate; execute W2; author the report; raise the
  un-draft owner card.
- T5: Disposition fix-now findings into single-story slices on the PR (or
  follow-up PRs per small-PR discipline); register/route the rest.

**Plan-review fleet (T1, decision-complete):** one Workflow, 5 legs, all on
this plan file + repo access, schema-forced
`{verdict: sound|revise|reject, findings[], missing[]}`:
`assumptions-expert` (proportionality, blocking legitimacy, agent-count
justification; xhigh), `architecture-expert-wilma` (where the fleet design
produces false confidence; xhigh), `test-expert` (does the verification
methodology verify; is engagement-calibration sound; xhigh), `code-expert`
(script mechanics, schemas, executability; high), frame-challenger (default
agent: is this the right instrument and scale for the un-draft decision;
xhigh).

## Out of scope

- **Fixing findings** — separate slices under the small-PR discipline; this
  plan produces the adjudicated list, not the cures.
- **A dedicated security leg** — no auth, credentials, or PII in the diff;
  the iframe/origin-interception surface is explicitly in L8's adversarial
  charge. A security signal from L1/L8 routes to `security-expert` as a
  follow-up, per the gateway rule.
- **A dedicated config leg** — the diff touches no tooling config; the
  workspace-config migration arrived from main and was reviewed in its own
  lane (#836).
- **Onboarding-path review** — no onboarding-path files in the diff.
- **Executing the routed items the fleet may touch (K8, K9, K10)** — each
  is already homed at its named lane; the fleet may engage them as review
  context but their execution belongs to their homes.
- **Cricket protocol runs** — the Cricket quartet ritual is a
  priority-drift instrument, not a code-review lens; invoking it here would
  owe the full quartet-twice protocol without adding a lens the roster
  lacks.
