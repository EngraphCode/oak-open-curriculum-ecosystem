---
id: deploy-config-fails-the-build
node_type: delivery
name: 'Deploy gate: an invalid environment fails the build'
overview: 'Run the server runtime-config contract during Vercel builds and prove the built artefact boots, so a deployment with invalid configuration cannot ship.'
status: sketch
serves: first-major-release
impact_areas:
  - served-surface
tickets:
  - MCP-475
depends_on: []
owner_gates: []
last_updated: 2026-08-11
---

# Deploy gate: invalid environment fails the build

## Goal

A deployment whose environment the server would reject never ships.

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

   The gate's execution contract carries four clauses the 2026-08-05
   review made load-bearing:

   - **Always executed, never cached.** The gate runs as a
     non-cacheable step outside the Turbo task graph — or, if it ever
     moves inside it, its task declares every validated variable as a
     hash input. Verified at review (2026-08-05): none of the validated
     variables are hash inputs of the app's `build` task in the root
     `turbo.json`, so a cached build could otherwise skip the gate on
     exactly the same-commit redeploy path MCP-479 restored.
   - **Narrow import, filtered credentials.** The gate imports the
     runtime-config composition module directly — never the app
     barrel — and runs with build-only credentials filtered out of its
     process environment, so the gate process's reachable-secret set is
     the validated set and nothing more.
   - **Explicit deployment environment.** The live runtime composition
     supports `.env` and `.env.local` for local operation. The deploy gate
     uses a process-environment-only seam shared with `loadRuntimeConfig`,
     with an explicitly passed `processEnv`, so it models Vercel's
     deployment condition without allowing local file precedence to
     change the rehearsal.
   - **Output discipline.** The gate consumes live key material, so
     what it may print is constrained by acceptance criterion 3: guard
     names and failure classes only, never values.

   **The invariant this rehearsal rests on, and why validation is
   value-level.** The gate is honest only while the variable set the
   build resolves is identical to the variable set the runtime
   resolves. Both are `loadRuntimeConfig` over the same declared
   schema, and any variable added to either path arrives through that
   shared schema, so the sets cannot drift silently — the mechanism
   states this invariant rather than assuming it. Validation is
   value-level (not presence-only) because the motivating failure class
   was value-shaped: the 2026-08-03 keyring outage was a present,
   plausible-looking value failing strict validation, and a presence
   check passes exactly that state.

   **Clerk key realm uses the runtime authority.** Presence-only checks
   miss wrong-instance keys (a test-realm key deployed to production),
   but the gate adds no second Clerk validator. `HttpEnvSchema` already
   calls the shipped `refineClerkKeyLocality` guard, whose production
   allowlist admits only `pk_live_` and `sk_live_` keys. Because the gate
   runs `loadRuntimeConfig`, it consumes that exact rule. It does not call
   Clerk's API or use `@clerk/shared` predicates: the installed predicate
   accepts a legacy `live_…` publishable-key form that the runtime rejects,
   so using it here would recreate two definitions of valid configuration.

2. **Dist-boot smoke for this server.** The built artefact is started
   as production starts it, reports ready, answers `/healthz`, and
   exits cleanly on SIGTERM — the long-running-server truth-set from
   `testing-strategy.md` §Smoke.
3. **Existing advisory post-deploy signal — context, not a deliverable.**
   The `deployment_status`
   workflow shipped in PR #743: it probes the running deployment
   (`/healthz` and the OAuth metadata endpoint, bounded retries for
   cold start) and publishes a commit status when the deployment creator
   is `vercel[bot]`. That creator check authenticates the deployment
   event, not the publisher logic: the workflow runs from the deployment
   commit, so a pull request can rewrite its own publisher and forge a
   green status. The status therefore stays advisory until publication
   moves behind a default-branch workflow or dedicated GitHub App trust
   boundary that a pull request cannot modify. A separately authorised
   delivery node must own that trust-boundary choice before the status can
   become required. The check catches the runtime-only
   classes build-time validation cannot see: routing, platform
   composition, cold start.

Build-time and post-deploy are complementary, not redundant: the first
prevents the bad deployment existing, while the already-shipped advisory
signal catches what is only observable once it runs.

**Build-vs-buy record (2026-08-11).** Vercel Native Deployment Checks can
run a selected `package.json` script and can be required per environment,
but Vercel documents that the check is skipped when the matching script is
absent. A pull request controls that script, so the feature cannot be the
sole carrier of this non-bypassable build invariant; the Vercel build must
still invoke the shared-schema gate unconditionally. Vercel's Checks API
and Marketplace integrations can run reliability checks against a built
deployment and block domain assignment, but they require an externally
configured OAuth integration. They are candidates for the separately
authorised trusted-publisher delivery, not hidden work in this node. See
[Native Deployment Checks](https://vercel.com/changelog/native-deployment-checks)
and the [Checks API contract](https://vercel.com/docs/checks/creating-checks).

## Acceptance criteria

1. A build whose deploy environment is invalid fails — proof, split:
   **repo-safe** — the gate module's unit tests (env fixtures to exit
   intent per failure class), including the same-commit-redeploy case:
   the gate executes and refuses on a rebuild of an already-deployed
   commit, proving no cache layer can skip it on that path;
   **owner-held** — a live red build on a branch carrying a
   deliberately invalid branch-scoped value; verifier the lane agent,
   evidence (build URL and outcome) recorded on MCP-475.
2. The built server artefact boots, answers, and terminates cleanly —
   proof: **repo-safe**, the dist-boot smoke, reachable from a CI-run
   task (an unreachable smoke is the defect, not a variant).
3. Gate output contains no secret bytes — proof: **repo-safe**, a unit
   test feeding the gate live-shaped key material and asserting the
   captured output (stdout and stderr) never contains the input's byte
   content, on the pass path and on every failure class.

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
  it asserts — build and deploy completed. This node adds the build-time
  configuration rehearsal rather than redefining that status.
- **Trusted `preview-serves` publication and ruleset adoption.** The
  current branch-controlled publisher remains advisory. Before making it
  required, a separately authorised delivery node and ticket must name the
  owner, choose among a default-branch workflow, a dedicated App, or a
  Vercel Checks integration, and prove by fault injection that a pull
  request cannot mint its own required green status. No such system is
  smuggled into this node as an unnamed second project.
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
- **The ambient build-environment secret surface.** Vercel supplies the
  deployment's environment variables to the build by platform default,
  so secrets are reachable by build-time code with or without this
  gate: the exposure is pre-existing and platform-default, and the gate
  adds no new secret to the build environment — it reads a filtered
  subset of what is already there. An estate-level ruling on that
  surface belongs to the governance surface, not this node. The live
  compensating controls are named for the record: dependency
  vulnerability scanning (ADR-174) and lockfile-pinned installs bound
  what third-party code runs at build; secret scanning (ADR-111) keeps
  credentials out of the repo; and the gate itself runs a narrow import
  with build-only credentials filtered out and is barred by criterion 3
  from printing values.

## Relationship to the sibling nodes

One of four responses to a single defect class — deployment
configuration is live production state that is unversioned, unreviewed
and unverified. Siblings:
[`release-redeploy-recovery`](release-redeploy-recovery.plan.md)
(recovery), [`boot-failure-observability`](boot-failure-observability.plan.md)
(diagnosis), [`production-liveness-detection`](production-liveness-detection.plan.md)
(detection). They ratify and complete independently.

*Authored by Birch holds Seedling (e48fe2, agent), 2026-08-03. Amended
2026-08-11 per the adjudicated review record in
`deploy-reliability-corpus-amendment`.*
