/* oak-theme.js — tiny theme switcher for the Oak design system.
   Themes: "light" (default) | "dark" | "system" | "high-contrast" | "colour-safe".
   Persists to localStorage("oak-theme"); applies before first paint when
   loaded synchronously in <head> as a script element with src "oak-theme.js".
   (This comment must never contain a literal closing-script sequence: the file
   is documented for INLINE embedding, and the HTML parser ends an inline
   script element at the first such sequence regardless of JS context.)
   Access commitment: with no stored choice, an OS-level request for more
   contrast (prefers-contrast: more) gets the high-contrast theme
   automatically. An explicit user choice always wins.
   API: oakTheme.set("dark"), oakTheme.get(), oakTheme.themes.
   Motion axis (orthogonal to themes): oakTheme.motion.set("system"|"reduced"|"full"),
   .get(), .modes — persists to localStorage("oak-motion"); default follows the
   OS prefers-reduced-motion; explicit choice wins (school-managed devices). */
(function () {
  var KEY = 'oak-theme';
  var THEMES = ['light', 'dark', 'system', 'high-contrast', 'colour-safe'];
  // The applied-this-session value: keeps get() truthful when persistence
  // fails (private mode, quota) — applied state must never desync from get().
  var current = null;
  function apply(t) {
    var el = document.documentElement;
    // Explicit choices (including "light") SET the attribute so they beat a
    // polarity-flipped brand default (see brand.css); no choice = no attribute.
    if (!t) el.removeAttribute('data-theme');
    else el.setAttribute('data-theme', t);
  }
  function stored() {
    try {
      var s = localStorage.getItem(KEY);
      // A persisted value from another version (or corruption) is treated as
      // absent — only current members of THEMES may reach data-theme.
      return THEMES.indexOf(s) === -1 ? null : s;
    } catch (e) {
      return null;
    }
  }
  function auto() {
    try {
      if (window.matchMedia && matchMedia('(prefers-contrast: more)').matches)
        return 'high-contrast';
    } catch (e) {}
    return null;
  }
  function get() {
    return current || stored() || auto() || 'light';
  }
  function set(t) {
    if (THEMES.indexOf(t) === -1) return;
    try {
      localStorage.setItem(KEY, t);
    } catch (e) {}
    current = t;
    apply(t);
  }
  apply(stored() || auto() || null);
  // Follow a live OS contrast change until the user makes an explicit choice.
  // The in-memory choice counts: an explicit set() whose persistence threw
  // must still win over an automatic theme change.
  try {
    matchMedia('(prefers-contrast: more)').addEventListener('change', function () {
      if (!current && !stored()) apply(auto() || null);
    });
  } catch (e) {}
  window.oakTheme = { set: set, get: get, themes: THEMES.slice() };
  var MKEY = 'oak-motion';
  var MODES = ['system', 'reduced', 'full'];
  var mcurrent = null;
  function mapply(m) {
    var el = document.documentElement;
    if (!m || m === 'system') el.removeAttribute('data-motion');
    else el.setAttribute('data-motion', m);
  }
  function mget() {
    if (mcurrent) return mcurrent;
    try {
      var s = localStorage.getItem(MKEY);
      if (s && MODES.indexOf(s) !== -1) return s;
    } catch (e) {}
    return 'system';
  }
  function mset(m) {
    if (MODES.indexOf(m) === -1) return;
    try {
      localStorage.setItem(MKEY, m);
    } catch (e) {}
    mcurrent = m;
    mapply(m);
  }
  mapply(mget());
  window.oakTheme.motion = { set: mset, get: mget, modes: MODES.slice() };
})();
