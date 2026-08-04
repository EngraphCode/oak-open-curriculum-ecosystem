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
    expires: 2026-08-06
last_updated: 2026-08-03
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

**Corrected 2026-08-04.** An earlier draft of this node argued the gap
differently — that environment changes take effect on *running*
deployments, making deployment-triggered checks structurally blind to
that class. Vercel documents the opposite:

> Changes to environment variables are not applied to previous
> deployments, they only apply to new deployments. You must redeploy
> your project to update the value of any variables you change in the
> deployment.
> — [Managing environment variables](https://vercel.com/docs/environment-variables/managing-environment-variables)

So an environment edit reaches production at the *next* deployment, not
immediately. That makes the argument for this node **stronger, not
weaker**: the damage lands at a deployment that looks routine and
carries no signal that its configuration changed underneath it, and the
interval between the edit and that deployment can be arbitrarily long.
Any incident timeline built on the old premise should be re-derived
against the vendor contract; the supported shape is
change → redeploy → verify.

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
   probe failing while `/healthz` still returns 200; **verifier the
   owner**, evidence on MCP-481. The probe must send
   `Accept: application/json, text/event-stream`; without it the
   transport returns 406 before reaching the auth layer, so the check
   would pass identically whether auth is healthy or broken.
3. A missed heartbeat raises an alert independently — proof:
   **owner-held**, the scheduled check-in deliberately withheld and the
   missed-check-in alert observed; **verifier the owner**, evidence on
   MCP-481. Distinct from criteria 1 and 2: it exercises the other
   failure domain.
4. Detection-to-notification is within five minutes — proof:
   **owner-held**, a recorded timing from the criterion-1 injection
   (probe interval plus alert latency); **verifier the owner**,
   evidence on MCP-481.
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

## Relationship to the sibling nodes

Detection arm, and the one with the highest leverage: without it every
other guarantee waits on someone noticing. Siblings:
[`deploy-config-fails-the-build`](deploy-config-fails-the-build.plan.md),
[`release-redeploy-recovery`](release-redeploy-recovery.plan.md),
[`boot-failure-observability`](boot-failure-observability.plan.md).

*Authored by Birch holds Seedling (e48fe2, agent), 2026-08-03.*
