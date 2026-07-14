# Freeze-planning sitting — 2026-07-14 (ratification record)

Status: **RULED** — the owner ratified at ~19:50Z, 2026-07-14, in the Director
session (Quasar mends Umbra, 52b4de; decision put and answered via the session's
structured question surface). This record is the `ratifiedBy` target of
[`freeze-rule.json`](./freeze-rule.json) and the sitting the G2 packet's S0 HOLD
named as its release condition
([`g2-s0-landing-packet.md`](./g2-s0-landing-packet.md) §6 item 5).

## What this sitting was for

The 2026-07-14 G2/G3 sitting held S0 pending a Director pre-freeze estate review
and a freeze-planning sitting, and the post-sitting register re-homing (owner
approved, landed via PR #375) deleted the freeze rule's `operational-registers`
class — an amendment that per the schema contract returns `ratifiedBy` to `null`
until a confirming sitting re-ratifies. The estate review completed 2026-07-14
(all sessions closed cleanly, thirteen team PRs plus the #376 omnibus merged,
the dedicated consolidation session executed and retired, the team branch
reconciled). This sitting is the confirming ratification.

## Ruling 1 — the freeze rule is RATIFIED as it stands

The owner ratified the seven-class, register-free rule:

- **in**: `plans`, `milestones`, `proposals`
- **sweep**: `plans-old-archive`, `prompts`, `thread-records`
- **out**: `reports-research-evals`

There is no `operational-registers` class because the exclusion it expressed was
replaced structurally: all six registers (frictions register, deferred-controls
register, three documentation-sync-logs, the refounding cost ledger) were
re-homed out of `.agent/plans/**` entirely, so the plans tree contains only
planning intent and the enumeration needs no subtraction. The six files stay
live and untouched — out of the corpus was never out of the estate. All other
G2 rulings stand unchanged: landing shape (the committed denominator is the
S0-day run's output, never the evidence-run totals), scoped archive-only gate
exclusions, the tool's refusal-gated secret scan as the attestation of record,
and the hard hours-scale commit window.

## Ruling 2 — the S0 window opens NOW

The owner ruled "Now — run the sequence": the Director runs the pre-window
sequence immediately (reconciliation PR to main carrying the consolidation tier
plus this ratification; r1 worktree onto a fresh branch cut from then-current
`origin/main`; stale evidence-run artefacts cleared inside the window per G2
§4), then broadcasts window OPEN, lands the exclusion-configs commit and the one
atomic S0 freeze commit, pushes, merges, and broadcasts window CLOSE — hours
scale, same evening. In-flight report writing continues unaffected: reports are
`out` of the corpus by ratified class.
