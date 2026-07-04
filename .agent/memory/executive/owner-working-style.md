# Owner Working Style

Durable identity assertions about how the owner approaches engineering
decisions in this repository — load-bearing context when interpreting owner
direction. The agent-to-owner working model that consumes these lives in
[`user-collaboration.md`](../../directives/user-collaboration.md).

- **Phased, gated activation over big-bang integrations.** The owner
  creates explicit decision gates before rolling out large
  infrastructure changes; defaults to staged enforcement (visibility
  before strict). Reflected in ADR-166 (architectural budget system),
  the visibility-before-enforcement layer in plan structure, and the
  evidence-gated promotion bar across PDRs.
- **Capture-and-distill workflows wired into existing processes.**
  The owner builds capture surfaces (napkin, distilled,
  consolidate-docs) that wire into existing processes rather than
  parallel tracking; tools come into the loop, not alongside it.
- **Formalises emergent patterns through explicit graduation.**
  Patterns are captured as candidates first, validated across
  sessions, then graduated to permanent homes via a deliberate
  process. Meta-patterns (the-frame-was-the-fix; tool-error-as-
  question; scope-as-goal) are specifically captured across multiple
  sessions before promotion.
- **Gates advancement on real-world evidence; pauses pending
  validation.** Workstreams are paused on owner direction when
  evidence is needed before further commitment. Owner-directed pause
  is a load-bearing planning move (PDR-026 amendment 2026-04-26),
  not a deferral. External blockers (Vercel, Sentry, Cloudflare)
  also pause workstreams pending validation.
- **Designs formal coordination protocols for multi-agent execution.**
  The owner abstracts lock-contention, joint-decision, and stale-claim
  patterns as infrastructure (active-claims registry, shared comms
  log, decision threads, sidebars, escalations, intent-to-commit
  queue, deterministic identity). The protocol substrate must be
  platform-independent by design.
- **Rejects half-measure compromises on principles.** The owner
  reverts code mid-implementation rather than accept governance
  shortcuts. "WE DON'T HEDGE" is a top-level principle. The 2026-04-29
  doctrine sharpenings (knowledge-preservation absolute; shared-state
  always-writable; never-disable-checks) all originated as owner
  refusals to accept compromise framings.
- **Cures destructive incidents through structure.** After lost work,
  accidental commits, hook bypass, or near-miss failures, the owner
  expects a structural cure — rule, hook, schema, protocol, SKILL
  amendment, or gate — rather than a promise to be more careful.
  Capability is preserved by better boundaries, not by removing useful
  capability from the system.
- **Treats consolidation surfaces as observability infrastructure.**
  Napkin, distilled memory, pending graduations, frictions registers,
  and repo-continuity are live observability surfaces, not clerical
  bookkeeping. Lifecycle tags and fitness warnings are signals to act;
  stale status fields produce silent doctrine drift.

These identity assertions shape how agents should interpret owner
silence (inferred priority on the more principled option), owner
reframes ("this is not the goal" — instrumental work was treated as
terminal), and owner pauses (load-bearing decisions, not idle delay).
