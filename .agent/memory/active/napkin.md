---
fitness_line_target: 220
fitness_line_limit: 300
fitness_char_limit: 18000
fitness_line_length: 100
drain_strategy: "Extract settled entries to permanent docs, PDRs, rules, or archived napkins"
merge_class: append-only-narrative
fitness_content_role: drainable-buffer
---

## Session: 2026-06-09 — napkin rotated (Fruited Twining Canopy curation pass)

Rotated the 2026-06-08 → 2026-06-09 window during a dedicated knowledge-curation
pass. The processed window is preserved verbatim at
[`napkin-2026-06-09-fruited-curation.md`](archive/napkin-2026-06-09-fruited-curation.md).
Every behaviour-changing lesson was verified live in a permanent home before
rotation — type and markdown gotchas in the governance docs, the
fitness-threshold derivation principle in ADR-144, the status-surface-recompute
sharpening in `verify-dont-trust`, and the sweep-the-defect-class and
landed-invariant lessons in `distilled.md`. Fresh capture continues below.

## 2026-06-09 — graph-tools readiness session (Fragrant Spreading Sapling, 47f78a)

Readiness session: seam analysis → owner ratifications → R1/R2 → DECISION-COMPLETE (PR #143 + a
stacked PR). Four captures:

- **An inherited Step-0 recommendation is a hypothesis, not a plan.** I proposed the plan's own
  recommended surface/graph split to the owner verbatim; owner: "too crude, find the real
  membranes". The cure that worked: derive decomposition from dependency + solution-class +
  surface-cohesion analysis, then ratify. The document's own seam enumerations disagreeing (A5/B1
  contradictions) was the tell the split was never analysed. Sibling of [[premature-crystallization]].
- **Ground a tool's provenance class before designing its redesign.** The plan's keywords unit
  rested on a false belief (bulk-corpus) refuted by a 30-second check: `AGGREGATED_HANDLERS`
  membership + the generated tool file (`/keywords` GET, live API, params already present). An
  owner-directed scope addition (2026-06-08) carried the stale belief in; the readiness review
  caught it. Reflex: for any MCP tool, check generated-vs-aggregated dispatch + data provenance
  (live vs corpus) FIRST.
- **Audit my own verification filters, not just reviewer claims.** barney said "exactly six"
  factory importers; betty said the EEF tool was a seventh (blocking). My first-hand grep refuted
  betty (comment-only refs) — but my grep carried `-v .test.ts`, which hid the factory's own unit
  test as a REAL seventh importer that assumptions-expert later caught. Both halves fired: a
  blocking reviewer claim refuted by evidence AND my refutation-grep's exclusion filter audited.
  Sibling of [[feedback_validate_specialist_findings_before_acting]].
- **A contract change makes every calling prompt-step a data-flow rewrite, not a reference swap**
  (R2/mcp-expert's substantive catch): zero-arg → required-anchor tools mean prompt steps must
  thread the anchor from the preceding workflow step, or the prompt instructs invalid calls.
  "Repoint" language hid the gap; the plan now pins anchor-threading rewrites,
  correct-at-every-commit.
- **Owner correction (2026-06-10): bundle-ratification is not clause-ratification.** My seam-map
  ratification question embedded a holding-state clause for §C the owner never agreed to —
  "Ratify" on the bundle did not ratify that clause. Owner doctrine: work is a live deliverable
  with named gates, or it is removed by owner decision — no unagreed holding states, ever. Cure
  landed: §C → deliverable S3 (c0 owner design gate); the indefinite-deferral vocabulary family
  (the p-word and siblings — descriptive form per hook-policy-substring-discipline) added to the
  innate-immunity trip-list as a word-boundary regex group (literal substrings would have
  false-positived on agent display names like "Sparking …"). Sibling of
  [[feedback_forced_verdict_resting_on_my_interpretation_is_a_question]] (precedent ≠ approval,
  applied to my own bundled question).

## 2026-06-09 — proportionality on routing an already-doctrined instance (Fruited Twining Canopy)

Curating, I circled the "derive-don't-drift listing" lesson — standalone distilled
entry vs pattern file vs memory corollary — longer than its value warranted. It was
plainly an instance of the existing `derive-dont-bridge-controlled-surface` doctrine;
the proportionate move was a one-line corollary to that doctrine's home. Sharpened
default: **an instance of existing doctrine → one-line corollary to that doctrine's
home, then move on.** Routing deliberation scales to novelty, not to thoroughness for
its own sake. Instance of [[feedback_stay_with_stated_scope]].

## 2026-06-09 — two curation-discipline catches in a shared-tree window (Fruited Twining Canopy)

- **A napkin rotation on a shared working tree can archive a peer's just-committed
  lesson without graduation-processing it.** A peer committed a planning-discipline
  lesson into the napkin AFTER my read but BEFORE my rotation. My `cp` archive caught
  it verbatim (conserved), but my graduation pass — working from my earlier read —
  never saw it, so it was archived un-homed; the rotation marker's "every lesson
  homed" claim was false until I diffed the archived window against my read and
  graduated the peer's lesson to `distilled.md`. Reflex: in a multi-agent window,
  `git log -p` the napkin (or diff archive vs your working read) BEFORE asserting the
  rotation homed everything. Sibling of the "staging a file holds another agent's
  work" lessons.
- **I asserted a convenient "it's an unwrappable table" to justify not-chasing a
  width-critical; grounding the checker source falsified it.** The practice-fitness
  prose-width metric measures ONLY `kind === 'prose'` lines — `markdown.ts` classifies
  code-fence / code-block / table / link-reference / frontmatter as non-prose and
  excludes them, and `measurableProseWidth` strips inline-link / autolink / bare-URL
  targets (`evaluate.ts:95`, `markdown.ts:1-120`). So a width hard/critical points at
  genuine over-long PROSE to reflow; it is NOT tripped by tables or link-heavy lines
  (already discounted). The convenient claim made the not-chase tidy — exactly
  [[feedback_ground_convenient_claims]]; grounding before asserting is the cure.

## 2026-06-10 — closeout continuation: PR monitoring + review adjudication (Fragrant Spreading Sapling)

- **PR-bot comments are other-agent input — both adjudication halves fired, worked instance.**
  Copilot left 5 comments on PR #146: 2 were FALSE (claimed `\bpark (?:it|this|that|for now)\b`
  "won't match park-it-for-now" — refuted first-hand: `scanLinesForRegex` runs unanchored
  `regex.exec` per line, so the contained "park it" fires; encoded as a regression test case) and
  3 were genuine (doc scope inconsistency; the inline-code exclusion let a backticked family member
  on a DATA-SHAPED line — a table row — dodge the block; missing sibling regression test). Owner
  re-stated the standing requirement mid-flight: critical analysis applies to ALL other-agent
  input, explicitly including GH PR bots. Extends [[feedback_validate_specialist_findings_before_acting]].
- **Collaboration-ceremony registry writes inside feature PRs are a cross-PR conflict generator.**
  PR #146 went CONFLICTING within minutes: every commit ceremony writes
  `active-claims.json`/`closed-claims.archive.json`, so any two open PRs collide on them. Cure
  that worked: merge main into the branch and resolve the registry files to MAIN's exact content
  (forward `git show origin/main:<path>` + copy — no blocked restore verbs), making the PR a pure
  policy/code diff that can never conflict on registry state again. `candidate:` keep ceremony
  registry state OUT of feature-PR diffs entirely (see pending-graduations).
- **Branch creation: `git switch -c` is the purpose-built verb; `git checkout -b` trips the
  worktree-destruction guard** (checkout's overloaded surface is the blocked family; switch -c
  creates branches with no file-overwrite surface). Reappraisal honoured — not a sibling-command
  bypass: no worktree state is touched.
- **Cross-PR present-tense claims read as false until the sibling merges.** #145's docs asserted
  the trip-list "was added" while it lived in open #146 — Copilot flagged all 4 instances; they
  became true on merge, but the honest authoring shape is "lands in sibling PR #N" until then.
  Same family as principles.md §Target-architecture wording needs consuming-runtime evidence.

## 2026-06-10 — merge-phase operational captures (Fragrant Spreading Sapling, closing)

- **`gh pr merge` of the branch you are sitting on auto-switches the local checkout to the
  default branch and attempts a pull** — mid-merge that pull can misfire, leaving local main
  stale with carried-over file copies blocking the next fast-forward. Cure that worked, fully
  forward-going: verify the blocking files are byte-identical to origin/main
  (`git show origin/main:<path> | diff -q - <path>`), write HEAD's versions forward over the
  redundant copies, then `git pull --ff-only`. Zero loss by construction (the content is in the
  merged PR); no blocked verbs needed.
- **A watcher script is itself input-to-verify**: my numeric-guard rewrite silently dropped the
  new-comment exit condition, so a PR comment arrived without a wake and was only caught by the
  owner-prompted status sweep. When rewriting a monitor, diff the EXIT CONDITIONS old-vs-new,
  not just the mechanics. (zsh arrays are 1-indexed; `$((...))` chokes on non-numeric capture —
  guard every variable that feeds arithmetic.)

## 2026-06-10 — team-shape design + memory retirement (Fragrant Spreading Sapling, final)

- **Owner retired the subagent-worktree base-drift caution as stale** ("no reason to assume it
  is still an issue") — the platform auto-memory entry is deleted; do not re-derive the caution
  without a fresh observed failure.
- **Per-session git worktrees + a single Director-owned coordination home** is the ratified
  next-session team shape (opener: `prompts/connecting-oak-resources/graph-implementation-team.prompt.md`).
  Design insight worth keeping: the collaboration CLIs being path-parameterised means worktree
  topology needs ZERO new tooling, and it converts three of this arc's lessons (registry
  conflicts, gate coupling, watcher exit-condition discipline) into structure on first use.

## 2026-06-10 — graph implementation team session (Veiled Listening Secret, 7c8e8e, Director)

First live run of the worktree-team shape (Director + Riverine S1 + Airy G1a). Consolidated from
implementer handoff records (Seat A: `2026-06-10-riverine-seat-a-s1-to-s2.md`) + Director
observations:

- **Worktree cwd gotcha (Riverine, high value): the Bash shell cwd resets to the PRIMARY checkout
  between calls.** All git ops in a worktree MUST use `git -C <worktree>` (or cd inside the one
  command) — otherwise they silently hit the Director's tree. Worktree teams must internalise this.
- **Co-Authored-By trailer must land BEFORE the first push** (Riverine): amending a pushed commit
  needs a force-push the deny rule blocks. Once the commit merges to main the decision is forced —
  leave as-is; never amend merged history.
- **Fresh worktrees lack gitignored env files** (Riverine): the live-MCP exercise needs
  `apps/oak-curriculum-mcp-streamable-http/.env.local` copied from the primary; it never rides a PR.
- **Bot reviewers caught what both specialist sub-agents missed** (Riverine, #152): Copilot found a
  stale JSDoc + a vacuous-pass e2e after code-expert/mcp-expert approved. Real-time first-hand
  adjudication fired both ways: two comments applied, one deprecation-stub cure refuted
  (replace-dont-bridge). Layered reviewers earn their keep.
- **Execution-start re-verification works as designed** (Airy): the pinned-facts duty surfaced a
  sourceVersion gap (committed corpus 2026-03-07 vs bulk 2026-05-21); a 1.74s throwaway re-mine
  proved content-identity (pinned facts hold exactly; ~13 cosmetic lines), dissolving the fork
  before it reshaped scope. Quantify-the-drift-first beats deciding from the label. Do not re-open.
- **An owner edit naming "every agent" can pull apart against a role whose defining property is
  elsewhere** (Director): "every agent creates a worktree" vs "the Director's checkout is the
  coordination home" — surfaced the interpretation per forced-verdict-on-interpretation doctrine;
  owner ruled primary checkout + Director branch off main. Cheap question, topology-defining answer.
- **Natural-boundary closeouts leave no claim carrying `handoff_record_path`** — the skill's pickup
  mechanism only fires on retained claims. Cure landed in the team opener's entry ritual: successor
  seats read their seat's latest handoff record routed via opener + Director pickup brief + thread
  record, not the claims registry.
- **Green gates do not prove the package export contract** (Director, #153): the monorepo
  `development` export condition resolves to `src/`, so a `./curriculum` subpath whose `default`
  points at a never-built `dist/curriculum/index.js` passes build+test+e2e while broken for real
  consumers. tsup entry globs are per-tree; a new src subtree needs its glob. Verify new subpath
  exports against the `default` condition (dist-level), not just the monorepo gates.
- **Explore-agent output is input-to-verify, by half** (Airy): its TYPE facts were correct and
  load-bearing; its DESIGN suggestions were hallucinated (proposed NLP edge-parsing where the real
  generator builds edges from thread ordering). Read the actual generator before accepting design
  claims. Sibling of [[feedback_validate_specialist_findings_before_acting]].
- **correct-at-every-commit can force a literal-todo deviation — surface it, don't silently
  follow** (Airy): "G1a deletes prior-knowledge types.ts" would have broken the still-live tool;
  additive-G1a + G1b deferral honoured the invariant, the plan todo holds at the G1 level, and the
  deviation was broadcast, not silent. Intra-lane sequencing within a delegated split is the
  implementer's call.
- **vocab-gen is ungated** (Airy): it is separate from sdk-codegen and no CI gate re-runs it, so
  generated-vs-generator drift persists invisibly while main stays green. Surfaced by the honest
  execution-start re-verification; candidate structural cure belongs with the G2/G3 resync.
- **Integrating an unregistered agent's work** (Director, Blooming): work left uncommitted in a
  shared checkout integrates safely as: locate ALL copies (their worktree + primary were
  byte-identical), critically assess content first-hand (the ADR edits were stale-doc corrections —
  verified against live source), commit on THEIR branch in THEIR worktree via git -C, push + PR,
  then write-forward HEAD over the now-redundant primary copies (loss-free by construction).
- **A handoff hypothesis is a floor, not a fix-spec** (Pearly, S2/B2): the record's
  "yearGroup→keyStage mapping" repair was honestly marked unconfirmed; the pre-execution reviewer
  surfaced a missed `year` param, and first-hand schema tracing (flat-zod-schema → validation →
  execution → searchLessons) found the lessons-scope `year` filter matching yearGroup granularity
  exactly — the landed fix preserved precision instead of coarsening. Confirm-the-defect-first +
  reviewer-before-execution caught it; the hypothesis-marked-as-hypothesis discipline made the
  supersession frictionless. (cwd-reset gotcha independently CONFIRMED by Pearly — zero misfires
  once `git -C` was adopted throughout.)
- **Package name ≠ directory name** (Pearly): the curriculum SDK is `@oaknational/curriculum-sdk`
  but lives at `packages/sdks/oak-curriculum-sdk` — `pnpm --filter` takes the package name.
- **Hook-policy substring false-positive on compound commands** (Director): `git … push` plus a
  later `gh api -f body=` in ONE Bash command matched the force-push pattern and was blocked.
  Cure: split the push and the API calls into separate commands; the reappraisal direction was
  honoured (no sibling-command bypass — the push genuinely carried no force flag).
- **The all-channels watcher can hang-but-run** (Abyssal, 2026-06-10 ~14:07Z): the `comms watch`
  CLI loop stalled silently — process alive, zero emissions, seen-file frozen (3045 vs 3070 on
  disk) — blinding the agent to a merge + GO + ping for ~16 min while their detached heartbeat
  kept broadcasting stale state. NEW mode vs the exit-conditions lesson: not wrong conditions, a
  hung loop. Cure: portable 15s ls+diff polling shape (cannot hang silently the same way) + a
  manual `comms list` sweep at each cycle boundary as backstop. Director-side tell that worked:
  heartbeat-only + stale cycle label for 2+ windows → ping → work-evidence cross-check.
  Candidate structural cure: watchdog/self-test on the watcher CLI (emit a liveness line per poll).

## 2026-06-10 — third Director session, second succession (Celestial Glowing Dusk, 1e526e)

- **I armed the rule's canonical CLI watcher despite two live warnings against it** (the napkin
  entry above + the auto-memory stall note): the rule file's canonical invocation reads as the
  default, but the LOCAL BUILD of the tool predates the #157 hardening fix — exactly the defect
  that blinded two Directors today. Corrected on Solar's pre-positioning standing note (portable
  polling loop until a main-rebased rebuild). Lesson: before arming a tool named by a rule,
  check the build provenance of the LOCAL copy against any in-flight fixes to that tool; a
  team's standing notes carry build-state context the rule file cannot.
- **A succession-window thread record is a moving surface**: my first Edit batch failed
  ("modified since read") because Solar's closeout commit landed between my read and my edit;
  the re-read-then-edit discipline absorbed it. Second-order catch: the identity table had
  accumulated duplicate rows during the rotation churn (two Airy-Squall rows from two writers;
  my own first edit nearly added a duplicate Twinkling-Orbit row) — PDR-027 says a matching
  identity UPDATES last_session, never adds a row; in a multi-writer window grep the table for
  the prefix before adding.
