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
| Policy hooks | Native `.github/hooks` Copilot adapter over one canonical policy evaluator, with no inherited double-evaluation | **No** — inherited Claude activation currently receives an incompatible Copilot batch and blocks valid writes |
| Settings | `.github/copilot/settings.json` only for documented, tested project settings | **No** |
| Repository MCP | Establish a canonical secret-free server manifest from total dispositions over tracked platform candidates, then generate the Copilot repository projection | **No** — no canonical manifest or tracked Copilot projection exists |
| Communications | Existing local comms substrate plus native wake, re-arm, drain recovery, handoff, and retirement | **No** — the substrate exists, but no Copilot notification/lifecycle projection is wired |
| End-to-end proof | Fresh-checkout validators plus a live local Copilot CLI acceptance run | **No** |

Delivery truth lives in MCP-150, MCP-154, MCP-155, and MCP-156 under the
[`first-class-copilot-cli-practice-citizenship`](../../plans/strategic/first-class-copilot-cli-practice-citizenship.plan.md)
node.

## Adapter Families

| Surface        | Cursor              | Claude Code                                            | Gemini / Antigravity CLI                          | GitHub Copilot CLI                                   | Codex                                      | `.agents/`             |
| -------------- | ------------------- | ------------------------------------------------------ | ------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------ | ---------------------- |
| **Skills**     | `.cursor/skills/`   | `.claude/skills/`                                      | `.agents/skills/`                                 | `.agents/skills/` exists; acceptance target above    | unsupported                                | `.agents/skills/`      |
| **Commands**   | `.cursor/commands/` | `.claude/commands/`                                    | `.gemini/commands/`                               | no separate command projection                      | unsupported                                | `.agents/skills/oak-*/` |
| **Rules**      | `.cursor/rules/`    | `.claude/rules/`                                       | entry-point chain only                            | partial repo entry point; modular projection target  | entry-point chain                          | `.agents/rules/`       |
| **Sub-agents** | `.cursor/agents/`   | `.claude/agents/`                                      | native `/agents` upstream; no repo wrappers wired | native custom agents documented; repo target unwired | `.codex/`                                  | unsupported            |
| **Hooks**      | unsupported         | `.claude/settings.json` (tracked project `PreToolUse`) | supported upstream; no project-local hook wired   | native hooks documented; repo target unwired         | supported upstream; no project-local hook wired | unsupported            |
| **MCP**        | user-local          | user-local / MCP config                                | supported upstream; no `.agents/mcp_config.json` wired | repository config documented; tracked projection target | plugin/user-local                          | `.agents/mcp_config.json` target |

## Hook Support

Claude Code currently has native `PreToolUse` activation for Bash
commands via the tracked project `.claude/settings.json`, backed by the
canonical policy in `.agent/hooks/policy.json` and the prebuilt runtime
artefact `agent-tools/dist/src/hook-policy/check-blocked-patterns.js`, invoked
through the verdict shim `.claude/hooks/run-pretooluse-guard.mjs` so a
built-but-broken artefact blocks the tool call (exit 2), while a not-built
artefact fails open (exit 0) with a loud, logged warning so a fresh checkout is
not bricked — well within the per-tool-call hook timeout. Local additive
overrides, when needed, live in `.claude/settings.local.json`.

Status by platform:

- **Claude Code**: supported for `PreToolUse` only (Bash blocked-pattern
  enforcement via tracked project `.claude/settings.json`)
- **Cursor**: no native agent hook surface at time of writing
- **Gemini / Antigravity CLI**: native hooks are documented through
  `hooks.json` under the workspace `.agents/` directory or global config, with
  `PreToolUse`, `PostToolUse`, `PreInvocation`, `PostInvocation`, and `Stop`
  events. This repository has no project-local `.agents/hooks.json` wired.
- **GitHub Copilot CLI**: native hooks are documented, including
  `sessionStart`, `preToolUse`, `notification`, `agentStop`, and `sessionEnd`.
  This repository has no native `.github/hooks` activation wired. The inherited
  Claude hook currently receives an incompatible Copilot batch shape and is a
  reproduced blocking defect, not supported Copilot enforcement.
- **Codex**: upstream Codex hooks are available behind `codex_hooks`, and this
  local Codex install reports the feature enabled. This repository has no
  project-local `.codex/` hook configuration wired. Current Codex docs show
  `SessionStart`, `PreToolUse`, `PermissionRequest`, `PostToolUse`,
  `UserPromptSubmit`, and turn-scoped `Stop`; no `SessionEnd` equivalent is
  documented, so session-close cleanup must rely on explicit handoff and
  standard TTL/stale-archive cleanup until that surface exists.

## Policy Spine

This repo's hook and adapter surfaces follow a small Policy Spine:

| Layer | Role | Can It Override Higher Layers? |
| --- | --- | --- |
| Canonical policy (`.agent/`) | Declares intended behaviour and support | No |
| Native activation (tracked `.claude/settings.json`) | Activates supported policy in the repo baseline | No |
| Workspace runtime (`agent-tools/dist/src/hook-policy/check-blocked-patterns.js` via `.claude/hooks/run-pretooluse-guard.mjs`) | Enforces the active native hook path; fails closed if a built artefact is broken, fails open (loud, logged) if not yet built | No |
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
- Gemini / Antigravity CLI loads the repo's 20 portable skills from
  `.agents/skills/`. The 86 files under `.agents/rules/` are rule wrappers,
  not skills, and are not treated as a native auto-scan surface here unless a
  future verification proves that behaviour.
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
