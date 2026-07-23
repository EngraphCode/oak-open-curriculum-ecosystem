// Loads this design system into the template. In a consuming project, point
// base at the bound DS folder relative to this file (e.g. '_ds/<folder>' at
// the project root, '../_ds/<folder>' one level down) — one line to edit.
(() => {
  const base = '../..';
  for (const p of ["fonts/fonts.css","_ds_bundle.css","styles.css"]) {
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = base + '/' + p;
    document.head.appendChild(l);
  }
  // This DS is tokens + class-library only (zero JS components), so the JS
  // bundle is not loaded here — it throws on pages with no component mounts.
  // If a future sync ships components, restore the _ds_bundle.js script load.
  // The 2026-07-23 theme-enhancements overlay was retired at landing: its
  // token changes live at source in colors_and_type.css (MCP-132).
})();
