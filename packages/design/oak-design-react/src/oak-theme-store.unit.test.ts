/**
 * The store's snapshot and notification contract. The theme snapshot is the
 * CHOICE model read through the runtime's own `choice()` accessor — never
 * the applied html attribute — with a two-level result: undefined = no
 * runtime (the consumers' hydration gate), '' = no explicit choice. The
 * choice-model semantics themselves (persisted choice, the automatic
 * contrast route staying no-choice, session choice surviving failed
 * persistence, membership validation of stored values) are the KIT's
 * behaviour, pinned by its own integration suite — re-asserting them here
 * through a fake runtime would test the fake. Subscribers are re-notified
 * on setter writes AND on the runtime's own reactive trigger (the
 * `prefers-contrast` media change). All collaborators are simple injected
 * fakes (no-global-state-in-tests / ADR-078).
 */
import { describe, expect, it, vi } from 'vitest';

import { createOakThemeStore } from './oak-theme-store';
import type {
  ContrastQuery,
  OakMotionMode,
  OakThemeName,
  OakThemeRuntime,
} from './oak-theme-store';

function fakeRuntimeWorld(seededChoice: OakThemeName | null = null): {
  runtime: OakThemeRuntime;
  appliedTheme: () => OakThemeName | undefined;
} {
  // Mirrors the real runtime's contract: set() APPLIES the choice to the
  // page and records it as the in-memory current choice, which choice()
  // reports ahead of any persisted (seeded) value.
  let current: OakThemeName | null = null;
  let applied: OakThemeName | undefined;
  let motion: OakMotionMode = 'system';
  const runtime: OakThemeRuntime = {
    set: (t: OakThemeName) => {
      current = t;
      applied = t;
    },
    get: () => applied ?? 'light',
    choice: () => current ?? seededChoice,
    themes: ['light', 'dark', 'high-contrast'],
    motion: {
      get: () => motion,
      set: (m: OakMotionMode) => {
        motion = m;
      },
      modes: ['system', 'reduced', 'full'],
    },
  };
  return { runtime, appliedTheme: () => applied };
}

function fakeContrastQuery(): { query: ContrastQuery; fire: () => void; listeners: () => number } {
  const changeListeners = new Set<() => void>();
  const query: ContrastQuery = {
    addEventListener: (_type, listener) => {
      changeListeners.add(listener);
    },
    removeEventListener: (_type, listener) => {
      changeListeners.delete(listener);
    },
  };
  return {
    query,
    fire: () => {
      for (const listener of changeListeners) {
        listener();
      }
    },
    listeners: () => changeListeners.size,
  };
}

function storeOver(
  runtime: OakThemeRuntime | undefined,
  resolveContrastQuery: () => ContrastQuery | undefined = () => undefined,
) {
  return createOakThemeStore(() => runtime, resolveContrastQuery);
}

describe('createOakThemeStore snapshots', () => {
  it('reports undefined for theme and motion when no runtime exists (hydration gate)', () => {
    const store = storeOver(undefined);
    expect(store.getTheme()).toBeUndefined();
    expect(store.getMotion()).toBeUndefined();
  });

  it('reports the no-choice state as the empty sentinel, never as light', () => {
    const { runtime } = fakeRuntimeWorld();
    expect(storeOver(runtime).getTheme()).toBe('');
  });

  it('forwards the runtime-reported explicit choice', () => {
    const { runtime } = fakeRuntimeWorld('dark');
    expect(storeOver(runtime).getTheme()).toBe('dark');
  });
});

describe('createOakThemeStore setters', () => {
  it('notifies subscribers, applies and reports the choice after a theme write', () => {
    const world = fakeRuntimeWorld();
    const store = storeOver(world.runtime);
    const listener = vi.fn();
    store.subscribe(listener);
    store.setTheme('dark');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getTheme()).toBe('dark');
    expect(world.appliedTheme()).toBe('dark');
  });

  it('ignores a value outside the runtime theme list without notifying', () => {
    const world = fakeRuntimeWorld();
    const store = storeOver(world.runtime);
    const listener = vi.fn();
    store.subscribe(listener);
    store.setTheme('not-a-theme');
    expect(listener).not.toHaveBeenCalled();
    expect(store.getTheme()).toBe('');
  });

  it('writes a motion mode through the motion axis and reflects it', () => {
    const world = fakeRuntimeWorld();
    const store = storeOver(world.runtime);
    const listener = vi.fn();
    store.subscribe(listener);
    store.setMotion('reduced');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getMotion()).toBe('reduced');
  });
});

describe('createOakThemeStore contrast subscription', () => {
  it('re-notifies subscribers when the contrast preference changes (runtime-driven change)', () => {
    const { runtime } = fakeRuntimeWorld();
    const contrast = fakeContrastQuery();
    const store = storeOver(runtime, () => contrast.query);
    const listener = vi.fn();
    store.subscribe(listener);
    contrast.fire();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('attaches the media listener with the first subscriber and detaches with the last', () => {
    const { runtime } = fakeRuntimeWorld();
    const contrast = fakeContrastQuery();
    const store = storeOver(runtime, () => contrast.query);
    expect(contrast.listeners()).toBe(0);
    const unsubscribeFirst = store.subscribe(vi.fn());
    const unsubscribeSecond = store.subscribe(vi.fn());
    expect(contrast.listeners()).toBe(1);
    unsubscribeFirst();
    expect(contrast.listeners()).toBe(1);
    unsubscribeSecond();
    expect(contrast.listeners()).toBe(0);
  });
});
