# First major release — what, why, why now (working exploration)

A discussion surface, not a plan (owner-commissioned 2026-07-21
evening, after the perspective reset). It holds the owner's asks
distilled, the open questions, and the evidence surfaces we explore
them with. It gets amended as the discussion moves; plans come out of
it, never before it. Authoring budget honours the owner's word:
fifteen-minute passes, not three-day schemas.

## The frame (owner-stated)

We are here to make teachers' lives better. Better planning serves
that — more efficient delivery in the medium term, new ways of
creating digital-first services in the long term — but in the short
term (the three weeks to **2026-08-11**) we must deliver value to
teachers, and everything below balances against that.

## The owner's asks, distilled

Ends first:

1. Settle what we are trying to achieve — **what, why, and why now**.
2. Figure out how we deliver that by 2026-08-11.
3. Structure the work helpfully — for delivery, and for communicating
   intent and progress to stakeholders.
4. Keep everything legible for stakeholders and incoming developers.

Corpus and communication:

5. Create a new, minimal strategic plan + milestone corpus; reflect it
   in Linear and Notion.
6. Audit that no internal information has leaked into the public
   vision or strategy.
7. Produce decision-complete implementation plans; build them — in
   time, in order.
8. Efficiency improvements only where the return lands inside the
   three-week window.

Product surface:

9. Stop exposing everything currently served as an MCP **prompt** —
   isolate, don't delete.
10. Differentiate skills exposed via MCP (tools/resources) from the
    development/engineering skills defined in the repo.
11. Keep the under-the-hood **workflow** — it is not a skill, and not
    part of the MCP app. (Open reading to confirm: the live server
    currently exposes `oak-under-the-hood` as a tool and a resource
    pointer — this ask reads as "remove that exposure, keep the repo
    workflow"; confirm before acting.)

Architecture and estate:

12. Figure out how PostHog, Sentry, Clerk, and OTel fit together.
13. Relate the four landed documents
    (`.agent/reports/initial-release-supporting-docs/`) to existing
    plans; let that inform the new tightly-scoped corpus.
14. Decide what happens to the original plan corpus now, what happens
    to it after release, and how that is guaranteed rather than hoped.

## The open questions (the ones the list didn't ask)

1. **The teacher question.** What can a teacher — or the stakeholder
   watching on their behalf — do on 12 August that they couldn't do
   before? If the honest answer is "nothing visible; this release is
   credibility and infrastructure", choose that out loud; it redefines
   "value" for every other item.
2. **The positive definition.** The asks subtract (prompts, leaks,
   exposure); what does the release positively contain? Which tools
   and resources are the released surface, is search quality good
   enough to carry Oak's name in a directory, and what artifact is
   actually submitted where? Bet-check: APP-2 (Oak recognisable in the
   host's output — attribution/provenance) has zero items anywhere.
3. **Definition of done.** Submitted to the directory, or accepted?
   (Acceptance runs on Anthropic's clock.) Who formally accepts the
   release, on what evidence — and what would make it a failure even
   if everything ships?
4. **The human critical path.** Production Clerk provisioning, PostHog
   org creation, directory submission, every owner-held card — these
   are the owner's hours and vendors' queues. What is the owner's real
   availability across the window, the weekly owner-attention budget,
   and which legs can slip without sinking the release?
5. **Checkpoints.** One cliff on 11 August is a risk shape. What is
   showable at the end of week one and week two — and those proof
   points feed the stakeholder rhythm, which needs a cadence and an
   owner, not just a structure.
6. **Evidence before intent.** The live deployment already answers
   questions: who uses it today, what UAT verified, what breaks. The
   goals discussion starts from that reality, not from documents.
7. **The statutory tail.** Beyond the leak audit: licensing conditions
   on curriculum content redistributed through third-party assistants,
   attribution obligations, terms of use, safeguarding posture. What
   must be legally and policy-true before public distribution?
8. **12 August.** Who operates the released thing, what is the
   incident posture, and what does PostHog exist to learn — feeding
   which next decision? The release is a beginning.
9. **Window-mode.** Which existing ceremony is suspended for three
   weeks (not just "no new process")? Practice sized for a large fleet
   is running at a fleet of one or two.

## Evidence surfaces and access constraints

- **The live app** — served into this session as the `oak-curriculum`
  MCP server (production deployment). First observation, zero calls:
  the released tool surface is **41 tools** — search, fetch,
  browse/explore, ~35 curriculum entity/graph tools, `get-rate-limit`,
  and `oak-under-the-hood` (see ask 11).
- **The code** — this repository.
- **Linear** — the MCP App Pathfinder team and MCP Live project;
  progress must stay real (no false In Progress, milestones with real
  issues).
- **Sentry** — errors and operational truth for the deployed server.
- **Clerk via MCP** — **READ ONLY unless the owner says otherwise, and
  ONLY the MCP app project — never any other Clerk project**
  (owner-set, 2026-07-21). Identity/instance reality for question 6.
- **Owner-held**: the Notion strategy layer (strictly read-only, never
  in version control — the fence enforces the never-in-VC half).

## How this document is used

Each discussion settles one question or ask; its outcome is recorded
here in place (dated), and only settled ground graduates into the
corpus as a plan. The probe results that inform an answer are noted
beside it. Nothing in this file is immutable; it is the conversation's
memory, not doctrine.
