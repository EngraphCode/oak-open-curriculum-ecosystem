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
depends_on: []
owner_gates:
  - awaiting: owner-decision
    clears_when: 'The owner names the alert destination that reliably interrupts (and it is configured on the uptime monitor and the heartbeat monitor).'
    expires: 2026-08-06
last_updated: 2026-08-03
---

# Detection: production loss is noticed within five minutes

## Goal

Nobody discovers a production outage by accident during unrelated work,
which is how both 2026-08-03 outages were found.

## Problem

Nothing watches production between deployments. Environment changes
take effect on running deployments without producing a deployment
event, so deployment-triggered checks are structurally blind to that
class — the preview outage ran five days and the production outage was
found only because someone happened to look.

An uptime monitor exists as of 2026-08-03 (`monitors/1593267`) with **no
alert rule attached**. A monitor without an alert relocates the silence
rather than ending it: it shows red on a dashboard nobody is watching,
which is the original failure shape one layer up.

## Mechanism

**1. Alerting on the uptime monitor.** Probe `/healthz` expecting 200
at a one-to-five minute interval, plus a second check on `POST /mcp`
expecting **401** — the second proves the authentication layer is alive
rather than merely that the process answers, a distinction a future
auth-layer break would depend on. An alert rule routes to a destination
that interrupts (owner gate above).

**2. Independent heartbeat.** A scheduled job probes production and
checks in to a Sentry cron monitor **only when the probe passes**, so a
missed check-in is itself the alert — silence cannot be mistaken for
health. Deliberately a different failure domain from the uptime
monitor: the uptime probe survives a scheduler outage, the heartbeat
survives a probe-side gap.

Both mechanisms detect and neither diagnoses; the alert must carry the
failure text that
[`boot-failure-observability`](boot-failure-observability.plan.md)
produces.

## Acceptance criteria

1. Loss of `/healthz` raises an alert that reaches the named
   destination — proof: **owner-held**, fault injection against a
   deliberately failing deployment with the alert observed at its
   destination; verifier the owner, evidence on MCP-481.
2. Loss of the authenticated surface raises an alert even when the
   process answers — proof: **owner-held**, the `POST /mcp` → 401
   probe failing while `/healthz` still returns 200; evidence on
   MCP-481.
3. A missed heartbeat raises an alert independently — proof:
   **owner-held**, the scheduled check-in deliberately withheld and the
   missed-check-in alert observed; evidence on MCP-481. Distinct from
   criteria 1 and 2: it exercises the other failure domain.
4. Detection-to-notification is within five minutes — proof:
   **owner-held**, a recorded timing from the criterion-1 injection
   (probe interval plus alert latency), on MCP-481.
5. The heartbeat job is version-controlled and its schedule is visible
   — proof: **repo-safe**, the workflow file and its schedule in the
   repository.

## Relationship to the sibling nodes

Detection arm, and the one with the highest leverage: without it every
other guarantee waits on someone noticing. Siblings:
[`deploy-config-fails-the-build`](deploy-config-fails-the-build.plan.md),
[`release-redeploy-recovery`](release-redeploy-recovery.plan.md),
[`boot-failure-observability`](boot-failure-observability.plan.md).

*Authored by Birch holds Seedling (e48fe2, agent), 2026-08-03.*
