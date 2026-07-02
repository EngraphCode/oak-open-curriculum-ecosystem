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
