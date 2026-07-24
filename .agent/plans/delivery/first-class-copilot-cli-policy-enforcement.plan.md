---
id: first-class-copilot-cli-policy-enforcement
node_type: delivery
name: First-class Copilot CLI policy enforcement
overview: "Extract the canonical policy boundary through a Claude-only baseline, then add one native Copilot CLI enforcement vertical with no duplicate evaluation."
status: ratified
ratified_by: "Jim Cresswell"
ratified_date: 2026-07-24
ratified_where: "Owner in-session word 'Implement the plan', relayed by Director Forge rides Brimstone in collaboration event 444463f6-d93f-41c1-81c5-a39b3205338f"
serves: first-class-copilot-cli-practice-citizenship
impact_areas:
  - practice-and-estate
tickets:
  - MCP-150
depends_on: []
owner_gates: []
last_updated: 2026-07-24
---

# First-class Copilot CLI policy enforcement

## Goal

Local Copilot CLI writes are governed by the same canonical repository policy
as Claude writes, but each host is parsed and answered through its own closed
contract. A supported Copilot CLI request receives one policy decision rather
than being blocked by a Claude-shaped parser or evaluated twice.

## Mechanism

First land a complete Claude-only production composition over one validated
policy snapshot and one platform-free evaluator. Then add a native Copilot CLI
adapter and renderer behind the same closed dispatcher. Explicit activation
selects the host adapter. Native GitHub `preToolUse` owns Copilot CLI
evaluation through its documented single-tool input. The observed
version-pinned inherited Claude batch is a separate compatibility route: its
activation provenance is explicit, it returns a neutral pass-through, and it
loads no policy and performs no evaluation.

Fixture provenance, composition details, and execution evidence stay in
MCP-150. The failure contract is versioned here:

| Route or failure | Required result |
| --- | --- |
| Explicit Claude route, valid supported envelope | Load one snapshot, evaluate once, and render the unchanged Claude result |
| Explicit native Copilot route, valid documented single-tool envelope | Load one snapshot, evaluate once, and render the native Copilot decision |
| Explicit inherited Copilot compatibility route | Return neutral host success with zero policy loads and evaluations, regardless of the compatibility body; this route may exist only while native activation is proven present |
| Malformed selected native input or renderer failure | Fail closed with the selected host's boundary error when the hook completes before timeout |
| Shared synthetic arbitration with zero or multiple matches | Fail closed; never guess a platform |
| Missing built runtime | Preserve the current loud fail-open bootstrap contract; support is not claimed until the build/probe passes |
| Present but broken built runtime | Fail closed |
| Unsupported or unprobed Copilot CLI version | Do not claim or enable supported activation; an invoked dispatcher fails closed with an unsupported-host error |
| Host-enforced timeout | Host fails open; zero completed evaluations is permitted and must be reported |

## Acceptance criteria (each with a proof)

- **The Claude baseline preserves every existing observable allow, deny, error,
  and output behaviour while reading and parsing one policy snapshot per
  request.** Proof: `repo-safe` — unchanged regression expectations plus
  injected-dependency unit and integration tests for both existing Claude
  envelope shapes.
- **Canonical decisions contain no Claude or Copilot response shapes, and the
  production baseline contains only Claude adapters.** Proof: `repo-safe` —
  compiler/type-checking, boundary tests with synthetic arbitration adapters,
  and structural dependency validation.
- **Native Copilot CLI single-tool inputs are parsed faithfully and rendered
  through the documented native decision schema.** Proof: `repo-safe` —
  versioned literal fixtures and closed-schema unit tests covering valid,
  malformed, unknown, and renderer-failure inputs.
- **The version-pinned inherited compatibility batch returns neutral success
  with zero policy loads and evaluations.** Proof: `repo-safe` — the observed
  batch fixture, malformed/unknown bodies, and trap dependencies prove that
  activation provenance selects the no-op route before schema arbitration.
- **Each successfully dispatched Copilot CLI write request produces exactly one
  policy evaluation; native and inherited activation cannot double-run.**
  Proof: `repo-safe` — deterministic injected in-process routing/count tests
  plus the pre-tool-use routing validator; a separately classified smoke/system
  harness proves real multi-process coexistence.
- **The host timeout is recorded as a fail-open ceiling, not as proof that every
  request was evaluated.** Proof: `repo-safe` — timeout-path tests and operator
  documentation use that exact contract without wall-clock ceilings in Vitest.
- **Fresh-checkout activation preserves the documented missing-versus-broken
  runtime distinction.** Proof: `repo-safe` — a smoke/system harness proves a
  loud fail-open with missing build output, native enforcement after build, and
  fail-closed behaviour for a present but broken runtime.
- **A real local Copilot CLI session performs an allowed create and patch,
  receives a native denial for a policy violation, proves inherited
  compatibility causes no second evaluation, and observes a forced timeout
  that may complete zero evaluations.** Proof: `owner-held` — the owner runs or
  observes the local Copilot CLI acceptance seat and records correlated
  evidence on MCP-150 and the implementation pull request.

## Todos

- **Claude vertical-baseline PR (round budget: at most two review rounds).**
  Two atomic green TDD commits: validated snapshot/platform-free evaluation
  first; closed Claude adapter/renderer/dispatcher and complete activation
  migration second. Delete the old runners and update every structural
  consumer in that landing.
- **Copilot CLI vertical PR (round budget: at most two review rounds).** Add the
  native single-call adapter and renderer, inherited neutral route,
  supported-version probe, sole-authority activation, routing validation,
  clean-checkout system harness, and live CLI acceptance as one complete
  vertical.

## Out of scope

- Codex policy adapters or activation; they are not part of Copilot CLI
  citizenship.
- GitHub Copilot coding-agent or cloud execution.
- New policy rules, weakened denials, bypass switches, or a second policy
  implementation.
- Copilot CLI identity, Practice projections, and communications; their own
  delivery nodes hold those proofs.
