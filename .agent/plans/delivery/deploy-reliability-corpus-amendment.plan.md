---
id: deploy-reliability-corpus-amendment
node_type: delivery
name: 'Amend the deployment-reliability plan corpus (PR #746) per the adjudicated 2026-08-05 review'
overview: 'Apply the surviving findings of the eleven-expert review to the four plan nodes and two operations docs on PR #746, with every finding carrying a recorded disposition, and adjudicate the open CHANGES_REQUESTED on-thread with evidence.'
status: ratified
ratified_by: 'Jim Cresswell'
ratified_date: 2026-08-09
ratified_where: "Owner card at the Director seat 2026-08-09 ~14:5xZ (card answer: 'Ratify — subagent executes'; first-principles check and three benign freshness deltas presented on the card; session Plover lifts Troposphere b10c37)"
serves: first-major-release
impact_areas:
  - served-surface
tickets:
  - MCP-475
  - MCP-479
  - MCP-480
  - MCP-481
depends_on: []
owner_gates: []
last_updated: 2026-08-11
---

# Amend the deployment-reliability corpus

## Goal

PR #746 becomes genuinely mergeable: every finding from the 2026-08-05
eleven-expert review carries a recorded disposition, the four plan
nodes' text is true against current `main` (which now includes the
shipped MCP-479 redeploy arm) and against vendor facts verified at
review time, and the open CHANGES_REQUESTED review is adjudicated
on-thread with evidence rather than overridden or absorbed.

## Problem

The corpus is valuable — it is the map for the remaining
deployment-reliability work — but review found the record defective in
three ways: the branch predates two sibling merges so several passages
describe shipped work as future; the MCP-475 node's mechanism carries
review-confirmed gaps (a forgeable-gate precondition, a build-cache
blind spot, unstated invariants, misclassified proofs); and the
blocking review finding rests on a refuted premise whose demanded
amendment would weaken the gate it criticises. Nothing adjudicates any
of this on the PR itself yet.

## Mechanism

Work happens as commits on the existing PR #746 branch (no new PR):

1. **Rebase/merge `main` in** so the text is amended against reality,
   not against a stale snapshot.
2. **Apply the amendment set** below, file by file.
3. **Adjudicate on-thread**: one review reply carrying the evidence for
   each rejected finding, then re-request review so the
   CHANGES_REQUESTED state can clear honestly.
4. **Record-truing deliverables (owner-directed 2026-08-05).** The same
   amendment round lands the two record cures the post-#751 review
   surfaced: (a) ADR-163 §10's amendment numbering — rename the
   redeploy-arm heading to "Fourth amendment (2026-08-04, MCP-479)" and
   reconcile every self-reference to that single designation, leaving
   the 2026-04-28 third amendment untouched; (b) ADR-163 §10 gains the
   verbatim vendor definition of `VERCEL_GIT_PREVIOUS_SHA` — "The git
   SHA of the last successful deployment for the project and branch"
   (Vercel system-environment-variables reference, retrieved
   2026-08-05) — so the equality arm's premise is cited rather than
   assumed, and the divergence-after-rollback case is named where the
   definition is quoted. The recovery node's own prose is trued to the
   same definition (row 15).

The disposition ledger below is the decision surface: every review
finding has exactly one recorded decision. Applying it is mechanical.

### Disposition ledger — `deploy-config-fails-the-build.plan.md` (MCP-475)

| # | Finding (source) | Disposition |
| --- | --- | --- |
| 1 | `preview-serves` as a required check without the trusted-publisher precondition creates a PR-forgeable required gate (three seats, convergent) | **Apply**: add the trust-boundary move, the ADR-121 coverage row, and the ADR-204 required-set reconciliation as named acceptance criteria/preconditions |
| 2 | Turbo cache can skip the build-time gate on same-commit redeploys — none of the validated env vars are hash inputs (verified: root `turbo.json` app build task) | **Apply**: mechanism states the gate runs as an always-executed, non-cached step (or names its env-hash set); criterion 1's proof gains the same-commit-redeploy case |
| 3 | Run the gate with build-only credentials filtered out and a narrow `runtime-config` import, never the app barrel (security) | **Apply** to §Mechanism — the one mitigation that genuinely shrinks the reachable-secret set |
| 4 | The deploy rehearsal must not absorb a local `.env` file layer that is absent from Vercel's deployment condition (wilma; corrected against the live runtime, which deliberately supports `.env` and `.env.local` locally) | **Apply with corrected premise** — use an explicitly passed `processEnv` through a process-environment-only seam shared with `loadRuntimeConfig`; do not claim the runtime has no file layer |
| 5 | Criteria 1/3/4 label console-verified acts `repo-safe` against the schema and both siblings (three seats) | **Apply**: split each into its repo-safe half (instrument named) and owner-held half (verifier + recording location) |
| 6 | The build-env ≡ runtime-env variable-set invariant is unstated; value-level validation's warrant is unstated (three seats) | **Apply**: one mechanism paragraph naming the invariant and why the motivating failure class is value-shaped |
| 7 | No criterion constrains what the gate may print — it consumes live key material (security) | **Apply**: criterion + unit test that gate output contains no secret bytes |
| 8 | Presence-only Clerk validation misses wrong-instance keys; `@clerk/shared` prefix utilities catch it network-free (clerk) | **Apply** to the gate mechanism with **allowlist semantics** (see row 39), and the recorded caveat never to call Clerk's API at build |
| 9 | The estate has no recorded position on ambient build-env secret exposure (security) | **Apply**: §Out of scope clause naming the exposure as platform-default and pre-existing, listing the live compensating controls |
| 10 | Betty mitigation 1 — keys-not-values validation | **Reject with evidence**: blind to the keyring failure class that motivated the corpus; recreates the second definition of "valid" the node forecloses; the named secret's check is already presence-only |
| 11 | Betty mitigation 2 — post-deploy-only validation | **Reject with evidence**: deletes the node's goal; `preview-serves` is preview-scoped by the node's own boundary |
| 12 | The seat's own Finding-B amendment (structural-only at build) | **Retracted by its author** — same defects as row 10 |
| 13 | Release-expert blocker demanding the row-12 amendment | **Superseded** by rows 10–12's adjudication |

### Disposition ledger — `release-redeploy-recovery.plan.md` (MCP-479)

| # | Finding (source) | Disposition |
| --- | --- | --- |
| 14 | Frontmatter `name`/`overview` still promise the rollback the body disproves (fred, blocker) | **Apply**: rewrite both to the same-commit redeploy arm only |
| 15 | "`VERCEL_GIT_PREVIOUS_SHA` … by construction identifies the current release" overstates the vendor semantic (two seats; vendor-verified: it is the last *successful deployment*, divergent after Instant Rollback) | **Apply**: reword to the verbatim vendor definition; add the post-rollback divergence to §Out of scope; the ADR-163 vendor grounding lands in this same round (Mechanism 4) |
| 16 | The node describes the shipped arm as future work (branch staleness) | **Apply**: re-derive as descriptive of the landed mechanism; proofs cite the shipped unit tests and the live 2026-08-05 pipeline evidence on MCP-479 |
| 17 | The node cites ADR-163 §10 content that does not exist yet (wilma) | **Apply** (owner-directed 2026-08-05): the ADR-163 §10 truing is Mechanism 4 of this plan, so the citation becomes true in the same round |
| 18 | Composed guards leave the promote/rollback path ungated; runbook prescribes it (wilma) | **Partial**: vendor-verified post-rollback auto-assignment suspension (runbook coverage rides PR #769) reframes this; add an §Out of scope bullet naming promotion as platform-governed, not guard-governed |
| 19 | Acceptance criterion 4 ("no duplicate amendment numbers") is currently false on `main` (barney — verified: ADR-163 lines 707/722/732 vs 894) | **Apply**: Mechanism 4 cures the collision; re-verify the node's criterion against the same diff |

### Disposition ledger — `boot-failure-observability.plan.md` (MCP-480)

| # | Finding (source) | Disposition |
| --- | --- | --- |
| 20 | Reporter contract pinned to the retired `SENTRY_MODE` switch; criterion 2 false under the successor shape (fred) | **Apply**: restate on the ADR-171 orthogonal axes (`OBSERVABILITY_SINKS`, fixture-as-tee, unconditional redaction), or declare the un-migrated surface and its migration edge explicitly |
| 21 | "Strictly valid live-mode inputs" undefined — the second-definition drift its sibling declares fatal (wilma) | **Apply**: derive inputs from the shared `SentryEnvSchema`; add the reporter-stays-silent-on-invalid-Sentry-inputs criterion |
| 22 | Incident-duration figures inconsistent across siblings (docs-adr) | **Apply**: move the figures to the tickets, per the corpus's own mechanism-only discipline |
| 23 | Bounded-reporter design verified sound against the real boot path (sentry) | **No change**: cite the evidence at execution pickup |

### Disposition ledger — `production-liveness-detection.plan.md` (MCP-481)

| # | Finding (source) | Disposition |
| --- | --- | --- |
| 24 | The 401-as-healthy assertion requires a Sentry capability that is Early Access, not GA; the owner's screenshot discharged only custom headers (three seats) | **Apply**: record all three needed instrument capabilities with per-capability evidence status; name the fallback (the independent heartbeat probe carries the auth assertion) if the assertion feature is unavailable |
| 25 | The five-minute SLA arithmetic omits Sentry's default three-failure tolerance (sentry) | **Apply**: criterion names Failure Tolerance as a required parameter and shows the arithmetic clearing five minutes |
| 26 | A bare 401 cannot distinguish the app's auth layer from an edge answering in front of it (wilma) | **Apply**: assert an app-only artefact (the `WWW-Authenticate` challenge naming the PRM resource) and name the edge as a probe-path dependency |
| 27 | Finding C's framing conflated headers with authentication; a credential must never enter monitor config (three seats) | **Apply**: dated confirmation note — headers cover `Accept` only; no credential in uptime configuration; a 200 on `POST /mcp` is a failure |
| 28 | The in-repo heartbeat workflow may reverse ADR-162's recorded externalisation direction (fred) | **Apply after check**: ADR-162 still externalises production synthetic monitoring and ends the repo obligation at `/healthz`; add a second owner-decision gate, require owner ratification of the ADR amendment, and prohibit an in-repo heartbeat workflow before that gate clears |
| 29 | Frontmatter `last_updated` contradicts the body's later dated correction (betty-rerun) | **Apply** |
| 30 | The node's owner gate expires 2026-08-06, mid-review (assumptions) | **Apply**: renew the expiry to survive the review cycle; the decision itself stays owner-held |

### Disposition ledger — operations docs and process

| # | Finding (source) | Disposition |
| --- | --- | --- |
| 31 | `environment-variables.md` prescribes a redeploy the guard cancels (docs-adr) | **Overtaken by events**: the redeploy arm shipped in #751, so the instruction is true after the main merge; link the governing ADR-163 §10 contract directly. Do not depend on #769's out-of-scope runbook section |
| 32 | New procedure lacks a cross-reference to the existing local pre-deploy validation path (barney) | **Apply**: one line |
| 33 | Step 1 invites passing a live secret as a shell argument (security) | **Apply**: stdin-or-gitignored-file sentence |
| 34 | The operations index bullet repeats the premise the PR corrects (security) | **Apply**: reword |
| 35 | Two draft-archaeology passages violate `no-tombstones-for-removed-ideas` (two seats) | **Apply**: delete the negation-contrast memorials; keep the vendor quotes and positive statements; the `environment-variables.md` correction note stays |
| 36 | The CHANGES_REQUESTED review is unadjudicated on-thread (two seats) | **Apply**: one evidence-carrying reply (rows 10–13), then re-request review |
| 37 | The PR is a draft awaiting the owner (release-expert) | **Owner-gated by design**: the draft state clears only by the owner's explicit un-draft word (on return from the agreed absence, or earlier at the owner's initiative); review-readiness work proceeds regardless, so the gate holds no work |
| 38 | "The build-time gate already shipped in #743" (barney) | **Reject**: verified false — #743 shipped the preview-serves workflow only; no gate files exist on `main` |

### Disposition ledger — owner-directed additions (2026-08-05, from the second-opinion reviews of the Clerk guard series)

| # | Finding (source) | Disposition |
| --- | --- | --- |
| 39 | Key-realm validation must be allowlist-shaped: a denylist of `pk_test_`/`sk_test_` prefixes fails open — legacy `test_…` development keys and malformed/truncated values pass in production (second-opinion review on PR #757, 2026-08-05) | **Apply**: row 8's amendment specifies allowlist semantics — the production gate passes only keys the `@clerk/shared` live-realm predicates positively recognise, and refuses everything else. The corpus prescribes the contract shape ("positively recognised live-realm key"), never a prefix list of its own |
| 40 | The app README's Vercel section still documents `DANGEROUSLY_DISABLE_AUTH=true` as a valid optional configuration (with Clerk keys "unnecessary"), while the guard series makes exactly that a hard startup failure in preview and production (second-opinion review on PR #759, 2026-08-05) | **Overtaken by main**: the app README now names the flag as a local-development valve and states that every deployed environment rejects it; no duplicate edit belongs in this PR |

## Acceptance criteria

1. **Every 2026-08-05 review finding has exactly one ledger row and the
   applied rows are visible in the diff.** Proof: repo-safe — this
   node's ledger plus the PR #746 diff at re-review.
2. **No corpus statement contradicts `main`** (shipped arm described as
   shipped; runbook instructions executable today). Proof: repo-safe —
   the rebase commit plus reviewer re-check against the named files.
3. **The review thread carries the adjudication and the review state
   clears honestly** (reply posted, re-review requested; no dismissal
   without evidence). Proof: repo-safe — the PR thread.
4. **CI green on the amended branch** including the plan-estate
   validator. Proof: repo-safe — the checks rollup.
5. **Merge happens at the owner's word.** Proof: owner-held — the owner
   (or their explicitly authorised act) un-drafts and blesses the
   merge; recorded on the PR.
6. **ADR-163 §10 names its amendments without collision and quotes the
   `VERCEL_GIT_PREVIOUS_SHA` definition verbatim with its retrieval
   date** — exactly one "fourth amendment" designation for the redeploy
   arm, no remaining "third" reference to it, the 2026-04-28 third
   amendment untouched. Proof: repo-safe — the ADR diff plus docs lint.

## Out of scope

- Executing PR #769's remaining deliverables (the guard
  cancellation-message change, the rolled-back-state runbook section,
  the live redeploy proof). The ADR-163 §10 truing moved INTO this plan
  (owner-directed 2026-08-05, Mechanism 4); #769's node is re-scoped
  accordingly.
- Any code change to the shipped guard or the estate's build scripts —
  this PR remains docs-only.
- The estate-level build-environment secret-exposure ruling (row 9
  records the position pointer; a durable ruling belongs to the
  governance surface).
- Merging #746 itself — owner-gated per criterion 5.

## Todos

- [x] T1: merge `main` into the branch; re-true `release-redeploy-recovery`
      and the two operations docs (rows 14–19, 31–35); land the ADR-163
      §10 truing (Mechanism 4); run the row-40 README check.
- [x] T2: amend `deploy-config-fails-the-build` (rows 1–9, 39).
- [x] T3: amend `boot-failure-observability` and
      `production-liveness-detection` (rows 20–30, including the row-28
      check).
- [x] T4: post the adjudication reply (rows 10–13, 36), re-request
      review, and record the ledger completion on the tickets. Evidence:
      [PR adjudication](https://github.com/oaknational/oak-open-curriculum-ecosystem/pull/746#issuecomment-5251424241);
      Linear comments `626aaa2d-26e2-460c-a087-4d659d5f66ec`
      (MCP-475), `e102e0ae-ec81-48d5-a610-09e42c029b1d`
      (MCP-479), `2fdd6924-f0c0-4170-903b-c70b88ea4354`
      (MCP-480), and `60917574-1f92-4102-abaa-25a89b5f5b36`
      (MCP-481), all 2026-08-11.

T4 records the completed publication actions; it does not satisfy acceptance
criterion 3 by itself. At `8728ec9e55b3a1d624315d6cf4b1f444937bf5df`,
all 19 reported checks were green and no inline review thread remained, but
the code-owner decision was still `CHANGES_REQUESTED` from an older head.
Fresh code-owner clearance remains mandatory before merge.

All four todos are commits on the existing PR #746 branch — one review
round, no new PR.
