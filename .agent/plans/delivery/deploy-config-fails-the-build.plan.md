---
id: deploy-config-fails-the-build
node_type: delivery
name: 'Deploy gate: an invalid environment fails the build, and a dead preview blocks the merge'
overview: 'Make the required Vercel check mean "the deployed server serves" rather than "the build completed", so a boot-dead deployment cannot ship or pass the merge gate.'
status: sketch
serves: first-major-release
impact_areas:
  - served-surface
tickets:
  - MCP-475
depends_on: []
owner_gates: []
last_updated: 2026-08-03
---

# Deploy gate: invalid environment fails the build

## Goal

A deployment whose environment the server would reject never ships, and
a deployment that ships but does not serve blocks its pull request.

## Problem

The required `Vercel` status asserts "build and deploy completed". This
app resolves its runtime configuration lazily at first request, so a
deployment with an invalid environment builds green, deploys green, and
then 500s on every route. Preview was in exactly that state from
2026-07-31 to 2026-08-03 while every check stayed green. Full incident
record on MCP-475.

## Mechanism

1. **Build-time configuration resolution.** A build step runs the
   server's own `loadRuntimeConfig` composition against the build
   environment and exits non-zero on refusal, so the Vercel build goes
   red. Enforced when the `VERCEL` system variable is present; local
   builds print an explicit skip line rather than passing silently.
2. **Dist-boot smoke for this server.** The built artefact is started
   as production starts it, reports ready, answers `/healthz`, and
   exits cleanly on SIGTERM — the long-running-server truth-set from
   `testing-strategy.md` §Smoke.
3. **Post-deploy `preview-serves` status.** A `deployment_status`
   workflow probes the running deployment (`/healthz` and the OAuth
   metadata endpoint, bounded retries for cold start) and publishes a
   commit status, which is then added to the required checks. This
   catches the runtime-only classes build-time validation cannot see:
   routing, platform composition, cold start.

Build-time and post-deploy are complementary, not redundant: the first
prevents the bad deployment existing, the second catches what is only
observable once it runs.

## Acceptance criteria

1. A build whose deploy environment is invalid fails — proof:
   **repo-safe**, the gate module's unit tests (env fixtures to exit
   intent per failure class) plus a live red build on a branch carrying
   a deliberately invalid branch-scoped value.
2. The built server artefact boots, answers, and terminates cleanly —
   proof: **repo-safe**, the dist-boot smoke, reachable from a CI-run
   task (an unreachable smoke is the defect, not a variant).
3. A deployed-but-dead preview **blocks merging** — proof:
   **repo-safe**, fault injection: a branch whose preview deploys and
   then fails to serve shows `preview-serves` red and the pull request
   unmergeable. Reading the ruleset back proves only that the check is
   required, not that it bites.
4. `preview-serves` is required on the default branch — proof:
   **repo-safe**, per-name read of the rulesets API listing it among
   the required checks.

Scope note: criterion 2 covers **this server's** artefact. The
estate-wide "every built binary carries a smoke test" obligation is
pre-existing recorded debt in `testing-strategy.md` §Smoke and needs
its own authorisation and ticket.

## Out of scope

- **Validating anything the server does not itself consume.** The build
  step runs the server's own `loadRuntimeConfig` composition rather than
  a parallel list of expected variables. A second, hand-maintained
  definition of "valid environment" would drift from the real one, and a
  guard that disagrees with the thing it guards is worse than none.
- **Replacing the `Vercel` required check.** It correctly asserts what
  it asserts — build and deploy completed. This node adds the two
  predicates it was never making, rather than redefining it.
- **Runtime configuration reloading.** Resolution stays lazy at first
  request; this node adds a build-time *rehearsal* of that resolution,
  not a change to when the server actually resolves.
- **Preview environment repair.** Fixing a specific broken environment
  is operations; this node makes a broken one unable to ship.
- **Extending `preview-serves` to production.** Production has its own
  detection path in
  [`production-liveness-detection`](production-liveness-detection.plan.md);
  a deployment-triggered check cannot cover the between-deployments
  interval, which is exactly the gap that node exists for.

## Relationship to the sibling nodes

One of four responses to a single defect class — deployment
configuration is live production state that is unversioned, unreviewed
and unverified. Siblings:
[`release-redeploy-recovery`](release-redeploy-recovery.plan.md)
(recovery), [`boot-failure-observability`](boot-failure-observability.plan.md)
(diagnosis), [`production-liveness-detection`](production-liveness-detection.plan.md)
(detection). They ratify and complete independently.

*Authored by Birch holds Seedling (e48fe2, agent), 2026-08-03.*
