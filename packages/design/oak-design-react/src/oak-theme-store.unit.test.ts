/**
 * The store's snapshot and notification contract. The theme snapshot is
 * the APPLIED model read through the runtime's get() (owner ruling
 * 2026-08-10: the control displays what is applied — the system default,
 * an automatic contrast route, or an explicit choice; there is no
 * page-default sentinel). undefined = no runtime (the consumers'
 * hydration gate). The applied-model semantics themselves (persisted
 * choice applied pre-paint, the automatic contrast route, membership
 * validation of stored values) are the KIT's behaviour, pinned by its own
 * integration suite — re-asserting them here through a fake runtime would
 * test the fake. All collaborators are simple injected fakes
 * (no-global-state-in-tests / ADR-078).
 */
import { describe, expect, it, vi } from 'vitest';

import { createOakThemeStore } from './oak-theme-store';
import type { OakMotionMode, OakThemeName, OakThemeRuntime } from './oak-theme-store';

function fakeRuntimeWorld(seededChoice: OakThemeName | null = null): {
  runtime: OakThemeRuntime;
  appliedTheme: () => OakThemeName | undefined;
} {
  // Mirrors the real runtime's contract: set() APPLIES the choice to the
  // page and records it as the in-memory current choice, which choice()
  // reports ahead of any persisted (seeded) value.
  let current: OakThemeName | null = null;
  // A persisted (seeded) choice is applied pre-paint by the real runtime,
  // so the fake boots with it applied too.
  let applied: OakThemeName | undefined = seededChoice ?? undefined;
  let motion: OakMotionMode = 'system';
  const runtime: OakThemeRuntime = {
    set: (t: OakThemeName) => {
      current = t;
      applied = t;
    },
    get: () => applied ?? 'system',
    choice: () => current ?? seededChoice,
    themes: ['system', 'light', 'dark', 'high-contrast'],
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

function storeOver(runtime: OakThemeRuntime | undefined) {
  return createOakThemeStore(() => runtime);
}

describe('createOakThemeStore snapshots', () => {
  it('reports undefined for theme, motion, and options when no runtime exists', () => {
    const store = storeOver(undefined);
    expect(store.getTheme()).toBeUndefined();
    expect(store.getMotion()).toBeUndefined();
    // The store fabricates no option values it cannot back (the recorded
    // options-fallbacks-to-undefined delta); consumers floor at their
    // hydration gate.
    expect(store.themeOptions()).toBeUndefined();
    expect(store.motionOptions()).toBeUndefined();
  });

  it('forwards the runtime option lists when a runtime exists', () => {
    const { runtime } = fakeRuntimeWorld();
    const store = storeOver(runtime);
    expect(store.themeOptions()).toEqual(['system', 'light', 'dark', 'high-contrast']);
    expect(store.motionOptions()).toEqual(['system', 'reduced', 'full']);
  });

  it('reports the applied system default in the no-choice state', () => {
    const { runtime } = fakeRuntimeWorld();
    expect(storeOver(runtime).getTheme()).toBe('system');
  });

  it('forwards the runtime-applied persisted choice', () => {
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

  it('writes a motion mode through the motion axis and reflects it', () => {
    const world = fakeRuntimeWorld();
    const store = storeOver(world.runtime);
    const listener = vi.fn();
    store.subscribe(listener);
    store.setMotion('reduced');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getMotion()).toBe('reduced');
  });

  it('stops notifying a listener after its unsubscribe cleanup runs', () => {
    const world = fakeRuntimeWorld();
    const store = storeOver(world.runtime);
    const removed = vi.fn();
    const retained = vi.fn();
    const unsubscribe = store.subscribe(removed);
    store.subscribe(retained);
    unsubscribe();
    store.setTheme('dark');
    // The retained listener proves the write notified — the removed
    // listener's silence is unsubscription, not a dead notifier.
    expect(removed).not.toHaveBeenCalled();
    expect(retained).toHaveBeenCalledTimes(1);
  });
});

describe('createOakThemeStore setter guards', () => {
  // The shared setter contract: a value outside the runtime's own list is a
  // no-op on BOTH axes — nothing written, nobody notified.
  it('ignores a value outside the runtime theme list without notifying', () => {
    const world = fakeRuntimeWorld();
    const store = storeOver(world.runtime);
    const listener = vi.fn();
    store.subscribe(listener);
    store.setTheme('not-a-theme');
    expect(listener).not.toHaveBeenCalled();
    expect(store.getTheme()).toBe('system');
  });

  it('ignores a value outside the runtime motion list without notifying', () => {
    const world = fakeRuntimeWorld();
    const store = storeOver(world.runtime);
    const listener = vi.fn();
    store.subscribe(listener);
    store.setMotion('not-a-mode');
    expect(listener).not.toHaveBeenCalled();
    expect(store.getMotion()).toBe('system');
  });
});
