# Plan templates

One template per plan type, each opening with its ratification block so
sketch-vs-ratified is visible at the top of every plan from birth. The
contract they instantiate is the
[plan-node schema](../plan-node-schema.md); the `impact_areas` values
come from the [closed registry](../impact-areas.md).

| Template | Use for |
| --- | --- |
| [`strategic-plan-template.md`](strategic-plan-template.md) | A strategic node: the outcome, the bet, success, and the tempo of its subtree |
| [`delivery-plan-template.md`](delivery-plan-template.md) | One bounded lane, authored by its implementer at pickup |
| [`runbook-plan-template.md`](runbook-plan-template.md) | A repeatable operational procedure |

Copy the skeleton from inside the template's fenced block, fill it,
delete the guidance. Every plan is born `status: sketch` and governs no
work until its ratification stamp is complete.

Older template and component files in this directory predate the
2026-07-22 estate structure (decisions register D23) and await their
redo dispositions; do not author new plans from them.
