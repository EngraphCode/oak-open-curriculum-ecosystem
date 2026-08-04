---
id: boot-failure-observability
node_type: delivery
name: 'Diagnosis: boot failures reach Sentry, and configuration guards name what failed'
overview: 'Report configuration failures that occur before observability is constructed, under a bounded reporter contract that preserves the privacy posture, and make the pseudonym-keyring guard name which check failed.'
status: sketch
serves: first-major-release
impact_areas:
  - analytics-and-observability
tickets:
  - MCP-480
depends_on: []
owner_gates: []
last_updated: 2026-08-03
---

# Diagnosis: boot failures reach Sentry

## Goal

When the server refuses to start, the refusal arrives where someone
will see it, carrying enough detail to act on — without ever carrying
the offending value.

## Problem

Two failures, one boundary.

**Unreportable by construction.** `loadConfiguredApp` resolves the
runtime config before constructing observability, and Sentry is built
*from* that config. A configuration failure therefore throws before any
Sentry client exists. Proven empirically on 2026-08-03: zero Sentry
events from two outages (107 production 500s, five days of dead
previews), while a deliberate probe error reached Sentry in seconds —
the error pipe works; boot is simply upstream of it.

**Under-informative.** The environment validator's message is
exemplary: it names the failing key, the rule, and where to fix it. The
analytics resolver's is `invalid PostHog product-analytics
configuration: pseudonym keyring failed strict validation`, which does
not distinguish JSON parsing, strict shape, base64url canonicality, or
uniqueness. Content-free was a deliberate secret-safety choice and the
caution is right, but it overshot: the same boundary now carries two
diagnostic doctrines, and the opaque one cost hours.

Fail-fast itself is correct and stays — booting without valid
pseudonymisation configuration would be a privacy defect, not a
degraded mode.

## Mechanism

**1. Bootstrap reporter, under a bounded contract.** Not "a minimal
Sentry client" — the following clauses are the deliverable, because
this sits inside the ADR-218 privacy posture:

- activates only from strictly valid live-mode inputs; `off` and
  `fixture` modes remain authoritative and make no network call;
- sanitises through the shared redaction barrier, with no bypass path;
- never includes the invalid value, only the guard that rejected it;
- awaits a **bounded flush** before `boundaryError` rethrows, since an
  unflushed capture on an immediately-throwing path is no capture;
- failure of the reporter itself never masks or delays the original
  boundary error.

**2. Guards name the guard.** The keyring resolver reports which check
failed plus shape facts — entry count, id pattern match, key length,
canonical-decode result — and never the value. Governing rule for the
estate: **name the guard, never the value.**

## Acceptance criteria

1. A configuration failure produces a Sentry error naming the failing
   key — proof: **repo-safe**, an integration test driving the boot
   boundary with an invalid environment against a recording fake
   reporter, asserting the captured event's content.
2. `off` and `fixture` modes make no network call from the bootstrap
   reporter — proof: **repo-safe**, the same suite asserting zero
   transport interactions in those modes.
3. No captured event contains the offending value — proof:
   **repo-safe**, assertion over the captured payload for the invalid
   input's byte content.
4. The capture survives the immediate rethrow — proof: **repo-safe**, a
   test asserting flush completes before the throw propagates.
5. The keyring guard names which check failed — proof: **repo-safe**,
   unit tests over each guard arm (parse, shape, canonicality,
   uniqueness) asserting the distinguishing message and shape facts.
6. The end-to-end path works on a deployed surface — proof:
   **owner-held**, a deliberately invalid preview environment producing
   a Sentry error naming the key; verifier the lane agent, evidence
   recorded on MCP-480.

## Out of scope

- **Making boot failures non-fatal.** Fail-fast stays. Booting without
  valid pseudonymisation configuration would be a privacy defect, not a
  degraded mode, so this node changes only what the refusal *reports* —
  never whether it refuses.
- **Reporting the offending value.** The reporter names the failing
  key, the rule it broke, and where to fix it. It never carries the
  value, and the ADR-160 redaction conformance proof is the criterion
  that keeps that true rather than merely intended.
- **Widening the reportable surface.** Only configuration failures
  occurring *after* valid bootstrap Sentry inputs exist are reportable.
  A failure earlier than that has nothing to report through, and
  pretending otherwise would add a second silent path.
- **Rewriting the environment validator's messages.** They are already
  exemplary; this node raises the analytics resolver to their standard
  rather than changing the standard.
- **Detection or alerting.** Getting the refusal into Sentry is this
  node; noticing it and interrupting someone belongs to
  [`production-liveness-detection`](production-liveness-detection.plan.md).

## Relationship to the sibling nodes

Diagnosis arm. Siblings:
[`deploy-config-fails-the-build`](deploy-config-fails-the-build.plan.md),
[`release-redeploy-recovery`](release-redeploy-recovery.plan.md),
[`production-liveness-detection`](production-liveness-detection.plan.md).
Detection tells you production is down; this node is what tells you
why, and without it an alert reproduces the thirty-minute diagnosis
cost of 2026-08-03.

*Authored by Birch holds Seedling (e48fe2, agent), 2026-08-03.*
