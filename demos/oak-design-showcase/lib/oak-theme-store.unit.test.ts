/**
 * The store's change-notification contract: subscribers are re-notified on
 * writes through the setters AND on the runtime's own reactive trigger (the
 * `prefers-contrast` media change the oak-theme runtime re-derives its default
 * from) — a runtime-driven theme change must reach React, not only control
 * writes. Both collaborators are simple injected fakes (no-global-state-in-tests
 * / ADR-078).
 */
import { describe, expect, it, vi } from 'vitest';

import { createOakThemeStore } from './oak-theme-store';
import type {
  ContrastQuery,
  OakMotionMode,
  OakThemeName,
  OakThemeRuntime,
} from './oak-theme-store';

function fakeRuntime(): OakThemeRuntime {
  let theme: OakThemeName = 'light';
  let motion: OakMotionMode = 'system';
  return {
    get: () => theme,
    set: (t: OakThemeName) => {
      theme = t;
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

describe('createOakThemeStore setters', () => {
  it('notifies subscribers when a setter writes through to the runtime', () => {
    const runtime = fakeRuntime();
    const store = createOakThemeStore(
      () => runtime,
      () => undefined,
    );
    const listener = vi.fn();
    store.subscribe(listener);
    store.setTheme('dark');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getTheme()).toBe('dark');
  });

  it('ignores a value outside the runtime theme list without notifying', () => {
    const runtime = fakeRuntime();
    const store = createOakThemeStore(
      () => runtime,
      () => undefined,
    );
    const listener = vi.fn();
    store.subscribe(listener);
    store.setTheme('not-a-theme');
    expect(listener).not.toHaveBeenCalled();
    expect(store.getTheme()).toBe('light');
  });
});

describe('createOakThemeStore subscription lifecycle', () => {
  it('re-notifies subscribers when the contrast preference changes (runtime-driven change)', () => {
    const runtime = fakeRuntime();
    const contrast = fakeContrastQuery();
    const store = createOakThemeStore(
      () => runtime,
      () => contrast.query,
    );
    const listener = vi.fn();
    store.subscribe(listener);
    contrast.fire();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('attaches the media listener with the first subscriber and detaches with the last', () => {
    const runtime = fakeRuntime();
    const contrast = fakeContrastQuery();
    const store = createOakThemeStore(
      () => runtime,
      () => contrast.query,
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
