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
    content: "WS-A (usage relocation) cycle 1: test asserts ctx: + s/w gauges render on the repo-title (location) row, not the identity/model rows; add locationRowsWithUsage() to oak statusline-render.ts and re-point the two row-assembly sites. Allowed surface: agent-tools/src/claude/statusline-render.ts + agent-tools/tests/claude/statusline-render.unit.test.ts (the TDD pair travels together). One commit, tree green. Proof: pnpm --filter @oaknational/agent-tools test -- tests/claude/statusline-render.unit.test.ts"
    status: in_progress # landed as PR #427 (commit SHA: 7e5bf57cb); completes at merge
    # depends_on: []  # fully independent of Deliverable B (no ARC dependency)
  - id: ws-b1-adr
    content: "WS-B1: author ADR-214 (docs/architecture/architectural-decisions/214-arc-colour-statusline-infrastructure.md) + its README index entry — ONE ADR, kept at WHAT level: shared ARC constants single-home in the grammar module (consumers import, never redeclare); feather colour is a projection of parsed channel content; corpus repaired in place; validator fails loud on the canonical surface; and why the strict tier preserves the reference doc's protected zero-per-message-ceremony property. Non-code."
    status: pending
    # depends_on: []
  - id: ws-b2-c1-parse-strictness
    content: "WS-B2 cycle 1: src/arc/arc-channel-grammar.ts created with parseArcChannel + evaluateArcChannelStrictness (zod schema authority for channel shape). Tests at src/arc/arc-channel-grammar.unit.test.ts (co-located per testing-strategy §Development Workflow). Red→Green→Refactor, one landing. Proof: pnpm --filter @oaknational/agent-tools test -- src/arc/arc-channel-grammar.unit.test.ts"
    status: pending
    depends_on: [ws-b1-adr]
  - id: ws-b2-c2-colour-roster
    content: "WS-B2 cycle 2: resolveChannelColour, deriveArcRoster, isCrossHostChannelName, ARC_PALETTE_SIZE, ARC_ACTIVE_WINDOW_SECONDS added to the grammar. Red→Green→Refactor, one landing. Proof: pnpm --filter @oaknational/agent-tools test -- src/arc/arc-channel-grammar.unit.test.ts"
    status: pending
    depends_on: [ws-b2-c1-parse-strictness]
  - id: ws-b2-c3-single-home-constants
    content: "WS-B2 cycle 3: DELETE oak's local hard-coded ARC_ACTIVE_WINDOW_SECONDS in statusline-session-shape.ts (line ~93); import from the grammar (consolidate-at-second-consumer). Proof: rg -n 'ARC_ACTIVE_WINDOW_SECONDS\\s*=' agent-tools/src shows exactly one definition (the grammar's) AND pnpm --filter @oaknational/agent-tools test"
    status: pending
    depends_on: [ws-b2-c2-colour-roster]
  - id: ws-b3-c1-palette
    content: "WS-B3 cycle 1: statusline-arc-palette.ts (8 truecolor mid-tones + ARC_ERROR_FOREGROUND, imports ARC_PALETTE_SIZE from the grammar). Proof: pnpm --filter @oaknational/agent-tools test -- src/claude/statusline-arc-palette.unit.test.ts"
    status: pending
    depends_on: [ws-b2-c2-colour-roster]
  - id: ws-b3-c2-truecolor-ansi
    content: "WS-B3 cycle 2: truecolorForeground(r,g,b) added to statusline-ansi.ts; 38;2 SGR output asserted. Proof: pnpm --filter @oaknational/agent-tools test -- src/claude/statusline-ansi.unit.test.ts"
    status: pending
    depends_on: [ws-b2-c2-colour-roster]
  - id: ws-b4-c1-arcchannels-shape
    content: "WS-B4 cycle 1: replace SessionShape.arcActive:boolean with arcChannels:ArcChannelBadge[] in statusline-session-shape.ts (bounded content reads: ARC_CONTENT_READ_CAP=8 / ARC_CONTENT_BYTE_CAP=256KB, membership-first ranking). PRESERVE oak's identityPrefix path (sessionIdPrefix, oak-logo). ATOMIC CONSUMER MIGRATION: the same landing migrates the existing arcActive consumer (statusline-indicators.ts:64 and its fixtures) to read arcChannels (interim single-wing rendering from arcChannels.length until ws-b5-c1 replaces the rendering) so every declared landing compiles and tests green. RELOCATE the touched legacy describing tests tests/claude/statusline-session-shape.test.ts (§ARC liveness) to the co-located canonical src/claude/statusline-session-shape.unit.test.ts in the SAME landing (testing-strategy: tests live next to the code, *.unit.test.ts). Proof: pnpm --filter @oaknational/agent-tools test -- src/claude/statusline-session-shape.unit.test.ts"
    status: pending
    depends_on: [ws-b2-c3-single-home-constants]
  - id: ws-b4-c2-gatherer
    content: "WS-B4 cycle 2: upgrade the gatherer (attachInWindowContent) in statusline-identity.ts to resolve arcChannels from recorded channel content; converge to ONE design. Proof: pnpm --filter @oaknational/agent-tools test -- src/claude/statusline-identity.unit.test.ts (relocating the touched legacy tests/claude file in the same landing)"
    status: pending
    depends_on: [ws-b4-c1-arcchannels-shape]
  - id: ws-b4-c3-observing-directed
    content: "WS-B4 cycle 3: bring observing-directed teamShape + the director honesty-gate (part of the coherent session-shape). The gate reads a role field from claim records — verify oak's claim shape carries it and hand-merge, never assume field-name parity with castr. Tests assert: a non-member beside a fresh director-role claim resolves observing-directed; a stale or role-less director degrades to observing. Proof: pnpm --filter @oaknational/agent-tools test -- src/claude/statusline-session-shape.unit.test.ts"
    status: pending
    depends_on: [ws-b4-c1-arcchannels-shape]
  - id: ws-b5-c1-feather-badges
    content: "WS-B5 cycle 1: featherBadge() per-channel rendering in statusline-indicators.ts (colour ink on U+258C membership bar, U+21C5 cross-host marker, U+25CF invalid dot, overflow badge) REPLACING the single ARC_WING. HAND-MERGE: keep oak's 3-arg formatIdentity(identity, identityPrefix, ownRole). Tests assert the emoji-never-inside-SGR invariant with explicit ANSI-boundary assertions (no emoji code point between an SGR open and its RESET). RELOCATE the touched legacy tests/claude/statusline-render-session-shape.test.ts (arcActive fixtures) to co-located src/claude/statusline-render-session-shape.unit.test.ts in the SAME landing; pure render assertions stay unit-scale. Proof: pnpm --filter @oaknational/agent-tools test -- src/claude/statusline-indicators.unit.test.ts src/claude/statusline-render-session-shape.unit.test.ts"
    status: pending
    depends_on: [ws-b3-c1-palette, ws-b3-c2-truecolor-ansi, ws-b4-c2-gatherer, ws-b4-c3-observing-directed]
  - id: ws-b5-c2-composed-integration
    content: "WS-B5 cycle 2: ONE composed integration-scale test crossing the full describing surface — fixture channel text in → rendered coloured feather row out (gatherer+renderer composed, DI throughout, no disk IO) — co-located beside the integration point as src/claude/statusline-identity.integration.test.ts (never folded into a unit test file). Proof: pnpm --filter @oaknational/agent-tools test -- src/claude/statusline-identity.integration.test.ts"
    status: pending
    depends_on: [ws-b5-c1-feather-badges]
  - id: ws-b6-c1-writer
    content: "WS-B6 cycle 1: src/arc/arc-next-colour.ts — the colour-index assignment function (+ unit test). Proof: pnpm --filter @oaknational/agent-tools test -- src/arc/arc-next-colour.unit.test.ts"
    status: pending
    depends_on: [ws-b2-c2-colour-roster]
  - id: ws-b6-c2-cli-wiring
    content: "WS-B6 cycle 2: src/arc/arc-next-colour-cli.ts + agent-tools package.json script via `pnpm exec tsx` on source (dominant validator/CLI precedent, no dist chmod) + 'src/arc/arc-next-colour-cli.ts' added to root knip.config.ts workspaces['agent-tools'].entry. Proof: pnpm knip AND the script assigns a valid index against a fixture channel"
    status: pending
    depends_on: [ws-b6-c1-writer]
  - id: ws-b7-c1-validator-core
    content: "WS-B7 cycle 1: src/validators/arc-channels/validate-arc-channels.ts core targeting the canonical rapid-comms surface. HAND-MERGE: every git invocation (ls-files, show) goes through resolveTrustedGit() (agent-tools/src/core/trusted-git.ts), never bare `git` — the donor executes git by name and must not be copied verbatim. Fixture channels are injected in-memory values (strings/objects), never disk reads, keeping the integration classification true. Tests assert all three verdicts: malformed fixture fails loud, conformant fixture passes, ABSENT canonical surface fails loud (never a silent skip). Proof: pnpm --filter @oaknational/agent-tools test -- src/validators/arc-channels/validate-arc-channels.integration.test.ts"
    status: pending
    depends_on: [ws-b2-c2-colour-roster]
  - id: ws-b7-c2-validator-wiring
    content: "WS-B7 cycle 2: helpers + agent-tools package script (tsx pattern) + 'src/validators/arc-channels/validate-arc-channels.ts' knip entry ONLY — the blocking estate-gate wiring (root repo-validators:check chain edit) moves to the ws-b8 landing so no commit window carries a red gate over the unrepaired corpus. Proof: pnpm knip AND pnpm --filter @oaknational/agent-tools validate-arc-channels exits non-zero over the unrepaired corpus (red proves the instrument)"
    status: pending
    depends_on: [ws-b7-c1-validator-core]
  - id: ws-b8-corpus-repair
    content: "WS-B8: REPAIR every tracked rapid-comms channel in place (count-free — the corpus at proof time) — add Channel-colour: lines (assigned via ws-b6 writer) and conform entry headers/timestamps to the grammar's strict tier. No grandfather, no exclusion. Doctrine resolution (append-only vs repair): the ARC protocol's append-only clause governs live dialogue; this repair is a ONE-TIME schema migration sanctioned by principles.md ('repair historical data in place'), recorded as such in ADR-214, with ws-b9 amending the reference doc's append-only clause to name the validator-proven grammar-migration exception BEFORE this repair lands. BLOCKING PREREQUISITE: the 4 coordination-branch-only channels (3× 2026-07-19-aip137-*, 1× 2026-07-19-design-system-integration-caracal-*) must be present on the execution branch before proof; if they land after, re-run writer+validator over them before the gate wiring merges. This landing ALSO wires validate-arc-channels into root repo-validators:check (moved from ws-b7), atomically with the green corpus. Acceptance = ws-b7 validator green over every tracked channel. Proof: pnpm --filter @oaknational/agent-tools validate-arc-channels AND pnpm repo-validators:check"
    status: pending
    depends_on: [ws-b6-c2-cli-wiring, ws-b7-c2-validator-wiring]
  - id: ws-b9-convention-doc
    content: "WS-B9: EXTEND the existing canonical .agent/reference/arc-rapid-communication.md (tracked on main, live doctrine — never a fresh file or duplicate home) with the channel-open colour-index convention, and wire the channel-open ceremony (comms/start-right surfaces) to invoke the ws-b6 writer. In the same touch, REPAIR the sections the code changes falsify: §Conventions item 1's resolveArcActive filename-substring wing-detection paragraphs (this plan IS the tracked structural cure) the §Known limitations reconciliation with the strict tier + Channel-colour: line, and the append-only clause amended to name the one-time validator-proven grammar-migration exception (sequenced BEFORE ws-b8's repair lands). Acceptance requires BOTH named ceremony surfaces wired (the comms channel-open path AND the start-right ArcAngel-open step both invoke the ws-b6 writer) — either one unchanged fails the criterion. Proof: rg -n 'arc-next-colour' on both ceremony surfaces + pnpm markdownlint:root"
    status: pending
    depends_on: [ws-b6-c2-cli-wiring, ws-b7-c2-validator-wiring]
  - id: ws-b10-integrate-review
    content: "WS-B10: full pnpm check (knip + depcruise + repo-validators + build + test) over the integrated delivery; adversarial specialist reviews (react/type/test/config/security as applicable); ADR-214 finalisation. Doc propagation, enumerated: ADR index entry in architectural-decisions/README.md; agent-tools/README.md CLI catalogue + Structure tree entries for src/arc + the two new scripts; TSDoc on new src/arc public exports; ws-b9 reference-doc repairs verified landed. All acceptance ids proven. Proof: pnpm check"
    status: pending
    depends_on: [ws-a-cycle-1, ws-b5-c2-composed-integration, ws-b8-corpus-repair, ws-b9-convention-doc]
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
  into oak's own `statusline-render.ts` (keeping oak's logo-by-style layout and `oak-logo.ts`)
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
  data in place or replace the owning surface completely."* Every existing channel
  is **repaired in place** (`ws-b8`), not exempted with a grandfather window.
- **No colour-less feather fallback.** *"WE DON'T HEDGE — it is worth doing or it
  doesn't exist."* A feather that renders without a real colour index is a hedge.
- **No grammar without its validator.** *"No unused code — delete dead code."*
  Grammar strictness exports are consumed only by the validator; shipping one without
  the other is prod-unreachable dead code. They land within ONE estate delivery: ws-b2's
  strictness exports may precede ws-b7 on the in-flight branch, but the delivery merges
  only with the validator consuming them (ws-b10 gate).
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
  `statusline-render.ts`.
- No de-branding debt left behind: every brought file uses oak naming (no
  engraph/Fable/Engraph residue).

## Sequencing is self-correcting (PDR-093)

Each downstream gate breaks if its predecessor drifted: `ws-b7` (validator) reds if
`ws-b8` (corpus repair) is incomplete; `ws-b5` (feather render) tests fail if `ws-b4`
(gatherer shape) drifted; `ws-b3` palette is consumed by `ws-b5`; `ws-b2` grammar is
consumed by b3/b4/b6/b7. Deliverable A shares no surface with B and is parallel-safe.

## Acceptance criteria

Every criterion names its deterministic proof command; the per-cycle todos carry the
same commands as their landing gates.

- **A:** a render unit test asserts `ctx:` + `s`/`w` appear on the repo-title/location
  row and NOT on the identity/model rows, across logo and no-logo layouts. Proof:
  `pnpm --filter @oaknational/agent-tools test -- tests/claude/statusline-render.unit.test.ts`.
- **B2:** grammar unit tests cover parse/colour/roster/cross-host/strictness; oak's local
  `ARC_ACTIVE_WINDOW_SECONDS` is gone. Proof:
  `pnpm --filter @oaknational/agent-tools test -- src/arc/arc-channel-grammar.unit.test.ts`
  AND `rg -n 'ARC_ACTIVE_WINDOW_SECONDS\s*=' agent-tools/src` showing exactly one
  definition (the grammar's).
- **B3:** palette + `truecolorForeground` unit tests; `38;2` SGR output asserted. Proof:
  `pnpm --filter @oaknational/agent-tools test -- src/claude/statusline-arc-palette.unit.test.ts src/claude/statusline-ansi.unit.test.ts`.
- **B4:** session-shape resolves `arcChannels[]` from fixture channels with recorded
  colours; bounded-read caps asserted; `identityPrefix` still rendered; a non-member
  beside a fresh director-role claim resolves `observing-directed` while a stale or
  role-less director degrades to `observing`. Proof:
  `pnpm --filter @oaknational/agent-tools test -- src/claude/statusline-session-shape.unit.test.ts src/claude/statusline-identity.unit.test.ts`.
- **B5:** per-channel feather badges render with the recorded colour; cross-host/invalid/
  overflow states asserted; oak's 3-arg `formatIdentity` prefix preserved; explicit
  ANSI-boundary assertions prove no emoji code point sits between an SGR open and its
  RESET (the emoji-never-inside-SGR invariant is tested, not assumed); the composed
  integration test proves fixture channel text → rendered coloured feather row. Proof:
  `pnpm --filter @oaknational/agent-tools test -- src/claude/statusline-indicators.unit.test.ts src/claude/statusline-render-session-shape.unit.test.ts src/claude/statusline-identity.integration.test.ts`.
- **B6:** `arc-next-colour` CLI assigns a valid index; wired as a package script. Proof:
  `pnpm --filter @oaknational/agent-tools test -- src/arc/arc-next-colour.unit.test.ts`
  AND `pnpm knip` AND a deterministic package-script invocation against a fixture channel
  (`pnpm --filter @oaknational/agent-tools arc-next-colour -- --channel <fixture>` exits 0
  and writes a valid index) so the script name, argument parser, and output adapter are
  all executed.
- **B7:** validator fails loud on a malformed in-memory fixture, passes a conformant one,
  and fails loud when the canonical rapid-comms surface is ABSENT (a silently skipped
  corpus cannot satisfy the criteria); package script + knip entry landed (estate-gate
  wiring deferred to B8 by design). Proof:
  `pnpm --filter @oaknational/agent-tools test -- src/validators/arc-channels/validate-arc-channels.integration.test.ts`
  AND `pnpm knip`.
- **B8:** `validate-arc-channels` is **green over every tracked rapid-comms channel at
  proof time** (count-free; data repaired, not exempted; the 4 coordination-branch-only
  channels present on the execution branch first), and the `repo-validators:check` wiring
  lands in this same commit window. Proof:
  `pnpm --filter @oaknational/agent-tools validate-arc-channels` green over the tracked
  corpus AND `pnpm repo-validators:check` green with the new leg wired (the real corpus
  passing the real gate — value-proxy).
- **B9:** the existing canonical reference doc carries the channel-open colour convention,
  its falsified wing-detection sections are repaired, and BOTH named ceremony surfaces —
  the comms channel-open path AND the start-right ArcAngel-open step — invoke the ws-b6
  writer (either one unchanged fails this criterion). Proof: `rg -n 'arc-next-colour'`
  over both ceremony surfaces AND `pnpm markdownlint:root`.
- **B10:** full `pnpm check` green (knip + depcruise + repo-validators + build + test +
  markdownlint + format); specialist reviews dispositioned; ADR finalised. Proof: `non-code` (aggregate gate).

## oak gate/boundary constraints the port must satisfy (from the seam map, verified first-hand)

- Root `pnpm check` runs `knip` and `depcruise` as **blocking** top-level gates. The knip
  config is the ROOT `knip.config.ts`, `workspaces['agent-tools']`: its `entry` includes
  `src/claude/**/*.ts` (so `statusline-arc-palette.ts` is auto-covered) but has **no
  `src/arc` entry**, and `project: src/**/*.ts` means an unwired executable is flagged
  unused. Add `src/arc/arc-next-colour-cli.ts` and
  `src/validators/arc-channels/validate-arc-channels.ts` to that entry list (per-file
  listing is the established precedent) AND a `package.json` script each.
- `.dependency-cruiser.mjs` `no-orphans` is `severity: error` — but depcruise's orphan is
  zero-edges (a CLI importing its impl module is never one); entry-reachability is knip's
  gate, not depcruise's. `no-import-from-agent-substrate` forbids **module** imports of
  `.agent/` — the statusline's **fs reads** of rapid-comms are the sanctioned exception
  (already used).
- `source-is-typescript-esm-only`: intra-package imports use explicit `.js` specifiers on `.ts`
  sources (`../arc/arc-channel-grammar.js`).
- `reference-direction` validator (PDR-105, blocking, debt burned to zero): the convention doc
  goes under `.agent/reference/` (a **non-policed** root, mirroring castr) and must not cite a
  more-ephemeral surface.
- agent-tools CLI invocation: the dominant precedent for validators and workspace CLIs is a
  `package.json` script running `pnpm exec tsx` on source — no dist chmod involved. The new
  `arc-next-colour` and `validate-arc-channels` scripts follow it; the build's existing
  `chmod +x dist/src/bin/*.js` list is untouched.

## Risks and mitigations

- **Unbounded-host-load posture change** — the colour path converts the per-tick gatherer from
  2 cheap reads to up to 8 reads of ≤256KB on a constantly-ticking surface. Mitigation: bring the
  caps (`ARC_CONTENT_READ_CAP`/`BYTE_CAP`) and membership-first ranking **verbatim**; the
  `no-unbounded-host-load` rule means they are load-bearing, not loosenable.
- **identityPrefix regression** — naive wholesale copy of castr's `indicators.ts`/`segments.ts`
  drops oak's 3-arg prefix-rendering `formatIdentity` (the PDR-027 cross-repo join key display).
  Mitigation: hand-merge (`ws-b4`/`ws-b5` acceptance explicitly re-asserts the prefix).
- **Corpus repair scale and branch-split corpus** — ~49 channels at plan time (most with
  pre-grammar headers; the undated `.starless-notice-body.md`), of which 4 exist ONLY on
  `coordination/estate-2026-07` (3× `2026-07-19-aip137-*`, 1×
  `2026-07-19-design-system-integration-caracal-*`) — a main-based worktree sees 45.
  Mitigation: `ws-b6` writer batch-assigns colours; `ws-b8` conforms headers, is count-free,
  and carries the coordination-channels landing prerequisite; `ws-b7` is the objective
  done-signal.
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

**Readiness status (2026-07-20): COMPLETE.** All four reviewers ran and returned
SOUND-WITH-AMENDMENTS; every amendment is folded into this plan (commits SHA: 91da8be8f
and SHA: 3cd84b03e on the plan PR). No unfolded readiness finding remains; execution may
proceed on merge.

## Lifecycle triggers

- **Session entry:** sessions picking up this plan run start-right (quick or team per
  cast size) and read this plan plus the thread record before any source edit; a fresh
  worktree runs install + build + Playwright per the start-right worktree contract.
- **Pre-edit coordination:** the lane claim covers the statusline estate surfaces;
  commit windows open per bundle via the commit-queue ceremony. WS-B8's tracked writes to
  the live rapid-comms corpus additionally require a Director-granted commit window (the
  corpus doubles as the live dialogue surface).
- **During-work updates:** todo statuses in this frontmatter advance at each cycle
  landing; PR events broadcast to comms per the team cadence.
- **Session handoff:** mid-cycle retirement follows PDR-063 (handoff record +
  claim `handoff_record_path` + directed event); natural boundaries update the
  agentic-engineering-enhancements thread record.

## Learning loop

On completion, run `oak-consolidate-docs`: graduate the ARC-colour grammar decision into the ADR,
conserve the corpus-repair method, and update the agentic-engineering thread record.

## Source maps (authoritative context, do not re-derive)

The castr→oak port surface, oak state, and seam/risk analysis were mapped first-hand
2026-07-20 (workflow `wf_0a56f8f8-ed5`). The port source is PINNED to
[`EngraphCode/castr`](https://github.com/EngraphCode/castr) **`origin/main` @ `SHA: 63a7e675`**
(PRs #22 + #29 merged 2026-07-20); any local castr working
tree is NOT authoritative (observed sitting on a stale docs branch with divergent copies).
The feather source files are under `castr/agent-tools/src/{claude,arc,validators/arc-channels}`.
Oak destination is `agent-tools/src/claude/statusline-*.ts` (no `src/arc/` today).
