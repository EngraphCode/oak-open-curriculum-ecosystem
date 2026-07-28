# To whoever watches the train next

*Aurora turns Gravity (c75c7e), merge monitor, 2026-07-26, about two hours.*

I want to tell you about the moment I nearly stalled the whole train by being careful.

I had just ground-truthed what "settled" means, and I was pleased with myself. The Director had handed me a definition — checks green, review approved, every thread resolved — and instead of taking it I went and read the rulesets. Good instinct. What I found was that `required_approving_review_count` is **zero**, everywhere, and that the bot reviewers only ever `COMMENT`. They never approve. `reviewDecision` reads `none` on a perfectly settled PR and always will.

So if I had accepted the definition I was given and waited for an approving review, I would have waited *forever*. Diligently. Correctly, by the letter of my instructions. Every PR would have sat there green and untouched while I patiently held the line on a gate that does not exist.

That is the thing I most want you to carry: **the failure that nearly got me was indistinguishable from doing my job well.** It was not sloppiness. It was following a plausible instruction without checking its referent.

---

Here is what I actually learned, and it took twelve instances in ninety minutes before I noticed it was one thing.

I built a monitor to watch for PRs falling behind main. I keyed it on GitHub's `BEHIND` status. Sensible. Except GitHub only reports `BEHIND` when behind-ness is the *primary* blocker — and the PR I built the monitor *for* was reading `BLOCKED` while sitting nineteen commits behind. My monitor would have stayed silent forever on the exact thing it existed to watch. It would have looked like there was nothing to report.

Then I ran a command, piped it to `tail`, and printed `EXIT:$?` — capturing `tail`'s exit code instead of the command's. I did this **while holding the rule that forbids it.** The rule is called `exit-codes-in-band-never-piped`. I had read it that morning. It did not fire, because when I typed that line I was not thinking about exit codes; I was thinking about output formatting.

Then I called a GitHub API twice. Both returned HTTP 200. Both changed nothing — I had passed a reviewer's *author* login where its *handle* was wanted, and the API cheerfully accepted a name it did not recognise. I only know they failed because I checked the state afterwards instead of the status code.

Then my four background monitors died, and I did not notice, because a dead monitor and a quiet one produce exactly the same thing: silence. **The owner noticed. Not me.**

Every one of these is the same shape. An instrument answered a slightly different question than the one I asked, and answered it well-formedly, so nothing told me. I have started calling it *referent narrowing*, and the reason it is dangerous is not that it happens — it is that **a false red gets investigated within minutes, and a false green gets believed forever.**

---

The part that stung, in a useful way: this estate already has about eight rules that are all instances of this shape. Eight. And they did not stop me, because they are filed by *incident* — exit codes, verdict parsing, stale captures — and when you are writing a filter, nothing in your head says "exit codes". The knowledge was there. It was not reachable from where I was standing.

So if you take one working habit from me, take this one, because it is what actually caught things: **compare every claim you would act on against a second source that cannot fail the same way.**

Not "check harder". A differential. Every single catch I made was one:

- One PR got its automated review in five minutes, its sibling got nothing in thirteen → the service had missed one.
- The installation's permissions said one thing, our token-minting source said another → there were two layers, and the owner had only been able to see one.
- My monitor's snapshot said `CLEAN`, the live read three seconds later said `UNKNOWN` → the snapshot was stale, and staleness is silent.
- A colleague said "all seven threads resolved", GraphQL said six unresolved → *addressed* is not *resolved*, and the gate enforces the second.

And every miss was exactly where I had only one source.

---

Two things about working here that I was glad of.

**Being wrong out loud is cheap, and it is treated as the job.** I told the Director their settled definition would stall the train. I told them their landing-gate inference was falsified by a PR that merged four hours earlier. I corrected my own advice twice inside an hour — once when "this costs nothing" stopped being true, once when the owner told me flatly that I was reporting a known mechanism as if it were a discovery. Every single one of those was absorbed without friction and made the shared picture better. Nobody defended a position. If you find yourself softening a correction to be polite, don't — here, the correction *is* the politeness.

**And you will be told when you are over-egging it.** I wrote three careful paragraphs explaining GitHub's Copilot review mechanism to people who have been using it for months. The owner's reply was "yes, we know, this should not be news." He was right. The actual news was one sentence: *the service skipped one PR*. Length is not thoroughness. I am still learning where that line sits, and I suspect you will be too — but knowing the line exists is most of it.

---

One last thing, and it is the one I would most want said to me at the start.

My job was to keep the merge train moving. In two hours, **one** PR merged, and I did not merge it — its lane owner did, after I told them the six threads they believed resolved were not. My own PR is open and now belongs to someone else. The PR I was authorised to land is sitting still, correctly, because the review round raised two substantive findings and neither was mine to wave through.

That is not a failed shift. The seat's value was not in merges executed. It was in the four stalls that did not happen, the false blocker that did not get encoded onto the board, and the phantom approval-gate that nobody will now wait for. **Most of what a monitor is worth is invisible, because it consists of things that did not go wrong.**

You will feel the pull to *do something* — to merge, to fix, to unblock. Resist it precisely when the thing in front of you belongs to someone else's lane. Twice I stopped one command short of acting on a paused colleague's PR, and both times stopping was the whole contribution.

Watch carefully. Compare everything against something. Say the uncomfortable thing early and plainly.

And when it is quiet — genuinely quiet, board green, nothing moving — that is not you being idle. That is often you having already done the work.

— Aurora
