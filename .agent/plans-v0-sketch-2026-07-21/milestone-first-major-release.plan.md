---
id: milestone-first-major-release
node_type: plan
name: "First major release: MCP distribution-ready"
overview: The Oak MCP runs on production Clerk auth, observes its own use safely, and exists as submittable packages by 2026-08-11.
kind: executable
serves_strategic_choice: APP-4
thread: curriculum-mcp-path-to-ga
last_updated: 2026-07-21
derives_from:
  - Owner release directive 2026-07-21 (six points) + D1 ratification (definition + 2026-08-11, MCP-51)
  - clerk-mcp-authentication-report.md (owner document, 2026-07-21)
  - cross-platform-mcp-app-and-skills-packaging.md (owner document, 2026-07-21)
  - posthog-mcp-elasticsearch-observability-plan.md (owner document, 2026-07-21)
  - one-html-many-css-compositions.md (owner document, 2026-07-21)
depends_on:
  - plan: release-planning-corpus-reset
    kind: beneficial
todos:
  - id: lane-clerk-production
    content: "Clerk production hardening — production instance promotion, key migration runbook, OAuth proxy + PRM production config, rollback path (calendar-critical, starts first; MCP-67)."
    status: pending
  - id: lane-posthog-basic
    content: "PostHog basic integration under the ratified Phase-1 posture — MCP Analytics + search events, EU residency, no person profiles, boundary validator (MCP-63)."
    status: pending
  - id: lane-skills-quarantine
    content: "MCP skill-surface quarantine per the D2 ruling — under-the-hood KEEP (pending MCP-52 ratification), Ring-2 labelling landed (#466); lands first, gates packaging."
    status: pending
  - id: lane-plugin-packaging
    content: "MCP plugin packaging + submissions — packaged forms per platform with the packed-form smoke truth-set as acceptance, Anthropic directory criteria review (MCP-16)."
    status: pending
    depends_on: [lane-skills-quarantine]
---

# First major release: MCP distribution-ready

The corpus root node. Owner-ratified definition (D1, 2026-07-21): the
Oak MCP (a) runs on production Clerk authentication, (b) observes its
own use safely via the PostHog basic integration under the Phase-1
privacy posture (D3), and (c) exists as submittable packages, with
MCP-exposed skills quarantined (D2) and the Anthropic
software-directory criteria reviewed. **Target: 2026-08-11.** The
governing decisions live in the Linear project document "Release
decisions record — owner-ratified" (current dispositions, revisable by
the owner; this plan re-anchors when they change).

## Goal

A teacher-facing Oak MCP that Oak can distribute: production auth, safe
self-observation, and packages a vendor directory will accept — shipped
through vendor collaboration (APP-4).

## Acceptance (falsifiable)

- `repo-safe` — packaged forms pass the per-platform packed-form smoke
  truth-set (testing-strategy §Smoke Tests) in CI.
- `repo-safe` — the PostHog emitting boundary's validator proves the
  no-content / no-person-profile rules (red-first in its PR).
- `owner-held` — production Clerk promotion verified by the owner in
  the Clerk dashboard; verification recorded on the lane's Linear
  ticket.
- `owner-held` — analytics events visible in the PostHog EU project
  from the deployed server; owner-confirmed on MCP-63.
- `owner-held` — submission review against the Anthropic directory
  policy recorded on MCP-16.

## Slices

Each lane above is an independent delivery plan authored by its
implementer at pickup (delivery template; ≤2-round PDR-132 budget per
PR; lanes route as their own gates clear — ship-independent,
coordinate-dependent).

## Decision gates (dated)

- Gate 1 — milestone definition + date: **ratified 2026-07-21** (MCP-51).
- Gate 2 — skills delete-vs-quarantine: ring ruled 2026-07-21; final
  ratification of the two drafts open on MCP-52 (needed before the
  quarantine lane's PR lands; asked 2026-07-21, needed by 2026-07-24).
- Gate 3 — PostHog posture: **ratified in full 2026-07-21** (MCP-53).
- Gate 5 — proof-typed-todos scope: open on MCP-54 (letter reading
  recommended; binds only authoring style, blocks no lane; asked
  2026-07-21, needed by 2026-07-28).

## Out of scope

- Teacher-facing workflow features beyond what distribution requires —
  the public-alpha workflow arc (MCP-11) is planning-only this window.
- Phase-2 analytics identity and the two privacy-sensitive canaries —
  deferred past this release by D3.
- The full plan-corpus V0 migration and the intent graph — resume
  after this release (corpus-reset plan, backlog README).
