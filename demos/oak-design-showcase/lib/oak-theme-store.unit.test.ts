/**
 * The store's change-notification contract: subscribers are re-notified on
 * writes through the setters AND on the runtime's own reactive trigger (the
 * `prefers-contrast` media change the oak-theme runtime re-derives its default
 * from) — a runtime-driven theme change must reach React, not only control
 * writes. All collaborators are simple injected fakes (no-global-state-in-tests
 * / ADR-078): the fake runtime models the real one's contract, where set()
 * APPLIES the choice (the html data-theme attribute the store's applied-theme
 * resolver reads).
 */
import { describe, expect, it, vi } from 'vitest';

import { createOakThemeStore } from './oak-theme-store';
import type {
  ContrastQuery,
  OakMotionMode,
  OakThemeName,
  OakThemeRuntime,
} from './oak-theme-store';

function fakeRuntimeWorld(): {
  runtime: OakThemeRuntime;
  appliedTheme: () => string | undefined;
} {
  let applied: OakThemeName | undefined;
  let motion: OakMotionMode = 'system';
  const runtime: OakThemeRuntime = {
    get: () => applied ?? 'light',
    set: (t: OakThemeName) => {
      applied = t;
    },
    themes: ['light', 'dark'],
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

describe('createOakThemeStore snapshots and setters', () => {
  it('reports the no-choice state as the empty sentinel, never as light', () => {
    const world = fakeRuntimeWorld();
    const store = createOakThemeStore(
      () => world.runtime,
      () => undefined,
      world.appliedTheme,
    );
    expect(store.getTheme()).toBe('');
  });

  it('notifies subscribers and reports the applied theme after a setter write', () => {
    const world = fakeRuntimeWorld();
    const store = createOakThemeStore(
      () => world.runtime,
      () => undefined,
      world.appliedTheme,
    );
    const listener = vi.fn();
    store.subscribe(listener);
    store.setTheme('dark');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getTheme()).toBe('dark');
  });

  it('ignores a value outside the runtime theme list without notifying', () => {
    const world = fakeRuntimeWorld();
    const store = createOakThemeStore(
      () => world.runtime,
      () => undefined,
      world.appliedTheme,
    );
    const listener = vi.fn();
    store.subscribe(listener);
    store.setTheme('not-a-theme');
    expect(listener).not.toHaveBeenCalled();
    expect(store.getTheme()).toBe('');
  });
});

describe('createOakThemeStore subscription lifecycle', () => {
  it('re-notifies subscribers when the contrast preference changes (runtime-driven change)', () => {
    const world = fakeRuntimeWorld();
    const contrast = fakeContrastQuery();
    const store = createOakThemeStore(
      () => world.runtime,
      () => contrast.query,
      world.appliedTheme,
    );
    const listener = vi.fn();
    store.subscribe(listener);
    contrast.fire();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('attaches the media listener with the first subscriber and detaches with the last', () => {
    const world = fakeRuntimeWorld();
    const contrast = fakeContrastQuery();
    const store = createOakThemeStore(
      () => world.runtime,
      () => contrast.query,
      world.appliedTheme,
    );
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
