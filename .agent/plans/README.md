# .agent/plans/ — the planning estate

The repository's home for **intent and mechanism**: why each piece of
work exists, how it is done, what proves it done, and who ratified it.
Everything that moves with the schedule lives in Linear and is pointed
at, never mirrored — the full contract is the
[plan-node schema](plan-node-schema.md).

Three plan types: **strategic** (the outcome and the bet — long-lived,
few), **delivery** (one bounded lane — short-lived, archived at
completion), **runbook** (a repeatable procedure). Milestones are not a
plan type: they live in Linear as named observable states of the
product, and the strategic layer points at them.

**Every plan is born `sketch`** and governs no work until it carries a
complete owner-ratification stamp (`ratified_by` + `ratified_date` +
`ratified_where`). Executed is not ratified; the stamp is the
difference, and the estate validator enforces it.

## Layout

| Path | Holds |
| --- | --- |
| [`plan-node-schema.md`](plan-node-schema.md) | The contract every plan conforms to |
| [`impact-areas.md`](impact-areas.md) | The closed, additive registry behind `impact_areas` |
| `strategic/` | Strategic nodes |
| `delivery/` | Delivery plans (the live lanes) |
| `runbooks/` | Operational procedures |
| [`templates/`](templates/README.md) | The three authoring templates, each opening with its ratification block |
| `archive/` | Terminal plans (completed, superseded, or abandoned — each with its disposition) |

Plans are public-repository artefacts: **mechanism only**; anything
internal rides the linked Linear ticket (sensitivity by construction).

## Transition note (dated 2026-07-22)

The estate structure above was owner-ratified at the planning sitting,
part 1 (decisions register D23); its content is poured at part 2. The
artefacts of the prior 2026-07-21 sketch corpus remain in place below
this note's date until the redo assigns each its disposition — they are
evidence, not baselines. The conserved prior estate stays untouched in
[`.agent/plans-backlog-2026-07/`](../plans-backlog-2026-07/BACKLOG.md).
