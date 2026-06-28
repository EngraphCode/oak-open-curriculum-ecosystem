# ADR-208: Not specifying a target architecture in SonarQube at this time

- **Status:** Accepted (owner-directed, 2026-06-28).
- **Thread:** `main-sonar-ai-profile-to-zero`.
- **Relates to:** [ADR-040](040-neutral-architecture-and-identity-allowlist.md) (the neutral Core/Libs/Apps
  boundary model and its in-repo enforcement — the architectural source of truth this decision protects).

## Context

SonarQube's architecture capability has two halves. **Read-only:** an auto-derived current-architecture
map and tangle (cycle) detection, refreshed every analysis, plus Context Augmentation that can feed that
structure to an AI agent as context. **Authored:** an **intended (target) architecture** — the allowed
structure and relationships between containers — against which analysis raises deviation issues. Both
Agentic Analysis and Context Augmentation are enabled for `oaknational_oak-open-curriculum-ecosystem`
(org `oaknational`, SonarCloud), so both halves are available to us via the SonarQube MCP server.

This ADR is about the **authored** half. Two facts shape it:

1. **We already have an architectural source of truth, enforced in CI.** The neutral Core/Libs/Apps tier
   model (ADR-040) is enforced by the centralized boundary rules (`app-boundary`, `lib-boundary`,
   `sdk-boundary`) in `@oaknational/eslint-plugin-standards` (`packages/core/oak-eslint`): core takes no
   monorepo dependency outside core and only minimal provider-neutral external deps; libs split into
   foundation and adapter tiers; apps compose core and libs and cannot import other apps. This runs at
   **import precision** on every lint, and lint is a blocking gate. It is versioned, reviewable, and lives
   next to the code.

2. **SonarQube's intended architecture is authorable only through its UI.** There is no as-code, CLI, or
   API path to define it. The MCP architecture tools (`get_current_architecture`,
   `get_intended_architecture`) are **read-only**, and the former as-code path (the `architecture.json` /
   `.yaml` config with `sonar.architecture.configpath`) was **deprecated for removal in January 2026**.
   Adopting it means hand-drawing and hand-maintaining the model in a web editor.

## Decision

**We will not author a target (intended) architecture in SonarQube at this time.** The repository's
ESLint boundary rules plus the ADR corpus remain the single source of truth for, and the enforcer of,
Oak's architecture. We do adopt the **read-only** half — the current-architecture map, tangle detection,
and Context Augmentation — as an additive, no-second-source-of-truth signal (see Consequences).

## Rationale

Authoring the intended architecture in SonarQube would create a **second source of truth** for
constraints we already enforce — coarser (container-granularity, and limited to the analyzer's supported
languages), hand-maintained in a UI rather than versioned with the code, and free to drift from the ESLint
rules that actually gate merges. That is the duplication anti-pattern, not added safety. The principled
alternative — **deriving** a Sonar model from our in-repo source of truth so there is one origin — is
impossible anyway: there is no write API.

The read-only half carries none of that cost: it is auto-derived from the code, needs no authored model,
and cannot drift from a source of truth because it _is_ a view of the code. So the split is clean — decline
the authored model, take the derived signal.

## Consequences

- The ESLint boundary rules and the ADRs stay the architectural source of truth and enforcer. No change to
  how architecture is defined or gated.
- We use SonarQube's current-architecture map and tangle/cycle detection as an **independent check** that
  the code's actual dependency topology matches what the boundary rules claim to enforce, and let Context
  Augmentation surface that structure to agents. This is read-only and additive.
- No Sonar intended-architecture model is created, so no `architectureadmin` permission needs to be
  granted, and there is no second model to keep in sync.

## Revisit triggers

Re-evaluate the authored half if either changes:

- SonarQube ships an **as-code or API/MCP write path** for the intended architecture (removing both the
  UI-only and the second-source-of-truth objections — a model _derived_ from our ESLint config would then
  be on the table).
- Our enforcement gap widens — e.g. a language or boundary the ESLint rules cannot express — such that an
  authored external model would cover a real, otherwise-unenforced constraint.
