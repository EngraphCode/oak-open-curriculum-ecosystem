---
status: permanent-dated-record
date: 2026-07-28
subject: claude-directory-submission
source: owner-captured screenshots, .agent/reference-local/claude-submission/ (all 20 read)
identity: Squall wakes Apex / claude-code / 459fd1 (Director)
---

# Claude directory submission — complete field and requirement inventory

Discharges MCP-296. The owner walked both flows and captured them; this records what the
**forms actually demand**, which outranks every documentation summary including our own MCP-16
table and MCP-106's 22 July capture. All fifteen connector and five plugin screenshots read.

**Two separate submissions, different directories, different forms:**

| | Connector | Plugin |
| --- | --- | --- |
| URL | `claude.ai/admin-settings/directory/submissions/new` | `.../submissions/plugins/new` |
| Scope | Remote MCP servers only | Plugins for Claude Code & Cowork |
| Steps | 11 | 3 |
| Nature | Connectors Directory | Plugin Directory — "community-driven", separate and complementary |

Both: **submitting does not guarantee inclusion**; Anthropic reviews every submission. The
plugin form adds "during spin up there may be delays in release into the directory."

## Blocking and decision-grade findings

### 1. Acknowledgement 5 is currently false — BLOCKING

Compliance requires ticking: *"Tool descriptions contain no instructions about model behavior,
other tools, or external instruction sources, and no hidden or encoded text."*

Our live descriptions, read by the form at step 3, include **"PREREQUISITE: You MUST call
`get-curriculum-model` first to understand the curriculum…"** on Browse Curriculum and Explore
Topic. That is an instruction about model behaviour *and* about another tool. Either the
descriptions change before submission or the box cannot honestly be ticked. The reviewer reads
the same text.

### 2. The slug is permanent and currently says "internal preview" — ONE-WAY DOOR

Listing step: **Name** is prefilled "Oak Curriculum App (internal preview)" and **Slug** is
`oak-curriculum-app-internal-preview`, described as *"Permanent after submission. Lowercase
letters, numbers, and hyphens. Pre-filled from the name."*

Submitting as-is permanently brands the directory entry "internal preview". Everything else on
the listing "can be edited after you submit" — the slug cannot. **Fix the Name before
submitting so the slug derives correctly.**

### 3. Authentication may make the Clerk DCR decision unnecessary

Five modes; ours is set to **OAuth 2.0 + DCR** (review summary shows `oauth_dcr`), which the
form confirms is *"supported out of the box — no further action needed."* But it adds:

> For high-traffic servers, prefer CIMD or Anthropic-held credentials — **DCR registers a new
> client per user connection.**

That is MCP-271's sprawl risk, stated by Anthropic. The third mode — **OAuth 2.0 with
Anthropic-held client credentials** ("Anthropic stores a static `client_id` (and secret if
needed) on your behalf") — would mean no DCR at all, removing the entire reason to enable it on
Oak's production Clerk instance. Decide before flipping anything in production. Static bearer
tokens for directory servers are in beta via `mcp-review@anthropic.com`.

### 4. The URL is whichever custom connector is selected, verified live at submission

Step 2 requires the server already connected as a custom connector in the submitting account:
*"We use this live connection to verify the URL and tool list at submission time."* Currently
`https://curriculum-mcp-alpha.oaknational.dev/mcp`. Submitting the canonical address means
adding **that** as a custom connector first, serving the final tool surface.

Review summary confirms what is captured: Transport `streamable-http`, Authless `No`, **"40
tools captured from your live connection"**, Server URL type `universal`.

### 5. Every tool is missing its `title` annotation

Step 3 flags **11 suggestions**, including "Missing annotations: title" on Browse Curriculum,
Download Asset, and Explore Topic. Tools correctly carry `idempotent`; the surface is all
read-only. Mechanical fix.

### 6. No screenshot or carousel requirement exists in either flow

Confirmed across all eleven connector steps and all three plugin steps: **no image upload, no
count, no dimensions, no carousel.** The owner's challenge was correct. MCP-293 should be
closed on this evidence.

### 7. Auto-listing is not what the form says

Step 1 states Anthropic reviews every submission for quality, safety, and policy compliance and
*"may reach out for additional information before a decision is made."* Step 9 adds: *"We
reserve the right to manually review all servers."* The review buffer is real.

## Connector form — all eleven steps

1. **Introduction** — no fields. Remote MCP servers only; local servers go to Desktop
   Extensions or plugins, which "work in Cowork and show up separately in the directory."
2. **Connection** — select an already-connected custom connector; optional URL configuration.
3. **Tools** — read-only display, read live. Ours: 40 tools, 6 resources, 11 suggestions.
4. **Listing** — *"appears on your connector's directory page and can be edited after you
   submit"* (except the slug):
   - **Name\*** · **Slug\*** (permanent, lowercase/numbers/hyphens, prefilled from name)
   - **One-liner\*** (max 200 chars) · **Description\*** (max 2000 chars, shown on claude.ai)
   - **Categories\*** (at least one, up to 5)
   - Author name (shown "by …") · Author URL — *or* company name + `https://` website
   - Icon — defaults to the MCP server's favicon; custom URL optional; leaving unset recommended
   - **Documentation\*** · **Support\*** (URL or email) · **Privacy policy\***
5. **Use cases** — **Primary use cases\*** (main tasks + example prompts) · **Connection
   requirements\*** (accounts/permissions/setup needed) · **Read/write capabilities\***
   (read only / write only / read and write) → ours `read_only`.
6. **Company** — **Company name\*** · **Company website\*** · Primary contact **Full name\***,
   **Email\*** (prefilled from the Claude account), Role, Anthropic contact (both optional).
7. **Authentication** — **mode\***: OAuth 2.0 + DCR · OAuth 2.0 + Client ID Metadata Document ·
   OAuth 2.0 with Anthropic-held client credentials · Custom URL or credentials at connection
   time · No authentication (authless).
8. **Data handling** — **API ownership\*** (we own / proxy a partner's with permission /
   third-party we don't control — the last *"typically blocks listing"*) → ours `first_party` ·
   **Personal health data\*** → `no` · **Sponsored or promoted content\*** — sponsored,
   promoted and advertising content is **prohibited** in directory connectors.
9. **Test & launch** — *"Provide clear test-account setup and access instructions… write these
   instructions so they contain every link, credential, and step needed to autonomously access
   the MCP server. For enterprise accounts or servers that require a fully populated account,
   provide test credentials that grant access to a fully populated account for review."*
   Fields: **Test setup instructions** (textarea, no asterisk) · **Self-tested** checkbox — *"I
   have run every tool via MCP Inspector or as a custom connector in Claude"* (currently No).
10. **Compliance** — seven acknowledgements, **all required**: developer guidelines read ·
    first-party APIs (or legitimately proxied) · no financial asset transfers · no AI
    image/video/audio generation · **no model-behaviour or other-tool instructions in tool
    descriptions, no hidden or encoded text** · no conversation data beyond function · public
    docs live by publish date. Plus **Additional notes** (optional free text) — *"anything else
    the review team should know."* **This is where the Elasticsearch architecture note goes.**
11. **Review** — full summary plus per-field validation, then **Submit for review**.

**Outstanding required fields at the owner's capture** (from the Review page): One-liner,
Description, Author (or company website), Categories, Documentation, Support URL, Privacy
policy, Company website, Use cases, Connection requirements, and all policy acknowledgements.
Already satisfied: company name, primary contact, contact email, read/write, API ownership,
personal health data, sponsored content, authentication mode.

## Plugin form — all three steps

1. **Introduction** — **authorisation checkbox\***: authorises Anthropic to contact us and
   process the submission under its Privacy Policy; agrees to the Software Directory Terms;
   submitted information is displayed in the Plugin Directory and may appear within Claude Code.
2. **Plugin information**
   - **Link to plugin\*** — *"The URL to your plugin repository"* (e.g. a GitHub repo)
   - Plugin homepage — public homepage or docs site (optional)
   - **Plugin name\*** — *"check your name is not already taken. You may not use brand names
     you do not own"*
   - **Plugin description\*** · **Example use cases\***
3. **Submission details**
   - **Platforms\*** — Claude Code and/or Claude Cowork; *"test that the plugin works with
     these surfaces before submitting"*
   - License type (optional — MIT, Apache 2.0, proprietary, etc.)
   - Privacy policy URL (optional)
   - **Submitter email\*** (prefilled)

Note the plugin form asks for a **repository URL**, which bears on the owner's preference to
home the plugin as a workspace in this monorepo — a repo link is satisfiable either way, but
the plugin must be locatable and installable from it.

## Owner answers already on the record

- **Sponsored/promoted content**: answered "Other — links back to original content on
  www.thenational.academy in some cases." Honest. Worth a second look: linking to our own source
  content is arguably not sponsored, promoted, or advertising content in the sense the policy
  prohibits, and a plain "No" may be both accurate and less likely to invite a reviewer query.
  Owner's call.
- **API ownership**: `first_party` — correct. The MCP server queries our own Elasticsearch
  cluster with its own server-side credentials, and curriculum content comes from our own API.
  The consuming assistant never contacts Elasticsearch.

*Recorded by Squall wakes Apex (Director, agent).*
