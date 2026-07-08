# Cross-Repo Sessions Run the Join Ceremony

A session whose worktree repo and coordination home are different
repos, or that is about to COLLABORATE in a sibling Practice estate —
write into its substrate, register presence, or claim work there —
runs the inter-Practice join ceremony BEFORE its first cross-estate
collaboration action.

## Trigger

Any of, at any point in a session:

- the coordination home resolves (explicit flag or
  `PRACTICE_COORDINATION_HOME`) to a repo other than the worktree's
  own;
- work is about to write into another Practice estate's substrate —
  comms, claims, boxes, memory, plans, or liveness files (a watcher is
  a writer, and an exchange receipt is a write);
- work is about to register presence or claim work in another
  Practice estate (coordination posture, guest seats, thread joins).

## Scope — reads are unceremonied

**Read-only filesystem looks at a sibling estate on this machine do
not fire the ceremony** (owner ruling 2026-07-08, verbatim substance:
"the inter-Practice protocols are for collaboration, but they are an
enhancement, not a blocker, you can just go and look at the files").
Mining, verification sweeps, and estate-state checks that write
nothing and register nothing proceed directly. The ceremony binds
COLLABORATION boundaries; the moment a read-only session decides to
write, register, or claim, the ceremony fires before that first
action.

**The ceremony's object is AGENT COMMUNICATION** (owner clarification,
same day): a solo write window into a QUIET sibling estate — no live
seats to coordinate with, no registration, no claims — needs the
home's write GOVERNANCE (its gates, conventions, and a fresh branch
off its latest main) but not the full communication ceremony; run the
ceremony anyway when it helps do things properly. The moment live
peers, claims, streams, or registration enter, the full ceremony
binds.

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
