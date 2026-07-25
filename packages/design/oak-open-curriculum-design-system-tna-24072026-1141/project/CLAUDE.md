# Oak Open Curriculum Design System — project instructions

**Session protocol.** At the start of every session, read `HANDOFF.md` (in-flight state, outstanding work, context that lives nowhere else) before doing anything. At the end of every session — or whenever pausing — rewrite `HANDOFF.md` so a cold session on any account can pick up exactly where this one left off: what's done, what's outstanding (mirroring the todo list), known gotchas, and any context not captured in files.

**Accessibility is non-negotiable.** WCAG 2.2 AA is the floor, never the target; treat AAA as the aspiration. This holds at all points — every theme, every white-label re-brand, every template, card, and component. All learners have a fundamental right to access education; nothing shipped from this project may trade access away.

**Design excellence is multi-medium, first-class.** Web, mobile, print, PDF, DOCX, presentations, and classroom projection are all primary targets — the token roles are the portability layer (README "Design excellence across media"). `print.css` owns ink; the deck/worksheet templates own slides and A4; DOCX follows the documented style mapping; projection keeps the ≥24px floor at 1080p. SVGs are styled through the SVG contract (`currentColor` + `.oak-svg-*` token classes) — never hardcoded fills, except fixed brand art.

Concretely, in everything built or changed here — and holistically: contrast is one clause, not the definition. Perceivable, operable, understandable, robust — all four, always:

- Every colour pairing ≥4.5:1 text / ≥3:1 non-text in **every** theme (light, dark, high-contrast, colour-safe) — validate with `preview/contrast-audit.html`.
- Keep the double focus ring on `:focus-visible` + transparent outline for forced-colors. Never remove or weaken it.
- Hit targets ≥44px (md 48px); `--sm` 36px only for dense desktop UI.
- State is never colour alone: pair fills with borders + icons + text.
- Quiet motion only (120/200ms), fully collapsed under `prefers-reduced-motion`.
- Honour OS preferences: `prefers-contrast`, `forced-colors`, `prefers-color-scheme`.
- Text on pastel fills: `--text-primary` at weight 400+, never 300 below 18px.
- Semantic HTML first: real `<button>`/`<a>`/`<label>`, headings in order, lists as lists; ARIA only to fill genuine gaps.
- Keyboard: everything reachable and operable, logical focus order, no traps, visible skip links.
- Forms: real labels, `alt` text (empty for decorative), `aria-describedby` wiring, errors that say what happened and how to fix it.
- Announce dynamic changes (`role="status"`/`"alert"`); no unexpected context shifts.
- Reflow: usable at 400% zoom / 320px width without loss; `--measure-prose` for readable line lengths.
- Understandable: plain language, sentence case, age-appropriate reading level (Oak voice); consistent patterns across screens.
- No time limits on learning tasks; performance is access — fast on low-end devices.
- The white-label contract (`brand.css`) carries these obligations with it: a re-brand that fails the audit is not done.
- `preview/a11y-charter.html` is the canonical split of what the system guarantees vs what every build must still do.
