# Ask Oisín — repo & project navigator, with Ask Oak split out for curriculum content

> Verified against primary vendor documentation and the live Oak Curriculum MCP on 2026-07-08.
> Owner rulings folded in 2026-07-08: **pragmatic PII egress** (§Security), **running-text matcher
> deferred** for v1, **build v1 now** (no demand gate). The app framework is **settled: Next.js App
> Router** (2026-07-08) — the `@vercel/slack-bolt` adapter is Web-Request-native, so Next.js is the
> right host for *this* use case (not a precedent copy of the MCP app's Express). React *components*
> stay out of scope for v1 (Slack Block Kit only). What else remains open (the invite-only Oak MCP alpha specifics and the
> `@vercel/slack-bolt` receiver wiring) is in Caveats.

**Ask Oisín** (Open Curriculum Ecosystem Navigator, OCEN) is a Slack bot that answers questions about the *project*: the OCE repo, the approaches, the strategy, the Practice, the vision, and the current planning state. It grounds in the `oaknational/oak-open-curriculum-ecosystem` GitHub repo, where the `under-the-hood` skill and the `.agent/` directives, PDRs/ADRs, `principles.md`, and planning state live. Oisín reads that repo **live, through the official remote GitHub MCP server (read-only)** — attached with the same AI SDK MCP client that Ask Oak uses for the Oak Curriculum MCP. **Nothing is vendored.** Surfacing the Oak Curriculum MCP as a source of *curriculum content* — lessons, threads, misconceptions, EEF evidence — is a separate concern handled by a separate app, **Ask Oak**. Two apps, one shared pattern — each attaches exactly one read-only MCP over HTTP — both hosted on Vercel.

Oisín is invoked as `@ask-oisin` (the display name carries the Irish accent, "Ask Oisín"; the handle must be ASCII). It is reached by the `@ask-oisin` mention, two slash commands — `/ask-oisin` and its Welsh-spelling alias `/ask-osian`, both routing to the same handler — and the Slack assistant side-panel / DMs. Slack has no native `@`-mention alias (a bot has exactly one handle), so the second slash command is what carries the alternate spelling. A running-text matcher that catches the name typed mid-sentence (Oisin/Osian/Ossian/Osheen…) was considered but is **deferred for v1**: it requires subscribing to every channel message (`message.channels`), which is the largest incidental-PII surface in the design, so v1 relies on explicit invocation only (see §Security, privacy, and PII).

## Scope: two apps, one pattern

| | **Ask Oisín** | **Ask Oak** |
|---|---|---|
| Answers | The project: repo, approaches, strategy, the Practice, vision, planning state | The curriculum: lessons, units, threads, misconceptions, EEF evidence |
| Grounds in | OCE GitHub repo, read **live** — the `under-the-hood` skill, `.agent/` directives, PDRs, `principles.md`, planning docs | Oak Curriculum MCP curriculum tools (`get-curriculum-model`, `search`, `fetch`, thread/prior-knowledge/misconception graphs, EEF) |
| MCP used | Official **remote GitHub MCP server** (read-only, `repos` toolset), via the AI SDK's MCP client | Oak Curriculum MCP, via the AI SDK's MCP client |
| Oak skills loaded | `oak-tone-of-voice` (primary), read live from `oak-skills` | `oak-tone-of-voice`, `oak-curriculum-principles`, `oak-lesson-builder`, `oak-brand`, read live |
| Auth blocker | GitHub token only — a fine-grained PAT with read on the public OCE repo and the (currently private) `oak-skills` repo; ships first | Oak MCP invite-only OAuth 2.1 alpha: a one-time interactive sign-in to mint a persisted refresh token |
| Audience | Internal Oak staff | Teachers and curriculum staff |

Both apps are separate Slack apps (two manifests, two bot users, two tokens) built on the same codebase — the same invocation set, the same Vercel + `@vercel/slack-bolt` runtime, the same AI SDK + AI Gateway model layer, and the same "attach one read-only MCP, run a bounded tool loop" shape.

## TL;DR
- Host on Vercel as a **Next.js App Router** app using the official `@vercel/slack-bolt` adapter, which uses Fluid compute's `waitUntil` to acknowledge Slack inside its 3-second window while the model call continues in the background. Next.js is settled because the adapter is Web-Request-native (`export const POST = createHandler(app, receiver)`) — Express is not one of its targets. Reuse the MCP app's observability / rate-limiting / Clerk **packages**, not its Express router. Socket Mode is not usable on Vercel (no long-lived process); it stays a local-dev convenience only.
- Use the AI SDK with the Vercel AI Gateway (BYOK) as the model layer, not the raw Anthropic SDK. It is zero-markup on tokens (including under BYOK), gives spend/latency observability and cross-provider failover, offers a Zero-Data-Retention routing toggle, and composes cleanly with the Slack adapter. Both apps call `generateText` with a bounded tool loop (`stopWhen: isStepCount(…)`): Oisín with the GitHub MCP tools attached, Ask Oak with the Oak MCP tools attached. Route with a current model slug (e.g. `anthropic/claude-sonnet-5`); treat it as an **opaque operator-configured value and do not validate its format** — the Gateway rejects unknown slugs at call time, and Anthropic IDs are hyphenated (e.g. `claude-sonnet-5`, `claude-opus-4-8`), so a dot/hyphen heuristic would false-reject valid models.
- Ground Oisín by reading the repo **live** through the official remote GitHub MCP server (read-only, `repos` toolset), attached via the AI SDK MCP client — no vendoring, ever. The repo is public; there is no anonymous mode, so the one credential is a fine-grained PAT with read on it (plus the private `oak-skills` repo, for tone-of-voice). The Oak Curriculum MCP stays out of Oisín entirely: its `oak-under-the-hood` tool only returns a pointer back to the same repo.
- **PII: pragmatic egress (owner ruling).** The user's own deliberately-typed question is the only sanctioned egress; author identity is stripped, structured PII scrubbed, nothing logged or persisted outside Slack, and ZDR is on. See §Security, privacy, and PII for the full boundary.
- Oisín needs no persistent storage to ship (its GitHub PAT is an env secret). Add a small TTL key-value store (Upstash/Vercel KV) keyed on the Slack event id for retry de-duplication. **Ask Oak, by contrast, needs durable storage from day one** — the Oak MCP OAuth has no client-credentials grant, so Ask Oak must persist an OAuth refresh token. Reach for Neon Postgres only when durable, queryable data (feedback, analytics, audit) becomes a real need.

## Key Findings

**The Vercel serverless-vs-Slack problem is solved.** Historically, Bolt on serverless was painful — ack fast to beat Slack's 3-second timeout and the long-running work gets killed when the function returns; wait for the work and Slack times out. The official `@vercel/slack-bolt` adapter closes that gap using Fluid compute streaming and `waitUntil`, so you keep Bolt's `app.event`/`app.command`/`app.message` ergonomics on serverless. It works with any Web Request framework (Hono, Nitro, Next.js), with Express possible but against the grain. (Fluid compute is now default-on for new Vercel projects; only pre-existing projects need the toggle.)

**The repo already has a working template for this class of service.** `apps/oak-curriculum-mcp-streamable-http` is a Vercel-deployed, observable, rate-limited, **Clerk-authenticated** headless app built on Express 5 + esbuild, consuming the shared workspace packages (`@oaknational/result`, `env`, `env-resolution`, `logger`, `observability`, `sentry-node`, `type-helpers`, `build-metadata`). Its genuine shared `@oaknational/*` packages (`result`, `env`, `env-resolution`, `logger`, `sentry-node`, `type-helpers`, `build-metadata`) are the reusable part. What does **not** transfer: the Express HTTP router; the `express-rate-limit` wiring (Express-bound, not Vercel-serverless-runnable); the `@clerk/*` client wiring; and even `sentry-node`'s Express init (a Next.js app needs a Next.js-appropriate Sentry init). And the MCP app is an OAuth **resource server** — it verifies inbound tokens; it is *not* an OAuth client — so Ask Oak's client acquisition/refresh is new work, not a lift.

**The AI Gateway is the right model layer here.** Tokens cost the same as going direct to Anthropic, with zero markup, including under BYOK; on top you get a spend/latency dashboard, automatic cross-provider failover, and an optional team-wide Zero-Data-Retention routing toggle. ZDR should be **on** for an internal tool handling Oak's own material.

**Live-GitHub is the grounding for Oisín, via the official GitHub MCP server, and the Oak MCP stays out.** The repo is public, so the credential is trivial (a read-only PAT) and the Oak MCP invite-only alpha is out of Oisín's critical path. The `oak-under-the-hood` tool was verified first-hand to return *only* a pointer to the repo's own `under-the-hood` skill plus two public Oak URLs — pure redundancy for a bot already reading the repo. Reading live (not vendoring) removes any staleness problem.

**Both apps use the AI SDK's MCP client, not Anthropic's server-side connector.** `createMCPClient` from `@ai-sdk/mcp` connects to a remote MCP over Streamable HTTP with Bearer/OAuth auth and adapts its tools into ordinary AI SDK tools, from the Vercel runtime, inside one `generateText` tool loop. Anthropic's own MCP connector was rejected: it is a feature of the Anthropic Messages API (`api.anthropic.com`), not the AI SDK, and is not ZDR-eligible.

**Ask Oak's OAuth is authorization-code only — so it needs a store on day one.** The Oak MCP's OAuth 2.1 metadata (Clerk-backed) supports `authorization_code` and `refresh_token` grants with PKCE (S256) — and **not** `client_credentials`. A headless bot therefore cannot authenticate machine-to-machine: a human signs in once (with `offline_access`) to mint a refresh token, which the app persists durably and refreshes from.

**The running-text matcher is deferred (owner ruling).** Dropping it for v1 removes the largest incidental-PII surface (channel-wide message ingestion), eliminates the `app_mention`/`message` double-fire bug entirely, and drops the `channels:history` scope. Explicit invocation — mention, two slash commands, the assistant panel, and DMs — covers real usage. The matcher can return later if a demand for free-text name-catching emerges, gated on the same privacy review.

## Implementation shape

**Organisation — thin apps over a shared framework.** Almost everything is shared; the per-app delta is a config object and a system prompt. So: a framework package plus two thin app entrypoints. Apps are leaf deployables and must not depend on each other (dependency direction per `orientation.md`); shared code lives *up* in `packages/`.

```text
packages/libs/slack-assistant/     # the reusable framework (org-agnostic, publishable)
apps/slack/ask-oisin/              # thin: config + deploy harness
apps/slack/ask-oak/                # thin: config + deploy harness
```

`apps/slack/*` is the right home (a family of Slack surfaces is likely); add it as a workspace glob in `pnpm-workspace.yaml` (which currently lists apps individually). The framework does **not** live under `apps/`.

**Workspaces depended on.** Existing (all already consumed by the MCP app, so a proven set): `@oaknational/result`, `env`, `env-resolution`, `logger`, `observability`, `sentry-node`, `type-helpers`, `build-metadata`; the Clerk stack (`@clerk/backend`, `@clerk/mcp-tools`) for Ask Oak; optionally `@oaknational/curriculum-sdk` if Ask Oak calls some endpoints directly rather than via MCP. New: `packages/libs/slack-assistant` (the framework); and, only at a second consumer, a thin `ai-gateway` wrapper lifted out of it (per `consolidate-at-second-consumer` — don't extract pre-emptively).

**The three seams.**
- *Reusable everywhere (org-agnostic, publishable):* Bolt + `@vercel/slack-bolt` ack/`waitUntil` wiring; the invocation mechanics (mention, slash routing); the AI-SDK bounded tool loop, model-slug handling, streaming; MCP-client attachment given a URL + auth + toolset filter; **the PII egress boundary**; mrkdwn rendering, the LLM-content disclaimer, the feedback affordance; signature verification, rate limiting, the Sentry `beforeSend` scrubber.
- *Reusable with some change (configuration):* which MCP to attach and its auth; which skills/persona load into the system prompt; model choice; the bot's name; branding/disclaimer text.
- *Specific to each app (the ~40-line delta):* Ask Oisín's project-navigator persona + GitHub MCP + "hand curriculum questions to Ask Oak" routing; Ask Oak's curriculum persona + Oak MCP + persisted-refresh-token auth + `get-curriculum-model`-first.

**Separating Oak config from general functionality → a publishable core.** Express the seam as a factory, `defineSlackAssistant(config)`: the framework is tier 1, the `config` object *is* tiers 2–3. The test for placement: *would someone else's bot need this unchanged?* → framework; *would they change a value?* → config; *would they change logic?* → it's mis-placed. Held to that line, `slack-assistant` has zero Oak in it and is open-sourceable as a "grounded Slack assistant over any MCP" framework, which serves the openness principle and is exactly the "others spin up their own versions" goal. For v1, draw the seam for **Slack only** — no surface-adapter indirection (no `SurfaceAdapter` interface or adapter registry). A future surface-agnostic core (web/CLI adapters) stays in the deferred revisit register, not in the v1 shape.

**Framework: settled, plus a revisit register.** The app framework is **Next.js App Router** (settled 2026-07-08): choosing `@vercel/slack-bolt` for its `waitUntil` ack chooses a Web-Request framework, and Next.js is the canonical Vercel host, already in the monorepo (the demo). This is a fit-for-use-case choice, not a copy of the MCP app's precedent — precedent is not correctness. Incoming canonical Next.js/React resources will supply shared config/conventions to adopt, not change the framework. Reopen the register rows below when they land:

| Item | Status now | What would change it |
|---|---|---|
| App HTTP framework | **Settled: Next.js App Router** (adapter is Web-Request-native) | Incoming shared Next.js config workspace → adopt its conventions (a config alignment, not a framework change) |
| `packages/libs/slack-assistant` | Safe to design now — surface/framework-agnostic | Only if the standard mandates a specific runtime shape |
| Web-surface adapter (surface-agnostic core opportunity) | **Deferred** — this is the React/Next surface | Gated on canonical Next.js/React resources + `react-component-expert` + `accessibility-expert` review |
| Any feedback/admin/config **UI** beyond Slack Block Kit | Deferred | Same gate as the web adapter |
| WCAG 2.2 AA component review | N/A while Block-Kit-only | Fires the moment any React component exists |

Block Kit (suggested prompts, feedback buttons, mrkdwn) is not React, so v1 is React/Next-free and not blocked by the missing resources.

## Security, privacy, and PII

**Invariant (owner ruling: pragmatic egress).** An LLM bot must send the user's question out of Slack to reach Claude, so "zero PII leaves Slack" is only literally achievable with Oak-controlled inference (recorded as the strict alternative, not v1). The achievable invariant v1 commits to: **the user's own deliberately-typed question is the sole sanctioned egress — minimised, stripped of identity, scrubbed of structured PII — and no content is logged or persisted outside Slack.**

**Access control (owner ruling): internal-use only.** An installation allow-list gate — applied after Slack signature verification, before any model call — rejects any Slack workspace/team that is not ours. No external users, no external access. Others may fork the repo and self-host their own instance; our deployment serves internal Oak staff only.

**Trust boundaries and every egress point** (the middle three are commonly missed):

| Egress | Carries | Control |
|---|---|---|
| LLM prompt → Gateway → Anthropic | question + system prompt + any thread context | ZDR on; strip identity; minimise context; DLP scrub |
| **Tool-call arguments** the model generates → GitHub/Oak | model may echo question PII into a search query | scrub applies to tool args too, not just the prompt |
| **Sentry / OTel** | request/response bodies if logged | `beforeSend` scrubber in `@oaknational/sentry-node`; log metadata only, never content |
| **Vercel function logs** | prompt/response if logged | never log message bodies; structured metadata only |
| AI Gateway dashboard | sees the prompt inherently | ZDR; accept the Gateway sees only the sanctioned question |
| KV / DB (dedup, feedback) | question text at rest outside Slack | key dedup on the Slack event id (opaque); keep feedback state *in* Slack (reactions/metadata) |

**Controls (framework-level, so every bot inherits them):**
1. **Never attach author identity** — strip user ids, display names, `@`-mentions, and email-looking tokens before egress. The model does not need to know who asked.
2. **DLP/redaction at the boundary** — emails, phone numbers, structured identifiers; imperfect for freeform names but catches structured PII; applies to prompt, tool args, and anything logged.
3. **No running-text matcher / no `message.channels`** (v1) — the biggest incidental-PII surface is removed; do not wholesale-forward channel `conversations.replies`, default to the current question only.
4. **No content persistence** — ZDR on; secrets (Slack tokens, Gateway key, the GitHub PAT with private `oak-skills` read, Ask Oak's refresh token) encrypted, minimally scoped, rotated.
5. **Egress allowlist** — the function reaches only Gateway, Slack, GitHub MCP, Oak MCP.
6. **Read-only tools** — GitHub MCP `X-MCP-Readonly`, Oak MCP is read; low prompt-injection blast radius (repo/curriculum content and any channel text can carry adversarial instructions, but the bot cannot act destructively).
7. **Access control + cost/abuse** — an installation allow-list (internal-use ONLY; reject non-allow-listed workspaces) plus a durable-KV limiter keyed on the Slack team id and a one-way-hashed (never-egressed) user id. **Not** `express-rate-limit` (Express-bound, doesn't survive Vercel serverless, can't see users behind Slack's shared egress IP). Set Gateway budget alerts.
8. **Safeguarding** — Oak is an education body; even an internal bot can receive sensitive disclosures. Disclaimer + no-logging + a policy on deflecting sensitive content.
9. **Accessibility (org requirement)** — any rendered affordance beyond Block Kit defaults must meet WCAG 2.2 AA (contrast, keyboard/AT reachability, non-colour-only signals).

## Details

### 1. Ask Oisín

**Grounding.** Oisín reads the OCE repo live. It attaches the official remote GitHub MCP server as a read-only tool set and lets the model fetch what each question needs: it starts from `.agent/skills/under-the-hood/SKILL-CANONICAL.md` and follows it, then reads the specific `.agent/` directives, decision records (PDRs/ADRs), `principles.md`, and planning docs the question calls for. Nothing is baked into the deploy, so every answer reflects the current `main`. It does not touch the Oak Curriculum MCP.

**Oak skills.** The LLM reads Oak skills live from `oaknational/oak-skills`, primarily `oak-tone-of-voice`: make the reader the subject not Oak, use first and second person and contractions, put the point first in plain words. `oak-skills` is currently a **private** repo (verified 2026-07-08), so Oisín's PAT must be scoped to read it too — or the tone-of-voice content mirrored into the public OCE repo, or `oak-skills` made public (its own description signals that intent).

**Message flow.**
1. A user `@ask-oisin`s a question, uses `/ask-oisin` or `/ask-osian`, or messages Oisín in the assistant side-panel or a DM.
2. Slack delivers an `app_mention`, slash-command, `message.im`, or assistant-thread event over the Events API to the app's HTTP request URL on Vercel.
3. The `@vercel/slack-bolt` adapter acknowledges within Slack's 3-second window and hands the real work to `waitUntil`. Bolt sets an assistant status ("Ask Oisín is reading the OCE repo…") via `assistant.threads.setStatus`.
4. The handler builds the prompt from the current question only (author identity stripped, PII scrubbed — see §Security), calls the AI SDK (`generateText`, or `streamText`) with a Gateway model string, the GitHub MCP tools, and a system prompt: role + routing, where in the repo to read (start from the under-the-hood skill), a pointer to `oak-tone-of-voice`, and Slack-formatting rules.
5. Claude reads the repo live through the GitHub tools and answers. Curriculum-content questions are handed to Ask Oak rather than guessed. Answers cite the repo path used, so users can verify.
6. The handler posts the answer as Slack `mrkdwn`, appends an LLM-content disclaimer, sets the thread title, and optionally shows an (accessible) feedback affordance whose state lives in Slack.

**Hosting & runtime (Vercel).** A **Next.js App Router** app on Vercel (settled). The Slack request URL is an App Router route handler wired to Bolt through `@vercel/slack-bolt` (`export const POST = createHandler(app, receiver)`), reusing the MCP app's observability / rate-limit / Clerk packages (not its Express router); the route sets `maxDuration` high enough to cover model **plus live GitHub tool** latency after the fast ack, and Fluid compute keeps the function running for `waitUntil` (default-on for new projects). Socket Mode cannot run on Vercel; keep it only for a local dev process if wanted.

**AI layer.** The AI SDK routes through the AI Gateway by passing a `creator/model` slug — `anthropic/claude-sonnet-5` for the default, or a higher-quality Opus ID. Treat the slug as an **opaque operator-configured value; do not validate its format** (Anthropic IDs are hyphenated; the Gateway rejects unknown slugs at call time — confirm the exact accepted form against the installed Gateway/AI SDK at build time). BYOK is configured once in the Vercel dashboard. Anthropic knobs (prompt caching, betas) pass through `providerOptions` keyed by `anthropic`. Turn on the Gateway ZDR toggle.

**Persistence.** None to ship: stateless, grounded live from GitHub, history from Slack (`conversations.replies`, current thread only), thread context in Slack's own metadata. Its only stored secret is the GitHub PAT. Add a TTL KV keyed on the Slack event id to swallow Slack's retry (up to 3×) — keyed on the opaque id, never on content. Neon only when feedback/analytics/audit become real.

**Auth / OAuth scopes.** Slack bot token scopes: `app_mentions:read`, `chat:write`, `assistant:write`, `im:history`, `im:write`, `commands`. (No `channels:history` — the running-text matcher is deferred.) Claude is reached through the AI Gateway with an `AI_GATEWAY_API_KEY` (BYOK in the dashboard). GitHub is reached through the remote GitHub MCP server with a fine-grained PAT reading the OCE repo (public) and `oak-skills` (private). Oisín needs no Oak MCP token — its outbound calls are only the AI Gateway, Slack, and the GitHub MCP.

### 2. Ask Oak (separate app, curriculum content)

Ask Oak is a second Slack app on the same codebase and stack. It answers curriculum questions by attaching the Oak Curriculum MCP through the AI SDK's MCP client over Streamable HTTP with an OAuth bearer token, pruning out the non-curriculum tools and calling `get-curriculum-model` first as the server requires. Its system prompt loads `oak-tone-of-voice`, `oak-curriculum-principles`, `oak-lesson-builder`, and `oak-brand` (read live).

**The OAuth alpha gates it and shapes storage.** The Oak MCP advertises OAuth 2.1 with `authorization_code` + `refresh_token` grants and PKCE (S256) — and no `client_credentials`. So a human signs in once (scope `offline_access`) to obtain a refresh token, the app persists it durably, and an `authProvider` on the transport refreshes bearer tokens from it. That means Ask Oak needs a secret/KV store on day one — the one exception to "no database for v1". Because the MCP call originates from the Vercel runtime, tool round-trips run inside the `waitUntil` window, so the route's `maxDuration` must cover model-plus-tool latency. This is the same Clerk-backed OAuth pattern `apps/oak-curriculum-mcp-streamable-http` already implements (`@clerk/backend`, `@clerk/mcp-tools`) — lift it, and invoke the clerk-expert.

**Tool set — prune by denylist, not a narrow allowlist.** Ask Oak needs the discovery, browsing, fetching, progression/graph, and programme tool families — most of the server's surface. Expose *everything except* the non-curriculum tools (`oak-under-the-hood`, `get-rate-limit`, `get-changelog`, `get-changelog-latest`), rather than a hand-curated allowlist that silently drops lesson-content tools (`get-lessons-summary`/`-transcript`/`-quiz`/`-assets`, `get-units-summary`, the `get-programmes-*` set) and any tool added later.

### 3. The Oak Curriculum MCP server

The production alpha at `https://curriculum-mcp-alpha.oaknational.dev/mcp` is a Streamable HTTP MCP server using OAuth 2.1 (advertised at `/.well-known/oauth-protected-resource`, Clerk-backed authorization server; `authorization_code` + `refresh_token` grants, PKCE S256, dynamic client registration advertised), invite-only for Oak staff. It exposes resources, workflow prompts, and ~42 tools, including `oak-under-the-hood` and the curriculum tools `get-curriculum-model` (call first), `browse-curriculum`, `explore-topic`, `search`, `fetch`, `get-thread-progressions`, `get-prior-knowledge-graph`, `get-misconception-graph`, `get-eef-evidence`, `get-keyword-graph`, plus the lessons/units/programmes/sequences fetching families — over **164 threads across 16 subjects** (verified verbatim from `get-curriculum-model`). The curriculum tools are Ask Oak's; Oisín uses none. Called directly, `oak-under-the-hood` returns only a resource-link pointer to `raw.githubusercontent.com/…/main/.agent/skills/under-the-hood/SKILL-CANONICAL.md` plus two public Oak URLs — so Oisín gets the same content, and more, by reading the repo directly.

### 4. The repo decision instruments — status and application

**Sourcing note.** The instruments named below were confirmed in-repo on 2026-07-08: the `metacognition` and `reason` skills are present at `.agent/skills/metacognition/SKILL-CANONICAL.md` and `.agent/skills/reason/SKILL-CANONICAL.md`; `principles.md` is at `.agent/directives/principles.md` with an ordered "Decision Lenses" section; PDR-051 is confirmed ("skills are the sole invocable-workflow surface"); the continuity pipeline `capture → distil → graduate → enforce` is confirmed. There is no standalone "decision matrix" file — the matrix is a *method*, defined next.

**Decision matrix — the method.** The decision matrix is the five **`principles.md` Decision Lenses** applied *in order* (first that decisively resolves governs), run through the two reasoning skills: `/oak-metacognition` supplies the inward check (am I about to bring about the right impact? — the action-to-impact bridge) and `/oak-reason` supplies the outward structure (name the kind, frame the problem not the solution, surface the warrant and its falsifier, decide for reversibility, stress-test). The five lenses:

1. Choose long-term architectural excellence at every decision point.
2. Strict, everywhere, all the time.
3. Could it be simpler without compromising quality or value? (the First Question)
4. Would it be simpler if the system changed?
5. Optimise for user value.

Applied to the decisions that changed:

- **The split (one app vs two).** Lens 1 favours the split: isolating Ask Oak's invite-only OAuth dependency from a ship-now app is the cleaner boundary. Lenses 3–4 resist duplicated deployment, and the third option they force is the one adopted — one shared codebase, two thin app configs. Lens 5: staff get Ask Oisín now, teachers get Ask Oak when the alpha opens. → two apps, one codebase.
- **Oisín's grounding (live GitHub vs vendoring vs the Oak MCP).** Lenses 1–2 favour reading the repo live: one live source with nothing to drift, carrying file-level planning state the pointer-only `oak-under-the-hood` cannot. Lens 4 dissolves the "which surface" question. Lens 3: one credential, one tool loop. → live GitHub read; no vendoring; no Oak MCP for Oisín.
- **Hosting and model layer.** Lens 1: the managed path buys observability and failover at a mild, reversible lock-in cost. Lenses 3 and 5: simplest path to staff. → Vercel + AI Gateway, with **Next.js App Router** for the HTTP layer (settled — fit to the Web-Request adapter, not a precedent copy).
- **The running-text matcher.** Lens 3 (simpler without losing value) and lens 4 (change the system, dissolve the problem): dropping it removes the double-fire bug and the channel-wide PII surface at negligible cost to real usage. → deferred for v1.

**Metacognition skill — the routing driver.** Oisín answers project questions from the repo and hands curriculum questions to Ask Oak rather than confabulating; Ask Oak defers project questions to Oisín.

**Reason skill — decomposition.** Oisín: read the under-the-hood skill first, then targeted files, then decide project (answer) vs curriculum (hand off). Ask Oak: `get-curriculum-model` first, then the specific tool, in the step loop.

**principles.md decision lenses.** Enumerated above and applied verbatim. (An earlier draft used *reversibility / blast-radius / openness / simplicity* — those are decision heuristics from the `reason` skill, not the `principles.md` lenses.)

The continuity directive still applies: capture surprising failures (alpha auth expiry, a GitHub rate-limit or PAT-scope surprise, a Gateway routing surprise) into the `capture → distil → graduate → enforce` pipeline.

### 5. Starter code skeleton (TypeScript, Next.js App Router on Vercel)

**Ask Oisín app manifest (`manifest.oisin.yaml`):**
```yaml
display_information:
  name: Ask Oisín
  description: Open Curriculum Ecosystem Navigator — project, Practice, strategy, planning (bot)
features:
  bot_user:
    display_name: Ask Oisín
    always_online: true
  assistant_view:
    assistant_description: "Ask about the OCE repo, the Practice, strategy, and planning state."
  slash_commands:
    - command: /ask-oisin
      description: Ask Oisín about the project, the Practice, strategy, and planning
      usage_hint: "[your question]"
      should_escape: false
    - command: /ask-osian
      description: Alias of /ask-oisin (Welsh spelling)
      usage_hint: "[your question]"
      should_escape: false
oauth_config:
  scopes:
    bot:
      - app_mentions:read
      - chat:write
      - assistant:write
      - im:history
      - im:write
      - commands          # no channels:history — running-text matcher deferred for v1
settings:
  event_subscriptions:
    request_url: https://ask-oisin.vercel.app/api/slack   # HTTP on Vercel (not Socket Mode)
    bot_events:
      - app_mention
      - assistant_thread_started
      - assistant_thread_context_changed
      - message.im        # DMs only; NOT message.channels (matcher deferred)
  interactivity:
    is_enabled: true
    request_url: https://ask-oisin.vercel.app/api/slack
  socket_mode_enabled: false
  org_deploy_enabled: false
```

**`.env`:**
```
SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=...
AI_GATEWAY_API_KEY=...                     # Vercel AI Gateway; BYOK (Anthropic key) set in the dashboard
CLAUDE_MODEL=anthropic/claude-sonnet-5     # opaque operator-configured model slug (Anthropic IDs are hyphenated); not format-validated
GITHUB_TOKEN=github_pat_...                # fine-grained PAT: read on the OCE repo (public) + oak-skills (private)
# Ask Oak (separate app) additionally needs OAK_MCP_URL and a persisted OAuth refresh token
# (no client_credentials grant) — a secret/KV store, not just env.
```

**Shared core (`lib/core.ts`) — model layer + bounded tool loop:**
```ts
import { generateText, isStepCount } from "ai";   // v7: isStepCount (was stepCountIs in v6)

// A "creator/model" string routes through the Vercel AI Gateway (BYOK, zero markup).
// Opaque operator-configured model slug (e.g. anthropic/claude-sonnet-5); do not validate its format.
export const MODEL = process.env.CLAUDE_MODEL!;

// Both apps attach exactly one read-only MCP tool set; the model runs a bounded tool loop.
// `prompt` MUST already be scrubbed of author identity and PII by the egress boundary.
export async function ask(system: string, prompt: string, tools: Record<string, unknown>) {
  const { text } = await generateText({
    model: MODEL,
    system,
    prompt,
    stopWhen: isStepCount(8),   // bound the tool round-trips (GitHub reads / curriculum lookups)
    tools,
  });
  return text;
}
```

**Ask Oisín route handler (`app/api/slack/route.ts`):**
```ts
import { App } from "@slack/bolt";
import { createHandler } from "@vercel/slack-bolt";   // adapter: acks in 3s, runs work via waitUntil
import { createMCPClient } from "@ai-sdk/mcp";         // @ai-sdk/mcp (stable); pin the AI SDK major
import { ask, MODEL } from "@/lib/core";
import { scrub } from "@/lib/pii";                     // strips identity + structured PII before egress

export const maxDuration = 120;   // cover model + LIVE GitHub reads after the fast ack

const SYSTEM = `You are Ask Oisín (@ask-oisin), a bot — an assistant, not a person — for Oak
National Academy's Pathfinder team. You answer questions about the PROJECT: the Open Curriculum
Ecosystem repo, its approaches, the Practice, strategy, vision, and current planning state.
Read the repo LIVE with the GitHub tools — nothing is baked in. Start from
.agent/skills/under-the-hood/SKILL-CANONICAL.md and follow it, then read the specific .agent/
directives, decision records (PDRs/ADRs), principles.md, and planning docs the question needs.
Cite the repo path you used. For Oak's voice, read oak-tone-of-voice from the oak-skills repo.
If a question is really about curriculum CONTENT, say so and point the user to the Ask Oak app.
Format replies as Slack mrkdwn.`;

// Official remote GitHub MCP server, read-only, repos toolset — reads the public repo live.
const github = await createMCPClient({
  transport: {
    type: "http",
    url: "https://api.githubcopilot.com/mcp/",
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "X-MCP-Readonly": "true",
      "X-MCP-Toolsets": "repos",
    },
  },
});
const tools = await github.tools();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,   // Bolt verifies every request signature
});

app.event("app_mention", async ({ event, say }) => {
  await say({ text: await ask(SYSTEM, scrub(event.text), tools), thread_ts: event.ts });
});

app.event("message", async ({ message, say }) => {   // DMs only (message.im); no channel subscription
  const m = message as any;
  if (m.channel_type !== "im" || m.subtype || m.bot_id) return;
  await say({ text: await ask(SYSTEM, scrub(m.text), tools), thread_ts: m.thread_ts ?? m.ts });
});

const slash = async ({ command, ack, respond }: any) => {   // ack within 3s, then post the answer
  await ack();
  await respond({ response_type: "in_channel", text: await ask(SYSTEM, scrub(command.text ?? ""), tools) });
};
app.command("/ask-oisin", slash);
app.command("/ask-osian", slash);

app.event("assistant_thread_started", async ({ event, client }) => {
  await client.assistant.threads.setSuggestedPrompts({
    thread_ts: event.assistant_thread.thread_ts,
    channel_id: event.assistant_thread.channel_id,
    prompts: [
      { title: "What is the Practice?", message: "What is the Practice and how does it work?" },
      { title: "Where's the plan?", message: "What's the current planning state for OCE?" },
    ],
  });
});

// The adapter exposes the App as a Web Request handler. The real signature is two-arg,
// createHandler(app, receiver): construct the adapter's receiver and pass the SAME instance to
// new App({ receiver }) and to createHandler — confirm the exact export/receiver names per the
// @vercel/slack-bolt README, and against the incoming framework standard.
export const POST = createHandler(app /*, receiver */);
```

**Ask Oak entrypoint — the delta:** same manifest shape, hosting, and invocation set; different system prompt, an OAuth `authProvider` refreshing from a persisted refresh token, and the Oak MCP tool set pruned by denylist:
```ts
import { createMCPClient } from "@ai-sdk/mcp";
import { ask } from "@/lib/core";

const SYSTEM = `You are Ask Oak (@ask-oak), a bot for Oak's curriculum content. Answer questions about
lessons, units, threads, misconceptions, keywords, prior knowledge, and EEF evidence using the Oak
Curriculum tools; call get-curriculum-model first. Read oak-tone-of-voice and oak-curriculum-principles
for Oak's voice. Format replies as Slack mrkdwn.`;

// OAuth 2.1 has NO client_credentials grant: a human signs in once (offline_access) to mint a
// refresh token, persisted durably; authProvider refreshes bearer tokens from it.
const mcp = await createMCPClient({
  transport: { type: "http", url: process.env.OAK_MCP_URL!, authProvider },
});
const all = await mcp.tools();

// Curriculum content = everything EXCEPT the non-curriculum tools. A denylist (not a curated
// allowlist) picks up new curriculum tools automatically and never silently drops one.
const NON_CURRICULUM = new Set([
  "oak-under-the-hood", "get-rate-limit", "get-changelog", "get-changelog-latest",
]);
const tools = Object.fromEntries(Object.entries(all).filter(([k]) => !NON_CURRICULUM.has(k)));

// ...identical app_mention / DM / slash / assistant-thread wiring, calling ask(SYSTEM, scrub(text), tools)
```

For production, both apps: add token-by-token streaming with `streamText` + Slack's streaming methods (`chat.startStream`/`chat.appendStream`/`chat.stopStream`, or Bolt's `sayStream`), persist an `AssistantThreadContextStore` if you outgrow Slack-metadata context, and enable the AI Gateway ZDR toggle. Ask Oak additionally needs its OAuth refresh token in a durable store. Pin the AI SDK major and confirm the `@vercel/slack-bolt` receiver wiring. A small answer-quality eval set (reuse the search-quality ground-truth methodology already in the repo) turns answer quality into a gate rather than a vibe.

### 6. Doc references supporting each decision
- `@vercel/slack-bolt` adapter — Fluid compute + `waitUntil`; Web-Request-native (Hono/Nitro/Next); `createHandler(app, receiver)`: Vercel changelog "Build Slack agents with @vercel/slack-bolt" and the package README.
- Reused packages — `apps/oak-curriculum-mcp-streamable-http` (Clerk + observability + rate-limiting on Vercel) supplies shared workspace packages to reuse; its Express router is **not** reused (Ask Oisín is Next.js App Router — the framework is chosen for this use case, not copied from that app).
- Official remote **GitHub MCP server** — endpoint `https://api.githubcopilot.com/mcp/` (GA 2025-09-04), PAT/OAuth auth (no anonymous mode), read-only via `X-MCP-Readonly`, toolset scoping via `X-MCP-Toolsets`, Streamable HTTP: `github/github-mcp-server` docs.
- Slack — `Assistant` class, assistant-thread events, `assistant:write`, status/suggested-prompt helpers; 3s ack + up-to-3 retries; slash commands + `commands` scope; `mrkdwn` (`<url|text>` links, no headings/tables); `conversations.replies`; streaming via `chat.startStream`/`appendStream`/`stopStream`: Slack docs.
- HTTP required on Vercel (Socket Mode needs a long-lived process): Slack "Comparing HTTP & Socket Mode".
- Vercel AI Gateway — zero markup incl BYOK (paid tier + credits; system-credit fallback), observability/failover, ZDR routing, `providerOptions` passthrough: Vercel "AI Gateway" docs.
- AI SDK — `creator/model` routing, `generateText`/`streamText`, `stopWhen: isStepCount(N)` (v7 rename of `stepCountIs`); MCP client (`@ai-sdk/mcp`, Streamable HTTP, OAuth `authProvider`, tools/resources/prompts): AI SDK docs and the v7 migration guide.
- Neon on Vercel — native Vercel Postgres, `pg` + `attachDatabasePool`, scale-to-zero, branching: Neon docs.
- Oak skills: `oaknational/oak-skills` (currently private). Oak MCP: `curriculum-mcp-alpha.oaknational.dev` and its `/.well-known/` metadata.

## Recommendations
1. **Host both apps as Next.js App Router apps on Vercel with `@vercel/slack-bolt`** (settled — the adapter is Web-Request-native), reusing the MCP app's observability / rate-limiting / Clerk packages (not its Express router). Set `maxDuration` to cover model plus live tool latency; HTTP request URL, no Socket Mode.
2. **Use the AI SDK + AI Gateway (BYOK), not the raw Anthropic SDK.** Configure BYOK, route with a current model slug (`anthropic/claude-sonnet-5`, opaque/unvalidated), turn on ZDR, pin the AI SDK major (v7: `isStepCount`). Both apps: `generateText` with a bounded tool loop.
3. **Ship Ask Oisín first, reading GitHub live, no vendoring.** Attach the official remote GitHub MCP server (read-only, `repos` toolset) via `@ai-sdk/mcp`; PAT reads the OCE repo (public) + `oak-skills` (private).
4. **Enforce the pragmatic PII boundary in the framework** (§Security): strip identity, scrub PII on prompt and tool args, no content in logs/Sentry/KV, egress allowlist, ZDR on.
5. **Build the shared `packages/libs/slack-assistant` framework** with a `defineSlackAssistant(config)` seam so Oak config is separate from general functionality and the core is publishable; apps live at `apps/slack/*`, thin.
6. **Storage:** none for Oisín v1 (KV for retry-dedup as hardening); a durable refresh-token store for Ask Oak from day one; Neon later.
7. **Stand up Ask Oak once alpha credentials land**, reusing the MCP app's Clerk OAuth pattern (invoke the clerk-expert), curriculum tools pruned by denylist, `get-curriculum-model` first.
8. **Apply the decision matrix as defined in §4** when re-evaluating any change, and **reopen the revisit register** (§Implementation shape) when the canonical Next.js/React resources and workspaces arrive.

## Caveats
- The app framework is **settled: Next.js App Router** (the adapter is Web-Request-native; chosen for this use case, not copied from the MCP app's Express). Incoming canonical Next.js/React resources will supply shared config to adopt, not change the framework; React *components* stay out of scope until a web-surface adapter is added.
- `@vercel/slack-bolt` is recent (2025); the handler signature is `createHandler(app, receiver)` — confirm the exact export/receiver names and wiring against its current README, and against the incoming standard.
- The remote GitHub MCP server requires a credential even for public-repo reads — there is **no anonymous mode**. `oak-skills` is confirmed **private** (2026-07-08), so the PAT must read it too, or Oisín cannot load `oak-tone-of-voice` live — the alternative is to make `oak-skills` public (its description signals that intent) or mirror the tone-of-voice content into the public OCE repo. Live reads use the authenticated GitHub REST limit (5,000/hr per token).
- The AI SDK MCP client is stable in `@ai-sdk/mcp` (current major v7 of `ai`; `@ai-sdk/mcp@2.x`). Pin the major and use v7 API names (`isStepCount`, not `stepCountIs`).
- AI Gateway BYOK requires the paid tier and purchased credits; a failed BYOK request falls back to Vercel system credentials billed against your balance. The team-wide ZDR toggle may carry a small per-request surcharge — confirm on the live pricing page.
- The model slug is an **opaque operator-configured value — do NOT validate its format**. Current Anthropic IDs are **hyphenated** (`claude-sonnet-5`, `claude-opus-4-8`); an earlier "dot-separated / hyphen-is-legacy" claim in this doc was wrong (`claude-sonnet-4-5` is a valid older ID, not a bad format). The Gateway rejects unknown slugs at call time; confirm the exact accepted form against the installed Gateway/AI SDK.
- Fluid compute must be enabled (default-on for new projects) and `maxDuration` set high enough, or long model/tool calls will be cut off after the ack.
- Ask Oak's Oak MCP OAuth has **no `client_credentials` grant** — a one-time interactive `authorization_code` + PKCE sign-in with `offline_access` is required, and the resulting refresh token must be persisted durably. Verified from the live `/.well-known/` metadata but the invite-only alpha may change.
- **PII is pragmatic, not zero** (owner ruling): the sanctioned question egresses to the model. True zero-egress requires Oak-controlled inference — recorded as the strict alternative, not v1.
- Slack streaming's Web API surface is `chat.startStream`/`chat.appendStream`/`chat.stopStream` (Bolt `sayStream`), not a single `chat.stream` method. Slack `mrkdwn` is not standard markdown (links `<url|text>`, no headings/tables).
- Two apps mean two manifests, two bot users, and two token sets to rotate; the shared codebase keeps the maintenance cost to configuration, not logic.
