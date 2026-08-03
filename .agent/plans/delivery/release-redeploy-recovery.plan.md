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
possible. On 2026-08-03 production stayed down roughly thirty minutes
because recovery required cutting a release. Owner ruling: *"not being
able to rebuild prior releases is a bug, not a feature, the intention
of the original guard was good, the impact was bad."*

## Mechanism

Replace the version-ordering predicate with a release-commit predicate.

- **Builds:** any commit that carries a release version — including the
  currently deployed one (redeploy) and any earlier one (rollback).
- **Cancels:** any commit on the default branch that is not a release
  commit, which is the guard's original and correct intent.

The parity contract with `packages/core/build-metadata/src/semver.ts`
stays intact; the anti-drift parity test still governs.

## Acceptance criteria

1. The current production release can be redeployed — proof:
   **owner-held**, a redeploy triggered by the owner from the Vercel
   dashboard observed to build rather than cancel; evidence recorded on
   MCP-479 with the deployment id.
2. An earlier release can be redeployed (rollback) — proof:
   **owner-held**, same shape, against a prior release deployment;
   evidence on MCP-479. Distinct from criterion 1: same-version
   redeploy does not prove backward selection.
3. A non-release commit on the default branch still cancels — proof:
   **repo-safe**, the guard's unit tests covering the predicate's
   cancel arm.
4. The predicate is stated where an operator will find it — proof:
   **repo-safe**, the guard's own TSDoc names which commits build and
   which cancel.

## Relationship to the sibling nodes

Recovery arm of the deployment-reliability response. Siblings:
[`deploy-config-fails-the-build`](deploy-config-fails-the-build.plan.md),
[`boot-failure-observability`](boot-failure-observability.plan.md),
[`production-liveness-detection`](production-liveness-detection.plan.md).
Detection without recovery leaves an outage standing; this node is the
floor under every other incident response.

*Authored by Birch holds Seedling (e48fe2, agent), 2026-08-03.*
