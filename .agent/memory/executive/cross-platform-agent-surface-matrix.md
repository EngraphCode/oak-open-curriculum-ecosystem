# Cross-Platform Agent Surface Matrix

Operational truth for supported and unsupported agent platform mappings
in this repository. When the Practice Core or local docs reference
platform support, this file is the authoritative local source.

For what each platform itself supports, the platform's **official
documentation is the only source of truth** — feature support varies by
platform and changes rapidly, and in-repo adapter shapes (including this
matrix's rows) reflect when they were written, not necessarily what the
platform currently supports or requires. Before asserting that a feature
exists or that an adapter shape is correct on platform X, check the
current official docs; never generalise across platforms or treat in-repo
precedent as a substitute.

## Copilot CLI: Target Versus Wired

The owner-ratified target is **GitHub Copilot CLI running locally** as an equal
first-class Practice citizen. A target row is not an implementation claim.
GitHub Copilot coding-agent/cloud execution is outside this matrix's Copilot
scope.

| Surface | Ratified local-CLI target | Wired and proven in this repository |
| --- | --- | --- |
| Identity | Native `sessionStart` adapter returns honest Copilot identity through `additionalContext` | **No** — canonical identity types and persistence do not yet admit Copilot |
| Deliberate team join | Native bootstrap is useful alone; `oak-start-right-team` explicitly opens claims, heartbeat, watcher, and lifecycle | **No** — no Copilot launcher or joined/non-joined proof |
| Repo instructions | `.github/copilot-instructions.md` imports the canonical repository entry point | **Partial** — the file exists as a Markdown link to `AGENT.md`, not a validated native import |
| Path-scoped instructions | Generated `.github/instructions/**/*.instructions.md` projections | **No** |
| Skills | Use `.agents/skills/` under documented `.github/skills` → `.agents/skills` → `.claude/skills` first-found precedence | **Partial** — the portable wrappers exist; clean local Copilot CLI discovery/invocation is not yet an acceptance gate |
| Custom agents | Generated, schema-valid `.github/agents/*.agent.md` projections from canonical specialists | **No** |
| Policy hooks | Existing inherited PascalCase `PreToolUse` activation feeds exactly one closed Claude/Copilot dispatcher and one canonical policy evaluation | **Partial** — the inherited activation and guards now evaluate Copilot CLI 1.0.75 string-form `apply_patch` payloads with explicit allow/deny decisions; the ratified closed dispatcher, complete schemas, per-host rendering, and acceptance proof remain unwired |
| Settings | `.github/copilot/settings.json` only for documented, tested project settings | **No** |
| Repository MCP | Establish a canonical secret-free server manifest from total dispositions over tracked platform candidates, then generate the Copilot repository projection | **No** — no canonical manifest or tracked Copilot projection exists |
| Communications | Existing local comms substrate plus native wake, re-arm, drain recovery, handoff, and retirement | **No** — the substrate exists, but no Copilot notification/lifecycle projection is wired |
| End-to-end proof | Fresh-checkout validators plus a live local Copilot CLI acceptance run | **No** |

The repository
[`first-class-copilot-cli-practice-citizenship`](../../plans/strategic/first-class-copilot-cli-practice-citizenship.plan.md)
node and its serving delivery plans are authoritative for target and mechanism.
MCP-150, MCP-154, MCP-155, and MCP-156 are supplementary Linear projections
for execution state and sensitive details.

## Adapter Families

| Surface        | Cursor              | Claude Code                                            | Gemini / Antigravity CLI                          | GitHub Copilot CLI                                   | Codex                                                    | `.agents/`             |
| -------------- | ------------------- | ------------------------------------------------------ | ------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------- | ---------------------- |
| **Skills**     | `.agents/skills/`   | `.claude/skills/`                                      | `.agents/skills/`                                 | `.agents/skills/` exists; acceptance target above    | `.agents/skills/oak-*/` loaded as native Codex skills    | `.agents/skills/`      |
| **Commands**   | retired; workflows use `.agents/skills/` | retired; workflows use `.claude/skills/` | `review-*.toml` transitional reviewer adapters only; workflows use `.agents/skills/` | no separate command projection | built-in slash commands; repo workflows use skills | repo workflows use `.agents/skills/oak-*/` |
| **Rules**      | `.cursor/rules/`    | `.claude/rules/`                                       | entry-point chain only                            | partial repo entry point; modular projection target  | entry-point chain; no project execpolicy `.rules` wired  | `.agents/rules/`       |
| **Sub-agents** | `.cursor/agents/`   | `.claude/agents/`                                      | native `/agents` upstream; no repo wrappers wired | native custom agents documented; repo target unwired | `.codex/config.toml` → `.codex/agents/*.toml`             | unsupported            |
| **Hooks**      | canonical policy guard unsupported; `.cursor/hooks.json` has tracked soft `sessionStart` identity | `.claude/settings.json` (tracked soft `SessionStart` identity plus `PreToolUse` guards) | supported upstream; no project-local hook wired | native hooks documented; Copilot-only adapters target unwired; content policy uses inherited activation | tracked project `SessionStart`; no `PreToolUse` guard | unsupported |
| **MCP**        | user-local          | user-local / MCP config                                | supported upstream; no `.agents/mcp_config.json` wired | repository config documented; tracked projection target | two tracked project servers in `.codex/config.toml`       | `.agents/mcp_config.json` target |

## Hook Support

Claude Code currently has a soft native `SessionStart` identity adapter plus
native `PreToolUse` activation for Bash, Edit, and Write calls via the tracked
project `.claude/settings.json`. The command and content guards are backed by
the canonical policy in `.agent/hooks/policy.json` and prebuilt runtime
artefacts, invoked through the verdict shim
`.claude/hooks/run-pretooluse-guard.mjs` so a built-but-broken artefact blocks
the tool call (exit 2), while a not-built artefact fails open (exit 0) with a
loud, logged warning so a fresh checkout is not bricked — well within the
per-tool-call hook timeout. Local additive overrides, when needed, live in
`.claude/settings.local.json`.

Status by platform:

- **Claude Code**: tracked project `.claude/settings.json` activates a soft
  `SessionStart` identity adapter and `PreToolUse` command/content guards.
- **Cursor**: tracked project `.cursor/hooks.json` activates a soft
  `sessionStart` identity adapter. The canonical command/content policy is not
  activated for Cursor, and this Codex-focused research pass did not reassess
  Cursor's broader current upstream event set.
- **Gemini / Antigravity CLI**: native hooks are documented through
  `hooks.json` under the workspace `.agents/` directory or global config, with
  `PreToolUse`, `PostToolUse`, `PreInvocation`, `PostInvocation`, and `Stop`
  events. This repository has no project-local `.agents/hooks.json` wired.
- **GitHub Copilot CLI**: native hooks are documented, including
  `sessionStart`, `preToolUse`, `notification`, `agentStop`, and `sessionEnd`.
  This repository has no native `.github/hooks` activation wired. For MCP-150
  content enforcement, the ratified target is the existing inherited PascalCase
  `.claude/settings.json` `PreToolUse` activation feeding an exact-one
  Claude/Copilot dispatcher, not a second GitHub activation. That activation
  and the current guards are proven to evaluate Copilot CLI 1.0.75 string-form
  `apply_patch` payloads with explicit allow/deny decisions. The complete
  Copilot schemas and renderer, exact-one closed dispatcher, and end-to-end
  acceptance target are not yet wired.
- **Codex**: lifecycle hooks are stable in Codex CLI `0.145.0`. The tracked
  `.codex/config.toml` enables hooks and registers a soft `SessionStart`
  identity-context adapter. The official event surface includes
  `SessionStart`, `SessionEnd`, `SubagentStart`, `SubagentStop`, `PreToolUse`,
  `PermissionRequest`, `PostToolUse`, `PreCompact`, `PostCompact`,
  `UserPromptSubmit`, and `Stop`. The repository does not yet activate the
  canonical command/content guard on Codex `PreToolUse`.

The Codex product claims and event list above inherit their version pin,
source-authority boundary, and evidence grades from the
[Codex CLI capability catalogue](../../reports/agentic-engineering/codex-cli-agentic-capability-catalogue-2026-07-25.md).

## Policy Spine

This repo's hook and adapter surfaces follow a small Policy Spine:

| Layer | Role | Can It Override Higher Layers? |
| --- | --- | --- |
| Canonical policy (`.agent/`) | Declares intended behaviour and support | No |
| Native activation (tracked `.claude/settings.json`, `.cursor/hooks.json`, and `.codex/config.toml`) | Activates the supported platform-specific policy or context path in the repo baseline | No |
| Workspace runtime (`agent-tools/dist/src/hook-policy/check-blocked-patterns.js` and its content companion through the Claude shim; agent-tools identity adapters through the Cursor and Codex shims) | Enforces the Claude guards and supplies soft Cursor/Codex identity context without duplicating canonical substance | No |
| Explanatory mirrors (this matrix, hook README) | Describe the live state and support contract | No |

Failure semantics:

- `override` — a higher-authority canonical layer wins over a lower mirror or activation hint
- `prune` — a missing native surface removes a local activation path without changing canonical intent
- `block` — validators or runtime enforcement reject an unsafe or incoherent state

## Entry Points

| Platform               | Entry File                                     |
| ---------------------- | ---------------------------------------------- |
| All platforms          | `.agent/directives/AGENT.md`                   |
| Claude Code            | `CLAUDE.md` → `AGENT.md`                       |
| GitHub Copilot CLI     | `.github/copilot-instructions.md` currently links to `AGENT.md`; validated native import is the target |
| Codex host             | `AGENTS.md` → `AGENT.md`                       |
| Gemini CLI             | `GEMINI.md` → `AGENT.md`                       |
| Linear coding sessions | `skills.md` → `AGENT.md`                       |

## Notes

- `.agents/skills/` and `.agents/rules/` are portable skill/command and
  rule-adapter layers, not evidence for blanket `.agents/` parity with
  every platform-native surface.
- Gemini / Antigravity CLI loads the repo's portable skills from
  `.agents/skills/`. The files under `.agents/rules/` are rule wrappers, not
  skills, and are not treated as a native auto-scan surface here unless a
  future verification proves that behaviour. Directory contents and
  `pnpm portability:check`, rather than frozen counts here, are authoritative.
- Antigravity plugins can bundle skills, agents, rules, MCP definitions, and
  hooks, but plugin bundle support is not the same as repo-local wiring.
- Tracked project platform config is part of the agentic system contract;
  local overrides are additive where the platform supports them.
- Unsupported states are written down explicitly rather than inferred
  from missing files.
- Linear coding sessions run through Claude Code or Codex and inherit
  those entry-point chains; the root `skills.md` is supplementary
  guidance Linear Agent can use during a delegated session (per
  [Linear's coding-sessions docs](https://linear.app/docs/coding-sessions),
  verified 2026-07-13). Linear has no adapter-family or hook surface
  in this repo.
- Portable does not mean symmetrical: each platform has different native
  capabilities and the matrix records what is actually wired.
- Copilot CLI target surfaces are governed by
  [ADR-125](../../../docs/architecture/architectural-decisions/125-agent-artefact-portability.md)
  and the linked plan estate; the target table above must not be collapsed into
  an unsupported/supported binary before live acceptance.
