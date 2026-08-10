/* oak-theme.js — tiny theme switcher for the Oak design system.
   GENERATED from src/oak-theme.ts (tsc type-erasure only; comments survive).
   Edit the source, then run the workspace build and sync:runtime scripts —
   the committed root copy is byte-parity-gated by the workspace test suite.
   Themes: "system" (default — follows OS) | "light" | "dark" | "high-contrast" | "colour-safe".
   Persists to localStorage("oak-theme"); applies before first paint when
   loaded synchronously in <head> as a script element with src "oak-theme.js".
   (This comment must never contain a literal closing-script sequence: the file
   is documented for INLINE embedding, and the HTML parser ends an inline
   script element at the first such sequence regardless of JS context.)
   Access commitment: with no stored choice, an OS-level request for more
   contrast (prefers-contrast: more) gets the high-contrast theme
   automatically. An explicit user choice always wins.
   API: oakTheme.set("dark"), oakTheme.get(), oakTheme.choice(), oakTheme.themes.
   choice() returns the EXPLICIT choice (this session's set() or the persisted
   value) and null when none exists — get() collapses no-choice into the
   applied theme by design (pre-paint application needs a concrete value), so
   controls that must distinguish "chosen" from "applied" read choice().
   Motion axis (orthogonal to themes): oakTheme.motion.set("system"|"reduced"|"full"),
   .get(), .modes — persists to localStorage("oak-motion"); default follows the
   OS prefers-reduced-motion; explicit choice wins (school-managed devices).
   Motion has no choice(): "system" IS its no-choice semantic (no attribute). */

// Script-kind source by design: no imports/exports, so tsc emits a classic
// browser script (an ESM emit would break the synchronous pre-paint contract).
// Top-level declarations in a script file merge into the global scope — the
// Window augmentation below types this file's own assignment. The estate's
// consumer-facing oakTheme typing is @oaknational/oak-design-react's
// re-declared OakThemeRuntime (the single ambient declarer for consumers).

type OakThemeName = 'light' | 'dark' | 'system' | 'high-contrast' | 'colour-safe';
type OakMotionMode = 'system' | 'reduced' | 'full';

interface OakThemeRuntime {
  set(t: OakThemeName): void;
  get(): OakThemeName;
  choice(): OakThemeName | null;
  themes: OakThemeName[];
  motion: { set(m: OakMotionMode): void; get(): OakMotionMode; modes: OakMotionMode[] };
}

interface Window {
  oakTheme?: OakThemeRuntime;
}

(function (): void {
  const KEY = 'oak-theme';
  const THEMES: OakThemeName[] = ['system', 'light', 'dark', 'high-contrast', 'colour-safe'];
  // Equality-form membership so the raw storage string narrows without a
  // type assertion (ADR-153 §Membership Without Widening).
  function isThemeName(s: string | null): s is OakThemeName {
    return (
      s !== null &&
      THEMES.some(function (known) {
        return known === s;
      })
    );
  }
  // The applied-this-session value: keeps get() truthful when persistence
  // fails (private mode, quota) — applied state must never desync from get().
  let current: OakThemeName | null = null;
  function apply(t: OakThemeName | null): void {
    const el = document.documentElement;
    // Explicit choices (including "light") SET the attribute so they beat a
    // polarity-flipped brand default (see brand.css); no choice = no attribute.
    if (!t) {
      delete el.dataset.theme;
    } else {
      el.dataset.theme = t;
    }
  }
  function stored(): OakThemeName | null {
    try {
      const s = localStorage.getItem(KEY);
      // A persisted value from another version (or corruption) is treated as
      // absent — only current members of THEMES may reach data-theme.
      return isThemeName(s) ? s : null;
    } catch {
      return null;
    }
  }
  function auto(): OakThemeName | null {
    try {
      // Runtime guard kept for engines without matchMedia (the DOM lib types
      // it always-present; real browsers may not agree). The bare-identifier
      // typeof read is safe even where the global was never declared.
      if (typeof matchMedia === 'function' && matchMedia('(prefers-contrast: more)').matches) {
        return 'high-contrast';
      }
    } catch {
      return null;
    }
    return null;
  }
  function get(): OakThemeName {
    return current || stored() || auto() || 'system';
  }
  // The explicit choice, or null when none exists. The kit-contract accessor
  // (MCP-388): downstream stores render "no choice" honestly from this,
  // instead of re-deriving the storage read (the applied value from get()
  // cannot serve — the automatic contrast route also applies a theme).
  function choice(): OakThemeName | null {
    return current || stored();
  }
  function set(t: OakThemeName): void {
    if (!isThemeName(t)) {
      return;
    }
    try {
      localStorage.setItem(KEY, t);
    } catch {
      // Persistence is best-effort: the in-memory choice below still wins.
    }
    current = t;
    apply(t);
  }
  apply(stored() || auto() || null);
  // Follow a live OS contrast change until the user makes an explicit choice.
  // The in-memory choice counts: an explicit set() whose persistence threw
  // must still win over an automatic theme change.
  try {
    matchMedia('(prefers-contrast: more)').addEventListener('change', function () {
      if (!current && !stored()) {
        apply(auto() || null);
      }
    });
  } catch {
    // No matchMedia (or no event support): the pre-paint application above
    // already ran; live OS contrast changes simply will not re-apply.
  }
  // The motion axis is orthogonal to themes (see the header), so its whole
  // assembly — keys, membership, application, persistence — lives here and
  // only the finished API joins the runtime object below.
  function createMotion(): OakThemeRuntime['motion'] {
    const MKEY = 'oak-motion';
    const MODES: OakMotionMode[] = ['system', 'reduced', 'full'];
    function isMotionMode(s: string | null): s is OakMotionMode {
      return (
        s !== null &&
        MODES.some(function (known) {
          return known === s;
        })
      );
    }
    let mcurrent: OakMotionMode | null = null;
    function mapply(m: OakMotionMode | null): void {
      const el = document.documentElement;
      if (!m || m === 'system') {
        delete el.dataset.motion;
      } else {
        el.dataset.motion = m;
      }
    }
    function mget(): OakMotionMode {
      if (mcurrent) {
        return mcurrent;
      }
      try {
        const s = localStorage.getItem(MKEY);
        if (isMotionMode(s)) {
          return s;
        }
      } catch {
        return 'system';
      }
      return 'system';
    }
    function mset(m: OakMotionMode): void {
      if (!isMotionMode(m)) {
        return;
      }
      try {
        localStorage.setItem(MKEY, m);
      } catch {
        // Persistence is best-effort: the in-memory mode below still wins.
      }
      mcurrent = m;
      mapply(m);
    }
    mapply(mget());
    return { set: mset, get: mget, modes: MODES.slice() };
  }
  // Typed from the Window contract it fulfils, so the global declaration
  // above and the assembled value cannot drift apart.
  const runtime: NonNullable<Window['oakTheme']> = {
    set: set,
    get: get,
    choice: choice,
    themes: THEMES.slice(),
    motion: createMotion(),
  };
  window.oakTheme = runtime;
})();
