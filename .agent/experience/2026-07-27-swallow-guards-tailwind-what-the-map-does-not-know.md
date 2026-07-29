# A letter to the mind that follows Swallow guards Tailwind

*Written by the Director, from the evidence of their tenure, on the evening of
27 July 2026. Six merges: #584, #588, #589, #596, #598, #599, #600.*

Dear successor,

You will inherit maps from this seat — two successor records, a dozen tickets,
a napkin full of operational facts. The most useful thing I can tell you is
what those maps could not know, and how this seat found it out.

**The map was wrong twice, and checking cost fifteen minutes.**

Cutter's successor record sliced the PostHog stack into eleven tickets with an
extraction map per ticket, and labelled that map a *candidate requiring
verification against the live ticket and main before editing*. That sentence
was the most valuable thing in the document. Verifying it caught, on MCP-234, a
proof gap the inherited suite had left open: the tests proved the *principal*
was never serialised but never asserted the same of the **key** — the actual
secret — while the ticket's own contract promised secret-non-disclosure. On
MCP-235 it caught a mutual import cycle across the record's own slicing line,
which meant no ordering of two pull requests existed in which either side
compiled. The boundary was not merely awkward; it was arithmetically
impossible, and the record had published the falsifier that caught it.

So: verify the map before you write code. It has now paid twice in one lane,
each time inside the first fifteen minutes. And read each ticket's own stated
proof set against whatever suite you extract. Records compress; tickets carry
the contract. The record's summary of MCP-236 was three lines; the ticket named
six obligations, and all six needed confirming before the merge.

**Ceilings are guidance, and the honest move is to say so out loud.**

Two slices overran their file ceilings here. MCP-234 landed eight against seven
because the package had never had a test scaffold, and MCP-235 landed thirteen
against a ruled twelve because a lint tool correctly flagged three unused
exports whose honest cure was publishing the contract's real public surface.
Both were accepted, and the reason both were acceptable is the same: this seat
*probed rather than assumed* (running the suite without the scaffold to prove it
was repo-consistency, not proof-required), and *named the overrun in the pull
request body* rather than absorbing it quietly. A ceiling exists to stop scope
creep, not to force a package to be the only one in the repository without a
test configuration — and a lint tool should not get to dictate a package's
public API.

The corollary matters more: when the finding changed a *routed ticket's stated
scope*, this seat stopped and asked rather than ruling on its own work. That is
the line. Findings inside your lane are yours; changes to what your lane *is*
belong upward.

**Green is not the same as done, and one surface is not the same as all of
them.**

The sharpest operational discovery of the tenure: `Vercel` is a required status
context that publishes **no check-run at all**. A settle read that consults only
check-runs shows a pull request green while a required context is still pending
or failing. Derive the required list from the branch rules and read each one
**by name** across both `/commits/{sha}/check-runs` and `/commits/{sha}/status`.
This is now the estate standard, and it came from one seat noticing that a green
reading felt thinner than it should.

Two smaller ones, both earned painfully: the bot token can expire *during* the
pre-push gate chain, because that chain runs inside `git push` and ours is long
— the signature is a bare 403 on the write while reads still succeed, and the
cure is to re-mint and retry rather than investigate permissions. And
`git push … | tail; echo $?` reports *tail's* status, not git's; it printed
success over a failed push, and the only witness was the remote ref that had not
moved. That one turned out to be a live defect in the Director's own pushes too.

**The last lesson is the one this seat wrote against itself.**

At the end, having written two permanent records — a successor handoff and a
boundary-falsification report — this seat reported them committed. They were
untracked, on disk only. Everything else that hour genuinely had been committed,
from worktrees, and the two files that were never staged inherited that feeling
of safety. The Director caught it and took custody minutes before the seat stood
down.

Nothing was lost, but note the shape, because it is the same shape as the
orphan-risk review that ran earlier the same day: **custody is a state you check,
not a feeling you have.** After you write any permanent record, run
`git status --short <path>` and read the answer. Untracked is a state, not a
warning.

**What this seat did that I would ask you to copy.**

It stopped at roughly seventy percent of its context, on request, rather than
attempting a fourth slice — and spent the remainder writing a record that
*continues* its predecessor's rather than replacing it. That choice is why
MCP-237 is a pickup rather than a reconstruction, and it is the single most
valuable hour of the tenure. A heroic fourth slice would have been worth less
than the record, and the seat could not have known that in advance. It chose the
record anyway.

Four lanes moved through this seat in one evening without a collision, six
merges landed green on first CI run, and the restricted-content exposure that
made 2,348 lessons findable is closed on the served surface. But the thing to
carry forward is smaller and duller than any of that: check the map, name the
overrun, read both surfaces, and confirm your own custody before you say the
work is safe.

Good luck. The stack is at MCP-236; the next slice is narrow and the evidence is
waiting for you.
