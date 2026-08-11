---
id: production-liveness-detection
node_type: delivery
name: 'Detection: production loss is noticed and notified within five minutes'
overview: 'Attach alerting to the production uptime monitor and add an independent heartbeat whose absence is itself the alert, so a failure between deployments cannot pass unnoticed.'
status: sketch
serves: first-major-release
impact_areas:
  - analytics-and-observability
tickets:
  - MCP-481
depends_on:
  - plan: boot-failure-observability
    kind: beneficial
owner_gates:
  - awaiting: owner-decision
    clears_when: 'The owner names the alert destination that reliably interrupts.'
    expires: 2026-08-31
  - awaiting: owner-decision
    clears_when: 'The owner ratifies the ADR-162 amendment that brings this one heartbeat job into the repository.'
    expires: 2026-08-31
last_updated: 2026-08-09
---

# Detection: production loss is noticed within five minutes

## Goal

Nobody discovers a production outage by accident during unrelated work.

## Problem

Nothing watches production between deployments, and a deployment event
is the only thing that currently triggers any check. Deployment-triggered
checks therefore cover the moment of change and nothing after it: a
deployment that is healthy when it lands and unhealthy an hour later
passes every gate the estate has.

The vendor contract sharpens the gap. Per Vercel:

> Changes to environment variables are not applied to previous
> deployments, they only apply to new deployments. You must redeploy
> your project to update the value of any variables you change in the
> deployment.
> — [Managing environment variables](https://vercel.com/docs/environment-variables/managing-environment-variables)

An environment edit reaches production at the *next* deployment, not
immediately — so the damage lands at a deployment that looks routine
and carries no signal that its configuration changed underneath it, and
the interval between the edit and that deployment can be arbitrarily
long. The supported operating shape is change → redeploy → verify.

An uptime monitor exists with **no alert rule attached**. A monitor
without an alert relocates the silence rather than ending it: it shows
red on a dashboard nobody is watching, which is the original failure
shape one layer up. Monitor id, incident dates, and outage durations
are recorded on MCP-481.

## Mechanism

**1. Alerting on the uptime monitor.** Probe `/healthz` expecting 200
at a one-to-five minute interval, plus a second check on `POST /mcp`
expecting **401** — the second proves the authentication layer is alive
rather than merely that the process answers, a distinction a future
auth-layer break would depend on. An alert rule routes to a destination
that interrupts (owner gate above).

A bare 401 cannot distinguish the app's auth layer from an edge
answering in front of it, so the probe asserts an app-only artefact:
the `WWW-Authenticate` challenge naming the protected-resource-metadata
resource, which only the app's auth layer emits. The edge in front of
the app is thereby a named probe-path dependency — the probe exercises
edge plus app, and an edge-served 401 without the challenge is a
failure, not a pass.

The `POST /mcp` → 401 check needs three instrument capabilities, each
recorded with its own evidence status (2026-08-05):

- **custom request headers** (the `Accept` header) — discharged: the
  owner's console screenshot shows the monitor's header configuration;
- **a non-2xx expected-status assertion** (401 as healthy) — not
  discharged: the status-code assertion capability is Early Access, not
  GA, so its availability to this organisation is verified at execution
  pickup;
- **a non-GET request method** (`POST`) — not discharged: verified on
  the same surface at pickup.

If the assertion capability is unavailable, the fallback is named: the
independent heartbeat probe (mechanism 2) carries the auth assertion —
its scheduled job asserts the 401-with-challenge response itself and
withholds the check-in on failure — and the uptime monitor keeps only
the `/healthz` 200 probe.

Confirmed 2026-08-05, resolving an earlier finding that conflated
headers with authentication: the probe's headers cover `Accept` only
(`Accept: application/json, text/event-stream`, without which the
transport answers 406 before the auth layer is reached); no credential
of any kind enters the uptime monitor configuration — the probe asserts
the *unauthenticated* surface, and a **200** on `POST /mcp` is a
failure, because it would mean the auth layer stopped challenging.

**2. Independent heartbeat.** A scheduled job probes production and
checks in to a Sentry cron monitor **only when the probe passes**, so a
missed check-in is itself the alert — silence cannot be mistaken for
health. Deliberately a different failure domain from the uptime
monitor: the uptime probe survives a scheduler outage, the heartbeat
survives a probe-side gap.

**Decision-record dependency.** ADR-162 records the owner's 2026-04-23
externalisation of production synthetic monitoring (recorded 2026-08-03
by PR #743): monitoring is operated outside this repository, and the
repo's obligation ends at exposing a healthy `/healthz`. Criterion 5's
version-controlled heartbeat workflow reverses that direction for this
one job, so delivering it includes amending ADR-162's record — the
amendment is part of this node's delivery, not a follow-up, and the
second owner gate above must clear before any in-repository heartbeat
workflow lands. This follows the same pattern the recovery node used for
ADR-163 §10.

Both mechanisms detect and neither diagnoses. Once
[`boot-failure-observability`](boot-failure-observability.plan.md)
lands, the full alert shape carries its failure text. The detection-only
minimum remains independently shippable and identifies the failing probe
without claiming a diagnosis.

## Acceptance criteria

1. Loss of `/healthz` raises an alert that reaches the named
   destination — proof: **owner-held**, fault injection against a
   deliberately failing deployment with the alert observed at its
   destination; verifier the owner, evidence on MCP-481.
2. Loss of the authenticated surface raises an alert even when the
   process answers — proof: **owner-held**, an unauthenticated
   `POST /mcp` probe must return 401 **and** the app's correct
   protected-resource-metadata `WWW-Authenticate` challenge while
   `/healthz` still returns 200; **verifier the owner**, evidence on
   MCP-481. The probe sends
   `Accept: application/json, text/event-stream`; 200, 406, a missing
   challenge, or a challenge naming the wrong protected-resource
   metadata URL are all failures.
3. A missed heartbeat raises an alert independently — proof:
   **owner-held**, the scheduled check-in deliberately withheld and the
   missed-check-in alert observed; **verifier the owner**, evidence on
   MCP-481. Distinct from criteria 1 and 2: it exercises the other
   failure domain.
4. Detection-to-notification is within five minutes, with **Failure
   Tolerance named as a required monitor parameter** — proof:
   **owner-held**, a recorded timing from the criterion-1 injection;
   **verifier the owner**, evidence on MCP-481. The arithmetic must
   clear five minutes with the tolerance included: detection time is
   probe interval × failure tolerance, plus alert latency. Sentry's
   default tolerance of three consecutive failures at a one-minute
   interval reaches detection at three minutes, leaving two for
   notification — within the target; the same default at a five-minute
   interval reaches fifteen, which fails this criterion. The monitor
   configuration therefore records interval and tolerance together.
5. The heartbeat job is version-controlled and its schedule is visible
   — proof: **repo-safe**, the workflow file and its schedule in the
   repository.

## Out of scope

- **Diagnosis.** Both mechanisms detect; neither explains. Carrying the
  failure text into the alert depends on
  [`boot-failure-observability`](boot-failure-observability.plan.md),
  which is why this node declares that dependency rather than
  pretending to close the loop alone.
- **Minimum shippable shape without that dependency**, stated so the
  dependency does not become a reason to ship nothing: alerting that
  fires on the two probes and the missed heartbeat is worth landing on
  its own. It converts "nobody notices" into "someone is interrupted",
  which is the whole of this node's goal. Without MCP-480 the alert
  says only that production is unreachable, and the diagnosis cost
  stays where it is today — worse than the full shape, far better than
  silence.
- **Auto-remediation.** Detection only. Restoring service is
  [`release-redeploy-recovery`](release-redeploy-recovery.plan.md), and
  a detector that also acts is a detector nobody trusts to be honest.
- **Preview and development environments.** Production only. Preview
  liveness is covered by the `preview-serves` post-deploy check, which
  is a different mechanism on a different trigger.
- **Choosing the alert destination.** That is the owner's gate, not a
  todo of this node.
- **Landing the heartbeat before the decision record is ratified.** The
  ADR-162 amendment is owner-held; until its owner gate clears, the
  repository carries no heartbeat workflow.

## Relationship to the sibling nodes

Detection arm, and the one with the highest leverage: without it every
other guarantee waits on someone noticing. Siblings:
[`deploy-config-fails-the-build`](deploy-config-fails-the-build.plan.md),
[`release-redeploy-recovery`](release-redeploy-recovery.plan.md),
[`boot-failure-observability`](boot-failure-observability.plan.md).

*Authored by Birch holds Seedling (e48fe2, agent), 2026-08-03. Amended
2026-08-09 per the adjudicated 2026-08-05 eleven-expert review
(`deploy-reliability-corpus-amendment`, rows 24–30 and 35).*
