---
id: copilot-cli-practice-projections
node_type: delivery
name: Copilot CLI Practice projections
overview: "Project canonical instructions, skills, specialist agents, and repository MCP tools onto supported Copilot CLI surfaces without creating another authority."
status: ratified
ratified_by: "Jim Cresswell"
ratified_date: 2026-07-24
ratified_where: "PR #529 owner ratification record: https://github.com/oaknational/oak-open-curriculum-ecosystem/pull/529#issuecomment-5079688100"
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

## Dated notes

- **2026-07-25** — Corrected current vendor precedence and `excludeAgent`
  arity/residual exposure; added supported-version and fresh-checkout gates
  for instruction, skill, specialist-agent, and MCP projections; made
  `disable-model-invocation: true` the cloud-safe specialist default; and
  replaced the direct `AGENT.md` root import with a disposition-aware bounded
  root projection so excluded/path-scoped rules cannot re-enter transitively.
  The cloud out-of-scope statement is narrowed so shared repository
  projections require explicit cloud-safe dispositions while cloud feature
  delivery remains excluded. These amendments make the original projection
  outcome executable against current platform facts without adding a new
  projected capability family.

## Goal

A clean local Copilot CLI checkout discovers the repository's canonical
instructions, existing skills, specialist agents, and MCP tools through
supported first-party paths, with deterministic proof that every projection is
current and thin.

## Mechanism

Keep canonical content in `.agent/`. Bring the repo-wide Copilot instruction
entry point under validated ownership as a bounded generated projection from
the disposition manifest — never a direct `AGENT.md` import, whose non-loader
instruction would re-load every rule. Generate only the path-scoped instruction
and specialist-agent projections that Copilot CLI needs, continue using
`.agents/skills` as the repository's chosen skill home, and generate a tracked
repository MCP projection from a new secret-free canonical server manifest.

Three total disposition manifests make the source sets recomputable:

1. Every live `.agent/rules/*.md` source is classified `repo-wide`,
   `path-projected`, or `excluded` with a reason, and every emitted instruction
   is separately classified `cloud-shared` or `cloud-excluded`. Those two
   labels record the intended disposition and the marker it emits; neither
   asserts a proven platform outcome. The same manifest generates the bounded
   repo-wide root projection from `repo-wide` sources only; `path-projected`
   and `excluded` sources must be unreachable through that root, including by
   transitive imports. A path projection is selected only when file-scoped
   activation is expressible through Copilot `applyTo` and adds behaviour
   beyond the bounded root entry point. A `cloud-excluded` instruction must
   emit the documented `excludeAgent: "cloud-agent"` frontmatter.
   Provenance: GitHub's repository custom-instructions documentation, verified
   first-hand 2026-07-25, defines `excludeAgent` as taking exactly one value,
   either `"code-review"` or `"cloud-agent"`, with no array, comma-separated,
   or repeated-key form. So `cloud-agent` is the correct literal for excluding
   the Copilot cloud agent and must not be "corrected" to another spelling,
   and `"code-review"` is the separate value that excludes Copilot code review.
   Because only one value may be set, one surface always stays in scope: a file
   carrying `excludeAgent: "cloud-agent"` is still read by Copilot code review.
   That residual exposure is a dated fact about the platform, not a defect in
   our generator, and it means no `.github` instruction projection is
   local-only. Disposition rule: where a projection's content must reach
   neither Copilot surface, `.github` instructions are the wrong home and the
   content stays in `.agent/`. This capability claim is pinned to the
   2026-07-25 documentation and expires — a later reader re-checks GitHub's
   current documentation rather than trusting this line.
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

- **The bounded repo-wide entry point contains only `repo-wide` dispositions,
  while supported path-scoped projections cover their total dispositioned
  rule set and excluded sources are unreachable through either route.** Proof:
  `repo-safe` — manifest-totality and reverse-reachability tests reject direct
  or transitive `AGENT.md`/`RULES_INDEX.md` imports, require schema-valid
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
  fixture appears in a cloud job's context. That probe's claim is bounded to
  the cloud agent alone. Because `excludeAgent` takes exactly one value
  (documentation verified 2026-07-25), a projection carrying `"cloud-agent"` is
  still read by Copilot code review, so an owner-held probe of the cloud agent
  establishes cloud-agent exclusion and nothing wider; establishing anything
  about the code-review surface needs a separate probe with `"code-review"` set
  instead, and the two cannot hold at once. No probe of either surface can
  therefore establish local-only, and content requiring that stays in
  `.agent/`. Until the cloud-agent probe runs, the repository states
  cloud-exclusion as emitted-and-unverified, never as proven: a cloud-behaviour
  claim resting on local evidence is an assumption transmitted as truth.
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
