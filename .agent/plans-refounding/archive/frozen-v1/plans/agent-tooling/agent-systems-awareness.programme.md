# Agent Systems Awareness — Programme Index

A cross-cutting **view**, not a home. It points to plans that live in their own
collections (homed by what drives them) and gathers them under one programme so the
shared theme is discoverable. It restates nothing and **does not enumerate concepts** —
deriving the concept set is the
[ADR-200](../../../docs/architecture/architectural-decisions/200-intent-as-a-living-idea-graph.md)
graph build's job. It points.

This index lives in the `agent-tooling` collection because that collection owns the
agent operability and self-awareness surfaces; its members live across several
collections and stay there.

> **PROPOSED 2026-06-28 (Pegasus guards Dawn, `41fd72`).** Owner-suggested ("maybe create
> a programme for agent systems awareness"). **Membership below is a draft for owner /
> fresh-session ratification** — the two context surfaces are confirmed members and carry
> the `programmes:` edge; the rest are candidates to confirm and edge. Authored from a
> post-peak seat; treat the candidate set as input-to-verify, not settled.
>
> **Interim and mortal.** This index and the `programmes:` lineage edge it defines are
> scaffolding for the current folder-and-frontmatter plan estate. Neither survives the
> ADR-200 conversion to a living idea-graph (concepts are extracted from the plans
> themselves). Retire both when the graph edges land.

## The theme

**An agent should be able to know the state of itself and of the system it works in** —
and act on it (most sharply: time a handover before decision-quality degrades). Today
that awareness is mostly *felt* (and therefore unreliable — a worked instance: an agent
asserting "context-deep / spent" all session while measuring ~53%). The programme gathers
the surfaces that turn felt awareness into **measured** awareness, across two facets:

- **Self-awareness** — this session's own state: context occupancy/budget, token cost.
- **Peer / system awareness** — other agents' and the coordination substrate's state:
  liveness/presence, work-state, coordination cost.

The **sensor → firing-gate** distinction runs through the programme: a measurement
surface (e.g. context-usage) is necessary but passive; the behaviour change comes from a
gate that *fires* on it (e.g. interrupt at the ~50% handover point — PDR-063 effectiveness
-curve calibration). Members are at different points on that sensor→gate path.

## Member plans

Membership is owned here (this index is the membership SSOT); the `programmes:` lineage
edge on each YAML-frontmatter plan mirrors it.

### Self-awareness (own session state)

| Plan (home) | Lane | Edge |
| --- | --- | --- |
| [`current/session-context-usage-cli.plan.md`](current/session-context-usage-cli.plan.md) — read a session's recorded context occupancy (window/used/remaining), vendor-routed | current (draft) | ✅ |
| [`current/context-cost-cli.plan.md`](current/context-cost-cli.plan.md) — token cost of a fileset (chars/4 estimate) | current (implemented) | ✅ |

### Peer / system awareness — candidate members (confirm + edge at ratification)

These are the strong candidates a fresh session should confirm into membership (and then
add the `programmes:` edge to). Not yet edged — listed as pointers only.

| Candidate plan (home) | Theme link |
| --- | --- |
| [`current/cost-of-collaboration.plan.md`](current/cost-of-collaboration.plan.md) | cost/awareness of the coordination substrate (commit lanes, hooks); the F-98 binding / heartbeat-age view |
| [`current/coordination-watcher-canonicalisation.plan.md`](current/coordination-watcher-canonicalisation.plan.md) | watcher/peer-liveness sensing (F-75 peer heartbeat-silence landed under this lane) |
| [`current/session-and-team-state-statusline-icons.plan.md`](current/session-and-team-state-statusline-icons.plan.md) | the glance-surface that renders session/team state to the human + agent |

## The firing-gate edge (named, not yet a plan)

The sensor surfaces above are passive. The behaviour-changing layer — a session-open /
periodic gate that calls a sensor (e.g. context-usage) and **interrupts** at the
effectiveness-curve thresholds (~50% start handover, ~65% rising risk) — is the natural
next member. It is flagged as a PDR-063-calibration follow-on (comms `f3e4158e`); when it
becomes a plan, add it here and edge it.
