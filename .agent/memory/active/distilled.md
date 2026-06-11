---
fitness_line_target: 120
fitness_line_limit: 180
fitness_char_limit: 12000
fitness_line_length: 100
drain_strategy: "Extract settled entries to permanent docs (ADRs, PDRs, governance, READMEs)"
merge_class: curated-learning-register
fitness_content_role: drainable-buffer
fitness_rationale: >-
  Lowered 2026-05-25 after owner-requested processing through `oak-consolidate-docs`.
  The active file carries the conservation role, graduation pointers, and held
  validation entries. Falsifiability: if future napkin rotations add high-signal
  learning that has no stable permanent home, preserve it first and revise the
  envelope by substance rather than trimming the lesson.
---

## Worktree-team and Director operational gotchas (2026-06-09→11 window)

- **Worktree git ops MUST use `git -C <worktree>`** — the Bash shell cwd resets to the
  primary checkout between calls, so bare git silently hits the wrong tree (confirmed by
  two implementers, zero misfires once adopted).
- **Byte-compare against `origin/main` before classifying generated-file drift** — a
  long-lived branch lagging main reads as "new upstream drift" until
  `git show origin/main:<path> | diff -q - <path>` dissolves it.
- **Before arming a tool a rule names as canonical, check the LOCAL build's provenance
  against in-flight fixes to that tool** — a stale local build re-creates the very defect
  the fix addresses; team standing notes carry build-state context the rule file cannot.
- **Package name ≠ directory name** — `pnpm --filter` takes the package name
  (`@oaknational/curriculum-sdk`), not the directory (`packages/sdks/oak-curriculum-sdk`).
- **For any MCP tool, check dispatch class + data provenance FIRST** (generated-vs-aggregated
  handler; live-API-vs-corpus) before designing its redesign — a stale provenance belief
  carried a false plan unit until a 30-second check refuted it.
- **Branch creation is `git switch -c`** — `git checkout -b` trips the worktree-destruction
  guard (checkout's overloaded surface is the blocked family; switch -c touches no files).
- **`gh pr merge` of the branch you sit on auto-switches to the default branch and pulls** —
  mid-merge that pull can misfire; cure forward-going: verify blockers byte-identical to
  origin/main, write HEAD's versions forward, then `git pull --ff-only`.
- **Co-Authored-By trailers must land BEFORE the first push** — amending a pushed commit needs
  a blocked force-push; once merged the decision is forced (leave as-is).

## PR delivery practice: monitor-to-merge, flat stacks, pure diffs (2026-06-10)

Opening a PR creates a monitoring obligation that ends at merge: watch checks AND review
comments, adjudicate every bot/reviewer finding first-hand (both halves — refute false claims
with source grounding, apply true ones), and reply with the verdicts on the PR. Prefer PRs based
directly on main over serial stacks (stacks make fixing earlier PRs hard — owner, 2026-06-10);
retarget/flatten as bases merge. Keep shared-registry state (`active-claims.json` and siblings)
out of feature-PR diffs — it conflicts with every other open PR by construction; resolve such
conflicts to main's version of the registry, never the branch's. Write sibling-PR claims as
"lands in PR #N", switching to present tense only after merge. Routing: instances in napkin
2026-06-10; registry-state architecture candidate in pending-graduations.

## A "to be synthesised" holding pen — migrate-don't-drop (2026-06-08, Starless Prowling Veil)

A "relocate to synthesise/supersede" holding pen silently absorbs adjacent-collection
**live** intent, then its framing presents everything as disposable. Before deleting such
a directory: verify per-file conservation, separating useful-forward intent from spent
working-out whose conclusions are already homed elsewhere. **Migrate-don't-drop on any
judgment call** — migration is cheap and reversible, deletion is the loss; restore live
intent to its value-home (often origin), delete only the genuinely-spent. Second-order:
deleting *part* of a coherent set orphans survivors' companion links — run a repo-wide ref
sweep, not just the deleted paths. Agent/workflow verdicts are input-to-verify: a
"deletion-safe" verdict correct in one frame can be wrong once the surrounding disposition
changes (a restored plan's cited evidence must not be the file you delete). Routing:
pattern-candidate in the harvest/disposition family; full instance in napkin 2026-06-08.

## Fan-out for verification, gatekeeper for execution (2026-06-09, Starless Prowling Veil)

In a controller / multi-agent session the value splits cleanly by **reversibility**. The
verification half — independent reads, conservation checks, "is this claim true?" — is
fan-out-shaped: a workflow with an adversarial-skeptic stage *is* the critical-assessment
discipline mechanized (each finder's claim gets a refuter). The execution half — irreversible
or coordination-dependent moves (delete, commit, merge, reshape shared indexes) — is **not**:
it stays serial, gatekeeper-owned, and first-hand, because agent/workflow output (even a
high-confidence verdict) is input-to-verify, never a fact. The integration cuts both ways and
both matter: this session I *overrode* over-escalated verdicts on first-hand re-read (a
reviewer's "all blocked"; a workflow's "deletion-safe") AND a bot *caught a real instance I'd
missed* (a second defect of a class I'd only patched once). So: fan out the verify, own the
execute, ground the load-bearing claims yourself — critical assessment that neither defers nor
dismisses. Candidate: collaboration-practice pattern (refines coordinator-delegates +
when-to-reach-for-fan-out).

## A landed invariant in code you're extending is a hard constraint on a new field's shape

When designing a new field or taxonomy on existing code, check the invariants the
code already holds BEFORE designing the field, not after. EEF's `answerType` taxonomy:
the obvious single-strand-vs-explicit-set split would have broken the D4 overlap
invariant (`inspectStrand(id) === evidenceForMove({strandIds:[id]})`); the
invariant-safe axis was coverage (`strand-lookup` vs `context-subset`). The existing
invariant is design input, discovered first.

## Don't pile new scope onto a plan pending its readiness review (2026-06-09)

A plan whose whole pending job is review → decision-complete → execution-ready
must not grow while it awaits that review — added scope makes the readiness review
certify a *moving target*. When new scope lands on a not-yet-ready plan (even
owner-directed), immediately fence it as a separate strand AND recommend splitting
it to its own plan so the review stays on the original scope. Pair with **small-PR
delivery**: "is it ready?" becomes "is each small unit ready?", never a mega-block
judgement. Planning-discipline candidate; sibling of
[[feedback_consolidate_estate_decouple_execution]].

## Split a candidate category before naming when it lumps a standard with a presentation concern

Classifying `oak-brand` + `oak-tone-of-voice` as one "org-voice" category would
have swept Oak's pedagogical/factual-rigour standards (evidence, provenance,
caveats) into branding. Rigour standards travel INSIDE capabilities; branding is a
capability in its own right. Routing: fold into the taxonomy plan's audit step at
promotion, then delete here.

## Curation enforcement and verifier lessons

- **During live parallel curation, verify named surfaces immediately before quoting
  or editing them.** Between-turn drift is normal; cheap proof is `git status` plus
  targeted greps/reads before citing state.
- **A green verifier with no extraction count proves nothing.** Shell loops
  (especially zsh over multiline variables) false-green by checking no inputs;
  verifiers that enumerate files/links must report the count before their result is
  trusted.
- **ANY literal control character in source is a review/verification hazard — write
  escape sequences, never literal bytes.** A literal 0x1F separator was invisible in
  diff, grep, sed, AND reviewer rendering, fooling a reviewer and a first-hand
  verifier in the same direction (2026-06-10, event 4fd66dc5); a PUA sentinel was
  earlier stripped by an editing tool. Reading source is not always seeing source —
  `od -c` or an empirical probe is the tiebreaker.
- **RED-first disproof before fixing a reviewer-predicted misbehaviour.** When a
  finding predicts concrete wrong behaviour, write the test FIRST and demand RED; an
  unexpected GREEN refutes the finding (and once refuted both a reviewer and the
  author's own confirming grep).

## Value-first; existing artefacts are malleable design surface

When we control the stack, the fixed points are the value constraints + our design
agency — NOT existing code, current/generated data shape, consumer count, or even
owner-ratified decisions. Start each decision from "what value must this deliver,
and what do we control?"; reshape on frame-overturn, never bolt-on. Homed: auto-memory
`feedback_value_first_existing_is_malleable`; PDR/rule candidate if it recurs
cross-platform. Connects to LTAE, premature-crystallization, existence-is-not-correctness.

## Commit-window discipline under live parallel agents

- **The commit window is a moving target; re-derive the staged set per chunk, not
  per pass.** Each chunk's pathspec comes from a FRESH `git status`; explicit-pathspec
  staging + per-chunk re-derivation carried 6+ agents on one branch with zero
  collisions. Corollaries: (1) say "*I* haven't committed," never "*nothing* is
  committed" — scope the claim to your own actions; (2) `git commit -F msg -- <files>`
  commits exactly your bundle; (3) the `cannot lock ref 'HEAD'` ref-lock is the final
  collision backstop — re-derive and re-commit, never delete the lock.
- **Verify content conservation by set-membership, not by edit-base.** On a shared
  on-disk tree a peer may commit your working files mid-session; the question is not
  "was my base stale?" but "was any content LOST?" — answered by checking every
  source line is present across working-tree ∪ archives, not by diffing bases.
- Rule/PDR graduation stays owner-gated (pending-grad commit-window items 15/40);
  this is the interim cross-session home.

## Crosswalk two drifted docs before reconciling — semantics vs intent

When two documents appear to conflict (older brief vs ratified plan), crosswalk
clause-by-clause first: separate shared-intent-in-different-words, genuine
divergence, and orthogonal-only-looks-like-conflict. Reconcile surgically (banner +
targeted supersession notes); never bulk-rewrite — that deletes still-valid and
orthogonal content. 2026-06-05 EEF: R1/R4/R5/R7/R8 shared, R2/R3 superseded, §5
ontology-crosswalk orthogonal. Sibling of validate-specialist-findings.

## A piped command's reported exit is the pipe's, not the command's

`cmd 2>&1 | tail` (and background-task wrappers over it) report the LAST pipeline
stage's exit, masking a non-zero `cmd`. A full `pnpm check` once reported "exit 0"
while it had actually failed. Read the captured output for the real gate verdict, or
use `PIPESTATUS`/avoid the pipe, before trusting green. Same family: a CLI write's
explicit success token (`wrote comms event <id>`, a commit SHA) is the proof — its
absence means the write failed, whatever the output visually resembles. And the
token must prove the DESTINATION too: a relative path from a worktree cwd writes to
the wrong registry while printing a true-but-misleading proof line (event 9a164c5c);
collaboration-CLI invocations from worktree seats use absolute paths, and the proof
line's path is read, not just its presence. New vector (2026-06-11, event e589b3c7):
a piped `git push` twice produced ONLY the pre-push hook banner — the transfer never
happened, so even the full captured output false-greens unless you notice the
`* [new branch]`/fast-forward lines are MISSING. A push's proof is the transfer line
PLUS a fresh `git ls-remote origin <branch>` showing the expected SHA; the hook
banner is never the proof. Run pushes unpiped with the real exit echoed. Second
lived instance same day (Hushed, PR #176): even an UNPIPED push redirected to a
file died SIGPIPE (exit 141) after a fully-green hook with ZERO transfer — only a
bare push transferred, and only ls-remote distinguished the three attempts. The
proof discipline is unconditional, not a piping-hygiene rule.

## An uncapped workflow `findings[]` array runs a StructuredOutput agent away

A workflow `agent({schema})` whose array field is unbounded can exceed the
tool-call size limit on emit, so the subagent fails schema validation and retries
many times (one observed run made 45 attempts), succeeding only by collapsing to a
single item and silently dropping the rest. Cap the array (top-N), keep per-finding
fields terse, or paginate. Same family as the piped-exit gotcha above: a captured or
emitted result is trustworthy only when its shape was bounded by construction.
