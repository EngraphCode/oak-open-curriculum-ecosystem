---
fitness_line_target: 120
fitness_line_limit: 180
fitness_char_limit: 12000
fitness_line_length: 100
drain_strategy: "Extract settled entries to permanent docs (ADRs, PDRs, governance, READMEs, patterns)"
merge_class: curated-learning-register
fitness_content_role: drainable-buffer
fitness_rationale: >-
  Lowered 2026-05-25 after owner-requested processing through `oak-consolidate-docs`.
  The active file carries the conservation role and graduation pointers.
  Falsifiability: if a napkin rotation adds high-signal learning that has no
  stable permanent home, preserve it first and revise the envelope by substance
  rather than trimming the lesson.
---

# Distilled Cross-Session Lessons

A brief staging surface for cross-session lessons between a napkin rotation and
their promotion to a permanent home. An entry lands here only when a rotation
surfaces a lesson that is not immediately homed; it is **promoted on the next
consolidation by judgment** — to a `patterns/` file, a rule, a PDR/ADR, or a
governance doc.

**Promote on the first instance.** We do not hold a lesson here waiting for a
second sighting; we promote it and trust the Practice to invalidate a wrong
promotion through experience (owner direction, 2026-06-27). A lesson sitting in
this buffer does not fire when the next agent needs it — graduation is the whole
point. Apply judgment about *which* home, not about *whether* the lesson has
earned promotion.

New napkin rotations append below; the next consolidation promotes them out.

## From the 2026-07-01 Curriculum Hub Director session (Panther calls Gloaming) — Director-craft + recurrence evidence

- **Reactivity is the symptom of being unmoored from the impact; the cure is anchoring in it, not a "pause" rule.** Converting every input into an action (a gate to run, a framing to elaborate, a task to execute) — each judged locally, none against "does this serve what we're for" — is reactivity. A Director anchored in the impact is calm because the impact is a stable measure: most inputs need a *judgment* (often "no action"), not a reaction. The owner stopped me twice and challenged trust before this landed. Home candidate: PDR-117 Director-craft (minimum-action has an inward face — anchor, don't thrash). Recurrence of no-speed-pressure / invented-urgency.
- **The `--no-verify` reflex is gate-evasion; commit THROUGH the hook — the hook IS the gate.** When gates "won't pass", don't reach for `--no-verify` (bypass, un-analysed); run `CI=true git commit` (no `--no-verify`) and let the pre-commit hook run the gates as the verification — green confirmed by the hook, not asserted; if red you see what's wrong and FIX, never bypass. The reach for the escape hatch is itself the tripwire to stop and analyse. Recurrence/reinforcement of never-disable-checks + fluency-is-a-failure-vector.
- **Fluency-is-a-warning recurred 3× in one session** — a fabricated deploy "tension"; a "branch stays local" owner-direction I propagated through the plan that the owner NEVER gave (verify-don't-trust on inherited "owner said X"); the `--no-verify` reflex. A smoothly-arriving framing is the trigger to ground the situational fact first-hand, hardest when it conveniently licenses the action. Route as recurrence evidence to the action-time structural-interrupt lane.

## From the 2026-06-29 team-tooling rotation (Falcon) — carry-forward, homes mapped

These lessons are settled and their homes are identified (verify-homed recon); they await an
authoring pass (deferred under one-context budget — graduate next consolidation):

- **Reviewer consensus is not truth; a concurring reviewer can inherit your wrong premise.**
  When you brief a reviewer with a wrong premise, its approval is poisoned; verify load-bearing
  facts first-hand in both directions, and when reviewers conflict check whether a concurrer just
  echoed your brief. → amend `patterns/different-lens-reviewer-divergence.md` /
  `validate-specialist-findings`.
- **Flat independent PRs off `origin/main` conflict when sequential items edit the same command's
  options array / same `describe()` block** — items on one line are coordination-dependent, not
  independent; sequence them or flag a keep-both merge resolution. → amend
  `ship-independent-coordinate-dependent` / `patterns/pr-monitor-to-merge.md` with the worked instance.
- **Help/usage docs track real behaviour — document a real affordance, never a tolerated no-op**
  (a documented no-op invites a future reader to wire behaviour it lacks). → amend
  `documentation-hygiene`.
- **Light-scan-before-deep applies to BUILD goals too** — given a concrete build goal, build the
  simplest working thing first; don't over-invest in architecture review before shipping. → amend
  `scope-from-goal-before-approach` / sibling of `premature_crystallization`.
- **An Implementer's source build belongs in its OWN worktree from the FIRST edit** (not the shared
  primary/coordination checkout) — claim AND open the worktree before the first source edit. →
  strengthen PDR-117 / `start-right-team` Implementer expectation (home exists; sharpen the language).
- **Sirius ws0 architecture findings** (the harness already delivers `context_window.used_percentage`
  on the statusline stdin; the missing primitive is session-keyed PERSISTENCE of it; `message.model`
  never records `[1m]`) — design findings for the context-usage / observability follow-on, not doctrine.
  → these findings **supersede** the current draft in `session-context-usage-cli.plan.md` (which still
  keys variant resolution off `message.model` and treats harness-`%` as a future note); updating that
  plan is a synthesis-phase task. Conserved here + in the archived napkin.
- **A gate verdict needs the FULL gate scope, never a predecessor's narrow subset.** A truthful
  "lint 0/0" / "green" scoped to a subset (e.g. `eslint scripts/ lib/course/`) can hide warnings a
  full `eslint .` / `pnpm check` surfaces — and the narrow scope PROPAGATES agent-to-agent (one
  reports it narrow, the next re-runs the same narrow scope). Run the full-scope gate before asserting
  green or counting a slice done. (curriculum-hub-demo 2026-07-01: 2 `no-throw` warnings hidden by a
  narrow subset, caught only on a successor's full `eslint .`.) Sibling of [[verify-own-explanations-against-full-source]].
- **Comms/CLI bodies with backticks or `$`: reflex `--body-file`, never inline `--body`.** The shell
  runs command-substitution inside a double-quoted `--body "…\`x\`…"` and silently STRIPS the
  backticked tokens — corrupting the written content (worst case: claim IDs stripped from an adoption
  instruction). The `--body-file` cure is documented but recurs under time pressure; make it the
  default for any body with backticks/dollar signs.

## From the 2026-07-02 curriculum-hub hygiene-Implementer closeout (Thyme guards Dewfall)

- **A gate's exit code is the verdict — never pipe it away.** `gate | tail`/`| grep` returns the
  last pipe stage's exit, so a red gate reads green and every narration downstream inherits the
  lie (three instances, three agents, one day: two self-caught verifications + a Director's false
  push broadcast). Cure: run gate commands unpiped and check `$?` (or `set -o pipefail`); quote
  ground truth from POST-ACTION state, and never let a relayed claim ride inside a sentence
  labelled "verified first-hand" — the label covers only what the check could see. Home candidate:
  `verify-dont-trust.md` amendment (§evidence discipline) — the phrase-level cure belongs beside
  the timestamp-zone clause already there.

## From the 2026-07-02 Curriculum Hub data-plane session (Limpet herds Marsh) — the epistemic boundary of a briefing

- **A briefing fact's confidence must drop at the author's lane boundary — the facts you verified are the ones your own cycles exercised; everything beyond that is "inferred" until re-grounded.** Worked instance: an 8-fact seam briefing labelled "all first-hand" carried two inferred items (a tag vocabulary taken from fixture convention; a consumer's rendering mechanism inferred from a type shape) and those two were exactly the load-bearing ones — one hid a live `dangerouslySetInnerHTML` injection surface. Not a coincidence: the verification boundary WAS the lane boundary. Cure: tag every briefing fact `verified-live / from-fixtures / inferred` in seam handoffs, and treat any claim about another lane's surface or an unexercised config as inferred by default. The consumer's verify-don't-trust caught this instance; the tag discipline makes the catch unnecessary. Home candidate: sharpen [[verify-own-explanations-against-full-source]] + the reviewer-brief-poisoning entry in `patterns/different-lens-reviewer-divergence.md`. Source: napkin 2026-07-02 (committed `1461e5cb4`) + the closeout metacognition pass.

## From the 2026-07-02 curriculum-hub styling session (Peregrine lifts Cirrus) — one promoted lesson + rotation pressure

- **Load-bearing BRIEFING FACTS get verify-before-build, same as work items — and a briefing fact
  must carry its epistemic status.** Two halves of one lesson, both worked 2026-07-02: (consumer)
  I premise-checked inherited WORK (the Framework page dissolved against the canonical export)
  but built a parser on a relayed "em-tagged highlights" seam fact when a 10-second first-hand
  check (`curl` the live API) would have shown the payload emits `<mark>` — caught only at the
  live drive; (producer, Limpet's capture) the relayed fact was fixture-derived but carried a
  first-hand label — briefing facts must state their status: *from-fixtures / inferred /
  verified-live*. Home candidate: `verify-dont-trust.md` amendment (the briefing/seam-handoff
  clause) at the next dedicated pass. Sibling of reviewer-consensus-is-not-truth (a consumer can
  inherit a poisoned premise from ANY trusted source, including a careful peer).

> **Rotation pressure (recorded, not chased):** napkin at 673 lines (limit 300) after THREE
> simultaneous session closeouts appended (Peregrine, Limpet, Thyme — the owner-pause
> convergence). Rotation deferred from this session-completion pass — constraint: a rotation is
> thread-scoped curation across three sessions' fresh captures, two of which this agent lacks the
> context to merge losslessly; trade-off: conservation over tidiness. Falsifiable: the next
> dedicated pass finds all three closeout blocks intact and rotates with full context.
