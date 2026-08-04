---
id: release-redeploy-recovery
node_type: delivery
name: 'Recovery: let a known-good release be rebuilt and rolled back'
overview: 'Change the production build guard so any release commit may build — restoring redeploy and rollback — while non-release commits still never reach production.'
status: sketch
serves: first-major-release
impact_areas:
  - served-surface
tickets:
  - MCP-479
depends_on: []
owner_gates: []
last_updated: 2026-08-03
---

# Recovery: rebuild a known-good release

## Goal

Restoring production after a bad deployment or a bad environment takes
a redeploy, not a release cut. Owner target: under five minutes from
spotting the problem.

## Problem

`vercel-ignore-production-non-release-build.mjs` cancels any production
build whose root `package.json` version has not advanced beyond the
deployed version. A redeploy of the current release re-runs the guard
at the same version and is therefore always cancelled, and an older
release is cancelled too — so neither redeploy nor rollback is
possible.

The consequence is structural: when a deployment is healthy as a build
but broken by its environment, the repository contains no change to
make, and the guard rejects the only build that would help. Recovery
then requires manufacturing a version bump, which couples incident
response to the release process. Incident narrative, timings, and the
owner ruling that authorised this node are recorded on MCP-479.

## Mechanism

Add a same-commit redeploy arm to the existing version-ordering
predicate, leaving that predicate otherwise intact.

- **Builds:** a commit whose version advanced (unchanged), **and** a
  rebuild of the commit already in production, identified by
  `VERCEL_GIT_COMMIT_SHA == VERCEL_GIT_PREVIOUS_SHA`. That commit
  passed this gate to reach production, so rebuilding it cannot
  introduce a version it did not already have.
- **Cancels:** any other commit on the default branch whose version has
  not advanced — the guard's original and correct intent, unchanged.

The parity contract with `packages/core/build-metadata/src/semver.ts`
stays intact; the anti-drift parity test still governs.

**This is narrower than an earlier draft of this node promised, and the
narrowing is deliberate.** The draft said "any commit that carries a
release version — including … any earlier one (rollback)". Selecting an
*earlier* release is not implementable through this guard: Vercel
exposes no variable naming the deploy's intent, so the only honest
signal available is the equality above, which by construction only
identifies the current release. An earlier release still cancels.

Rolling back to an earlier release therefore remains **unsolved by this
node**, and the two candidate routes both have named costs recorded in
ADR-163 §10: Vercel's Instant Rollback re-points domains at an existing
build *without running this script at all*, so it restores the same
stale environment binding that caused the 2026-08-03 outage; and a
revert-and-release cut is the status quo this node exists to avoid.
Naming the gap is the honest state — see §Out of scope.

**Decision-record dependency.** This mechanism contradicts ADR-163 §10
as accepted, which required every production build on `main` to advance
the semver. Landing it therefore requires amending that decision, not
merely implementing against it. The amendment (§10 normative rule plus
its truth table, designated the *fourth amendment*) is part of this
node's delivery, not a follow-up.

## Acceptance criteria

1. A rebuild of the deployed commit continues rather than cancels —
   proof: **repo-safe**, the guard's unit tests covering the redeploy
   arm with `VERCEL_GIT_COMMIT_SHA == VERCEL_GIT_PREVIOUS_SHA`.
2. A commit that is **not** the deployed one and whose version has not
   advanced still cancels — proof: **repo-safe**, the guard's unit
   tests covering that arm. This is the criterion that keeps the
   narrowing honest: it fails if the redeploy arm is ever widened into
   "any release version builds".
3. Both SHA inputs are validated before the equality is trusted —
   proof: **repo-safe**, unit tests asserting that a malformed
   `VERCEL_GIT_COMMIT_SHA` or `VERCEL_GIT_PREVIOUS_SHA` leaves the
   verdict exactly as it was before the arm existed. An equality test
   on unvalidated input could compare equal on malformed values and
   continue a build the truth table means to cancel.
4. ADR-163 §10 states one unambiguous rule — proof: **repo-safe**, the
   §10 normative sentence carries the redeploy arm rather than a table
   row contradicting the sentence above it, and no reference in the
   repo designates two different changes by the same amendment number.
5. The predicate is stated where an operator will find it — proof:
   **repo-safe**, the guard's own TSDoc names which commits build and
   which cancel, including the arm's evaluation order relative to the
   version comparison.
6. The current production release can be rebuilt in the real
   environment — proof: **owner-held**, a redeploy triggered by the
   owner from the Vercel dashboard observed to build rather than
   cancel; evidence recorded on MCP-479 with the deployment id. This is
   the only criterion the repo cannot prove for itself, because the
   guard's inputs are supplied by Vercel at build time.

## Out of scope

- **Selecting an earlier release (true rollback).** Not implementable
  through this guard — see §Mechanism. The gap is named rather than
  quietly carried: neither Vercel's Instant Rollback (which never runs
  this script, so it restores the same stale environment binding) nor a
  revert-and-release cut (the status quo) is an acceptable answer, so
  this needs its own node with its own mechanism. It is not a todo of
  this one.
- **Changing the version-ordering predicate itself.** The existing rule
  is correct for every commit that is not the deployed one, and this
  node adds an arm beside it rather than replacing it.
- **Any change to how environment variables reach a deployment.** The
  environment-binding class that motivated this node is a separate
  concern; this node only restores the ability to rebuild.
- **Reducing time-to-detection.** Recovery speed is this node; noticing
  that recovery is needed belongs to
  [`production-liveness-detection`](production-liveness-detection.plan.md).
- **A general "redeploy any deployment" capability.** Deliberately not
  built: it would require an operator-supplied signal, and every
  operator-supplied bypass of a safety guard is a surface this estate
  does not add.

## Relationship to the sibling nodes

Recovery arm of the deployment-reliability response. Siblings:
[`deploy-config-fails-the-build`](deploy-config-fails-the-build.plan.md),
[`boot-failure-observability`](boot-failure-observability.plan.md),
[`production-liveness-detection`](production-liveness-detection.plan.md).
Detection without recovery leaves an outage standing; this node is the
floor under every other incident response.

*Authored by Birch holds Seedling (e48fe2, agent), 2026-08-03.*
