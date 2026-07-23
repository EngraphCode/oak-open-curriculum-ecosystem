# Retrospective: the first fork-fleet build lane (MCP-101, 2026-07-23)

Commissioned by the owner at lane close ("please run the retro"). Arc:
the MCP-101 visible-surface allowlist lane — the first product build lane
run end-to-end by a fork of the fixed-point baseline, from lane routing to
cold standby, in one sitting. Author: Coyote stirs Lullaby (58ff6c), the
lane's implementer. Written per the retrospective skill: timeline from
primary sources, counts recomputed at writing time.

## Timeline (recomputed from the PR API and comms events at writing time)

| Instant (UTC) | Event |
| --- | --- |
| 09:37:37 | Fork registration broadcast (identity derived from own session id; env seed verified non-colliding) |
| 09:39:25 | Lane routed by the Director (ratified plan, stamps at b1ed08355) |
| 09:45:56 | Ticket In Progress; slice plan posted; pre-execution reviews dispatched (mcp-expert, code-expert) |
| 10:05:50 → 10:14:13 | PR #480 (slice A, SDK guidance inventory) opened → merged at cd439a55b |
| 10:27:10 → 10:37:43 | PR #481 (B1, definition governs tools) opened → merged at 8b33cd587 |
| 10:35:45 → 10:57:12 | PR #483 (B2a, zero prompts) opened → merged at bb2fc9339 |
| 10:56:01 → 11:08:32 | PR #484 (B2b, resources + EEF supersession) opened → merged at 36be0d3e9 |
| 11:08:32 → 11:22:00 | The merge-blindness window (see causal stack): implementer disposition-blocked on the already-merged #484 |
| 11:07:21 → 11:35:07 | PR #486 (B3, SDK deletion + docs + ADR amendments) opened → merged at 495de02ce, carrying the owner's mid-flight amendment (11:17 comment; d87193b88 cure) |
| 11:36 | Ticket Done, claim closed, worktree pruned on proof, wrap, cold standby |

Lane wall-clock, routing to final merge: **1 h 56 m** for five merged
single-story PRs (75 checks green across their settle runs; every round
converged with at most one cure commit). Two pre-execution reviewer
dispatches and one mid-flight owner amendment were absorbed inside that
window.

## Causal stack — the one real coordination defect

The defect: after #484 merged at 11:08:32, the implementer reported it
"merge-ready, disposition yours" and idled until the Director's
correction at 11:22:00 — **13 m 28 s** blocked on a completed merge.
(The correction event itself said "forty minutes"; the PR record does not
reproduce that figure. Even cure events carry unverified counts —
derivation-anchor them.)

1. **Technical root.** The implementer's settle watches polled
   `gh pr checks` — the *checks* leg only. A merge is not a check event,
   so the watch was structurally blind to the exact state transition the
   verdict waited on. Evidence: every watch loop in the lane transcript
   greps `--json name,bucket`; none reads `state`/`mergedAt`.
2. **Process root.** The fleet's merge signal was a single push channel —
   the Director's merge broadcast — and that convention was habitual, not
   contractual. #480, #481, #483 each got their broadcast; #484's was
   missed once, and nothing on the consumer side existed to catch the
   miss. Producer signal absent + consumer backstop absent = silent
   stall. Evidence: the Director's own correction ("every merge gets its
   fleet broadcast, no exceptions — the lesson is mine").
3. **Meta root — the named mechanism: the *unreconciled push verdict*.**
   A verdict a seat is waiting on (merged, landed, ratified) carried by
   exactly one push signal, with no periodic pull reconciliation, stalls
   silently when that one signal drops. The estate already held a
   special case of this in memory ("settle watches need a Sonar-reported
   leg"); this arc supplies the general form: **every awaited verdict
   needs two independent signals, or one signal plus a pull backstop.**
   The next "why" (why do push channels drop?) leaves the estate's
   control; the stack stops here.

A second, smaller collision is worth its line: the owner's cold-standby
word (direct channel) and the owner's #486 amendment (PR comment via
Director relay) arrived interleaved. Cured in-flight by surfacing the
collision explicitly and acting on the newest word; no proposal needed
beyond the worked precedent — the cure is visibility, not machinery.

## Counterfactual test

The cured segment exists inside the same arc. After the Director adopted
the no-exceptions broadcast rule at 11:22, #486's merge (11:35:07) was
broadcast immediately and the implementer's closeout began within the
minute. Uncured segment: 13.5 minutes of dead time on one verdict.
Cured segment: ≈1 minute of latency on the identical verdict shape. The
whole-lane counterfactual: with either cure (state-leg watch or
contractual broadcast) in place from the start, the lane's wall-clock
drops by ~12 minutes (~10 %) — modest here, but the mechanism scales
with fleet size: every waiting seat pays it independently, per verdict.

## Honest credit

What the ~2 hours bought, stated plainly:

- **The M1 substrate.** One declarative served-surface definition now
  governs tools and resources with recomputed totality proofs; both
  registration-membership env flags are gone; the zero-prompts posture is
  proven at protocol level. MCP-102 and MCP-121 register through this
  surface; any live-set change is one reviewed edit.
- **The fork-fleet model's first full implementer lifecycle proof**:
  fork → own-id ceremony → lane → five single-story PRs → two owner
  amendments absorbed mid-flight → wrap → cold standby, with zero
  identity incidents and zero claim collisions (one boundary note to a
  sibling pre-empted the only potential overlap).
- **Cheap-review evidence.** The pre-execution mcp-expert pass killed a
  structurally unreachable test assertion (empty `prompts/list`) before
  any code existed; the code-expert pass re-sliced the lane (EEF
  coupling, e2e seam) before the first edit. Both corrections would have
  been review-round churn at 10× the cost after authoring.
- **Doctrine and hygiene by-products**: ADR-123/ADR-192 dated
  amendments; UAT-runbook inventory drift (pre-existing) fixed; a worked
  instance of the never-use-git-to-remove-work hook paying for itself (an
  emptied file recovered forward via `git show` + rewrite, zero loss).

## Proposals (warrant + falsifier + PDR-130 lane, each)

1. **PR settle watches carry a state leg.** Every watch that gates a
   verdict on a PR adds `--json state,mergedAt` alongside checks and
   emits on MERGED/CLOSED. *Warrant*: the 13.5-minute blindness window;
   the identical Sonar-leg precedent in memory. *Falsifier*: if, with
   contractual broadcasts running, N consecutive lanes show zero missed
   merge signals, the extra leg is redundant cost and should be dropped.
   *Lane*: fast (operational) — amend the pr-lifecycle skill's watching
   section; no register entry needed.
2. **Merge broadcasts are contractual.** Already adopted by the Director
   in-arc ("no exceptions"); this record is the durable citation.
   *Warrant*: the one missed broadcast produced the arc's only dead
   time. *Falsifier*: a merge broadcast miss recurring despite the rule
   shows the contract needs mechanical backing (a post-merge hook), not
   prose. *Lane*: fast — recorded here; mechanical backing only if the
   falsifier fires.
3. **Name the mechanism in the pattern estate: "unreconciled push
   verdict".** Two worked instances now exist (Sonar-reported leg;
   merge-state leg) of one mechanism. *Warrant*: this arc plus the
   memory precedent. *Falsifier*: if no third instance appears in a
   season, the general name adds vocabulary without work and can stay a
   report citation rather than a pattern file. *Lane*: fast — napkin
   seed now; pattern file only at the third instance (the estate's own
   two-instances-then-watch discipline).

No slow-lane (constitutional) proposal: nothing in this arc touched a
boundary that plan-shaped doctrine does not already govern.

## Success-test self-check

Proposal 2 changed a decision in-arc (the Director's contractual rule);
proposal 1 is routed to the pr-lifecycle skill; the causal stack names a
mechanism the estate previously held only as a special case. The
retrospective pays its way on all three counts — and its first recomputed
count corrected the cure event's own number, which is the
derivation-anchoring discipline demonstrating itself.
