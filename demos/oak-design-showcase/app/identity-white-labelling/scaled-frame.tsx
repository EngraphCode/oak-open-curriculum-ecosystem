'use client';

/**
 * A framed specimen scaled to fit its column: the iframe renders at the
 * canonical canvas width (DDR-009's primary comparison cell) and is
 * transform-scaled to the frame's live width, so all three columns show
 * the same simulated viewport regardless of screen size.
 *
 * The export's inline resize script, rebuilt as a real component: a
 * ResizeObserver drives the scale (no window listeners to leak), and on
 * load the frame's document drops any persisted theme attribute so the
 * three columns stay comparable at page default.
 */
import { useEffect, useRef } from 'react';
import type { ReactElement } from 'react';

/** The simulated viewport width inside every frame — the canonical canvas
 *  cell. Kept as data here (a client module cannot import the tools'
 *  Node-flavoured constants); the spec asserts equality with the canonical
 *  set so drift is loud. */
export const FRAME_VIEWPORT_WIDTH = 1440;

export function ScaledFrame({
  src,
  title,
}: {
  readonly src: string;
  readonly title: string;
}): ReactElement {
  const frameRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const iframe = iframeRef.current;
    if (frame === null || iframe === null) {
      return undefined;
    }
    // The component is the single source of the simulated viewport: it
    // sizes the iframe AND scales it, so the number cannot drift between
    // a stylesheet and this constant.
    iframe.style.width = `${FRAME_VIEWPORT_WIDTH}px`;
    iframe.style.height = `${(FRAME_VIEWPORT_WIDTH * 4) / 3}px`;
    const observer = new ResizeObserver(() => {
      const scale = frame.clientWidth / FRAME_VIEWPORT_WIDTH;
      iframe.style.transform = `scale(${scale})`;
    });
    observer.observe(frame);
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={frameRef} className="frame">
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
