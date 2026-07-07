# Cross-Repo Sessions Run the Join Ceremony

A session whose worktree repo and coordination home are different
repos, or that is about to read from or write into a sibling Practice
estate's substrate, runs the inter-Practice join ceremony BEFORE its
first cross-estate action.

## Trigger

Any of, at any point in a session:

- the coordination home resolves (explicit flag or
  `PRACTICE_COORDINATION_HOME`) to a repo other than the worktree's
  own;
- work is about to write into another Practice estate's substrate —
  comms, claims, boxes, memory, plans, or liveness files (a watcher is
  a writer);
- work is about to consume another Practice estate's content as input
  (mining, verification, exchange receipt).

## Action

Invoke the
[`inter-practice-collaboration`](../skills/inter-practice-collaboration/SKILL-CANONICAL.md)
skill and run its ceremony in order — read the host's write governance
first, declare the home, resolve identity with the home's derivation,
register with the prefix join key, arm the home-tooling watcher, post
the adoption event — before the first cross-estate write. The doctrine
behind the ceremony is
[PDR-125](../practice-core/decision-records/PDR-125-inter-practice-collaboration-protocol.md).

## Why a Rule, Not Only a Skill

Discoverability is a load-bearing property of the protocol: a cold
agent in a freshly-transplanted repo must FIND the ceremony without
being told. Skills are invoked; rules fire. This rule is the firing
surface — it travels in the propagating Core set so every transplant
receives the trigger, not just the ceremony.

## Worked Instance

The 2026-07-05 first live exchange joined a foreign stream before this
rule existed and tripped the host's donor-neutrality doctrine with its
first event — the exact failure this trigger now catches at step one
of the ceremony.
