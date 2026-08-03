---
id: deployment-reliability-hardening
node_type: delivery
name: 'Deployment reliability: make deploy failures impossible to miss, fast to diagnose, and fast to recover'
overview: 'Close the four gaps the 2026-08-03 preview and production outages exposed: dead deployments pass the merge gate, nothing watches between deployments, boot failures never reach Sentry, and a known-good release cannot be redeployed.'
status: sketch
serves: first-major-release
impact_areas:
  - analytics-and-observability
  - served-surface
tickets:
  - MCP-475
  - MCP-479
  - MCP-480
  - MCP-481
depends_on: []
owner_gates: []
last_updated: 2026-08-03
---

# Deployment reliability hardening

## Why this exists

Two outages on 2026-08-03, one class:

- **Preview, dead five days.** A pseudonym-keyring value entered on
  2026-07-29 failed the server's strict validation, so every preview
  deployment 500-ed on every route from 2026-07-31. Nobody noticed
  because nothing watches, and the required `Vercel` check stayed green
  throughout — its predicate is "build and deploy completed", while the
  crash happens at first invocation.
- **Production, down ~30 minutes.** Splitting
  `POSTHOG_PSEUDONYM_ACTIVE_KEY_ID` into per-environment records
  deleted the original record and created new ones. Deployments bind
  environment variables **by internal record ID**, so the running
  production deployment was left holding a dangling reference and saw
  the variable as absent — while the dashboard showed two correct
  entries. It could not self-heal, and the production build guard
  cancels any redeploy at the same version, so recovery required
  cutting a release.

The unifying defect: **deployment configuration is live production
state that is unversioned, unreviewed, and unverified**, while every
equivalent property is guaranteed for code. Both incidents were
detected by accident during unrelated work.

## Mechanism — four workstreams, one per ticket

1. **Dead deployments must not pass the gate (MCP-475).** Run the
   server's own configuration resolution during the Vercel build so an
   invalid environment turns the build red instead of shipping a
   boot-dead function; add the first dist-boot smoke for this server
   (the testing-strategy §Smoke recorded debt); publish a
   `preview-serves` status from a post-deploy probe of the running
   deployment and add it to the required checks. Build-time catches
   what is knowable before shipping; post-deploy catches routing,
   platform composition, and cold-start classes it cannot see.

2. **Recovery must be minutes, not a release cut (MCP-479).** The
   production ignore-guard conflates "non-release commits never deploy
   to production" (keep) with "never rebuild the current version"
   (harm). Allow any release commit to build, including the deployed
   one and prior ones — restoring both redeploy and rollback.

3. **Boot failures must be visible and actionable (MCP-480).** Sentry
   is constructed from the runtime config, so a config failure throws
   before Sentry exists and is unreportable by construction — proven
   empirically: zero Sentry events from either outage, while a probe
   error reached Sentry in seconds. `boundaryError` gains a minimal
   pre-config Sentry client. Separately the keyring guard reports
   **which** check failed and shape facts, never the value — the
   governing rule is *name the guard, never the value*.

4. **Something must watch between deployments (MCP-481).** Environment
   changes take effect without a deployment event, so
   deployment-triggered checks are structurally blind to them. An
   uptime monitor with an alert attached, plus an independent
   heartbeat check-in whose absence is itself the alert.

## Ceremony rules (record in the environment runbook)

- **Never delete an environment record a running deployment depends
  on.** Edit in place, or add the new scoped records, deploy, and only
  then remove the old one. Delete-and-recreate is the dangerous
  operation; changing a value is not.
- **After any environment change, deploy and then check liveness.**
  The 2026-07-29 entry was never boot-verified; that omission is what
  made a five-day outage possible.
- **Read the runtime logs before forming any theory** when a deployed
  surface fails. The application's own error message named the exact
  failing key throughout both incidents.

## Acceptance criteria

1. A deployment whose environment is invalid fails its build — proof:
   the fix branch's preview goes red against a deliberately invalid
   branch-scoped value, then green when corrected (red-team branch,
   evidence on MCP-475).
2. A dead-but-deployed server blocks its PR — proof: `preview-serves`
   present and required, read back per name from the rulesets API.
3. A known-good release can be redeployed — proof: redeploy the current
   production release and observe a build rather than a cancellation
   (MCP-479).
4. A boot failure appears in Sentry with its failing key — proof: a
   deliberately invalid preview environment produces a Sentry error
   naming the key (MCP-480).
5. Production loss is alerted within five minutes — proof: a recorded
   detection-to-notification timing on a deliberate probe (MCP-481).
6. Every built binary in this workspace carries a smoke test — proof:
   the dist-boot smoke reachable from a CI-run task.

## Out of scope

- Infrastructure-as-code for the Vercel environment (Terraform
  precedent exists in the estate). The declared-shape validator and
  full IaC are the deliberate post-release step; this node covers the
  detection, diagnosis, and recovery gaps only.
- Rotating production key material and retiring the 2026-07-29 setup
  sheet — owner-held, tracked on MCP-475.

*Authored by Birch holds Seedling (e48fe2, agent) at owner direction,
2026-08-03, after the two outages. Sketch pending owner ratification.*
