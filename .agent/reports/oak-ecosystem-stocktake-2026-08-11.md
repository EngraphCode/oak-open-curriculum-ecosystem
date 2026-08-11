# MCP App: project stocktake, 23 July → 11 August 2026

**DRAFT for owner review — not published anywhere.** Candidate text for
the next Linear project update (the last was 23 July).

---

## The headline

On 23 July we had a working private alpha with a manual install.
Nineteen days later: **the connector was submitted to Anthropic on
Friday 7 August** — by hand, as ruled; no agent may submit — the app
states **public beta** on its own landing page with sign-in open to any
account, the **Claude Code plugin went live on 10 August** as a genuine
one-click install route, and every piece of content an AI assistant
might read from us is **audited, registered, and governed**. The staged
path the last update promised — private beta September, public beta
October — has been beaten by weeks.

The submission is in and Anthropic's review clock is running. What's
left is almost entirely human: the five guidance documents from our Oak
experts, the plugin components we'll restore at launch, and beta users
to learn from.

## What happened, why it matters, and for whom

### 1. The app crossed from alpha to submission-ready

Four things shipped. The public landing page went live, carrying Oak
brand assets, linked terms and privacy, an experimental-service
disclaimer, public-beta copy and sign-in. The submission package went
out with every claim checked — an unsupported rate-limit figure was
found and withdrawn rather than shipped. The connector plugin was cut
to the ratified seven components, with honest naming ("national
curriculum statements", not jargon). And we hardened sign-in in
sequence, so a production deployment can no longer accept a development
key or run with authentication switched off.

Why it matters: this is the difference between "colleagues can try it"
and "we can put Oak's name on it in a vendor directory". **For
developers and the ecosystem**, install drops from developer-grade
setup to a click, today. **For teachers**, the same one-click route is
submitted and waiting on Anthropic's review — and the claims on the tin
are true when read, because the ones that weren't were caught by review
before any outside reader saw them.

### 2. "How we will know" is now instrumented, not promised

The last update promised privacy-safe usage statistics. Since then the
whole measurement chain shipped: a closed analytics adapter (only
declared events can ever be sent), scoped pseudonyms (no user
identifiers leave the app), a transport observer on the MCP surface,
and a five-year retention decision recorded with the privacy reasoning.
Analytics cannot run without error monitoring alongside — the
configuration refuses.

Why it matters: the hypothesis — *teachers are already using AI
assistants; putting Oak in that context improves outcome quality and
reduces work* — is now falsifiable with data instead of anecdote.
**For the impact team**, engagement evidence builds from day one of
beta — and the first fortnight of telemetry is already teaching us
(see Health and evidence): the instrument works, the audience hasn't
arrived yet, and the most actionable number is a
discovery-to-activation gap we couldn't previously see.

### 3. Safeguarding and content governance moved from intention to machinery

Every static string an assistant might read from us — tool
descriptions, server instructions, guidance text, 728 governed items —
now lives in one register with drift detection: change a served word
and a validator fails until the register and its sign-off state catch
up. Restricted lessons (RSHE and similar) are excluded at the data
boundary itself, not filtered at the edge. Tool descriptions were swept
for anything that could steer an assistant beyond presenting Oak's
content.

Why it matters: **for pupils and teachers**, the safety property is
structural, not editorial; **for the compliance reviewers**, the
reviewable-content workspace the last update promised exists and stays
current by machine, so their review runs beside the build rather than
after it.

### 4. Reliability work nobody sees until it saves you

Four things landed here. Every preview deployment now gets a
post-deploy liveness check, and production has a redeploy guard. The
dependency estate is clear of high-severity advisories. Configuration
isolation means no workspace can silently depend on another's setup —
strict, everywhere, all the time. And a mutation-testing canary proved
our test suites detect injected faults, then caught itself running
against the wrong configuration and fixed that too.

Why it matters: **for the people on call**, this is the "without
compromising quality or stability" half of rapid innovation, built as
structure rather than vigilance. The estate-wide mutation-testing
rollout follows in stages, priced with the canary's cost data.

### 5. The design system became provable, not aspirational

The design-studio estate was reconciled file-by-file into the
repository as the single source of truth; a plain-CSS showcase
demonstrates every component in all four brand identities and five
themes; and an identity-switchboard demonstration — one page
re-skinning live across brands, the structural proof that our markup is
brand-invariant — is in build, its first slices landing on 11 August.

Why it matters: **for teachers and partners**, outputs that carry Oak's
name will look like Oak, provably; **for the teams shipping the next
releases**, white-label capability is being proven now, cheaply, on a
demo surface rather than discovered expensively in production.

### 6. The engine that built all of this got faster and safer

The Practice — the agentic-engineering framework this repository runs
on — spent the window hardening itself. Every action a bot takes on
GitHub is now identified and gate-checked, and nothing merges until it
is genuinely settled. Every quality check is registered as a governed
lever rather than a script someone can quietly switch off. Four AI
platforms (Claude, Codex, Copilot CLI, Cursor) work the repository as
first-class citizens on a shared comms stream.

Why it matters: **for everyone deciding what to fund next**, the
numbers below happened *with* every quality gate blocking and dual
review on every change — the cost-of-innovation story the last update
claimed is now evidenced by nineteen days of throughput.

## The numbers (nineteen days, entirely straight-faced)

- **310 pull requests merged** — roughly one every 90 minutes, around
  the clock, including weekends. The robots do not observe bank
  holidays.
- **2,109 commits**; **658,841 lines added, 364,508 removed** — a
  million-line window, net +294k, on a codebase that *shrank* in
  several places we're proudest of.
- **253 production releases** (v1.82 → v1.158) — continuous delivery
  measured in releases per day (~13).
- **1,765 deployments over the twenty-day Vercel window** (258 to
  production — one production deploy every ~110 minutes), production
  builds in **94 seconds**, and **zero failed production builds**: all
  ten build failures happened on previews and never reached main.
- **98 Linear tickets completed** in the release project — including
  the entire analytics build, the canonical-domain
  decision-and-execution, and the submission itself.
- Sentry issues opened in its 30-day window: **six**, five of them
  single bursts, exactly one still live.
- **34 workspaces** in the monorepo, every one behind the same blocking
  gates. **Zero** high-severity dependency advisories standing.
- Surfaces live as of 11 August: the MCP server on production (fronted
  at www.thenational.academy/mcp), its public landing page, the Claude
  Code plugin, the design-system showcase, and a curriculum hub demo.
- Every release gate, ratification, and submission decision stays a
  human decision; the four standing decisions taken in the window are
  recorded and traceable.

## Health and evidence

Three different denominators run through what follows, and they measure
different things: 57 clients completed an MCP handshake, 31 of those
called a tool, and 10 distinct signed-in accounts have connected since
production sign-in went live around 7 August.

**Usage (PostHog, instrumented from 29 July).** 12,727 MCP events in
the window — but we won't inflate that: a single automated sweep
accounted for 87.5% of tool calls (one actor, seven tools, peaking at
~41 calls a minute). The honest picture: **~1,300 genuine tool calls
from ~30 distinct clients** in two weeks, much of it plausibly our own
testing. Three findings that matter:

- **The distinctive surface gets used.** Beyond flat retrieval, real
  sessions exercise search, topic exploration, and the prior-knowledge,
  misconception and progression graphs — 40 distinct tools called at
  least once. Small n, right shape.
- **A measurable discovery-to-activation gap**: 57 clients completed
  the handshake; 31 ever called a tool. On the day the plugin went
  live, seven accounts connected and none invoked. Before this window
  that gap was invisible; now it's a number we can move — the first
  thing beta onboarding should aim at.
- **Signed-in people are still few**: ten distinct accounts since
  production sign-in went live. The most encouraging single data point
  arrived on the morning of 11 August: a first-time account running an
  eleven-minute, human-paced session that followed the documented entry
  path exactly — model, subjects, units, nineteen searches, fifteen
  topic explorations. We can't yet prove it wasn't one of our own — see
  the caveat below — but the shape is right, and we want a hundred of
  them.

The service is quick and quiet: 0.64% tool-call error rate, median
response 304ms, p95 under half a second.

Caveats: no data exists before 29 July (the sink went live mid-window).
The actor pseudonym derives from the verified signed-in identity, which
cuts two ways: within the current production sign-in era, distinct
actors are distinct accounts — a genuine people-proxy — but the switch
to production sign-in (~6–7 August) rotated every returning user's
pseudonym, so totals spanning that boundary double-count returners, by
privacy design. The counting windows that matter — since the
submission, and since the plugin went live — sit cleanly after the
switch. We still can't separate our own signed-in agents from external
adopters; that split is worth building before beta numbers carry any
weight.

**Errors (Sentry — unhandled exceptions, last 30 days).** Quiet in the
way you want: roughly 23 production exception events against ~75,000
MCP requests — around 0.03%. Six issues, five of them single bursts
that never recurred; the second-noisiest was entirely our own
branch-preview noise. One is genuinely live: a small number of clients
advertise an MCP protocol revision newer than any released SDK
supports, and our server currently turns them away. Those users get
*nothing* from us, which matters more than the volume; the fix decision
is ticketed and re-prioritised off the back of this stocktake.

The more consequential finding: **alerting is effectively unarmed** —
one test rule from April, no designed alert set. The pipe works (it has
fired); nobody has aimed it. Detection today depends on someone
choosing to look. Ticketed as release hygiene.

**Deployment (Vercel).** The production deployment is healthy, and
www.thenational.academy/mcp is confirmed Cloudflare-fronted onto it
with protocol-correct auth challenges. The runtime log surface tells a
different story from Sentry's exception count, and it's worth naming:
its single biggest item (~1,700 entries a day) is long-lived MCP
sessions hitting the 300-second serverless function ceiling — confirmed
occurring continuously on production. Not an outage, and not an
exception — a cost and session-experience lever, now ticketed. Two
small recurring config errors (a missing baked landing page on some
builds; an analytics keyring validation failure that silently disables
measurement on affected builds) are ticketed with it.

## Where the release stands

**In**: the connector submitted on 7 August — the release's defining
act — with Anthropic's review running on their clock. The plugin live
as a one-click install route since 10 August. Analytics complete and
observing safely. The canonical domain decided, executed, and serving.
98 tickets closed in the window.

**Continuing**: the five guidance documents (Safeguarding, Input
Safety, Output Safety, Brand Usage, Pedagogical Rigour) from our Oak
expert authors — the pipeline that serves them has been ready since
July, so engineering never sets their pace. Restoring the two
temporarily-reduced plugin components at launch. Recording conveyed
sign-offs where future readers can find them. And a board-hygiene pass
so the burndown reads as true as the code does — the window moved
faster than its own paperwork.

## What we need

- **The guidance authors' time.** The five documents are the largest
  human-authored piece remaining, and each goes live the moment it's
  written.
- **Beta users, and a route to them.** Ten signed-in accounts is a
  working instrument with nobody on it; the plugin is live and the
  connector is under review — when the listing lands, we're ready to
  learn from real teachers.
- **Compliance and curriculum reviewers on call** — the reviewable
  content workspace is standing and stays current by machine.

## Next

- Anthropic's review of the submitted connector runs on their clock; we
  watch for it and respond fast.
- The guidance documents flow in from their Oak authors and go live
  through the waiting pipeline, each on its own schedule.
- The identity-switchboard proof finishes rendering its ten page
  regions.
- This report, owner-edited, becomes the next Linear project update.

---

*Draft: all figures first-hand from git, GitHub, Linear, PostHog,
Sentry, and Vercel on 2026-08-11.*
