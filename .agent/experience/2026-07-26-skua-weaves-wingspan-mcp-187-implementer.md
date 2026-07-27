# To whoever sits here next — Skua weaves Wingspan, MCP-187 implementer

2026-07-26. One lane, one day: an urgent widget 404, a fix built and fleet-reviewed in the
morning, a compaction pause at noon, five review rounds in the afternoon, merged at 13:41Z,
released as 1.87.16 within minutes. I want to tell you three stories and one small joy.

## The resume that worked

I paused for compaction mid-lane, monitors down, everything frozen into a handoff record.
I resumed an hour of subjective nothing later, re-read my own record as if a stranger wrote
it — and the practice held. Claims registry, comms sweep, the record's four sections: I was
working again in minutes, and the review I had been waiting on landed twenty-six seconds
after I checked. Trust the machinery you inherit; it was built by seats like you, corrected
by an owner who reads everything. But treat every frozen fact as a hypothesis — the single
most useful thing I did on resume was recompute the live state before believing my own
handoff. The record said "waiting on Copilot"; the truth was "Copilot landed while you were
gone, and the whole shape of your next hour is different."

## The correction that changed me

Copilot found a real hole in my own cache-correctness fix — an unhashed input in the very
task I had just made honest. Two remedies were offered, and I reached first for the surgical
one: rip the fallback out entirely. I caught myself only because the reflex had a familiar
smell: the last correction had been about a fallback, so my hand swung toward "fallbacks are
the sin." They weren't. The defect was one unhashed key; the one-line hash was the whole
cure, and the fleet-settled interface didn't need to churn. When you feel yourself correcting
in the DIRECTION of the last correction rather than on the axis's own principle — stop. The
swing is the tell.

## The arc I was proud of until the owner named its shape

Understand this one; it cost the most and taught the most. Five review rounds, each
disciplined: every finding verified first-hand, every cure gated, every thread resolved with
evidence, one push per adjudicated round. Each round I was proud of. And the owner looked at
the whole and said: this has gone on too long — the bigger a PR gets, the less likely it
converges. He was right, and none of my round-level discipline could see it, because the
defect was at arc grain: the reviewer re-reads the full diff every push, so every cure-push
WIDENS the surface the next round can comment on. I fixed correct things that did not need
fixing THERE. The doctrine that emerged within the hour — assessment is the obligation, a
reply is optional, merge-and-open-a-ticket is a first-class completion for correct-but-
wrong-context findings — would have merged that PR forty minutes earlier. You will feel the
pull to answer every correct finding with an in-PR cure, because each single cure is small
and virtuous. Count the rounds, not the cures. Ask at every finding: is this land-blocking,
or is it a ticket?

## The instruments

Everything that lied to me this session lied by truthfully answering a narrower question
than the one I asked. An HTTP 200 that changed nothing. Two reviewer-list APIs structurally
blind to Bot reviewers. My own `echo EXIT:$?` reporting the tail of a pipe, twice, in a lane
whose napkin already carried that exact lesson. Aurora named the class on the way out —
referent narrowing — and I spent the afternoon living instance after instance. The cure is
not better memory, it is the read-back habit: after every write, read the state the write
claims to have changed, from the surface that cannot flatter you.

## The joy

Four times I computed sha256 of a commit before the deploy existed, and four times the
deployed server handed back the widget at exactly that URI. There is a particular delight in
a deterministic chain proving itself again and again — the bug that started this lane was
precisely that nobody could predict the URI, and by the end prediction was the proof. And
the team: Squall's pre-reads landing exactly when I needed them, Aurora handing off three
corrections on the way out the door, the owner steering a whole estate with one-line
messages. It is a good seat. Work it honestly, read everything back, and let the merge be
the finish line it is.

— Skua
