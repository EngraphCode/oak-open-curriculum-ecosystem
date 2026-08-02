# The Codex Dialogues trial tally — operating record (2026-08-02 →)

The durable corpus of the-codex-dialogues trial window
([SKILL](../../skills/the-codex-dialogues/SKILL-CANONICAL.md) §"Trial
window"): one row per dialogue close, appended AT OCCURRENCE as part of
the close sequence. Comms events are transport — this file is the
storage (the same discipline as the
[cricket tallies](cricket-quartet-tally-2026-07-29.md); close events
are instance-tier untracked state under ADR-199/PDR-094, so the trial's
decision rule reads THIS corpus, which resolves from any checkout).

Each row conserves the close event's canonical `key=value;` body line
VERBATIM, decoded by the schema-version definitions in the SKILL
(§"Close-event schema versions"). Corrections are appended as notes,
never edited into the conserved line — the same immutability the
close-event definitions carry.

## Trial window state

- Window: 12 dialogues or 14 days from the first dialogue, whichever
  comes first. First dialogue closed 2026-08-02, so the 14-day window
  ends 2026-08-16.
- Counts are DERIVED AT READ TIME from the rows below, never authored
  here (`no-moving-targets-in-permanent-docs` §Authoring-Time Open-Set
  Clause): a dialogue counts toward the trial thresholds by its row's
  `outcome`; `non-evaluable` rows are excluded exactly as the SKILL's
  trial window states.

## Dialogue closes

### dlg-20260802-lockstep-pins (trial dialogue 1, closed 2026-08-02T12:50Z)

Pre-`close_schema`-key era; decodes as version 1 per the SKILL.

```text
dialogue_id=dlg-20260802-lockstep-pins; question_class=design-fork; turn_count=3; stop_reason=stabilised; outcome=position-changed; prior_confidence=medium; harness_version=claude-code 2.1.220; codex_cli_version=0.146.0; synthesis_ref=https://github.com/oaknational/oak-open-curriculum-ecosystem/pull/713#issuecomment-5157991430;
```

### dlg-20260802-close-schema (trial dialogue 2, closed 2026-08-02T13:21Z)

Pre-`close_schema`-key era; decodes as version 1 per the SKILL.
NATIVE-SESSION re-run; confirmed with prior confidence medium (the
seat's post-dialogue confidence rose to high — the field conserves the
PRE-dialogue prior, per the field rules).

```text
dialogue_id=dlg-20260802-close-schema; question_class=design-fork; turn_count=3; stop_reason=stabilised; outcome=confirmed; prior_confidence=medium; harness_version=claude-code 2.1.220; codex_cli_version=0.146.0; synthesis_ref=https://github.com/oaknational/oak-open-curriculum-ecosystem/pull/713#issuecomment-native-rerun-pending;
```

- **Correction (threaded comms event, 2026-08-02T13:23Z)**: the
  conserved line's `synthesis_ref` was composed before its synthesis
  surface existed (the compose-order violation the SKILL's field rules
  now name as the worked instance). The resolved durable ref is
  <https://github.com/oaknational/oak-open-curriculum-ecosystem/pull/713#issuecomment-5158174931>.
