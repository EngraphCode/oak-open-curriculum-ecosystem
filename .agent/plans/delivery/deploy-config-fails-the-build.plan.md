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
last_updated: 2026-08-09
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
   - **Explicit environment, no file layer.** The gate reads an
     explicitly passed `processEnv` with no `.env`-file layer, because
     production resolution has no file layer either; a rehearsal that
     read files would validate an environment production never sees.
   - **Output discipline.** The gate consumes live key material, so
     what it may print is constrained by acceptance criterion 5: guard
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

   **Clerk key realm, allowlist-shaped.** Presence-only checks also
   miss wrong-instance keys (a test-realm key deployed to production).
   The gate validates key realm with `@clerk/shared`'s key-parsing
   predicates, network-free, under allowlist semantics: the production
   gate passes only keys those predicates positively recognise as
   live-realm keys, and refuses everything else. It carries no prefix
   denylist of its own — a `pk_test_`/`sk_test_` denylist fails open on
   legacy `test_…` development keys and on malformed or truncated
   values (second-opinion review on PR #757, 2026-08-05). The gate
   never calls Clerk's API at build time.

2. **Dist-boot smoke for this server.** The built artefact is started
   as production starts it, reports ready, answers `/healthz`, and
   exits cleanly on SIGTERM — the long-running-server truth-set from
   `testing-strategy.md` §Smoke.
3. **Post-deploy `preview-serves` status.** The `deployment_status`
   workflow shipped in PR #743: it probes the running deployment
   (`/healthz` and the OAuth metadata endpoint, bounded retries for
   cold start) and publishes a commit status, gated on the deployment
   creator being `vercel[bot]`. What remains for this node is making
   that status **required**, which is a trust-boundary move with named
   preconditions — see acceptance criterion 4. The check catches the
   runtime-only classes build-time validation cannot see: routing,
   platform composition, cold start.

Build-time and post-deploy are complementary, not redundant: the first
prevents the bad deployment existing, the second catches what is only
observable once it runs.

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
3. A deployed-but-dead preview **blocks merging** — proof, split:
   **repo-safe** — the shipped `preview-serves` workflow publishes a
   failure status when its probe fails (instrument: the workflow file;
   its first live catch is dated in its header — run 30827202090,
   2026-08-03); **owner-held** — fault injection: a branch whose
   preview deploys and then fails to serve, observed showing
   `preview-serves` red and the pull request unmergeable; verifier the
   lane agent, evidence recorded on MCP-475. Reading the ruleset back
   proves only that the check is required, not that it bites.
4. `preview-serves` is required on the default branch, under its named
   preconditions — proof, split: **repo-safe** — the ADR-204
   required-set reconciliation (its recorded required-check set gains
   `preview-serves`) and the ADR-121 coverage row for the new surface,
   both amended in the delivery PR; **owner-held** — a per-name read of
   the rulesets API listing `preview-serves` among the required checks;
   verifier the lane agent, evidence recorded on MCP-475.
   **Precondition (trust boundary):** the required status must be
   publishable only by the trusted publisher — the base-repo
   `deployment_status` workflow gated on the `vercel[bot]` deployment
   creator — so a pull request cannot forge the green it needs to
   merge. The ruleset change lands only after that precondition is
   verified against the live workflow.
5. Gate output contains no secret bytes — proof: **repo-safe**, a unit
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
  with build-only credentials filtered out and is barred by criterion 5
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
2026-08-09 per the adjudicated 2026-08-05 eleven-expert review
(`deploy-reliability-corpus-amendment`, rows 1–9 and 39).*
