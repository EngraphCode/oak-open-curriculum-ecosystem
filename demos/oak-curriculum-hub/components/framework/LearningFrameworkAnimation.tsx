'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';

import { FRAMEWORK_STAGES } from './stages';
import { walkStageIndex } from './framework-animation';
import { LearningFrameworkStatic } from './LearningFrameworkStatic';

/** How long each stage is highlighted before the walk-through advances. */
const PER_STAGE_MS = 2200;

/**
 * The motion-enhanced learning framework: the static frame with the active stage stepping through the
 * seven-stage walk-through on a `requestAnimationFrame` clock.
 *
 * Mounted client-only by {@link LearningFramework} — and ONLY when the user does not prefer reduced
 * motion — via a plain static import gated on `prefers-reduced-motion`. Dynamic import
 * (`next/dynamic({ ssr: false })`) is banned here by `@oaknational/no-dynamic-import`, so the static
 * import plus the reduced-motion gate is used instead. The gate defaults to reduced, so the server
 * render and first paint show the static baseline and this clock never runs on the server; there is
 * no hydration mismatch.
 *
 * A visible, keyboard-operable Play/Pause control satisfies WCAG SC 2.2.2 (Pause, Stop, Hide): the
 * walk-through auto-plays but every user can stop it — `prefers-reduced-motion` is an OS preference,
 * not the in-content mechanism 2.2.2 requires. Paused, the clock holds the current stage and resumes
 * from where it stopped (elapsed time is accumulated across pause/resume, not recomputed from mount).
 */
export default function LearningFrameworkAnimation(): ReactElement {
  const [activeStage, setActiveStage] = useState(0);
  const [playing, setPlaying] = useState(true);
  const elapsedRef = useRef(0);
  const lastTickRef = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) {
      return undefined;
    }
    let frame = 0;
    const tick = (now: number): void => {
      const last = lastTickRef.current ?? now;
      lastTickRef.current = now;
      elapsedRef.current += now - last;
      const next = walkStageIndex(elapsedRef.current, PER_STAGE_MS, FRAMEWORK_STAGES.length);
      setActiveStage((previous) => (previous === next ? previous : next));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      lastTickRef.current = null;
    };
  }, [playing]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setPlaying((previous) => !previous)}
        className="mb-3 inline-flex items-center gap-1.5 rounded-md border-2 border-oak-black bg-white px-3 py-1.5 text-sm font-semibold text-oak-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oak-navy"
      >
        {playing ? 'Pause animation' : 'Play animation'}
      </button>
      <LearningFrameworkStatic activeStage={activeStage} />
    </div>
  );
}
