# Codex CLI agentic capability catalogue

- **Status**: Current research baseline
- **Evidence date**: 2026-07-25
- **Installed runtime**: `codex-cli 0.145.0`
- **Official source pin**: `openai/codex` tag `rust-v0.145.0`, commit
  `25af12f7e61572b0bc18ddb1008be543b91519b0`
- **Official docs snapshot**: Fetched 2026-07-25; the public docs expose no
  immutable revision identifier, so the fetch date and matching source release
  pin are the explicit evidence ceiling.
- **Scope**: User-facing agentic mechanisms available through, or directly
  composable with, the local Codex CLI. Codex app-only, IDE-only, web-only, and
  Codex cloud capabilities are excluded unless the local CLI exposes an
  explicit bridge to them.

## Review contract

- **Purpose and impact**: establish a version-pinned catalogue of local Codex
  CLI agentic mechanisms, then map those mechanisms onto the Oak Practice
  without using repository state as product evidence.
- **Review questions**: does each capability claim follow from the declared
  official source boundary; are maturity, platform, activation, and evidence
  grades accurate; and do the resulting Practice implications preserve the
  shared-core/thin-adapter architecture?
- **Evidence standard**: verify external claims against the installed CLI,
  current official OpenAI documentation, or the pinned official source release
  below. Treat repository inspection only as evidence of local wiring.
- **Non-goals**: this report does not authorise implementation, promote
  experimental interfaces to stable dependencies, or change ADR-125 while it
  remains owned by MCP-150 / PR #529.
- **Successful review**: report either that the catalogue satisfies these
  questions within its explicit evidence ceiling, or identify the exact claim,
  missing official evidence, contract mismatch, or local mapping that must be
  corrected.

## Executive result

Codex CLI is an agent runtime, not only an interactive coding prompt. Its
documented agentic surface includes:

1. a steerable interactive thread with planning, persistent goals, side chats,
   context compaction, review, and saved-session lifecycle;
2. layered instructions through `AGENTS.md`, reusable skills, optional local
   memories, profiles, and trusted project configuration;
3. local shell and file-changing tools, background terminals, web search,
   image inputs, image generation, apps, MCP tools, and plugins;
4. native multi-agent delegation with built-in and project-defined roles;
5. stable lifecycle hooks which can observe, block, and in supported cases
   rewrite local tool calls;
6. sandboxing, approval policies, automatic approval review, executable-command
   rules, network policy, and project trust;
7. non-interactive execution, structured output, resumable automation, SDKs,
   Codex-as-MCP-server, and an experimental app-server protocol;
8. machine-readable event streams, OpenTelemetry export, logs, notifications,
   status surfaces, and hook status.

This changes the Practice portability premise. Codex is not an
entry-point-only host, and it does not lack hooks. The installed repo baseline
already uses native skills, project-defined agents, project configuration,
project MCP servers, and a `SessionStart` hook. It does not yet activate the
canonical command/content guard on Codex `PreToolUse`.

## Evidence contract

### What counts

External product claims in this report come only from original OpenAI sources:

- the installed OpenAI Codex CLI and its own `--help` / `features list` output;
- the official OpenAI Codex documentation fetched on 2026-07-25;
- the official `openai/codex` release tag above.

Repository files are inspected only to map those independently established
capabilities onto the current Oak Practice. They are not evidence of what
Codex itself supports.

### Evidence grades

| Grade | Meaning |
| --- | --- |
| Documented | Current official documentation explicitly assigns the mechanism to Codex CLI. |
| Exposed | The installed `0.145.0` binary exposes the command, flag, or stable feature. |
| Probed | A local, isolated invocation demonstrated the behaviour. |
| Repo-wired | A tracked repo adapter activates the mechanism; this is local state, not product evidence. |

An installed feature flag is not sufficient evidence that a shared-product
capability is available in the CLI. The clearest counterexample is
`browser_use`: `codex features list` reports it as stable and enabled, while
the official Browser documentation explicitly says Browser is unavailable in
Codex CLI.

### Maturity vocabulary

OpenAI defines four maturity levels:

- **under development**: not ready for use;
- **experimental**: unstable and may change or be removed;
- **beta**: suitable for broad testing, with some changes expected;
- **stable**: supported, documented, and ready for broad use.

Where the docs or installed binary do not assign a maturity label, this report
uses **documented** rather than inventing one.

## Capability catalogue

### 1. Deliberation, control, and steering

| Mechanism | CLI behaviour | Maturity / evidence |
| --- | --- | --- |
| Interactive agent thread | `codex [PROMPT]` starts a local agent loop in the selected working directory. | Documented; exposed |
| Plan mode | `/plan` changes the active thread to planning mode and accepts an optional inline planning request. | Documented |
| Persistent goal | `/goal` sets completion criteria; the goal can be viewed, edited, paused, resumed, or cleared. Codex continues automatically while the goal remains active. | Stable feature; documented |
| Mid-run steering | Follow-up prompts can steer the same session; slash commands typed during a run can be queued for the next turn. | Documented |
| Side chat | `/side` or `/btw` starts an ephemeral question without disrupting the main transcript. | Documented |
| Compaction | `/compact` summarises retained context to free context-window capacity; hook events exist before and after compaction. | Documented |
| Model control | `--model` and `/model` select the active model; reasoning effort and response personality are separately configurable. | Documented |
| Fast tier | `/fast` selects a catalogue-provided fast service tier when the active model exposes one. | Stable feature; documented |
| Review mode | `/review` or `codex review` starts a dedicated read-only reviewer for a base diff, commit, or uncommitted changes. | Stable command; documented |
| Operator state | `/status`, `/usage`, `/debug-config`, `/ps`, and `/stop` expose session policy, usage, config, and background terminal state. | Documented |

The goal mechanism is persistence within a chat, not a scheduler and not a
permission escalation. It retains the chat's existing sandbox and approval
policy and pauses when a decision remains necessary.

### 2. Context, instructions, and durable knowledge

| Mechanism | CLI behaviour | Maturity / evidence |
| --- | --- | --- |
| `AGENTS.md` | Codex walks from the project root to the current directory, layering applicable instruction files; closer files win. | Documented |
| Skills | User, repository, administrator, system, and plugin skills are progressively disclosed and can be invoked explicitly with `$name` or selected through `/skills`. | Documented |
| Skill resources | A skill can package instructions, scripts, references, and assets; Codex loads additional resources only when the task needs them. | Documented |
| Native memories | Optional local memory can be used and generated per chat through `/memories`; storage is under the local Codex home and the feature is off by default. | Stable feature; documented |
| Files and folders | `/mention` attaches local paths to the next prompt; working-directory context and additional writable directories are CLI options. | Documented; exposed |
| Image inputs | `-i` / `--image` attaches one or more PNG/JPEG images to the initial prompt. | Documented; exposed |
| Configuration layers | System, user, named profile, project, and CLI overrides compose with defined precedence. Project `.codex/` layers load only in trusted projects. | Documented |
| Import | `/import` migrates supported Claude Code instructions, settings, skills, plugins, projects, chats, MCP setup, hooks, slash commands, and subagents. | Documented |
| Custom prompts | Legacy custom prompt files remain a compatibility surface but are deprecated in favour of skills. | Deprecated |

Practice memory and native Codex memory solve different problems. Versioned
Practice memory is team-visible and reviewable; Codex native memories are
host-local personalisation/context. One should not silently substitute for the
other.

### 3. Local action and tool use

| Mechanism | CLI behaviour | Maturity / evidence |
| --- | --- | --- |
| Shell execution | The agent can run model-generated commands under the active sandbox and approval policy. | Stable feature; documented |
| File changes | The agent can create and modify workspace files; `codex apply` applies the latest Codex cloud diff to a local Git tree. | Documented; exposed |
| Background terminals | Long-running commands can continue in the background and are inspectable with `/ps`; `/stop` cancels them. | Documented |
| Web search | Cached search is the local default; `--search` or `web_search = "live"` enables live results without granting spawned commands general network access. | Documented; exposed |
| Image generation | An interactive session can use the `imagegen` skill explicitly; reference images can be attached with `--image`. | Stable feature; documented |
| MCP tools | Codex supports local STDIO and remote streamable-HTTP servers, bearer/OAuth/ChatGPT auth, server instructions, allow/deny lists, and per-tool approval modes. | Documented; exposed |
| Apps / connectors | `/apps` browses available connectors and inserts an app reference into the prompt. App tool calls retain approval semantics for side effects. | Stable feature; documented |
| Plugins | `/plugins` and `codex plugin` browse, install, enable, disable, and remove bundles containing skills, connectors/MCP servers, hooks, and other supported assets. | Stable feature; documented |
| Tool suggestions | The installed runtime exposes stable tool-suggestion behaviour. | Stable feature; exposed |

MCP and app tools are part of the agent's action space, but their external
service authorisation remains independent of Codex filesystem/network
permissions. A tool marked destructive requires approval even if it also
advertises read-only behaviour.

### 4. Native multi-agent composition

| Mechanism | CLI behaviour | Maturity / evidence |
| --- | --- | --- |
| Subagent delegation | Codex can delegate explicitly or when instructions make delegation appropriate. | Stable feature; documented |
| Built-in roles | `default`, `worker`, and `explorer` provide general, implementation, and read-oriented exploration behaviours. | Documented |
| Project roles | `[agents.<name>]` entries in trusted project config load separate agent configuration files. | Documented; repo-wired |
| Per-agent policy | Agent config may select model, reasoning, sandbox, MCP servers, skills, and developer instructions. | Documented |
| Thread inspection | `/agent` / `/subagents` switches among active agent threads. | Documented |
| Orchestration | The parent can send follow-up work, steer, interrupt, and wait for child results. | Documented |
| Parallelism | Independent work can run concurrently; official guidance warns against concurrent writes to the same files and recommends isolated checkouts. | Documented |

Subagents inherit the parent session's approval boundary unless their
configuration narrows it. Agent configuration is composition, not an
authorisation escape.

### 5. Lifecycle hooks

Codex `hooks` is stable and enabled in the installed runtime. Officially
documented events are:

| Lifecycle | Events |
| --- | --- |
| Session | `SessionStart`, `SessionEnd`, `UserPromptSubmit`, `Stop` |
| Subagents | `SubagentStart`, `SubagentStop` |
| Tools and approval | `PreToolUse`, `PermissionRequest`, `PostToolUse` |
| Context | `PreCompact`, `PostCompact` |

Hook configuration can live in user or trusted-project `hooks.json`, inline
`[hooks]` configuration, or a plugin. `/hooks` shows configured hooks and is
the trust-review surface. `--dangerously-bypass-hook-trust` exists for vetted
automation and deliberately bypasses normal persisted trust.

Important semantics:

- multiple matching hooks run; command hooks for one event run concurrently;
- `PreToolUse` can block a local function tool call;
- supported `PreToolUse` decisions can rewrite the tool input;
- command hooks receive JSON on stdin and return structured JSON on stdout;
- project hooks do not load until the project config layer is trusted;
- managed requirements can enforce hooks and policy independently of local
  trust choices;
- hooks cover local function tools such as shell, patch, and MCP calls, but do
  not automatically cover hosted tools such as Web Search;
- specialised execution paths can opt out, so a hook is not evidence of
  universal interception without a path-specific probe.

#### Live `0.145.0` hook probes

Two ephemeral `codex exec` runs in isolated temporary directories loaded
command hooks with explicit hook-trust bypass for the vetted probe config.

The read-only shell probe reported:

```text
hook: SessionStart Completed
hook: PreToolUse Completed
```

The hooked shell command then ran and the turn completed.

The workspace-write patch probe instructed Codex to use `apply_patch` for one
new temporary text file. The transcript reported `PreToolUse` before
`patch: completed`, and the recorder captured:

```json
{
  "hook_event_name": "PreToolUse",
  "tool_name": "apply_patch",
  "tool_input": {
    "command": "*** Begin Patch\n*** Add File: probe-result.txt\n..."
  }
}
```

The requested file contained the exact expected line after the hook completed.
This proves installed-runtime dispatch for both shell and `apply_patch` without
relying on repo hook configuration.

The following is the complete replay recipe used for those claims, normalised
only by replacing the original ephemeral directory with `PROBE_DIR`. It creates
the recorder, supplies the hook configuration and prompts, and asserts the
recorded events and patch content. The hook-trust bypass is appropriate only
because this is a disposable directory with a recorder created in the same
recipe. Both invocations ignore user configuration and executable rules so the
inline hook configuration is the only behavioural input from those surfaces.

```sh
PROBE_DIR="$(mktemp -d)"

cat > "$PROBE_DIR/record_hook.py" <<'PY'
import json
import pathlib
import sys

event = json.load(sys.stdin)
marker = pathlib.Path(__file__).with_name("hook-events.jsonl")
with marker.open("a", encoding="utf-8") as stream:
    stream.write(json.dumps(event, sort_keys=True) + "\n")
PY
```

Run the shell probe:

```sh
codex exec --ephemeral --ignore-user-config --ignore-rules \
  --skip-git-repo-check -C "$PROBE_DIR" \
  -s read-only --dangerously-bypass-hook-trust --enable hooks \
  -c 'approval_policy="never"' \
  -c "hooks.SessionStart=[{hooks=[{type=\"command\",command=\"python3 $PROBE_DIR/record_hook.py\"}]}]" \
  -c "hooks.PreToolUse=[{matcher=\"^Bash$\",hooks=[{type=\"command\",command=\"python3 $PROBE_DIR/record_hook.py\"}]}]" \
  'Use the Bash tool exactly once to run pwd. Then reply with only done.'

jq -se '
  any(.[]; .hook_event_name == "SessionStart") and
  any(.[];
    .hook_event_name == "PreToolUse" and
    .tool_name == "Bash" and
    .tool_input.command == "pwd"
  )
' "$PROBE_DIR/hook-events.jsonl"
```

The command transcript must contain `hook: SessionStart Completed` and
`hook: PreToolUse Completed`; the `jq` assertion must return `true`. Clear the
event log, then run the patch probe:

```sh
: > "$PROBE_DIR/hook-events.jsonl"

codex exec --ephemeral --ignore-user-config --ignore-rules \
  --skip-git-repo-check -C "$PROBE_DIR" \
  --sandbox workspace-write --dangerously-bypass-hook-trust --enable hooks \
  -c "hooks.PreToolUse=[{matcher=\"^apply_patch$\",hooks=[{type=\"command\",command=\"python3 $PROBE_DIR/record_hook.py\",timeout=10,statusMessage=\"Recording apply_patch\"}]}]" \
  'Use the apply_patch tool, not shell redirection or another write mechanism, to create probe-result.txt containing exactly: apply_patch hook probe succeeded. Then report done.'

jq -se '
  any(.[];
    .hook_event_name == "PreToolUse" and
    .tool_name == "apply_patch" and
    (.tool_input.command | contains("*** Add File: probe-result.txt"))
  )
' "$PROBE_DIR/hook-events.jsonl"

printf '%s\n' 'apply_patch hook probe succeeded.' \
  > "$PROBE_DIR/expected-probe-result.txt"
cmp -s \
  "$PROBE_DIR/expected-probe-result.txt" \
  "$PROBE_DIR/probe-result.txt"
```

The patch transcript must place `hook: PreToolUse Completed` before
`patch: completed`; both final assertions must succeed.

The probes do not prove every event, rewrite path, MCP tool, hosted tool, or
failure mode. Those remain separate integration tests.

### 6. Sandboxing, approvals, and executable policy

| Mechanism | CLI behaviour | Maturity / evidence |
| --- | --- | --- |
| Sandbox modes | `read-only`, `workspace-write`, and `danger-full-access` define filesystem/network enforcement for model-generated commands. | Stable CLI surface |
| Approval policy | `untrusted`, `on-request`, `never`, and granular approval categories determine when an action needs review. | Documented; exposed |
| Permission profiles | Named profiles combine path-specific read/write/deny rules with network rules and reusable workspace roots. | Beta |
| Automatic approval review | `approvals_reviewer = "auto_review"` routes eligible boundary-crossing requests to a separate reviewer agent. | Stable feature; documented |
| Project trust | Untrusted projects cannot activate project `.codex/` config, hooks, or rules. | Documented |
| Executable rules | `.rules` files classify command prefixes as allow, prompt, or forbidden; the most restrictive matching result wins. | Experimental command/policy surface |
| Network proxy | Optional domain and socket policy constrains command network access when network access is already enabled. | Experimental feature |
| MCP/app approvals | Tool annotations and configured approval modes govern external side effects; destructive annotations force review. | Documented |
| Managed requirements | Organisation policy can restrict models, features, sandbox modes, approval reviewers, MCP, skills, and hooks. | Documented |

Automatic review changes who evaluates an escalation; it does not widen the
sandbox. Critical-risk actions are denied, failures fail closed, and repeated
denials trip a turn-level circuit breaker.

The old sandbox configuration and beta permission profiles are alternative
policy models. If old `sandbox_mode` settings are loaded or `--sandbox` is
passed, Codex uses that model rather than composing it with
`default_permissions`.

### 7. Session lifecycle and persistence

| Mechanism | CLI behaviour | Maturity / evidence |
| --- | --- | --- |
| New thread | `/new` starts a fresh chat without leaving the TUI. | Documented |
| Resume | `/resume`, `codex resume`, and `codex exec resume` continue saved work. | Stable command; documented |
| Fork | `/fork` or `codex fork` branches a saved transcript into a new session. | Stable command; documented |
| Archive | `/archive`, `codex archive`, and `codex unarchive` move sessions into or out of archived state. | Stable command; exposed |
| Delete | `/delete` or `codex delete` permanently removes a session and descendants. | Stable command; exposed |
| Ephemeral automation | `codex exec --ephemeral` avoids persisting rollout/session files. | Documented |
| Compaction | Manual and lifecycle-triggered compaction reduce retained context while preserving a summary. | Documented |
| Local state | Codex stores configured history, session state, logs, and caches under the Codex home. | Documented |
| CLI authentication credentials | `cli_auth_credentials_store = "file"` stores credentials in `$CODEX_HOME/auth.json`; `keyring` uses the operating-system credential store; `auto` prefers the keyring and falls back to the file. | Documented; pinned source |

Archive and delete are not synonyms: archive preserves the transcript; delete
is destructive.

### 8. Non-interactive and programmatic composition

| Mechanism | CLI behaviour | Maturity / evidence |
| --- | --- | --- |
| `codex exec` | Runs a non-interactive agent, accepts prompt or stdin, uses explicit policy, and can resume earlier sessions. | Stable |
| Automation isolation | `--ephemeral`, `--ignore-user-config`, `--ignore-rules`, required MCP servers, and the Git-repository check let automation fail closed around selected ambient state. | Documented |
| JSONL events | `codex exec --json` streams thread, turn, item, tool, web-search, file-change, plan, usage, and error events. | Stable documented interface |
| Structured final output | `--output-schema` constrains the final response to JSON Schema; `--output-last-message` writes the final answer separately. | Stable documented interface |
| Codex SDK | TypeScript and Python SDKs start, resume, and steer Codex threads under selected sandbox policy. | TypeScript documented; Python beta |
| Codex as MCP server | `codex mcp-server` exposes Codex over MCP stdio for another orchestrator. | Exposed command; experimental protocol |
| App Server | JSON-RPC threads, turns, streamed items, approvals, history, fork/resume, steering, and interrupt over stdio, Unix socket, or WebSocket. | Experimental command/API |
| Remote TUI | `--remote` connects the terminal UI to an app-server endpoint; authenticated remote-control tooling is experimental. | Exposed; experimental control command |
| Desktop handoff | On macOS and Windows, `codex app` opens or installs the Codex App for a workspace; `/app` continues the current session there. This is a bridge, not a local CLI tool grant. | Stable command; documented |
| GitHub Action | `openai/codex-action@v1` runs `codex exec` in CI with explicit safety strategy, sandbox, model, prompt, and output controls. | Official integration |
| Cloud task client | `codex cloud` submits, lists, inspects, diffs, and applies Codex cloud tasks. The task itself is hosted, not local CLI execution. | Experimental |
| Exec server | `codex exec-server` exposes a standalone execution service. | Experimental |

`codex exec` is the simplest automation boundary. Use the SDK when a program
needs richer thread control, App Server when building a full client, and
`codex mcp-server` when Codex should be one specialist inside an MCP/Agents SDK
orchestrator and the experimental protocol is an intentional dependency.

### 9. Observation and operator feedback

| Mechanism | CLI behaviour | Maturity / evidence |
| --- | --- | --- |
| JSONL stream | `codex exec --json` provides machine-readable lifecycle and tool events. | Stable documented interface |
| OpenTelemetry | Opt-in `[otel]` configuration exports API, stream, prompt, approval, and tool result events. | Documented; disabled by default |
| Runtime logs | `RUST_LOG` controls logging; plaintext TUI logs are opt-in through `log_dir`. | Documented |
| External notify | User-level `notify` can run an external program when a turn completes. | Documented |
| TUI notification | `tui.notifications`, method, and condition configure terminal alerts. | Documented |
| Hook status | `/hooks` shows active, changed, trusted, disabled, and managed hooks. | Documented |
| Session status | `/status`, `/usage`, `/debug-config`, status-line, and terminal-title fields expose policy and run state. | Documented |
| Diagnostics | `codex doctor`, `codex debug`, and strict-config checks diagnose installation and configuration. | Exposed |

Project config cannot install machine-local notification or telemetry commands.
Provider, `notify`, and `otel` settings are deliberately user-level.

### 10. Model, provider, and runtime selection

| Mechanism | CLI behaviour | Maturity / evidence |
| --- | --- | --- |
| OpenAI / ChatGPT auth | Interactive login, access-token login, and API-key automation are supported with different persistence rules. | Documented |
| Model and effort | CLI flags, config, profiles, and in-session commands select model, reasoning effort, verbosity, and review model. | Documented |
| Named profiles | `--profile` overlays a separate profile config between user and project layers. | Documented |
| Local OSS providers | `--oss` selects Ollama or LM Studio, with an explicit local provider when needed. | Exposed; documented |
| Custom providers | Responses-compatible providers, proxies, Azure, Amazon Bedrock, custom headers, and command-backed auth can be configured. | Documented |
| Working root | `-C` selects the root; `--add-dir` adds writable roots under the selected policy. | Exposed |

Provider substitution may change model/tool availability. A configured provider
is not evidence that every first-party Codex feature works with that provider.

## Explicit CLI exclusions

The following are intentionally not catalogued as local Codex CLI agent tools:

| Surface | Why excluded |
| --- | --- |
| Built-in Browser | Official docs explicitly say it is unavailable in Codex CLI and the IDE extension. The stable `browser_use` feature flag belongs to the shared product runtime, not proof of CLI availability. |
| Computer Use | Official docs assign it to the Codex app on macOS/Windows. The installed `computer_use` feature flag is not a local CLI tool. |
| Scheduled tasks | Scheduling is a ChatGPT web/desktop capability. CLI goals persist only while their chat runs and do not create a scheduler. |
| Desktop worktrees | Native app worktree lifecycle is app-specific. The CLI can of course run Git worktree commands through its shell tool. |
| Desktop review pane and inline comments | CLI `/review` is supported; the graphical review pane and inline-comment UI are not. |
| IDE automatic context | The CLI can attach files and images, but IDE selection/open-file injection is an IDE surface. |
| Record & Replay | The supported authoring UI is outside the local CLI. Resulting skills may later be usable by the CLI. |
| Voice, cloud browser, and desktop pets | These do not extend the local CLI agent's tool or policy boundary. Terminal pets are presentation only. |

This boundary is why the catalogue is not generated from `codex features list`.

## Installed `0.145.0` exposure snapshot

### Stable or ordinary command surfaces

The installed binary exposes interactive mode plus:

`exec`, `review`, `login`, `logout`, `mcp`, `plugin`, `mcp-server`, `app`,
`completion`, `update`, `doctor`, `sandbox`, `debug`, `apply`, `resume`,
`archive`, `delete`, `unarchive`, `fork`, and `features`.

### Explicitly experimental command surfaces

The installed binary labels these experimental:

`app-server`, `remote-control`, `cloud`, and `exec-server`.

The hidden `codex execpolicy` command is also documented as experimental even
though `codex execpolicy --help` is callable in `0.145.0`.

### Stable enabled flags relevant to agent behaviour

The installed feature registry reports these stable and enabled:

`apps`, `fast_mode`, `goals`, `guardian_approval`, `hooks`,
`image_generation`, `memories`, `multi_agent`, `personality`, `plugins`,
`shell_snapshot`, `shell_tool`, `tool_suggest`, and `unified_exec`.

It also reports `browser_use` and `computer_use` as stable and enabled; they
remain excluded because official surface documentation says those tools are not
available in the CLI. `network_proxy` is experimental and disabled.

## Oak Practice mapping

| Codex capability | Current repo activation | Practice implication |
| --- | --- | --- |
| Project instructions | `AGENTS.md` points to `.agent/directives/AGENT.md`; `RULES_INDEX.md` is a fallback. | Keep the entry point thin; canonical doctrine remains in `.agent/`. |
| Skills | `.agents/skills/oak-*/SKILL.md` wraps canonical skill bodies. | Codex is a native skill consumer, not an unsupported host. |
| Subagents | `.codex/config.toml` registers `.codex/agents/*.toml`. | The shared core + thin adapter architecture is already valid here. |
| Hooks | `.codex/config.toml` enables `hooks` and registers a `SessionStart` identity adapter. | Hooks are repo-wired, but only identity context is activated on Codex today. |
| MCP | Two trusted-project remote MCP servers are configured in `.codex/config.toml`. | MCP is project-configurable, not only plugin/user-local. |
| Sandbox | Project config selects `workspace-write` and enables command network access. | This is tracked project policy; the effective policy still follows Codex configuration precedence and managed requirements. |
| Native rules | No project execpolicy `.rules` activation is recorded. | Do not describe `.agents/rules/` as a native Codex rule scanner. |
| Native memories | No repo-owned native memory policy is recorded. | Practice memory remains the durable team surface. |
| Plugins/apps | No repo plugin manifest is required for the current Practice adapters. | Treat installed plugins as a separate distribution/extension channel. |
| Non-interactive work | ADR-180 and the `oak-codex-helper` skill wrap `codex exec`. | Update them as the public JSONL, SDK, and MCP-server choices evolve. |
| Observability | Native logs/OTel are not the same as the repo's Sentry/MCP instrumentation. | Keep runtime and application telemetry claims separate. |

## Documentation defects and disposition

The official-source pass found these documentation defects:

1. the cross-platform matrix says Codex skills and project hooks are
   unsupported/unwired, while tracked config activates both;
2. ADR-125 says Codex has no documented local configuration counterpart and
   generalizes project-setting capabilities across vendors; current Codex docs
   distinguish user and trusted-project layers and restrict keys the project
   layer may set;
3. the hook README says Codex remains unsupported;
4. the hook portability plan still describes hooks behind `codex_hooks`,
   omits `SessionEnd`, and treats the Codex adapter as future;
5. the identity guide names `features.codex_hooks`; the current public key and
   tracked config use `features.hooks`;
6. the artefact inventory omits the tracked Codex hook and project MCP
   adapters and overstates `.agents/rules/` as a native Codex rule surface;
7. the Codex platform README omits its hook, MCP, trust, and policy shape;
8. ADR-180 describes only two orchestration choices and treats documented JSONL
   as non-public, while current official docs cover JSONL, SDKs, App Server, and
   Codex-as-MCP-server;
9. live collaboration-state lifecycle guidance says Codex has no verified
   `SessionEnd`, although the stable `0.145.0` event surface includes it;
10. the imported matrix's shared hook row and status bullets omit tracked
    `SessionStart` identity activation for Claude Code and Cursor;
11. the executive artefact inventory and the hook README's “Current Status”
    list likewise omit those two tracked identity adapters while listing the
    Codex adapter;
12. the imported matrix retains retired `.cursor/skills/`,
    `.cursor/commands/`, and `.claude/commands/` paths and presents Gemini's
    transitional reviewer commands as a general workflow surface;
13. the matrix's Policy Spine omits tracked Cursor identity activation, while
    its Notes freeze obsolete skill and rule counts.
14. the catalogue's session-persistence row incorrectly says authentication
    credentials are always stored under the Codex home, although Codex also
    supports operating-system-keyring and automatic credential-store modes.

This changeset corrects items 1, 3–10, and 12–14. Item 11 is a
reference-inventory incompleteness rather than a false claim and remains
recorded here as follow-on work under MCP-159; the owner-bounded matrix
reconciliation does not widen into Claude/Cursor inventory work. The changeset
bases the matrix on PR #529 head blob `fdc672adb`; changes outside the Codex
cells and Codex-specific support text are limited to the factually wrong shared
activation and retired-adapter cells in items 10 and 12, plus the link
adjustment described below. On 2026-07-25 the owner explicitly overrode the
earlier wait-for-PR-529 sequence for the matrix, and the Director released that
file to MCP-159 with the Copilot claims and wording preserved. One deliberate
pre-merge adjustment replaces PR #529's live relative link to its
first-class-Copilot plan with a code-spanned repo-root path and provenance note:
the target does not exist on this branch, so a live link would fail the
repository validator. The semantic union must restore the live link after both
changes land. ADR-125 in item 2 remains under the MCP-150 / PR #529 owner and
is not changed here.

## Consequences for the next enforcement vertical

This catalogue and the live `apply_patch` event satisfy the capability-probe
prerequisite for the planned Codex enforcement vertical:

- use the existing canonical policy and shared runtime;
- add a thin Codex adapter which translates the Codex `PreToolUse` schema;
- require exactly one explicit supported input schema match rather than
  guessing a vendor;
- fail closed for zero or multiple schema matches and for unsupported or
  unprobed hosts;
- load one validated policy snapshot and perform exactly one canonical policy
  evaluation for every successfully dispatched write request;
- add neither a pass-through route nor a second policy implementation;
- test block, allow, malformed-input, missing-build, and rewrite semantics
  against pinned Codex hook fixtures;
- keep hook trust and project trust visible;
- do not claim coverage for Web Search or other hosted/specialised paths
  without separate proof.

Implementation is deliberately outside this research changeset.

## Official sources

All links below are OpenAI-owned and were fetched on 2026-07-25.

- [Codex CLI commands](https://developers.openai.com/codex/cli/reference)
- [Codex CLI slash commands](https://developers.openai.com/codex/cli/slash-commands)
- [Hooks](https://developers.openai.com/codex/hooks)
- [Subagents](https://developers.openai.com/codex/multi-agent)
- [Build skills](https://developers.openai.com/codex/skills)
- [AGENTS.md](https://developers.openai.com/codex/guides/agents-md)
- [Memories](https://developers.openai.com/codex/memories)
- [MCP](https://developers.openai.com/codex/mcp)
- [Plugins](https://developers.openai.com/codex/plugins)
- [Advanced configuration](https://developers.openai.com/codex/config-advanced)
- [Configuration reference](https://developers.openai.com/codex/config-reference)
- [Agent approvals and security](https://learn.chatgpt.com/docs/agent-approvals-security)
- [Automatic approval review](https://learn.chatgpt.com/docs/sandboxing/auto-review)
- [Permission profiles](https://learn.chatgpt.com/docs/permissions)
- [Rules](https://developers.openai.com/codex/rules)
- [Non-interactive mode](https://developers.openai.com/codex/noninteractive)
- [Codex SDK](https://developers.openai.com/codex/sdk)
- [App Server](https://developers.openai.com/codex/app-server)
- [Codex as an MCP server](https://developers.openai.com/codex/mcp-server)
- [Codex GitHub Action](https://developers.openai.com/codex/github-action)
- [Code review](https://developers.openai.com/codex/code-review)
- [Long-running work](https://developers.openai.com/codex/long-running-work)
- [Web search](https://developers.openai.com/codex/web-search)
- [Image inputs](https://developers.openai.com/codex/image-inputs)
- [Image generation](https://developers.openai.com/codex/image-generation)
- [Browser](https://developers.openai.com/codex/browser)
- [Computer Use](https://developers.openai.com/codex/computer-use)
- [Feature maturity](https://developers.openai.com/codex/feature-maturity)
- [Official `rust-v0.145.0` source tag](https://github.com/openai/codex/tree/rust-v0.145.0)

## Refresh procedure

Do not edit old capability rows from memory.

1. Record `codex --version`.
2. Resolve the matching official `openai/codex` release tag to an immutable
   commit.
3. Re-fetch the official manual and named pages.
4. Run `codex --help`, relevant subcommand help, and `codex features list`.
5. Re-run isolated probes for behaviour the Practice relies on.
6. Reconcile the report against tracked project config.
7. Update the evidence date, version, source pin, maturity labels, exclusions,
   and local adapter mapping together.
