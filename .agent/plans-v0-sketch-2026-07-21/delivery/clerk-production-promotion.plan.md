---
id: clerk-production-promotion
node_type: plan
name: "Clerk production promotion — the Oak MCP runs on production auth (MCP-67)"
overview: >-
  Promote apps/oak-curriculum-mcp-streamable-http from the Clerk
  Development instance to a production Clerk identity realm on a stable
  custom domain — decisions closed, owner ceremony sequenced, conformance
  and validation gates named — per the landed Clerk MCP authentication
  report.
kind: executable
serves_strategic_choice: APP-1
last_updated: 2026-07-21
thread: curriculum-mcp-path-to-ga
derives_from:
  - .agent/reports/initial-release-supporting-docs/clerk-mcp-authentication-report.md (landed 2026-07-21; §§5A, 6–9, 11–15 are this plan's evidence base)
  - .agent/research/auth/clerk-production-migration.md (§0 blocking prerequisite — instance topology)
  - docs/architecture/architectural-decisions/053-clerk-as-identity-provider.md (binding shared-instance mandate + opaque runtime shape; D0/D3 engage it)
  - docs/architecture/architectural-decisions/115-oauth-proxy-authorization-server.md (proxy-AS metadata shape the validation gates assert)
  - docs/architecture/architectural-decisions/142-clerk-mcp-tools-adopt-or-explain.md (opaque-token spike record)
  - 'Milestone "Clerk production hardening" (project MCP App: First Major Release, target 2026-08-11)'
related:
  - MCP-67 (Linear ticket; execution status projects there per V0 §2.2)
todos:
  - id: 0-1-decision-ledger
    content: "0.1 Author the decision ledger (D0–D10), owner cards, and validation gates (this PR)."
    status: completed
    depends_on: []
  - id: 0-2-reviewer-rounds
    content: "0.2 clerk-expert planning review + assumptions-expert readiness round; apply verdicts; mark DECISION-COMPLETE."
    status: completed
    depends_on: [0-1-decision-ledger]
  - id: 0-3-owner-card-1
    content: "0.3 Owner card 1 — full-ledger confirm (D0–D10 one line each; active choices D0 topology, D1 domain, D6 staging, D9 access policy; risk acceptances D2/D10 and the owner-only incident-lever bus-factor shown)."
    status: pending
    depends_on: [0-2-reviewer-rounds]
  - id: 1-1-production-guards-cycle
    content: "1.1 Cycle: fail-fast production guards — reject pk_test/sk_test in the production environment; tighten DANGEROUSLY_DISABLE_AUTH rejection to development-only (D10, after its blast-radius check); include CLERK_AUTHORIZED_PARTIES in the validated boundary (test + product, atomic)."
    status: pending
    depends_on: [0-2-reviewer-rounds]
  - id: 1-2-resource-conformance-cycle
    content: "1.2 Cycle: resource/audience conformance — audit existing e2e coverage, then add the missing report-§12.2 negative cases (wrong issuer, wrong resource, expired, session-token-not-oauth, query-param token) against the opaque-token verification path (test + product where gaps exist, atomic)."
    status: pending
    depends_on: [1-1-production-guards-cycle]
  - id: 1-3-canonical-origin-cycle
    content: "1.3 Cycle: canonical-origin and metadata discipline — generated deployment aliases cannot mint a second OAuth resource identifier; PRM/AS metadata reflect the ADR-115 proxy shape at the canonical origin (test + product, atomic)."
    status: pending
    depends_on: [1-2-resource-conformance-cycle]
  - id: 2-1-owner-card-2
    content: "2.1 Owner card 2 — the create ceremony (§Owner cards, Card 2): instance act per D0 branch, DNS + certificates, production Google credentials, restrictions per D9, explicit token format per D3, Vercel env scoping per D6."
    status: pending
    depends_on: [0-3-owner-card-1, 1-3-canonical-origin-cycle]
  - id: 3-1-production-validation
    content: "3.1 Owner card 3 — paired live validation: agent-prepared checklist, owner-executed browser OAuth flows (Google + host accounts), agent-run curl/metadata checks; evidence recorded on MCP-67."
    status: pending
    depends_on: [2-1-owner-card-2]
  - id: 3-2-host-compat-matrix
    content: "3.2 Record the tested host compatibility matrix (Claude, plus each supported MCP host): discovery, registration mechanism, browser flow, reconnect."
    status: pending
    depends_on: [3-1-production-validation]
  - id: 4-1-cutover
    content: "4.1 Cutover per report Phase 8 (owner publishes the connector URL; limited cohort first) with the rollback path rehearsed (Phase 9: code-revert keeping the production identity realm)."
    status: pending
    depends_on: [3-1-production-validation, 3-2-host-compat-matrix]
---

# Clerk production promotion (MCP-67)

**Status**: DECISION-COMPLETE (clerk-expert SOUND + assumptions-expert
READY, 2026-07-21, each after one cured round and a delta re-check;
the final two residuals R1/R2 applied as directed) — execution gated
on owner Card 1 (todo 0.3)
**Ticket**: [MCP-67](https://linear.app/oaknational/issue/MCP-67) ·
Milestone: Clerk production hardening ("starts first") · Project target
2026-08-11
**Evidence base**: the
[Clerk MCP authentication report](../../reports/initial-release-supporting-docs/clerk-mcp-authentication-report.md)
(landed 2026-07-21, reviewed against Clerk + MCP docs of that date),
plus the repo's binding auth ADRs (053, 113, 115, 142) and the
[production-migration research](../../research/auth/clerk-production-migration.md).
This plan does not restate them; it closes Oak's decisions against
them and sequences the work. Bare section references are to the
report.

## Problem

**Gap**: the Oak MCP server
(`apps/oak-curriculum-mcp-streamable-http`) runs on a Clerk
**Development** instance — development keys, the 100-user cap, shared
development Google credentials, no stable production OAuth resource
identity. **Who it harms**: teachers, who cannot connect their real
assistants to Oak's MCP; and the release, whose remaining lanes assume
a production auth boundary exists. **Mechanism**: Clerk Development
and Production are separate identity realms (§8.1) — promotion is a
deliberate recreation of configuration and credentials, not a key swap
(§8.2), so the work is a sequenced ceremony with validation gates,
most of it owner-held. **Constraints**: the owner role (workspace
admin on Clerk/DNS/Google/Vercel) is the only holder of the ceremony
acts; development users and identifiers do not transfer (§8.1); the
MCP resource URL must be chosen once and early (§9 Phase 0); ADR-053's
shared-instance mandate binds until amended (D0); target 2026-08-11.
**Success**: an unauthenticated request to the production `/mcp`
receives a standards-compliant challenge, a real MCP host completes
the full Clerk OAuth flow against the production realm, and the
report's §15 definition-of-done items are evidenced on MCP-67.

## End Goal, Mechanism, Means

- **End goal**: the Oak MCP runs on production Clerk auth at a stable
  HTTPS origin — connectable by real teachers' assistants (APP-1).
- **Mechanism**: a production Clerk realm acts as the OAuth
  authorization server behind the app's existing ADR-115 proxy-AS
  boundary; the runtime token shape stays opaque per the binding
  ADR-053/142 doctrine (D3), so the verification stack is re-pointed
  at production credentials without a shape change; conformance guards
  make wrong-environment configuration a startup failure.
- **Means**: three code cycles (guards + conformance tests), three
  owner cards (ledger confirm; create ceremony; paired live
  validation), a host compatibility matrix, and a rehearsed rollback.

## Decision ledger

Card 1 presents every decision below as a one-line confirm; D0, D1,
D6, and D9 are its active choices, and the D2/D10 risk acceptances are
explicitly the owner's to make there — an agent-authored plan proposes
them, it cannot accept them. Card 1 also shows WS1's named fail-fast
window (§Workstreams) for knowing acceptance. None is left open: each
carries a recommendation the card confirms or overrides.

### D0 — Instance topology: independent production Clerk application

**Recommendation**: a dedicated Clerk application for the Oak MCP
(the research doc's Option B), NOT the shared Aila production
instance.
**Rationale**: Clerk restrictions and sign-up policy are
instance-wide; opening the MCP to teacher sign-ups on the shared
instance would open Aila's realm with it (research §0 — the named
Critical prerequisite). A dedicated application isolates the MCP's
access policy (D9), OAuth applications, and incident levers.
**Deliverable this branch carries**: an ADR-053 amendment — its
2026-04-21 shared-instance mandate ("through public alpha") is
superseded for the MCP by this decision; the amendment lands with WS1
or earlier, owner-ratified per doctrine-PR rules.
**If overridden to shared**: Card 2 step 1 becomes obtaining the
existing production instance's keys and adding MCP-specific OAuth
settings; steps 2–3 largely fall away (domain and Google exist); D9's
access policy becomes a shared-realm negotiation — the card names this
consequence so the choice is informed.

### D1 — Production origin and MCP resource URL

**Recommendation**: a stable custom domain owned by Oak, with the MCP
resource at `<origin>/mcp`. Candidate: `mcp.thenational.academy`
(final string is confirmed at Card 1 — DNS is an owner-role act; the
candidate makes the card a confirm, not a design task). Never a
`*.vercel.app` generated alias (§5A.12; cycle 1.3 enforces the
canonical-origin discipline).
**Rationale**: the resource URL is the single hardest-to-change
decision (§9 Phase 0); a custom domain decouples it from deployment
platform details.

### D2 — Client registration: DCR enabled, consent enforced, monitored

**Recommendation**: enable Dynamic Client Registration on the
production OAuth surface; consent is automatically enforced by Clerk
when DCR is on (not a separate toggle); monitor registrations.
**Rationale**: APP-1's goal is teachers inside **the assistants they
already use** — an open host ecosystem where pre-registering every
client is impossible. The threat-model cost (anonymous client
creation, branding impersonation) is proposed for acceptance at
Card 1 with these mitigations, each with a named operator: consent
enforced (Clerk-automatic); registration review = a periodic
owner-role pass over the Clerk dashboard's OAuth applications list
(Clerk exposes no DCR metrics API); app-side §13.1 auth metrics belong
to the observability lane and are consumed by whoever holds that lane.
Registrations flow through the ADR-115 proxy's `/oauth/register`, but
enabling DCR remains a Clerk-dashboard act (Card 2 step 4).
**Rejected**: pre-registration only (forecloses the product goal);
CIMD advertisement (Clerk documents DCR, not CIMD — §14.2; do not
advertise unverified capability).

### D3 — Token format: opaque, pinned explicitly

**Recommendation**: opaque access tokens, set by explicit dashboard
act — the production OAuth application's "Generate access tokens as
JWTs" toggle OFF (Card 2 step 4).
**Rationale**: opaque is the repo's **binding runtime shape** —
ADR-053 ("Current Binding MCP Runtime Shape": opaque `oat_...` tokens,
Clerk-supported verification, no local JWT validation) and ADR-142
(the 2026-03-28 spike; JWT rejected as risk-for-no-benefit given the
ADR-115 proxy issuer shape). Keeping opaque preserves this plan's own
mechanism promise — the auth boundary re-points at production
credentials with no shape change — and makes revocation immediate,
strengthening D8. The verification-path latency cost is today's
already-running behaviour, not a regression.
**Why pinned, not defaulted**: Clerk's default changed from opaque to
JWT between the March spike and the July docs — the default has moved
under this repo once already; the format is therefore an explicit
setting, never an inherited default, and cycle 1.2's negative suite
runs against opaque-format tokens matching production.
**Rejected**: JWT (requires ADR-053/142 amendments plus a proving
cycle for the currently-dead JWT branch of the audience validator
against an unverified `aud` format and the ADR-115 proxy issuer
mismatch — real work for no benefit on a read-only tool surface).

### D4 — Scopes: profile + email only

**Recommendation**: request and advertise `profile` and `email`
exactly; no `user:org:read` (Organizations is not part of the v1
release), never `private_metadata`, and no `openid` (Clerk rejects it
at authorize-time for DCR clients — ADR-113's recorded
troubleshooting).
**Rationale**: minimum identity disclosure (§4.1); scopes are not tool
permissions — Oak authorization stays server-side.

### D5 — Auth model: per-server, unchanged

**Recommendation**: keep the existing per-server model — every `/mcp`
request requires a verified token, as pinned by the app's own
`auth-enforcement` e2e suite (the app's `check-mcp-client-auth`
boundary, not the report's Next.js `required: true` idiom).
**Rationale**: no public anonymous tool surface exists or is wanted
for v1 (§3.1); recorded so the ledger is complete.

### D6 — Environments: staging via a separate Clerk application

**Recommendation**: the report's §8 model — a separate Clerk
application (its own Production instance) on a stable staging domain
(candidate: `mcp-staging.thenational.academy`) for production-like
validation, with dedicated staging Google credentials. Local
development stays on the existing Development instance.
**Preview/production key separation — the mechanism, named**: Vercel
environment scoping, executed at Card 2 step 5 — the production app's
`pk_live_`/`sk_live_` exist ONLY in the Vercel Production environment;
the staging app's keys are scoped to the staging branch's Preview
environment; generic previews carry Development keys. A blanket
reject-live-keys-in-preview guard is deliberately NOT built — the
staging shape (§5A.11) legitimately runs the staging app's `pk_live_`
on a Preview-branch domain. Verification: card 3's checklist includes
a `vercel env ls` scoping review recorded as evidence.
**Cost honesty**: one more owner ceremony (a second, smaller create
pass). If declined at Card 1, the named fallback is validating
directly on production with a limited cohort before connector
publication (§9 Phase 8) — riskier but calendar-cheaper; the choice is
the owner's at the card, with staging as the recommendation.

### D7 — Google connection: dedicated production project, published

**Recommendation**: production Google Cloud project owned by Oak,
custom credentials pasted into the production Clerk connection,
publishing status **In production** with brand verification complete
(§6.2–6.3). Shared development credentials never touch production.
(Google email-subaddress blocking is Clerk-default-on; no action.)
**Rationale**: report requirement, and Google's Testing-status
100-user cap would otherwise bite exactly at launch.

### D8 — Rollback: code-revert keeping the production realm

**Recommendation**: rollback = revert application deployment while
keeping the production Clerk identity realm (§9 Phase 9); connector
exposure is controlled by publishing/unpublishing the MCP URL and, in
incident class, disabling the OAuth application or DCR in the Clerk
dashboard (§13.2). With D3's opaque tokens, revocation is immediate.
Switching back to the Development realm is not a rollback path.
**Bus-factor, surfaced**: every incident lever above is owner-role-only
under the sole-admin constraint — a v1 operational fact Card 1 shows
for explicit acceptance.

### D9 — Production access policy: open sign-up

**Recommendation**: the production realm's sign-up is open (Google
sign-in, Clerk defaults), with NO `@thenational.academy`-style domain
allowlist — the product goal is any teacher's assistant. The dev
lineage carries an allowlist, and Clerk restrictions are instance-wide
dashboard settings that cloning does not choose deliberately — Card 2
step 1 includes an explicit Restrictions review configuring this
decision. On the D0-shared branch this decision is exactly what would
leak into Aila's realm, which is why D0 recommends independent.
**Rejected**: allowlist/waitlist for v1 (contradicts APP-1; a future
cohort-limiting need is served by the Phase-8 limited-cohort step, not
by realm-wide restrictions).

### D10 — Development auth bypass: retained, development-only, guarded

**Recommendation**: keep `DANGEROUSLY_DISABLE_AUTH` as a
development-only valve — it exists for local work without Clerk
credentials and the e2e harness exercises it — and tighten its
rejection from "not in production" (today's guard) to "development
only" in cycle 1.1.
**Blast-radius check (named, precedes the tightening)**: verify no
deployed environment currently sets the flag — the AGENT runs the
Vercel env review (the session's Vercel tooling has read access)
immediately before cycle 1.1, with Card 2 step 5 as the owner's
confirming recheck; plus the existing e2e suite staying green.
**Rejected**: removing the valve for a DI fake-verifier seam (more
machinery than the need justifies today; revisit if the valve ever
leaks toward deployed configs — the cycle-1.1 guard is the tripwire).

## Owner cards (three, batched for the owner's return)

**Card 1 — ledger confirm + Phase-0 contract (~5–10 min)**: one line
per decision D0–D10; active choices: D0 (topology — independent
recommended), D1 (domain string), D6 (staging yes/no), D9 (access
policy). Risk acceptances shown explicitly: D2's DCR threat model with
its mitigations and operators, D8's owner-only incident levers, D10's
retained dev valve. Everything downstream keys on this card.

**Card 2 — the create ceremony (~45–60 min, dashboard + DNS acts,
after cycles 1.1–1.3 land)**, sequenced per report Phases 2–5;
steps 1–3 take the D0-independent branch (the card names the shared
variant per D0 if overridden):

1. Clerk Dashboard → create the Oak MCP production application/
   instance per D0; review cloned settings where a clone prompt
   appears (it clones only if the MCP's Development instance lives in
   its own dedicated application — if none appears, a from-defaults
   start is expected, and the recreate list below still covers
   everything that matters); recreate SSO connections, integrations,
   and paths explicitly (§8.2 — cloning does not copy them); **review
   Restrictions and set sign-up per D9** (cloning does not make that
   choice deliberate).
2. Configure the production domain from Card 1; add the DNS records
   Clerk names; deploy certificates when prerequisites complete
   (start early — propagation up to 48h is the long pole, §9
   Phase 2).
3. Google: create the production Cloud project, configure
   consent/branding, create the OAuth web client with Clerk's exact
   redirect URI, paste credentials into the production Clerk
   connection, set publishing status In production (§6.2–6.3).
4. Clerk production OAuth settings: enable DCR (consent enforcement is
   automatic — verify it shows enforced, don't hunt for a toggle);
   **set the token format explicitly — "Generate access tokens as
   JWTs" OFF per D3**; verify Clerk's own metadata endpoints resolve
   with production values (§9 Phase 4) — the ADR-115 proxy-rewrite
   assertions are NOT this step; they are the agent's curls at
   Card 3.
5. Vercel: set `CLERK_PUBLISHABLE_KEY` (`pk_live_`),
   `CLERK_SECRET_KEY` (`sk_live_`, marked Sensitive),
   `CLERK_AUTHORIZED_PARTIES`, and the canonical-origin variables,
   scoped per D6's separation mechanism (production keys in
   Production only); review that no environment sets
   `DANGEROUSLY_DISABLE_AUTH` (D10's blast-radius check); redeploy
   (env changes are not live until redeploy — §5A.11).
6. If D6 staging confirmed: repeat 1–5 in miniature for the staging
   application and domain.
7. Hand back on MCP-67: domain live, keys placed, DCR/token-format
   state — Card 3 is armed on that word.

**Card 3 — paired live validation (~30 min, with an agent)**: the
live OAuth flows need a human browser and real accounts, so the
executor is named: the owner runs the browser ceremonies (Google
sign-in on a production account; host-side connect on Claude and each
supported host, using Oak's host accounts) against an agent-prepared
checklist; the agent runs every non-interactive check (curl metadata,
negative-path curls, `vercel env ls` scoping review) and records all
evidence on MCP-67. Denial, revocation, and reconnect are part of the
script (§6.5, §12.4–12.5).

## Workstreams and changeset classes (PDR-132 at authoring time)

- **WS0 — this plan** (record class): one PR, this file.
- **WS1 — conformance guards** (code class): cycles 1.1–1.3, one PR —
  plus the D0 ADR-053 amendment as its own doctrine-class PR
  (owner-ratified). Single story per PR; 1.2 audits existing e2e
  coverage first and adds only missing negative cases. Size prediction
  (inside the warnings) is a prediction, not evidence — if 1.2's audit
  finds a large gap, the split point is negative-suite-as-own-PR.
  **Named fail-fast window**: landing WS1 makes the current
  dev-keys-in-production configuration a startup failure by design on
  the next production deploy, until Card 2 step 5 places live keys —
  acceptable while the connector is unpublished (nothing consumes the
  production `/mcp` yet), shown at Card 1 so the owner accepts the
  window knowingly, and cured by Card 2 step 5.
- **WS2 — validation evidence** (record class): 3.1–3.2 produce
  evidence on MCP-67 and the compatibility matrix under the app's
  docs; PR only if repo artefacts change.
- Owner cards and cutover (4.1) are ceremony, not changesets.
- **Pending edge, named**: when S3's milestone plan lands, this plan
  gains its `depends_on` edge to it per the corpus-reset acceptance
  criterion; until then the lane runs on the documents-only gate the
  S3 ruling grants.

## Acceptance criteria and proof contract

| Id | Criterion | Proof level | Proof |
| --- | --- | --- | --- |
| A1 | Ledger closed; reviewers passed | non-code | clerk-expert + assumptions-expert verdicts incl. delta re-checks (todo 0.2) |
| A2 | Production guards fail fast (test keys in production; auth-disable outside development; authorized-parties boundary) | unit | WS1 cycle 1.1 suites |
| A3 | Wrong-issuer / wrong-resource / expired / session-token / query-param tokens rejected on the opaque path | e2e | cycle 1.2 negative suite green |
| A4 | Aliases cannot mint a second resource identifier; PRM advertises the canonical self-origin AS with proxy metadata rewritten and upstream = the production Clerk Frontend API (ADR-115 shape) | e2e + live | cycle 1.3 suite; Card 3 agent-run curls recorded on MCP-67 |
| A5 | Full OAuth flow completes from a real MCP host against production | value-proxy (live) | Card 3 owner-executed flow, evidence on MCP-67 |
| A6 | Denial, revocation (immediate, per opaque), and reconnect behave per §12.4–12.5 | live | Card 3 negative-path evidence on MCP-67 |
| A7 | Rollback rehearsed | live | 4.1: one reverted deployment against the stable domain, evidenced |

## Prerequisites

- **Blocking**: Card 1 for todo 2.1 onward (cycles 1.1–1.3 need only
  todo 0.2, as the todo graph states); Card 2 for Card 3 onward;
  Card 3's owner participation for A5–A6 evidence. Legitimate: every
  blocked step is a workspace-admin act or a human browser ceremony
  that agents cannot perform.
- **Beneficial**: S1's delivery-plan template; minimum shippable shape
  without it is this plan authored against the V0 schema's canonical
  fields — which it now is.

## Risks

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| DNS/certificate propagation delays the ceremony | Medium | Medium | Card 2 step 2 starts early; ceremony ordered so DNS waits overlap other steps |
| Google publishing/brand verification queue | Medium | High (launch gate) | Card 2 step 3 fires in the same sitting as step 1; verification runs while code cycles land |
| ADR-053 amendment (D0) stalls in ratification | Low | Medium | Amendment PR opens with WS1; it is a narrow supersession scoped to the MCP application, not a rewrite |
| DCR abuse post-launch | Low | Medium | D2 mitigations with named operators; incident lever = disable DCR (owner-role) |
| Host incompatibility discovered late | Medium | Medium | 3.2 matrix before cutover (4.1 depends on it); per-host registration mechanism tested, not assumed |
| Deployment Protection intercepts discovery | Low | Medium | §5A.13 in Card 3's checklist: metadata GET + MCP POST verified reachable pre-cutover |
| Staging declined at Card 1 (D6 fallback) | Owner's call | Medium | Named fallback: limited-cohort validation on production before connector publication |

## First-principles check (plan-body rule)

- **Shape**: WS1 tests prove Oak-authored behaviour (env validation,
  origin discipline, rejection paths through the app's own auth
  boundary and ADR-115 proxy wiring); the Clerk helper is not
  re-tested, but its integration (resource binding enforced end-to-end
  on the opaque path) is — §4.6's named release gate.
- **Landing-path**: cycles extend existing suites in
  `apps/oak-curriculum-mcp-streamable-http` under existing runner
  include patterns; the ADR-053 amendment follows the doctrine-PR
  path.
- **Vendor-literal + locus**: vendor claims carry the report's
  2026-07-21 review date; the clerk-expert round re-verified the
  ceremony against live Clerk docs and caught the one moved default
  (token format) — now pinned by explicit act (D3). Loci named: Clerk
  config in the Clerk dashboard (owner role), keys in Vercel env
  (owner role), guards and metadata shape in the app workspace
  (agents), the report vocabulary replaced with the app's actual
  boundary where they differed (D5).
- **Optionality-surface**: every owner fork (D0, D1, D6, D9) is a
  recommendation resolved at a dated card with consequences named;
  contingencies carry pre-made cures. Outcomes name observable
  signals (A2–A7).
- **Rules-tier**: screened — never-disable-checks (the dev valve is a
  recorded decision D10 with a tightened guard and a named
  blast-radius check, not a silent exception),
  no-machine-local-paths, strict-validation-at-boundary (cycle 1.1
  extends the validated-env boundary), owner-cards-are-visible-UI
  (Card 1 shows the full ledger incl. risk acceptances), worktree +
  branch discipline in effect.

## Foundation alignment

- [`principles.md`](../../directives/principles.md) — D5's no-change
  decision, D10's rejected extra machinery, and 1.2's audit-before-add
  are could-it-be-simpler applications.
- [`testing-strategy.md`](../../directives/testing-strategy.md) — WS1
  cycles are atomic test+product pairs; 1.2 audits existing coverage
  first so no audit-shaped duplicate tests land.
- [`schema-first-execution.md`](../../directives/schema-first-execution.md)
  — guards land in the existing Zod-validated env boundary.

## Non-goals

- Machine/unattended-agent authentication — Clerk has no
  client-credentials grant (§14.6); a separately designed arc.
- Clerk Organizations / multi-tenancy — not in the v1 release (D4).
- MCP App iframe UI work — transport-level auth only; the Apps
  surface is other lanes' scope.
- Custom consent pages, custom scopes (§14.1), CIMD advertisement
  (§14.2).
- Google API data access (Drive/Calendar/etc.) — §10's separate
  authorization relationship; no Oak tool needs it.
- A reject-live-keys-in-preview guard (deliberately, per D6 — the
  staging shape makes it wrong; separation is env-scoping discipline
  with a Card 3 verification).

## Reviewer rounds and lifecycle

- Reviewers (todo 0.2): `clerk-expert` (vendor-shape; first round
  returned F1–F7, cured in this revision), `assumptions-expert`
  (readiness; first round returned C1–C3/I4–I6, cured in this
  revision); delta re-checks on the cured sections precede
  DECISION-COMPLETE. `security-expert` reviews WS1's PR at code time.
- Learning loop: completion mines durable outcomes into
  `docs/engineering/` (deployment runbook) and archives per the
  corpus rules; consolidation runs at plan completion.
- Lifecycle touch points per
  [`lifecycle-triggers.md`](../../plans/templates/components/lifecycle-triggers.md):
  claim registered at lane open, handoff record at seat end if
  mid-arc, evidence recorded on MCP-67 as each gate passes.
