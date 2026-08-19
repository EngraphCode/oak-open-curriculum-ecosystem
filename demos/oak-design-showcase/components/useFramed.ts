'use client';

/**
 * Whether this document renders inside a frame — the ownership fact the
 * showcase's stages key on: a FRAMED document's presentation is driven by
 * its parent stage, while a standalone visit owns itself. A stable
 * client-only fact, read as an external store (never an effect setState)
 * so the server snapshot stays honest and the client render cascade-free.
 * Hoisted at its second consumer (the specimen strip reads the same fact
 * locally; consolidating that call site rides the next merge across the
 * open stack rather than widening this one).
 */
import { useSyncExternalStore } from 'react';

const subscribeNever = (): (() => void) => () => undefined;

export function useFramed(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => globalThis.self !== globalThis.top,
    () => false,
  );
}
