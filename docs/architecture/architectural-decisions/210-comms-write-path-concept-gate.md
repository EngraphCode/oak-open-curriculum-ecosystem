# ADR-210: Comms Write-Path Concept Gate

- **Status:** Accepted (owner-ratified route, landed and dogfooding since 2026-07-02; recorded at
  the 2026-07-06 consolidation).
- **Relates to:** [ADR-183](183-comms-event-tag-namespace-substrate.md) (the comms-event tag
  namespace this gate composes with), PDR-044 (the memetic immune system whose trip-lists this
  gate enforces), PDR-066 (comms-events as failure-mode channel — the capture traffic the gate
  must never suppress).

## Context

PDR-044's innate-immunity layer (hedging-vocabulary and indefinite-deferral trip-lists) fired only
on `Edit`/`Write` hooks over doctrine surfaces. The comms event stream had no structural
enforcement, and it is **upstream of doctrine**: consolidation copies comms language forward into
thread records and plans, where the write-hook then fights the consolidator. The gap was observed
directly — four agents circulated a hedging term in coordination events in one day
(owner-caught, 2026-07-02), and the vocabulary distorted the claims model itself. The structural
cure was ruled to live in the comms CLI, not in per-agent vigilance.

## Decision

The `collaboration-state` comms write path (`append` / `direct` / `reply`) runs every event body
through a **concept gate** before writing:

1. **SSOT-loaded**: the gated concept groups load from the canonical hook policy file
   (`scoped_blocks`) — the same source the Edit/Write hooks read. The gate never carries its own
   copy of the trip-lists.
2. **Capture-tag recursive exclusion**: events tagged `failure-mode` or `behaviour-note`
   (ADR-183) are exempt **by declared nature** — capturing a failure mode requires quoting it.
   There is no override flag; the exemption is the tag semantics, not an escape hatch.
3. **Result-typed with a single CLI throw-translation**: the gate returns `Result`; the one throw
   boundary is the existing CLI edge (ADR-088 discipline).
4. **Teaching-payload refusals**: a blocked write names the concept, the policy citation, and the
   honest replacement — the refusal teaches, it does not merely reject.
5. **Fail closed on a partial policy** (hardened 2026-07-06 after a review finding): a policy
   file missing `scoped_blocks` or either comms-gated concept group is a loud teaching error
   naming each missing concept — never a silent pass-through. A malformed policy blocks the
   write on both channels.

## Consequences

- Widening `COMMS_GATED_CONCEPTS` is a **governance act**: it changes what every agent can write
  to the coordination stream, and it routes through this ADR (amend it with the rationale) —
  never a quiet constant edit.
- The comms stream and the doctrine surfaces now sit behind the same immune layer, so
  consolidation no longer imports vocabulary the write-hook must then reject.
- Genuine failure-mode capture is structurally protected (the tag exemption), so the gate cannot
  suppress the PDR-066 channel it lives on.
- The gate is a worked instance of enforcement-at-the-write-path over
  passive-guidance-at-read-time (`passive-guidance-loses-to-artefact-gravity`): the trip-list
  fires at the action moment, on the one shared surface that previously had none.

## Falsifiability

If the gate blocks legitimate coordination language at a material rate (refusals that survive
review as false positives), the concept groups are miscalibrated — narrow them through the
governance route above. If hedging vocabulary keeps reaching thread records despite the gate, the
leak is on another write path and this ADR's scope claim is wrong — find and gate that path or
revise the ADR.
