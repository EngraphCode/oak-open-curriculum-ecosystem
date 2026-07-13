# ADR-211: Inter-Practice Collaboration — Host Phenotype

- **Status:** Accepted (2026-07-06; authored in the coordinated cross-estate WS0 session,
  Lapwing herds Eyrie).
- **Mirrors:** [PDR-125: The Inter-Practice Collaboration Protocol](../../../.agent/practice-core/decision-records/PDR-125-inter-practice-collaboration-protocol.md)
  — the portable doctrine. This ADR is the host half: how this repo realises the protocol's
  mechanics. The controlling plan in the agent-tooling lane owns the HOW and the remaining
  workstreams (per PDR-105, doctrine states WHAT and does not cite plans).
- **Relates to:** [ADR-209](209-planning-vocabulary.md) (the PDR-mirrors-ADR host-instantiation
  pattern this follows).

## Context

PDR-125 ratifies the inter-Practice collaboration protocol: repo-reference vocabulary,
coordination-home declaration, the join ceremony, foreign-substrate discipline, join-key identity
display, shared-spec/shared-schema versioning, and the concepts-vs-pointers exchange layering.
The portable PDR deliberately names no host mechanics. This ADR records WHAT this repo's phenotype
is, so the protocol's clauses resolve to concrete surfaces here.

## Decision

- **Coordination-home declaration (clause 2):** the `PRACTICE_COORDINATION_HOME` environment
  variable, resolved in `resolveCoordinationHome` (agent-tools collaboration-state) with the
  order: explicit CLI flag, then the environment variable, then git-native resolution; a declared
  home that is missing or holds no recognisable substrate fails loudly (landed 2026-07-06).
- **Join-key display (clause 5):** the statusline identity segment renders
  `<name> (<session_id_prefix>)`; a missing prefix renders `unknown` per PDR-027 (landed
  2026-07-06).
- **Home tooling (clause 4):** the `@oaknational/agent-tools` collaboration-state CLI is the ONLY
  write path into this repo's collaboration plane at `.agent/state/collaboration/` — guest
  sessions included, liveness files included.
- **Ceremony and trigger:** the portable skill `inter-practice-collaboration`
  (`.agent/skills/inter-practice-collaboration/SKILL-CANONICAL.md`) is the runnable join ceremony;
  the portable rule `cross-repo-sessions-run-the-join-ceremony` fires it on the cross-repo
  condition. Amended 2026-07-13 to mirror the owner's 2026-07-08 scoping rulings: read-only
  estate looks are unceremonied, and a solo write into a QUIET estate takes the lighter
  governance-only path (write governance + a fresh branch off the latest main); the full ceremony's
  machinery binds at the first comms write, claim, or registration (PDR-125 clause 3).

## Consequences

A visiting session can join this estate with zero prior knowledge: the rule fires, the skill
enumerates the ceremony, the PDR carries the doctrine, and the mechanics above are the host
surfaces the ceremony touches. The remaining protocol workstreams (repo-qualified claims WS2, the
conformance self-report WS0c, the shared schema WS0e) extend this phenotype and amend this ADR
when they land.
