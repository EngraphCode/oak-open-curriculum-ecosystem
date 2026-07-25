---
id: copilot-cli-practice-projections
node_type: delivery
name: Copilot CLI Practice projections
overview: "Project canonical instructions, skills, specialist agents, and repository MCP tools onto supported Copilot CLI surfaces without creating another authority."
status: ratified
ratified_by: "Jim Cresswell"
ratified_date: 2026-07-24
ratified_where: "Owner in-session word 'Implement the plan', relayed by Director Forge rides Brimstone in collaboration event 444463f6-d93f-41c1-81c5-a39b3205338f"
serves: first-class-copilot-cli-practice-citizenship
impact_areas:
  - practice-and-estate
tickets:
  - MCP-155
depends_on:
  - plan: copilot-cli-identity-and-practice-join
    kind: beneficial
owner_gates: []
last_updated: 2026-07-25
---

# Copilot CLI Practice projections

## Goal

A clean local Copilot CLI checkout discovers the repository's canonical
instructions, existing skills, specialist agents, and MCP tools through
supported first-party paths, with deterministic proof that every projection is
current and thin.

## Mechanism

Keep canonical content in `.agent/`. Bring the repo-wide Copilot instruction
entry point under validated ownership, generate only the path-scoped
instruction and specialist-agent projections that Copilot CLI needs, continue
using `.agents/skills` as the repository's chosen skill home, and generate a
tracked repository MCP projection from a new secret-free canonical server
manifest.

Three total disposition manifests make the source sets recomputable:

1. Every live `.agent/rules/*.md` source is classified `repo-wide`,
   `path-projected`, or `excluded` with a reason, and every emitted instruction
   is separately classified `cloud-shared` or `cloud-excluded`. A path
   projection is selected only when file-scoped activation is expressible
   through Copilot `applyTo` and adds behaviour beyond the repo-wide entry
   point. Local-only instructions must emit the documented
   `excludeAgent: "cloud-agent"` disposition.
2. Every live, non-archived `.agent/sub-agents/templates/*.md` specialist is
   classified `projected` or `excluded` with a reason.
3. Every server found in tracked platform MCP configuration is reconciled into
   or explicitly excluded from the new canonical manifest. No platform adapter,
   including `.cursor/mcp.json`, becomes authority by inheritance.

Platform metadata adapts invocation; it does not copy doctrine.

The minimum shippable shape without the beneficial identity node is
deterministic generation, validation, and live discovery under the host's
native session identity. The identity node improves acceptance-seat
attribution but supplies no required projection primitive.

This repository plan owns the projection contract; versioned mappings and
generated-file manifests land with the implementation. MCP-155 is the
supplementary Linear projection for execution state, sensitive details, and
evidence that cannot be versioned safely.
Every relied-upon Copilot surface is activated only after a tested version
floor and live capability probe for that surface; documentation is evidence
for the probe design, not proof about the installed CLI.

## Acceptance criteria (each with a proof)

- **The repo-wide entry point reaches canonical instructions, and supported
  path-scoped projections cover the total dispositioned rule set.** Proof:
  `repo-safe` — manifest-totality and projection tests require schema-valid
  `applyTo`, positive/negative matching, `**` and `**/*` recursion,
  comma-separated patterns, no `@` imports in modular files, and conflict
  detection when generated projections apply together.
- **Skill discovery uses Copilot CLI's documented precedence
  `.github/skills` then `.agents/skills` then `.claude/skills`, first-found
  wins, while this repository keeps `.agents/skills` as its only chosen
  Copilot skill home.** Proof: `repo-safe` — precedence fixtures and
  stale-output validation; no `.github/skills` duplicate is emitted.
- **Every live non-archived canonical specialist is projected or explicitly
  excluded, and each projection has mapped tool aliases and inherited model
  selection.** Proof: `repo-safe` — disposition-totality, generator, schema,
  forward-coverage, reverse-orphan, and same-ID coexistence tests prove
  `.github/agents` intentionally wins over `.claude/agents`. Because this
  surface is also visible to Copilot cloud, every projection must be
  cloud-safe and emit `disable-model-invocation: true` unless automatic cloud
  selection is separately accepted.
- **A clean checkout exposes the intended repository MCP tools without tracked
  secrets or machine-local paths.** Proof: `repo-safe` — canonical
  server-manifest totality over tracked candidates, deterministic projection
  tests, secret/path validators, and fresh-checkout integration.
- **Instruction projections do not land until a supported-version clean CLI
  loads the repo-wide file and one positive path match while excluding one
  negative path match.** Proof: `repo-safe` — version and discovery fixtures
  plus manifest totality; `owner-held` — the pre-landing local CLI probe. A
  failed or unsupported probe leaves the generated projection untracked.
- **Cloud-exclusion is emitted correctly, and is not claimed as cloud
  BEHAVIOUR until a cloud-agent probe observes it.** The locally-provable half
  is metadata correctness: every projection classified `cloud-excluded` emits
  the exclusion marker its surface defines. Proof: `repo-safe` — disposition
  and manifest-totality fixtures. The other half — that an excluded projection
  does not reach a cloud-agent prompt — is a claim about a different execution
  environment, and no local fixture or local CLI probe can establish it.
  Proof: `owner-held` — a cloud-agent probe observing whether an excluded
  fixture appears in a cloud job's context. Until that probe runs, the
  repository states cloud-exclusion as emitted-and-unverified, never as
  proven: a cloud-behaviour claim resting on local evidence is an assumption
  transmitted as truth.
- **Skill support is not promoted beyond `Partial` until a supported-version
  clean CLI reports the intended `.agents/skills` source and invokes a
  representative same-ID skill without `.claude/skills` shadowing it.** Proof:
  `repo-safe` — precedence fixtures; `owner-held` — discovery and invocation
  transcript. Failure blocks the support claim and any new skill projection.
- **Generated `.github/agents` do not land until a supported-version clean CLI
  discovers and manually invokes a schema-valid representative carrying
  `disable-model-invocation: true`.** Proof: `repo-safe` — schema, disposition,
  and cloud-safety fixtures; `owner-held` — local discovery/invocation probe.
  Failure leaves the generated family untracked.
- **The repository MCP projection does not land until a supported-version
  clean CLI discovers the intended secret-free server and tools and completes
  one representative call.** Proof: `repo-safe` — manifest, secret/path, and
  unsupported-version fixtures; `owner-held` — discovery/call transcript.
  Failure leaves the projection untracked and the server local.
- **A real supported-version local Copilot CLI session proves the repo-wide
  instruction entry point, one positive and one negative `applyTo` projection,
  and discovers and invokes one representative skill, specialist agent, and
  repository MCP tool.** Proof: `owner-held` — the owner runs or observes the
  local Copilot CLI seat and records acceptance evidence on MCP-155 and the
  implementation pull requests.

## Todos

- **Instructions-and-skills PR (round budget: at most two review rounds).**
  Correct the repo entry point, add bounded instruction projections, and prove
  discovery precedence without a third skill adapter tree.
- **Specialist-agents PR (round budget: at most two review rounds).** Generate,
  validate, and exercise the native Copilot CLI agent family.
- **Repository-MCP-tools PR (round budget: at most two review rounds).**
  Establish the canonical secret-free server manifest with total dispositions,
  then generate and validate the tracked repository MCP projection.

## Out of scope

- A Copilot plugin, empty speculative settings, or hand-maintained parity
  files.
- Claude-style `Skill(...)` permissions or settings semantics on Copilot CLI.
- GitHub Copilot coding-agent or cloud feature delivery. Shared repository
  projections still require explicit cloud-safe dispositions.
- Unrelated Codex adapter work.
