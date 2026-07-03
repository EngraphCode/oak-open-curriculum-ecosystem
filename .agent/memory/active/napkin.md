---
fitness_line_target: 220
fitness_line_limit: 300
fitness_char_limit: 18000
fitness_line_length: 100
drain_strategy: "Extract settled entries to permanent docs, PDRs, rules, or archived napkins"
merge_class: append-only-narrative
fitness_content_role: drainable-buffer
---

# Napkin

Current-session observations. Append below. Rotate when over ~400 lines (`consolidate-docs`
step 6): extract every behaviour-changing entry, merge into `distilled.md` or graduate to a
permanent home, verify the home, then archive and start fresh.

## Napkin rotated (2026-07-02 dedicated consolidation, Rosemary stirs Bracken)

Rotated at a goal-gated dedicated-consolidation session. The processed window (2026-06-29 →
2026-07-02: the Falcon arc-closeout tail, Borealis's dedicated pass, the corpus-analysis arc
Wren→Laurel→Linnet→Flare→Tornado→Perseus, the check-encoding sessions Callisto→Limpet, the
statusline session Wyvern, the agent-naming deep-dive Tuna, and the upstream-alignment
closeout
Vanilla) is preserved verbatim in `archive/napkin-2026-07-02-rosemary-consolidation.md`
(byte-identical). Every behaviour-changing entry was dispositioned first-hand before the
archive-move; the commits and the homes are the record. Highlights: the shared-checkout
branch-ops and untracked-live-WIP disciplines → `worktree-hygiene` §5; the instrument-to-goal
and owner-granted-sequencing-exception disciplines → `user-collaboration.md`; rendered-output
test craft → `testing-patterns.md`; notify-at-the-action-moment →
`owner-attention-at-action-moments`;
authority-grounding (cite/govern) → `verify-dont-trust`; status-lines-are-verdicts →
`present-verdicts-not-menus`; two new patterns
(`removing-a-constraint-surfaces-what-it-also-bounded`,
`many-pairwise-links-mean-one-unnamed-lever`); the 2026-07-01/02 recurrence cluster →
the action-time-structural-interrupt pathogen inventory; F-111 (Bash sandbox / zsh dialect) →
the frictions register; the pre-existing red `sdk-codegen` gate + programmes execution facts →
the `upstream-api-alignment` thread record (#291 is MERGED). PDR-122-shaped candidates
(checkpoint-between-stages, calibration-first, throughput-vs-volume) graduated via the same
pass's distilled drain.

New session observations append below.

## 2026-07-02 — the consolidation session's own observations (Rosemary stirs Bracken)

- **The patterns-README index is GENERATED — never hand-edit it.** I hand-added index lines +
  category counts; the pre-commit `validate-patterns-index` gate refused the commit and named the
  fix (`pnpm --filter @oaknational/agent-tools validate-patterns-index:fix`), which regenerated the
  index from pattern frontmatter (including `use_this_when` verbatim). Lesson: before hand-editing
  ANY index, check for its generator/validator first — the repo's own generate-don't-hand-maintain
  doctrine, lived. (New pattern files still need authoring by hand; only the README index is
  derived.)
- **zsh no-word-split bit live, minutes after I documented it as F-111** — `for f in $(echo
  "$FILES")` passed one joined string, silently emptying a commit-queue enqueue whose error my own
  `2>/dev/null | jq` pipe then swallowed. Corroborates F-111 and
  `harness-shell-and-commit-edge-cases`;
  the deeper tell: piping a CLI's output to jq with stderr suppressed hides the failure completely —
  run state-mutating CLIs bare first, parse later.
- **The commit-queue `commit` workflow still dies at the documented depcruise→turbo stream
  truncation (2 attempts, 2026-07-02)** — the commit skill's documented cure (direct
  `git commit -F <msgfile>` with output redirected, hooks intact, then manual `complete` + claim
  close) worked exactly as written. Falsifiability datapoint for the skill: the spawned-commit path
  remains unreliable; keep the workaround.
- **`claims close` requires `--now`; `claims open` defaults it** — inconsistent option surface
  (F-72..F-80 sibling; cost one retry). A body/summary containing an apostrophe also exits 2
  (shell-quoting through the pnpm wrapper) — use apostrophe-free summaries or `--body-file`.
- **OWNER CORRECTION (the session's sharpest): recorded "keep-open granted by user" notes were
  NOT the owner's grants** — "those are not _my_ grants, they are grants made in my name, and I
  do not agree to them." I had treated the 2026-06-28 notes on Q-009/Q-011 as standing
  satisfiers; a recorded grant is a prior session's CLAIM, re-verified live each pass. Same
  correction one layer up: I first held the design-panel item behind a 2026-06-29 trigger
  against TODAY'S "everything graduated" — an older directive invoked against a later one
  (owner direction is a stream). Both homed: `precedence-is-not-approval` (recorded-grant +
  older-directive clauses), the consolidate-docs 7b.1 + consolidate-until-done contract
  (grants are live-per-pass; prefer re-homing long-lived questions into owning artefacts),
  and the register's own drain_strategy. Outcome: Q-009 → the two-altitudes report +
  repo-continuity strategy entry; Q-011 → PDR-118 open question 6; register EMPTY.
- **PR #296 shepherding (opened → MERGED same evening) — the failures became the skill.** I
  triaged two REST comments as "noise" while four unresolved Copilot threads and a FAILED Sonar
  gate sat unread (owner: "stop pretending there are no problems") — the authoritative-surfaces
  discipline is now `/oak-pr-lifecycle` (first slice of its plan; both its promotion triggers
  fired this session). Sixteen Sonar findings fixed at source across two scans, zero dismissed;
  the second scan surfaced a sibling regex (META_BINDING) my first sweep missed — I fixed the
  reported instances and swept one file's class but not the other's ("fix the class" applies
  per-class across ALL files, not per-file). Homed: the skill + commit messages.
- **Reviewer contradiction is a gift — the cheap empirical check beat both verdicts (2026-07-02,
  salvage ws1 pre-execution panel).** code-expert said "reuse the exported adjudicate()" and even
  claimed it "verified equivalent on the real data"; test-expert said adjudicate() cannot evaluate
  a bare 3-lens quorum (tier-0 gate at the function head). My own first-hand read of
  aggregation-adjudication.ts settled it in seconds: test-expert right, code-expert's mechanism
  broken-as-stated (its NUMBERS were still correct and became pre-declared predictions). Worked
  instance of both `feedback_validate_specialist_findings_before_acting` clauses in one panel: a
  claim pre-stamped with its own verification, and contradiction-as-cheap-check-trigger. Also:
  test-expert's blocking find (47/54 banked candidates carry a 4th lens-null verdict that would
  lens-collision every quorum) was real and became the discriminating fixture.
- **jq on a driver-output capture file fails if the driver appends prose after the JSON** — the
  post-run driver prints the JSON then a one-line close verdict to stdout; strip the trailing
  line (`sed '$d'`) before conserving as a .json artefact or parsing.
- **Critically-assess-all-subagent-output reinforced again (2026-07-02, salvage session)** — the
  owner re-issued the standing directive ("always critically assess all subagent findings, claims,
  and sources") pre-emptively, mid-panel, post-compaction. This is now roughly the ninth
  reinforcement since 2026-05-27 of a discipline homed in per-user memory
  (`feedback_validate_specialist_findings_before_acting`) + the `verify-dont-trust` rule.
  Recurrence-despite-home (PDR-098): at the next consolidation pass, assess whether the always-on
  rule surface needs an explicit subagent-output clause (ground findings, verdicts, "confirmed"
  claims, cited sources, and recommendations first-hand before absorbing), or whether the
  reinforcements are the owner exercising normal emphasis rather than evidence of a home gap.
- **pnpm overrides rewrite DIRECT deps' effective specifiers** — adding esbuild as a direct dep
  desynced the lockfile against the pre-existing `>=0.28.1` security floor; no local gate runs
  a frozen install, so CI was the first catch. Homed: troubleshooting §Lockfile desync via pnpm
  overrides. Sibling doc-defect fixed: the commit skill's adapter-regeneration command was the
  filtered form, which fails (cwd-relative scandir) — corrected to the root-invoked built form,
  verified first-hand.
- **A research Workflow lens agent wrote an ORPHAN synthesis file to disk despite a
  schema-forced StructuredOutput brief (2026-07-03).** A six-lens `Workflow` fan-out (default
  all-tools agentType, each agent given `schema: FINDINGS_SCHEMA`) left a truncated 136-line
  `corpus-analysis-generalisation-research-2026-07-03.md` on disk with a dangling plan reference
  — a strict subset of the context-holder's own report, found only because `git status` showed
  two report files at commit time. Lesson: the schema forces the RETURN VALUE, not the tool
  surface — an all-tools workflow agent can still Write files as a side effect. After any research
  workflow, `git status` for orphan artefacts before committing; and prefer pinning read/analysis
  lens agents to a read-only `agentType` (or an explicit no-Write allow-list) so they cannot mint
  disk artefacts. Worked cure this instance: conserve the orphan's one unique element (a
  five-layer table) into the complete report, then remove the duplicate (SSOT).
- **Model switched claude-fable-5 → claude-opus-4-8 mid-session (2026-07-03), identity stable.**
  The PDR-027 UUID id (`206a5880-…`) is derived from the session seed, NOT the model, so it held
  across the switch; only the display model field changed (`identity preflight --model
  claude-opus-4-8` confirmed the same id). Commit trailers switched to `Co-Authored-By: Claude
  Opus 4.8` from that point.

## 2026-07-03 — corpus-generalisation review session (Hazel rides Orchard)

- **Lens `openQuestions` are the synthesis drop zone.** Adversarial review of the 2026-07-03
  research-and-record pass (journal cross-check against the report): all three revision findings
  traced to lens `openQuestions` content the synthesis dropped or softened, while `findings`
  arrays were conserved faithfully. When synthesising structured lens output, give `openQuestions`
  the same conservation discipline as `findings`. Homed: the review verdict report
  (`corpus-generalisation-review-2026-07-03.md`) carries the instances.
- **Check a "benign-by-design" interpretation against the originating commit's own contract.**
  The report interpreted the comms-residual disk absence as the expected consequence of the WS7
  untrack; the untrack commit (`255117a43`) itself says "all preserved on disk", the checkout
  pre-dates the untrack, and no record accounts for the removal — the lens said "unexplained", the
  synthesis softened it to "benign". The cheap decisive check (read the commit message the
  interpretation leans on) took one `git show`. Sibling of `verify-dont-trust` and the
  reviewer-contradiction-is-a-gift entry above.
- **Advisor tool unavailable this session** (returned "unavailable" on first call); proceeded on
  first-hand verification alone. Harness observation, not a repo defect.
- **"Unmeasured" often means "unanalysed" — the data was already committed.** The quorum-diversity
  finding said vote independence was unmeasured; a 100-line deterministic script over the
  already-committed checkpoints measured it in minutes (phi≈0.55, ≈1.4 effective votes of 3, both
  regimes; cross-regime quorum agreement 59.6%). Before scoping new instrumentation for an
  "unmeasured" quantity, check whether the banked artefacts already carry the measurement
  (PDR-122 invariant-1 style: deterministic code over recorded judgments). Banked:
  `data/lens-correlation-measurement-2026-07-03.json`.
- **Owner observation captured (2026-07-03, mid-session):** estate-wide markdown→knowledge-graph
  definition-layer inversion, markdown retained as the two-way representation layer (render AND
  human input). Homed: `project_graph_approach_is_practice_convergence_target` (sharpening) + the
  research report's owner-observation record; a dedicated research lens ran on it.

## 2026-07-03 — exploring context usage (Sardine spins Estuary)

- **Session-open load measured at ~71K of the ~80K reliably-loaded budget.** The two largest
  controllable contributors shared one mechanism (session-injected definition surfaces carry no
  budget while invocation-time surfaces are effectively free): 15 verbose `.claude/agents`
  descriptions with embedded `<example>` blocks (~25KB of a ~33KB description tier), and the
  44KB/241-entry `MEMORY.md` index being harness-truncated at load. Homed: PDR-124
  (definition-surface context economy) + amended `per-user-memory-is-a-buffer` (index-line
  retirement on graduation). Drain of the 241-entry backlog deliberately NOT run — owner-directed
  as a separate dedicated `consolidate-docs` pass.
- **The lean shape was already ratified in the estate — the Cursor adapters.** The `.cursor/agents`
  descriptions for the same 15 agents were already compact and example-free; the verbose Claude
  copies were cross-platform divergence, not design. Before designing a new shape for a surface,
  check the sibling platform's adapter for an already-converged form (cheap convergence beats
  invention; also a divergence-detection signal for the canonical-first architecture).
- **Graduated memory entries double-tax the index.** An entry graduated to a rule kept its
  `MEMORY.md` index line, so the substance loaded twice per session (rule stub + dead index line)
  while crowding live entries past the truncation point. Cure is lifecycle (retire the line, keep
  the per-entry audit file), not trimming.
- **PDR-052 vs PDR-124 boundary held under the new-rule-vs-pdr-clause classifier.** Checked
  clause-vs-new-PDR before authoring: PDR-052 governs _editing_ directives under context pressure;
  nothing owned the standing _injection_ cost of definition registries. The classifier run
  changed the artefact's scope (from "subagent design" to the two-tier surface contract).
