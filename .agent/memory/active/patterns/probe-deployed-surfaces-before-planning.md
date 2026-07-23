---
name: Probe Deployed Surfaces Before Planning
polarity: anti-pattern
use_this_when: Authoring or reviewing any plan, owner card, or adjudication about a DEPLOYED surface (a live service, domain, auth realm, vendor integration) — before decisions or questions are drafted
category: planning
proven_in: >-
  MCP-67 Clerk-promotion instance (2026-07-21): plan + owner cards asked
  domain/staging questions answerable by 30 seconds of curl against the
  live deployment; two reviewer rounds shared the blind spot. Extended
  one ring out the same day: the Director's post-landing read also
  called the plan sound without probing — three artefact-verifiers
  agreeing is not ground truth. Generalised 2026-07-22 (MCP-63): the
  grounding set for a vendor integration includes the ORGANISATION'S
  existing practice with that vendor (a sibling repo already ran the
  vendor; nobody in the chain consulted it).
proven_date: 2026-07-22
barrier:
  broadly_applicable: true
  proven_by_implementation: true
  prevents_recurring_mistake: "Plans, owner cards, and review verdicts about live systems grounded entirely in docs, ADRs, and code — asking the owner questions the running system answers, framing greenfield ceremony where a config swap suffices, and reviewer chains that all verify artefacts while nobody probes the deployment"
  stable: true
---

> **POLARITY: ANTI-PATTERN.** The failure shape is artefact-only
> grounding for a deployed surface. The cures are the paired positive
> moves below. Vendor-docs sibling:
> `.agent/rules/verify-vendor-call-shapes-at-plan-author-time.md`
> (that rule verifies the VENDOR's surface; this pattern verifies OUR
> live surface — the MCP-67 miss held with the vendor rule satisfied).

## Failure shape

A plan, card set, or adjudication about a deployed surface is grounded
in documents, ADRs, and code — never the running system. The plan then
asks the owner questions the deployment answers ("what domain? what
realm?"), frames work as greenfield that is actually a config change on
a live, verified service, and every reviewer in the chain shares the
blind spot because reviewers verify artefacts by default. The owner's
diagnostic question: *"did you explore the code before you asked the
questions?"* — and the deployment is part of the code.

## Cures

- **Probe first, then plan**: before authoring anything about a
  deployed surface, probe it first-hand — metadata endpoints, challenge
  shapes, env/realm reality, response headers. Minutes of curl reframe
  hours of planning.
- **The probe joins the evidence base**: deployed-surface plans AND
  their review/adjudication verdicts require a first-hand deployment
  probe in the cited evidence. Artefact-only grounding plus
  artefact-only review is a collective blind spot, not redundancy.
- **Ground in the organisation's existing practice**: for vendor
  integrations, the grounding set includes where the org already runs
  that vendor (grep the sibling estates), not just the vendor's docs
  and the local repo.
