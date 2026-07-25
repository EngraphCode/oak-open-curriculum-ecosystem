---
id: copilot-cli-identity-and-practice-join
node_type: delivery
name: Copilot CLI identity and deliberate Practice join
overview: "Give local Copilot CLI sessions honest native identity and a useful bootstrap while preserving oak-start-right-team as the deliberate team boundary."
status: ratified
ratified_by: "Jim Cresswell"
ratified_date: 2026-07-24
ratified_where: "Owner in-session word 'Implement the plan', relayed by Director Forge rides Brimstone in collaboration event 444463f6-d93f-41c1-81c5-a39b3205338f"
serves: first-class-copilot-cli-practice-citizenship
impact_areas:
  - practice-and-estate
tickets:
  - MCP-154
depends_on: []
owner_gates: []
last_updated: 2026-07-25
---

# Copilot CLI identity and deliberate Practice join

## Goal

A local Copilot CLI process starts with repository context and truthful Copilot
identity, remains useful without team side effects, and can deliberately enter
the shared Practice by invoking `oak-start-right-team`.

## Mechanism

Extend canonical identity and persistence with Copilot as an honest platform,
seed model-visible identity from the documented native session-start event,
and project it through a thin local launcher/bootstrap. Keep identity bootstrap
separate from team enrolment: only the team skill opens claims, starts
heartbeats and the all-channel watcher, and registers lifecycle state.

This repository plan owns the mechanism and acceptance contract. MCP-154 is
the supplementary Linear projection for execution state, sensitive details,
and evidence that cannot be versioned safely.

## Acceptance criteria (each with a proof)

- **Copilot identity uses Copilot's own documented session signal and remains
  stable across the local session.** Proof: `repo-safe` — identity schema,
  derivation, persistence, and provenance tests.
- **Native startup makes repository and identity context model-visible through
  Copilot CLI's documented output shape.** Proof: `repo-safe` — launcher and
  session-start integration tests with literal fixtures. Before tracked
  activation, a supported-version floor and live capability probe must prove
  that the installed CLI fires `sessionStart` and accepts the required
  `additionalContext` output.
- **Ordinary local startup creates no team claims, heartbeat, watcher, or
  lifecycle registration.** Proof: `repo-safe` — negative integration test
  over an isolated coordination home.
- **`oak-start-right-team` deliberately joins the same coordination home and
  makes the session addressable to existing peers.** Proof: `repo-safe` —
  lifecycle integration test using isolated local state.
- **A real local Copilot CLI session demonstrates stable identity before and
  after deliberate join.** Proof: `owner-held` — acceptance evidence recorded
  by the owner, who runs or observes the local Copilot CLI seat, on MCP-154 and
  the implementation pull request.

## Todos

- **Identity-and-join vertical PR (round budget: at most two review rounds).**
  Extend canonical types, derivation, persistence, and validators together
  with the native session-start projection and joined/non-joined proof. No
  dormant Copilot identity branch lands ahead of its observable host vertical.

## Out of scope

- Automatic team enrolment on every Copilot CLI start.
- GitHub Copilot coding-agent or cloud identity.
- Remote coordination homes or cross-machine transport.
