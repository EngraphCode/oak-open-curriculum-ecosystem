'use client';

/**
 * A framed specimen scaled to fit its column: the iframe renders at the
 * canonical canvas width (DDR-009's primary comparison cell) and is
 * transform-scaled to the column's live width, so all three columns show
 * the same simulated viewport regardless of screen size.
 *
 * The export's inline resize script, rebuilt on the shared scale-fit hook
 * (useScaledViewport — the picker's stage is its other consumer). On load
 * the frame's document drops any persisted theme attribute so the three
 * columns stay comparable at page default.
 */
import { useRef } from 'react';
import type { ReactElement } from 'react';

import { DEFAULT_VIEWPORT_WIDTH } from '../../components/canonical-widths';
import { useScaledViewport } from '../../components/useScaledViewport';

export function ScaledFrame({
  src,
  title,
}: {
  readonly src: string;
  readonly title: string;
}): ReactElement {
  const stageRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  useScaledViewport(stageRef, iframeRef, DEFAULT_VIEWPORT_WIDTH);

  return (
    <div ref={stageRef} className="frame">
      <iframe
        ref={iframeRef}
        src={src}
        title={title}
        onLoad={() => {
          iframeRef.current?.contentDocument?.documentElement.removeAttribute('data-theme');
        }}
      />
    </div>
  );
}
