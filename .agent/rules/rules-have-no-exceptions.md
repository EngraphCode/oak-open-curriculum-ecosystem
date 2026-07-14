# Rules Have No Exceptions

Operationalises [`principles.md` §Strict and Complete](../directives/principles.md#strict-and-complete).

A rule states what to do, and it holds in every case it governs. The point of
a rule is that one statement is strong enough that nothing has to escape it.

When a case appears that the rule seems not to fit, read it as evidence about
the rule. Improve the rule until its single statement covers the case
correctly — sharpen the principle, state its domain more precisely, or
re-express it so the case falls inside it. The repaired rule is whole again,
and every later reader inherits the fix.

An exception does the reverse. It freezes the misfit into the rule and states
the rule by where it stops holding, so a rule with an exception has stopped
being improved. It also carries the shape
[`no-tombstones-for-removed-ideas`](no-tombstones-for-removed-ideas.md) warns
against — a live instruction defined by what it is not. An exception is a
tombstone for the case the author could not yet fit.

## When a case seems not to fit

1. Read the misfit as evidence the rule is incomplete.
2. Make the smallest change to the rule's statement or its stated domain that
   makes the case fall inside it correctly.
3. If two real cases demand genuinely opposite behaviour, the rule is
   conflating two principles — split it into two rules, each whole on its own.
4. A case you cannot yet resolve is surfaced for an owner doctrine decision,
   never parked inside the rule as a carve-out.

## A documented bypass is a carve-out, even when the actor is legitimately outside the rule's audience

When a real actor legitimately needs different treatment than the rule
prescribes (release automation writing to `main`; a service account; a
scheduled job), the fix is **scoping the rule's audience explicitly**
("release automation is outside this rule's audience and handles its own
writes"), never **documenting the bypass mechanism** for that actor inside
agent-facing doctrine. A documented mechanism is itself a carve-out: an
exception agents know about is an exception they will eventually argue
themselves into using, and each round of review pressure to "explain how X
still works" tends to add more mechanism detail, compounding the leak.
Audience-scoping states *who the rule does not govern* in one line, with zero
mechanics; it does not teach agents how the excluded actor operates.

Worked instance (2026-07-08, PR #332 arc):
[`never-commit-to-main`](never-commit-to-main.md) initially grew increasingly
detailed documentation of how release automation legitimately writes to
`main` (reviewers pushed for even more mechanism detail, and it was added —
precedent compounding via review pressure). The cure was deleting the
mechanism prose and adding one audience-scope sentence instead: "Release
automation is outside this rule's audience and handles its own writes; its
mechanics are not agent-facing knowledge." Bot reviewers' "won't this block
X?" questions get answered in the PR thread (a record), never folded into
standing doctrine (a teaching surface).

## Why this is strict

Exceptions accrete. Each one is a small licence to stop thinking, and the next
author reads the carve-out as permission to add their own. A rule that holds
everywhere stays sharp and stays trusted; a rule riddled with exceptions
becomes advisory, and an advisory rule is no rule. Fixing the statement is more
work once; an exception is less work paid for forever.

## Related

- [`no-tombstones-for-removed-ideas`](no-tombstones-for-removed-ideas.md) — an
  exception states a rule by what it is not; the same negation pattern, at the
  level of rule-authoring.
- [`new-rule-vs-pdr-clause`](new-rule-vs-pdr-clause.md) — whether an improvement
  belongs in a rule or a PDR clause.
