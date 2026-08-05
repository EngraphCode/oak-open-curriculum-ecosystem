---
name: "ARC-colour statusline infrastructure — bring the feather badges + usage relocation into oak"
overview: "Adopt castr's ARC channel-grammar-derived truecolor feather badges into oak agent-tools, with the usage gauges on the model row (owner direction 2026-07-20), as one coherent estate whose grammar obligations bind from adoption forward (the owning system is replaced completely) — no compatibility layers, no legacy surfaces."
lineage:
  serves_thread: agentic-engineering-enhancements
  serves_stream: agent-experience-substrate
  strategic_choice: "agent-experience is first-class (PDR-111): the statusline is the agent's always-on glance surface; multi-channel identity-coloured liveness is a substrate capability, not decoration."
  derives_from: "Owner direction 2026-07-20: bring the feather icon enhancements and the moved usage-quota data from the Resonance→castr statusline lane into oak; the ARC feather system is a serious statusline-infrastructure upgrade. No backwards compatibility (principles.md §Core Rules). Upstream provenance: castr is a private sibling repo of the owner's (no public URL exists; the durable citation is the repo name + this owner direction; source paths cited per-item in the plan body are castr-repo-relative)."
todos:
  - id: ws-a-cycle-1
    content: "WS-A (usage relocation) cycle 1: test asserts ctx: + s/w gauges render on the repo-title (location) row, not the identity/model rows; add locationRowsWithUsage() to oak statusline-render.ts and re-point the two row-assembly sites. Allowed surface: agent-tools/src/claude/statusline-render.ts + agent-tools/tests/claude/statusline-render.unit.test.ts (the TDD pair travels together). One commit, tree green. Proof: pnpm --filter @oaknational/agent-tools test -- tests/claude/statusline-render.unit.test.ts"
    status: completed # PR #427 MERGED 2026-07-20 (merge SHA: fa0ceb4f4)
    # depends_on: []  # fully independent of Deliverable B (no ARC dependency)
  - id: ws-a-cycle-2
    content: "WS-A cycle 2 (owner direction 2026-07-20, supersedes cycle 1's donor-parity placement): the ctx: + s/w usage gauges move to the MODEL row, joined after the model name; the repo-title/location row returns to plain. TDD pair agent-tools/src/claude/statusline-render.ts + agent-tools/tests/claude/statusline-render.unit.test.ts; delete locationRowsWithUsage() if it loses its last consumer. Ships as its own small PR off post-amendment main (fully independent of Deliverable B). One commit, tree green. Proof: pnpm --filter @oaknational/agent-tools test -- tests/claude/statusline-render.unit.test.ts"
    status: pending
    # depends_on: []  # fully independent of Deliverable B (no ARC dependency)
  - id: ws-b1-adr
    content: "WS-B1: author ADR-214 (docs/architecture/architectural-decisions/214-arc-colour-statusline-infrastructure.md) + its README index entry — ONE ADR, kept at WHAT level: shared ARC constants single-home in the grammar module (consumers import, never redeclare); feather colour is a projection of parsed channel content; grammar obligations bind from adoption forward (owner ruling 2026-07-20); validator fails loud on the canonical surface; and why the strict tier preserves the reference doc's protected zero-per-message-ceremony property. Non-code."
    status: completed # PR #428 MERGED 2026-07-20 (merge SHA: 3e2041e27); Decision items 3-4 amended to the adoption-forward ruling in this plan's amendment PR
    # depends_on: []
  - id: ws-b2-c1-parse-strictness
    content: "WS-B2 cycle 1: src/arc/arc-channel-grammar.ts created with parseArcChannel + evaluateArcChannelStrictness (zod schema authority for channel shape). HAND-MERGE: KEEP the donor's adoption-date semantics in evaluateArcChannelStrictness — grammar obligations bind from adoption forward (owner ruling 2026-07-20; principles.md §No-legacy-surfaces second arm: the owning system is replaced completely, channel history stays append-only); oak's ARC_SCHEMA_ADOPTION_DATE binds by INVARIANT, not by pinned mechanics: strict obligations attach only to channels resolving on-or-after the constant, and at every proof moment the constant is exactly the first calendar day after the estate's public availability (its merge to main — earlier is misclassification, later grandfathers gap channels); the provisional value, truing moment, and guard mechanics that enforce this are designed and TDD-proven at the ws-b10 landing. The donor tests covering the adoption-date branch port with it. Corpus MEMBERSHIP invariant: every markdown file under the rapid-comms root outside the closed non-channel infrastructure set (README.md, the dotfile .starless-notice-body.md) is a member the gatherer renders and the validator sees; the two verified undated legacy channels (wolf-rides-vigil-and-cricket-lifts-echo.md, wildfire-herds-sulphur-and-kiln-tracks-basalt.md) stay members and must not red the gate, AND a post-adoption channel cannot evade the strict tier by omitting a date prefix. The DISTINGUISHING INPUT (verified against the pinned donor, which emits undated-filename unconditionally) is GENERAL, never a filename exception list (ADR-214 item 3: adoption scoping is the grammar's own semantics, not an exemption mechanism): a channel's RESOLUTION DATE is its filename date prefix when present, else an injected recorded-creation date (the validator supplies it from git first-commit; tests inject it; the pure grammar never does IO) — and the undated-filename violation, like every grammar obligation, fires only for channels resolving on-or-after adoption. The two legacy undated channels resolve pre-adoption by their git history; any new post-adoption undated channel still fails. The donor test asserting unconditional undated-filename is AMENDED to the adoption-scoped behaviour, plus a test asserting the pre-adoption resolution of injected legacy creation dates — both land before ws-b7 wires the blocking gate. Tests at src/arc/arc-channel-grammar.unit.test.ts (co-located per testing-strategy §Development Workflow). Red→Green→Refactor, one landing. Observable proof: the co-located grammar unit suite describes parse+strictness behaviour, including both undated cases, and passes (command shape fixed at this cycle's landing)."
    status: pending
    depends_on: [ws-b1-adr]
  - id: ws-b2-c2-colour-roster
    content: "WS-B2 cycle 2: resolveChannelColour, deriveArcRoster, isCrossHostChannelName, ARC_PALETTE_SIZE, ARC_ACTIVE_WINDOW_SECONDS added to the grammar. Red→Green→Refactor, one landing. Observable proof: the grammar unit suite additionally describes colour/roster/cross-host behaviour and passes."
    status: pending
    depends_on: [ws-b2-c1-parse-strictness]
  - id: ws-b2-c3-single-home-constants
    content: "WS-B2 cycle 3: DELETE oak's local hard-coded ARC_ACTIVE_WINDOW_SECONDS in statusline-session-shape.ts (line ~93); import from the grammar (consolidate-at-second-consumer). Proof: rg -n 'ARC_ACTIVE_WINDOW_SECONDS\\s*=' agent-tools/src shows exactly one definition (the grammar's) AND pnpm --filter @oaknational/agent-tools test"
    status: pending
    depends_on: [ws-b2-c2-colour-roster]
  - id: ws-b3-c1-palette
    content: "WS-B3 cycle 1: statusline-arc-palette.ts (8 truecolor mid-tones + ARC_ERROR_FOREGROUND, imports ARC_PALETTE_SIZE from the grammar). Observable proof: the co-located palette unit suite passes with all 8 mid-tones + ARC_ERROR_FOREGROUND described."
    status: pending
    depends_on: [ws-b2-c2-colour-roster]
  - id: ws-b3-c2-truecolor-ansi
    content: "WS-B3 cycle 2: truecolorForeground(r,g,b) added to statusline-ansi.ts; 38;2 SGR output asserted. Observable proof: the ANSI unit suite asserts the 38;2 SGR output of truecolorForeground and passes."
    status: pending
    depends_on: [ws-b2-c2-colour-roster]
  - id: ws-b4-c1-arcchannels-shape
    content: "WS-B4 cycle 1: replace SessionShape.arcActive:boolean with arcChannels:ArcChannelBadge[] in statusline-session-shape.ts (bounded content reads: ARC_CONTENT_READ_CAP=8 / ARC_CONTENT_BYTE_CAP=256KB, membership-first ranking). PRESERVE oak's identityPrefix path (sessionIdPrefix, oak-logo). ATOMIC CONSUMER MIGRATION: the same landing migrates the existing arcActive consumer (statusline-indicators.ts:64 and its fixtures) to read arcChannels (interim single-wing rendering from arcChannels.length until ws-b5-c1 replaces the rendering) so every declared landing compiles and tests green. RELOCATE the touched legacy describing tests tests/claude/statusline-session-shape.test.ts (§ARC liveness) to the co-located canonical src/claude/statusline-session-shape.unit.test.ts in the SAME landing (testing-strategy: tests live next to the code, *.unit.test.ts). Observable proof: the relocated co-located session-shape unit suite describes arcChannels resolution with bounded-read caps and passes."
    status: pending
    depends_on: [ws-b2-c3-single-home-constants]
  - id: ws-b4-c2-gatherer
    content: "WS-B4 cycle 2: upgrade the gatherer (attachInWindowContent) in statusline-identity.ts to resolve arcChannels from recorded channel content; converge to ONE design. Observable proof: a NEW co-located src/claude/statusline-identity.unit.test.ts describes the gatherer's arcChannels resolution and passes (review-verified fact 2026-07-20: no legacy statusline-identity test exists — nothing relocates; the exact vitest invocation is fixed at this cycle's landing)"
    status: pending
    depends_on: [ws-b4-c1-arcchannels-shape]
  - id: ws-b4-c3-observing-directed
    content: "WS-B4 cycle 3: bring observing-directed teamShape + the director honesty-gate (part of the coherent session-shape). The gate reads a role field from claim records — verify oak's claim shape carries it and hand-merge, never assume field-name parity with castr. Tests assert: a non-member beside a fresh director-role claim resolves observing-directed; a stale or role-less director degrades to observing. Observable proof: the session-shape unit suite asserts both observing-directed resolutions (fresh director-role claim; stale/role-less degradation) and passes."
    status: pending
    depends_on: [ws-b4-c1-arcchannels-shape]
  - id: ws-b5-c1-feather-badges
    content: "WS-B5 cycle 1: featherBadge() per-channel rendering in statusline-indicators.ts (colour ink on U+258C membership bar, U+21C5 cross-host marker, U+25CF invalid dot, overflow badge) REPLACING the single ARC_WING. HAND-MERGE: keep oak's 3-arg formatIdentity(identity, identityPrefix, ownRole). Tests assert the emoji-never-inside-SGR invariant with explicit ANSI-boundary assertions (no emoji code point between an SGR open and its RESET). RELOCATE the touched legacy tests/claude/statusline-render-session-shape.test.ts (arcActive fixtures) to co-located src/claude/statusline-render-session-shape.unit.test.ts in the SAME landing; pure render assertions stay unit-scale. Observable proof: the relocated co-located indicator and render-session-shape unit suites describe the per-channel badges, ANSI boundaries, and preserved identity prefix, and pass."
    status: pending
    depends_on: [ws-b3-c1-palette, ws-b3-c2-truecolor-ansi, ws-b4-c2-gatherer, ws-b4-c3-observing-directed]
  - id: ws-b5-c2-composed-integration
    content: "WS-B5 cycle 2: ONE composed integration-scale test crossing the full describing surface — fixture channel text in → rendered coloured feather row out (gatherer+renderer composed, DI throughout, no disk IO) — co-located beside the integration point as src/claude/statusline-identity.integration.test.ts (never folded into a unit test file). Observable proof: the co-located composed integration test renders a coloured feather row from fixture channel text and passes."
    status: pending
    depends_on: [ws-b5-c1-feather-badges]
  - id: ws-b6-c1-writer
    content: "WS-B6 cycle 1: src/arc/arc-next-colour.ts — the pure colour-assignment functions (deriveWornColours + nextFreeColourIndex, per the pinned donor) (+ unit test). Observable proof: the co-located unit suite describes deriveWornColours + nextFreeColourIndex and passes."
    status: pending
    depends_on: [ws-b2-c2-colour-roster]
  - id: ws-b6-c2-cli-wiring
    content: "WS-B6 cycle 2: src/arc/arc-next-colour-cli.ts — an assignment REPORTER matching the pinned donor's true shape (no mutation: prints today's channels with worn colours and the next free palette index; the channel OPENER records the line) + agent-tools package.json script via `pnpm exec tsx` on source (dominant validator/CLI precedent, no dist chmod) + 'src/arc/arc-next-colour-cli.ts' added to root knip.config.ts workspaces['agent-tools'].entry. Observable proof: pnpm knip green (entry wired) AND the reporter, run at this cycle's landing, prints the expected next free palette index for a prepared corpus state (the donor CLI scans a fixed live directory with no corpus input — how the state is prepared is fixed at the landing)."
    status: pending
    depends_on: [ws-b6-c1-writer]
  - id: ws-b7-c1-validator-core
    content: "WS-B7 cycle 1: src/validators/arc-channels/validate-arc-channels.ts core targeting the canonical rapid-comms surface. HAND-MERGE: every git invocation (ls-files, show) goes through resolveTrustedGit() (agent-tools/src/core/trusted-git.ts), never bare `git` — the donor executes git by name and must not be copied verbatim. Fixture channels are injected in-memory values (strings/objects), never disk reads, keeping the integration classification true. Tests assert all three verdicts: malformed fixture fails loud, conformant fixture passes, ABSENT canonical surface fails loud (never a silent skip). Observable proof: the co-located validator integration suite asserts all three verdicts (malformed fails loud, conformant passes, absent surface fails loud) and passes."
    status: pending
    depends_on: [ws-b2-c2-colour-roster]
  - id: ws-b7-c2-validator-wiring
    content: "WS-B7 cycle 2: helpers + agent-tools package script (tsx pattern) + 'src/validators/arc-channels/validate-arc-channels.ts' knip entry + the blocking estate-gate wiring (root repo-validators:check chain edit) in this same landing — under adoption-forward semantics the live corpus is green as-is, so no red-gate window exists (owner ruling 2026-07-20). Proof: pnpm knip AND pnpm --filter @oaknational/agent-tools validate-arc-channels over the live corpus exits zero AND the integration suite proves the instrument bites (a malformed post-adoption fixture fails loud naming the file and violated rule — a bare pass over the corpus does NOT alone satisfy) AND pnpm repo-validators:check green with the new leg wired"
    status: pending
    depends_on: [ws-b7-c1-validator-core]
  - id: ws-b9-convention-doc
    content: "WS-B9: EXTEND the existing canonical .agent/reference/arc-rapid-communication.md (tracked on main, live doctrine — never a fresh file or duplicate home) with the channel-open colour-index convention (binding from the grammar's adoption date forward; history stays append-only, never retro-edited), and wire the channel-open ceremony (comms/start-right surfaces) to invoke the ws-b6 assignment reporter (the opener records the reported index — donor-parity, no mutation). In the same touch, REPAIR the sections the code changes falsify: §Conventions item 1's resolveArcActive filename-substring wing-detection paragraphs (this plan IS the tracked structural cure) and the §Known limitations reconciliation with the strict tier + Channel-colour: line. Acceptance requires BOTH named ceremony surfaces wired (the comms channel-open path AND the start-right ArcAngel-open step both invoke the ws-b6 assignment reporter) — either one unchanged fails the criterion. Proof: rg -n 'arc-next-colour' on both ceremony surfaces + pnpm markdownlint-check:root"
    status: pending
    depends_on: [ws-b6-c2-cli-wiring, ws-b7-c2-validator-wiring]
  - id: ws-b10-integrate-review
    content: "WS-B10: full pnpm check (knip + depcruise + repo-validators + build + test) over the integrated delivery; adversarial specialist reviews (react/type/test/config/security as applicable); ADR-214 finalisation. Doc propagation, enumerated: ADR index entry in architectural-decisions/README.md; agent-tools/README.md CLI catalogue + Structure tree entries for src/arc + the two new scripts; TSDoc on new src/arc public exports; ws-b9 reference-doc repairs verified landed; the ws-b2 adoption-boundary INVARIANT proven — at merge execution the constant equals exactly the first calendar day after the actual merge, deterministic guard mechanics designed and TDD-proven at this landing (a wrong-either-way constant fails loud pre-merge; the delivery cannot complete with strictness silently disabled); the post-merge confirmation lives in §Lifecycle-triggers Phase-8 (B10's own scope is pre-merge only). All acceptance ids proven. Proof: pnpm check"
    status: pending
    depends_on: [ws-a-cycle-2, ws-b5-c2-composed-integration, ws-b9-convention-doc]
isProject: false
---

# ARC-colour statusline infrastructure

> **Superseded for execution (2026-08-03).** This node's substance is re-homed
> into the anchored estate at
> `.agent/plans/delivery/arc-colour-statusline.plan.md` (current schema, dated
> staleness true-up, owner re-ask 2026-08-03 recorded). The decisions,
> readiness-review record, expanded acceptance mechanics, and castr source map
> below remain the preserved authoritative detail this file has always
> carried; execution state now advances at the anchored node.

## End goal

Oak's agent statusline renders, per live rapid-comms channel this session
participates in, an **identity-coloured feather badge** (truecolor, drawn from the
channel's recorded colour index), with cross-host and invalid/overflow states — and
the context + rate-limit usage gauges sit on the **model row** (owner direction
2026-07-20, superseding the repo-title placement cycle 1 shipped). This is the
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

- **Deliverable A — usage relocation (`ws-a-cycle-1` + `ws-a-cycle-2`).** Oak already has the `s`/`w`
  rate-limit gauges and the `ctx` context gauge (`statusline-usage.ts` is
  byte-identical to castr; `formatRateLimits` already emits `rateLimitGauge('s',…)`).
  The only missing piece is **placement**: `ctx:` + `s`/`w` render on the MODEL row,
  joined after the model name, with the location rows plain (owner direction
  2026-07-20; oak keeps its logo-by-style layout and `oak-logo.ts`). Zero new
  dependencies. The completed cycle-1 todo records the interim repo-title placement
  this final design supersedes.

- **Deliverable B — the ARC-colour estate.** grammar (`ws-b2`) → palette + truecolor
  helper (`ws-b3`) → session-shape/gatherer upgrade (`ws-b4`) → feather rendering
  (`ws-b5`); colour-assignment reporter CLI (`ws-b6`) and validator (`ws-b7`) off the grammar;
  the channel-open convention (`ws-b9`); integration + review (`ws-b10`). The ADR
  (`ws-b1`) leads. Grammar obligations bind from the `ws-b2` adoption date forward
  (owner ruling 2026-07-20) — there is no corpus-repair workstream.

## Why no backwards compatibility (principles.md §Core Rules — decisive)

This plan deliberately **excludes** the compatibility-shaped options the seam map
first surfaced, because `principles.md` forbids them:

- **No legacy surface kept alive around the corpus.** *"No legacy surfaces… repair
  historical data in place or replace the owning surface completely."* The owner
  selected the **second arm** (ruling 2026-07-20: "we don't fix the old channel docs,
  we just update the system"): the owning system — grammar, validator, channel-open
  ceremony — is replaced completely, and grammar obligations bind from the adoption
  date forward. Channel history is append-only and never retro-edited; pre-adoption
  channels age out of the 30-minute active window naturally, and a live channel
  without a recorded colour renders the grammar's defined invalid state (`ws-b5`),
  never a colourless fallback or a legacy reader.
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

- **Blocking:** `ws-b1` ADR precedes code (records the canonical-surface +
  adoption-forward decision the rest depends on). `ws-b2` grammar blocks
  `ws-b3/b4/b6/b7`.
- **Beneficial:** `statusline-registry-read.ts` (castr's extracted solo-floor registry
  reader) — minimum shippable without it: keep oak's inline registry reader; the feather
  path does not require the extraction.
- **Satisfied:** `zod ^4.4.3` is already in `agent-tools/package.json` (the grammar's
  only external dependency). No new install.

## Non-goals (YAGNI + excluded hedges)

- No colour-less / boolean-only feather rendering (excluded hedge).
- No retro-editing of channel history, no exclusion list, and no fallback reader for
  pre-adoption shapes (adoption-forward obligations are the grammar's own semantics,
  not an exemption mechanism).
- No `subagent-statusline*` or `engraph-logo` bring — castr-adjacent, not part of the
  two named features; oak keeps `oak-logo.ts`.
- No adoption of castr's pre-resolved-`logoRows` render architecture (castr itself flags
  it as oak's separate WS4.1 target); the usage relocation applies to oak's existing
  `statusline-render.ts`.
- No de-branding debt left behind: every brought file uses oak naming (no
  engraph/Fable/Engraph residue).

## Sequencing is self-correcting (PDR-093)

Each downstream gate breaks if its predecessor drifted: `ws-b7`'s wiring proves
itself at its own landing (the validator runs green over the live corpus under
adoption-forward semantics while its integration suite proves it bites on a
malformed post-adoption fixture); `ws-b5` (feather render) tests fail if `ws-b4`
(gatherer shape) drifted; `ws-b3` palette is consumed by `ws-b5`; `ws-b2` grammar is
consumed by b3/b4/b6/b7. Deliverable A shares no surface with B and is parallel-safe.

## Acceptance criteria

Every criterion names its deterministic proof command; the per-cycle todos carry the
same commands as their landing gates.

- **A:** a render unit test asserts `ctx:` + `s`/`w` appear on the MODEL row (after
  the model name) and NOT on the identity or location rows, across logo and no-logo
  layouts (owner direction 2026-07-20, superseding cycle 1's repo-title placement
  shipped in PR #427). Proof:
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
- **B6:** `arc-next-colour` reports the worn colours and the next free palette index; wired as a package script. Proof:
  `pnpm --filter @oaknational/agent-tools test -- src/arc/arc-next-colour.unit.test.ts`
  AND `pnpm knip` AND a deterministic package-script invocation over a fixture corpus
  (the reporter exits 0 and prints the expected next free palette index) so the script
  name, corpus scan, and output adapter are all executed.
- **B7:** validator fails loud on a malformed post-adoption in-memory fixture, passes a
  conformant one, and fails loud when the canonical rapid-comms surface is ABSENT (a
  silently skipped corpus cannot satisfy the criteria); package script + knip entry +
  the blocking `repo-validators:check` wiring land together (under adoption-forward
  semantics the live corpus is green as-is — no red-gate window). Proof:
  `pnpm --filter @oaknational/agent-tools test -- src/validators/arc-channels/validate-arc-channels.integration.test.ts`
  AND `pnpm knip` AND `pnpm --filter @oaknational/agent-tools validate-arc-channels`
  green over the live corpus AND `pnpm repo-validators:check` green with the new leg
  wired (the real corpus passing the real gate — value-proxy).
- **B9:** the existing canonical reference doc carries the channel-open colour convention,
  its falsified wing-detection sections are repaired, and BOTH named ceremony surfaces —
  the comms channel-open path AND the start-right ArcAngel-open step — invoke the ws-b6
  assignment reporter (either one unchanged fails this criterion). Proof: `rg -n 'arc-next-colour'`
  over both ceremony surfaces AND `pnpm markdownlint-check:root` (the check-only variant — the :root script is a fixer and proves nothing).
- **B10:** full estate gate green; specialist reviews dispositioned; ADR finalised;
  adoption date proven live. Proof: `pnpm check` exits 0 (knip + depcruise +
  repo-validators + build + test + markdownlint + format) AND each specialist review
  verdict is recorded with its disposition in the delivery PR's threads AND ADR-214's
  status line reads Accepted with the ratifying evidence named AND a deterministic
  assertion proves `ARC_SCHEMA_ADOPTION_DATE` is strictly after the ws-b10 proof date
  and within 7 days of it (bounded horizon — a far-future constant fails every re-run)
  AND the adoption-boundary invariant is proven pre-merge: at merge execution the
  constant equals exactly the first calendar day after the actual merge date — the
  deterministic guard mechanics enforcing this are designed and TDD-proven at the
  ws-b10 landing, failing loud on a constant wrong in either direction. B10's
  acceptance scope is pre-merge only; the post-merge confirmation (constant equals
  actual merge calendar date + 1 day) is the §Lifecycle-triggers Phase-8 harvest
  obligation, not a B10 criterion (command shapes fixed at the landing).

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
  drops oak's 3-arg prefix-rendering `formatIdentity` (the PDR-125 clause-5 cross-estate join key display).
  Mitigation: hand-merge (`ws-b4`/`ws-b5` acceptance explicitly re-asserts the prefix).
- **Live pre-adoption channels at the adoption landing** — a channel opened before the
  `ws-b2` adoption date that is still inside the 30-minute active window when `ws-b5`
  lands renders `ws-b5`'s distinct invalid-state indicator until it ages out (never a
  colourless fallback — the indicator is its own defined rendering). Mitigation: this
  is the designed behaviour, not a defect (the invalid state IS the honest signal);
  the landing needs no corpus coordination because history is never edited.
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
- **Landing-path clause:** each WS lands as TDD cycle commits; the validator's blocking
  gate wiring (`ws-b7-c2`) lands only with the real validator green over the real corpus
  (value-proxy, not self-authored).
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
  commit windows open per bundle via the commit-queue ceremony. No workstream writes to
  the live rapid-comms corpus (history is append-only under the adoption-forward ruling),
  so no corpus commit window is required.
- **During-work updates:** todo statuses in this frontmatter advance at each cycle
  landing; PR events broadcast to comms per the team cadence.
- **Post-merge (Phase-8 harvest):** the estate PR's harvest confirms
  `ARC_SCHEMA_ADOPTION_DATE` equals the git-recorded actual merge calendar
  date plus one day (the pre-merge guard makes this a confirmation, not a
  cure) — the executable proof command is fixed at the ws-b10 landing and
  recorded in the harvest.
- **Session handoff:** mid-cycle retirement follows PDR-063 (handoff record +
  claim `handoff_record_path` + directed event); natural boundaries update the
  agentic-engineering-enhancements thread record.

## Learning loop

On completion, run `oak-consolidate-docs`: graduate the ARC-colour grammar decision into the ADR,
conserve the adoption-forward migration shape, and update the agentic-engineering thread record.

## Source maps (authoritative context, do not re-derive)

The castr→oak port surface, oak state, and seam/risk analysis were mapped first-hand
2026-07-20 (workflow `wf_0a56f8f8-ed5`). The port source is PINNED to
[`EngraphCode/castr`](https://github.com/EngraphCode/castr) **`origin/main` @ `SHA: 63a7e675`**
([castr PR #22](https://github.com/EngraphCode/castr/pull/22) + [castr PR #29](https://github.com/EngraphCode/castr/pull/29), merged 2026-07-20); any local castr working
tree is NOT authoritative (observed sitting on a stale docs branch with divergent copies).
The feather source files are under `castr/agent-tools/src/{claude,arc,validators/arc-channels}`.
Oak destination is `agent-tools/src/claude/statusline-*.ts` (no `src/arc/` today).
