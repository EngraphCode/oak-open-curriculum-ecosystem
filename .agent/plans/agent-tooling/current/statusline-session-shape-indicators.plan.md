---
name: "Statusline Session-Shape Indicators"
overview: "Add dense, glanceable session-coordination indicators to the Claude Code statusline: a Director demark on the identity, a team-shape icon (directed team vs peer team vs solo), and an ArcAngel-active wing — resolved from the claims registry and the ARC experiments directory only (never the comms corpus), enabled by an additive optional role field on the claim schema that also lands the long-pending structural claim-schema cure for singleton roles."
status: "QUEUED — owner-directed 2026-06-12 (feasibility assessed and plan ratified in-session; written to disk uncommitted by owner instruction)"
todos:
  - id: ws1-claim-role-field
    content: "WS1: add an optional `role` field to the active-claims schema (enum-ish open string: director, peer, marshal, curator, implementer...) + `--role` on `claims open`; additive, existing readers unaffected (the handoff_record_path precedent); update the start-right skills' claim-opening steps to pass it; record that this lands the structural claim-schema cure for singleton roles (check-singleton-per-window pending cure, 2026-05-22)."
    status: pending
  - id: ws2-session-shape-resolver
    content: "WS2: a pure session-shape resolver beside the statusline identity gatherer — inputs: own identity tuple, parsed active-claims.json, experiments-dir listing; outputs { ownRole, teamShape: solo|peer|directed, arcActive }. Fresh-claim filtering via each claim's freshness_seconds; live-peer count = distinct fresh identity tuples; directed = any fresh claim with role director; ARC = experiments/*.md mtime-fresh AND filename contains the agent's name (per the per-pair filename convention). Worktree seats resolve the PRIMARY checkout root via `git worktree list` (first entry) — no machine-local paths. HARD RULE: never read the comms directory (statusline ticks constantly; the 5k-file scan class killed three watchers on 2026-06-11/12)."
    status: pending
    depends_on: [ws1-claim-role-field]
  - id: ws3-render-integration
    content: "WS3: render the indicators in the early fixed-width zone per the truncation design — Director demark suffixed to the identity segment; team-shape icon (directed/peer; nothing when solo); ArcAngel wing appended while a relevant channel is live. Glyphs come from WS4's verified set; segment order keeps the new icons inside the fixed-width prefix so narrow terminals never truncate them."
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
