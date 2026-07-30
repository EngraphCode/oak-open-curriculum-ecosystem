---
fitness_line_target: 150
fitness_line_limit: 200
fitness_char_limit: 10000
fitness_line_length: 100
split_strategy: 'Extract axe-core rule reference to a companion file if rule-specific guidance grows'
---

# Accessibility Practice

This document defines the accessibility testing practice for
UI-shipping workspaces in this repository. It is the durable reference
that workspace READMEs and reviewer reading requirements link to.

**Architectural decision**: ADR-147

## Target Standard

**WCAG 2.2 Level AA** — the current W3C Recommendation (October 2023).

Key criteria for interactive MCP App views:

- 1.4.3 Contrast (Minimum) — 4.5:1 for text, 3:1 for large text
- 1.4.11 Non-text Contrast — 3:1 for UI components and graphical
  objects
- 2.1.1 Keyboard — all functionality operable via keyboard
- 2.4.7 Focus Visible — keyboard focus indicator is visible
- 2.4.11 Focus Not Obscured (Minimum) — focus not fully hidden
- 2.5.8 Target Size (Minimum) — 24×24 CSS pixels for pointer targets
- 4.1.2 Name, Role, Value — all UI components have accessible names

## Tooling

**Playwright** + **axe-core** (`@axe-core/playwright`) in headless CI.

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('passes WCAG 2.2 AA', async ({ page }) => {
  await page.goto(resourceUrl);
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

### Rule Configuration

- **Tags**: `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa` —
  the automatable subset of WCAG 2.2 AA. Manual review remains necessary
  for criteria that cannot be machine-verified
- **No `skipRules`** — zero-tolerance per ADR-147
- **No `disableRules`** in any mode a rule's criterion applies to —
  violations there must be resolved, not suppressed; the ONLY sanctioned
  `disableRules` call is the forced-colours criterion scoping below
- **Rules run exactly where their criterion applies** — see the
  forced-colours scoping below

### Contrast rules under forced colours: criterion scoping

Every rule runs in every mode where its success criterion applies —
zero-tolerance is about the criterion, not the tool invocation. WCAG
1.4.3 measures the AUTHOR palette, so `color-contrast` runs fully in
the light and dark projects, where the author palette paints. Under
`forced-colors: active` the user's guaranteed system palette replaces
the author palette, so 1.4.3 has nothing of ours to measure there —
the rule is out of its criterion's scope, and the suite states that
with `disableRules(['color-contrast'])` on that mode only.

Independently, axe-core currently measures the wrong layer in that
mode ([axe-core#3978](https://github.com/dequelabs/axe-core/issues/3978),
open upstream bug): it reads the foreground via
`-webkit-text-fill-color`, which forced colours does not replace, and
compares it against the forced background — reporting
author-ink-on-forced-black ratios for text that demonstrably paints in
the forced palette (pixel-verified at 21:1 during MCP-368).

Two structural requirements keep the scoping honest:

1. The gate is `matchMedia('(forced-colors: active)')` — never a
   project name — so a dead emulation re-enables the rule (fails safe).
2. It pairs with a self-retiring assertion that fails the moment the
   upstream artefact disappears, so the measurement-bug half of the
   rationale cannot silently outlive its cause.

The worked form lives in the widget suite
(`tests/widget/oak-banner.spec.ts`). Any forced-colours project added
elsewhere in the estate meets the identical facts and uses this same
pattern.

### CI Requirements

- Tests must avoid real network calls — GitHub Actions runners do not
  have internet access for test execution
- Use Playwright's headless mode with Chromium (default)
- Cache Playwright browsers in CI for performance

## Theme-Aware Testing

Both light and dark themes must pass independently. If the token
system supports high-contrast modes, those must pass too.

```typescript
for (const theme of ['light', 'dark']) {
  test(`a11y passes in ${theme} theme`, async ({ page }) => {
    await page.goto(`${resourceUrl}?theme=${theme}`);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
```

## MCP App Testing — Two Required Levels

### Level 1: Resource-Level Accessibility Tests

Serve the HTML resource content directly to a Playwright page. Inject
design token CSS as a test fixture. Run axe-core.

This proves DOM accessibility in isolation. The injected CSS is a test
fixture — it does not prove correct token delivery through the MCP App
resource pipeline.

### Level 2: MCP App Integration Verification

Use upstream `basic-host` or a supported MCP Apps host to verify the
resource loads correctly with sandbox, CSP, `ui/initialize`, and
postMessage bridge.

This proves correct packaging and host integration. It does not
replace Level 1 — both levels are required.

## Gate Position

`test:a11y` runs in the canonical gate sequence after `test:ui`. The widget has
its own Playwright tests:
`test:widget:ui` and `test:widget:a11y` (using
`playwright.widget.config.ts`), which run against the Vite dev server
in both light and dark theme projects. See
[ADR-121](../architecture/architectural-decisions/121-quality-gate-surfaces.md)
for the coverage matrix.

## References

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [WAI-ARIA 1.3 Editor's Draft](https://w3c.github.io/aria/)
- [axe-core Rule Descriptions][axe-rules]
- [Inclusive Design Principles](https://inclusivedesignprinciples.info/)

[axe-rules]: https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md
