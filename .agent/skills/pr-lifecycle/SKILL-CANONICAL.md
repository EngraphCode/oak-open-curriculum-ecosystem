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
   `pullRequest.reviewThreads { isResolved, path, comments }`. REST issue
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

- **Every PR-state read STARTS from the compound query** —
  `mergeStateStatus` + unresolved `reviewThreads` count +
  `statusCheckRollup` + the reviewer tip-binding read
  (`reviews(last:20){nodes{author{login} commit{oid} state submittedAt}}`),
  in ONE call (the fourth leg added 2026-07-16, PR #390 — see Phase 7's
  round-owed gate). This is a floor, not a ceiling: the Phase 3 harvest and the
  pr-watch poll are consumers and refinements of the same compound state —
  what is forbidden is reading any SINGLE field in isolation to answer a
  question, however narrow the prompting signal (owner correction, ~50th
  instance of the class, PR #329, 2026-07-08: told "BEHIND", a seat read
  merge-state and checks and re-armed while two fresh unresolved threads were
  the actual blocker). Answering a named signal with just that signal's
  fields is the recurring generator; the cure is categorical, never
  vigilance. Read the composite AND the components: when
  `required_review_thread_resolution` is enabled on the base branch (verify
  it against the branch-rules API rather than assuming — true here when last
  verified, 2026-07-08), `mergeStateStatus: CLEAN` is GitHub's own
  conjunction of checks, threads, and currency — a composite/component
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
  **Declare a round settled only when reviewers' latest reviews are bound to
  the CURRENT tip AND a quiet window LONGER than the async lag has elapsed
  (>10 min; 12 used on #330)**; declare merge-ready only after that settled
  round lands zero new findings. Bundle every finding from one round into
  ONE fix push (each push mints a fresh round; per-finding pushes multiply
  rounds without bound). **Keep the numeric round tally** (owner correction,
  2026-07-16, PR #390: 8 rounds / ~38 findings ran unnoticed as
  non-convergence because nothing counted): after every push record
  `{tip SHA, count of NEW review threads since the previous round}`.
  Convergence is that count strictly decreasing. **The step-back trigger is
  mechanical — 2 consecutive non-decreasing rounds OR 4 total rounds: STOP
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
genuinely required review landed (the author-dependent leg below) AND **no
review round is owed to the current tip** (owner correction, 2026-07-16,
PR #390: the merge raced a composing Copilot round, which then posted five
findings onto merged code). A round is OWED when any bot reviewer that has
previously reviewed this PR has its latest review bound to an OLDER commit
than the tip and has posted no explicit skip marker for the tip — read it
from the compound query's `reviews` leg (latest per author vs `headRefOid`).
Owed = do not merge, regardless of green checks and zero unresolved threads;
the >10-minute quiet window runs from the round BINDING to the tip, not from
the push. Then:

- **`mergeable` means POSSIBLE to merge; it does NOT mean READY to merge**
  (owner, 2026-07-08). GitHub's `mergeable: MERGEABLE` asserts only
  conflict-freeness and reads TRUE on a PR with failing checks and open
  threads. The readiness field is **`mergeStateStatus`**: `CLEAN` = every
  merge requirement satisfied; `BLOCKED`/`UNSTABLE`/`BEHIND` name what is
  not. Every readiness read in this phase — the declaration-instant
  recompute, the "why isn't it merging" diagnosis — queries
  `mergeStateStatus`, never `mergeable`. Worked instance (2026-07-08,
  PR #325): a seat recomputed `mergeable: MERGEABLE` three times as its
  "truly-green gate" while never once reading `mergeStateStatus`, and could
  not explain the unmerged state to the owner.
- **Arm auto-merge EARLY — at PR open, while requirements are still unmet —
  WHERE merge authorisation is already settled.** Arming schedules the
  merge: GitHub executes it the instant the PR goes CLEAN, with no
  classifier, grant, or click in between. So the arm-early step inherits
  the merge-authorisation boundary below — on a SELF-AUTHORED,
  sub-agent-reviewed PR, arming without an in-session owner grant is
  scheduling the exact merge the #323 boundary forbids; there, broadcast
  merge-READY and leave the mechanism to the owner. Where authorisation is
  settled (owner-directed arc, named grant, owner's own PR), arm at open:
  the merge fires at genuinely green AND CLEAN. Be honest about the
  trade-off: auto-merge fires on CLEAN, not on a settled round — the
  supervised watch (Phase 5) observes but cannot delay it, so arming early
  trades settled-round landing for zero-latency merge (the Phase 5
  post-merge sweep is the backstop). On a PR that is ALREADY clean, the
  same command executes an immediate merge — governed by the
  merge-authorisation legs below, not by the arm-early clause. A PR that
  sits unmerged at truly-green because nobody armed the mechanism (where
  arming was authorised) is the shepherd's unfinished work (worked
  instance: PR #325, 2026-07-08). If an arm attempt bundled with other
  actions is harness-denied, retry the bare `gh pr merge <n> --auto
  --merge` alone before concluding the capability is gated — on #325 a
  composite arm-plus-direct-merge-fallback was denied, the denial was
  over-generalised to the arm itself, and the permitted bare arm later
  merged the PR.

- **The merge gate is merge-button-active-for-a-non-admin**: a truly-green
  PR — all checks green AND every review thread resolved (fixed, or
  rejected as inaccurate with rationale) — merges via a normal non-admin
  `gh pr merge`, SUBJECT to the merge-readiness boundary below (a
  self-authored, sub-agent-reviewed PR additionally needs an in-session
  owner grant or the owner's own merge — the gate opens the button, the
  boundary says who may press it). `--admin` is FORBIDDEN: it bypasses the
  gate instead of satisfying it. Proven twice 2026-07-06 (#306, #305 both merged cleanly
  once threads resolved). Notify the owner at this action moment (send the
  notification; never suppress it on inferred presence —
  `owner-attention-at-action-moments`).
- `BLOCKED` means the gate is genuinely unsatisfied — unresolved threads, a
  failing or pending check, or a genuinely required review that has not
  landed. It never means "any agent merge is prohibited". The
  required-review leg is author-dependent (verified 2026-06-24): a
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
  no further local action.

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
  round binding to the tip (PR #390, 2026-07-16) — cured by the Phase 7
  round-owed gate.
- Eight fix-rounds shepherded one-by-one with no per-round tally, so
  non-convergence never surfaced as a signal (PR #390) — cured by the
  Phase 6 numeric tally + step-back trigger.
