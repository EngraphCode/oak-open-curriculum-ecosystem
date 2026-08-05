---
id: release-redeploy-guard-truing
node_type: delivery
name: 'True the redeploy-guard record: verified vendor semantics, one honest ADR trail, and the post-rollback operating facts'
overview: 'Fix the ADR-163 §10 amendment-numbering collision, ground the production build guard''s record in the verbatim vendor definitions, teach operators the post-rollback recovery path, and prove the redeploy arm live.'
status: sketch
serves: first-major-release
impact_areas:
  - served-surface
tickets:
  - MCP-479
depends_on: []
owner_gates: []
last_updated: 2026-08-05
---

# True the redeploy-guard record

## Goal

An operator recovering production, and a reviewer auditing the guard,
both meet one consistent, vendor-grounded record: the ADR trail names
its amendments without collision, the guard's cancellation message
teaches the legitimate recovery paths, and the runbook states what a
rolled-back project actually does — so the next incident is worked from
recorded facts rather than re-derived guesses.

## Problem

The redeploy arm (MCP-479) shipped correct code with an inconsistent
record, and multi-expert review of the sibling plan corpus surfaced
three defects against the record rather than the code:

1. **ADR-163 §10 collides with itself.** The redeploy-arm change is
   labelled "fourth amendment, 2026-08-04" in its prose and truth-table
   row but "Third amendment (2026-08-03, MCP-479)" in its own heading,
   while a pre-existing "third amendment" (2026-04-28, enforcement
   hardening) already holds that ordinal. Two different changes share a
   designation, and one change designates itself twice.
2. **A load-bearing vendor semantic was reviewed as unverified.** The
   guard's equality arm rests on `VERCEL_GIT_PREVIOUS_SHA`. The vendor
   definition — verified verbatim 2026-08-05 from Vercel's
   system-environment-variables reference — is "The git SHA of the last
   successful deployment for the project and branch", exposed at build
   time only when an Ignored Build Step is provided. That is *not* "the
   commit currently serving production", and the two diverge exactly
   after an Instant Rollback. The record nowhere states this, so
   reviewers correctly flagged it as an uncited assumption.
3. **The post-rollback operating facts are recorded nowhere.** Verified
   2026-08-05 from Vercel's Instant Rollback reference: a rollback
   re-points domains at an existing deployment (no build runs, so the
   guard never executes); the rolled-back deployment keeps its original
   environment-variable bindings even if project settings change; and —
   decisive for recovery design — **after a rollback Vercel turns off
   auto-assignment of production domains**, so pushes to `main` stop
   going live until an explicit Undo Rollback / `vercel promote`. No
   Oak runbook states any of this.

## Mechanism

Three small deliverables, one closed design decision:

1. **ADR-163 §10 truing.** Rename the redeploy-arm heading to "Fourth
   amendment (2026-08-04, MCP-479)", reconcile every self-reference to
   that single designation, and add the two verified vendor facts with
   their retrieval dates: the verbatim `VERCEL_GIT_PREVIOUS_SHA`
   definition, and the post-rollback auto-assignment suspension. The
   ADR then actually contains the record the shipped guard's TSDoc
   already cites.
2. **Guard cancellation message teaches recovery.** On the
   `current ≤ previous` CANCEL row, extend the existing stdout message
   with one sentence naming the two legitimate paths: redeploy the
   already-released commit (the equality arm continues it), or advance
   the version through a release. No truth-table change.
3. **Runbook: the rolled-back state.** Add a short section to the
   deployment runbook stating the three post-rollback facts above and
   the recovery sequence (fix the environment → Undo Rollback / promote
   → normal releases resume), and cross-reference it from the
   environment-variable change procedure's recovery note.

**The closed decision — the guard does not grow a post-rollback arm.**
Review asked whether the guard should also permit rebuilding the
rolled-back-to (older) release. Verdict: no, on vendor-verified
grounds. In a rolled-back state Vercel has suspended production domain
auto-assignment, so a git-triggered rebuild of the older release would
not reach the domain anyway; the vendor-designed recovery is promotion,
not a rebuild. Extending the guard would add a dependency on
`VERCEL_GIT_PREVIOUS_SHA`'s undocumented post-rollback value — an
assumption no repo-safe proof can falsify — to serve a path the
platform itself closes. The runbook paragraph carries this knowledge
instead.

## Acceptance criteria

1. **ADR-163 §10 names its amendments without collision** — exactly one
   "fourth amendment" designation for the redeploy arm, no reference to
   it as "third", the 2026-04-28 third amendment untouched.
   Proof: repo-safe — `grep -ci "third amendment" / "fourth amendment"`
   over the ADR in the PR diff review, plus the existing docs lint CI.
2. **The ADR states both vendor facts verbatim with retrieval dates.**
   Proof: repo-safe — quoted strings present in the ADR diff; the
   quotes match the vendor pages cited in MCP-479.
3. **The guard's CANCEL message names both recovery paths.**
   Proof: repo-safe — a unit test describing the cancellation output
   state (message includes the redeploy path and the release path),
   alongside the existing truth-table tests.
4. **The runbook carries the rolled-back-state section** with the three
   facts and the recovery sequence, cross-referenced from the
   environment-variable procedure.
   Proof: repo-safe — section present and linked in the PR diff; docs
   lint green.
5. **The redeploy arm is proven live once.** A production Redeploy of
   the already-serving release commit is observed continuing past the
   guard (build proceeds; deployment completes).
   Proof: owner-held — the observer and the build-log evidence are
   recorded on MCP-479. Two neighbouring truth-table rows already have
   live 2026-08-05 evidence recorded there (merge commit cancelled by
   the ignored build step; release commit built and deployed).

## Out of scope

- Any change to the guard's truth table or decision logic — review
  confirmed the shipped logic correct for its scope.
- A post-rollback arm for the guard (closed decision above).
- The sibling plan-corpus amendments (PR #746 carries its own cure
  list from the same review).
- Build-environment secret-surface policy (a distinct estate-level
  question; recorded position pending on its own surface).

## Todos

- [ ] ADR-163 §10: heading rename + self-reference reconciliation +
      two vendor facts with dates.
- [ ] Guard: extend the CANCEL stdout message; add the describing unit
      test.
- [ ] Runbook: rolled-back-state section + cross-reference.
- [ ] Record the live redeploy-arm proof on MCP-479 when the owner (or
      an owner-authorised agent action) next performs a production
      redeploy.

One PR carries todos 1–3 (a single story: true the record the shipped
code cites). Todo 4 is an observation, not a change.

## Relationship to siblings

The unmerged deployment-reliability corpus (PR #746) contains
`release-redeploy-recovery` (MCP-479's original node). This node does
not replace it: that node records why the redeploy arm exists; this
node cures the record defects found by the 2026-08-05 multi-expert
review of that corpus and lands the operating knowledge the vendor
verification produced. If #746's node is amended to cite the same
vendor facts, criterion 2 here may be satisfied by cross-reference
rather than duplication.
