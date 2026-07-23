---
id: mcp-101-visible-surface-allowlist
node_type: delivery
name: "Visible-surface allowlist: the app serves exactly and only what we intend"
overview: "Zero served prompts; navigation guidance live as agent resources; creation-oriented content dormant behind one declarative allowlist; every tool titled with read-only hints."
status: sketch
ratified_by: null
ratified_date: null
ratified_where: null
serves: first-major-release
impact_areas:
  - served-surface
tickets:
  - MCP-101
depends_on: []
owner_gates: []
last_updated: 2026-07-23
---

# Visible-surface allowlist

## Goal

Assistants see exactly — and only — what we intend, controlled from
one declarative point. When this lands: the app serves no user-invoked
prompt templates at all; the three navigation guides (finding lessons,
exploring the curriculum, following learning progression) are live as
agent-readable resources; the creation-oriented content is retained
but dormant; and every tool declares its title and read-only nature.
This is the state the conformance checks, store screenshots, and
compliance review all trust.

## Mechanism

One structural, registration-time allowlist over tools and resources —
never a runtime flag. The prompt primitive is unregistered entirely;
the seven workflow bodies re-home as resource documents whose
live-vs-dormant state the allowlist governs (the ratified live-set:
navigation three live, creation four dormant). The existing EEF
env-flag gating migrates into the same declarative surface definition
— superseded, not accumulated alongside. The allowlist is the single
point of control the content workspace renders live-vs-dormant from,
and the same point that enforces the branding rule's asset-exposure
audit (no served asset enables Oak-branded generation).

## Acceptance criteria (each with a proof)

1. **The app serves zero prompts.** Proof (`repo-safe`): a test asserts
   the prompts capability is absent/empty at the protocol level, and
   the packaging truth-set records it.
2. **The navigation three are served as agent resources; the creation
   four exist but are not served.** Proof (`repo-safe`): allowlist
   tests assert the exact live resource set; the truth-set snapshot
   matches it.
3. **Every served tool carries a title and a read-only hint.** Proof
   (`repo-safe`): a registration-time test walks the served surface
   and fails on any missing annotation.
4. **One declarative surface definition governs everything served;
   the EEF env flag no longer exists.** Proof (`repo-safe`): the flag
   is absent from the codebase and schema; enabling/disabling any
   surface element is a reviewed change to the one definition, shown
   by test.

## Todos

- Sliced at pickup by the implementer, each slice a single-story PR
  within its round budget (PDR-132).

## Out of scope

- Which content is live: decided (the ratified live-set) — this lane
  implements, it does not re-decide.
- The guidance-content surface: registered through this allowlist but
  delivered by the guidance-pipeline lane.
- The content workspace rendering: consumes the allowlist; built in
  its own lane.
