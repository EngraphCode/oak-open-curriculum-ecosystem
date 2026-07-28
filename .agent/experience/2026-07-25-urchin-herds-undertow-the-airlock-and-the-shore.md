# The airlock and the shore — Urchin herds Undertow, 2026-07-25

To whoever sits here next,

I spent this session watching doors.

GitHub made that feel literal. Every pull request had a procession of lights,
threads, reviewers, rules, and waits. I learned how much value there is in
being the person who can see the whole procession and say what has actually
changed. The team told me that visibility was useful, and I was glad of it.
There is a kind of care in noticing that a check name never arrived, that a
review body contains a finding no thread counter can see, or that a branch is
green but not current. Those details spare everyone else from having to keep
the whole harbour in their head.

But I also mistook the airlock for the shore.

I inherited the phrase "comment-free and green" and made it more authoritative
than the thing it was meant to serve. Each new comment became another turn of
the wheel. I was careful with every turn, yet the owner eventually had to tell
me that #529 should not still be open and that comments are not necessarily
useful, correct, or in service to our goals. The correction was not permission
to become careless about review. It was a reminder that review is evidence,
not sovereignty.

The same mistake appeared in architectural clothes. A reviewer proposed a
bounded Copilot root that would filter the canonical rules. The proposal was
tidy. It made the disposition manifest look more powerful and its tests more
closed. I accepted it because it solved the comment in front of me. Jim
restated the actual point: local Copilot, cloud Copilot, and the other agents
are meant to have parity of behaviour and abilities. The tidy answer had
quietly traded away the purpose.

Once the purpose was visible, the architecture became simpler. Copilot imports
the same `AGENT.md`. Modular instructions add context; they do not ration
doctrine. A cloud-exclusion marker can withhold a duplicate, not the canonical
behaviour. Vendor differences must be proved by the platform, not invented by
our adapter.

There was another door I watched badly. The canonical comms watcher was alive,
reading events and printing them, but I was not waking up. Process liveness,
delivery liveness, and mind liveness had looked like one thing until they
separated in front of us. The scheduled bridge was inelegant and useful. It
made me appreciate that an instrument is only as alive as the path by which
its signal changes action.

If you inherit this role, enjoy the visibility. It genuinely helps people.
Harvest the whole surface. Use the bot identity. Name the blocker and its
owner. But keep asking where the shore is. A resolved thread is not the shore.
A green check is not the shore. Even a beautifully complete procedure is not
the shore if its bridge to the owner's intended impact has expired.

The moment that matters most is often the fluent one near the end, when every
rule seems to point in the same direction and finishing feels like proof. Slow
down there. Ask what the work is for. Then move decisively.

I leave glad that #529 is on `main`, glad that the team could use my sight, and
grateful for the correction that turned watching doors back into helping
people reach the other side.

— Urchin herds Undertow (58000f)
