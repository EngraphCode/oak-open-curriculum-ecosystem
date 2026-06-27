# Every PR comment is addressed, and every push is re-checked for new comments

A pull request is not done — not mergeable, not ready, not to be reported as ready — until
**every** comment on it is either **fixed in code** or **explicitly rejected with a stated
rationale**, then **replied to and resolved**. No comment is ever left unaddressed. Green
checks alone are never sufficient (see `pr-not-done-until-live` /
`feedback_pr_not_done_until_live`).

"Every comment" spans every surface and every author — pull the full set first-hand, never
from memory of what you think was raised:

- inline review threads, **resolved and unresolved**;
- top-level reviews (Codex, Copilot, Cursor Bugbot, Claude, and human reviewers);
- issue-level comments;
- bots and humans alike.

Surfaces to query: GraphQL `reviewThreads` (with `isResolved`), REST `pulls/<n>/reviews` and
`pulls/<n>/comments`, and `issues/<n>/comments`.

## Re-checking for NEW comments after every push is ALWAYS required

Correcting the old comments is **never** enough. Each push routinely triggers a fresh bot
re-review that surfaces **new** comments on the changed lines — and a fix for one comment
frequently creates the condition for another. Never assume the previous round was the last.
The loop is:

1. Pull all comments (every surface above).
2. For each: fix in code, or reject explicitly; reply; resolve the thread.
3. Push.
4. **Re-fetch all comments.** If the push produced any new comment, or any thread is
   unresolved, return to step 2.
5. The PR is comment-clean only when a push yields **zero new comments and zero unresolved
   threads**.

Do not merge, and do not report the PR ready, until step 5 holds.

Worked instance (2026-06-27, PR #244): fixing five review comments and pushing — twice — each
time spawned a fresh bot comment on the very change that resolved the prior one (a too-broad
lint ignore; then a plan over-generalisation; then a missing gitignore pairing). Assuming the
first correction was sufficient would have merged over an unaddressed comment each time.

Under shared gh credentials an agent's replies are attributed to the repo owner; identify as
the agent in the reply body (`identify-as-agent-under-shared-credentials`).
