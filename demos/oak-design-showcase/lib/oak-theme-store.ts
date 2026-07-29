/**
 * Thin external-store adapter over the design system's `oakTheme` runtime
 * (public/oak-theme.js, inlined pre-paint by app/layout.tsx), shaped for
 * React's `useSyncExternalStore`: the runtime owns the state (localStorage +
 * html attributes); this module adds the change notification React needs to
 * re-render when a control writes through it. Server snapshots are undefined
 * by design — theme is client state, and server HTML stays theme-neutral.
 *
 * The runtime also re-derives its default when the OS contrast preference
 * changes (oak-theme.js attaches its own `prefers-contrast` listener) but
 * exposes no change event, so the store mirrors that same media trigger and
 * re-notifies subscribers — runtime-driven changes reach React, not only
 * writes through the setters.
 *
 * The store is a factory (`createOakThemeStore`) with the runtime resolver
 * injected, so tests build a store over a simple fake runtime instead of
 * mutating `window` (no-global-state-in-tests / ADR-078); the app-wide
 * instance below binds the real inlined runtime.
 *
 * Second in-estate copy of the hub's adapter shape (the estate linter bans
 * the kit reference's mount-gated useState pattern, so this shape is the
 * only landable one); typed here with the runtime's closed theme/motion
 * unions. Consolidation lane (canonical owner: the kit's React adapter
 * story) is Director-routed alongside lib/inline-script.ts.
 */

export type OakThemeName = 'light' | 'dark' | 'system' | 'high-contrast' | 'colour-safe';
export type OakMotionMode = 'system' | 'reduced' | 'full';

export interface OakThemeRuntime {
  get(): OakThemeName;
  set(t: OakThemeName): void;
  themes: OakThemeName[];
  motion: { get(): OakMotionMode; set(m: OakMotionMode): void; modes: OakMotionMode[] };
}

declare global {
  interface Window {
    oakTheme?: OakThemeRuntime;
  }
}

type Listener = () => void;

export interface OakThemeStore {
  subscribe(listener: Listener): () => void;
  getTheme(): OakThemeName | undefined;
  getMotion(): OakMotionMode | undefined;
  getServerSnapshot(): undefined;
  setTheme(theme: string): void;
  setMotion(mode: string): void;
  themeOptions(): OakThemeName[];
  motionOptions(): OakMotionMode[];
}

/** The slice of MediaQueryList the store needs — injectable so tests pass a
 *  simple fake instead of stubbing the global matchMedia (a real
 *  MediaQueryList satisfies it structurally). */
export interface ContrastQuery {
  addEventListener(type: 'change', listener: () => void): void;
  removeEventListener(type: 'change', listener: () => void): void;
}

function resolveGlobalContrastQuery(): ContrastQuery | undefined {
  return typeof globalThis.matchMedia === 'function'
    ? globalThis.matchMedia('(prefers-contrast: more)')
    : undefined;
}

/** Subscription set with the shared contrast-media listener attached while
 *  any subscriber exists — the same query the runtime itself reacts to. */
function createSubscription(resolveContrastQuery: () => ContrastQuery | undefined): {
  emit: () => void;
  subscribe: (listener: Listener) => () => void;
} {
  const listeners = new Set<Listener>();
  const emit = (): void => {
    for (const listener of listeners) {
      listener();
    }
  };
  let contrastQuery: ContrastQuery | undefined;
  const onContrastChange = (): void => {
    emit();
  };
  const subscribe = (listener: Listener): (() => void) => {
    if (listeners.size === 0) {
      contrastQuery = resolveContrastQuery();
      contrastQuery?.addEventListener('change', onContrastChange);
    }
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0 && contrastQuery !== undefined) {
        contrastQuery.removeEventListener('change', onContrastChange);
        contrastQuery = undefined;
      }
    };
  };
  return { emit, subscribe };
}

export function createOakThemeStore(
  resolveRuntime: () => OakThemeRuntime | undefined,
  resolveContrastQuery: () => ContrastQuery | undefined = resolveGlobalContrastQuery,
): OakThemeStore {
  const { emit, subscribe } = createSubscription(resolveContrastQuery);
  // Setters narrow the select's string through the runtime's own lists — no
  // assertion, and an unknown value (stale option, corruption) is a no-op
  // exactly as the runtime itself treats it.
  return {
    subscribe,
    getTheme: () => resolveRuntime()?.get() ?? undefined,
    getMotion: () => resolveRuntime()?.motion.get() ?? undefined,
    getServerSnapshot: () => undefined,
    setTheme: (theme: string): void => {
      const runtime = resolveRuntime();
      const next = runtime?.themes.find((t) => t === theme);
      if (next === undefined) {
        return;
      }
      runtime?.set(next);
      emit();
    },
    setMotion: (mode: string): void => {
      const runtime = resolveRuntime();
      const next = runtime?.motion.modes.find((m) => m === mode);
      if (next === undefined) {
        return;
      }
      runtime?.motion.set(next);
      emit();
    },
    themeOptions: () => resolveRuntime()?.themes ?? ['light'],
    motionOptions: () => resolveRuntime()?.motion.modes ?? ['system'],
  };
}

/** The app-wide store over the pre-paint inlined runtime. */
export const oakThemeStore: OakThemeStore = createOakThemeStore(() => globalThis.window?.oakTheme);
