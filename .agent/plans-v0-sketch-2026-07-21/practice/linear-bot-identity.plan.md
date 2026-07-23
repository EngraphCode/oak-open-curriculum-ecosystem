---
id: linear-bot-identity
node_type: plan
name: "Linear Bot Identity — actor=app attribution for agent activity (MCP-64)"
overview: >-
  Decision-complete plan giving agents a distinct Linear identity (an
  OAuth2 application installed as an agent, actor=app) so agent activity
  in Linear is attributed to the bot, not the owner — the Linear
  counterpart of the jimbot-oakington-iii GitHub App.
kind: executable
serves_strategic_choice: FRAME-1
last_updated: 2026-07-21
lineage:
  serves_thread: agentic-engineering-enhancements
  serves_stream: agent-tooling
  derives_from:
    - .agent/plans-backlog-2026-07/agent-tooling/future/github-surface-agent-identity.md
    - PDR-027 (threads, sessions, and agent identity — the which-agent content layer)
    - docs/engineering/merge-bot.md (the GitHub arc's worked record and packaging template)
related:
  - MCP-64 (Linear ticket; execution status projects there per V0 §2.2)
todos:
  - id: 0-1-decision-ledger
    content: "0.1 Author the decision ledger (D1–D10), owner runbook, and verification items (this PR)."
    status: completed
    depends_on: []
  - id: 0-2-readiness-review
    content: "0.2 assumptions-expert readiness round; apply verdicts; mark DECISION-COMPLETE."
    status: completed
    depends_on: [0-1-decision-ledger]
  - id: 0-3-owner-ratification
    content: "0.3 Owner ratifies the plan and executes the create-and-install runbook (owner card)."
    status: pending
    depends_on: [0-2-readiness-review]
  - id: 1-1-repo-config-cycle
    content: "1.1 Cycle: .linear/bot.json schema + loader + config-derived secret path (test + product, atomic)."
    status: pending
    depends_on: [0-3-owner-ratification]
  - id: 1-2-mint-core-cycle
    content: "1.2 Cycle: client_credentials token mint core with injectable fetch (test + product, atomic)."
    status: pending
    depends_on: [1-1-repo-config-cycle]
  - id: 1-3-cli-cycle
    content: "1.3 Cycle: agent-tools linear-bot mint-token CLI command, stdout-only contract (test + product, atomic)."
    status: pending
    depends_on: [1-2-mint-core-cycle]
  - id: 1-4-live-verification
    content: "1.4 Run VI-1..VI-3 live checks against the installed app; record results in the ticket."
    status: pending
    depends_on: [1-3-cli-cycle]
  - id: 2-1-write-idiom-docs
    content: "2.1 Document the bot-write idiom (mint + GraphQL) in docs/engineering/linear-bot.md."
    status: pending
    depends_on: [1-4-live-verification]
  - id: 2-2-marker-demotion
    content: "2.2 Amend identify-as-agent-under-shared-credentials: demote the owner-auth workaround signature on bot-authored Linear writes."
    status: pending
    depends_on: [2-1-write-idiom-docs]
---

# Linear Bot Identity (MCP-64)

**Status**: DECISION-COMPLETE (assumptions-expert READY, 2026-07-21;
one NOT-READY round cured in place). Owner **ratified** the plan
2026-07-21 via the session card; execution starts when the owner
executes the create-and-install runbook (todo 0.3, second half).
**Ticket**: [MCP-64](https://linear.app/oaknational/issue/MCP-64)
**Template arc**: the `jimbot-oakington-iii` GitHub App
([`docs/engineering/merge-bot.md`](../../../docs/engineering/merge-bot.md),
[`github-surface-agent-identity.md`](../../plans-backlog-2026-07/agent-tooling/future/github-surface-agent-identity.md))

## Problem

**Gap**: agents act on Linear through the owner's credentials (the Linear
MCP integration authenticates as Jim), so Linear stamps every
agent-authored comment, issue, and mutation with the owner's name and
avatar. **Who it harms**: the owner (his activity record is polluted with
actions he did not take), reviewers and teammates (they cannot tell human
word from agent output at a glance), and the audit trail (attribution is
wrong at the platform layer). **Mechanism**: attribution is decided at the
identity layer — the credential the platform authenticates — so the
current content-layer workaround (every agent-authored comment ends
"— recorded under the owner's Linear auth") patches the wrong layer, and
depends on per-comment discipline with no write-time enforcement. This is
the same analysis that produced the GitHub App
([`github-surface-agent-identity.md`](../../plans-backlog-2026-07/agent-tooling/future/github-surface-agent-identity.md)
§Problem); its closing open question — "the same mechanism applies to any
non-GitHub outward surface" — is this plan. **Constraints**: no `admin`
scope ever; secrets never in the repo; works for any user on any machine
(config-derived paths, no machine-local literals); the owner is the only
workspace admin who can create and install the app. **Success**: an
agent-authored Linear mutation shows the bot as its author, and the
workaround signature is deleted from bot-authored writes.

## End Goal, Mechanism, Means

- **End goal**: platform-layer attribution — Linear's own record
  distinguishes agent activity from the owner's, automatically and
  unspoofably.
- **Mechanism**: a Linear OAuth2 application installed as an agent
  (`actor=app`) is a first-class workspace member with its own name and
  avatar; every write made with an app-actor token is attributed to it.
  Verified against Linear's OAuth 2.0 and Agents developer pages
  (read 2026-07-21; see §Verification items).
- **Means**: owner creates and installs the app (one-time runbook,
  §Owner runbook); `agent-tools` gains a `linear-bot mint-token` topic
  mirroring the merge-bot packaging; agent writes route through the
  minted app-actor token; the content marker is demoted to carry only
  the PDR-027 which-agent detail.

## Decision ledger

Every decision is closed with a recommendation. "Owner may override at
ratification" applies to all of them; none is left open.

### D1 — Identity mechanism: OAuth2 app installed as agent (actor=app)

**Recommendation**: a Linear OAuth2 application, installed into the Oak
workspace with `actor=app`.
**Rationale**: it is Linear's first-class construct for exactly this —
workspace-member appearance (own name/avatar, mention and filter menus),
non-billable, all activity attributed to the app; it is the direct
analogue of the GitHub App route the estate already ratified (Route B in
the derivation note; Route A's machine-user analogue would be a second
billable human-shaped seat on Linear, with no bot badge).
**Rejected**: second user account (billable seat, human-shaped
attribution, no agent affordances); keeping the content-layer marker as
primary (wrong layer — the founding analysis of the GitHub arc).

### D2 — App name and avatar: the jimbot persona

**Recommendation**: name the app **Jimbot Oakington** with the same
avatar as the GitHub App, so one recognisable bot persona spans both
platforms.
**Rationale**: cross-platform recognisability; the name appears in
mention/filter menus and comment headers. Cosmetic, not load-bearing:
the exact string is the owner's at create time; the committed config
(D6) carries whatever was chosen, so nothing downstream hard-codes it.

### D3 — Where the app lives: the Oak workspace itself

**Recommendation**: create the application inside the Oak Linear
workspace, not a separate management workspace.
**Rationale**: a separate management workspace pays off when an app is
distributed to third-party workspaces and its lifecycle must survive
workspace membership churn; this app is private and internal to one
workspace, so a management workspace adds an owner-side surface with no
benefit.
**Rejected**: dedicated OAuth-management workspace (distribution-shaped
overhead we do not have).

### D4 — Scopes: read, write — never admin; agent scopes deferred to a named trigger

**Recommendation**: `read`, `write` for v1. The agent scopes
(`app:assignable`, `app:mentionable`) are **not** requested at install:
they have no consumer today — the agent-session machinery that would
make an assignment or mention mean anything is an explicit non-goal —
and granting them would create a dead interaction surface (a bot
teammates can @mention and assign that never responds). They are a
named re-authorisation pointer, not an open question: **when a consumer
exists** (a Linear-initiated-delegation arc, or a mention-driven
workflow with an owning plan), the same app re-authorises with the
expanded scope set in one admin approval — no re-install, no new
credential.
**Rationale**: `write` is required because the estate's daily mutations
(issue state changes, description edits, project moves) exceed the
narrow `issues:create` + `comments:create` pair. `admin` is rejected
permanently — destructive workspace capability stays owner-only,
mirroring the merge-bot's least-privilege ruling ("grant nothing
else"). Scopes-at-need beats scopes-in-advance here for the same
reason the merge-bot grants exactly two permissions.
**Rejected**: `issues:create` + `comments:create` only (cannot update
issues — the estate's most common mutation); `admin` (capability class
the bot must never hold); agent scopes at install (unevidenced
consumer + dead interaction surface, above — this trims the initial
routing sketch's scope list, flagged to the lead AI on the
coordination channel).

### D5 — Credential mechanism: client_credentials grant, mint-on-demand

**Recommendation**: enable the `client_credentials` grant on the app and
mint app-actor tokens on demand (30-day TTL per Linear; up to 1000
active tokens on shared scopes).
**Rationale**: mirrors the merge-bot's stateless mint-per-session shape
— no browser redirect ceremony, no durable refresh-token state to
protect, one machine-local secret (the client secret) from which
short-usage tokens are minted; revocation is client-secret rotation,
which invalidates every outstanding token at once (the same single-lever
revocation as rotating the GitHub App private key).
**Rejected**: authorization-code flow with refresh tokens (requires a
redirect ceremony and persistent refresh-token storage — more mutable
secret state, no attribution gain); long-lived personal API key (wrong
actor entirely).
**Pre-made fallback**: if VI-2 (§Verification items) shows
client-credentials tokens cannot reach a team the estate needs (the
docs scope them to "all public teams"), the fallback is the
authorization-code flow with `actor=app` — same app, same attribution,
more token-state ceremony. This fallback is a named contingency, not an
open decision.

### D6 — Config and secret storage: committed config, machine-local secret

**Recommendation**: a committed non-secret config at **`.linear/bot.json`**
(strict schema: `{ "appName": string, "clientId": string,
"workspace": string }`) as the single identity authority, and the client
secret machine-local at the config-derived path
`~/.config/<appName-slug>-linear/client-secret`, `chmod 600`. No env
vars, no secrets in the repo, tokens never persisted.
**Rationale**: exact mirror of the merge-bot convention
(`.github/merge-bot.json` + `~/.config/<appSlug>/private-key.pem`),
which the security review has already accepted: identity is declared
once in-repo, the only secret is one file outside every repo, and paths
derive from config so the design works for any user on any machine.
**Rejected**: env-var secret (leaks into logs and shell history; the
merge-bot deliberately avoided it); repo-adjacent secret file (violates
the no-secrets-in-repo constraint); storing minted tokens (stateless
mint is cheaper than cache invalidation).

### D7 — CLI packaging: an agent-tools `linear-bot` topic

**Recommendation**: a new `agent-tools linear-bot mint-token` topic
mirroring the merge-bot module split — thin `cli.ts` (flags,
orchestration, USAGE), `repo-config.ts` (load/validate `.linear/bot.json`,
derive the secret path), `mint-token.ts` (the credential-path core:
HTTP Basic auth with clientId + secret, `POST
https://api.linear.app/oauth/token` with
`grant_type=client_credentials`, injectable `fetch`/time seams) — with
the same output contract: **stdout carries only the token** (or JSON
with `--json`); expiry goes to stderr. Zero dependencies in the
credential path.
**Rationale**: the packaging pattern is proven, tested, and already
review-hardened in `agent-tools/src/merge-bot/`; copying its seams keeps
the new credential path inside the same size/complexity gates and makes
the two bots one recognisable idiom.
**Usage idiom**:

```bash
LINEAR_BOT_TOKEN="$(pnpm --silent agent-tools linear-bot mint-token)"
```

### D8 — Write routing: mint + GraphQL idiom in v1; reads stay as they are

**Recommendation**: v1 ships the mint-token command plus a documented
write idiom — agent-initiated Linear **mutations** run as GraphQL calls
with `Authorization: Bearer $LINEAR_BOT_TOKEN`; **reads stay on the
existing Linear MCP integration** (owner auth), mirroring the merge-bot
ruling that writes bind to the bot identity while reads may use any
credential.
**Rationale**: the smallest shape that delivers the attribution outcome
(could-it-be-simpler test). Wrapper subcommands (`linear-bot comment`,
`linear-bot issue-update`) and a bot-credentialed MCP server
configuration are named follow-on pointers, to be cut only if the raw
idiom shows real friction in use — they are pickup-time decisions per
the future-work-items-are-pointers discipline, not part of this plan's
committed scope.
**Rejected for v1**: bot-credentialed MCP config as the primary route
(heavier integration before the idiom's friction is measured); wrapping
every mutation in bespoke subcommands (YAGNI until friction is
observed).

### D9 — Content-marker demotion: delete the workaround, keep which-agent

**Recommendation**: bot-authored Linear writes drop the "— recorded
under the owner's Linear auth" workaround line and keep the PDR-027
agent-tuple signature ("— <Agent name> (<prefix>)"), because the single
bot identity says *an agent did this* but cannot say *which* agent.
**Cutover gate (named)**: cutover completes when WS2.2 merges. From
that commit forward, **every agent-initiated Linear mutation uses the
bot token** — there is no residual agent-write surface on owner auth;
the amended rule says exactly that. Owner auth remains only for reads
(D8) and for the owner's own human writes, neither of which ever
carried the workaround obligation. Between the app install (todo 0.3)
and WS2.2 merging, agent writes may use either credential and the
workaround line stays mandatory on any owner-auth write — a bounded
window that closes at a named commit, not "when we get to it".
**Enforcement disposition (stated, not silent)**: v1 accepts
discipline-backed routing — the same enforcement level as every other
credential-selection rule in the estate — with a write-time hook
(lint agent Linear-mutation invocations for the bot-token idiom,
reusing the hook-policy substrate) recorded as a named follow-on
pointer in WS2.2's rule amendment, mirroring how the GitHub arc named
its enforcement hook. The pointer is cut as a ticket at WS2.2 time if
the owner wants enforcement earlier than friction demands it.
**Rationale**: the two-layer doctrine from the GitHub arc — identity
layer carries "non-human", content layer carries "which agent + model" —
applies unchanged. The rule
[`identify-as-agent-under-shared-credentials`](../../rules/identify-as-agent-under-shared-credentials.md)
is amended (WS2), not deleted.

### D10 — Rollout order and platform-behaviour checks

**Recommendation**: attribution surfaces first — comments and issue
mutations — with no change to who *triages* or *approves* anything.
Before declaring cutover, verify Linear-side automations that key on
author identity (triage rules, SLA starts, notification routing) behave
correctly for app-authored events (VI-3). This is the Linear analogue of
the GitHub arc's CODEOWNERS gotcha: an identity change can silently
change gate behaviour, so the check is named now rather than discovered
in production.
**Failure modes and cures**: token expired or revoked mid-work →
re-mint on 401 (the idiom is stateless); client-secret rotation →
intended revocation lever, all tokens die together, next mint uses the
new secret; secret file missing on a fresh machine → the CLI fails loud
with the config-derived path in the error (merge-bot behaviour,
mirrored).

## Owner runbook (create-and-install — the owner card)

Sequenced; ~10 minutes total. Steps 1–4 are workspace-admin actions
agents cannot perform.

1. **Create the application**: Linear Settings → API → OAuth
   applications → new. Name and avatar per D2 (recommendation: "Jimbot
   Oakington" + the GitHub bot's avatar). Callback URL is a required
   form field but unused by the client-credentials path — enter a
   placeholder such as `https://oaknational.github.io/unused-callback`
   (VI-1 confirms the form accepts this).
2. **Enable client credentials** on the app; note the **client ID**
   (non-secret, goes in `.linear/bot.json`); reveal the **client
   secret** once and store it at
   `~/.config/<appName-slug>-linear/client-secret` with `chmod 600`.
   Never paste it into chat, the repo, or a ticket.
3. **Install as agent**: open the authorization URL with `actor=app`
   and the D4 scopes
   (`https://linear.app/oauth/authorize?client_id=<id>&response_type=code&scope=read,write&actor=app&redirect_uri=<callback>`),
   approve as workspace admin. The app should appear as a workspace
   member. **Contingency (if it does not)**: Linear may require the
   authorization-code exchange to complete the installation — copy the
   `code` query parameter from the placeholder redirect URL and hand it
   back with the step-4 confirmation; an agent runs the one-time
   exchange against `/oauth/token` and the install completes
   (authorization codes are short-lived — exchange promptly, and if it
   has expired simply re-open the authorize URL and repeat). Same
   style as the D5 fallback: a pre-made cure, not a dead end
   mid-runbook.
4. **Confirm hand-back**: comment on MCP-64 (or tell any agent) that
   the app exists and the secret is placed; include the chosen app name
   and client ID so `.linear/bot.json` can be authored in WS1.
5. Agents then run VI-1..VI-3 (§Verification items) and start WS1.

## Workstreams (implementation — gated on todo 0.3)

All workstreams are PR-shaped at authoring time per PDR-132: each names
its changeset class and is stateable as a ≤2-round PR.

### WS0 — This plan (changeset class: plan/record)

One PR: this file plus ticket linkage. No code. Round budget 2.

### WS1 — `agent-tools linear-bot` topic (changeset class: code)

Three TDD cycles, one PR. PDR-132 re-examination run at authoring: a
single story (one credential path), well under the 300-added-line
warning on the merge-bot precedent's module sizes, but **at** the
8-file warning count (3 product + 3 test files + topic registration) —
re-examined for a hidden second story and none found; the file count is
the module split the merge-bot review hardened, not scope creep:

- **1.1** `.linear/bot.json` schema + loader + config-derived secret
  path. Test first: schema rejection cases, path derivation; product:
  `repo-config.ts`.
- **1.2** mint core: Basic-auth `POST /oauth/token`
  (`grant_type=client_credentials`) with injectable fetch; token/expiry
  parse; loud failure surfaces. Test first with a fake fetch; product:
  `mint-token.ts`.
- **1.3** CLI command: flag parsing (`--json`, explicit overrides),
  stdout-only token contract, stderr expiry. Test first; product:
  `cli.ts` + topic registration.
- **1.4** live verification (non-code): run VI-1..VI-3 against the
  installed app; record evidence in MCP-64.

### WS2 — Docs and marker demotion (changeset class: docs/doctrine)

One PR, two cycles:

- **2.1** `docs/engineering/linear-bot.md` — the counterpart of
  `merge-bot.md`: who needs it, how it works, the write idiom, key
  handling, owner setup record.
- **2.2** amend
  [`identify-as-agent-under-shared-credentials`](../../rules/identify-as-agent-under-shared-credentials.md)
  per D9. Doctrine-class change: the PR is owner-ratified before merge
  per the standing merge rulings.

## Acceptance criteria and proof contract

| Id | Criterion | Proof level | Proof |
| --- | --- | --- | --- |
| A1 | Decision ledger closed: every D1–D10 carries a recommendation; no bare option lists | non-code | assumptions-expert readiness verdict (todo 0.2) |
| A2 | Owner runbook is executable by a workspace admin without agent help | non-code | owner executes it (todo 0.3); confirmation on MCP-64 |
| A3 | `linear-bot mint-token` exits 0 and stdout is exactly a token | unit + live | WS1 unit suites; VI-1 live run |
| A4 | A GraphQL mutation with the minted token is authored by the bot in Linear's UI | value-proxy (live) | VI-2: create a test comment on MCP-64; screenshot/author-field evidence recorded on the ticket |
| A5 | Bot-authored writes carry the PDR-027 tuple and NOT the owner-auth workaround line | non-code | WS2.2 rule text + first live bot comment |
| A6 | No secret material in the repo or in any log | non-code | review pass over WS1 diff + CLI stderr/stdout contract tests |

Completion language (`DECISION-COMPLETE`, workstream-complete) is used
only when the named proofs for the parent scope exist. The plan itself
reaches DECISION-COMPLETE at A1; the capability reaches complete at
A3–A6.

## Prerequisites

- **Blocking (for WS1+)**: owner ratification of this plan and execution
  of the runbook (todo 0.3). Nothing downstream starts without it.
- **Beneficial**: none identified. The minimum shippable shape without
  any beneficial extra is exactly WS1 + WS2.

## Verification items (vendor facts)

Facts below were read directly from Linear's developer docs
(`linear.app/developers/oauth-2-0-authentication.md` and `agents.md`)
on 2026-07-21 by this seat — not inherited from plan prose. Items
marked VI are re-verified live at execution time (vendor surfaces
drift between plan-write and plan-execute):

- Verified today: `actor=app` install shape and admin approval; agent
  scopes `app:assignable` / `app:mentionable`; client_credentials
  grant (opt-in, 30-day app-actor tokens, 1000-token allowance,
  secret-rotation invalidation); token endpoints
  (`/oauth/token`, `/oauth/revoke`); refresh-token migration of
  2026-04-01 (~24h access tokens).
- **VI-1**: app-creation form accepts a placeholder callback URL with
  client_credentials enabled (runbook step 1 assumption), **and
  admin approval alone completes the agent installation** — the app
  appears as a workspace member without the code exchange. If not, the
  runbook step-3 contingency (one-time code exchange) is the cure;
  VI-1 records which path completed the install.
- **VI-2**: a client-credentials token can read and mutate issues in
  the MCP App Pathfinder team (docs say "all public teams"; if the
  team is private to the bot, fire the D5 fallback).
- **VI-3**: Linear automations keyed on author identity behave
  correctly for app-authored events (D10). **Procedure and executor**:
  at runbook hand-back the owner (admin visibility) enumerates the
  workspace's live automations — triage rules, SLA policies,
  notification routing; an agent then produces one app-authored test
  event per enumerated class and the owner confirms each behaves as
  expected. Falsifiable per class; owner-assisted because automation
  enumeration needs admin visibility agents lack.

## Risks

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Client-credentials tokens cannot reach a needed team (VI-2 fails) | Low | Medium | D5 pre-made fallback: authorization-code flow with actor=app; same app, no re-install |
| Secret mishandled at create time (pasted into chat/ticket) | Low | High | Runbook step 2 names the never-paste rule; rotation is the cure if it happens |
| Attribution split-brain during rollout (some writes bot, some owner) | Medium | Low | D9: bounded window closes at the WS2.2 merge; workaround line mandatory on owner-auth writes inside the window; D10 orders the rollout |
| Vendor surface drift between plan and execution | Medium | Low | VI items re-verified live at WS1.4; vendor literals in this plan carry their read-date |
| Automation side-effects from author-identity change (VI-3) | Low | Medium | VI-3 named before cutover; rollback is simply reverting writes to owner auth |

## First-principles check (plan-body rule)

- **Shape**: the tests in WS1 prove Oak-authored behaviour (config
  loading, token-path derivation, CLI output contract) with the vendor
  HTTP boundary faked — not "the vendor did its job". The live VI
  checks are explicitly non-code evidence, not tests.
- **Landing-path**: new files land in `agent-tools/src/linear-bot/`
  matching the merge-bot's tested include patterns; no
  hook/CI-inclusion mismatch is introduced.
- **Vendor-literal + capability-locus**: every vendor literal above
  carries its 2026-07-21 read-date and re-verifies at VI time. Locus:
  the Linear MCP integration is plugin-provided (session-level), the
  merge-bot pattern is repo-local in `agent-tools` — the plan names
  both loci and puts the new capability repo-local.
- **Optionality-surface**: no open choices. The two genuine
  contingencies (VI-1 install-completion, VI-2 team access) each carry
  a pre-made cure, not a deferred decision; the D9 transitional window
  closes at a named commit (WS2.2 merge), and the D4 agent-scope
  deferral has a named re-authorisation trigger. Outcome names a
  single observable signal (A4's author field).
- **Rules-tier**: screened against RULES_INDEX — notably
  no-machine-local-paths (all paths config-derived, the permitted
  templated per-user shape), replace-dont-bridge (dual write paths are
  a bounded window that closes at the WS2.2 merge — the named cutover
  is in D9, with the enforcement disposition stated),
  stage-by-explicit-pathspec and never-commit-to-main (worktree +
  branch discipline in effect).

## Foundation alignment

- [`principles.md`](../../directives/principles.md) — First Question
  applied at D8 (idiom before wrappers, could-it-be-simpler).
- [`testing-strategy.md`](../../directives/testing-strategy.md) —
  WS1 cycles are test+product atomic pairs; no test lands ahead of its
  product code or vice versa.
- [`schema-first-execution.md`](../../directives/schema-first-execution.md)
  — `.linear/bot.json` is schema-validated at the boundary (strict,
  mirroring `MERGE_BOT_CONFIG_SCHEMA`).

## Non-goals

- Linear-initiated delegation (AgentSessionEvent webhooks, the
  10-second `thought` acknowledgement machinery) — attribution only in
  this arc; the agent-session machinery is a future arc if Linear-side
  delegation is ever wanted.
- Per-agent Linear identities — one bot identity + the PDR-027 content
  marker carries which-agent, per the GitHub arc's settled division.
- Integration-directory submission or any distribution surface.
- Replacing the read path — the Linear MCP integration keeps serving
  reads under existing auth.
- Sibling platforms (Slack, Notion) — the same pattern likely applies,
  but each is its own future plan; nothing here commits them.

## Readiness reviewers

- `assumptions-expert` — plan readiness, proportionality, blocking
  legitimacy (todo 0.2, before DECISION-COMPLETE).
- `security-expert` — credential-path review at WS1 PR time (the
  merge-bot precedent: security review of the mint path).
- `docs-adr-expert` — WS2 documentation round.

## Learning loop and lifecycle

- Plan completion or archival runs `/oak-consolidate-docs`; durable
  outcomes graduate to `docs/engineering/linear-bot.md` (WS2.1) and, if
  an architectural decision emerges (e.g. the cross-platform bot-identity
  pattern), an ADR.
- Lifecycle touch points per
  [`lifecycle-triggers.md`](../../plans/templates/components/lifecycle-triggers.md):
  session entry via start-right, claim registered
  (f21a7359-0f2c-4030-a1ab-8c485b504a4d), handoff closure at seat end,
  consolidation at completion.
