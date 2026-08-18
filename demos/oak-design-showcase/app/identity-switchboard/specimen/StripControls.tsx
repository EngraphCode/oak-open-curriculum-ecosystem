'use client';

/**
 * The specimen's own controls (owner word 2026-08-18): the utility strip's
 * decorative audience/help chrome becomes the page's real controls. Identity
 * re-skins THIS document — the binder is called with no target, so the sheet
 * lands in the host document (the same live-page pattern as the token
 * reference). Theme rides the kit's own runtime store and persists exactly
 * as it would in a product.
 *
 * Compact by the same word ("SMALL controls in the top black header"): the
 * radio group's legend and help text stay in the accessibility tree but
 * leave the visual row, and a visually-hidden polite status line announces
 * each change — the W3 mitigations at strip scale. The kit's 44px target
 * floor is contractual and holds here; small means visually quiet, never
 * short targets.
 */
import { useSyncExternalStore } from 'react';
import type { ReactElement } from 'react';

import { oakThemeStore } from '@oaknational/oak-design-react';

import { IdentityRadioGroup } from '../../../components/IdentityRadioGroup';
import { LabelledSelect } from '../../../components/LabelledSelect';
import { useIdentity } from '../../../components/brand-identity-binding';
import { IDENTITY_LABELS } from '../../../components/useIdentity';
import { THEME_LABELS, THEME_OPTIONS } from '../useFrameTheme';

export function StripControls(): ReactElement {
  const { identity, identities, setIdentity } = useIdentity();
  const theme = useSyncExternalStore(
    oakThemeStore.subscribe,
    oakThemeStore.getTheme,
    oakThemeStore.getServerSnapshot,
  );

  return (
    <div className="oak-cluster strip-controls">
      <IdentityRadioGroup
        idPrefix="specimen-strip"
        identity={identity}
        identities={identities}
        labels={IDENTITY_LABELS}
        onChange={setIdentity}
        compact
      />
      <LabelledSelect
        id="specimen-strip-theme"
        label="Theme"
        value={theme ?? ''}
        options={THEME_OPTIONS}
        labels={THEME_LABELS}
        placeholderLabel="&mdash;"
        disabled={theme === undefined}
        onChange={oakThemeStore.setTheme}
      />
      <p aria-live="polite" className="oak-visually-hidden">
        Showing {IDENTITY_LABELS[identity] ?? identity}
        {theme === undefined ? '' : ` · ${THEME_LABELS[theme] ?? theme}`}
      </p>
    </div>
  );
}
