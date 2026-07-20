'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import type { ReactElement } from 'react';

import { oakThemeStore } from '@/lib/oak-theme-store';

import { LearningFrameworkStatic } from './LearningFrameworkStatic';
import LearningFrameworkAnimation from './LearningFrameworkAnimation';

/** Whether the user prefers reduced motion. Defaults to `true` until measured so the server render
 *  and first paint are motion-free (the accessible, safe default). */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    const query = globalThis.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = (): void => {
      setReduced(query.matches);
    };
    sync();
    query.addEventListener('change', sync);
    return () => {
      query.removeEventListener('change', sync);
    };
  }, []);
  return reduced;
}

/** The effective reduced-motion verdict on the data-motion axis semantics (the hub's CSS motion
 *  floor, app/globals.css): an explicit in-product choice wins in both directions; 'system' (or no
 *  runtime) defers to the OS preference. Pure and exported so the three-way priority is
 *  unit-testable without the store singleton. */
export function effectiveReducedMotion(osReduced: boolean, motion: string | undefined): boolean {
  if (motion === 'reduced') {
    return true;
  }
  if (motion === 'full') {
    return false;
  }
  return osReduced;
}

/** {@link effectiveReducedMotion} wired to the OS preference and the theme store. Without this, the
 *  axis would control CSS motion but not the requestAnimationFrame walk-through. */
function useEffectiveReducedMotion(): boolean {
  const osReduced = usePrefersReducedMotion();
  const motion = useSyncExternalStore(
    oakThemeStore.subscribe,
    oakThemeStore.getMotion,
    oakThemeStore.getServerSnapshot,
  );
  return effectiveReducedMotion(osReduced, motion);
}

/**
 * The Learning Framework embed: a progressive enhancement over the static seven-stage frame.
 *
 * The reduced-motion gate is what keeps the animation off the server: `reduced` defaults to `true`,
 * so the server render AND the first client paint show the static, fully accessible baseline, and the
 * animated walk-through only mounts client-side after the effect measures the preference. That is a
 * post-hydration update (no hydration mismatch), so — unlike `next/dynamic({ ssr: false })`, which is
 * banned here by `@oaknational/no-dynamic-import` — a plain static import is correct: the animation
 * never runs on the server, and the static frame is always the fallback, so accessibility never
 * depends on the animation.
 *
 * At Course-assembly this replaces the framework image block (`assets/learning-framework.png`) of the
 * "The learning framework" module — the image is the SSR baseline, this embed is the enhancement.
 */
export function LearningFramework(): ReactElement {
  const reducedMotion = useEffectiveReducedMotion();
  return reducedMotion ? <LearningFrameworkStatic /> : <LearningFrameworkAnimation />;
}
