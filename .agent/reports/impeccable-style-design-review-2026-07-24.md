# External design review: impeccable.style (2026-07-24)

**Provenance**: owner-requested (Jim Cresswell, in-session, 2026-07-24
~14:00Z: "have a fable subagent, maybe the design expert, do a deep
review of https://impeccable.style/"). Executed by a `design-system-expert`
subagent (Claude Fable 5) dispatched by Osprey spins Vortex (3b7adf),
plans-lane Implementer; conserved to this durable home at the session's
wrap loss-scan (the subagent's context is gone; this report is the
surviving artefact). WCAG figures below are the reviewer's first-hand
computation from the site's fetched stylesheets, not the site's claims.

**Owner-held disposition at conservation time**: the two immediately
landable "steal" items (deterministic drift detectors as CI gate; state
pairings in the contrast manifest) are deliberately NOT ticketed — held
for the owner's word.

---

## One-line verdict

Impeccable is agent-steering, not a design system — its token
architecture is behind Oak's and its own site fails checks Oak's build
would catch; the thing worth taking is its enforcement posture
(deterministic drift detectors as hooks/CI) plus composite type-role
tokens and a generated DESIGN.md projection, while its identity-fused
naming and palette-mutating themes are exactly what Oak's generality
rules exist to prevent.

## 1. What it actually is

**Not a design system, token library, or CSS framework.** Impeccable is
a *design-direction skill for AI coding agents* — a vocabulary and
enforcement layer installed into a repo (`npx impeccable install`) that
steers Claude Code / Cursor / Copilot etc. It comprises:

- One skill (SKILL.md v4.0.2, positioning the agent as "an
  award-winning design director" pursuing "out-of-distribution craft")
  with ~34 reference files (typography, colour/OKLCH, spatial, motion,
  craft floor, etc.)
- 23 steering commands (`/impeccable polish`, `/audit`, `/typeset`,
  `/extract`, `/distill`...)
- A deterministic detector: 64 catalogued anti-pattern rules ("AI
  slop"), 59 on by default, runnable as `npx impeccable detect` with no
  API key, plus provider-native hooks that run it on UI file edits
- Two context files it generates and reads: `PRODUCT.md` and
  `DESIGN.md` (the latter shared with Google Stitch's design-md
  format), with an `.impeccable/design.json` sidecar for ramps, motion
  tokens, breakpoints, and component snippets

**Author and adoption**: Paul Bakaus — creator of jQuery UI, ex-Google
(Chrome DevTools product lead, AMP/Web Stories). Released March 2026;
~49k GitHub stars, 2.9k forks, Apache 2.0; now a company (Renaissance
Geek) with a16z backing and a GitHub partnership, plus a paid tier
(impeccable.pro, not examined). A serious, heavily adopted artefact —
but its adoption signal is about the AI-agent workflow, not token
architecture. Its own docs: it "is not a component library, design
system, or CSS theme... it runs inside your repo agent to refine,
audit, and polish code you already have, **inheriting your tokens and
components instead of inventing a parallel design system**."

## 2. Architecture

**Token model (DESIGN.md)**: YAML frontmatter (machine layer: `colors`,
`typography`, `rounded`, `spacing`, `components`; references as
`{colors.primary}`; component tokens capped at 8 properties; variant
naming `button-primary`, `button-primary-hover`) + eight fixed-order
Markdown prose sections. Deliberately *not* DTCG — no `$type`/`$value`,
no formal tier model. Anything structurally rich (tonal ramps, shadow
vocabularies, motion tokens, breakpoints, stateful component CSS)
overflows into the `design.json` sidecar.

**The site's own shipped CSS** (their strongest concrete artefact) is a
two-layer custom-property system:

- An identity layer named after the brand-world materials (Japanese
  gold-leaf, "neo-kinpaku"): `--ks-kinpaku: oklch(84% .19 80.46)`,
  `--ks-lacquer: oklch(7% .006 95)`, `--ks-patina: oklch(70% .12 188)`,
  plus role tokens `--ks-text`, `--ks-text-muted`, `--ks-accent-ink`,
  and composite type-role tokens:
  `--ks-type-display-size: clamp(3.4rem, 6.5vw, 5.6rem);
  --ks-type-display-weight: 100; --ks-type-display-line: 1.02;
  --ks-type-display-track: -.01em`
- A generic alias layer on top: `--font-display:
  var(--ks-font-display)`, `--spacing-md: 24px`, `--color-text:
  var(--ks-text)`, `--duration-base: .3s`, `--ease-out:
  cubic-bezier(.16,1,.3,1)`

**Theming**: default dark at `:root`; light is `html.light {
color-scheme: light; ... }` toggled by inline script +
`localStorage.getItem('impeccable-theme')`, with a single
`prefers-color-scheme` check in the bootstrap script. Critically, the
light block **redefines raw palette values** (`--ks-vermilion` shifts
from `oklch(62% .15 35)` to `oklch(52% .16 35)`; the patina/lacquer
ramps re-declare) — themes mutate the palette, not just semantic
mappings.

**Live-mode parameter tokens**: variants are authored against
continuous interpolation parameters — `var(--p-scale, 1)` (type, range
0.85–1.3), `var(--p-density, 1)` (spacing, 0.6–1.4),
`var(--p-color-amount, 0.5)` (palette dosage 0–1) — so a human can
slide between variants without regeneration.

## 3. Craft assessment (from their own artefacts)

**Genuinely strong**: skip link + `main#main-content`; visible focus
(`:focus-visible { outline: 2px solid var(--ks-patina); outline-offset:
3px }` — 8.24:1 against the dark canvas by first-hand computation);
fluid type via `clamp()`; body 1rem/1.8; disciplined easing
(`--ks-ease: cubic-bezier(.2,.8,.2,1)` used consistently).

**Their stated floor matches Oak's gate**: craft-floor.md mandates
"body and placeholder text ≥4.5:1, large text ≥3:1", controls/focus
≥3:1, `45–75ch` measure, 1rem body floor, "exponential ease-out from an
already-visible default", and state coverage ("hover, disabled,
loading, error, empty").

**But the floor is prose, not a gate — and it shows.** Computed
contrast for their actual token pairs:

- Dark theme: text 14.53:1, muted 8.41:1, faint 5.73:1 — all pass;
  `--ks-text-mute-deep` 3.79:1 (large/non-text only)
- **Light theme: `--ks-text-mute-deep` (oklch 65%) on `--ks-lacquer`
  (97%) = 2.97:1 — fails even the 3:1 non-text threshold**;
  `--ks-text-faint` 4.45:1 misses AA body text

Reduced-motion coverage is partial: 16 `prefers-reduced-motion: reduce`
guards across three stylesheets against 69 `animation:` declarations
(ratio measured; per-animation coverage not traced). No
`prefers-contrast` or `forced-colors` handling anywhere. The spacing
scale shipped is 8-based (8/16/24/32/48/80/120) while their own
layout.md preaches a 4-unit base. The site uses tracked-uppercase mono
eyebrows on every section (`.ks-section-eyebrow`, `letter-spacing:
.28em`) — a pattern its own craft floor lists under "what to refuse"
and its slop catalogue names. `--color-paper: oklch(7% .006 95)`
hardcodes the same value as `--ks-lacquer` instead of referencing it —
alias drift inside a two-layer system.

The verdict this supports: **excellent taste, prose-enforced; Oak's
build-time recompute gate is categorically stronger governance** than
anything Impeccable's own site practises on itself.

## 4. What Oak should steal, and what it should reject

**Steal:**

1. **Deterministic drift detectors as a hook/CI gate** — the strongest
   idea. The slop catalogue's first section is literally tier
   enforcement: "Font outside DESIGN.md / Color outside DESIGN.md /
   Radius outside DESIGN.md / Font size outside DESIGN.md" —
   machine-checkable, no-API rules catching hardcoded values escaping
   the token source. Oak's three-tier enforcement is currently
   reviewer-borne plus the contrast gate. A small deterministic linter
   over consumer CSS — "colour/size literal not resolvable to a `--*`
   token" — wired into the existing build in
   `packages/design/design-tokens-core` (and optionally an edit-time
   hook) would convert tier-violation detection from judgment to gate.
   Their general-quality rules (skipped heading level, tight line
   height, tiny body text, line length) are equally mechanisable.
2. **State pairings in the contrast manifest** — colorize.md requires
   verifying "interactive states, overlays, and vision deficiency
   simulation"; the craft floor demands the full state set. Oak's
   `contrast-pairings.ts` triadic model already exceeds their tooling;
   extending it with declared hover/focus/disabled pairings closes the
   exact gap their own light theme fell through (the 2.97:1 failure is
   the bug class Oak's gate exists to prevent — use it as the worked
   example).
3. **Composite type-role tokens** — `--ks-type-display-{size,weight,line,track}`
   grouping size/weight/leading/tracking under a *role* name
   (display/headline/title/body/eyebrow) is cleaner than loose size
   scales, maps to DTCG's `typography` composite type, and is
   identity-agnostic — it lands at Oak's semantic tier and satisfies
   the generality-depth gradient. Their measure/leading rules
   ("45–75ch", leading varies inversely with measure, light-on-dark
   gets more leading and a weight step) are worth folding into
   token-authoring guidance.
4. **The "craft floor vs direction" separation as vocabulary** — "The
   floor enforces mechanics — never aesthetic direction" is the
   generality-depth gradient stated from the other end: the deepest
   layer is pure mechanics, identity rides above it. Naming Oak's
   invariant layer a "craft floor" in
   `docs/governance/design-token-practice.md` would sharpen the 3×4
   matrix conversation: the floor is what all 12 cells share.
5. **The Persuade/Operate/Read/Experience surface taxonomy** — a good
   consumer-guidance lens for docs, not for tokens.
6. **DESIGN.md as a generated projection** — reject it as a source
   (below), but *generating* a DESIGN.md/design.json projection from
   Oak's token build is a cheap, standards-adjacent (Google Stitch
   interop) way to make Oak's system legible to any AI agent working in
   Oak repos. Fits ADR-148's "secondary outputs must remain projections
   of the token source" clause exactly.
7. **OKLCH for palette authoring** — their rationale is correct
   ("lightness and chroma can be adjusted predictably"; reduce chroma
   near ramp extremes). For Oak a *considered future*, riding a real
   palette-authoring need (e.g. the Freedonia/EMC ramps), not landed
   speculatively; the contrast validator's `hexToSrgb` entry point
   would need an OKLCH leg.

**Reject:**

1. **DESIGN.md YAML as token source** — no `$type`, an 8-property
   component schema, a JSON sidecar carrying everything real. A strict
   regression vs Oak's DTCG + the ADR-213 CSS-source direction.
2. **Identity-fused deep tokens** — `--ks-kinpaku`, `--ks-lacquer`,
   `--ks-patina` bake the brand world into the naming layer functioning
   as their semantic tier: precisely what "semantic tokens never
   Oak-specific" prohibits. Their own site is the counter-evidence:
   they had to bolt a second generic alias layer on top, then leaked a
   hardcoded duplicate.
3. **Palette mutation per theme** — Oak's rule (themes override
   semantic tokens; palette invariant) is the stronger contract; their
   unvalidated light theme shipping a sub-3:1 text token is the
   demonstration.
4. **Class-toggle-first theming** — weaker than Oak's dual-selector
   approach, which degrades correctly with JS absent.
5. **Continuous parameter tokens in production** — brilliant as a
   design-exploration mechanism, wrong inside a governed system: a
   continuum cannot be contrast-validated or tier-checked at build. If
   Oak ever wants density modes, they should be discrete, validated
   theme variants.
6. **The "dice/worlds" generated-identity system** — Oak's identities
   (Oak, Freedonia, EMC) are real referents with real constraints, not
   generated aesthetics. Generation belongs at exploration time, never
   in the system.

## 5. Unknowns (not verified — not guessed)

- **impeccable.pro** (paid tier) and the **/research** page — not
  fetched.
- **Detector implementations** — rule catalogue and file layout
  confirmed (`scripts/detector/`, ~15 files); rule code unread (literal
  scan vs computed-style matching unverified).
- **Live Mode internals** (localhost:4321 loop) and the neo-mirai case
  study — not examined.
- **Reduced-motion completeness** — the 16-guards-vs-69-animations
  ratio is measured; per-animation coverage was not traced.
- **Full DESIGN.md spec text** — schema summary from
  `reference/document.md` via fetch condensation; exact frontmatter
  grammar and Stitch-interop depth unverified.
- Secondary-source claims (a16z backing, GitHub partnership, March 2026
  release) come from third-party coverage, not primary artefacts.

## Sources consulted

- https://impeccable.style/ , /designing/, /docs, /slop
- https://github.com/pbakaus/impeccable (tree via API; raw: SKILL.md,
  reference/colorize.md, document.md, typeset.md, layout.md,
  craft-floor.md, extract.md)
- Site stylesheets downloaded and inspected: `/_astro/Base.CAa1MlNY.css`,
  `index.tJuq78SX.css`, `sub-pages.Bhu8aPu1.css` (contrast ratios
  computed first-hand from these)
- Background coverage: a16z ("Impeccable by Design"), emelia.io,
  computertech.co, paulbakaus.com, webdeveloper.com, fontofweb.com
- Oak grounding: ADR-148 (design token architecture),
  `docs/governance/design-token-practice.md`
