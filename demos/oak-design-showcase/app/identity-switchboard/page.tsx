'use client';

/**
 * The picker: one specimen, re-skinned in place while you watch.
 *
 * THE TRANSITION IS THE POINT (owner ruling 2026-08-10: the moment of change
 * is the key communicator of capability). So the frame is navigated EXACTLY
 * ONCE, at mount, and every identity change afterwards swaps the brand
 * stylesheet INSIDE the frame's own document. Nothing reloads; the DOM the
 * viewer is looking at is the same DOM before and after.
 *
 * That choice is also what makes the demonstration honest. An in-place
 * re-skin can only succeed if the markup is genuinely identity-invariant — if
 * any region needed different structure per brand, the swap would visibly
 * break rather than quietly cheat. The mechanism IS the proof.
 *
 * Driving the frame's `src` from the controls would be the other shape, and
 * it is the one to avoid: it is a reload wearing a switcher's clothes, it
 * discards the transition, and it proves nothing about invariance.
 *
 * The external link derives from CONTROL STATE, never from the frame's `src`:
 * under an in-place swap the frame never re-navigates, so its `src` stays
 * frozen at the mount-time identity and would send a viewer somewhere other
 * than what they are looking at.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';

import { LabelledSelect } from '../../components/LabelledSelect';
import { IDENTITY_LABELS } from '../../components/Switchboard';
import { useIdentity } from '../../components/brand-identity-binding';
import { BASE_IDENTITY, type IdentitySlug } from '../../components/useIdentity';

import './picker.css';

/** The frame always mounts at the base identity, so the first thing a viewer
 *  sees is the unbranded kit and every brand is arrived at by transition. */
const FRAME_SRC = `/identity-switchboard/specimen?brand=${BASE_IDENTITY}`;

function PickerControls({
  identity,
  identities,
  setIdentity,
}: {
  readonly identity: IdentitySlug;
  readonly identities: readonly IdentitySlug[];
  readonly setIdentity: (value: string) => void;
}): ReactElement {
  return (
    <div className="oak-cluster oak-cluster--l picker-controls">
      <LabelledSelect
        id="picker-identity-select"
        label="Identity"
        value={identity}
        options={identities}
        labels={IDENTITY_LABELS}
        onChange={setIdentity}
      />
      <a className="oak-link oak-body-2" href={`/identity-switchboard/specimen?brand=${identity}`}>
        Open this identity as a full page
      </a>
    </div>
  );
}

/** Readiness of the framed specimen as a resolvable document target.
 *
 *  Two paths flip readiness, and BOTH are load-bearing: the frame's load
 *  event can fire before hydration attaches the onLoad handler — under a
 *  dev server's slower hydration the frame loses that race every time, and
 *  a swap would silently target nothing (the production suite had passed
 *  the same code on timing alone). The mount-time check covers the
 *  already-loaded case; the specimen's identity-carrying wrapper is the
 *  readiness mark because a not-yet-navigated frame's about:blank document
 *  also reports itself complete. */
function useSpecimenFrame(): {
  readonly frameRef: React.RefObject<HTMLIFrameElement | null>;
  readonly resolveTarget: () => Document | null;
  readonly markReady: () => void;
} {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [frameReady, setFrameReady] = useState(false);

  const markReady = useCallback((): void => {
    setFrameReady(true);
  }, []);

  useEffect(() => {
    const readinessMark = frameRef.current?.contentDocument?.querySelector('[data-identity]');
    if (readinessMark !== null && readinessMark !== undefined) {
      setFrameReady(true);
    }
  }, []);

  // frameReady is the dependency, not decoration: the binder re-runs its
  // effect when this callback's identity changes, which is exactly the render
  // in which the frame's document first becomes reachable.
  const resolveTarget = useCallback(
    (): Document | null => (frameReady ? (frameRef.current?.contentDocument ?? null) : null),
    [frameReady],
  );

  return { frameRef, resolveTarget, markReady };
}

export default function IdentityPickerPage(): ReactElement {
  const { frameRef, resolveTarget, markReady } = useSpecimenFrame();
  const { identity, identities, setIdentity } = useIdentity(resolveTarget);

  return (
    <div className="oak-canvas" data-page="identity-picker">
      <header className="oak-region oak-container picker-head">
        <h1 className="oak-heading-4">One page, any identity</h1>
        <p className="oak-body-2 picker-lede">
          The panel below is a single rendered page. Changing the identity swaps only design data —
          the markup underneath never changes, and the page never reloads.
        </p>
      </header>

      <main id="main" className="oak-main oak-region oak-container" tabIndex={-1}>
        <PickerControls identity={identity} identities={identities} setIdentity={setIdentity} />

        <p aria-live="polite" className="oak-body-3 picker-status">
          Showing {IDENTITY_LABELS[identity]}
        </p>

        <iframe
          className="picker-stage"
          ref={frameRef}
          src={FRAME_SRC}
          title="Specimen page, re-skinned in place"
          onLoad={markReady}
        />
      </main>
    </div>
  );
}
