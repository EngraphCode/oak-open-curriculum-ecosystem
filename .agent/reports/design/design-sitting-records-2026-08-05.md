# Design sitting records — 2026-08-05 (pre-register)

Durable recording of the owner's sitting verdicts and tweak enumeration from
the 2026-08-05 design-lane reopening sittings (W0.9 hub pre-read, W0.10
counter-identity pre-reads, W0.5 tweak enumeration), recorded at occurrence
by the design seat (Saffron guards Hedgerow, 8a4280) per the Director's
dispatch (comms event 2026-08-05T14:47:40Z). **Marked PRE-REGISTER**: the
wow-verdict register does not exist yet (the completion plan's W0.7 mints
it); every verdict row below migrates into that register at its minting, and
tweak entries feed W0.5's intake surface. Owner words are verbatim where
quoted; relay provenance is named per entry.

## Verdict 1 — showcase root: pre-read FAIL

- **Surface**: the design-showcase root page (served localhost:3020), browsed
  by the owner ~14:55Z.
- **Verdict**: FAIL (pre-read). Owner verbatim (Director relay, comms event
  14:56:30Z): "the showcase as is doesn't work, the 'oak' page has no
  relevant content and no styling, and I am pretty sure it doesn't use the
  design system we built."
- **Defects named**: no relevant content; no styling at render. Extends the
  standing 2026-08-02 rejection of the showcase page (recorded in the
  completion plan's taste calibration) with these two named defects.
- **Mechanism note** (Director first-hand, same event — a nuance on the
  consuming-suspicion, not a softening of the verdict): the root page markup
  DOES reference kit classes (`oak-canvas` / `oak-region` / `oak-container` /
  `oak-cluster` at `app/page.tsx:21-28`), so the defect surface is the CSS
  delivery/resolution path — or those structural classes lacking rules — not
  the markup's vocabulary. Diagnosis belongs to the lane at W1.5/W0.2; the
  verdict stands regardless of mechanism.
- **Sitting consequence**: the sitting moved to the Claude Design export
  (served statically at localhost:3030 from
  `packages/design/oak-design-system/studio-source/`), at the owner's
  instruction. Export-sitting verdicts follow below as they arrive.

## W0.5 enumeration sitting — the owner's export tweak ledger (10 items + 3 instruments)

Recorded from the Director's enumeration-ledger broadcast (comms event
2026-08-05T15:32:15Z; owner chat at the Director seat ~15:10–16:25Z,
screenshots read first-hand at that seat). Numbering is the owner's — his
message has no item 5. **Blocking words are DIRECTOR PROPOSALS pending the
owner's one-pass confirmation**; owner words are verbatim where quoted.
Process ruling (Director): these words arrived mid-re-review — plan
amendments adjudicate in ONE window with the re-review's close, so the
fleet's zero-target text never moves under it.

1. **Icons not loading** (three screenshots: Oak masthead search, front-page
   subject badges, worksheet logo). Root cause found and serve-fixed at
   occurrence: the export references the package-root `assets/` tree outside
   `studio-source/` — the sibling-layout class, twice today. CLASS:
   asset-closure — the rebuilt showcase carries a manifest-guarded asset
   closure (validate-kit-assets precedent). Proposed: BLOCKING (the class,
   for first light).
2. **No messy arrangements** — owner verbatim: "Oak design is to maximise
   readability for everyone, including those with non-typical neurological
   makeup, so it would never use messy arrangements like this" (front-page
   hero, overlapping rotated cards). Lands as an Oak taste-anchor rule
   (ordered, calm, no overlap/collage) + a W0.7 rubric criterion
   (readability/cognitive load, explicitly incl. neurodivergent users).
   Proposed: BLOCKING (any Oak-identity page in first light).
3. **Real-school check** — testimonial "James · Teacher, St Cuthbert Mayne
   School" (quote also names Aila, Oak's real product); the school is almost
   certainly real. Fix identical regardless: fabricated quotes must never
   attach to real institutions or read as Oak-endorsed. GENERALISED CLASS: a
   content-provenance manifest over the whole export/rebuild — every persona,
   institution, testimonial, statistic (the hero's "12,000+ free lessons /
   KS1–KS4 / 100%" are REAL Oak claims), and product name is either
   verified-real-and-appropriate or verified-fictional. Proposed: BLOCKING
   (safety class; the instance cures in the export soon, the manifest gates
   the rebuild).
4. **EMC² rotation** — owner: "could have some rotation as part of its
   design, but still consistent, not random, that would make it hard for
   some people to read." Lands as a W2.7 tilt-token constraint row:
   systematic tokenised fixed angles, never per-element random; composes
   with the 2026-08-03 delivered tilt values. Proposed: NON-BLOCKING for
   first light (binds W2.7/W2.9).
6. **Motion stances + honest reduced-motion** — owner words: plan a page
   demoing low-motion respect (an EMC² pair: ringing animations vs without);
   on pages like `whitelabel/creature/index.html` ACTUALLY respect the
   control ("the reduced motion version still has the button travel on
   hover, and the full motion version needs more motion in order for that to
   be visible"); "Oak and the gov-ish identity would never have motion
   anyway, they are too focussed on absolute accessibility." Lands as
   per-identity MOTION STANCE VALUES, owner-delivered today (Oak: none; PDS:
   none; EMC²: the motion identity, full/reduced genuinely distinct) — the
   motion analogue of the tilt card — plus a defect (creature reduced-motion
   not honoured) and a new demo cell (the EMC² motion pair). Proposed:
   defect BLOCKING wherever that page renders; demo pair NON-BLOCKING new
   scope (property: honest preference adaptation).
7. **All pages, all themes** — "the example worksheet is unreadable in some
   themes" (`Worksheet.dc.html?brand=creature`, body copy washed out).
   Evidence FOR the planned per-identity×theme gate matrix (W2.5) and census
   coverage of template pages. Derived: paper-destined artefacts in a
   dark-first identity need a DEFINED PRINT/PAPER POLARITY — per-identity
   print projections join the checked surface. Proposed: instance BLOCKING
   (the matrix must catch it); print-projection scope NON-BLOCKING (named
   story).
8. **Discoverability** — example lesson slides + example worksheet become
   first-class navigation entries, not footer asides. Lands in the W1.4
   page-set/IA authoring. Proposed: NON-BLOCKING for the probe, BLOCKING for
   the page-set finalisation.
9. **Editable slides** — text-editable demo slides with WORKING buttons
   (convert to PDF, print, save via localStorage implying a reset). NEW demo
   scope; kernel property: document-artefact workflows. Needs its story
   minted with per-story review; localStorage-only keeps privacy trivial.
   Proposed: NON-BLOCKING (post-first-light story).
10. **White-labelling footer copy** — "it's not proof, it's a demo of
    capability; it doesn't communicate the difference between the design
    system (call it 'our design system') and the identities." Owner draft
    wording: "our design system can support multiple identities, theme
    preferences and accessibility needs." CLASS: every export page's framing
    prose gets an owner-voice pass at rebuild (census records each page's
    prose state). Proposed: BLOCKING for the pages it appears on.

**Instruments (owner words, same sitting):**

- "the showcase has a comprehensive sitemap.xml" — Director strengthening:
  the sitemap GENERATES from the W0.1 page census; the axe/Lighthouse page
  lists DERIVE from the sitemap (method-independent parity).
- "every page in every theme is checked by axe in playwright as a minimum"
  — matches the planned W0.3 shipped-page axis statement; "as a minimum"
  preserved (the non-axe legs stay named beside it).
- "Lighthouse measurements against every showcase page, to prove it is
  performant" — Director strengthening: CI PERFORMANCE BUDGETS (per-page
  assertions), not one-off measurements. NOTE: performance gates are NEW to
  the plan — a genuine plan addition.

## Figma reference homing (Director routing, 2026-08-05)

The owner's 2026-07-29 design-queue handover points at the **Oak Design
Kit** Figma file, node id **2952-13167**. Recorded here deliberately
TOKEN-STRIPPED: the owner's pasted URL carries a Figma share token, and
this repository is public — the token never lands in-repo. Resolve the
node at time of use via the Figma tooling against the named file and
node id.

## Owner ruling — official Oak Design Kit is reference-only (approximation, never copy)

Ruled at the sitting (2026-08-05 ~15:45Z, Director relay with first-hand
Figma reconnaissance at the Director seat):

- **The ruling** (owner's words' substance): the official Oak Design Kit
  (Figma; Oak org project 50245843; kit file `YcWQMMhHPVVmc47cHHEEAl`;
  tokens node `2952-13167` — the 2026-07-29 design-queue handover node) is
  COPYRIGHT OAK and must never be verbatim-copied into this public repo,
  even with the licensing model in place. Intent: "our Oak identity and
  themes to be a GOOD approximation of the official design kit, just to
  demonstrate what is possible."
- **Protocol** for W2.9 Oak-identity authorship and any kit consultation:
  read-only via the Figma MCP (View seat, owner's account — re-verified
  this sitting); values RE-DERIVED by judgment, never exported or copied;
  provenance recorded in the content-provenance manifest ("approximated
  from the official Oak Design Kit, dated"); Figma share tokens never land
  in-repo (token-stripped pointers only).
- **Reconnaissance** (Director, first-hand): the kit's Style Tokens node
  carries the official taxonomy — Color / Font / Spacing (+ primitives) /
  Border / Drop Shadow / Opacity tokens, an A11y doc banner, and theme
  tokens for exactly TWO themes (oakDefaultTheme, oakDarkTheme). Lane
  note: the approximation target is the VISUAL LANGUAGE; on the theme axis
  our five-theme roster deliberately exceeds the reference.
- **Bounds already-landed work**: the export's Oak identity is itself an
  approximation of this class — blessed and bounded by the ruling. Sitting
  item 3's content-provenance manifest gains an identity-values column.
- Plan-touching deltas (W2.9 protocol note; the manifest column) ride the
  single amendment window with the tweak-ledger deltas, per the Director's
  process ruling.

## Owner ruling refined — "the cartographer's folly" (values examined exactly, used slightly off)

Refinement at the sitting (2026-08-05 ~15:50Z, Director relay; owner image
verbatim): "we can examine token values, but the values we use should be
slightly off, like a cartographer's folly." Supersedes the plain
approximate-by-eye reading of the reference-only ruling above. Protocol for
W2.9 Oak-identity authorship:

- EXAMINING exact official values is allowed (read-only Figma MCP).
- Every value USED deviates deliberately — the trap-street property: a
  verbatim match with the official kit is itself evidence of copying.
- Bounds: perturbation is SYSTEMATIC (harmony preserved — consistent
  hue/lightness shifts, never per-value noise) and ACCESSIBILITY-SAFE
  (contrast floors hold; perturb in the safe direction).
- The folly is procedural and provenance-attested, never a mechanical gate
  (a gate would need official values stored in this public repo, which the
  ruling forbids).

Reconnaissance addendum (Director, owner's own Figma view): the kit FILE's
page list carries Cover plus a "Design Documentation" page group (Oak
Component Standards / Oak Design Principles / A11y Documentation); the MCP
page enumeration returns Cover only, so deep nodes are reached by link,
not the page list. The three documentation pages are prime
approximation-reference material for the W0.7 rubric and the Oak anchor.
