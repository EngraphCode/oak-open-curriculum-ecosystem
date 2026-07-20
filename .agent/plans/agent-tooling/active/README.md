# Active Plans — Agent Tooling

In-progress execution plans for the agent tooling substrate.

When a plan is being actively executed in a session, move it from
[`../current/`](../current/) to this directory. Move it back to
[`../current/`](../current/) when it pauses, or to [`../archive/`](../archive/)
when it completes.

## Plans

| Plan | Scope | Status |
| --- | --- | --- |
| [comms-corpus-research-and-rotation-strategy.plan.md](comms-corpus-research-and-rotation-strategy.plan.md) | Dedicated research pass over the preserved comms-event corpus — blind cold read, automated survey, failure-mode taxonomy, deep-dives across three lenses, ratification-ready non-held rotation strategy, owner-gated WS7 end-state execution. Owner-amended 2026-06-12 to the ultracode multi-wave execution strategy (statistical index, breadth extraction waves, power analysis waves, adversarial verification, corroboration-provenance matrix). | IN EXECUTION — WS0 complete, WS1 running (Katydid hunts Roost, a4314f) |
| [arc-colour-statusline-infrastructure.plan.md](arc-colour-statusline-infrastructure.plan.md) | Bring castr's ARC channel-grammar-derived truecolor feather badges into oak agent-tools, with the usage gauges on the model row (owner direction 2026-07-20), as one coherent estate: canonical channel grammar (`src/arc/`), palette + truecolor ANSI, `arcChannels[]` session shape, per-channel feather rendering, colour-assignment reporter CLI, corpus validator with its blocking gate, and the extended channel-open convention — grammar obligations bind from the adoption date forward (owner ruling 2026-07-20; channel history is append-only, never retro-edited). ADR-214 leads. Owner direction 2026-07-20; no backwards compatibility. | IN EXECUTION — readiness folded 2026-07-20 (4/4 SOUND-WITH-AMENDMENTS); ruling amendment folded (PR #432); Deliverable A cycle 1 MERGED (PR #427), cycle 2 (model-row move) pending; B cycles next (Herring herds Channel, 9d81e5) |

## Related

- Collection root: [../README.md](../README.md)
- Queued: [../current/README.md](../current/README.md)
- Future backlog: [../future/README.md](../future/README.md)
- Frictions register: [../../../memory/operational/frictions-register.md](../../../memory/operational/frictions-register.md)
