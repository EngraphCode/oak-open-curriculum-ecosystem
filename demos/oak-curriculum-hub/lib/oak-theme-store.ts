/**
 * Thin external-store adapter over the design system's `oakTheme` runtime
 * (public/oak-theme.js, inlined pre-paint by app/layout.tsx), shaped for
 * React's `useSyncExternalStore`: the runtime owns the state (localStorage +
 * html attributes); this module adds the change notification React needs to
 * re-render when a control writes through it. Server snapshots are undefined
 * by design — theme is client state, and server HTML stays theme-neutral.
 */

declare global {
  interface Window {
    oakTheme?: {
      get(): string;
      set(t: string): void;
      themes: string[];
      motion: { get(): string; set(m: string): void; modes: string[] };
    };
  }
}

type Listener = () => void;
const listeners = new Set<Listener>();

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getTheme(): string | undefined {
  return globalThis.window?.oakTheme?.get() ?? undefined;
}

export function getMotion(): string | undefined {
  return globalThis.window?.oakTheme?.motion.get() ?? undefined;
}

export function getServerSnapshot(): undefined {
  return undefined;
}

export function setTheme(theme: string): void {
  globalThis.window?.oakTheme?.set(theme);
  emit();
}

export function setMotion(mode: string): void {
  globalThis.window?.oakTheme?.motion.set(mode);
  emit();
}

export function themeOptions(): string[] {
  return globalThis.window?.oakTheme?.themes ?? ['light'];
}

export function motionOptions(): string[] {
  return globalThis.window?.oakTheme?.motion.modes ?? ['system'];
}
