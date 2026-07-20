---
name: "ARC-colour statusline infrastructure — bring the feather badges + usage relocation into oak"
overview: "Adopt castr's ARC channel-grammar-derived truecolor feather badges and the repo-title usage relocation into oak agent-tools, as one coherent estate with in-place corpus repair — no compatibility layers, no legacy surfaces."
lineage:
  serves_thread: agentic-engineering-enhancements
  serves_stream: agent-experience-substrate
  strategic_choice: "agent-experience is first-class (PDR-111): the statusline is the agent's always-on glance surface; multi-channel identity-coloured liveness is a substrate capability, not decoration."
  derives_from: "Owner direction 2026-07-20: bring the feather icon enhancements and the moved usage-quota data from the Resonance→castr statusline lane into oak; the ARC feather system is a serious statusline-infrastructure upgrade. No backwards compatibility (principles.md §Core Rules)."
todos:
  - id: ws-a-cycle-1
    content: "WS-A (usage relocation) cycle 1: test asserts ctx: + s/w gauges render on the repo-title (location) row, not the identity/model rows; add locationRowsWithUsage() to oak render.ts and re-point the two row-assembly sites. render.ts only. One commit, tree green."
    status: pending
    # depends_on: []  # fully independent of Deliverable B (no ARC dependency)
  - id: ws-b1-adr
    content: "WS-B1: author ADR 'ARC-colour statusline infrastructure' — canonical channel grammar single-homes ARC_PALETTE_SIZE + ARC_ACTIVE_WINDOW_SECONDS; feather colour is a projection of parsed channel content; corpus repaired in place; validator fails loud on the canonical surface. Non-code."
    status: pending
    # depends_on: []
  - id: ws-b2-grammar
    content: "WS-B2 cycles: src/arc/arc-channel-grammar.ts + arc-channel-grammar.unit.test.ts (parseArcChannel, resolveChannelColour, deriveArcRoster, isCrossHostChannelName, ARC_PALETTE_SIZE, ARC_ACTIVE_WINDOW_SECONDS, evaluateArcChannelStrictness). DELETE oak's local hard-coded ARC_ACTIVE_WINDOW_SECONDS in session-shape.ts; import from the grammar (consolidate-at-second-consumer). TDD per cycle."
    status: pending
    depends_on: [ws-b1-adr]
  - id: ws-b3-palette-ansi
    content: "WS-B3 cycles: statusline-arc-palette.ts (8 truecolor mid-tones + ARC_ERROR_FOREGROUND, imports ARC_PALETTE_SIZE from the grammar) + truecolorForeground(r,g,b) added to statusline-ansi.ts. TDD per cycle."
    status: pending
    depends_on: [ws-b2-grammar]
  - id: ws-b4-sessionshape-gatherer
    content: "WS-B4 cycles: replace SessionShape.arcActive:boolean with arcChannels:ArcChannelBadge[] in statusline-session-shape.ts (bounded content reads: ARC_CONTENT_READ_CAP=8 / ARC_CONTENT_BYTE_CAP=256KB, membership-first ranking); upgrade the gatherer (attachInWindowContent) in statusline-identity.ts. Converge to ONE design; PRESERVE oak's identityPrefix path (sessionIdPrefix, oak-logo). Bring observing-directed teamShape (part of the coherent session-shape). TDD per cycle."
    status: pending
    depends_on: [ws-b2-grammar]
  - id: ws-b5-feather-render
    content: "WS-B5 cycles: featherBadge() per-channel rendering in statusline-indicators.ts (colour ink on U+258C membership bar, U+21C5 cross-host marker, U+25CF invalid dot, overflow badge) REPLACING the single ARC_WING. HAND-MERGE: keep oak's 3-arg formatIdentity(identity, identityPrefix, ownRole). Preserve the emoji-never-inside-SGR invariant. TDD per cycle."
    status: pending
    depends_on: [ws-b3-palette-ansi, ws-b4-sessionshape-gatherer]
  - id: ws-b6-colour-writer
    content: "WS-B6 cycles: src/arc/arc-next-colour.ts + arc-next-colour-cli.ts (+ unit test) — the colour-index writer. Wire to agent-tools package.json script AND knip entry list AND depcruise reachability. TDD per cycle."
    status: pending
    depends_on: [ws-b2-grammar]
  - id: ws-b7-validator
    content: "WS-B7 cycles: src/validators/arc-channels/validate-arc-channels.ts (+ helpers + test) targeting the canonical rapid-comms surface, failing loud when absent/invalid. Wire into repo-validators:check + package.json + knip entry + depcruise reachability. TDD per cycle."
    status: pending
    depends_on: [ws-b2-grammar]
  - id: ws-b8-corpus-repair
    content: "WS-B8: REPAIR the 49 tracked rapid-comms channels in place — add Channel-colour: lines (assigned via ws-b6 writer) and conform entry headers/timestamps to the grammar's strict tier. No grandfather, no exclusion. Acceptance = ws-b7 validator green over the full corpus."
    status: pending
    depends_on: [ws-b6-colour-writer, ws-b7-validator]
  - id: ws-b9-convention-doc
    content: "WS-B9: author .agent/reference/arc-rapid-communication.md (the ARC channel-open convention — record a colour index at open) and wire the channel-open ceremony (comms/start-right surfaces) to invoke the ws-b6 writer. Reference-direction safe placement (non-policed root)."
    status: pending
    depends_on: [ws-b6-colour-writer, ws-b7-validator]
  - id: ws-b10-integrate-review
    content: "WS-B10: full pnpm check (knip + depcruise + repo-validators + build + test) over the integrated delivery; adversarial specialist reviews (react/type/test/config/security as applicable); ADR finalisation; doc propagation. All acceptance ids proven."
    status: pending
    depends_on: [ws-a-cycle-1, ws-b5-feather-render, ws-b8-corpus-repair, ws-b9-convention-doc]
isProject: false
---

# ARC-colour statusline infrastructure

## End goal

Oak's agent statusline renders, per live rapid-comms channel this session
participates in, an **identity-coloured feather badge** (truecolor, drawn from the
channel's recorded colour index), with cross-host and invalid/overflow states — and
the context + rate-limit usage gauges sit on the **repo-title row**. This is the
"serious statusline-infrastructure upgrade" of owner direction 2026-07-20: the
multi-channel coloured liveness that castr brought from Resonance, made native to
oak.

## Mechanism

The coloured feather is **a projection of parsed ARC channel content**, not
decoration: each channel file records a `Channel-colour: <index>` line and roster
headers; the statusline's per-tick gatherer reads them (bounded) and the renderer
maps each to a truecolor badge. That is why the feature is inseparable from the
channel **grammar** (`src/arc/arc-channel-grammar.ts`) and its **validator** — the
grammar defines what a colour/roster *is*, and the validator keeps the corpus honest
so the colours mean something. Bring the whole estate or the colours are inert.

## Means

Two deliverables. **A** is independent and ships first; **B** is one coherent estate
sequenced as self-correcting deliverables (PDR-093).

- **Deliverable A — usage relocation (`ws-a-cycle-1`).** Oak already has the `s`/`w`
  rate-limit gauges and the `ctx` context gauge (`statusline-usage.ts` is
  byte-identical to castr; `formatRateLimits` already emits `rateLimitGauge('s',…)`).
  The only missing piece is **placement**: transplant castr's `locationRowsWithUsage()`
  into oak's own `render.ts` (keeping oak's logo-by-style layout and `oak-logo.ts`)
  and re-point the two row-assembly sites so `ctx:` + `s`/`w` render on the repo-title
  location row. Zero new dependencies.

- **Deliverable B — the ARC-colour estate.** grammar (`ws-b2`) → palette + truecolor
  helper (`ws-b3`) → session-shape/gatherer upgrade (`ws-b4`) → feather rendering
  (`ws-b5`); colour-writer CLI (`ws-b6`) and validator (`ws-b7`) off the grammar;
  in-place corpus repair (`ws-b8`) proven green by the validator; the channel-open
  convention (`ws-b9`); integration + review (`ws-b10`). The ADR (`ws-b1`) leads.

## Why no backwards compatibility (principles.md §Core Rules — decisive)

This plan deliberately **excludes** the compatibility-shaped options the seam map
first surfaced, because `principles.md` forbids them:

- **No grandfathering the legacy corpus.** *"No legacy surfaces… repair historical
  data in place or replace the owning surface completely."* The 49 existing channels
  are **repaired in place** (`ws-b8`), not exempted with a grandfather window.
- **No colour-less feather fallback.** *"WE DON'T HEDGE — it is worth doing or it
  doesn't exist."* A feather that renders without a real colour index is a hedge.
- **No grammar without its validator.** *"No unused code — delete dead code."*
  Grammar strictness exports are consumed only by the validator; shipping one without
  the other is prod-unreachable dead code. They land together.
- **No parallel versions / compatibility merge.** *"When renaming, rename
  EVERYWHERE — one concept = one name."* Divergent files converge to **one** canonical
  design (oak's `identityPrefix` + castr's feathers), never two shapes bridged.
- **Single-home the shared constants.** `ARC_PALETTE_SIZE` and
  `ARC_ACTIVE_WINDOW_SECONDS` live only in the grammar; oak's local hard-coded
  `ARC_ACTIVE_WINDOW_SECONDS=1800` is **deleted** and imported (consolidate-at-second-consumer).

## Prerequisites

- **Blocking:** `ws-b1` ADR precedes code (records the canonical-surface + repair-in-place
  decision the rest depends on). `ws-b2` grammar blocks `ws-b3/b4/b6/b7`. `ws-b6`+`ws-b7`
  block `ws-b8` (the writer assigns colours; the validator proves the repair).
- **Beneficial:** `statusline-registry-read.ts` (castr's extracted solo-floor registry
  reader) — minimum shippable without it: keep oak's inline registry reader; the feather
  path does not require the extraction.
- **Satisfied:** `zod ^4.4.3` is already in `agent-tools/package.json` (the grammar's
  only external dependency). No new install.

## Non-goals (YAGNI + excluded hedges)

- No colour-less / boolean-only feather rendering (excluded hedge).
- No grandfather window, exclusion list, or fallback reader for the legacy corpus.
- No `subagent-statusline*` or `engraph-logo` bring — castr-adjacent, not part of the
  two named features; oak keeps `oak-logo.ts`.
- No adoption of castr's pre-resolved-`logoRows` render architecture (castr itself flags
  it as oak's separate WS4.1 target); the usage relocation applies to oak's existing
  `render.ts`.
- No de-branding debt left behind: every brought file uses oak naming (no
  engraph/Fable/Engraph residue).

## Sequencing is self-correcting (PDR-093)

Each downstream gate breaks if its predecessor drifted: `ws-b7` (validator) reds if
`ws-b8` (corpus repair) is incomplete; `ws-b5` (feather render) tests fail if `ws-b4`
(gatherer shape) drifted; `ws-b3` palette is consumed by `ws-b5`; `ws-b2` grammar is
consumed by b3/b4/b6/b7. Deliverable A shares no surface with B and is parallel-safe.

## Acceptance criteria

- **A:** a render unit test asserts `ctx:` + `s`/`w` appear on the repo-title/location
  row and NOT on the identity/model rows, across logo and no-logo layouts. Proof: `unit`.
- **B2:** grammar unit tests cover parse/colour/roster/cross-host/strictness; oak's local
  `ARC_ACTIVE_WINDOW_SECONDS` is gone (`rg` shows one definition, in the grammar). Proof: `unit` + `non-code`.
- **B3:** palette + `truecolorForeground` unit tests; `38;2` SGR output asserted. Proof: `unit`.
- **B4:** session-shape resolves `arcChannels[]` from fixture channels with recorded
  colours; bounded-read caps asserted; `identityPrefix` still rendered. Proof: `unit`.
- **B5:** per-channel feather badges render with the recorded colour; cross-host/invalid/
  overflow states asserted; oak's 3-arg `formatIdentity` prefix preserved. Proof: `unit`.
- **B6:** `arc-next-colour` CLI assigns a valid index; wired as a package script (knip +
  depcruise green). Proof: `unit` + `non-code` (gate).
- **B7:** validator fails loud on a malformed fixture and passes a conformant one; wired
  into `repo-validators:check`. Proof: `integration` + `non-code` (gate).
- **B8:** `validate-arc-channels` is **green over all 49 real channels** (data repaired,
  not exempted). Proof: `value-proxy` (the real corpus passing the real gate).
- **B9:** the convention doc exists at the canonical reference path; channel-open records a
  colour. Proof: `non-code`.
- **B10:** full `pnpm check` green (knip + depcruise + repo-validators + build + test +
  markdownlint + format); specialist reviews dispositioned; ADR finalised. Proof: `non-code` (aggregate gate).

## oak gate/boundary constraints the port must satisfy (from the seam map, verified first-hand)

- Root `pnpm check` runs `knip` and `depcruise` as **blocking** top-level gates. `knip.config.ts`
  (agent-tools) auto-covers `src/claude/**` (so `statusline-arc-palette.ts` is fine) but has
  **no `src/arc` entry** — any executable there (`arc-next-colour-cli`) MUST be added to the knip
  entry list AND a `package.json` script, or knip flags unused / depcruise flags orphan.
- `.dependency-cruiser.mjs` `no-orphans` is `severity: error`; a new non-test `.ts` must be
  reachable from an entry. `no-import-from-agent-substrate` forbids **module** imports of `.agent/`
  — the statusline's **fs reads** of rapid-comms are the sanctioned exception (already used).
- `source-is-typescript-esm-only`: intra-package imports use explicit `.js` specifiers on `.ts`
  sources (`../arc/arc-channel-grammar.js`).
- `reference-direction` validator (PDR-105, blocking, debt burned to zero): the convention doc
  goes under `.agent/reference/` (a **non-policed** root, mirroring castr) and must not cite a
  more-ephemeral surface.
- agent-tools build: `tsc -p tsconfig.build.json` then `chmod +x dist/src/bin/*.js …` — a new bin
  executable must be emitted and chmod'd.

## Risks and mitigations

- **Unbounded-host-load posture change** — the colour path converts the per-tick gatherer from
  2 cheap reads to up to 8 reads of ≤256KB on a constantly-ticking surface. Mitigation: bring the
  caps (`ARC_CONTENT_READ_CAP`/`BYTE_CAP`) and membership-first ranking **verbatim**; the
  `no-unbounded-host-load` rule means they are load-bearing, not loosenable.
- **identityPrefix regression** — naive wholesale copy of castr's `indicators.ts`/`segments.ts`
  drops oak's 3-arg prefix-rendering `formatIdentity` (the PDR-027 cross-repo join key display).
  Mitigation: hand-merge (`ws-b4`/`ws-b5` acceptance explicitly re-asserts the prefix).
- **Corpus repair scale** — 49 channels, 46 with pre-grammar headers, some post-2026-07-09
  (full strict tier), plus the undated `.starless-notice-body.md`. Mitigation: `ws-b6` writer
  batch-assigns colours; `ws-b8` conforms headers; `ws-b7` is the objective done-signal.
- **teamShape scope creep** — castr's session-shape also adds `observing-directed` + a director
  honesty-gate. Decision: **in scope** (part of the coherent session-shape design; excluding it
  would fork the shape — a hedge). Re-asserted in `ws-b4`.

## Foundation alignment

- `principles.md`: §Strict and Complete, §Core Rules (no backwards compatibility / no legacy
  surfaces / no escape hatches / one concept one name / consolidate-at-second-consumer), §First
  Question. These **generate** this plan's shape (the "why no backwards compatibility" section).
- `testing-strategy.md`: every WS that lands product code is test+code TDD cycle-pairs; pure-unit
  for grammar/palette/render, integration for the validator, value-proxy for the real-corpus pass.
- `schema-first-execution.md`: the grammar is the schema authority for channel shape; colour/roster
  types flow from it, not hand-rolled per consumer.

## Plan-body first-principles check

- **Shape clause:** the "bring the whole estate or nothing" shape is forced by principles (no dead
  code, no hedge), not chosen for convenience — recorded in §Why-no-backwards-compatibility.
- **Landing-path clause:** each WS lands as TDD cycle commits; the corpus repair (`ws-b8`) lands
  only when the real validator is green over the real corpus (value-proxy, not self-authored).
- **Vendor-literal clause:** no vendor integration; the only external dep (`zod`) is already present.

## Readiness reviewers (before DECISION-COMPLETE)

`assumptions-expert` (plan proportionality + the teamShape/observing-directed scope call),
`config-expert` (knip/depcruise/package-script wiring for the new `src/arc` executables + validator),
`test-expert` (TDD cycle integrity across the estate), `docs-adr-expert` (the ADR + convention doc).

## Learning loop

On completion, run `oak-consolidate-docs`: graduate the ARC-colour grammar decision into the ADR,
conserve the corpus-repair method, and update the agentic-engineering thread record.

## Source maps (authoritative context, do not re-derive)

The castr→oak port surface, oak state, and seam/risk analysis were mapped first-hand
2026-07-20 (workflow `wf_0a56f8f8-ed5`). Castr source is on `EngraphCode/castr` `main`
(PRs #22 + #29 merged 2026-07-20); the feather source files are under
`castr/agent-tools/src/{claude,arc,validators/arc-channels}`. Oak destination is
`agent-tools/src/claude/statusline-*.ts` (no `src/arc/` today).
