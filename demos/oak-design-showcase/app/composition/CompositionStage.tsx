'use client';

/**
 * The composition demo's stage (owner spec 2026-08-18): one embedded
 * exhibit of neutral region boxes, one parent control for the example
 * layout and one for the ground (light/dark only). Both controls write
 * presentation data onto the framed canvas IN PLACE — `data-layout`
 * selects one of the four maps in the exhibit's own stylesheet,
 * `data-theme` flips the ground — so the boxes visibly re-arrange with
 * nothing reloading and the markup byte-identical throughout. The switch
 * is instantaneous by design (the vestibular ruling: no layout
 * animation).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';

import { IdentityRadioGroup } from '../../components/IdentityRadioGroup';
import {
  COMPOSITION_LAYOUTS,
  EXHIBIT_THEMES,
  EXHIBIT_THEME_OPTIONS,
  LAYOUT_OPTIONS,
  isCompositionLayout,
  isExhibitTheme,
  type CompositionLayout,
  type ExhibitTheme,
} from './frame/layouts';

const FRAME_SRC = '/composition/frame';

function applyExhibitState(
  frame: HTMLIFrameElement | null,
  layout: CompositionLayout,
  theme: ExhibitTheme,
): void {
  // Null-check, never instanceof: the canvas lives in the FRAME's realm,
  // where it is an instance of the frame's own HTMLElement class — a
  // parent-realm instanceof silently rejects every cross-document node.
  // Theme lands on the frame's ROOT (light-dark() resolves against the
  // declaring element's scheme, so a subtree attribute cannot flip
  // :root-declared tokens); layout on the canvas.
  const doc = frame?.contentDocument;
  const canvas = doc?.querySelector<HTMLElement>('[data-composition-frame]');
  if (doc !== null && doc !== undefined && canvas !== null && canvas !== undefined) {
    canvas.dataset['layout'] = layout;
    doc.documentElement.dataset['theme'] = theme;
  }
}

function StageControls({
  layout,
  theme,
  setLayout,
  setTheme,
}: {
  readonly layout: CompositionLayout;
  readonly theme: ExhibitTheme;
  readonly setLayout: (value: string) => void;
  readonly setTheme: (value: string) => void;
}): ReactElement {
  return (
    <div className="comp-controls">
      <IdentityRadioGroup
        idPrefix="composition-layout"
        legend="Example layout"
        helpText="Arrow keys switch the layout instantly — the markup never changes."
        identity={layout}
        identities={LAYOUT_OPTIONS}
        labels={COMPOSITION_LAYOUTS}
        onChange={setLayout}
      />
      <IdentityRadioGroup
        idPrefix="composition-theme"
        legend="Theme"
        helpText="Light or dark ground."
        identity={theme}
        identities={EXHIBIT_THEME_OPTIONS}
        labels={EXHIBIT_THEMES}
        onChange={setTheme}
      />
    </div>
  );
}

export function CompositionStage(): ReactElement {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [layout, setLayoutState] = useState<CompositionLayout>('document');
  const [theme, setThemeState] = useState<ExhibitTheme>('light');

  useEffect(() => {
    applyExhibitState(frameRef.current, layout, theme);
  }, [layout, theme]);

  const setLayout = useCallback((value: string): void => {
    if (isCompositionLayout(value)) {
      setLayoutState(value);
    }
  }, []);
  const setTheme = useCallback((value: string): void => {
    if (isExhibitTheme(value)) {
      setThemeState(value);
    }
  }, []);

  return (
    <>
      <StageControls layout={layout} theme={theme} setLayout={setLayout} setTheme={setTheme} />
      <p aria-live="polite" className="oak-body-3 comp-status">
        Showing {COMPOSITION_LAYOUTS[layout]} · {EXHIBIT_THEMES[theme]}
      </p>
      <div className="comp-frame-stage">
        <iframe
          ref={frameRef}
          src={FRAME_SRC}
          title="Region canvas — the same markup under every layout"
          onLoad={() => {
            applyExhibitState(frameRef.current, layout, theme);
          }}
        />
      </div>
    </>
  );
}
