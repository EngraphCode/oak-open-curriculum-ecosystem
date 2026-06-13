---
name: "Statusline Enhancements — Oak Mark + Session-Shape Indicators"
overview: "The unified Claude Code statusline lane. Part one — the Oak acorn logo-column mark — has LANDED (see §Landed). Part two adds dense, glanceable session-coordination indicators to the statusline: a Director demark on the identity, a team-shape icon (directed team vs peer team vs solo), and an ArcAngel-active wing — resolved from the claims registry and the ARC experiments directory only (never the comms corpus), enabled by an additive optional role field on the claim schema that also lands the long-pending structural claim-schema cure for singleton roles."
status: "IN PROGRESS — unified statusline lane (owner-directed 2026-06-13 to fold the Oak-mark work into this lane). The Oak acorn mark LANDED (commit 40ef58a06, UNPUSHED, on feat/comms-research — see §Landed). The session-shape indicators (WS1–WS5) remain PENDING; WS1 was staged on feat/statusline-enhancements and is paused on an upstream sdk-codegen blocker (/keywords). WS3's single-line layout is superseded by the landed 4-row logo block — see §Pickup before resuming."
todos:
  - id: ws1-claim-role-field
    content: "WS1: add an optional `role` field to the active-claims schema (enum-ish open string: director, peer, marshal, curator, implementer...) + `--role` on `claims open`; additive, existing readers unaffected (the handoff_record_path precedent); update the start-right skills' claim-opening steps to pass it; record that this lands the structural claim-schema cure for singleton roles (check-singleton-per-window pending cure, 2026-05-22)."
    status: pending
  - id: ws2-session-shape-resolver
    content: "WS2: a pure session-shape resolver beside the statusline identity gatherer — inputs: own identity tuple, parsed active-claims.json, experiments-dir listing; outputs { ownRole, teamShape: solo|peer|directed, arcActive }. Fresh-claim filtering via each claim's freshness_seconds; live-peer count = distinct fresh identity tuples; directed = any fresh claim with role director; ARC = experiments/*.md mtime-fresh AND filename contains the agent's name (per the per-pair filename convention). Worktree seats resolve the PRIMARY checkout root via `git worktree list` (first entry) — no machine-local paths. HARD RULE: never read the comms directory (statusline ticks constantly; the 5k-file scan class killed three watchers on 2026-06-11/12)."
    status: pending
    depends_on: [ws1-claim-role-field]
  - id: ws3-render-integration
    content: "WS3: render the indicators in the early fixed-width zone per the truncation design — Director demark suffixed to the identity segment; team-shape icon (directed/peer; nothing when solo); ArcAngel wing appended while a relevant channel is live. Glyphs come from WS4's verified set; segment order keeps the new icons inside the fixed-width prefix so narrow terminals never truncate them. SUPERSEDED LAYOUT (2026-06-13): the statusline is no longer single-line — the landed Oak mark makes it a four-row logo-column block (logo left, segments distributed one-per-row to its right). Read the current `renderStatusline` first, then re-fit the indicators into that multi-row layout; the 'fixed-width prefix' framing above predates the logo and no longer applies. WS1/WS2/WS4/WS5 are layout-independent and unaffected."
    status: pending
    depends_on: [ws2-session-shape-resolver, ws4-glyph-verification]
  - id: ws4-glyph-verification
    content: "WS4: verify candidate glyphs in real terminals (iTerm2, Terminal.app, VS Code terminal): owner's candidates are a family-style icon for directed teams (NOTE: ZWJ sequences like the adult-and-two-children emoji often render as fragments in mono fonts), two-people for peer (single codepoint, safe), a wing for ArcAngel (U+1FAB6, newer — verify), and a Director mark (compass suggested). Prefer single-codepoint emoji; pin an ASCII fallback set ([D]/[T]/[A]) for any target terminal that mangles a choice. The client-visibility discipline applies: no glyph ships without rendering evidence."
    status: pending
  - id: ws5-tests
    content: "WS5: tests atomic with each cycle — resolver unit tests over explicit fixture registry/dir inputs (no global state, no process.env), render tests for every shape combination (solo/peer/directed × arc on/off × director/non-director), boundary tests for claim freshness. All 1,020+ agent-tools tests green at every commit."
    status: pending
isProject: false
---

# Statusline Session-Shape Indicators

**Created**: 2026-06-12 (owner direction in-session: dense glanceable information about the
session's coordination state — directed-team vs peer-team icons, an ArcAngel-active wing,
and a Director demark; exact icons flexible). Feasibility was assessed and the plan shape
ratified in the same exchange; this file records it for pickup.

**Unified 2026-06-13** (owner-directed): the Oak-mark statusline work was folded
into this lane, because the mark and the indicators both render through the same
`renderStatusline` and share the statusline's physical layout — they cannot be
designed independently. See §Landed (what shipped) and §Pickup (what is left and
how to resume cleanly).

## Landed: Oak acorn mark (2026-06-13)

The first half of this lane shipped. The Claude Code statusline now renders the
Oak acorn as a four-row left logo-column, with the identity / model / status /
location segments flowing to its right.

- **Commit**: `40ef58a06` (`feat(agent-tools): tune the statusline Oak mark to a
  4-row braille acorn`) — UNPUSHED, on `feat/comms-research`. The mark landed on
  a different branch from the indicators' `feat/statusline-enhancements`; see
  §Pickup for reconciliation. (Predecessor `4be070c27` added the first 3-row
  version and is already on origin.)
- **Style switch**: `OAK_STATUSLINE_LOGO` selects the mark — `braille-sharp`
  (default, owner-tuned: a sharper lower-left nut-to-cup shoulder + crisper
  sprout), `braille` (plain conversion), `quad` (universal block elements),
  `sextant` (needs the Legacy Computing font block), or `none` (original single
  line).
- **Files**: `agent-tools/src/claude/oak-logo.ts` (new — glyph data + the
  `resolveLogoStyle` resolver), `statusline-render.ts` (logo composition + the
  four-row segment distribution), `statusline-identity.ts` (env-driven style),
  plus `tests/claude/oak-logo.test.ts` and the `statusline-render` test additions.
  The mark is a verified conversion of the acorn SVG; recipe + provenance live in
  `.agent/research/developer-experience/statusline-logos.md`.
- **Renderer shape**: `renderStatusline(parts, { logo })` is pure; `logo: 'none'`
  reproduces the original single line byte-identically. Segments are built once
  (`buildSegments`), then either joined (single line) or composed against the
  logo rows (`composeWithLogo`). This is the surface the indicators must extend.

## End goal

A glance at any session's statusline answers: *am I in a team, what shape is it, am I (or
is someone) directing, and is a rapid channel live?* — without opening a single
coordination surface. Builds directly on the 2026-06-12 statusline redesign (glance-ordered
segments, context warning colours) landed in the same lane.

## Mechanism

Every desired signal has a cheap repo-file truth source except role, which today lives only
as prose in claim intents — so WS1 makes role structured (additive claim-schema field), and
the resolver then needs exactly two small reads per tick: `active-claims.json` (team shape,
roles, freshness) and the experiments directory listing (ArcAngel liveness via mtime +
participant-bearing filenames). The comms corpus is structurally excluded from the read
path: the statusline ticks constantly and the large-flat-directory scan class has a
documented body count (eight watcher deaths, three sessions, 2026-06-11/12). Glyphs ship
only with terminal-rendering evidence — the same discipline that caught the
structuredContent invisibility.

## Means

The five frontmatter workstreams. WS1 unblocks WS2; WS4 (glyph evidence) and WS2 jointly
unblock WS3; WS5 rides every cycle rather than trailing.

## Prerequisites

- **Blocking**: none external — the statusline redesign this builds on merged via PR #198's
  branch lineage.
- **Beneficial**: the era-pinning identity cure (cleaner identity resolution) — minimum
  shippable without it is unchanged; the resolver consumes whatever tuple the identity CLI
  yields today.

## Acceptance criteria and proof contract

| Id | Acceptance | Proof |
| --- | --- | --- |
| ws1 | `claims open --role director` writes the field; schema validates; existing readers and tests unaffected; start-right claim steps name the flag | unit + schema validation + doc diff |
| ws2 | Resolver returns correct `{ownRole, teamShape, arcActive}` for fixture matrices (solo / peer / directed; stale vs fresh claims; arc file present-fresh / present-stale / absent; worktree-seat primary-root resolution) | unit |
| ws3 | Rendered statusline shows the verified glyphs in the fixed-width prefix for every shape combination; absent segments drop cleanly | unit (render) |
| ws4 | A recorded rendering matrix for ≥3 terminals over the candidate set, with the shipped set + fallbacks pinned in the source comments | non-code: matrix in the cycle's commit body + source comment |
| ws5 | Full agent-tools suite green at every commit; no skipped/conditional tests | unit suite |

## Non-goals

- No comms-corpus reads, ever, from the statusline path (performance class, named above).
- No new liveness machinery — claim freshness is the proxy; PDR-078 heartbeat precision is
  out of scope for a glance surface.
- No role enforcement — the role field is honest-by-convention, the same trust model as
  every other claim field.
- No cross-platform statusline (Claude Code only; Cursor/Codex equivalents are future
  owner-directed work).

## Risks

- **Stale-claim windows** mis-shape the icon for up to `freshness_seconds` — acceptable for
  a glance surface; one docstring sentence records it.
- **ZWJ glyph fragmentation** — cured structurally by WS4's evidence gate and the ASCII
  fallback set.
- **ARC mtime approximation** — a conserve-at-close copy can refresh mtimes; filtered by
  participant-name-in-filename, and a false wing for a few minutes is harmless.
- **Worktree primary-root derivation** — `git worktree list` ordering is the contract;
  WS2's fixtures pin it.

## Foundation alignment

`principles.md` simplicity-first (two small reads, no daemon, no cache layer until evidence
demands one); `testing-strategy.md` (pure resolver + render functions, fixture-driven, no
global state); no-machine-local-paths (primary-root derived, never written);
plan-body first-principles check fires at WS3 (do WS4's rendering facts still hold for the
terminals in actual use?). Lifecycle per `templates/components/lifecycle-triggers.md`;
completion archives this plan with the glyph matrix mined into the statusline source docs.

## Pickup for the next session

Resume the indicators here. In order:

1. **Reconcile the two branches first.** The Oak mark is in `40ef58a06` on
   `feat/comms-research`; the indicators' WS1 was staged on
   `feat/statusline-enhancements`. Get both onto one base (push `40ef58a06`, then
   land it where the indicators will build) so the unified lane has a single
   branch — otherwise two branches edit `renderStatusline` in parallel and
   conflict.
2. **Re-fit WS3 to the four-row layout (the load-bearing change).** Read the
   current `renderStatusline` / `composeWithLogo` before designing placement. The
   Director demark still suffixes the identity (now row 0). The team-shape icon
   and ArcAngel wing need new homes in the multi-row block — the old single-line
   "fixed-width prefix" no longer exists. Decide where they sit (e.g. trailing a
   specific row, or in the logo-column gap) and how they interact with the per-row
   segment distribution. WS1/WS2/WS4/WS5 are layout-independent and unchanged.
3. **Clear the WS1 blocker.** WS1 (additive claim `role` field) was paused on an
   upstream sdk-codegen blocker (the `/keywords` description change, comms event
   `7ca3eba2`). Confirm it is resolved — or that WS1 does not actually depend on
   it — before resuming the chain.

The acceptance/proof table's `ws3` row ("fixed-width prefix") is rewritten by
step 2; the other rows stand.
