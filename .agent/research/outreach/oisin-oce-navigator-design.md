# Ask Oisín — repo & project navigator, with Ask Oak split out for curriculum content

> Verified against primary vendor documentation and the live Oak Curriculum MCP on 2026-07-08.
> What remains open (the invite-only Oak MCP alpha specifics and the `@vercel/slack-bolt`
> receiver wiring) is called out in Caveats.

**Ask Oisín** (Open Curriculum Ecosystem Navigator, OCEN) is a Slack bot that answers questions about the *project*: the OCE repo, the approaches, the strategy, the Practice, the vision, and the current planning state. It grounds in the `oaknational/oak-open-curriculum-ecosystem` GitHub repo, where the `under-the-hood` skill and the `.agent/` directives, PDRs/ADRs, `principles.md`, and planning state live. Oisín reads that repo **live, through the official remote GitHub MCP server (read-only)** — attached with the same AI SDK MCP client that Ask Oak uses for the Oak Curriculum MCP. **Nothing is vendored.** Surfacing the Oak Curriculum MCP as a source of *curriculum content* — lessons, threads, misconceptions, EEF evidence — is a separate concern handled by a separate app, **Ask Oak**. Two apps, one shared pattern — each attaches exactly one read-only MCP over HTTP — both hosted on Vercel.

Oisín is invoked as `@ask-oisin` (the display name carries the Irish accent, "Ask Oisín"; the handle must be ASCII). There is one bot, reached three ways: the `@ask-oisin` mention; two slash commands, `/ask-oisin` and its Welsh-spelling alias `/ask-osian`, both routing to the same handler; and a message-matcher that catches the name typed in running text — the canonical Oisín, the accent-free Oisin, the Welsh Osian, and near-misses like Oisîn, Osean, Ossian, or Osheen. Slack has no native `@`-mention alias — a bot has exactly one handle — so the matcher and the second slash command are what make the alternate spellings work.

## Scope: two apps, one pattern

| | **Ask Oisín** | **Ask Oak** |
|---|---|---|
| Answers | The project: repo, approaches, strategy, the Practice, vision, planning state | The curriculum: lessons, units, threads, misconceptions, EEF evidence |
| Grounds in | OCE GitHub repo, read **live** — the `under-the-hood` skill, `.agent/` directives, PDRs, `principles.md`, planning docs | Oak Curriculum MCP curriculum tools (`get-curriculum-model`, `search`, `fetch`, thread/prior-knowledge/misconception graphs, EEF) |
| MCP used | Official **remote GitHub MCP server** (read-only, `repos` toolset), via the AI SDK's MCP client | Oak Curriculum MCP, via the AI SDK's MCP client |
| Oak skills loaded | `oak-tone-of-voice` (primary), read live from `oak-skills` | `oak-tone-of-voice`, `oak-curriculum-principles`, `oak-lesson-builder`, `oak-brand`, read live |
| Auth blocker | GitHub token only — a fine-grained PAT with read on the public OCE repo and the (currently private) `oak-skills` repo; ships first | Oak MCP invite-only OAuth 2.1 alpha: a one-time interactive sign-in to mint a persisted refresh token |
| Audience | Internal Oak staff | Teachers and curriculum staff |

Both apps are separate Slack apps (two manifests, two bot users, two tokens) built on the same codebase — the same invocation trio, the same Vercel + `@vercel/slack-bolt` runtime, the same AI SDK + AI Gateway model layer, and the same "attach one read-only MCP, run a bounded tool loop" shape.

## TL;DR
- Host on Vercel as a headless Next.js app using the official `@vercel/slack-bolt` adapter, which uses Fluid compute's `waitUntil` to acknowledge Slack inside its 3-second window while the model call continues in the background. Socket Mode is not usable on Vercel (no long-lived process); it stays a local-dev convenience only.
- Use the AI SDK with the Vercel AI Gateway (BYOK) as the model layer, not the raw Anthropic SDK. It is zero-markup on tokens (including under BYOK), gives spend/latency observability and cross-provider failover out of the box, offers a Zero-Data-Retention routing toggle, and composes cleanly with the Slack adapter. Both apps call `generateText` with a bounded tool loop (`stopWhen: isStepCount(…)`): Oisín with the GitHub MCP tools attached, Ask Oak with the Oak MCP tools attached. Route with a current Gateway model slug (dot-separated, e.g. `anthropic/claude-sonnet-5`) — **not** the legacy `claude-sonnet-4-5`.
- Ground Oisín by reading the repo **live** through the official remote GitHub MCP server (read-only, `repos` toolset), attached via the AI SDK MCP client — no vendoring, ever. The OCE repo is public; there is no anonymous mode, so the one credential is a fine-grained PAT with read on it (plus the private `oak-skills` repo, for tone-of-voice). The Oak Curriculum MCP stays out of Oisín entirely: its `oak-under-the-hood` tool only returns a pointer back to the same repo, so it adds nothing for a bot already reading the repo.
- Oisín needs no persistent storage to ship (its GitHub PAT is an env secret). Add a small TTL key-value store (Upstash/Vercel KV) for Slack event de-duplication as hardening. **Ask Oak, by contrast, needs durable storage from day one** — the Oak MCP OAuth has no client-credentials grant, so Ask Oak must persist an OAuth refresh token. Reach for Neon Postgres only when durable, queryable data (feedback, analytics, audit, or a multi-workspace install store) becomes a real need — at which point it is a strong Vercel fit.

## Key Findings

**The Vercel serverless-vs-Slack problem is solved.** Historically, Bolt on serverless was painful — ack fast to beat Slack's 3-second timeout and the long-running work gets killed when the function returns; wait for the work and Slack times out. The official `@vercel/slack-bolt` adapter closes that gap using Fluid compute streaming and `waitUntil`, so you keep Bolt's `app.event`/`app.command`/`app.message` ergonomics on serverless. It works with any Web Request framework, including Next.js. (Fluid compute is now default-on for new Vercel projects; only pre-existing projects need the toggle.)

**The AI Gateway is the right model layer here.** Tokens cost the same as going direct to Anthropic, with zero markup, including under BYOK; on top of that you get a spend/latency dashboard, automatic cross-provider failover, and an optional team-wide Zero-Data-Retention routing toggle. For an internal tool the observability alone is worth the single extra hop, and standardising on the AI SDK gives both bots one model interface.

**Live-GitHub is the grounding for Oisín, via the official GitHub MCP server, and the Oak MCP stays out.** The repo is public, so the credential is trivial (a read-only PAT) and the Oak MCP invite-only alpha is out of Oisín's critical path. The `oak-under-the-hood` tool was verified first-hand to return *only* a pointer to the repo's own `under-the-hood` skill plus two public Oak URLs — so for a bot already reading the repo it is pure redundancy, and it would drag the OAuth alpha back into Oisín's path for no gain. Reading the repo live (rather than vendoring a snapshot) removes any staleness problem: every answer is grounded in the current `main`.

**Both apps use the AI SDK's MCP client, not Anthropic's server-side connector.** The AI SDK's MCP client (`createMCPClient` from `@ai-sdk/mcp`) connects to a remote MCP over Streamable HTTP with Bearer/OAuth auth and adapts its tools into ordinary AI SDK tools. This calls each MCP from the Vercel runtime rather than from Anthropic's cloud, which removes the "must be reachable from Anthropic's IP ranges" constraint, keeps everything inside one `generateText` tool loop, and — for Ask Oak — keeps the OAuth token with the app where it is easy to refresh. The AI SDK client also reads a server's resources and prompts, not just its tools. Anthropic's own MCP connector was considered and rejected: it is a feature of the Anthropic Messages API (`api.anthropic.com`), not the AI SDK, so it would break the AI-SDK abstraction and is not ZDR-eligible.

**Ask Oak's OAuth is authorization-code only — so it needs a store on day one.** The Oak MCP's advertised OAuth 2.1 metadata (Clerk-backed) supports `authorization_code` and `refresh_token` grants with PKCE (S256) — and **not** `client_credentials`. A headless bot therefore cannot authenticate purely machine-to-machine: a human must sign in once (with `offline_access`) to mint a refresh token, which the app then persists durably and uses to refresh bearer tokens. This is the one place the "no database for v1" rule does not hold — Ask Oak needs at least a secret/KV store for the refresh token before it can call a single live tool.

**No database is required for Oisín v1.** It is stateless request/response, grounded live from GitHub; conversation history comes from Slack. The first storage worth adding is a KV for event de-duplication; a relational database (Neon) is for later feedback/analytics/audit needs.

## Details

### 1. Ask Oisín

**Grounding.** Oisín reads the OCE repo live. It attaches the official remote GitHub MCP server as a read-only tool set and lets the model fetch what each question needs: it starts from `.agent/skills/under-the-hood/SKILL-CANONICAL.md` and follows it, then reads the specific `.agent/` directives, decision records (PDRs/ADRs), `principles.md`, and planning docs the question calls for. Nothing is baked into the deploy, so every answer reflects the current `main`. It does not touch the Oak Curriculum MCP — the `oak-under-the-hood` tool only returns a pointer to the same repo skill Oisín already reads, so there is no reason to add the connector or its OAuth alpha to the path.

**Oak skills.** The LLM reads Oak skills live from `oaknational/oak-skills`, primarily `oak-tone-of-voice`. Its three principles shape every reply: make the reader the subject not Oak, use first and second person and contractions, and put the point first with plain words. This is what stops Oisín sounding like a raw model and makes it sound like Oak. `oak-skills` is currently a **private** repo (verified 2026-07-08), so Oisín's PAT must be scoped to read it too — or the tone-of-voice content mirrored into the public OCE repo, or `oak-skills` made public (its own description signals that intent).

**Message flow.**
1. A user types `@ask-oisin how does the Practice support Oak's strategy for this OKR period?`, uses `/ask-oisin` or `/ask-osian`, or messages Oisín in the assistant side-panel.
2. Slack delivers an `app_mention`, `message.channels`, slash-command, or assistant-thread event over the Events API to the app's HTTP request URL — a Next.js route handler on Vercel.
3. The `@vercel/slack-bolt` adapter acknowledges within Slack's 3-second window and hands the real work to `waitUntil`, so the function stays alive for the model-plus-tool calls. Bolt sets an assistant status ("Ask Oisín is reading the OCE repo…") via `assistant.threads.setStatus` and pulls recent thread history with `conversations.replies` for context.
4. The handler calls the AI SDK (`generateText`, or `streamText` for token-by-token output) with a Gateway model string, the GitHub MCP tools, and a system prompt that concatenates (a) Oisín's role and routing instructions, (b) where in the repo to read and to start from the under-the-hood skill, (c) a pointer to read `oak-tone-of-voice`, and (d) Slack-formatting rules.
5. Claude reads the repo live through the GitHub tools and answers. If a question is really about curriculum content, Oisín says so and points the user to Ask Oak rather than guessing.
6. The handler posts the answer into the thread as Slack `mrkdwn`, appends an LLM-generated-content disclaimer, sets the thread title, and optionally shows feedback buttons.

**De-duplicating the invocation paths.** A single `@ask-oisin` message arrives as *both* an `app_mention` event and a `message.channels` event, so the app_mention listener and the running-text matcher would both fire and answer twice. The matcher must therefore skip any message that mentions the bot's own user id (those belong to the `app_mention` listener) as well as bot/edit messages. A separate TTL KV keyed on the Slack event id guards a different failure — Slack retrying an unacknowledged event up to three times — and is not a substitute for the mention guard.

**Hosting & runtime (Vercel).** A headless Next.js app. The Slack request URL is a route handler wired to Bolt through `@vercel/slack-bolt`; the route sets `maxDuration` high enough to cover model **plus live GitHub tool** latency after the fast ack, and Fluid compute keeps the function running for `waitUntil` (default-on for new projects). Express would also run on Vercel but works against the platform — the adapter targets the Web Request object that Next route handlers use natively. Socket Mode cannot run on Vercel (no persistent connection); use HTTP in production and keep Socket Mode only for a local long-running dev process if wanted.

**AI layer.** The AI SDK routes through the Vercel AI Gateway by passing a `creator/model` string. The Gateway uses dot-separated Anthropic slugs, so use a current one — `anthropic/claude-sonnet-5` for the default internal tool, or `anthropic/claude-opus-4.8` for higher quality — not the legacy, hyphenated `claude-sonnet-4-5`. BYOK is configured once in the Vercel dashboard (zero markup, Anthropic key held by Vercel, no key in app code) or per-request via `providerOptions`. Anthropic-specific knobs (prompt caching, betas) are passed through `providerOptions` keyed by `anthropic`, not `gateway`. The Gateway's ZDR routing toggle should be **on** for an internal tool handling Oak's own material (see Persistence/Auth below and Caveats).

**Persistence.** Oisín needs none to ship. Each invocation is stateless: it reads the repo live via the GitHub MCP, calls the model, and posts back; conversation history is read from Slack with `conversations.replies`, and Bolt's default assistant-thread context store keeps thread context in Slack's own message metadata rather than a database. Its only stored secret is the GitHub PAT, an environment variable. The first storage worth adding is a small TTL key-value store for event de-duplication — Slack retries an event up to three times if it does not get a fast 2xx, so a KV keyed on the Slack event id (short TTL) stops double-answers from retries. That is KV/Redis-shaped (Upstash or Vercel KV), not relational. A relational database earns its place only for durable, queryable data — thumbs-up/down feedback, Q&A audit logs, usage analytics beyond the Gateway dashboard, or eventually a multi-workspace OAuth install store. Neon is the right fit there on Vercel: it powers Vercel's native Postgres, scales to zero when idle, branches per preview deployment, and on Fluid compute you use standard `pg` with `attachDatabasePool` from `@vercel/functions` so pooled TCP connections are reused safely. So for Oisín: no database for v1, a KV for dedup as hardening, Neon when feedback/analytics/audit become real.

**Auth / OAuth scopes.** Slack bot token scopes: `app_mentions:read`, `chat:write`, `assistant:write`, `im:history`, `im:write`, `channels:history`, and `commands`. `message.channels` is subscribed so the running-text matcher can see plain messages — a channel-wide read, so keep Oisín in only the channels that need it, and because those messages flow through the Gateway to the model, turn the ZDR toggle on. Claude is reached through the AI Gateway with an `AI_GATEWAY_API_KEY` (BYOK configured in the dashboard). GitHub is reached through the remote GitHub MCP server with a fine-grained PAT scoped to public-repo read (`GITHUB_TOKEN`). Oisín needs no Oak MCP token — its only outbound calls are to the AI Gateway, Slack, and the GitHub MCP.

### 2. Ask Oak (separate app, curriculum content)

Ask Oak is a second Slack app on the same codebase and the same Vercel + AI SDK stack. It answers curriculum questions by attaching the Oak Curriculum MCP through the AI SDK's MCP client, connecting over Streamable HTTP with an OAuth bearer token, pruning out the non-curriculum tools (`oak-under-the-hood` and the operational tools), and calling `get-curriculum-model` first as the server requires. Its system prompt loads `oak-tone-of-voice`, `oak-curriculum-principles`, `oak-lesson-builder`, and `oak-brand` (read live). 

**The OAuth alpha is Ask Oak's gating dependency, and it shapes storage.** The Oak MCP advertises OAuth 2.1 with `authorization_code` + `refresh_token` grants and PKCE (S256) — and no `client_credentials`. So a headless app cannot mint tokens machine-to-machine: a human signs in once (scope `offline_access`) to obtain a refresh token, the app persists it durably, and an `authProvider` on the transport refreshes bearer tokens from it. That means Ask Oak needs a secret/KV store on day one — the one exception to the "no database for v1" rule. Because the MCP call originates from the Vercel runtime, the tool round-trips run inside the `waitUntil` window, so its route's `maxDuration` must cover model-plus-tool latency. Everything else — invocation trio, hosting, skill-loading, the bounded tool loop — is shared with Oisín.

**Tool set — prune by denylist, not a narrow allowlist.** Ask Oak answers about lessons, units, threads, misconceptions, keywords, prior knowledge, and EEF evidence. That needs the discovery, browsing, fetching, progression/graph, and programme tool families — most of the server's surface. So expose *everything except* the known non-curriculum tools (`oak-under-the-hood`, `get-rate-limit`, `get-changelog`, `get-changelog-latest`), rather than a hand-curated allowlist that silently drops lesson-content tools (`get-lessons-summary`/`-transcript`/`-quiz`/`-assets`, `get-units-summary`, `get-threads-units`, the `get-programmes-*` set) and any curriculum tool added later. If a closed set is preferred over a denylist, enumerate the full current curriculum family explicitly and treat the list as a maintained contract.

### 3. The Oak Curriculum MCP server

The production alpha at `https://curriculum-mcp-alpha.oaknational.dev/mcp` is a Streamable HTTP MCP server using OAuth 2.1 (advertised at `/.well-known/oauth-protected-resource`, Clerk-backed authorization server; `authorization_code` + `refresh_token` grants, PKCE S256, dynamic client registration advertised), invite-only for Oak staff. It exposes resources, workflow prompts, and ~42 tools, including the project-explainer tool `oak-under-the-hood` and the curriculum tools `get-curriculum-model` (call first), `browse-curriculum`, `explore-topic`, `search`, `fetch`, `get-thread-progressions`, `get-prior-knowledge-graph`, `get-misconception-graph`, `get-eef-evidence`, and `get-keyword-graph`, plus the lessons/units/programmes/sequences fetching families — over **164 threads across 16 subjects** (verified verbatim from `get-curriculum-model`). The curriculum tools are Ask Oak's; Oisín uses none of them. The `oak-under-the-hood` tool goes unused by both bots: called directly, it returns only a resource-link pointer to `raw.githubusercontent.com/…/main/.agent/skills/under-the-hood/SKILL-CANONICAL.md` plus two public Oak URLs — Oisín gets the same content, and more (file-level planning state), by reading the repo directly through the GitHub MCP. The AI SDK's MCP client can read the server's tools, resources, and prompts, unlike Anthropic's server-side connector (tools only) — another reason both apps use the SDK client.

### 4. The repo decision instruments — status and application

**Sourcing note.** The repo is public and organised around a `.agent/` governance substrate: `.agent/directives/`, `.agent/memory/`, `.agent/state/collaboration/`, and `.agent/practice-core/decision-records/` (ADRs/PDRs). Skills live at `.agent/skills/<name>/SKILL-CANONICAL.md`. The instruments named below were confirmed in-repo on 2026-07-08: the `metacognition` and `reason` skills are present at `.agent/skills/metacognition/SKILL-CANONICAL.md` and `.agent/skills/reason/SKILL-CANONICAL.md`; `principles.md` is at `.agent/directives/principles.md` with an ordered "Decision Lenses" section; PDR-051 is confirmed ("skills are the sole invocable-workflow surface"); the continuity pipeline `capture → distil → graduate → enforce` is confirmed. There is no standalone "decision matrix" file — the matrix is a *method*, defined next.

**Decision matrix — the method.** The decision matrix is the five **`principles.md` Decision Lenses** applied *in order* (first that decisively resolves governs), run through the two reasoning skills: `/oak-metacognition` supplies the inward check (am I about to bring about the right impact? — the action-to-impact bridge) and `/oak-reason` supplies the outward structure (name the kind, frame the problem not the solution, surface the warrant and its falsifier, decide for reversibility, stress-test). The five lenses are:

1. Choose long-term architectural excellence at every decision point.
2. Strict, everywhere, all the time.
3. Could it be simpler without compromising quality or value? (the First Question)
4. Would it be simpler if the system changed?
5. Optimise for user value.

Applied to the decisions that changed:

- **The split (one app vs two).** Lens 1 favours the split: isolating Ask Oak's invite-only OAuth dependency from a ship-now app is the cleaner architectural boundary. Lenses 3–4 resist duplicated deployment, and the third option they force is the one adopted — one shared codebase, two thin app configs — capturing simplicity's intent (shared logic, one runtime) without coupling an unblocked concern to a blocked one. Lens 5: staff get Ask Oisín now, teachers get Ask Oak when the alpha opens. → two apps, one codebase.
- **Oisín's grounding (live GitHub vs vendoring vs the Oak MCP).** Lenses 1–2 favour reading the repo live: a single live source with nothing to drift, carrying file-level planning state the Oak MCP's pointer-only `oak-under-the-hood` tool cannot. Lens 4 dissolves the "which surface" question — read the repo directly through the official GitHub MCP server and the Oak MCP drops out of Oisín's path entirely. Lens 3: one credential (a read-only PAT), one tool loop. → live GitHub read via the official remote GitHub MCP server; no vendoring; no Oak MCP for Oisín.
- **Hosting and model layer (Vercel + AI Gateway).** Lens 1: the managed path buys observability and failover — operational excellence — at the cost of a proxy hop and mild, reversible lock-in. Lenses 3 and 5: it is the simplest path to put the tool in staff hands. → Vercel + AI Gateway.

**Metacognition skill — the routing driver.** Oisín must know the boundary of its own knowledge: answer project questions from the repo, and hand curriculum questions to Ask Oak rather than confabulating. Ask Oak stays in curriculum and defers project questions to Oisín.

**Reason skill — decomposition and next step.** For Oisín: read the under-the-hood skill first, then the targeted files, then decide whether the question is project (answer) or curriculum (hand off). For Ask Oak: `get-curriculum-model` first, then the specific curriculum tool, within the AI SDK's step loop.

**principles.md decision lenses.** Enumerated above and applied verbatim. (An earlier draft applied lenses called *reversibility / blast-radius / openness / simplicity*; those are decision *heuristics* from the `reason` skill and the reversibility rule, not the `principles.md` lenses — the five above are the authoritative set.)

The continuity directive still applies: capture surprising failures (alpha auth expiry, a GitHub rate-limit or PAT-scope surprise, a Gateway routing surprise) into the `capture → distil → graduate → enforce` pipeline.

### 5. Starter code skeleton (TypeScript, Next.js on Vercel, matching the monorepo's pnpm/turbo stack)

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
      - channels:history
      - commands
settings:
  event_subscriptions:
    request_url: https://ask-oisin.vercel.app/api/slack   # HTTP on Vercel (not Socket Mode)
    bot_events:
      - app_mention
      - assistant_thread_started
      - assistant_thread_context_changed
      - message.im
      - message.channels   # enables the running-text name matcher
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
CLAUDE_MODEL=anthropic/claude-sonnet-5     # current Gateway slug (dot-separated); NOT claude-sonnet-4-5
GITHUB_TOKEN=github_pat_...                # fine-grained PAT: read on the OCE repo (public) + oak-skills (private). Oisín's only repo credential.
# Ask Oak (separate app) additionally needs OAK_MCP_URL and a persisted OAuth refresh token
# (no client_credentials grant) — a secret/KV store, not just env.
```

**Shared core (`lib/core.ts`) — model layer, matcher, bounded tool loop:**
```ts
import { generateText, isStepCount } from "ai";   // v7: isStepCount (was stepCountIs in v6)

// A "creator/model" string routes through the Vercel AI Gateway (BYOK, zero markup).
// The Gateway uses dot-separated Anthropic slugs, e.g. anthropic/claude-sonnet-5.
export const MODEL = process.env.CLAUDE_MODEL!;

// All-variations name matcher for RUNNING TEXT. @ask-oisin is the one real handle; explicit
// mentions arrive as app_mention (handled there). Any other spelling typed in running text
// (canonical Oisín, accent-free Oisin, Welsh Osian, near-misses Oisîn/Osean/Ossian/Osheen)
// arrives as a plain message, so match it and route to the same handler. "ask" must precede
// the name so the bot does not answer every passing mention of the name.
export const ALIAS_RE =
  /(?:^|[\s@/])@?\/?ask[-\s]?(?:ois[íìîi]?n{1,2}|ois[eé]an|os[íìîi]?an|os[eé]an|ossian|osh(?:in|een))\b/iu;

// Both apps attach exactly one read-only MCP tool set; the model runs a bounded tool loop.
export async function ask(system: string, prompt: string, tools: Record<string, unknown>) {
  const { text } = await generateText({
    model: MODEL,
    system,
    prompt,
    tools,
    stopWhen: isStepCount(8),   // bound the tool round-trips (GitHub reads / curriculum lookups)
  });
  return text;
}
```

**Ask Oisín route handler (`app/api/slack/route.ts`):**
```ts
import { App } from "@slack/bolt";
import { createHandler } from "@vercel/slack-bolt";   // adapter: acks in 3s, runs work via waitUntil
import { createMCPClient } from "@ai-sdk/mcp";         // @ai-sdk/mcp (stable); pin the AI SDK major
import { ask, ALIAS_RE } from "@/lib/core";

export const maxDuration = 120;   // cover model + LIVE GitHub reads after the fast ack

const SYSTEM = `You are Ask Oisín (@ask-oisin), a bot — an assistant, not a person — for Oak
National Academy's Pathfinder team. You answer questions about the PROJECT: the Open Curriculum
Ecosystem repo, its approaches, the Practice, strategy, vision, and current planning state.
Read the repo LIVE with the GitHub tools — nothing is baked in. Start from
.agent/skills/under-the-hood/SKILL-CANONICAL.md and follow it, then read the specific .agent/
directives, decision records (PDRs/ADRs), principles.md, and planning docs the question needs.
For Oak's voice, read oak-tone-of-voice from the oak-skills repo. If a question is really about
curriculum CONTENT (specific lessons, threads, misconceptions), say so and point the user to the
Ask Oak app instead of guessing. Format replies as Slack mrkdwn.`;

// Official remote GitHub MCP server, read-only, repos toolset — reads the public repo live.
// No anonymous mode: a fine-grained PAT scoped to public-repo read is the only credential.
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
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  // On Vercel the adapter turns this into an HTTP handler with waitUntil (no socketMode).
});

app.event("app_mention", async ({ event, say }) => {
  const text = event.text.replace(/<@[^>]+>/g, "").trim();
  await say({ text: await ask(SYSTEM, text, tools), thread_ts: event.ts });
});

app.message(ALIAS_RE, async ({ message, context, say }) => {
  const m = message as any;
  if (m.subtype || m.bot_id) return;                            // ignore edits/other bots (no self-loop)
  if (context.botUserId && m.text.includes(`<@${context.botUserId}>`)) return;  // app_mention owns explicit mentions
  const text = m.text.replace(ALIAS_RE, " ").replace(/<@[^>]+>/g, "").trim();
  await say({ text: await ask(SYSTEM, text, tools), thread_ts: m.thread_ts ?? m.ts });
});

const slash = async ({ command, ack, respond }: any) => {       // ack within 3s, then post the answer
  await ack();
  await respond({ response_type: "in_channel", text: await ask(SYSTEM, (command.text ?? "").trim(), tools) });
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
// @vercel/slack-bolt README.
export const POST = createHandler(app /*, receiver */);
```

**Ask Oak entrypoint — the delta:** same manifest shape, hosting, and invocation trio; different system prompt, an OAuth `authProvider` that refreshes from a persisted refresh token, and the Oak MCP tool set pruned by denylist:
```ts
import { createMCPClient } from "@ai-sdk/mcp";
import { ask } from "@/lib/core";

const SYSTEM = `You are Ask Oak (@ask-oak), a bot for Oak's curriculum content. Answer questions about
lessons, units, threads, misconceptions, keywords, prior knowledge, and EEF evidence using the Oak
Curriculum tools; call get-curriculum-model first. Read oak-tone-of-voice and oak-curriculum-principles
for Oak's voice. Format replies as Slack mrkdwn.`;

// Connect to the Oak MCP from the Vercel runtime (not Anthropic's cloud). OAuth 2.1 has NO
// client_credentials grant: a human signs in once (offline_access) to mint a refresh token,
// which is persisted; authProvider refreshes bearer tokens from it.
const mcp = await createMCPClient({
  transport: {
    type: "http",
    url: process.env.OAK_MCP_URL!,
    authProvider,   // refreshes from the persisted refresh token (durable store required)
  },
});
const all = await mcp.tools();

// Curriculum content = everything EXCEPT the non-curriculum tools. A denylist (not a curated
// allowlist) picks up new curriculum tools automatically and never silently drops one.
const NON_CURRICULUM = new Set([
  "oak-under-the-hood", "get-rate-limit", "get-changelog", "get-changelog-latest",
]);
const tools = Object.fromEntries(Object.entries(all).filter(([k]) => !NON_CURRICULUM.has(k)));

// ...identical app_mention / matcher / slash / assistant-thread wiring, calling ask(SYSTEM, text, tools)
// Route sets a higher maxDuration to cover model + tool round-trips inside the waitUntil window.
```

For production, both apps: add token-by-token streaming with `streamText` + Slack's streaming methods (`chat.startStream`/`chat.appendStream`/`chat.stopStream`, or Bolt's `sayStream` helper), persist an `AssistantThreadContextStore` if you outgrow Slack-metadata context, and enable the AI Gateway ZDR toggle. Ask Oak additionally needs its OAuth refresh token in a durable store. Pin the AI SDK major version and confirm the `@vercel/slack-bolt` receiver wiring. Fluid compute is default-on for new projects; set `maxDuration` per route.

### 6. Doc references supporting each decision
- `@vercel/slack-bolt` adapter — Fluid compute + `waitUntil` to ack within Slack's 3s window while work continues; works with Next.js/Hono/Nitro; `createHandler(app, receiver)`: Vercel changelog "Build Slack agents with @vercel/slack-bolt" and the package README.
- Official remote **GitHub MCP server** — endpoint `https://api.githubcopilot.com/mcp/` (GA 2025-09-04), PAT/OAuth auth (no anonymous mode), read-only via `X-MCP-Readonly`, toolset scoping via `X-MCP-Toolsets`, Streamable HTTP: `github/github-mcp-server` `docs/remote-server.md` and `docs/server-configuration.md`.
- Slack assistant/agent pattern, `Assistant` class, assistant-thread events, `assistant:write`, status/suggested-prompt helpers; 3s ack + up-to-3 retries; slash commands + `commands` scope; `mrkdwn`; streaming via `chat.startStream`/`appendStream`/`stopStream`: Slack docs "AI in Slack apps", the Events API page, the `conversations.replies` reference, and the 2025-10 chat-streaming changelog.
- HTTP required on Vercel (Socket Mode needs a long-lived process): Slack "Comparing HTTP & Socket Mode"; Vercel serverless docs.
- Vercel AI Gateway — zero markup incl BYOK (paid tier + credits; system-credit fallback), observability/failover, ZDR routing, `providerOptions` passthrough: Vercel "AI Gateway" docs and BYOK/pricing pages.
- AI SDK model routing via `creator/model` strings and `generateText`/`streamText`; `stopWhen: isStepCount(N)` (v7 rename of `stepCountIs`): AI SDK docs and the v7 migration guide (`ai-sdk.dev`).
- AI SDK MCP client (`@ai-sdk/mcp`, `createMCPClient`, Streamable HTTP transport, OAuth `authProvider`, tools/resources/prompts): AI SDK "Model Context Protocol (MCP)" docs.
- Neon on Vercel — native Vercel Postgres, serverless driver, and Fluid-compute `pg` + `attachDatabasePool` pooling; scale-to-zero; branching: Neon "Connecting to Neon from Vercel".
- Oak tone of voice and other Oak skills: `oaknational/oak-skills`.
- Oak MCP endpoint, OAuth 2.1 (Clerk, `authorization_code` + `refresh_token`, PKCE S256, DCR), tools including `oak-under-the-hood`: `curriculum-mcp-alpha.oaknational.dev` and its `/.well-known/` metadata.

## Recommendations
1. **Host Ask Oisín as a headless Next.js app on Vercel with `@vercel/slack-bolt`.** Set the route's `maxDuration` to cover model plus live GitHub-read latency, use the HTTP request URL (no Socket Mode in production), and keep Bolt's listener ergonomics. Guard the `app_mention`/`message.channels` double-fire by skipping self-mentions in the matcher.
2. **Use the AI SDK + AI Gateway (BYOK) as the model layer, not the raw Anthropic SDK.** Configure BYOK in the Vercel dashboard, route with a current dot-separated slug (`anthropic/claude-sonnet-5`, or `claude-opus-4.8` for quality), turn on the ZDR toggle, and pin the AI SDK major (v7: `isStepCount`). Both apps: `generateText` with a bounded tool loop — Oisín with the GitHub MCP tools, Ask Oak with the Oak MCP tools.
3. **Ship Ask Oisín first, reading GitHub live, no vendoring.** Attach the official remote GitHub MCP server (read-only, `repos` toolset) via `@ai-sdk/mcp`; the only credential is a fine-grained PAT scoped to public-repo read. Instruct the model to start from the under-the-hood skill and read targeted files live.
4. **Storage: none for Oisín v1; a store for Ask Oak from day one.** Oisín grounds live and reads history from Slack; add a TTL KV for Slack event de-dup as hardening. Ask Oak must persist an OAuth refresh token (no client-credentials grant), so it needs a secret/KV store before it can call live tools. Bring in Neon only when feedback/analytics/audit or a multi-workspace install store become real — then use `pg` + `attachDatabasePool` under Fluid compute.
5. **Stand up Ask Oak as a separate app once MCP alpha credentials land.** Same codebase and stack, AI SDK MCP client, `get-curriculum-model` first, curriculum tools pruned by denylist, curriculum skills loaded, a one-time interactive sign-in for the refresh token, and an `authProvider` for refresh.
6. **Apply the decision matrix as defined in §4** — the five `principles.md` lenses run through `/oak-metacognition` and `/oak-reason` — when re-evaluating any change to this design. The `metacognition` and `reason` skills and `principles.md` are confirmed in-repo; there is no separate matrix file to read.
7. **Operate the live-read path.** Rotate the GitHub PAT on schedule, monitor the authenticated GitHub rate limit (5,000/hr) against real bot volume, and capture any drift (alpha auth expiry, PAT-scope or rate-limit surprises, Gateway routing surprises) into the continuity pipeline. There is no vendored snapshot to keep fresh — that concern is designed out.

## Caveats
- `@vercel/slack-bolt` is recent (2025); the handler signature is `createHandler(app, receiver)` (two-arg) — confirm the exact export/receiver names and wiring against its current README before relying on the skeleton.
- The remote GitHub MCP server requires a credential even for public-repo reads — there is **no anonymous mode**. The minimal credential is a fine-grained PAT with read on the OCE repo. `oak-skills` is confirmed **private** (2026-07-08), so the PAT must also be scoped to read `oak-skills`, or Oisín cannot load `oak-tone-of-voice` live — the alternative is to make `oak-skills` public (its description signals that intent) or mirror the tone-of-voice content into the public OCE repo.
- Live reads consume the authenticated GitHub REST rate limit (5,000 requests/hour per token); this is ample for internal use but is a shared budget if the PAT is reused elsewhere.
- The AI SDK MCP client is stable in `@ai-sdk/mcp` (current major v7 of `ai`; `@ai-sdk/mcp@2.x`). Pin the major and use v7 API names (`isStepCount`, not `stepCountIs`).
- AI Gateway BYOK requires the paid tier and purchased credits; a failed BYOK request falls back to Vercel system credentials billed against your balance. The team-wide ZDR toggle may carry a small per-request surcharge — confirm on the live pricing page.
- The Gateway model slug is dot-separated (`anthropic/claude-sonnet-5`); the hyphenated `claude-sonnet-4-5` is both legacy (superseded by Sonnet 5) and the wrong slug format.
- Fluid compute must be enabled (default-on for new projects) and `maxDuration` set high enough, or long model/tool calls will be cut off after the ack.
- Ask Oak's Oak MCP OAuth has **no `client_credentials` grant** — a one-time interactive `authorization_code` + PKCE sign-in with `offline_access` is required, and the resulting refresh token must be persisted durably. This is verified from the live `/.well-known/` metadata but the invite-only alpha (endpoint, tool list, scopes) may change.
- Slack streaming is real but the Web API surface is `chat.startStream`/`chat.appendStream`/`chat.stopStream` (Bolt wraps it as `sayStream`), not a single `chat.stream` method.
- Slack `mrkdwn` is not standard markdown — links are `<url|text>`, and there are no headings or tables; format replies accordingly.
- The running-text matcher needs `message.channels`, a channel-wide read whose messages flow through the Gateway to the model; keep each app in only the channels that need it and keep ZDR on. The `/ask-osian` slash command is the narrower-scope alias.
- Two apps mean two manifests, two bot users, and two token sets to rotate; the shared codebase keeps the maintenance cost to configuration, not logic.
