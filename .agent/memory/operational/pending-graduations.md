---
fitness_line_target: 1100
fitness_line_limit: 1467
fitness_char_limit: 200000
fitness_line_length: 100
fitness_item_count: required
fitness_item_count_target: 0
fitness_item_count_soft: 2
fitness_item_count_hard: 3
fitness_item_dwell_target: 2
fitness_item_dwell_soft: 4
fitness_item_dwell_hard: 7
lifecycle_model: >-
  canonical pending-graduations register — every live item is decision-debt
  (status pending/due/overdue) until it is graduated, rejected, or marked
  duplicate. Provenance and adaptation are the safety net for a wrong call.
access_pattern: >-
  consolidation-pass-only — read at consolidations and drain sessions; not
  loaded every session by every agent
drain_strategy: >-
  Drain by DECIDING: graduate (write the doctrine into its rule/PDR/ADR/pattern/
  governance-doc home, then remove the entry) or reject (decided not worth a
  home, with the reason). The decision-debt count falls only through a recorded
  terminal disposition — never by deleting an undecided item and never by raising
  a limit. Do not split, shard, or hide buffer depth.
fitness_rationale: >-
  The primary health signal for this buffer is the decision-debt count
  (fitness_item_count, target 0) — a flow-rate reading of whether graduation is
  keeping pace with capture. The line and character limits are a secondary
  structural signal: drain-cadence back-pressure for a consolidation-pass-only
  buffer, not a size cap. Recalibrated 2026-06-08: line hard 2200 -> 1467, target
  1500 -> 1100, so line-critical (hard x 1.5, the global ADR-144 ratio) lands at
  ~2200. Both signals are reported and acted on, never chased: substance is never
  trimmed to clear a zone (knowledge-preservation), and the register is drained
  down by deciding items, not by tombstone-removal.
merge_class: mostly-append-register
fitness_content_role: drainable-buffer
---

# Pending Graduations

The canonical register of **learned doctrine awaiting its permanent home** —
a lesson, pattern, or decision that is *already settled* and simply not yet
written into the rule / PDR / ADR / pattern file / governance doc where it will
live and fire. Every live entry is decision-debt (`status: pending/due/overdue`),
drained by **graduating** it (write it into its home, verify, then remove the
entry) or **rejecting** it (decided not worth a home, with the reason). The
target is empty (`fitness_item_count_target: 0`); provenance and adaptation are
the safety net for a wrong call.

## What belongs here — and what does not

An entry belongs ONLY if all three hold:

1. **It is learned doctrine** — a settled lesson, pattern, or decision, validated
   by implementation, by surviving at least one later session uncorrected, or by
   an owner correction. Not a hypothesis, not a proposal, not a question.
2. **Its home is a doctrine surface** — a rule, PDR, ADR, `patterns/` file, or
   governance doc. (If the natural home is a *plan* or a *report*, the item is
   future work or a proposal, not a graduation — see below.)
3. **It is not yet written there** — the only outstanding act is authoring it
   into that home.

**Belongs** (worked shapes):

- *"The prove-the-checker-with-a-negative-control lesson is stable across three
  instances and has no pattern file yet."* → graduates to a `patterns/` file.
- *"The decision-locus doctrine (product scope is the owner's; engineering is
  collaborative) is settled and uncorrected, but lives only in the napkin."* →
  graduates to a `user-collaboration.md` section.

**Does NOT belong** — route via the destinations table in
[`ephemeral-to-permanent-homing.md`](ephemeral-to-permanent-homing.md):

- **Future work / a build to do later** (*"author the portable Core PDR when a
  second repo adopts X"; "build the IDE plugin once the owner approves"*) → a
  `plans/` entry (in `future/` with a promotion trigger). The underlying doctrine
  may already be homed; the *doing-it-later* is a plan, not a graduation.
- **A proposal or feasibility finding** (*"here is a design for an IDE
  integration plane"*) → a `reports/` or `research/` artefact, promoted to a plan
  on owner GO.
- **An open question** (*"what liveness primitive should the operating model
  carry?"*) → [`open-questions.md`](open-questions.md) if strategic, or an
  exploration plan if it is a design decision needing a session.
- **An operational what-next or owner decision** (*"should we re-establish the
  Director seat?"*) → [`repo-continuity.md`](repo-continuity.md) (Next Safe Steps
  / Open Owner-Decision Items) or the owning thread record.
- **A tooling gap** → the frictions register.

The test: if you cannot name the *exact* rule / PDR / ADR / pattern / doc section
the entry will be written into, it is probably not a graduation — find its real
home above. An item only remains live decision-debt when it is genuinely settled
doctrine, has a doctrine home, and that home just has not been authored yet.

## Draining and dwell

Each consolidation decides *every* decidable item — graduate or reject — toward
an empty register. An item stays only when a named constraint genuinely blocks
authoring its home now. The anti-starvation guard is the **dwell-time axis**
(`fitness_item_dwell_*`, target 2 / soft 4 / hard 7 days): it surfaces the
*oldest* undecided item's age and escalates it. The dwell reading is **age, not
a hedge** — a short dwell is never licence to leave a decidable item undecided.

New capture appends below as inline-bracket entries — `- **<title>**` then a
backtick-wrapped inline `[…]` block (may wrap across lines) with pipe-separated
`captured / source / target / trigger / size / status` fields (schema:
`agent-tools/src/practice-fitness/item-count.ts`). Every field name carries a
colon (`captured: …`, `trigger: …`). The bracket must NOT be fenced — a fenced
or unwrapped block is silently uncounted (it raises a malformed finding).
`target` must name a doctrine surface (rule / PDR / ADR / pattern / governance
doc); if it names a plan or report, the item belongs elsewhere. **After ANY
append, run the parser's own readout** (`pnpm practice:fitness:informational`,
the Live decision-debt line) **and verify the count MOVED** — colon-less
fields once left four items reading as a clean register (vacuous-green in a
debt register, 2026-07-08).

<!-- New pending-graduation capture appends below as inline-bracket entries. -->

<!-- Register drained to empty at the 2026-07-14 dedicated consolidation (Dolphin weaves
Reef): both items below graduated to PDR-128 (review-conversations-are-first-class) and the
new records-are-technical-not-emotional rule respectively — both homes verified live. -->

- **Canonical heartbeat-loop recipe must bump the claims registry, not only the comms stream** `[captured: 2026-07-15 | source: napkin 2026-07-15 Barnacle calls Spray session-close loss-scan, item 2 | status: duplicate — already captured as F-92 (frictions-register.md, 2026-06-27, the "canonical loop omits the CLAIM heartbeat refresh" bullet) with the identical cure and target surface; routed per this register's tooling-gap rule. The 2026-07-15 Barnacle-tenure incident (~15h registry-stale during continuous comms heartbeats, peer-caught at succession) is recorded on F-92 as recurrence confirmation. Terminal disposition 2026-07-15, Schooner guards Whirlpool, per PR #381 review thread.]`

- **No-risk-of-loss operations are absolute — a duplication proof never licenses the class** `[captured: 2026-07-15 | source: owner ruling in-session (Schooner Director tenure; napkin 2026-07-15 loss-scan item 1a) | target: .agent/rules/never-use-git-to-remove-work.md (strengthening clause) | trigger: next edit to that rule, or the F-145 valve design (the two must land together — the valve is the sanctioned path, the absoluteness is why no self-serve path exists) | size: small | status: pending]`
  Owner ruling: "no operations that might risk a loss of work; relaxing that discipline is
  what caused these problems in the first place" — ruled against a PROVEN-duplicate stash
  proposal. The doctrine point: local proofs of safety do not license risk-class operations;
  the discipline's value is its absoluteness. Currently doctrine-visible only in this
  register, the napkin, and one platform's per-user memory.

- **"Nothing is 'mine'" — frame blockers as constraints with unblocking options, never possession** `[captured: 2026-07-15 | source: owner ruling in-session (napkin 2026-07-15 loss-scan item 1b) | target: .agent/practice-core/decision-records/PDR-117-director-and-implementer-roles.md §The Director role (owner-interface craft) | trigger: next PDR-117 amendment pass (the Trawler-brief Part B queue) | size: small | status: pending]`
  Owner: "nothing is 'mine' — the function of the team is to progress the work." Cures
  owner-action-queue framing ("your click", "your PR"); report constraints + options, route
  only constitutively-owner residue, and frame even that as what the work needs.

- **Derived-output conservation shape for the refounding arc** `[captured: 2026-07-15 | source: S1 publication decision (owner retention question + Director ruling; PR #382; napkin 2026-07-15 loss-scan item 2) | target: .agent/memory/active/patterns/derived-output-conservation.md (new pattern file; the plan P-clause and S2+ remit template then cite it) | trigger: before S2 execution begins | size: small | status: pending]`
  Unique source freezes commit verbatim (S0); deterministic derived outputs commit only the
  compact attestation (hashes, counts, calibration disclosures, exact regeneration +
  verification contract) with bulk artefacts local/ignored. Twice-run byte-identity is the
  reproducibility bar. Prevents re-litigating the 49MB question at S2/S3/S4.
