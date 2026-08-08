# Wow-verdict register minting record — 2026-08-08

The register minted by the completion plan's W0.7 (this directory's
`wow-verdict-register.{ts,json}` and the same-PR schema test), recorded at
minting by the design seat (Civet spins Cavern, 054f5e).

## Migration from the 2026-08-05 pre-register

Per the sitting record's own minting contract
(`.agent/reports/design/design-sitting-records-2026-08-05.md`: "every
verdict row below migrates into that register at its minting, and tweak
entries feed W0.5's intake surface"), exactly one verdict row existed and
is migrated:

- **Verdict 1** — showcase root (`/`, `oak-design-showcase`): FAIL
  (pre-read, owner verbatim via Director relay, comms event
  2026-08-05T14:56:30Z). Carried as a `pre-read`-class row (the instrument
  did not exist at that read, so instrument-leg results are absent under
  the schema's optional arm).

The W0.5 tweak-ledger items (owner-numbered 1–10, no item 5) are NOT
register rows: the record routes them to W0.5's intake surface, and the
plan absorbed them at the 2026-08-08 W0.5 fold (PR #828). The
2026-08-08 Cricket run's judgement-medium-adversarial dissent read items
2/6/7 as unmigrated page-verdicts; the resolution above is the record's
own artefact-class separation.

## Inherited instrument findings (from the merged #784 adjudication addendum)

Four findings bind FUTURE instruments and route to story cards; recorded
here so the cards inherit them from a durable home:

1. **Folly attestation pins its upstream** — an immutable Oak Components
   commit sha or content digest, fetched at audit time (stores no official
   values). Home: the folly/identity story card.
2. **Delta-E names its formula** — CIE76 / CIEDE2000 / OKLCH-native deltas
   differ materially; the story card names the formula and threshold
   convention before the just-noticeable-difference band becomes a target.
   Home: the folly/identity story card.
3. **Attestation semantics under exemptions** — zero-exact-match binds the
   NON-EXEMPT expressive families only; exempt values (pure white, true
   black, the generic grey ramp; ci-\* exact by scientific provenance) are
   enumerated with their grounds. Home: the folly/identity story card.
4. **Editable-slides data boundary** — localStorage persists across
   sessions and is same-origin-readable; the story carries auto-clear or
   expiry, a reliable reset, and no-sensitive-input guidance. Home: the
   editable-slides story mint (plan W4.8).

## Fixture-corpus derivation note (for the calibration PR)

"The export's composed pages" resolves to the three identity FRONT PAGES
the export's own gallery wrapper (`Example Front Pages.html`) frames:
`studio-source/ui_kits/oak/index.html`; the PDS identity's front page
under `studio-source/whitelabel/` (its directory bears the identity's
pre-rename name); and `studio-source/whitelabel/creature/index.html`
(EMC²). This is the export's own
closed three-file set, never a seat-authored sample; the census-derivation
chain (sitemap → axe/Lighthouse page lists) binds the REBUILT demo's page
lists, and W0.1's census later confirms the correspondence
(2026-08-08 Cricket run, judgement-high-adversarial redirection, adopted).

## Schema notes at v0

- `identity`/`theme` are open strings: the identity roster is live (the
  PDS rename; W0.10 mints the counter-identity anchors) and a wrong closed
  enum would reject true rows. Tightening to the settled rosters is a
  recorded follow-on once W0.10 lands.
- `rowClass` encodes the plan's required/optional arm mechanically:
  `checkpoint` rows refuse to parse without all three instrument-leg
  results; `pre-read` rows carry them optionally.
