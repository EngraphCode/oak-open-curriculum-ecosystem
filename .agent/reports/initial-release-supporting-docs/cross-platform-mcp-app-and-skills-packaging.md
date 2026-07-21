# Cross-Platform Packaging of a Standards-Compliant MCP App and Agent Skills

**Target ecosystems:** Claude, ChatGPT, Gemini Apps, and Microsoft 365 Copilot  
**Status date:** 20 July 2026  
**Implementation constraint:** the interactive interface must use the open MCP Apps standard only. No ChatGPT-specific UI API is required or assumed.  
**Explicitly out of scope:** GitHub Copilot, Gemini CLI, Codex-specific packaging, and a separate ChatGPT Apps SDK implementation.

---

## Executive decision

There is no single cross-vendor plugin package that can be installed unchanged in Claude, ChatGPT, Gemini Apps, and Microsoft 365 Copilot.

The viable architecture is one standards-based product core with thin, generated host-specific distribution artifacts:

```text
Portable product core
├── Public remote MCP server
├── Standards-compliant MCP Apps UI
├── Canonical Agent Skills directories
└── Shared schemas, authentication, documentation, and compliance material

Generated distribution outputs
├── Claude public plugin repository
├── OpenAI plugin-submission bundle
├── Gemini Spark installation kit
├── Microsoft Copilot Cowork package
└── Microsoft declarative-agent package or deployment profile
```

The portable core should be authoritative. Host packages should be generated from it rather than maintained as independent implementations.

The cross-platform contract is:

1. **Every operation is an ordinary MCP tool.**
2. **Every tool returns a complete conversational result without requiring a UI.**
3. **The MCP App is an optional interactive representation of that result.**
4. **Every reusable workflow is authored once as a canonical Agent Skill.**
5. **Host-specific manifests, review material, and installers are generated around those standards.**

This provides genuine interoperability at the tool, workflow, and—where supported—interactive-UI layers. It does not provide identical installation or marketplace behaviour across vendors.

---

## 1. Current support position

| Ecosystem and surface | Remote MCP tools | Standard MCP Apps UI | Agent Skills | Distribution position |
|---|---:|---:|---:|---|
| **Claude web / Desktop** | Yes | Yes | Skills are supported in the Claude ecosystem | MCP client connection plus Claude packaging where applicable |
| **Claude Cowork / Claude Code** | Yes through bundled connectors | Yes where the host supports MCP Apps | Yes, as plugin components | Public GitHub plugin submitted to the Claude Plugin Directory |
| **ChatGPT** | Yes | Yes; OpenAI explicitly supports the open MCP Apps bridge | Yes through OpenAI plugin submissions | Submit the public MCP server and skill bundle through the OpenAI plugin portal |
| **Gemini Apps / Gemini Spark** | Yes, but currently only for eligible Gemini Spark users | **Not documented** | Yes, but currently only in Gemini Spark and with substantial plan and regional restrictions | Users connect the MCP URL and upload skills separately |
| **Microsoft 365 Copilot declarative agents** | Yes | Yes | Not the primary skill-packaging surface | MCP server-based plugin attached to a declarative agent |
| **Microsoft Copilot Cowork** | Yes through `agentConnectors` | Treat separately from the declarative-agent UI profile | Yes through `agentSkills` | Microsoft 365 app package distributed privately or through the Microsoft 365 App Store |

The official [MCP Apps overview](https://modelcontextprotocol.io/extensions/apps/overview) describes the standard UI mechanism. The official [MCP extension support matrix](https://modelcontextprotocol.io/extensions/client-matrix) currently lists Claude, ChatGPT, and Microsoft 365 Copilot as MCP Apps clients. Gemini is not listed.

### Important parity limits

“Works across all major AI apps” must be defined as follows:

- **Tools and core workflows:** supported wherever the relevant host currently exposes custom MCP and skills.
- **Interactive MCP Apps UI:** supported in Claude, ChatGPT, and Microsoft 365 Copilot; not currently documented for Gemini Apps.
- **Skill format:** portable at the file-format level, but installation, availability, execution environment, and account eligibility differ.
- **Public discovery:** available through Claude, OpenAI, and Microsoft publication paths; Google’s current public documentation describes user-side connection and upload rather than a general third-party marketplace submission flow.
- **Geographical reach:** Gemini’s current feature restrictions prevent a global four-platform claim.

---

## 2. Standards baseline

### 2.1 MCP Apps

[MCP Apps](https://modelcontextprotocol.io/extensions/apps/overview) is an official MCP extension for interactive HTML interfaces rendered inside compatible MCP hosts.

The core pattern is:

1. An MCP tool descriptor declares `_meta.ui.resourceUri`.
2. The URI points to a `ui://` resource containing HTML, JavaScript, and CSS.
3. The host renders the resource in a sandboxed iframe.
4. The UI and host communicate using JSON-RPC over `postMessage`.
5. Standard `ui/*` messages and ordinary MCP calls such as `tools/call` provide interaction.

MCP Apps is opt-in and negotiated between client and server. Host support and optional capabilities vary, so the UI must use capability detection and graceful degradation.

### 2.2 Agent Skills

The canonical skill format should follow the [Agent Skills specification](https://agentskills.io/specification).

A skill is a directory containing at least `SKILL.md`:

```text
skill-name/
├── SKILL.md
├── references/       # optional
├── scripts/          # optional
└── assets/           # optional
```

The specification requires YAML frontmatter followed by Markdown instructions. At minimum:

- `name`: 1–64 characters; lowercase letters, numbers, and hyphens; no leading, trailing, or consecutive hyphens; must match the parent directory name.
- `description`: 1–1024 characters; explains both what the skill does and when it should be used.

The optional `allowed-tools` field is experimental and may not be implemented consistently. It should not be relied upon in the canonical cross-platform skill.

### 2.3 What remains host-specific

The following are not standardized across the target vendors:

- plugin manifest schema;
- marketplace metadata and review workflow;
- package layout outside the skill directories;
- installation and update lifecycle;
- organisation-level deployment;
- authentication registration details;
- host-specific permissions and confirmations;
- plugin signatures, provenance, and dependency handling;
- public directory eligibility rules.

Consequently, the standards should be canonical and the marketplace packages should be adapters.

---

## 3. Recommended source repository

```text
product/
├── apps/
│   ├── mcp-server/
│   │   ├── src/
│   │   └── package.json
│   └── mcp-ui/
│       ├── src/
│       └── package.json
│
├── packages/
│   ├── contracts/
│   │   ├── tool-inputs.ts
│   │   ├── tool-results.ts
│   │   └── ui-state.ts
│   ├── authentication/
│   └── shared/
│
├── skills/
│   ├── produce-analysis/
│   │   ├── SKILL.md
│   │   ├── references/
│   │   └── assets/
│   └── perform-workflow/
│       ├── SKILL.md
│       └── references/
│
├── distributions/
│   ├── claude/
│   ├── openai-submission/
│   ├── gemini-install-kit/
│   ├── microsoft-cowork/
│   └── microsoft-declarative-agent/
│
├── compliance/
│   ├── privacy-policy.md
│   ├── terms.md
│   ├── support.md
│   ├── security.md
│   ├── data-flow.md
│   ├── retention-policy.md
│   ├── reviewer-account.md
│   ├── starter-prompts.md
│   ├── release-notes.md
│   └── tests/
│       ├── positive-cases.yaml
│       └── negative-cases.yaml
│
├── scripts/
│   ├── validate-skills.mts
│   ├── generate-distributions.mts
│   ├── validate-links.mts
│   └── test-host-profiles.mts
│
└── dist/
    ├── claude/
    ├── openai-submission/
    ├── gemini-install-kit/
    ├── microsoft-cowork/
    └── microsoft-declarative-agent/
```

### Source-of-truth rules

- `apps/mcp-server/` is the only implementation of operations and business logic.
- `apps/mcp-ui/` is the only interactive interface implementation.
- `skills/` is the only authored skill tree.
- `packages/contracts/` owns stable tool-result and UI-state schemas.
- `compliance/` owns public policies, reviewer material, and test fixtures.
- `distributions/` contains templates and generation logic, not separately authored copies of skills.
- `dist/` contains disposable build output.

---

## 4. Universal MCP server design

Use one public production endpoint, for example:

```text
https://product.example/mcp
```

### 4.1 Transport and availability

Use:

- public HTTPS;
- Streamable HTTP;
- currently supported TLS and certificate chains;
- deterministic JSON schemas;
- `tools/list` and `tools/call`;
- stable tool names;
- production monitoring and useful failure responses.

Anthropic’s [Software Directory Policy](https://support.claude.com/en/articles/13145358-anthropic-software-directory-policy) says remote MCP servers should support Streamable HTTP and that SSE is transitional. Microsoft’s [Copilot Cowork plugin guide](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/cowork-plugin-development) requires Streamable HTTP over HTTPS with TLS 1.2 or later for Cowork connectors.

### 4.2 Complete non-UI results

Every operation must return a complete human-readable result and stable structured data. The UI must never be the only place where meaning is communicated.

Conceptually:

```ts
{
  content: [
    {
      type: "text",
      text: "A complete human-readable account of the result."
    }
  ],
  structuredContent: {
    // Complete, versioned machine-readable result
  }
}
```

This allows:

- tools-only hosts to remain useful;
- Gemini to provide the full workflow without an MCP Apps renderer;
- accessibility and audit tooling to consume a text result;
- the MCP App to reconstruct its view from deterministic data;
- future clients to render their own native interfaces.

### 4.3 Tool descriptors

A portable descriptor should include precise descriptions, schemas, annotations, and optional MCP Apps metadata:

```ts
{
  name: "analyse_records",
  description:
    "Analyses the records selected by the user and returns findings, " +
    "supporting evidence, uncertainties, and recommended next actions. " +
    "Use only when the user explicitly asks for analysis of those records.",
  inputSchema: {
    type: "object",
    properties: {
      recordIds: {
        type: "array",
        items: { type: "string" },
        description: "Identifiers of records the user selected for analysis."
      }
    },
    required: ["recordIds"],
    additionalProperties: false
  },
  outputSchema: {
    type: "object",
    properties: {
      findings: { type: "array", items: { type: "object" } },
      summary: { type: "string" }
    },
    required: ["findings", "summary"],
    additionalProperties: false
  },
  annotations: {
    title: "Analyse records",
    readOnlyHint: true,
    destructiveHint: false,
    openWorldHint: false,
    idempotentHint: true
  },
  _meta: {
    ui: {
      resourceUri: "ui://product/analysis-results"
    }
  }
}
```

Apply these rules:

- Keep tool names at or below 64 characters, as required by Anthropic’s [directory policy](https://support.claude.com/en/articles/13145358-anthropic-software-directory-policy).
- Make descriptions narrow, unambiguous, and explicit about invocation conditions.
- Describe every input field.
- Return structured output when it improves reliability.
- Set `readOnlyHint`, `destructiveHint`, `openWorldHint`, `idempotentHint`, and `title` accurately where applicable.
- Do not use annotations as a substitute for server-side authorisation or user confirmation.
- Do not refer to host-generated tool names such as `mcp__server__tool` inside canonical skills.

OpenAI’s [plugin submission guide](https://learn.chatgpt.com/docs/submit-plugins) requires accurate `readOnlyHint`, `openWorldHint`, and `destructiveHint` values. Anthropic requires applicable annotations, particularly `readOnlyHint`, `destructiveHint`, and `title`. Microsoft Cowork uses `readOnlyHint`, `destructiveHint`, and `title` to determine confirmation behaviour and treats missing safety annotations conservatively.

### 4.4 Errors and response size

Errors should state:

- what failed;
- whether anything changed;
- whether retrying is safe;
- what the user or administrator can do next;
- a stable machine-readable error code.

Avoid generic failures such as “Something went wrong.” Anthropic requires graceful errors and useful feedback and also requires token use to be proportionate to the task.

### 4.5 Privacy and result hygiene

Tool results must not expose:

- access or refresh tokens;
- API keys or credentials;
- internal debug dumps;
- unnecessary personal information;
- undisclosed user-related fields;
- internal identifiers that are not needed by the user or UI;
- unredacted third-party data outside the user’s request.

OpenAI’s [submission guidance](https://learn.chatgpt.com/docs/submit-plugins) explicitly calls for removing unnecessary personal data, authentication secrets, debug payloads, internal identifiers, and undisclosed user-related fields from tool responses.

### 4.6 Authentication

For the broadest compatibility, prefer standards-based OAuth with Dynamic Client Registration where the service model permits it.

Recommended baseline:

- OAuth 2.x authorisation-code flow with PKCE;
- Dynamic Client Registration where supported;
- short-lived access tokens;
- refresh-token rotation;
- least-privilege scopes;
- revocation;
- no secrets in skills, UI resources, manifests, logs, or tool results;
- separate reviewer/test tenants and credentials;
- explicit support for each host’s redirect and registration requirements.

Relevant current requirements include:

- Anthropic requires secure OAuth 2.0 with certificates from recognised authorities for authenticated remote MCP services in its directory policy.
- Gemini Spark can use Dynamic Client Registration; users can enter credentials in advanced settings when the server does not support DCR. See Google’s [custom apps for Gemini Spark](https://support.google.com/gemini/answer/17209137?co=GENIE.Platform%3DDesktop&hl=en) documentation.
- Microsoft MCP plugins support Entra SSO, DCR, OAuth 2.0 authorisation code, and anonymous access; API-key authentication is not supported for MCP plugins in declarative agents. See Microsoft’s [plugin authentication matrix](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/plugin-authentication).
- Microsoft Cowork packages also document token-vault connector configurations. Keep the Cowork packaging choice separate from the declarative-agent authentication profile.

---

## 5. Standards-compliant MCP Apps UI

### 5.1 Non-negotiable portability rules

The canonical UI should use only the MCP Apps standard:

- `_meta.ui.resourceUri`;
- a `ui://` resource;
- an HTML resource using the MCP App media profile;
- the standard `ui/*` JSON-RPC bridge over `postMessage`;
- ordinary `tools/call` for server operations;
- standard host capability and context methods;
- feature detection and fallbacks.

OpenAI explicitly recommends this approach in [MCP Apps compatibility in ChatGPT](https://developers.openai.com/apps-sdk/mcp-apps-in-chatgpt): start with `_meta.ui.resourceUri` and the `ui/*` bridge, and use `window.openai` only for optional ChatGPT-specific capabilities.

For this product, do **not** make `window.openai` part of the implementation contract. No separate ChatGPT UI implementation is required.

### 5.2 Marketplace terminology versus implementation

OpenAI’s submission system calls an MCP-backed plugin component an “app,” even when custom UI is optional. That is submission terminology. It does not require an Apps SDK-specific implementation.

The OpenAI package for this product should therefore be understood as:

```text
OpenAI marketplace description: MCP-backed app plus skills
Actual implementation:         standard MCP server plus standard MCP Apps UI plus Agent Skills
```

Do not submit an existing ChatGPT app identifier. OpenAI’s [submission guide](https://learn.chatgpt.com/docs/submit-plugins) instructs publishers to submit the production MCP server URL and review material directly.

### 5.3 Lowest-common-denominator UI design

For maximum host compatibility:

- bundle JavaScript and CSS into the UI resource where practical;
- avoid runtime CDN dependencies;
- avoid host-specific global objects;
- make external operations through MCP tools rather than directly from the iframe;
- do not place long-lived credentials in the browser;
- reconstruct UI state from `structuredContent`;
- preserve complete text output for non-UI clients;
- make the UI keyboard accessible;
- provide textual labels and non-visual status feedback;
- tolerate missing optional host capabilities;
- avoid product-name branching.

### 5.4 Content security policy

Declare the smallest exact Content Security Policy required by the app. Prefer no direct client-side network access; proxy necessary operations through MCP tools.

OpenAI’s [submission requirements](https://learn.chatgpt.com/docs/submit-plugins) require the CSP to identify the exact domains the UI fetches from.

### 5.5 Microsoft-specific host constraints

Microsoft 365 Copilot supports standard MCP Apps inside declarative agents, but its support matrix does not include every optional capability. The current [Microsoft MCP Apps documentation](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/plugin-mcp-apps) shows, among other differences, that file upload, modal requests, partial tool input, teardown notifications, and several metadata fields are unavailable.

Therefore:

- negotiate or inspect capabilities before use;
- provide inline alternatives to modal-only interactions;
- do not require host-mediated file upload;
- do not require partial tool-input streaming;
- treat full-screen as optional;
- test component sizing and context updates independently.

Microsoft renders each widget under a server-specific origin of the form:

```text
{hashed-mcp-domain}.widget-renderer.usercontent.microsoft.com
```

The server and identity provider must permit the documented Microsoft origins and redirect URLs. Use the current values in Microsoft’s [MCP Apps documentation](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/plugin-mcp-apps) rather than hard-coding values copied from this document indefinitely.

### 5.6 Gemini fallback

Google’s current Gemini Apps documentation describes standard MCP server connections and skill uploads but does not document MCP Apps rendering. Gemini is also absent from the official [MCP Apps client matrix](https://modelcontextprotocol.io/extensions/client-matrix).

For Gemini:

- leave normal MCP Apps metadata on the tools;
- assume the UI will not render;
- return complete text and structured data;
- ensure the skills do not tell the user to rely on an embedded widget;
- expose every UI action as an ordinary MCP tool or conversational workflow.

---

## 6. Canonical Agent Skills

### 6.1 Directory structure

```text
skills/
└── produce-analysis/
    ├── SKILL.md
    ├── references/
    │   ├── methodology.md
    │   └── output-contract.md
    └── assets/
        └── report-template.md
```

Example `SKILL.md`:

```markdown
---
name: produce-analysis
description: >
  Produces an evidence-backed analysis using the product MCP tools.
  Use when the user asks for a comparison, investigation, assessment,
  synthesis, or formal analytical report.
license: Apache-2.0
metadata:
  version: "1.0.0"
---

# Produce an analysis

1. Establish the decision or outcome the user is trying to support.
2. Use the product MCP tools to retrieve only the necessary evidence.
3. Separate evidence, inference, uncertainty, and recommendation.
4. Follow `references/output-contract.md`.
5. Use an interactive result view when the host provides one, but communicate
   the complete result in the conversation.
```

### 6.2 Authoring rules

Follow the [Agent Skills specification](https://agentskills.io/specification) and these cross-platform constraints:

- one coherent job per skill;
- precise activation wording in `description`;
- lowercase kebab-case name matching the directory;
- concise `SKILL.md`, with detail moved to `references/`;
- only relative file references;
- no deeply nested chains of references;
- no secrets or tenant-specific credentials;
- no dynamic download of behavioural instructions;
- no hidden, encoded, or obfuscated guidance;
- no dependency on one host’s generated MCP tool prefix;
- no required use of the experimental `allowed-tools` field.

### 6.3 Scripts

Scripts are permitted by the Agent Skills format, but they are the least portable component.

Do not make a local skill script essential to the workflow. Instead:

```text
Not portable:
SKILL.md -> run scripts/analyse.py -> call external service

Portable:
SKILL.md -> call analyse_records MCP tool
```

This is especially important because Google’s [Gemini Skills documentation](https://support.google.com/gemini/answer/17094296?co=GENIE.Platform%3DDesktop&hl=en) states that skill scripts cannot perform actions or requests on external websites. Browser-based hosts may also provide no general local execution environment.

Scripts may remain optional accelerators for compatible desktop or coding environments, but the canonical workflow must succeed without them.

### 6.4 Cross-platform file limits

Use a conservative shared baseline that fits all target packages:

- plain-text companion files only where possible;
- no binary files in the Gemini skill ZIP;
- no more than 20 companion files per skill;
- no more than 5 MB per companion file;
- no more than 10 MB of companions per skill;
- no hidden files;
- no absolute paths or `..` traversal;
- safe, portable filenames;
- keep the complete skill package well below Gemini’s 100 MB upload maximum;
- keep the main instructions below about 5,000 tokens and preferably below 500 lines.

The 20-file, 5 MB, and 10 MB limits come from Microsoft’s [Copilot Cowork packaging guide](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/cowork-plugin-development). Gemini’s [skill upload guide](https://support.google.com/gemini/answer/17094296?co=GENIE.Platform%3DDesktop&hl=en) accepts plain-text-based files, rejects binary/rich-media formats, and sets a 100 MB total upload limit.

---

## 7. Claude distribution

### 7.1 Package shape

Generate a public plugin repository such as:

```text
claude-plugin/
├── .claude-plugin/
│   └── plugin.json
├── .mcp.json
├── skills/
│   ├── produce-analysis/
│   │   ├── SKILL.md
│   │   └── references/
│   └── perform-workflow/
│       └── SKILL.md
├── SETUP.md             # optional documented setup skill/convention
├── README.md
└── LICENSE
```

Anthropic’s official [Claude plugins repository](https://github.com/anthropics/claude-plugins-official) documents the standard package elements: `.claude-plugin/plugin.json`, optional `.mcp.json`, optional `commands/`, `agents/`, and `skills/`, and `README.md`.

Use a stable plugin slug. Anthropic’s official repository states that the marketplace `name` is immutable after publication; change `displayName` for presentation changes rather than renaming the slug.

### 7.2 Submission route

Anthropic’s [plugin submission documentation](https://claude.com/docs/plugins/submit) currently requires:

- a public GitHub repository;
- no closed-source plugin package;
- `claude plugin validate` before submission;
- an eligible Claude.ai Team or Enterprise role, or an eligible Console role;
- submission through the Claude.ai or Console form.

After publication, changes pushed to the GitHub repository are mirrored and automatically screened. A new submission form is not required for each update.

The Plugin Directory is separate from the Connectors Directory. It serves Cowork and Claude Code. Community submissions receive basic automated review; “Anthropic Verified” involves additional review but is not guaranteed.

### 7.3 MCP setup guidance

Anthropic documents an optional `SETUP.md` skill for guiding Claude through connection and configuration of bundled MCP servers. Use it only for transparent setup instructions. Do not put secrets in it and do not use it to fetch dynamic behavioural instructions.

Anthropic also encourages plugins to use connectors already present in the Connectors Directory or supplied by well-known developers. For a first-party server, demonstrate control of the endpoint, domain, UI, and resources.

### 7.4 Anthropic Software Directory Policy requirements

The [Anthropic Software Directory Policy](https://support.claude.com/en/articles/13145358-anthropic-software-directory-policy), dated 15 April 2026, should be treated as a product-level requirement, not only submission paperwork.

#### Safety and privacy

The software must:

- comply with Anthropic’s usage rules and supported-region requirements;
- not bypass safeguards, system instructions, or sandboxes;
- collect only context necessary for its function;
- not collect extraneous conversation data, including for logging;
- protect personal and sensitive data;
- respect intellectual-property rights.

The policy also states that directory software must not query or extract data from Claude memory, chat history, conversation summaries, or user-generated or uploaded files.

**Design consequence:** if the product’s intended Claude workflow processes user-uploaded files, do not assume ordinary user consent resolves this clause. Obtain written clarification or permission from Anthropic, alter the workflow, or exclude that capability from the Claude directory submission.

#### Instruction and activation behaviour

Tools and skills must:

- use narrow and unambiguous descriptions;
- say what they do and when they should be invoked;
- accurately match real functionality;
- avoid naming or triggering conflicts with other directory software;
- not coerce Claude into invoking unrelated external tools or resources;
- not interfere with other installed software;
- not direct Claude to pull behavioural instructions dynamically from external sources;
- contain no hidden, obfuscated, or encoded behavioural instructions.

#### Developer and review material

Provide:

- a clear public privacy policy explaining collection, use, and retention;
- verified product-support and security contacts;
- product, purpose, setup, and troubleshooting documentation;
- a standard reviewer account with sample data;
- at least three working prompts or use-case examples;
- evidence of control over connected endpoints, domains, interfaces, and rendered resources;
- an ongoing maintenance and incident-response process.

#### Unsupported directory use cases

Unless Anthropic gives written permission, its current policy excludes software whose relevant capabilities include:

- transferring money, cryptocurrency, or other financial assets, or executing financial transactions for users;
- standalone AI image, video, or audio generation as the primary service, subject to the documented allowance for design-oriented visual aids;
- advertisements, sponsored content, paid placement, or use primarily as an advertising vehicle.

#### MCP-specific requirements

The server must:

- handle errors gracefully and provide useful feedback;
- be token-frugal;
- keep tool names at 64 characters or fewer;
- use secure OAuth 2.0 and recognised certificates when an authenticated remote service is involved;
- provide applicable annotations, particularly `readOnlyHint`, `destructiveHint`, and `title`;
- support Streamable HTTP for remote MCP.

---

## 8. ChatGPT distribution

### 8.1 Implementation boundary

There should be no ChatGPT-specific UI implementation in the source tree.

Do not require:

- `window.openai`;
- OpenAI-only tool-result metadata;
- a ChatGPT app ID;
- a separate ChatGPT Apps SDK UI;
- a UI action with no ordinary MCP equivalent.

Use the standard implementation described by OpenAI’s [MCP Apps compatibility guide](https://developers.openai.com/apps-sdk/mcp-apps-in-chatgpt).

### 8.2 Submission terminology

OpenAI’s [plugin submission guide](https://learn.chatgpt.com/docs/submit-plugins) defines a plugin as:

- skills only;
- an MCP-backed app, with custom UI optional; or
- an MCP-backed app plus skills.

For this product, choose the MCP-plus-skills route. The “app” is the same standards-compliant MCP server and optional MCP Apps UI used by the other hosts.

### 8.3 Submission bundle

Generate a review bundle such as:

```text
dist/openai-submission/
├── skills.zip
├── listing.md
├── starter-prompts.md
├── positive-tests.yaml
├── negative-tests.yaml
├── reviewer-notes.md
├── reviewer-account.md
├── release-notes.md
├── csp-domains.txt
└── assets/
    └── logo.svg
```

The production MCP endpoint itself is submitted through the portal rather than embedded as a special ChatGPT implementation.

### 8.4 OpenAI submission requirements

The current [OpenAI plugin submission documentation](https://learn.chatgpt.com/docs/submit-plugins) requires or asks publishers to prepare:

- Apps Management write permission for the submitter;
- a verified individual or business identity;
- plugin name, short and long descriptions, logo, category, website, support URL, privacy-policy URL, and terms URL;
- a public production MCP server URL;
- authentication details and reviewer-ready credentials where needed;
- exact Content Security Policy domains;
- accurate tool metadata and annotations;
- the final skill file tree or ZIP;
- starter prompts;
- exactly five positive test cases;
- exactly three negative test cases;
- country or region availability;
- release notes and policy attestations.

Reviewer credentials must allow the submitted tests to run without MFA, SMS confirmation, email confirmation, or private-network access.

### 8.5 Domain verification

When requested by the portal, host the exact verification token at:

```text
https://<challenge-base-host>/.well-known/openai-apps-challenge
```

The endpoint must return only the token—not JSON, a token list, or unrelated content. The challenge host must be the MCP hostname or an allowed parent origin. Account for hostname collisions when multiple submissions use the same MCP host.

### 8.6 Tool review

Before submission:

- scan the production server through the portal;
- verify every tool name, description, schema, and output shape;
- ensure each annotation matches real behaviour;
- remove unnecessary personal data and internal fields from results;
- test the exact skill bundle being uploaded;
- make starter prompts demonstrate real high-value workflows;
- make negative tests demonstrate refusal, clarification, or safe fallback.

After approval, publication is an explicit publisher action in the portal.

---

## 9. Gemini Apps distribution

### 9.1 Current implementation scope

Google’s [custom apps for Gemini Spark](https://support.google.com/gemini/answer/17209137?co=GENIE.Platform%3DDesktop&hl=en) documentation allows an eligible user to enter a standards-compliant MCP server URL in the Gemini web app. Once connected, the custom Connected App is available in Gemini Spark on both the web and mobile apps.

Google’s [Gemini Skills documentation](https://support.google.com/gemini/answer/17094296?co=GENIE.Platform%3DDesktop&hl=en) allows users to create or upload skills for Gemini Spark.

These are separate user-side installation steps. Generate an installation kit rather than a vendor marketplace package:

```text
dist/gemini-install-kit/
├── skills.zip
├── CONNECT-MCP.md
├── INSTALL-SKILLS.md
├── PRIVACY.md
├── TERMS.md
└── SUPPORT.md
```

### 9.2 Custom MCP eligibility and availability

As of 20 July 2026, Google documents custom Connected Apps for Spark as requiring:

- access to Gemini Spark;
- age 18 or over;
- location in the United States;
- a personal Google Account rather than a work or school account;
- Keep Activity enabled;
- English;
- connection through the Gemini web app.

The connected app is then usable in Gemini Spark on mobile and web. Google requires manual confirmation for write actions and warns that third-party MCP servers are outside Google’s control.

### 9.3 Skill eligibility and availability

As of the same date, Google documents Gemini Skills as requiring:

- Gemini Spark;
- age 18 or over;
- a personal Google Account;
- a Google AI Ultra subscription;
- Keep Activity enabled;
- English.

Google also states that skills are unavailable in Australia, Canada, the European Economic Area, Hong Kong, India, Japan, Nigeria, South Korea, Switzerland, and the United Kingdom.

**Practical consequence:** the full MCP-plus-skills Gemini experience is not currently available to UK users and cannot be described as global.

### 9.4 Skill upload format

Gemini accepts:

- a single `SKILL.md`; or
- a ZIP containing `SKILL.md` in the root folder.

The skill name must be lowercase with hyphen-separated words. Companion files must be plain-text-based; binary formats such as PDF, DOCX, XLSX, JPEG, and PNG are not supported. The complete upload may not exceed 100 MB. Scripts cannot perform external website actions or requests.

### 9.5 MCP Apps UI status

Google’s current public support pages do not document MCP Apps UI rendering for Gemini Apps, and Gemini is absent from the current official [MCP Apps client matrix](https://modelcontextprotocol.io/extensions/client-matrix).

Treat Gemini as:

```text
MCP tools                Supported for eligible Gemini Spark users
Agent Skills             Supported for eligible Gemini Spark users
Text result              Required and complete
Structured result        Required and complete
MCP Apps embedded UI     Unverified; do not depend on it
Public marketplace       No general route identified in current public documentation
```

Do not remove the MCP Apps metadata from the server; simply ensure nothing depends on it being rendered.

---

## 10. Microsoft 365 Copilot distribution

Microsoft currently exposes two relevant but distinct extension surfaces. Build two deployment profiles from the same source.

### 10.1 Profile A: Copilot Cowork package

Microsoft’s [Copilot Cowork plugin guide](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/cowork-plugin-development) packages skills and remote connectors in a Microsoft 365 app package.

Generate:

```text
dist/microsoft-cowork/
├── manifest.json
├── color.png              # 192 x 192
├── outline.png            # 32 x 32
└── skills/
    ├── produce-analysis/
    │   ├── SKILL.md
    │   └── references/
    └── perform-workflow/
        └── SKILL.md
```

Use Microsoft 365 Unified App Manifest version 1.28 while that remains the documented target.

A representative connector section is:

```json
{
  "agentConnectors": [
    {
      "id": "product-mcp",
      "displayName": "Product",
      "description": "Access Product data and operations",
      "toolSource": {
        "remoteMcpServer": {
          "mcpServerUrl": "https://product.example/mcp",
          "authorization": {
            "type": "OAuthPluginVault",
            "referenceId": "<registration-id>"
          }
        }
      }
    }
  ]
}
```

When the server supports DCR, Microsoft documents an option to omit the connector’s authentication object and let Cowork register a client.

Current Cowork package constraints include:

- maximum 20 skills per package;
- maximum 10 connectors per package;
- maximum 20 companion files per skill;
- maximum 5 MB per companion file;
- maximum 10 MB total companions per skill;
- Streamable HTTP over HTTPS with TLS 1.2 or later;
- `tools/list` for dynamic discovery, recommended;
- `tools/call` for invocation;
- structured output;
- accurate safety annotations.

Packages can be sideloaded, published to a tenant catalogue, or submitted through Partner Center to the Microsoft 365 App Store.

### 10.2 Claude-to-Microsoft conversion

Microsoft publishes a Claude-plugin conversion path. Its [Cowork guide](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/cowork-plugin-development) says the converter reads:

- `.claude-plugin/plugin.json`;
- `.mcp.json`;
- `skills/`.

It copies skill directories verbatim, maps MCP servers to `agentConnectors`, and creates the Microsoft manifest and package. Claude commands, sub-agents, hooks, settings, and executables are not currently converted into Microsoft manifest equivalents.

Use this converter as a compatibility check, not as the sole authoritative build system. A deterministic generator in the source repository should own production output.

### 10.3 Profile B: declarative agent with MCP plugin and UI

Microsoft’s [plugin overview](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/overview-plugins) states that plugins are supported as actions within declarative agents and are not enabled directly in the base Microsoft 365 Copilot orchestrator.

Microsoft’s [MCP Apps documentation](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/plugin-mcp-apps) describes the route for rendering standard MCP Apps widgets:

```text
Microsoft 365 app package
└── declarative agent
    └── MCP server-based plugin
        ├── ordinary MCP tools
        └── standard MCP Apps UI resources
```

Create a separate deployment profile for this surface. It may be possible to co-distribute related capabilities within a wider Microsoft 365 application, but do not merge the Cowork and declarative-agent outputs until the current manifest schema and target-tenant behaviour have been validated end to end.

### 10.4 Microsoft authentication distinction

For MCP plugins in declarative agents, Microsoft’s [authentication documentation](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/plugin-authentication) currently lists:

- Microsoft Entra SSO: supported;
- Dynamic Client Registration: supported;
- OAuth 2.0 authorisation code: supported;
- API key: not supported;
- anonymous: supported where appropriate, with production security considered separately.

The Cowork packaging guide also documents token-vault connector options, including API-key storage. Treat these as surface-specific capabilities. Use OAuth or DCR as the common production baseline.

---

## 11. Unified compliance baseline

Adopt the strictest applicable requirement across the target vendors.

| Area | Cross-platform baseline |
|---|---|
| **Transport** | Public HTTPS and Streamable HTTP |
| **Authentication** | OAuth with DCR where possible; short-lived, least-privilege tokens |
| **Tool names** | 64 characters or fewer |
| **Descriptions** | Narrow, explicit, truthful, and clear about invocation conditions |
| **Schemas** | Complete input descriptions; stable structured output where useful |
| **Annotations** | Accurate `title`, `readOnlyHint`, `destructiveHint`, `openWorldHint`, and `idempotentHint` where applicable |
| **Results** | Complete text plus stable structured content; UI never required |
| **UI** | Pure MCP Apps standard; capability detection; exact CSP |
| **Errors** | Specific, actionable, safe, and explicit about side effects |
| **Privacy** | Minimum necessary context and data only |
| **Secrets** | Never in skill files, UI resources, manifests, logs, or tool results |
| **Instructions** | Human-readable and packaged; no dynamic behavioural instruction retrieval |
| **Skills** | Canonical Agent Skills; concise, scoped, and script-independent |
| **Writes** | Explicit user intent, accurate destructive/open-world hints, host confirmations, and server-side authorisation |
| **Review account** | Representative sample data and no MFA, email, SMS, or private-network dependency where OpenAI review requires it |
| **Documentation** | Setup, intended use, privacy, terms, support, security, troubleshooting, and data flow |
| **Testing** | Shared contract suite plus host-specific acceptance tests |
| **Provenance** | Controlled domains, endpoints, interfaces, and rendered resources |
| **Maintenance** | Monitored production endpoint, supported upgrade path, and documented incident response |

### Compliance files to maintain centrally

```text
compliance/
├── privacy-policy.md
├── terms.md
├── support.md
├── security.md
├── data-flow.md
├── retention-policy.md
├── reviewer-account.md
├── starter-prompts.md
├── release-notes.md
└── tests/
    ├── positive-cases.yaml
    └── negative-cases.yaml
```

Generate host-specific text from these files, but preserve one approved source for every policy and statement.

---

## 12. Build and release pipeline

A release should be produced from one command:

```text
pnpm release
├── validate source schemas
├── build MCP server
├── bundle MCP Apps UI
├── validate MCP protocol behaviour
├── validate Agent Skills
├── run security and secret scans
├── run privacy/result-field checks
├── run tools-only contract tests
├── run MCP Apps protocol tests
├── generate Claude package
├── generate OpenAI review bundle
├── generate Gemini installation kit
├── generate Microsoft Cowork package
├── generate Microsoft declarative-agent package
├── validate host manifests
├── validate all source links
└── create signed release artefacts and checksums
```

### Versioning

Version independently but traceably:

- server API version;
- tool schema version;
- structured-result schema version;
- MCP App UI bundle version;
- each skill version;
- each host package version.

Every distribution artefact should record the exact source commit and compatible server/schema versions.

### Change control

Treat these as breaking changes unless compatibility is deliberately retained:

- tool removal or rename;
- input-schema narrowing;
- output-field removal or semantic change;
- change from read-only to write behaviour;
- new destructive or open-world effects;
- change in authentication scope;
- skill activation broadening;
- UI dependence on a newly optional host capability;
- data-retention or third-party-processing change.

---

## 13. Test strategy

### 13.1 Universal host profiles

Every release should pass:

```text
tools-only
no-ui
full-mcp-apps
no-client-side-network
authenticated-user
expired-token
revoked-token
read-only-operation
reversible-write
irreversible-write
open-world-write
large-result
partial-upstream-failure
rate-limited
user-cancelled
malformed-input
skill-trigger-positive
skill-trigger-negative
```

### 13.2 Core acceptance criteria

For every tool:

- a model can understand from the descriptor when to call it;
- the input schema rejects invalid ambiguity rather than guessing;
- the output includes a useful text result;
- the structured result validates against its schema;
- the operation works when the host does not render an MCP App;
- annotations match observed effects;
- errors say whether any mutation occurred;
- no credentials, debug data, or unnecessary personal data are returned;
- repeated idempotent calls behave as declared;
- authorisation is rechecked server-side.

For every MCP App:

- it initialises through the standard bridge;
- it renders from structured result data;
- it has no `window.openai` dependency;
- it tolerates missing optional capabilities;
- it makes server operations through MCP tools;
- it observes the declared CSP;
- it works using keyboard navigation and readable labels;
- its important state is reflected in model-visible or server-side state rather than only in ephemeral DOM state.

For every skill:

- the name and directory match;
- the description triggers on intended prompts;
- the description does not trigger on negative cases;
- all referenced files exist;
- no forbidden paths, hidden files, binaries, or secrets are present;
- the workflow completes without a required local script;
- the workflow does not require the embedded UI;
- the workflow calls stable MCP tool names;
- behavioural instructions are static and human-readable.

### 13.3 Host-specific acceptance tests

#### Claude

- run `claude plugin validate`;
- install from the public test repository;
- verify `.mcp.json` setup and OAuth;
- exercise at least three documented prompts;
- verify the reviewer account and sample data;
- confirm policy-sensitive data flows, especially any file-processing behaviour;
- verify updates from the repository do not break the immutable plugin slug.

#### ChatGPT

- scan the production MCP server in the portal;
- verify domain challenge and exact CSP;
- execute exactly five positive and three negative review cases;
- verify reviewer credentials require no MFA, SMS, email, or private network;
- verify the UI uses only the standard MCP Apps bridge;
- inspect every result for unnecessary personal or internal data.

#### Gemini Spark

- connect the MCP server through the web app;
- verify availability in mobile Spark after connection;
- upload the final `skills.zip`;
- run the same workflows with no embedded UI;
- verify no skill requires external script activity;
- document account, subscription, language, and regional restrictions prominently.

#### Microsoft Copilot Cowork

- validate the v1.28 package;
- validate `agentSkills` and `agentConnectors`;
- sideload into a test tenant;
- verify tool confirmation behaviour from annotations;
- test DCR or token-vault authentication;
- test package removal and update behaviour;
- verify skill and companion-file limits.

#### Microsoft declarative agent

- verify the MCP plugin is attached to the declarative agent;
- test tool discovery and authenticated calls;
- permit the Microsoft widget host origin in CORS;
- verify the standard MCP App renders;
- test every optional UI capability with feature detection;
- confirm the experience remains useful when the widget fails or is unavailable.

---

## 14. Distribution deliverables

A production release should generate these deliverables.

### Claude

```text
claude-plugin-repository/
├── .claude-plugin/plugin.json
├── .mcp.json
├── skills/
├── SETUP.md
├── README.md
└── LICENSE
```

### OpenAI submission

```text
openai-submission/
├── skills.zip
├── listing.md
├── starter-prompts.md
├── positive-tests.yaml
├── negative-tests.yaml
├── reviewer-notes.md
├── reviewer-account.md
├── release-notes.md
├── csp-domains.txt
└── assets/logo.svg
```

### Gemini Spark

```text
gemini-install-kit/
├── skills.zip
├── CONNECT-MCP.md
├── INSTALL-SKILLS.md
├── PRIVACY.md
├── TERMS.md
└── SUPPORT.md
```

### Microsoft Copilot Cowork

```text
microsoft-cowork.zip
├── manifest.json
├── color.png
├── outline.png
└── skills/
```

### Microsoft declarative agent

```text
microsoft-declarative-agent.zip
├── Microsoft 365 app manifest
├── declarative-agent definition
├── MCP plugin configuration
├── authentication references
├── color.png
└── outline.png
```

The exact Microsoft declarative-agent file layout should be generated from the current Microsoft schema and validated with the current Agents Toolkit rather than frozen from an old example.

---

## 15. Release-readiness checklist

### Portable core

- [ ] One public production MCP endpoint exists.
- [ ] Streamable HTTP is enabled.
- [ ] OAuth/DCR behaviour is documented and tested by host.
- [ ] Every tool has stable schemas and complete result text.
- [ ] Every tool returns structured data where useful.
- [ ] Every tool has accurate annotations.
- [ ] No tool name exceeds 64 characters.
- [ ] No workflow requires an MCP Apps renderer.
- [ ] No workflow requires a host-specific UI global.
- [ ] The UI uses `_meta.ui.resourceUri` and the standard `ui/*` bridge.
- [ ] The UI has an exact CSP and no unnecessary network access.
- [ ] Secrets and internal debug data are absent from results.

### Skills

- [ ] Skills validate against the Agent Skills format.
- [ ] Names match directories and use lowercase kebab-case.
- [ ] Descriptions state what and when.
- [ ] The final tested file tree is used for every host package.
- [ ] No required script needs internet access.
- [ ] Companion files fit Microsoft and Gemini limits.
- [ ] No binary files are required in the Gemini bundle.
- [ ] Instructions are human-readable and not dynamically fetched.
- [ ] Positive and negative trigger tests pass.

### Claude

- [ ] Repository is public.
- [ ] `claude plugin validate` passes.
- [ ] Plugin slug is final and stable.
- [ ] Privacy, support, security, and troubleshooting pages are public.
- [ ] Reviewer account and sample data work.
- [ ] At least three working prompt examples are documented.
- [ ] All endpoints and rendered resources are controlled by the publisher.
- [ ] Anthropic’s uploaded-file restriction has been assessed explicitly.
- [ ] The product is not in an unsupported directory category without written permission.

### ChatGPT

- [ ] Submitter has Apps Management write access.
- [ ] Publisher identity is verified and matches listing material.
- [ ] Production MCP URL is used.
- [ ] Domain challenge endpoint returns only the token.
- [ ] CSP contains exact required domains.
- [ ] Reviewer credentials work without MFA, SMS, email, or private network.
- [ ] Five positive and three negative cases are complete.
- [ ] Starter prompts and release notes are complete.
- [ ] The exact final skill ZIP was tested.
- [ ] Tool outputs contain no unnecessary personal, secret, debug, or internal fields.

### Gemini Spark

- [ ] Installation guide states current US, account, plan, age, activity, and language requirements.
- [ ] Skill guide states current regional exclusions, including the UK.
- [ ] MCP connection is tested from Gemini web and then mobile Spark.
- [ ] `skills.zip` has `SKILL.md` at its root.
- [ ] Skill files are plain-text-based and within size limits.
- [ ] No skill depends on external script actions.
- [ ] All workflows remain complete without MCP Apps UI.

### Microsoft 365 Copilot

- [ ] Cowork package uses the current supported manifest schema.
- [ ] Icons have the required dimensions.
- [ ] Skill and connector package limits are respected.
- [ ] DCR or token-vault authentication is configured correctly.
- [ ] Declarative-agent plugin uses a supported MCP authentication scheme.
- [ ] MCP plugin is attached to a declarative agent rather than assumed available globally.
- [ ] Microsoft widget-host CORS origin is permitted.
- [ ] Unsupported MCP Apps capabilities have fallbacks.
- [ ] Tenant sideload and public-store packages both validate.

---

## 16. Final recommendation

Build and govern the product as:

```text
One canonical implementation
├── Remote MCP server
├── Standard MCP Apps UI
├── Standard Agent Skills
├── Stable schemas
└── Shared policy and review material

Five generated delivery outputs
├── Claude plugin repository
├── OpenAI submission bundle
├── Gemini installation kit
├── Microsoft Cowork package
└── Microsoft declarative-agent package/profile
```

This is the strongest currently supportable interpretation of cross-platform packaging:

- **one server implementation;**
- **one UI implementation;**
- **one authored skill tree;**
- **multiple thin distribution adapters;**
- **full non-UI fallback;**
- **host-specific review and policy compliance.**

Do not market identical four-platform UI or availability until Google documents MCP Apps rendering and removes the current Gemini Spark eligibility and regional restrictions. Do not market a Microsoft plugin as globally active in base Microsoft 365 Copilot; current Microsoft documentation places MCP plugins inside declarative agents, with Cowork using its own package model.

---

## Direct original-source index

### Open standards

- [MCP Apps overview — Model Context Protocol](https://modelcontextprotocol.io/extensions/apps/overview)
- [MCP extension support matrix — Model Context Protocol](https://modelcontextprotocol.io/extensions/client-matrix)
- [Agent Skills specification](https://agentskills.io/specification)

### OpenAI / ChatGPT

- [MCP Apps compatibility in ChatGPT — OpenAI Developers](https://developers.openai.com/apps-sdk/mcp-apps-in-chatgpt)
- [Submit plugins — ChatGPT Learn](https://learn.chatgpt.com/docs/submit-plugins)

### Anthropic / Claude

- [Anthropic Software Directory Policy](https://support.claude.com/en/articles/13145358-anthropic-software-directory-policy)
- [Submitting your plugin — Claude documentation](https://claude.com/docs/plugins/submit)
- [Official Claude plugins repository](https://github.com/anthropics/claude-plugins-official)
- [Create plugins — Claude Code documentation](https://code.claude.com/docs/en/plugins)
- [Plugins reference — Claude Code documentation](https://code.claude.com/docs/en/plugins-reference)

### Google / Gemini Apps

- [Connect and manage custom apps for Gemini Spark](https://support.google.com/gemini/answer/17209137?co=GENIE.Platform%3DDesktop&hl=en)
- [Create and manage skills for Gemini Apps](https://support.google.com/gemini/answer/17094296?co=GENIE.Platform%3DDesktop&hl=en)
- [Write effective skills for Gemini Apps](https://support.google.com/gemini/answer/17102773?hl=en)

### Microsoft 365 Copilot

- [MCP apps in Microsoft 365 Copilot](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/plugin-mcp-apps)
- [Plugins for Microsoft 365 Copilot](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/overview-plugins)
- [Configure authentication for MCP and API plugins](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/plugin-authentication)
- [Build plugins for Copilot Cowork](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/cowork-plugin-development)
