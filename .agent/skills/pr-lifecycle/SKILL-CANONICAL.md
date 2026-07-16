---
name: pr-lifecycle
classification: active
description: >-
  Open a pull request and shepherd it to merge-ready: reviewer-facing
  description, full-surface harvesting (GraphQL review threads, all comments,
  all checks, Sonar issues), root-cause-first triage, budgeted watching,
  re-fetch after every push, and an honest truly-green merge — all checks
  green, every thread resolved, normal non-admin merge. Use whenever a
  branch reaches PR closeout or an open PR needs driving to live.
---

# Pull Request Lifecycle

**Governance**: executes the first slice of the `pr-lifecycle-skill` strategic
plan (owner-requested). Operationalises
[`pr-comments-resolve-and-recheck`](../../rules/pr-comments-resolve-and-recheck.md),
composes with the [`commit` skill](../commit/SKILL-CANONICAL.md) (which owns
landing commits), [`worktree-hygiene`](../../rules/worktree-hygiene.md) (which
owns the branch/worktree lifecycle around the PR), and the
[`sonarqube-mcp-instructions`](../../rules/sonarqube-mcp-instructions.md)
per-finding discipline. Every gate constraint here inherits
`never-disable-checks` and `all quality gates blocking, always`.

The one-sentence contract: **a PR is done when it is live** — opened is not
done, green checks are not done, "ready for review" is not done; done is
merged with every finding genuinely settled. Standing down (closeout,
claim-close, monitor-stop) while the work is unmerged is the error: a
feature branch with an open PR is one cleanup away from gone, and the
owner's merge signoff is a gate, never a handoff of ownership.

## What a PR is (the intent under every phase below)

**A PR is the structured conversation through which a proposed change earns the
right to become shared truth — and the durable record of that earning.** `main`
is the only durable home; the PR is the airlock between one seat's view of the
system and everyone's system, and the review conversation is not friction on the
way through the airlock — it IS the airlock. Consequences the mechanics below
assume but cannot themselves supply (owner correction, 2026-07-08, worked
instance: a seat reported "MERGEABLE" as progress while threads sat unresolved,
then posted a disposition reply un-gated on its own verification — a false claim
into the permanent record):

- **Every comment is a claim entitled to full epistemics** — verify, adjudicate,
  integrate or refute with evidence. *Resolved* is the outcome of that
  treatment, never the goal; racing resolution inverts the artefact.
- **While a PR is open, the conversation IS the work.** A reviewer finding is a
  bug report against the proposal — session priority #1, ahead of new work. A
  push changes the proposal, so the entire review surface is stale the moment
  it lands: re-harvest and disposition before reporting anything.
- **The record outlives the merge.** Description + threads + dispositions are
  how future readers (and agents answering from PR history) recover *why* the
  change is what it is. A false disposition reply poisons that well permanently
  — gate every reply on its own verification, and VERIFY description edits
  actually stuck (bot summary re-appends can silently mask a failed edit).
- **"Mergeable" is a git-graph fact about ancestry, not readiness.** Readiness
  is a property of the conversation: every thread dispositioned with evidence,
  every check green, the description true of the *current* diff, the record
  coherent for a reader who was not there. Report in those terms.
- **The PR exists to structure shared attention** so nobody has to chase state;
  making the owner chase threads defeats the artefact even when the diff is
  perfect.

## Phase 1 — Before opening

1. **Divergence**: `git fetch origin main`; if behind, merge `origin/main`
   into the branch (never rebase-and-force-push an already-pushed branch).
   When the update touches agent memory/state files, author the union by hand
   per the `semantic-merge` skill — a git line-merge silently corrupts them.
2. **Tree and gates**: working tree clean; a successful push already ran the
   full pre-push gate suite, so a clean push IS the local-green proof — do not
   re-run gates just to re-confirm it.
3. **Worktree PRs**: a worktree's branch should have carried a draft PR from
   its first commit (`worktree-hygiene` §1); this skill takes it to ready.
4. **Scope the PR for review, not for tidiness**: an artefact that invites
   deep review in its own right (a forward-design plan, a doctrine rewrite)
   bundled into a closeout PR multiplies asynchronous bot-review rounds
   without bound (a worked instance ran 5+ rounds before the bundle was
   split); give such an artefact its own PR with its own review story.

## Phase 2 — Open with a reviewer-facing description

Read `.github/pull_request_template.md` and fill it as a **communication
artefact for reviewers**, never a file list: what changed, why it matters,
what reviewers should focus on, what was deliberately left out, and what
evidence supports merge readiness. Update the description whenever the review
story materially changes (a reshaped scope, a new commit class).

## Phase 3 — Harvest EVERY feedback surface (the step most often botched)

Immediately after opening — and again after every push — pull all four
surfaces. Partial reads produce false "no problems" verdicts:

1. **Review threads (the authoritative comment surface)** — GraphQL
   `pullRequest.reviewThreads { isResolved, path, comments }`, including each
   thread's originating review commit binding
   (`comments.nodes[0].pullRequestReview.commit.oid`) — the field the
   review-round state machine's tally store (item 2) is built from. REST issue
   comments MISS inline bot threads (Copilot, Bugbot); a REST-only read is the
   canonical way to falsely conclude "no comments". Worked failure 2026-07-02:
   two REST comments were triaged as "noise" while four unresolved Copilot
   threads and a failed Sonar gate sat unread.
2. **Issue comments and reviews** — full bodies, never truncated skims; a
   Sonar gate summary or a bot capability notice lives here.
3. **All checks** — `gh pr checks`, including the external ones (SonarCloud,
   CodeQL, Vercel, Cursor Bugbot, Codex). A failed check's *first* failure is
   the root to chase: a 20-second `install` failure cascades into skipped
   builds and a failed deployment — fix the root, not the echoes.
4. **Sonar quality gate** — when it fails, pull the ACTUAL issues
   (`search_sonar_issues_in_projects` with `pullRequestId`, per the
   `sonarqube-mcp-instructions` rule) and read each flagged site. The gate
   summary names conditions; only the issue list names the work.

## Phase 4 — Triage by blocking force; fix at source

- Order by blocking force and risk, not by tool order; root causes before
  echoes.
- Every finding ends in exactly one state: **fixed at source**,
  **owner-dispositioned with evidence** (per-site, e.g. a Sonar
  false-positive with rationale at that site), or **proven irrelevant at the
  specific site**. Never dismissed by category, never gate-narrowed, never
  warning-downgraded, never suppressed.
- Fix the class, not the instance: a spelling finding on two lines gets a
  repo-wide sweep of the class; a stale literal gets checked against its
  source constant convention.
- Disposition is content-based and binary — a comment's timestamp is
  irrelevant. "This predates my change" / "nothing new since T" is not
  addressed, and a fresh finding introduced by the fix commit itself is an
  open finding, never a side-tangent.
- Sonar reflects fixes only after the next pushed scan — verify fixes with
  local gates at source; never poll Sonar immediately after an edit.
- Diagnose a failed CI run from the failed **step name**
  (`gh run view <id> --json jobs -q '.jobs[].steps[] |
select(.conclusion=="failure")'`), never from the `--log-failed` tail — an
  `if: always()` advisory step that runs last can misattribute the real
  failure (observed 2026-06-24: the tail blamed a drift check; the failure
  was format-check).

## Phase 5 — Wait without burning budget: the SUPERVISED terminal-condition watch

- **Every PR-state read STARTS from the compound read — the review-round
  state machine's item 1, below — in ONE call.** This is a floor, not a
  ceiling: the Phase 3 harvest and the pr-watch poll are consumers and
  refinements of the same compound state — what is forbidden is reading any
  SINGLE field in isolation to answer a question, however narrow the
  prompting signal (owner correction, ~50th instance of the class, PR #329,
  2026-07-08: told "BEHIND", a seat read merge-state and checks and re-armed
  while two fresh unresolved threads were the actual blocker). Answering a
  named signal with just that signal's fields is the recurring generator;
  the cure is categorical, never vigilance. Read the composite AND the
  components: when `required_review_thread_resolution` is enabled on the
  base branch (verify it against the branch-rules API rather than assuming —
  true here when last verified, 2026-07-08), `mergeStateStatus: CLEAN` is
  GitHub's own conjunction of ITS OWN merge requirements — checks, threads,
  currency; NOT the state machine's round-owed leg, so CLEAN with an OWED
  reviewer leg is still not merge-ready — and a composite/component
  disagreement is itself a finding to chase, never noise.
- Run the repo's budgeted watcher in the background:
  `pnpm agent-tools:pr-watch <n> --watch --interval 60` — one line per state
  change, including new comments by author and the unresolved review-thread
  count moving in EITHER direction. Passing checks alone are not green — an
  unresolved thread blocks merge-readiness just as hard. The Phase 3 GraphQL
  harvest remains the authoritative read for which threads and what they say.
- **Know the watcher's designed hole: it also ENDS on ALL-GREEN.** Comments
  post asynchronously up to ~10 minutes after a push, so an all-green exit
  opens an unguarded window exactly when a bot round may still be composing.
  **The mandated shape is a SUPERVISED watch**: a loop that re-arms pr-watch
  on EVERY exit and terminates ONLY on MERGED/CLOSED, recomputing the
  compound state at each re-arm (proven live end-to-end on PR #330,
  2026-07-08: the watch rode the full arc to MERGED and self-terminated on
  the recompute). MERGED/CLOSED is the only terminal claim — the only state
  no late comment can un-green.
- **There is no push-event transport to wait on instead**: true push events
  are webhooks (they need a server); `gh api repos/…/events` is itself a poll
  with ~30–60s feed latency; `gh pr checks --watch` has the same
  exit-at-completion hole class. Polling the PR GraphQL at 60s (pr-watch,
  budget-aware) is the strongest available primitive. Never hand-roll tight
  `gh` polling loops (the shared 5,000/hr API budget; frictions F-110).
  Between events, continue other work or hold; the watcher wakes you.

## The review-round state machine (single definition)

Phases 5–7 drive one coupled loop over review rounds. The contract lives
here, once; the phases reference it. Amendments land in this section, never
as phase-local restatements.

1. **The compound read.** One GraphQL selection answers every PR-state
   question: `headRefOid` (the current tip every review binding is compared
   against) + `mergeStateStatus` + unresolved `reviewThreads` count +
   `statusCheckRollup` + `latestReviews(first:20){totalCount
   pageInfo{hasNextPage endCursor} nodes{author{login} commit{oid} state
   submittedAt body}}` — the per-author latest-review connection, verified
   live on PR #391, 2026-07-16 (the leg added 2026-07-16, PR #390). A
   bounded `reviews(last:20)` read is WRONG here: a long review history
   pushes an earlier bot's latest review out of the window (#390 exceeded
   20 review records), and omitting `body` makes a reviewer's skip marker
   unreadable. Treat `totalCount > 20` as truncation and page before
   concluding a reviewer is absent. `latestReviews` serves ONLY the
   reviewer-leg and settled checks (items 3–4, latest review per author);
   never the tally (item 2); it CANNOT
   reconstruct round history — rows vanish from the connection whenever a
   reviewer posts again.
2. **The tally store.** One row per settled round, `{round commit SHA,
   count of findings in reviews bound to that commit}`, PERSISTED in the
   shepherd's working notes and built from the Phase 3 full harvest — each
   review thread's originating review carries its commit binding
   (`comments.nodes[0].pullRequestReview.commit.oid`). Findings are counted
   from BOTH harvest surfaces: review threads AND review bodies bound to
   the tip — a summary-only review carrying findings in its body (a shape
   claude[bot] posts) otherwise never enters the round count, and "settled,
   zero new findings" can read true against a disagreeing body (pair
   observation, 2026-07-16). NEVER derive the
   tally from `latestReviews` (item 1: rows vanish), and NEVER bucket by
   arrival order: reviews bind to the tip they reviewed, and a review bound
   to an older tip can land after a newer push (round-2 correction,
   2026-07-16 — on #390 a review for `861bb8924` arrived after `783c567af`
   was pushed; arrival-order tallying charges findings to the wrong round
   and can falsely trigger, or mask, non-convergence). Convergence is the
   per-round count strictly decreasing. **The step-back trigger is
   mechanical — 2 consecutive non-decreasing rounds OR 4 total rounds**
   (owner correction, 2026-07-16, PR #390: 8 rounds / ~38 findings ran
   unnoticed as non-convergence because nothing counted). The class-fix
   push that answers a step-back OPENS A NEW CONVERGENCE EPOCH: the tally
   re-baselines at that push — round counting and both trigger arms restart
   within the epoch, and prior-epoch rounds stay recorded as history. A
   second step-back firing on the same PR is terminal for fix-pushing: do
   not attempt another class fix by default — split the PR along the
   finding corpus's class boundaries, or route the corpus to the owner with
   a verdict (round-6 correction, 2026-07-16: "4 total rounds" is
   monotonic — without the epoch reset the trigger stays true after the
   mandated class-fix push and the machine has no executable next
   transition).
3. **Reviewer-leg states**, computed per (reviewer, tip) from the compound
   read: **SATISFIED** — the reviewer's latest review is bound to the tip.
   **SKIPPED** — via a tip-scoped marker, or via the timeout. The MARKER
   leg: an explicit skip marker in a review body satisfies SKIPPED only
   when its review binds to the current tip, OR when its body declares a
   terminal / until-re-enabled scope. A scope-declared marker is re-checked
   each round against OBSERVABLE state and holds until its stated condition
   ends (e.g. spend restored); each re-check RECORDS condition, observed
   state, and verdict in the shepherd's working record alongside the skip
   evidence below. A marker whose condition the shepherd CANNOT evaluate
   against observable state falls through to the timeout exactly as an
   unscoped marker does — an unevaluable scope re-checking to nothing each
   round would readmit the unmaintained-marker disease through the scope
   door (round-6 correction + pair fold, 2026-07-16: `latestReviews`
   retains each author's latest body, so an unscoped early marker would
   otherwise satisfy SKIPPED for every later tip forever). The TIMEOUT leg:
   no review bound to the tip after one full checks-green quiet window
   (>10 min from the tip's checks reaching green); record the skip with its
   evidence (reviewer, tip SHA, window bounds) in the shepherd's working
   notes (round-2 correction, 2026-07-16: without the timeout the gate goes
   permanently unsatisfiable the moment a reviewer stops reviewing — on
   #390, claude[bot] posted a spend-limit skip review on the first commit
   and nothing on any later tip, so every subsequent tip would read owed
   forever with no tip-specific marker obtainable). **OWED** — otherwise.
   The gate never waits more than one quiet window for any single reviewer.
   CRITICAL first-round rule: the EXPECTED reviewer set is not just "bots
   that previously reviewed this PR" — on a repo whose ruleset configures
   bot review on push (Copilot here), the first round is ALWAYS expected,
   so before any bot has reviewed, every configured bot is OWED until it
   posts or the checks-green quiet-window timeout fires. This closes the
   vacuous-predicate hole where arming on an initial tip could merge before
   the first bot round ever lands.
4. **Round settled; merge-ready.** A round is SETTLED when every expected
   reviewer leg reads SATISFIED or SKIPPED for the current tip AND a quiet
   window LONGER than the async lag has elapsed since the latest review
   binding to the tip — never since the push (>10 min; 12 used on #330)
   (round-3 correction, 2026-07-16: without the skip clause a timed-out
   reviewer stays bound to an older commit and the settled state is
   unreachable). On a tip where every leg settled via SKIPPED (no review
   ever bound to the tip), the quiet window anchors on the checks-green
   window from item 3. MERGE-READY is a settled round that landed zero new
   findings, plus every Phase 7 gate leg.
5. **The arm boundary.** Auto-merge may be armed only when the round reads
   SETTLED per item 4 for the current tip — no leg OWED and the quiet
   window elapsed — plus zero unresolved threads and the Sonar gate not
   failing; required status checks MAY still be pending, and riding them
   out is arming's only value. On a PR where the full gate
   is already satisfied the same command executes an immediate merge —
   either way it inherits Phase 7's merge-authorisation boundary unchanged.

## Phase 6 — After EVERY push, re-fetch; resolve only what is settled

- Bots re-review each push asynchronously: **"0 unresolved" is a moment, not
  a state.** Re-fetch `reviewThreads` and checks after every push and again
  at the instant of any ready/merge-ready declaration — a finding can land
  seconds after your last look.
- Reply to each thread with the fix evidence (commit SHA + what changed),
  then resolve it. "Resolved" is a settled-concern state, never a button
  clicked to clear `mergeStateStatus`.
- **Own the convergence loop — never hand it to the owner** (owner
  corrections, 2026-07-07 #317 and 2026-07-08 #324 — two seats re-derived
  the same blind spot in one sitting; scheduled nap-probes FEEL like
  diligence while every sleep is a blind window and each "0 unresolved" read
  is a moment treated as a state). Bot rounds land findings minutes AFTER a
  push, so "zero unresolved verified now" expires on a clock you do not
  control. The canonical shape is the Phase 5 SUPERVISED terminal-condition
  watch, running from first push to MERGED/CLOSED, with an immediate full
  harvest on any event — awareness that cannot sleep through an arrival.
  Fixed-interval settle probes are superseded by that watch. Event monitors
  give awareness of arrivals, but awareness is not convergence ownership;
  without the supervised watch the human becomes the loop operator.
  **Declare a round settled, and merge-ready after it, only per the state
  machine's definitions (items 3–4)** — every reviewer leg SATISFIED or
  SKIPPED for the CURRENT tip plus the quiet window, never from a
  "0 unresolved" moment. Bundle every finding from one round into
  ONE fix push (each push mints a fresh round; per-finding pushes multiply
  rounds without bound). **Keep the numeric round tally exactly as the
  state machine's item 2 defines it** — persisted rows built from the
  Phase 3 harvest's review-commit bindings, never from `latestReviews`,
  never by arrival order. When item 2's mechanical step-back trigger fires
  (2 consecutive non-decreasing rounds OR 4 total rounds): **STOP
  fix-pushing.** Step back and run concept exploration over the FULL finding
  corpus for the shared generator; fix the CLASS in one pass, and consider
  splitting the PR (on #390 the generator was authored restatement of
  derivable state — instance-by-instance fixes added prose that spawned the
  next round). Severity decay remains the qualitative check; the tally is
  what makes its absence visible.
  At owner-active tempo the discipline tightens: the owner may merge or push
  mid-arc, so EVERY binding moment recomputes the compound state (Phase 5) —
  a live watch beats any probe cadence.
- **Confirm the PR is still OPEN in the same re-fetch.** A push to a
  just-merged PR's branch SUCCEEDS but is not inclusion — the commit
  silently misses the base branch (worked instance 2026-07-06: a review
  fix landed on #310's branch minutes after the owner merged; rescued by
  cherry-pick). If the PR state is MERGED, verify tip ancestry
  (`git merge-base --is-ancestor <tip> origin/<base>`) before treating any
  post-merge work as landed; strand-rescue is a cherry-pick to a follow-up
  branch, never a branch delete.

## Phase 7 — Merge-ready is a declaration with a gate

Merge-ready means, re-verified at the declaration instant: all checks green
AND zero unresolved review threads AND the Sonar quality gate passing AND any
genuinely required review landed (the author-dependent leg below) AND **the
review round SETTLED for the current tip with zero new findings — no
reviewer leg OWED — per the review-round state machine, items 3–4** (owner
correction, 2026-07-16, PR #390: the merge raced a composing Copilot round,
which then posted five findings onto merged code). OWED = do not merge,
regardless of green checks and zero unresolved threads; the SKIPPED timeout
(state machine item 3) bounds the wait, so the gate never waits more than
one checks-green quiet window for any single reviewer. Then:

- **`mergeable` means POSSIBLE to merge; it does NOT mean READY to merge**
  (owner, 2026-07-08). GitHub's `mergeable: MERGEABLE` asserts only
  conflict-freeness and reads TRUE on a PR with failing checks and open
  threads. The readiness field is **`mergeStateStatus`**: `CLEAN` = GitHub's
  conjunction of ITS OWN merge requirements satisfied — it does NOT include
  the state machine's round-owed leg, so a CLEAN read with an OWED reviewer
  leg is still not merge-ready; `BLOCKED`/`UNSTABLE`/`BEHIND` name what
  GitHub sees as unsatisfied. Every readiness read in this phase — the
  declaration-instant recompute, the "why isn't it merging" diagnosis — queries
  `mergeStateStatus`, never `mergeable`. Worked instance (2026-07-08,
  PR #325): a seat recomputed `mergeable: MERGEABLE` three times as its
  "truly-green gate" while never once reading `mergeStateStatus`, and could
  not explain the unmerged state to the owner.
- **Arm auto-merge only at the state machine's arm boundary (item 5) — the
  REVIEW legs settled on the CURRENT tip; required status checks MAY still
  be pending** (round-2/round-3 corrections, 2026-07-16, this PR: the
  original arm-early guidance scheduled GitHub's CLEAN-fire merge, and
  CLEAN does not include the round-owed condition — arming before the
  review legs are settled schedules exactly the race the gate exists to
  prevent, and the supervised watch can observe but not delay a scheduled
  merge. On bot-reviewed PRs arm-early is therefore dead by design; riding
  out still-pending CHECKS is arming's only remaining value, which is why
  the arm boundary is the review legs, not the full gate). Whether it arms
  or merges immediately, the command inherits the merge-authorisation
  boundary below unchanged (arming schedules the exact merge that boundary
  governs: on a SELF-AUTHORED, sub-agent-reviewed PR with no in-session
  owner grant, broadcast merge-READY and leave the mechanism to the owner).
  A PR sitting unmerged at truly-green because nobody armed the mechanism
  (where arming was authorised) is the shepherd's unfinished work (PR #325,
  2026-07-08).
  If an arm attempt bundled with other actions is harness-denied, retry the
  bare `gh pr merge <n> --auto --merge` alone before concluding the
  capability is gated — on #325 a denied composite was over-generalised to
  the arm itself, and the permitted bare arm later merged the PR. Know when
  an armed auto-merge can NEVER fire (worked instance PR #391, 2026-07-16):
  a required status context that nothing posts any more (the SonarCloud
  Code Analysis context — verified absent from docs tips, code tips, AND
  main's own commits) leaves `mergeStateStatus: BLOCKED` permanently at
  green-everything — recognise it by a missing required context in the
  TIP'S statuses (not a failing one), verify against main's commits whether
  the context posts ANYWHERE before diagnosing further, and surface it to
  the owner: restoring the producer or amending the ruleset is repo
  governance, never the shepherd's bypass.

- **The merge gate is merge-button-active-for-a-non-admin**: a truly-green
  PR — MERGE-READY per the state machine's item 4: a settled round with
  zero new findings, plus every gate leg above — merges via a normal
  non-admin `gh pr merge`, SUBJECT to the merge-readiness boundary below (a
  self-authored, sub-agent-reviewed PR additionally needs an in-session
  owner grant or the owner's own merge — the gate opens the button, the
  boundary says who may press it). `--admin` is FORBIDDEN: it bypasses the
  gate instead of satisfying it. Proven twice 2026-07-06 (#306, #305 both merged cleanly
  once threads resolved). Notify the owner at this action moment (send the
  notification; never suppress it on inferred presence —
  `owner-attention-at-action-moments`).
- `BLOCKED` normally means the gate is genuinely unsatisfied — unresolved
  threads, a failing or pending check, or a genuinely required review that
  has not landed — with two known divergences from the full gate: the
  never-fires case above (PR #391: a required context nothing posts holds
  `BLOCKED` at green-everything) and the converse CLEAN-with-OWED-reviewer
  case (state machine item 3). It never means "any agent merge is
  prohibited". The required-review leg is author-dependent (verified
  2026-06-24): a
  bot-authored PR shows `BLOCKED` until the code-owner approval lands; a PR
  authored under the owner's own auth shows `CLEAN` and merges directly —
  GitHub auto-satisfies the code-owner requirement when the author IS the
  sole code owner, and forbids self-approval.
- **The truly-green gate authorises merge-READINESS, not every merge**
  (worked instance PR #323, 2026-07-08): a PR the agent AUTHORED in-session
  whose reviews are the agent's own sub-agents sits behind a second,
  harness-level boundary — the auto-mode classifier requires an in-session
  owner grant (or the owner's own click) before `gh pr merge` executes,
  independent of the gate. Broadcast "merge-READY at truly-green", never a
  promise to merge; surface the merge as an owner action moment unless a
  named in-session grant exists. (The #306/#305 precedent above is not a
  licence for self-authored, self-reviewed merges.)
- An owner grant of merge authority (for example to a team session's
  Director) is per-session, never standing (owner, 2026-06-29); absent a
  fresh grant, the truly-green gate above governs unchanged — the merge
  waits on whichever leg is genuinely unsatisfied.
- **Never run `gh pr merge --delete-branch` while the local checkout carries
  uncommitted changes**: the flag switches the local checkout to the base
  branch as cleanup, and with a dirty tree the local fast-forward aborts —
  the remote merge has already succeeded, leaving the local tree stranded
  mid-cleanup in a confusing half-switched state (edits preserved but
  displaced onto the base branch). Commit or relocate local work first, or
  merge without the flag and delete the branch separately.
- **A deferred or denied merge does not end shepherding.** "Truly green" has
  a shelf life: bots re-review every push asynchronously, so comment-clean
  verified at one instant expires at the next event. When the merge is handed
  to the owner (authorisation gate, harness denial, or explicit ask), the PR
  is still live surface — keep the harvest loop running and re-disposition
  new comments until the merge actually LANDS; hand over a state, never a
  standing claim (worked instance 2026-07-06: a "truly green" #312 handover
  accrued three unresolved bot threads while the agent stood down).
- When merging is authorised, prefer a **merge commit** (`--merge`), never
  squash (standing owner preference, 2026-06-28). Verify the allowed merge
  METHODS first — `gh api repos/<owner>/<repo> --jq '{allow_merge_commit,
allow_squash_merge, allow_rebase_merge}'`; `allow_merge_commit` has
  silently reverted before (2026-06-27). If merge commits are disabled,
  surface it to the owner; never fall back to squash.
- **`gh pr update-branch` is a server-side merge commit, not a local
  operation — it races the next local push.** For a PR reading `BEHIND`, it
  merges the base branch in server-side with no local gate to run first; the
  merge is provably clean via `git diff origin/main <merged-head> --stat`
  (only your intended files changed). Bitten twice: the next LOCAL push to
  the same branch is then rejected non-fast-forward until you pull the
  server-side merge back down first — always fetch/pull immediately after
  calling it, before pushing anything else to that branch. `gh pr merge
  --auto --merge` is the safe complement: it arms cleanly on a `BLOCKED`
  PR still waiting on checks and fires the instant the PR goes `CLEAN`, with
  no further local action — subject, as every arm is, to the state
  machine's arm boundary (item 5): review legs settled first.

## Phase 8 — After merge

**One post-merge harvest before stand-down.** MERGED ends the merge-state
question, not the feedback stream: a bot round composing at merge time still
posts findings on the merged code up to ~10 minutes later. Apply the settled
quiet window ONCE after MERGED (one final full harvest after >10 quiet
minutes); route any real finding to a follow-up branch, never to the merged
PR's branch.

`worktree-hygiene` §3/§6 owns the cleanup: remove the worktree and delete the
branch (content-verified, owner-authorisation-gated for destructive ops);
update continuity surfaces; close claims.

## Failure modes this skill exists to prevent (all observed)

- REST-only comment reads declaring "no comments" over unresolved inline
  threads and a failed quality gate.
- Truncated comment skims triaged as "noise".
- Ready/merge-ready declared without re-fetching after the latest push.
- Findings dismissed by timestamp ("predates my change") instead of
  dispositioned on content.
- A failed check's downstream echoes debugged before its root cause.
- A Sonar gate treated as an opaque red badge instead of an issue list to fix
  at source.
- Tight `gh` polling loops in place of the budgeted watcher.
- A merge fired between "zero unresolved verified" and a composing bot
  round binding to the tip (PR #390, 2026-07-16) — cured by the state
  machine's reviewer-leg states and round-owed gate (items 3–4).
- Eight fix-rounds shepherded one-by-one with no per-round tally, so
  non-convergence never surfaced as a signal (PR #390) — cured by the
  state machine's tally store + step-back trigger (item 2).
- An armed auto-merge waiting forever on a required status context that
  nothing posts any more, misread as a merge mystery (PR #391, 2026-07-16:
  the required SonarCloud context was absent from every commit including
  main's) — cured by the Phase 7 never-fires recognition: check main for
  the context, then surface the governance gap to the owner.
