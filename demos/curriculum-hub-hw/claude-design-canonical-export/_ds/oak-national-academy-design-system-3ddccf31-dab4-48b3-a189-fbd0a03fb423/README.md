# Oak National Academy - Design System

> Our mission: to improve pupil outcomes and close the disadvantage gap by supporting teachers to teach, and pupils to access, a high-quality curriculum.

Oak National Academy is an independent, publicly funded body supported by the UK Department for Education. We offer free, adaptable curriculum plans and resources - from key stage 1 to key stage 4, every national curriculum subject, every unit, every lesson, in one place - plus AI tools that help teachers create, adapt and enhance lessons in minutes while keeping quality high and content safe. Everything is created by subject and curriculum experts, informed by the best available evidence, aligned to the national curriculum and tested by real teachers. It's flexible (a starting point to adapt, never a script to follow), independent and optional, and free - and always will be.

This design system captures Oak's brand voice, visual foundations, and component library so you can design product UI, marketing pages, decks and prototypes that feel unmistakably Oak.

## Canonical sources

| Resource | Link |
| --- | --- |
| 🎨 **Oak Design Kit** (Figma) | https://www.figma.com/design/YcWQMMhHPVVmc47cHHEEAl/Oak-Design-Kit?node-id=0-1 |
| 📦 **oak-components** repo (GitHub) | https://github.com/oaknational/oak-components |
| 📖 **oak-components** Storybook | https://components.thenational.academy/?path=/docs/docs-introduction--docs |
| 💻 **Oak-Web-Application** repo (GitHub) | https://github.com/oaknational/Oak-Web-Application |
| 📖 **Oak-Web-Application** Storybook | https://storybook.thenational.academy/?path=/docs/introduction--docs |

## Strategic goals (2026-29)

1. **Every school can deliver a world-class curriculum for every pupil.**
2. **Every teacher is equipped to teach brilliant lessons** that meet every pupil's needs.
3. **The education sector can create a range of innovative, safe tools and resources** from open content and data.

---

## Products represented

Oak ships several distinct surfaces, all captured in the source Figma file and the `oak-components` library. The ones relevant to design work:

| Product | Audience | Notes |
| --- | --- | --- |
| **Teacher website** (thenational.academy) | UK teachers | Browse & download lessons, quizzes, slides, worksheets. Marketing-style landing + deep content pages. |
| **Pupil journey** | Pupils (via school) | A linear quiz/video/worksheet flow - colourful, motivational, confetti backgrounds. |
| **Aila** | Teachers | AI lesson-assistant chat. Conversational, guardrailed. |
| **Studio** | Internal curriculum partners | Lesson-authoring tool. Question cards, resource reviews, and answer-type editors. |
| **Curriculum plans** | Teachers & heads | Interactive long-term plan explorer. |

The shared component library (`oak-components` on GitHub) is the canonical source for tokens - everything downstream consumes it. See "The `oak-components` library" below for how it's actually installed and themed in production.

---

## Sources used to build this system

- **Figma:** "Oak Design Kit" - the full design source of truth. Mounted as a read-only virtual filesystem for this project; not linked publicly.
- **Codebase:** [`oaknational/oak-components`](https://github.com/oaknational/oak-components) - the React component library that ships Oak's design tokens. Tokens under `src/styles/theme/*` were the primary reference for `colors_and_type.css`.
- **Brand voice PDF:** "Brand voice, messaging and style toolkit" (v2.0, November 2025) - extracted to `brand_voice.txt`.
- **Logos:** `RGB_acorn_black.svg`, `RGB_logo_core_black.svg` supplied directly; copied into `assets/`.
- **Fonts:** Lexend - Oak uses Lexend as its primary typeface. The upload `Lexend - download to install.zip` was not unpacked into this system; we load Lexend from Google Fonts instead. **⚠️ If you have the original font files, drop them into `fonts/` and swap the `@import` in `colors_and_type.css`.**
- **Iconography:** Icons are served from Oak's Cloudinary CDN, not bundled. Base URL + full map in `ICONOGRAPHY` below.

---

## The `oak-components` library

In production, Oak's UI is built from **[`@oaknational/oak-components`](https://www.npmjs.com/package/@oaknational/oak-components)** - a React + TypeScript component library (published to NPM, documented in [Storybook](https://components.thenational.academy)). It targets React 18 and Next.js 13.5+, and is styled with styled-components. This design system mirrors that library's tokens and components as framework-agnostic HTML/CSS so you can prototype without the full React stack - but if you're writing production Oak code, install the real package.

### Install & connect

```bash
pnpm add @oaknational/oak-components   # or npm i / yarn add
```

Latest published version: **2.40.0**. Peer dependencies you must already have in the host app:

| Peer | Required range |
|---|---|
| `react` | >= 18.2.0 |
| `react-dom` | >= 18.2.0 |
| `next` | >= 14.2.12 |
| `next-cloudinary` | >= 6.16.0 |
| `styled-components` | >= 5.3.11 |

Two env vars enable the Cloudinary-served icons/images (`OakIcon`, `OakImage`):

```bash
NEXT_PUBLIC_OAK_ASSETS_HOST=res.cloudinary.com
NEXT_PUBLIC_OAK_ASSETS_PATH=oak-web-application/image/upload
```

> This prototyping project can't consume the React package directly (no build step). It stays in sync by mirroring the package's tokens — verified 1:1 against `oak-components` `src/styles/theme/*` and the Figma file. When tokens change upstream, re-check `colors_and_type.css` against the new version.

### How it's set up in a real app

Components need three things to render correctly: a **theme**, **global styles**, and the **Lexend font**. The root layout wires them up:

```tsx
import { OakThemeProvider, oakDefaultTheme, OakGlobalStyle } from "@oaknational/oak-components";
import { Lexend } from "next/font/google";
const lexend = Lexend({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <OakGlobalStyle />
      <body className={lexend.className}>
        <OakThemeProvider theme={oakDefaultTheme}>{children}</OakThemeProvider>
      </body>
    </html>
  );
}
```

- **Theme** - `oakDefaultTheme` carries the semantic `uiColors` role map (e.g. `text-primary`, `bg-btn-primary`, `border-decorative3`) reproduced in `colors_and_type.css`. There's also a dark theme.
- **Fonts** - Lexend via `next/font/google` in production; we load it locally here (`fonts/`).
- **Images/icons** - gated behind two env vars, `NEXT_PUBLIC_OAK_ASSETS_HOST` and `NEXT_PUBLIC_OAK_ASSETS_PATH`, which compose the Cloudinary URL (`OakIcon` builds `https://{host}/{path}/{versioned-svg}`). The live host resolves to `res.cloudinary.com/oak-web-application` - the value we used to download `assets/icons/`.

### How the library is organised

Shared components live under `src/components/` in role-based folders - the same vocabulary this design system groups its cards by:

| Folder | What's in it |
| --- | --- |
| `typography` | All type components (`OakHeading`, `OakP`, `OakSpan`…) |
| `buttons` | Buttons and icon buttons (`OakPrimaryButton`, `OakTertiaryButton`…) |
| `form-elements` | Inputs, checkboxes, radios, form-styled buttons |
| `images-and-icons` | `OakIcon`, `OakImage`, SVG renderers |
| `messaging-and-feedback` | `OakInlineBanner`, `OakTagFunctional`, toasts, spinners |
| `layout-and-structure` | `OakBox`, `OakFlex`, `OakGrid` and layout primitives |
| `navigation` | Nav-role components |
| `presentational` | Primarily decorative components |
| `cookies` | Cookie banner/consent layouts |

**Internal components** (e.g. `InternalShadowRectButton`, `InternalShadowRoundButton`) are unexported building blocks that power the public ones - the button state specs in this system come straight from them. **Squad-specific components** live in their own folders or in the consuming repo.

### Contributing & releases (for reference)

The library uses [conventional commits](https://www.conventionalcommits.org/) + [semantic-release](https://github.com/semantic-release/semantic-release): `fix:` → patch, `feat:` → minor, `BREAKING CHANGE:` → major; `chore`/`docs`/`refactor` don't release. Changes go through a PR to `main` with at least one review. External code contributions aren't currently accepted.

### Licence

Code is **MIT**. Bundled documentation is © Oak National Academy under the **Open Government Licence v3.0**. Oak trademarks and logos are **not** covered by either - use them per the [Oak brand guidelines](https://support.thenational.academy/using-the-oak-brand). This matters when you reuse `assets/` logo files in your own work.

---

## CONTENT FUNDAMENTALS - how Oak writes

Oak's brand voice is **empowering, personable, and direct**. Every line should read like a warm, knowledgeable colleague in the staffroom - never corporate, never condescending.

### The three voice principles (from the brand toolkit)

1. **We empower teachers.** Copy celebrates teachers, not Oak. Reread and swap *we/our* → *you/your* wherever possible.
2. **We're personable.** Professional but human. Friendly, approachable, never reserved. Write how you'd speak aloud in a staffroom conversation.
3. **We're clear and direct.** Simple words, short sentences, always contract (*we're* not *we are*). Jargon is a barrier.

### Specific rules

- **Person:** First and second person. *You, us, we, our.* Never "Oak this, Oak that."
- **Contractions:** Always. *we're, don't, you'll, it's.*
- **Casing:** **Sentence case everywhere** - headings, buttons, page titles, lesson titles. Title case is called out as an accessibility barrier.
- **Tone:** Supportive, inclusive, never judgemental. Understanding of teachers' workload.
- **Emoji:** Not part of the brand. Don't use in product UI.
- **Pronouns for learners:** Always **pupils** - never students or learners.
- **Spelling:** British English. *Organisation, personalise, colour.* Americanisms are flagged in the style guide.
- **Nouns:** *Oak* or *Oak National Academy* (never ONA, Oak Academy, The National Academy).
- **AI:** Capitals. The AI lesson assistant is **Aila** (proper noun). Never "AILA" or "lesson planning assistant". Aila **supports** teachers; it does not **create** or **deliver** finished lessons. Teachers stay in control.
- **Keywords:** *pupils, resources, lessons, curriculum, classroom-ready, quality-assured, national curriculum-aligned, free.*
- **Things to avoid:** jargon, "catch-up" (use *address gaps in knowledge*), "students" (use *pupils*), "newly qualified teacher" (use *early career teacher / ECT*), title case headings.

### Sample phrasings to copy

> **Opening statement:** We're Oak, and we want to give you back hours of your week. We do that by giving you free resources and tools to help you prepare high-quality teaching for all your pupils.

> **Resources:** Designed by experts, our resources give you a strong starting point - whether you're creating new lessons, refreshing your approach, or solving a last-minute challenge - and they're all completely yours to adapt.

> **AI (Aila):** You guide Aila to create the content you want and need. Aila provides a solid foundation to build from and tailor to the needs of your pupils.

> **Pupils:** It only takes seconds to select and send resources such as videos, worksheets and quizzes to your pupils for them to complete.

See `brand_voice.txt` for the full toolkit, including the A–Z style guide.

---

## VISUAL FOUNDATIONS

Oak's visual language pairs a **warm, pastel palette** with **strong black outlines** and a signature **offset drop-shadow**. It feels hand-crafted rather than corporate - playful enough for pupils, professional enough for heads.

### Colour

- **Neutral-first core.** Black (#222) on white is the primary text surface. Oak green (`#287c34`) is the brand accent, used sparingly - mostly for brand marks and success states.
- **Pastel decorative palette.** Mint, aqua, lavender, pink, lemon, amber - six decorative families, each with a base colour, `30` very-subdued tint, `50` subdued tint, and `110` stronger hover. Used generously for full-bleed card backgrounds, illustration halos, pupil-journey scenes.
- **Lemon is the hero accent.** Oak's famous offset yellow shadow (`#ffe555`) shows up on buttons, cards, and focus indicators. It's the visual signature.
- **Navy for links**, red for errors, amber for warnings. A few saturated brights (`blue #374cf1`, `magenta`, `purple`, `teal`) only appear inside teaching resources (slides, quizzes).
- **No gradients.** Oak's brand is flat colour. Don't reach for blue→purple gradients.

### Typography

- **Lexend** for everything. Weights in use: 300 (body, very common), 400 (light headings), 600 (heading), 700 (bold emphasis). Letter-spacing is slightly positive on headings (`0.0115rem`) and slightly negative on body (`-0.005rem`).
- **Body default is 300 weight** - Oak leans on Lexend's lightest readable grade for paragraphs. Emphasis is 700, not 500/600.
- **Scale:** 12, 14, 16, 18, 20, 24, 32, 40, 48, 56px. Body is 18/28. Heading 1 is 56/64.
- Roboto Mono for code contexts.

### Iconography

- **Flat, stroke-based, black-on-transparent.** Not filled. Not coloured. See `ICONOGRAPHY` section.

### Spacing

- 4px grid. Common sizes: 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 72, 80.

### Borders & corner radii

- **Thick black borders** are the defining shape. 2–4px solid black is common on buttons, cards, and inputs.
- **Radii:** `xs:2, s:4, m:6, m2:8, l:16, xl:24`. Most components land on `m2 (8px)` or `l (16px)`. Circle = 100px.

### Shadows (Oak's signature)

Oak's shadow system is mostly **solid-colour offset shadows**, not Gaussian blurs:

- `drop-shadow-lemon` - `2px 2px 0 #ffe555` (buttons, cards, tiles)
- `drop-shadow-wide-lemon` - `4px 4px 0 #ffe555` (hover state)
- `drop-shadow-grey` - `4px 4px 0 #575757`
- `drop-shadow-centered-lemon` - `0 0 0 2px #ffe555` (focus rings)
- `drop-shadow-standard` - the only true blur, `0 8px 8px rgba(92,92,92,0.2)`

### Backgrounds

- **Solid pastel blocks** are the default for decorative sections - no gradients, no photos behind text.
- **Confetti SVG backgrounds** (pink/mint/lavender) power the pupil-journey pages.
- **Hand-drawn brand marks:** wonky straight lines, speech bubbles, diamond shapes, squiggly arrows. All supplied as SVGs under `assets/`.
- Full-bleed photography exists on marketing headers but is always paired with a coloured panel on the other half of the page.

### Animation & interaction

- **Quiet motion.** Transitions are short (120–200ms), fades and subtle transforms. No bounces, no parallax, no scroll-jacking.
- **Press state:** the offset shadow collapses, and the element translates `+2px, +2px` - as if you'd physically pressed it down. This is the signature interaction.
- **Hover state:** the offset shadow *widens* (from 2px → 4px) or darkens. Link hover = darker navy.
- **Focus:** visible yellow outline (`drop-shadow-centered-lemon` ring).

### Transparency & blur

Used sparingly. `blackSemiTransparent` (25% black) on modal overlays. No frosted glass / backdrop-filter. No opacity animations.

### Cards

- Thick black border (2–3px), `8px` or `16px` radius, `drop-shadow-lemon` or `drop-shadow-grey`.
- Internal padding usually `16–24px`.
- Pastel backgrounds (mint30 / lavender30, etc.) for categorisation.
- Subject cards carry a subject icon in a circular coloured chip.

### Layout

- Max content width \~1280px on marketing pages, narrower reading columns (\~640–720px).
- **Grid:** 12-column at desktop. Components auto-stack at breakpoints.
- Generous white space - Oak is not a dense dashboard product.
- Headers are tall (80–120px), footers are heavy and content-rich.

---

## ICONOGRAPHY

Oak does **not** use an icon font. Icons are flat SVGs served from **Cloudinary**, with a central registry in `oak-components/src/image-map.ts`.

### Accessing icons

Icon URLs follow this pattern:

```
https://res.cloudinary.com/oaknationalacademy/image/upload/{versioned-path}
```

For example:

- **home:** `https://res.cloudinary.com/oaknationalacademy/image/upload/v1699887218/icons/gvqxjxcw07ei2kkmwnes.svg`
- **arrow-right:** `https://res.cloudinary.com/oaknationalacademy/image/upload/v1707149070/icons/fv0z57zerrioft52dd9n.svg`

The full map is in `icons.json` (copied from the codebase). For prototypes, use the CDN URL directly - no local bundling needed.

### Icon style

- **Flat, black, stroke-based** - roughly 1.5–2px stroke.
- Single-coloured, usually recoloured with `filter` (Oak maintains `oakColorFilterTokens` for this - see `colors_and_type.css`).
- **Subject icons** (100+ subjects, art → maths → theology) are more illustrative: flat line drawings inside a circle.
- **Decorative marks** - speech bubbles, squiggly underlines, diamond shapes, burst/confetti - sit between icons and illustrations. They're the brand's visual "flavour."
- **Emoji:** never.
- **Unicode symbols:** never as icons - always use an SVG.

### Brand marks under `assets/`

- `logo-full-official.svg` - primary "Oak National Academy" wordmark + acorn
- `logo-acorn-official.svg` - standalone acorn (favicon / tight spaces)
- `logo-full-black.svg`, `logo-acorn-black.svg` - alternative black renders (extracted from Figma)
- `brand-speech-bubble.svg` - hand-drawn speech bubble, used behind pull-quotes
- `brand-line-straight.svg`, `brand-line-straight-2.svg` - hand-drawn underlines/dividers
- `brand-arrow-small.svg` - squiggle arrow for callouts
- `brand-shape-diamond.svg` - diamond decorative shape
- `brand-shape-noise.svg` - noise-pattern panel

### Substitutions we flag

- **Fonts:** Lexend is loaded from Google Fonts, not from the supplied `Lexend.zip`. Swap in real files if required by licensing.
- **Icons beyond those in `icons.json`:** use [Lucide](https://lucide.dev) (similar stroke weight and flat style) as the closest CDN match, and flag the substitution in a comment.

---

## File index (manifest)

```
README.md                 ← you are here
SKILL.md                  ← Agent-Skill descriptor (for Claude Code handoff)
colors_and_type.css       ← CSS variables + base classes (import in any HTML)
brand_voice.txt           ← Full extracted brand voice toolkit
icons.json                ← Cloudinary icon map (from oak-components/image-map.ts)

assets/                   ← Logos, brand marks, hand-drawn shapes
  logo-full-official.svg
  logo-acorn-official.svg
  logo-full-black.svg
  logo-acorn-black.svg
  favicon.svg
  brand-speech-bubble.svg
  brand-line-straight.svg / -2.svg
  brand-arrow-small.svg
  brand-shape-diamond.svg
  brand-shape-noise.svg

preview/                  ← Small HTML cards that populate the Design System tab
  colors-*.html, type-*.html, shadows-*.html, buttons-*.html, …

ui_kits/
  oak/                    ← One consolidated Oak UI Kit: full homepage (nav, hero, subjects, AI tools, curriculum, pupils, quote, newsletter, footer), modelled on thenational.academy and built from this system's tokens/components/icons

src/styles/theme/         ← Raw theme files imported from oak-components for reference
```

Start from `colors_and_type.css` when building anything new, open `ui_kits/oak/index.html` for a full product reference, and always verify the voice against `brand_voice.txt`.
