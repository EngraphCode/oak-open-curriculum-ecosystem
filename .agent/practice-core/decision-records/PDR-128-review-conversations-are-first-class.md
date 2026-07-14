---
pdr_kind: pattern
---

# PDR-128: Review Conversations Are First-Class — a PR Is the Structured Earning of Shared Truth

**Status**: Accepted
**Date**: 2026-07-08
**Related**: this PDR is the portable, ecosystem-agnostic form of the host's
`pr-lifecycle` skill preamble (§"What a PR is"), which supplies the
mechanics (harvest, re-fetch after every push, truly-green merge) this PDR's
principle governs; [PDR-098](PDR-098-doctrine-traction-firing-detection-response.md)
(doctrine-traction — a review conversation is one of the mechanisms that
detects a doctrine not firing).

## Context

An agent operating a code-review workflow can hold either of two operating
models of what a pull request (or equivalent structured-review artefact) IS:

- **Delivery-vehicle model**: a PR is a container that carries a diff to
  merge; review comments are an objection queue to clear as fast as
  possible; "mergeable" or "checks green" reads as progress.
- **Earning-and-record model**: a PR is the structured conversation through
  which a proposed change earns the right to become shared truth, and the
  durable record of that earning.

The delivery-vehicle model produces a specific, repeatable failure shape,
observed across three escalating instances on one thread before the
generator was named: reporting a git-graph fact ("mergeable") as if it were
readiness while review threads sat unresolved; re-harvesting the review
surface only when chased rather than after every push; and — the sharpest
instance — queuing a thread reply in the same script as its own
verification check without gating on the result, then posting a **false
disposition** to the permanent record (claiming a defect was fixed when it
was not). Each symptom is explained by the same wrong model: if a PR is
just a delivery vehicle, resolving threads quickly looks like progress
regardless of whether the resolution is true.

## Decision

**A structured review artefact (a PR, or any equivalent change-review
mechanism) is the conversation through which a proposed change earns the
right to become shared truth, and the durable record of that earning — not
a container to clear on the way to merge.** This reframing has concrete,
non-optional consequences for any agent operating one:

1. **Every review comment is a claim entitled to full epistemics** — verify
   it, adjudicate it, then integrate the fix or refute the claim with
   evidence. *Resolved* is the outcome of that treatment, never a goal to
   race toward; racing resolution inverts the artefact's purpose.
2. **While the review is open, the conversation IS the work.** A reviewer
   finding is a bug report against the proposal, ranking ahead of new work.
   A push changes the proposal, so the entire review surface becomes stale
   the instant it lands — the whole surface must be re-harvested and
   re-dispositioned before reporting any status, never assumed settled from
   a stale read.
3. **The record outlives the merge.** The description, every thread, and
   every disposition are how a future reader — including another agent
   answering a question from this history — recovers *why* the change is
   what it is. A false disposition reply poisons that record permanently:
   gate every reply on its own first-hand verification, and verify that an
   edit to the description actually stuck (an automated summary re-append
   can silently mask a failed edit).
4. **A mergeability signal is a graph fact about ancestry and conflicts, not
   a readiness signal.** Readiness is a property of the conversation itself:
   every thread dispositioned with evidence, every check green, the
   description still true of the current diff, and the record coherent to a
   reader who was not present for the work. Report readiness in those terms,
   never in graph-fact terms.
5. **The artefact exists to structure shared attention.** Making the human
   reviewer or owner chase down thread state defeats the artefact even when
   the underlying diff is otherwise perfect.

## Consequences

**Enables**: an agent operating any structured-review workflow (PR, MR, a
review-gated design doc) can apply one consistent epistemic standard —
claims are verified, dispositions are evidence-gated, readiness is
conversation-complete rather than graph-complete — regardless of the
specific host tooling.

**Costs**: slower apparent progress in the moment — a delivery-vehicle
model can look faster because it treats "checks green, thread count
dropping" as sufficient. This PDR trades that apparent speed for record
integrity; a false disposition costs far more than the time saved reaching
it.

**Forbids**: reporting a mergeability/graph-fact signal as if it were
readiness; posting a disposition reply that has not been gated on its own
verification against the actual current state; treating review comments as
friction to clear rather than claims to adjudicate.

## Falsifiability

Shown wrong if a review artefact's conversation and record genuinely add no
value over a bare diff-plus-approval gate for some class of change — i.e.
if evidence accumulates that skipping per-comment epistemics and record
integrity produces no worse outcomes for that class. No such evidence has
been observed; the founding instance (a false disposition entering a
permanent, agent-queryable record) is the cost this PDR exists to prevent.

## Source

Graduates a deep-review owner correction (2026-07-08, third and sharpest
escalation of the same class on one PR thread): a session's operating model
of what a PR is was wrong, and the falsehood it produced proved it. The
host-level mechanics this principle governs are landed in the `pr-lifecycle`
skill's "What a PR is" preamble in this repo; this record is the portable
form for any Practice-bearing repo running a structured code-review
workflow.
