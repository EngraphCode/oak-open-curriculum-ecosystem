# PostHog MCP analytics — evidence pack for Oak's privacy and compliance specialists

**Status: approved by the owner, 28 July 2026. Route: the owner takes this brief to Oak's privacy and compliance specialists directly.**
Work authority: [Linear MCP-281](https://linear.app/oaknational/issue/MCP-281/privacy-specialist-evidence-pack-and-recorded-dpocompliance) (parent [MCP-173](https://linear.app/oaknational/issue/MCP-173/posthog-mcp-privacy-and-compliance-readiness-for-october-public-beta)).
Assembled 28 July 2026 by Schooner binds Trench (agent) from approved sources; every claim below is traceable to a named source and date. Nothing in this pack is new policy or new public wording.

## What we are asking

Oak's privacy and compliance specialists are asked to review the proposed PostHog product analytics for the Oak Curriculum MCP app and give their advice, decisions, and approved outcomes. The specialists own their method, terminology, and document set; this pack supplies the system facts, the product purpose, and the chosen data ceiling. Their advice and the approval outcome will be recorded on MCP-173 and the consultation record (below), each entry dated.

**Timing context:** the analytics code is being built this week, but the live PostHog project has never ingested an event (verified 28 July 2026 — `ingested_event: false`). The consultation therefore happens **before first collection**. Compliance controls gate the October public beta; the code itself gates an earlier app-directory submission.

## The system in one paragraph

The Oak Curriculum MCP app runs server-side on Vercel inside third-party AI-assistant hosts (Claude, and others). When an authenticated teacher's AI assistant uses an Oak tool, the Oak server emits one content-free analytics event to Oak's EU PostHog project: which capability was used, when, with what outcome and duration, linked to a pseudonym derived from the verified Clerk user ID by a versioned, destination-scoped keyed HMAC. No prompts, no search text, no tool arguments or responses, no IP addresses, no cookies, no browser SDK. The event allowlist is a strict ceiling enforced at the Oak boundary; PostHog-side redaction is defence in depth only.

## Primary fact source

**The Notion consultation record — "PostHog MCP analytics and privacy consultation"** (under MCP Pathfinder → AI Managed Pages; "last evidence review 26 July 2026") holds the substance. Notion links are deliberately absent from this repository copy per the Notion fence rule; the Notion rendering of this pack carries them. The record holds:

- the agreed measurement model (actor / call / activity window; no protocol-session claim; no conversation tracking);
- the full raw event contract — included fields and the excluded-by-construction list;
- the identity position (pseudonymisation, not anonymisation; no cross-processor person key);
- the owner-decided product approach: strictly-necessary, content-free interaction facts only, because no meaningful universal permission surface exists across MCP hosts — with the retained research on how choice could be offered later;
- the retained ICO/PECR legal and policy research (explicitly not a product decision — held for specialist assessment);
- draft factual wording for specialist consideration (not approved, not published);
- the dated technical probes (package behaviour, serverless delivery, deletion mechanics);
- the controls required before October public beta;
- the decision record (26 July 2026 entries) and the consultation-entry format.

This pack does not duplicate that content; it indexes it and adds the current-date evidence below.

## Live configuration evidence — probed 28 July 2026, first-hand

PostHog project 221775 "Oak Open Curriculum Ecosystem", EU host (eu.posthog.com), read via the PostHog API this morning:

| Fact | Value | Meaning for the review |
| --- | --- | --- |
| `ingested_event` | `false` | Zero events ever collected; consultation precedes collection |
| `event_retention_months` | `84` | Vendor default; **not** the required ≤12-month maximum |
| `events_retention_enforced` | `false` | Retention is not currently enforced; configuring and proving the approved maximum is ticketed as MCP-282, blocked on this consultation |
| `anonymize_ips` | `true` | IP anonymisation on at project level (defence in depth; server-side events carry no client IP by design) |
| `session_recording_opt_in` | `false` | Session replay off |
| `access_control` | `false` | No project-level access restriction is configured yet; least-privilege access and audit ownership is ticketed as MCP-284 |
| `timezone` | `Europe/London` | — |

## Implementation status — 28 July 2026

- The privacy boundary code (allowlist reconstruction, pseudonym projector, final-wire scrubbing) is landed on main with its proof suite; the runtime wiring that would make events flow is in progress this week (Linear MCP-63 and children). No emission path to PostHog is live.
- The keyed-HMAC pseudonym has a golden-vector proof; key non-disclosure is proved in the unit suite at the only scale where key material exists.
- Deletion: PostHog's supported bulk-delete API requires a Person; the design creates one minimal pseudonymous Person row (no person properties) so deletion can be submitted per retained pseudonym version with `delete_events` enabled. Building the find/delete/verify code is MCP-283; running the whole process once for real with kept proof is MCP-291. Neither has run; no synthetic event or live deletion has been attempted.

## Questions for specialist assessment

These are the open matters the retained research identifies as the specialists' to answer — listed as questions, not proposals:

1. **Lawful basis** for the strictly-necessary interaction analytics, given Oak's status as a non-departmental public body (public task vs legitimate interests, and what each requires).
2. **PECR regulation 6 applicability**: whether the complete flow (authentication, MCP protocol, host and embedded-app behaviour, server-side emission) stores or accesses information on the user's terminal equipment.
3. **The statistical-purposes exception**: whether its conditions (information, objection, aggregate outputs, individual-level retention) apply, and what they require here.
4. **Retention**: approval of the raw-event retention period (12 months is the design maximum; a shorter raw period followed by anonymised aggregates is an available alternative).
5. **Transparency**: whether the draft factual wording in the consultation record is an adequate basis for the MCP-specific privacy information, and what the final wording must say (publication path is ticketed as MCP-285). Related live question from the app-directory review (28 July): whether Oak's existing privacy policy text adequately covers this app's data handling.
6. **DPIA disposition**: whether a DPIA is required for this processing, and the RoPA entries needed (the estate register umbrella is MCP-278; Clerk and Sentry entries are MCP-286/MCP-287).
7. **Data-subject rights**: which controls (objection, erasure, access) must have owned, tested implementation paths before public beta, beyond the deletion route already designed.

## Source index

- Consultation record (primary): Notion, "PostHog MCP analytics and privacy consultation" (MCP Pathfinder → AI Managed Pages) — includes the official-sources list (Oak policies, ICO guidance, PostHog and MCP documentation).
- Estate tracking: Notion, "Auth, analytics and privacy — concern tracking" (same location); work authority [MCP-272](https://linear.app/oaknational/issue/MCP-272/auth-analytics-and-privacy-estate-coherence-parent-clerk-posthog).
- Tickets (Linear, "Privacy & DPIA ready" milestone): MCP-173 (parent), MCP-281 (this consultation), MCP-282 (retention), MCP-283/MCP-291 (deletion: build / run-for-real), MCP-284 (access), MCP-285 (privacy notice), MCP-278 → MCP-286/MCP-287 (DPIA register: Clerk, Sentry).
- Repository plans (durable mechanism and proof contracts): `.agent/plans/delivery/mcp-63-posthog-product-analytics.plan.md`, `.agent/plans/delivery/mcp-173-posthog-privacy-governance.plan.md`, `.agent/plans/delivery/mcp-67-clerk-production-promotion.plan.md`.

## Provenance

Assembled from: the Notion consultation record (26 July 2026 evidence review), the Linear estate graph under MCP-272, the repository plans named above, and a first-hand PostHog API read of project 221775 on 28 July 2026. No new policy positions, no new public wording, no legal conclusions are introduced by this pack.
