---
name: "Team-State Register and Session-Shape Icons"
overview: "Model the evolving state of the TEAM (not just individuals) as a derived relational register — active agents, their pairwise/n=3/n>3 ArcAngel channels, conventional group comms, sidebars, other comms arrangements, and the threads (including non-thread work) each is on — and project one agent's slice into the Claude statusline's 4-position, left-packed session-shape icons. The register is DERIVED from bounded substrate sources every tick (never a hand-maintained file, never a full-corpus scan), making it the single source of truth that the statusline (and future surfaces) project. Supersedes the narrow solo/peer/directed + arcActive resolver landed in the archived statusline-session-shape-indicators plan; structural cure for the substrate-pointer pattern (stale, fragmented team-state reads) surfaced by the comms-corpus research."
status: "DRAFT — current/ (queued, not started). Authored by Whippoorwill holds Catacomb (adc96c) 2026-06-13 for handover to Clipper wakes Atoll. Refined 2026-06-14 by Orbit stirs Spectrum (a571a1) under owner direction — added the claim-independent active-agent-set correction (see §Refinement) and the membership-vs-observation lesson from the interim resolver; handover-to-Clipper intent preserved. Owner has specified the icon semantics + the register requirement (load-bearing design fixed); execution decisions (glyph choices, exact bounded-source set) finalised at first-cycle time. Readiness pass run 2026-06-14 (assumptions-expert — verdict appended below). Plan claims complete only at ws1–ws5."
todos:
  - id: ws1-team-state-model
    content: "WS1: define the team-state register MODEL — a pure, schema-driven relational type. Per-agent: active, roles (incl director), threads (incl an explicit non-thread-work marker), arc_channels {pairwise[], n3[], n_gt3[]}, conventional_group_comms[], sidebars[], other_arrangements[]. Team-level: agent set (the UNION of agents across ALL substrate sources — claims, comms, ArcAngel, sidebars — never claim-holders alone, so read-only collaborators count; see §Refinement), directed?, size→solo|pair|group. The model is the relational graph (agents=nodes, shared channels=edges, threads=work-groupings), NOT a list of individuals. IO-free; types flow from a schema. TDD: model + a fixture-built register, no IO."
    status: pending
  - id: ws2-derive-from-bounded-substrate
    content: "WS2: derive the register from BOUNDED substrate sources, IO-free core + thin IO adapter (mirror statusline-session-shape.ts / statusline-identity.ts split). The active-agent set is the UNION of agents appearing in ANY bounded source (claims, comms participants, ArcAngel rosters, sidebar participants), deduplicated by PDR-027 identity — a comms/ArcAngel/sidebar participant who holds no claim still joins the set (§Refinement). Sources: active-claims.json (agents, roles, threads, director — small); ArcAngel channels from .agent/collaboration/rapid-comms/*.md filenames (#7 home constant) — arity (pairwise/n3/n>3) from participant full-names in filename + content roster, freshness from mtime; conventional-comms participation from the BOUNDED recent-comms/heartbeat surface (comms-seen heartbeat files + recent-N events) NOT a full comms/ scan; conventional group comms + sidebars from conversations/ + sidebars/ (small); threads from claims + thread records. Per-tick cost bounded (the statusline ticks constantly — this is the WS8 no-full-scan constraint). TDD over fixture source-sets."
    status: pending
    depends_on: [ws1-team-state-model]
  - id: ws3-icon-projection
    content: "WS3: project the active agent's register slice into the 4-position icon model. Pos1 (NEVER empty): solo | pair | group from team size (1 | 2 | 3+) — size is of THIS agent's team (the agents it shares a claim/comms/ArcAngel/sidebar edge with), NOT the whole active field; a pure bystander sharing no edge is solo, not inflated into a pair/group it has not joined (the membership-vs-observation lesson, §Refinement). Pos2: handshake glyph iff the agent participates in conventional comms. Pos3: feather glyph iff the agent participates in any fresh ArcAngel channel. Pos4: director glyph if the agent is director; directed-team-member glyph if in a directed team (non-director). LEFT-PACK: positions 2–4 that are empty collapse; each present icon occupies the first free slot after pos1 (pos1 stays slot 1). Glyph selection follows the verified-rendering discipline (no tofu; re-verify renderings, per the replace-tofu'd-glyph lessons). Pure function register→icon string. TDD over the full empty/present matrix incl. left-pack ordering."
    status: pending
    depends_on: [ws1-team-state-model]
  - id: ws4-wire-statusline
    content: "WS4: wire the projection into the statusline — replace/extend resolveSessionShape (currently teamShape unknown|solo|peer|directed + arcActive) with the register-derived 4-position model, and update statusline-render.ts + statusline-identity.ts (the IO adapter gathers the bounded sources). Preserve the honest 'unknown' degradation (unreadable source → no confident shape). TDD: rework the session-shape fixture matrix to the 4-position model; all statusline tests green. Behaviour-preserving where the old model overlaps (solo/pair retains; directed retains)."
    status: pending
    depends_on: [ws2-derive-from-bounded-substrate, ws3-icon-projection]
  - id: ws5-readiness-and-proof
    content: "WS5: readiness + proof. assumptions-expert readiness review (proportionality of the register vs the statusline-only consumer; is the model over-built for one projection?); react/design-system reviewers not applicable (terminal glyphs). Prove the bounded-source per-tick cost first-hand (timing on a realistic registry + rapid-comms set). Run the app: render the statusline in a solo, pair, group, ArcAngel-active, and directed scenario and capture the icon strings. Consolidation workflow on completion."
    status: pending
    depends_on: [ws4-wire-statusline]
isProject: false
---

# Team-State Register and Session-Shape Icons

**Created**: 2026-06-13 (Whippoorwill holds Catacomb, adc96c), under owner direction, for handover to
Clipper wakes Atoll. **Collection**: agent-tooling. **Lane**: `current/` (queued; not started).

## Context / problem

The Claude statusline today shows a narrow per-agent shape (`solo | peer | directed` + an ArcAngel
"wing"), resolved from two cheap reads (the claims registry + an experiments/channel listing). It
models the *individual's* shape, not the *team's*. The comms-corpus research named the
**substrate-pointer pattern** — agents reading stale, fragmented snapshots of team state — as a
recurring failure (it recurred live this very session: a peer read a named-successor as active, and
a local HEAD as origin). Team state is scattered across the claims registry, the comms event stream,
ArcAngel channel files, conversations/sidebars, and thread records, with no consolidated live model.

## End goal

A **team-state register**: a single, derived, live model of the evolving team — *which agents are
active, what comms arrangements connect them (pairwise / n=3 / n>3 ArcAngel channels, conventional
group comms, sidebars, other), and what threads (including non-thread work) each is on* — from which
the statusline session-shape icons are projected, and which future surfaces can reuse. It tracks the
shifting state of the **team as a relational whole**, not a list of individuals.

## Mechanism

A relational model (agents = nodes; shared channels = edges; threads = work-groupings) **derived
from bounded substrate sources every tick** is the structural cure for fragmented/stale team-state:
one source of truth, many projections. Deriving (not hand-maintaining) prevents drift; bounding the
sources (no full comms-corpus scan) keeps the constantly-ticking statusline cheap. The 4-position
left-packed icon string is the active agent's projection of its slice of the register.

## The icon specification (owner, fixed)

Four positions. **Position 1 is never empty.** Where any other position is empty, the next present
icon occupies the first available space (left-pack):

| Pos | Meaning | Glyph |
| --- | --- | --- |
| 1 | Team size for this agent: **solo / pair / group** | size glyph (never empty) |
| 2 | Participates in **conventional comms** (the canonical comms-event stream) | handshake |
| 3 | Participates in **ArcAngel** comms | feather |
| 4 | **Director**, or **member of a directed team** | director / member glyph |

Left-pack example: an agent that is in a pair, has no conventional comms, but is on an ArcAngel
channel and is a directed-team member renders `[pair][feather][member]` — the feather fills slot 2
(the empty handshake collapses), the member glyph fills slot 3.

## The register model (WS1, illustrative — schema is source of truth)

Per-agent: `active`, `roles[]` (incl `director`), `threads[]` (with an explicit non-thread-work
marker for work outside any thread), `arc_channels { pairwise[], n3[], n_gt3[] }`,
`conventional_group_comms[]`, `sidebars[]`, `other_arrangements[]`. Team-level: the active-agent set,
`directed` (a fresh `director`-role claim exists), and `size` (distinct active agents → solo=1 /
pair=2 / group≥3). Any number of pairwise ArcAngel channels per agent is supported.

## Bounded derivation sources (WS2) — the cost contract

The statusline ticks constantly; the WS8 constraint (no full comms-corpus scan per tick) is binding.

- **Claims registry** (`active-claims.json`, small): active agents, roles, director, threads.
- **ArcAngel channels**: `.agent/collaboration/rapid-comms/*.md` (the canonical home via the #7
  single-home constant) — a bounded directory listing; per-channel arity (pairwise / n=3 / n>3) from
  the participant full display names in the filename + the in-file participant roster; liveness from
  mtime within the ARC window.
- **Conventional-comms participation**: a BOUNDED recent-comms/heartbeat surface (the
  `comms-seen/*.heartbeat.json` watcher files + the newest-N events by mtime) — never a full `comms/`
  scan.
- **Conventional group comms + sidebars**: `conversations/` + `sidebars/` (small dirs).
- **Threads**: the claims `thread` field + thread records; non-thread work marked explicitly.

The core is IO-free and pure (`sources → register`); a thin IO adapter gathers the bounded reads
(mirrors the `statusline-session-shape.ts` pure-core / `statusline-identity.ts` adapter split).

## Refinement — the active-agent set is claim-independent (2026-06-14, owner-directed)

Refined this session (Orbit stirs Spectrum, a571a1) under owner direction; the handover-to-Clipper
intent is preserved — this sharpens the draft, it does not reassign it.

**The correction.** "Active agent" and "team size" (Pos1) are derived from the UNION of agents across
every bounded source — the claims registry, the conventional-comms participant set, the ArcAngel
channel rosters, and the sidebar participants — and NEVER from claim-holders alone. Claims measure
*coordination over mutable artefacts*; that is a read-write concern. A read-only session holds no
claim because it edits nothing, yet two read-only agents reasoning or researching together are a
genuine pair. If the agent set were claims-anchored, that pair would still render `solo` — the exact
failure the icon model exists to retire, surviving into the successor. Pos2 (conventional comms) and
Pos3 (ArcAngel) already key off claim-independent participation; this refinement extends the same
claim-independence to Pos1's agent set, closing the gap. Owner framing: *claims are not the only
measure of collaboration; two agents in read-only sessions can collaborate fully on research and
reasoning.*

**Membership vs observation (the interim-resolver lesson).** The interim session-relative resolver
landed 2026-06-14 distinguished a *member* (holds a fresh own claim) from an *observer* (others
active, self not registered — the dimmed-eyes `observing` shape). In the register projection the
equivalent question is sharper and is answered at WS3: Pos1 is the size of *the team this agent
participates in* (the agents it shares a claim/comms/ArcAngel/sidebar edge with), not the size of the
active field around it. A pure bystander — present in the repo, party to no shared edge with the
others — is solo, and the projection must not inflate it into a pair/group it has not joined. The
single-enum `observing` shape was a one-dimensional shadow of this multi-axis register.

## Means

The frontmatter todos WS1–WS5. WS1 (model) and WS3 (projection) are independent of each other and
both feed WS4 (wiring); WS2 (derivation) depends on WS1; WS5 (readiness/proof) closes.

## Acceptance criteria and proof contract

| Id | Acceptance | Proof |
| --- | --- | --- |
| ws1 | Schema-driven register type compiles; a fixture-built register exercises every field incl. multiple pairwise channels + non-thread-work marker | unit |
| ws2 | `sources → register` is pure + IO-free; the IO adapter reads only the bounded sources (asserted: no `comms/` full-dir read); arity/freshness derived correctly over fixture source-sets | unit + integration |
| ws3 | Icon projection passes the full matrix: pos1 solo/pair/group; pos2/3/4 present-and-absent; **left-pack ordering verified** for every empty-position combination; glyphs render (no tofu) | unit |
| ws4 | `resolveSessionShape` replaced by the register-derived model; statusline render emits the 4-position string; honest `unknown` degradation preserved; all statusline tests green | unit + integration |
| ws5 | assumptions-expert readiness verdict recorded; per-tick cost measured on a realistic registry + rapid-comms set; app run captures icon strings for solo/pair/group/ArcAngel/directed scenarios | non-code + value-proxy |

## Prerequisites

- **Beneficial**: the #7 single ArcAngel-home constant (canonicalises `rapid-comms/`). Minimum
  shippable without it: WS2 reads the literal `.agent/collaboration/rapid-comms/` path (the (b)
  wing-fix already does this) and the constant is folded in when #7 lands.
- **Beneficial**: WS7 archive-move shrinks live `comms/`. Minimum shippable without it: WS2 uses the
  bounded recent-N/heartbeat surface regardless of corpus size (corpus-size-independent by design).

## Non-goals

- No hand-maintained team-state file — the register is derived only.
- No full comms-corpus scan per tick.
- No new coordination machinery (CLIs/watchers/hooks) — a pure projection over existing substrate.
- No broadening beyond the statusline projection in this plan; design the register reusably, but
  additional consumers are out of scope here (YAGNI).
- No change to the underlying substrate surfaces (claims/comms/ArcAngel/conversations) — read-only.

## Risks

- **Over-building the register for a single projection** — surface to assumptions-expert at WS5;
  keep the model to fields the icon spec + the named substrate genuinely need.
- **Per-tick cost** — the rapid-comms listing + recent-comms read must stay cheap; measure (WS5);
  fall back to the heartbeat-only surface if the listing is too costly.
- **Glyph rendering** (tofu) — re-verify every glyph in the target terminals (the prior tofu'd-peer
  - U+1F465 lessons); the handshake (U+1F91D) is already verified on the live channel.
- **Left-pack semantics ambiguity** — the matrix test (ws3) is the spec's executable definition.

## Foundation alignment

- `principles.md`: simplicity-first — one derived model, pure core, no new machinery.
- `schema-first-execution.md`: the register type flows from a schema (these are collaboration
  coordination types, hand-authored — NOT the OpenAPI cardinal rule, which does not apply here).
- `testing-strategy.md` / `tdd-as-design.md`: every cycle is a test+code pair; the fixture matrix is
  the projection's executable spec; pure core keeps tests IO-free.

## Plan-body first-principles check

Fires at WS2 (is the bounded-source set still the right cure given what WS7's corpus-shrink lands?)
and WS3 (does the left-pack spec survive contact with the real glyph widths / terminal rendering?).

## Readiness reviewers

Before `DECISION-COMPLETE` / `READY FOR EXECUTION`: `assumptions-expert` (proportionality — register
vs single consumer), `code-expert` (gateway), `test-expert` (the matrix + the pure-core/IO split).
`accessibility-expert`/`design-system-expert` not applicable (terminal glyphs, not rendered UI).

## Readiness verdict (2026-06-14, assumptions-expert)

**READY-WITH-CONDITIONS.** Design sound; owner-fixed semantics (icon spec, register requirement) not
in question; no critical findings (no blocker mis-framed). Four conditions resolve before
`DECISION-COMPLETE` — none re-decides the design:

- **Condition A — WS1 fields with no current consumer (owner-resolved 2026-06-14).** WS1 models
  fields the WS3 icon projection does not *yet* consume: `arc_channels` arity-split (Pos3 needs only a
  *fresh-channel boolean*), `threads[]` + the non-thread-work marker, `other_arrangements[]`, and the
  group-comms-vs-sidebars *type* distinction. **Owner verdict: retained as forward-design — absence of
  a current consumer is NOT evidence of over-building; that reasoning would forbid all innovation,
  since a new capability is never already in use.** These fields are marked *no consumer yet* and
  flagged for review/analysis in a future session; they do not gate completion and are not descoped.
  The §Non-goals YAGNI clause governs *speculative machinery* (new CLIs/watchers/hooks), not a
  relational model the owner has chosen to build ahead of its second consumer. (The reviewer's
  no-consumer→descope reading was itself the veto-on-absence anti-pattern.)
- **Condition B (execution) — bounded comms glob.** WS2 must assert the comms read globs
  `comms-seen/*.heartbeat.json` ONLY (verified: 24 × ~500B), never `comms-seen/*.json` (verified:
  ~168 × 100–200KB snapshots). This is what keeps the corpus-size-independent / non-blocking-on-WS7
  property true; extend the ws2 "no full-dir read" proof to cover it.
- **Condition C/D (sourcing) — contract-less union sources.** `conversations/` + `sidebars/` have no
  machine-readable participant-roster contract (verified: heterogeneous human-named `.md`/`.json`).
  The §Refinement union over "sidebar participants" rests on an ungrounded parse. Either define the
  extraction contract or descope these two dirs as Pos1/Pos2 union sources until one exists — the
  active set is well-covered by claims ∪ comms-heartbeats ∪ ArcAngel-rosters (the three sources with
  parseable identity).

Resolving Condition A toward descope also removes the ArcAngel arity content-roster read (Pos3 then
= filename-match + mtime, reusing the verified `resolveArcActive` path), simplifying WS2 for free.

## Learning loop and lifecycle

Per [`templates/components/lifecycle-triggers.md`](../../templates/components/lifecycle-triggers.md):
completion runs the consolidation workflow; the register's relational model is a candidate
pattern/PDR (it generalises the substrate-pointer cure). Archive with outputs mined on completion.

## Relationship to other work

- **Supersedes** the narrow resolver from the archived
  `statusline-session-shape-indicators.plan.md` (solo/peer/directed + arcActive).
- **Carries forward** the interim session-relative + `observing` resolver landed 2026-06-14 (team
  shape gated on a fresh own claim; the new `observing` shape for non-member-with-others-active; and
  the `statusline-ansi.ts` / `statusline-indicators.ts` / `statusline-render.ts` module split). WS4
  supersedes the single-enum `teamShape` but preserves its membership-relativity, and the indicators
  module is the seam WS4 wires the register projection into.
- **Builds on** WS7 Phase 1's `(b)` wing-fix (`listExperiments` → `rapid-comms`, commit `6d1e45f35`)
  and resolves Bugbot `ccc37502` / `de9f2522` more completely (the register is the proper home for
  ArcAngel-channel awareness).
- **Coordinates with** #7 (the single ArcAngel-home constant — WS2's ArcAngel source consumes it).
- **Realises** the comms-research insight: a live team-state model is the structural cure for the
  substrate-pointer pattern.
