# demo-evidence

Rendered visual-match targets and evidence for the Curriculum Hub demo build.

## Canonical visual-target renders

The `*-canonical-render.png` (full page) and `*-canonical-render-abovefold.png` (header/hero
viewport) files are the **visual-match targets** for the two canonical Hub pages that ship **no
in-export screenshot** — `Oak Hub.dc.html` and `Oak Standards.dc.html`. (Oak Course and the
Learning Framework already have in-export targets: `../claude-design-canonical-export/screenshots/`
`coursemap.png` / `check.png` / `framework-img.png`.)

- `hub-canonical-render.png`, `hub-canonical-render-abovefold.png`
- `standards-canonical-render.png`, `standards-canonical-render-abovefold.png`

### Regenerating them

Re-runnable render script (the render arm of the canonical-export sync loop — fresh export →
re-run → re-diff):

```bash
node demos/curriculum-hub-hw/tools/render-canonical-targets.cjs            # 1440px CSS (§D standard)
node demos/curriculum-hub-hw/tools/render-canonical-targets.cjs --width 1280   # another width
```

The renders are captured at a **1440px CSS layout width** (the §D matched-width standard) at
`deviceScaleFactor 2`, so the PNGs are 2880px wide — the pixel size is 2× resolution, **not** the
layout width. Compare fidelity against a live capture taken at the same **1440px CSS** width.
Override the width with `--width <n>` or `RENDER_WIDTH=<n>`.

The script lives at the demo-family / repo-tooling level (not inside the `oak-curriculum-hub`
workspace) because it uses Playwright, which is a repo-root dependency; adding Playwright as a demo
devDep would be a disproportionate heavy dep on a demo (Director-ratified placement). It serves the
canonical export over local HTTP and headless-renders the JS-hydrated `.dc.html` pages — see the
header comment in the script for why HTTP serving is required (the `file://` CORS-blocked fetch of
`data/quality-standards.json` was the prior "headless-blank" failure).
