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

## Homes authored 2026-07-06 (dedicated pass) — entries above CONSERVED (owner-directed)

The pipe-masking/exit-code discipline (Thyme's block) and the briefing-fact epistemic-status
discipline (Limpet's + Peregrine's blocks, producer + consumer halves) are now ALSO written into
`verify-dont-trust.md` (§A Gate's Exit Code Is the Verdict; §Briefing Facts Carry Their
Epistemic Status). The Panther Director-craft block's anchor-in-impact lesson is now ALSO
PDR-117 §Amendment clause 6. Entries stay here per the owner's keep-all-information direction.

## Recurrence-evidence ledger (PDR-098 — homes exist; the mechanism is not firing)

These classes recurred DESPITE their homes and route to the action-time structural-interrupt
lane as traction evidence, not as fresh lessons: the no-verify reflex (never-disable-checks
recurrence); fluency-is-a-warning (3x in one Director session; naming a lesson did not inoculate
minutes later); route-go-no-go-to-Director (4+ consecutive sessions, corrected each time); cwd
drift (7x in one session even under an adopted vigilance cure — structural-cure candidate:
root-level location-independent gate scripts, e.g. `pnpm demo:gates`, routed to tooling);
relabel-heartbeat-at-lane-transition (slips exactly when heads-down; cure candidate: relabel IS
part of the task-start move, like adopt+arm already is).

## From the 2026-07-06 pass (Nettle tracks Acorn, Director #10) — merged additively

Execution knowledge from the 2026-06-29 to 2026-07-06 napkin window (the napkin keeps the full
originals; these are the cross-session distillations):

- **`gh` rate-limit signature reading:** `core.limit 60` / `graphql.limit 0` = an UNAUTHENTICATED
  request (transient token blip — check `gh auth status`, retry), NOT budget exhaustion at 5,000.
  Isolate the layer (auth vs volume) from the data in hand before diagnosing.
- **Client-boundary guards/view-models must not live in a `server-only` module** — a client
  component importing the runtime value pulls server-only into the client bundle and `next build`
  fails. Shared guards go in a client-safe `*-types.ts`; SDK/secret wiring stays server-only.
- **Watcher seen-file = the agent codename VERBATIM (spaces and all)** — `assert-watcher-live`
  derives the heartbeat path from the display name. Two instances (2026-07-01, 2026-07-06): a
  kebab-case guess leaves the watcher running and the assert red. `ls comms-seen/` first.
- **An additive optional-field widen reverses "held-until-ping"** — it cannot break the stable
  contract, so the consumer waits on the producer, not vice versa. Verify field shapes against the
  GENERATED schema and derive via `Partial<Pick<SdkType,...>>`, never hand-restate (shadow schema).
- **A negative claim needs a search CAPABLE of returning a positive** — state the search used and
  confirm it would surface the artefact shape (glob depth, nested-pkg vs group-dir) before tagging
  any negative "verified". Absence-of-evidence from an incapable search is not evidence-of-absence.
- **Recompute your own numbers** — any total asserted must be recomputed from its parts (a
  noise-inclusive grep asserted 318 blocks; the genuine total was 214).
- **A Server Component reads its data layer DIRECTLY** — never HTTP-fetch its own Route Handler
  (waterfall + a latent localhost deploy bug); the typed direct call is inside the boundary, so
  the unknown-narrowing apparatus deletes too. Verify framework practice against LIVE docs.
- **Verify-before-build:** a tracked "PENDING"/"build X" pointer may already be DONE — ground X's
  current state first (two redundant builds avoided in one session). Sibling: an inherited
  "deferred" gate is a risk-flag to RE-RATIFY against the live mandate, never a licence to skip.
- **Calibrate caution to reversibility x cost-of-checking:** cheap-to-check reversible uncertainty
  means verify eagerly first-hand; expensive-to-reverse decisions on an INFERRED signal route up,
  never self-resolve. Repeated option-oscillation is the tell that evidence has not forced a
  choice.
- **Dev-server discipline (demo README candidate):** Next `dev` DAEMONISES when its wrapper
  detaches — after ANY teardown verify the port released (`lsof -iTCP:<port> -sTCP:LISTEN`);
  stale `.next/types` after a teardown race breaks the ESTATE type-check — regenerate via
  `next build`, never delete. Captures: `localhost` not `127.0.0.1` (the latter never hydrates);
  any check against a progressively-enhanced page must PIN which enhancement state it measures
  (SSR-witness / interaction-proof / two-state measurement — the hydration-honesty family).
- **pnpm overrides rewrite EVERY transitive contract** — an override earns its place only when the
  transitive resolution is itself the problem; otherwise package.json ranges alone. And
  `pnpm check` opens with `clean`: after any red estate run, rebuild the tree
  (`sdk-codegen` + `build`) before iterating.
- **A gate whose config is DERIVED from a contract surface (exports maps, tsconfig, lockfile)
  breaks silently when that surface changes** — list re-derivation in the surface's change
  checklist (knip lost its entries when exports went dist-only: 44 phantom "unused" findings).
- **Sonar PR conditions aggregate severity across the whole delta** — one MINOR finding can tip a
  threshold-edge gate red even though every local gate passed; a green local suite and a green PR
  scan are two different verdicts, verify both.
- **As-of stamps on volatile counts:** a handoff record's externally-mutable facts (PR threads,
  check states) need their evidence timestamp + a recount-at-pickup instruction — "the two
  Copilot threads" was true on 2026-07-03 evidence and silently false (eight) by pickup.
  Candidate PDR-063/ADR-182 amendment.

## 2026-07-06 — Sonar Phase 5B session (Katydid seeks Moonbeam), session-close conservation

- **Ground in the governing doctrine BEFORE dispositioning or fixing a static-analysis
  finding.** The session's three-swing arc (under-grounded ACCEPT → ADR-violating "proper fix"
  → reinstatement) had one generator: acting from the nearest plausible frame without reading
  the repo's own decision for the flagged construct. ADR-153 was one read away throughout, and
  a code-expert approved the wrong form because the dispatch never named it. Operational form:
  (a) at any `value is X` / literal-tuple site, read ADR-153 first; (b) generally, grep the
  ADR estate for the construct before choosing a fix shape; (c) reviewer dispatches name the
  governing ADR(s) and require the reviewer to cite what it read; (d) subagent verdicts are
  hypotheses — first-hand-verify each load-bearing claim before acting (owner directive
  2026-07-06). Corollary: at sites with house doctrine, the fluency of the common idiom
  (Set.has over .some) is a WARNING to check for a governing decision, not a confirmation.
  Routing: proposed as clauses on `sonarqube-mcp-instructions` rule + `invoke-code-experts`
  executive memory (pending-graduations entry, owner-approval trigger); inline ADR citations
  already landed at the two most-flagged sites; the sonar thread record carries the
  batch-planning form.
