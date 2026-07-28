---
status: permanent-dated-record
date: 2026-07-28
subject: claude-directory-submission
source: owner-captured screenshots, .agent/reference-local/claude-submission/
identity: Squall wakes Apex / claude-code / 459fd1 (Director)
---

# Claude directory submission — field and requirement inventory

Discharges MCP-296. The owner walked both submission flows himself and captured them; this
records what the **forms actually demand**, which outranks every documentation summary,
including our own MCP-16 verdict table and MCP-106's 22 July capture.

**There are TWO separate submissions** (owner, 2026-07-28), and they are different directories
with different forms:

| | Connector | Plugin |
| --- | --- | --- |
| URL | `claude.ai/admin-settings/directory/submissions/new` | `.../submissions/plugins/new` |
| What | Remote MCP servers | Plugins for Claude Code & Cowork |
| Steps | 11 | 3 |
| Directory | Connectors Directory | Plugin Directory (community-driven, "separate and complementary") |

Both state plainly: **submitting does not guarantee inclusion**, and Anthropic reviews every
submission. The plugin flow adds "during spin up there may be delays in release into the
directory."

## Findings that change our plan

### 1. Acknowledgement 5 may be false against our current tool descriptions — BLOCKING

Compliance requires ticking: *"Tool descriptions contain no instructions about model behavior,
other tools, or external instruction sources, and no hidden or encoded text."*

Our served descriptions, read live by the form at step 3, include: **"PREREQUISITE: You MUST
call `get-curriculum-model` first to understand the curriculum…"** — on Browse Curriculum and
Explore Topic at least. That is an instruction about model behaviour *and* about another tool.

This cannot be waved through: the acknowledgement is a declaration we make, and the reviewer
reads the same descriptions we do. Either the descriptions change before submission, or the
box cannot honestly be ticked. **This is the sharpest finding in the inventory.**

### 2. Every tool is missing its `title` annotation

Step 3 reads tools live from the connected server and flags **11 suggestions**, including
"Missing annotations: title" on Browse Curriculum, Download Asset, and Explore Topic (visible
in the capture; likely all 40). Tools are correctly `idempotent` and the surface is all
read-only, which the form recognises. Titles are a concrete, mechanical fix.

### 3. Authentication has an option that may make the Clerk DCR decision unnecessary

Step 7 offers five modes. Ours is set to **OAuth 2.0 + Dynamic Client Registration**, and the
form confirms it is *"supported out of the box — no further action needed."* But it adds:

> For high-traffic servers, prefer CIMD or Anthropic-held credentials — **DCR registers a new
> client per user connection.**

That is the client-sprawl concern of MCP-271, stated by Anthropic. And the third option —
**OAuth 2.0 with Anthropic-held client credentials** ("Anthropic stores a static `client_id`
(and secret if needed) on your behalf") — would mean **no DCR at all**, which is the entire
risk surface MCP-270/271 exists to manage on Oak's production Clerk instance.

Worth deciding deliberately before enabling DCR in production. Also noted: static bearer
tokens for directory servers are in beta via `mcp-review@anthropic.com`.

### 4. The submitted URL is whichever custom connector is selected — and it is verified live

Step 2 requires the server to already be connected as a **custom connector in the submitting
account**, and states: *"We use this live connection to verify the URL and tool list at
submission time."* Oak's is currently wired as "Oak Curriculum App (internal preview)" at
`https://curriculum-mcp-alpha.oaknational.dev/mcp`.

So submitting the canonical `www.thenational.academy/mcp` requires adding **that** as a custom
connector first. The tool surface is read from the live server at submission — the final
surface must be deployed and serving before we submit.

### 5. No screenshot or carousel requirement appears in the connector flow

The owner challenged where the carousel requirement came from. Across the eleven connector
steps captured, **no screenshot upload, count, or dimension requirement appears**. The listing
step asks for categories, author, icon, and links — not images. MCP-293 should be corrected or
closed on this evidence unless a screenshot field appears in a step not captured.

### 6. Auto-listing is not what the form says

Our prior held that community-tier auto-listing was now the default. Step 1 states Anthropic
**reviews every submission** for quality, safety, and policy compliance and *"may reach out for
additional information before a decision is made."* Treat the review buffer as real.

## Connector form — the eleven steps

1. **Introduction** — no fields. Remote MCP servers only; local servers go to Desktop
   Extensions or plugins, which "work in Cowork and show up separately in the directory."
2. **Connection** — pick the already-connected custom connector. Optional URL configuration.
3. **Tools** — read-only display of tools/resources read live. Ours: 40 tools, 6 resources, 11
   suggestions. Review descriptions, parameters, annotations; this is what the listing and
   Claude will see.
4. **Listing** — Categories\* (up to 5); Author name (shown as "by …"); Author URL (defaults to
   company); Icon (defaults to the MCP server's favicon — recommended to leave unset; custom
   URL optional); Links: Documentation\*, Support\* (URL or email), Privacy policy\*.
   *No slug field observed.*
5. **Use cases** — Primary use cases\* (main tasks + example prompts a user might type);
   Connection requirements\* (accounts/permissions/setup needed before connecting); Read/write
   capabilities\* (Read only / Write only / Read and write) — **Read only** is correct for us.
6. **Company** — Company name\*; Company website\*; Primary contact Full name\*, Email\*
   (prefilled from the Claude account), Role, Anthropic contact (optional).
7. **Authentication** — mode\*, five options (see finding 3).
8. **Data handling** — API ownership\* (We own the API / proxy a partner's with permission /
   third-party we don't control — the last "typically blocks listing"); Personal health data\*;
   Sponsored or promoted content\* — sponsored/promoted/advertising content is **prohibited** in
   directory connectors.
9. **Test & launch** — not captured in detail.
10. **Compliance** — seven required acknowledgements: developer guidelines read; first-party
    APIs (or legitimately proxied); no financial asset transfers; no AI image/video/audio
    generation; **no model-behaviour or other-tool instructions in tool descriptions, no hidden
    or encoded text**; no conversation data beyond function; public docs live by publish date.
    Plus **Additional notes** (optional, free text) — *"anything else the review team should
    know."* **This is where the Elasticsearch architecture note goes** (owner direction).
11. **Review** — not captured in detail.

Step badges observed mid-fill: Listing 6 issues, Use cases 2, Company 1 — the form counts
unmet requirements per step, so it self-reports readiness.

## Plugin form — the three steps

1. **Introduction** — authorisation checkbox\*: authorises Anthropic to contact us and process
   the submission under its Privacy Policy, and agrees to the Software Directory Terms;
   submitted information is displayed in the Plugin Directory and may appear within Claude Code.
2. **Plugin information** — Plugin homepage (public homepage or docs site); Plugin name\*
   (**must not already be taken; may not use brand names you do not own**); Plugin description\*;
   Example use cases\*.
3. **Submission details** — not captured in detail.

## What this leaves open

- Connector steps 9 and 11, and plugin step 3, are not captured. The remaining screenshots in
  `connector-submission/` (11.40.21, 11.40.52, 11.41.52, 11.42.27, 11.42.35) and
  `plugin-submission/` (11.52.05, 11.52.21, 11.52.27) were not read for this pass.
- Whether the "Missing annotations: title" flag applies to all 40 tools or a subset.
- The plugin's own definition location — the owner prefers a workspace in this repo.

## Owner answers already on the record

- **Sponsored/promoted content** was answered "Other — links back to original content on
  www.thenational.academy in some cases." Honest, and worth a second look: linking to our own
  source content is arguably not sponsored, promoted, or advertising content in the sense the
  policy prohibits, and a plain "No" may be both accurate and less likely to invite a reviewer
  query. Owner's call.
- **API ownership**: "We own the API" — correct. The MCP server queries our own Elasticsearch
  cluster with our own credentials, and curriculum content comes from our own API.

*Recorded by Squall wakes Apex (Director, agent).*
