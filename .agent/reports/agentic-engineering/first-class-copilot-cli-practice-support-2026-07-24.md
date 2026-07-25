# First-class Copilot CLI Practice support

- **Date:** 2026-07-24
- **Scope:** GitHub Copilot CLI running locally in this repository
- **Status:** Evidence and target architecture ratified; runtime delivery has
  not yet landed
- **Controlling plan:**
  [First-class Copilot CLI Practice citizenship](../../plans/strategic/first-class-copilot-cli-practice-citizenship.plan.md)
- **Delivery tickets:** MCP-150, MCP-154, MCP-155, MCP-156

## Evidence labels

- **[V]** — directly observed in the local Copilot CLI design session.
- **[D]** — documented by GitHub in the official sources below.
- **[R]** — verified in repository source or doctrine.
- **[I]** — a design judgement derived from the preceding evidence.

## Review contract

- **Purpose and intended impact:** establish the evidence base and the target
  architecture for making local Copilot CLI an equal first-class citizen of this
  repository's existing Practice and agentic tools, and stand as the evidence
  authority for the controlling plan and its delivery tickets.
- **Questions the review should test:** are the platform capability claims
  correct against GitHub's official sources; is each surface's current
  repository state stated honestly; does the target-versus-wired separation hold
  wherever a target could be misread as an implementation claim; and is every
  design judgement traceable to the observed, documented, or repository
  evidence it rests on.
- **Evidence standard and authority boundary:** every load-bearing claim carries
  a **[V]**, **[D]**, **[R]**, or **[I]** label. GitHub's official
  documentation is the only authority for what the platform supports; this
  report is authoritative for the observed local design session, the repository
  state it cites, and the target architecture derived from them — not for
  platform behaviour it has neither observed nor cited.
- **Non-goals and what this report does not authorise:** Copilot
  coding-agent/cloud-execution-specific delivery, hosted bridges, cross-machine
  routing, and a separate Codex delivery programme are outside scope; shared
  repository projections still target parity across local and cloud Copilot.
  The report authorises no runtime delivery — mechanism and execution belong to
  the controlling plan and MCP-150, MCP-154, MCP-155, and MCP-156 — and no
  target here turns a missing runtime path green.
- **What a successful review is:** each finding is checked against its evidence
  label and the target-versus-wired split, and any mislabelled claim,
  unsupported platform assertion, or scope leak past the local-CLI boundary is
  reported against the specific line. Missing evidence is reported as a
  labelling defect rather than inferred, and a contract mismatch is raised as
  such rather than resolved by the reviewer.

## Executive verdict

The repository should make **local Copilot CLI** an equal first-class citizen
of its existing Practice and agentic tools **[I]**. Equal does not mean
pretending every host has identical files. It means that a Copilot CLI session
can achieve the same behavioural outcomes through supported native surfaces:
honest identity, deliberate team membership, canonical capabilities,
bidirectional communications, policy enforcement, lifecycle, and proof.

The repository already owns the durable substance under `.agent/` and the
portable skill projection under `.agents/skills/` **[R]**. The missing work is
a thin GitHub adapter family plus Copilot-aware boundaries in canonical
tooling. It is not a new Practice, a plugin, a remote service, or a second
policy implementation **[I]**.

This report is intentionally limited to the CLI process running locally,
alongside local Claude and Codex seats. GitHub Copilot coding-agent/cloud
execution-specific delivery, hosted bridges, cross-machine routing, and a
separate Codex delivery programme are outside the ratified scope. Shared
repository instructions and capabilities still target parity across local and
cloud Copilot wherever the same projection is consumed.

## What first-class means

| Layer | Observable bar | Current repository state | Delivery |
| --- | --- | --- | --- |
| Identity | Stable, model-visible identity with truthful Copilot provenance | Canonical identity types do not yet admit Copilot **[R]** | MCP-154 |
| Deliberate membership | Native startup creates no shared coordination state; any working session registers a bounded claim before its first edit; `oak-start-right-team` adds continuous participation — heartbeat, watcher, and lifecycle | No Copilot bootstrap/join projection exists **[R]** | MCP-154 |
| Canonical capability | Instructions, skills, specialist agents, and MCP tools reach the CLI without a second authority | Repo-wide pointer and portable skills exist; other GitHub projections are absent **[R]** | MCP-155 |
| Policy | Valid writes receive one canonical decision through Copilot's real input/output contract | Copilot CLI 1.0.75 string-form `apply_patch` is governed; other Copilot schemas and the closed dispatcher remain unwired **[V][R]** | MCP-150 |
| Communications | Directed/broadcast send, wake, drain recovery, handoff, and retirement work on the local shared substrate | The substrate exists; no Copilot notification/lifecycle projection is wired **[R]** | MCP-156 |
| Proof | Fresh-checkout validators and a live CLI run demonstrate the whole journey | No end-to-end Copilot CLI acceptance record exists **[R]** | All four |

The table separates **target** from **wired state**. Ratification authorises the
target; it does not turn missing runtime paths green.

## Findings

### 1. Honest identity has a native seed

The observed local process exposed Copilot-specific environment signals,
including a stable session UUID, but the public contract for model-visible
identity is the `sessionStart` hook input's `sessionId` **[V][D]**. The
repository's existing UUID-v5 identity pipeline can consume that signal; it
does not need a Copilot-specific naming algorithm **[R][I]**.

The native session-start adapter should return Copilot CLI's documented
`additionalContext` shape **[D]**. A Claude hook response wrapped in
`hookSpecificOutput` is not a valid substitute for that Copilot-native output
**[R][I]**. Shell-only environment variables may assist a version-tested
launcher, but they must not be relabelled as Codex or Claude provenance and
must not become the only identity source **[I]**.

### 2. Native bootstrap and team join are different acts

Every Copilot CLI session in the repository should receive enough context to be
useful and honest **[I]**. Startup itself creates no shared coordination state
**[I]**. That is not a licence to edit uncoordinated: the always-loaded
`register-active-areas-at-session-open` rule requires any working session,
quick-start included, to register a bounded active claim before its first edit
**[R]**. The existing `oak-start-right-team` contract is the deliberate join
into *continuous* team participation: heartbeat emission, the all-channel
watcher, and the handoff/retirement lifecycle **[R]**.

The launcher therefore bootstraps repository and identity context only.
Joined/non-joined behaviour must be proved with negative as well as positive
integration tests **[I]**.

### 3. The inherited defect established the required policy boundary

Copilot CLI 1.0.74 was observed sending a batched pre-tool-use envelope with
`sessionId`, `cwd`, and `toolCalls[]`; each call carried `id`, `name`, and
serialised `args` **[V]**. This was the **inherited Claude-compatibility
activation**, not GitHub's documented native hook contract. The inherited
Claude Edit matcher fired for Copilot `create` and `apply_patch` calls **[V]**.

The repository parser expects Claude-style `tool_input`/`toolInput` or
top-level content fields **[R]**. It could not extract writable content from
the Copilot batch, returned the fail-closed error path, and Copilot correctly
denied the write **[V][R]**. The policy itself did not reject the content; its
platform boundary could not represent the request **[I]**.

The later live falsification on Copilot CLI 1.0.75 proved that the inherited
PascalCase `PreToolUse` activation is the local CLI policy activation **[V]**.
The merged interim write-path repair now parses Copilot CLI 1.0.75 string-form
`apply_patch` payloads and emits explicit allow/deny decisions **[R][V]**.
That route is governed; other Copilot schemas and the complete
closed-dispatcher target remain unwired.

The observed batch and patch-document semantics remain intact in their fixture;
they are never approximated as Claude edit pairs **[I]**. Delivery must admit
the existing Claude shapes, documented Copilot single-tool inputs, and the
observed Copilot batch as closed schemas; exactly one schema must match, or the
dispatcher fails closed. The raw live payload was inspected but deliberately
not retained because tool arguments can contain caller content. Delivery
replaces it with a sanitised literal fixture and reproducible probe record.

### 4. Canonical policy needs a platform-free centre

MCP-150 first extracts one validated policy snapshot and one platform-free
evaluator while keeping production wiring Claude-only **[I]**. Only after that
baseline lands does the Copilot CLI vertical add its closed schemas and
renderer behind the same inherited activation.

This sequencing keeps the first code landing reviewable and protects current
Claude behaviour. Canonical decisions contain no host response shapes;
renderers alone construct Claude or Copilot outputs **[I]**. Synthetic adapters
exercise arbitration in baseline tests without planting dormant Copilot or
Codex production branches.

### 5. One inherited activation feeds one closed authority

GitHub documents native repository hooks under `.github/hooks`, but those
files also run in Copilot cloud-agent jobs **[D]**. That surface cannot host a
local-CLI-only policy adapter. For a tested supported version, the inherited
PascalCase `PreToolUse` activation is the sole Claude/Copilot policy
activation. One bounded dispatcher requires exactly one closed host schema,
loads one validated policy snapshot, evaluates once, and renders the matched
host's response. Zero or multiple matches, malformed matched input, and
renderer failure fail closed **[I]**.

The exact-once claim applies to **successfully dispatched** requests. GitHub's
hook timeout is a host fail-open ceiling: a timed-out hook may not have
completed an evaluation, so timeout cannot be advertised as exact-once proof
**[D][I]**.

### 6. Skills already have a suitable repository home

GitHub documents Copilot CLI skill discovery in this precedence order:
`.github/skills`, `.agents/skills`, then `.claude/skills`, with the first
matching skill taking precedence **[D]**. The repository already generates
canonical thin wrappers under `.agents/skills/` **[R]**.

The correct delivery is therefore to test and document that precedence while
keeping `.agents/skills/` as this repository's chosen Copilot skill home.
Generating duplicate `.github/skills/` wrappers would create a third adapter
surface and a new drift opportunity without adding capability **[I]**.

### 7. Instructions need supported, bounded projections

The existing `.github/copilot-instructions.md` is a Markdown link to
`AGENT.md`, not yet a validated Copilot import projection **[R]**. GitHub
documents the repo-wide instruction file and recursive path-specific files
under `.github/instructions/**/*.instructions.md` **[D]**.

The repo-wide file should import `AGENT.md`, intentionally giving both local
Copilot CLI and Copilot cloud agent the same canonical rule set as every other
agent. Each rule is also classified repo-wide, path-projected, or excluded
with a reason for the separate modular-projection decision. Those labels do not
filter canonical rule inclusion: they decide only whether an additional
path-scoped contextual copy is useful. Path-scoped projections require valid
`applyTo` metadata and tests for positive, negative, recursive,
comma-separated, and simultaneous-match behaviour. They
must not copy the full rule corpus or use `@` imports, which GitHub does not
expand inside modular instruction bodies **[D][I]**. Because GitHub repository
instructions are also consumed by cloud surfaces, every emitted instruction
must be classified `cloud-shared` or `cloud-excluded` — labels that state the
intended disposition and the marker it emits, not a proven platform outcome —
and a `cloud-excluded` modular instruction emits
`excludeAgent: "cloud-agent"` **[D][I]**.

`excludeAgent` accepts exactly one value, either `"code-review"` (excluding
Copilot code review) or `"cloud-agent"` (excluding the Copilot cloud agent);
the repository-instructions source listed below, verified 2026-07-25, documents
no array, comma-separated, or repeated-key form **[D]**. One surface therefore
always remains in scope, and a projection carrying
`excludeAgent: "cloud-agent"` is still read by Copilot code review. That
residual exposure is a dated fact about the platform rather than a defect in
this repository's generator, so no `.github` instruction projection can be
described as local-only. The marker controls only the supplemental modular copy;
the canonical rule and its behaviour still reach local and cloud Copilot
through `AGENT.md`. No canonical rule is cloud-excluded under the parity
contract. Content that genuinely must not reach a Copilot surface cannot enter
the canonical root rule corpus and requires a separately designed mechanism
**[D][I]**. The capability claim is pinned to the 2026-07-25 documentation and
expires; re-check the current official source before relying on it **[D]**.

This rule parity serves the broader cross-vendor objective: preserve parity of
agent behaviour and abilities wherever Copilot exposes the necessary platform
mechanism. A vendor-specific omission is a defect unless the capability matrix
records an evidenced platform limitation **[I]**.

### 8. Custom agents are a generated adapter family

Copilot CLI discovers custom agents under `.github/agents/*.agent.md` and
supports documented agent frontmatter, tool selection, MCP-server selection,
and model inheritance **[D]**. The repository currently has canonical
specialists and Claude/Cursor/Codex adapters, but no validated GitHub family
**[R]**.

The target is deterministic generation from a total disposition manifest over
every live non-archived canonical specialist, with Copilot tool aliases and no
unnecessary model pin. Every exclusion carries a reason. Forward coverage,
reverse-orphan checks, schema validation, same-ID precedence over
`.claude/agents`, and live invocation prove the family is real rather than
decorative **[D][I]**. Because `.github/agents` is also visible to Copilot
cloud, every generated wrapper must be cloud-safe: no secrets, machine-local
paths, or local-only MCP assumptions, and automatic cloud selection disabled
unless separately accepted **[D][I]**.

### 9. Repository MCP tools require a canonical manifest first

Copilot CLI documents repository MCP configuration in `.mcp.json` and
`.github/mcp.json`, with defined configuration priority **[D]**. This
repository has platform-specific MCP configuration but no canonical
secret-free server inventory and no tracked, validated Copilot CLI projection
**[R]**.

The delivery must first establish a canonical server manifest by reconciling
every server found in tracked platform configuration to an included or
excluded disposition. `.cursor/mcp.json` or another adapter must not silently
become authority. The Copilot projection then generates from that manifest,
remains deterministic on a clean checkout, and contains no credentials or
machine-local paths **[I]**. Personal authentication and secret values remain
local.

### 10. Local comms need no new transport

The Practice already has a local file-backed comms CLI with directed and
broadcast events, durable seen-file cursors, all-channel watch, heartbeat
exclusion, gap sweep, handoff, and retirement semantics **[R]**. Copilot CLI
therefore needs an adapter into the existing substrate, not an MCP bridge or
hosted broker **[I]**.

GitHub documents a CLI-only `notification` hook and a `shell_completed` event
that can return additional context **[D]**. A one-shot watcher can turn a newly
received event into that completion, wake the intended session, and then be
re-armed **[V][I]**. Turn-boundary drain and bounded periodic checks remain
recovery, not the primary transport.

The acceptance suite must prove burst handling, cursor advancement, ordering,
duplicate tolerance, re-arm gaps, peer liveness, and cleanup. A live local
Copilot CLI seat must then demonstrate wake, reply, handoff, and retirement.

### 11. Installed capability must be probed, not inferred from documentation

The design session observed documentation-versus-installed-version skew: a
documented CLI command was absent from Copilot CLI 1.0.74 **[V][D]**. Every
relied-upon hook, instruction, agent, skill, and MCP surface therefore needs a
tested version floor plus a capability probe before tracked activation is
enabled **[I]**.

The live acceptance seat remains required. Repository fixtures establish the
contract; only a real local CLI process proves that the installed host
dispatches and consumes it.

## Target architecture

1. **Canonical Practice:** `.agent/` remains the authority for doctrine,
   identity contracts, policy, agents, tools, and lifecycle.
2. **Existing portable skill surface:** `.agents/skills/` remains the chosen
   Copilot CLI skill home.
3. **GitHub adapter family:** `.github/copilot-instructions.md`,
   `.github/instructions/`, cloud-safe `.github/agents/`, separately proven
   non-policy lifecycle hooks, and the supported repository MCP projection
   carry only activation metadata, generated projections, or platform I/O.
4. **Canonical MCP manifest:** a new secret-free server inventory is
   established from total dispositions over tracked platform candidates before
   any Copilot MCP projection is generated.
5. **Canonical runtime boundaries:** platform-free policy evaluation, identity,
   comms, and lifecycle remain in `agent-tools`; Copilot modules parse, render,
   probe, and compose.
6. **Deliberate membership:** native startup provides context and creates no
   shared coordination state; bounded claim registration binds any working
   session before its first edit; the team skill opts into continuous
   participation — heartbeat, watcher, and lifecycle.
7. **Executable truth:** stale-output validators, closed-schema tests,
   fresh-checkout tests, and a live local Copilot CLI acceptance record together
   establish support.

## Delivery order

1. **MCP-150:** Claude-only canonical policy baseline, then the Copilot CLI
   adapter and renderer behind the inherited activation.
2. **MCP-154:** one complete identity, launcher, and deliberate-Practice-join
   vertical.
3. **MCP-155:** instructions/skills, specialist agents, then repository MCP
   tools as separate PR-sized slices.
4. **MCP-156:** local wake/drain recovery, then lifecycle and live acceptance.
5. **Closure:** reconcile the target-versus-wired matrix and archive delivery
   plans only after every proof passes.

Runtime work remains gated behind the replacement record pull request that
lands this report, ADR amendment, matrix correction, and ratified plan estate.

## Evidence ceilings

- The observed Copilot CLI 1.0.74 inherited batch was inspected live but its raw
  caller-content-bearing payload was not retained. It establishes the defect;
  a sanitised fixture plus reproducible probe must replace it before delivery.
- Official documentation defines the native single-tool contract. Repository
  tests cannot prove the installed CLI dispatches or consumes it.
- A forced timeout is owner-held host evidence. Vitest may prove local handling
  but must not assert GitHub's wall-clock process-kill behaviour.
- No canonical MCP server manifest exists yet; MCP-155 must establish it before
  generating a Copilot projection.

## Assumptions and falsifiers

| Assumption | Falsifier | Required response |
| --- | --- | --- |
| Native `sessionStart` can deliver identity through `additionalContext`. | A supported CLI build fires the hook but the model receives no context. | Re-shape MCP-154 before activation. |
| One inherited PascalCase activation can route exactly one closed Claude or Copilot schema. | Zero or multiple schemas match, or a recognised Copilot request can bypass evaluation. | Do not land the dispatcher; return MCP-150 to design. |
| `.agents/skills/` supplies the required skill set under documented precedence. | Clean-checkout discovery misses or shadows a required skill. | Correct the projection/precedence contract; do not copy blindly. |
| One-shot watch to `shell_completed` provides a reliable wake edge. | Delivered events fail to wake, re-arm loses events, or unrelated sessions wake. | Keep comms delivery unshipped and re-shape MCP-156. |
| The tracked MCP projection can remain secret-free. | A required server cannot be described without committing credentials or a host path. | Keep that server local and narrow the supported repository set. |

## Explicit non-goals

- GitHub Copilot coding-agent or cloud feature delivery. Shared repository
  surfaces still require explicit cloud-safe dispositions.
- Remote or cross-machine communications.
- A hosted bridge, plugin, task API, or separate Copilot Practice.
- A parallel Codex parity programme.
- Duplicate skill trees, hand-maintained agent copies, or empty speculative
  settings.
- Weakened policy enforcement, timeout-as-success claims, or bypass switches.

## Official sources

- [Copilot hooks reference](https://docs.github.com/en/copilot/reference/hooks-reference)
- [Copilot CLI command reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference)
- [Copilot CLI configuration directory reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-config-dir-reference)
- [Copilot CLI custom instructions](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-custom-instructions)
- [Custom instructions support](https://docs.github.com/en/copilot/reference/custom-instructions-support)
- [Add repository custom instructions](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions)
- [Custom agents configuration](https://docs.github.com/en/copilot/reference/custom-agents-configuration)
