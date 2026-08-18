'use client';

/**
 * The reference's live half: the two controls, and the subscription that
 * keeps the printed values honest.
 *
 * Identity re-skins the page ITSELF here — the binder is called with no
 * target, so the sheet lands in this document rather than a framed one, and
 * the page a reader is looking at is the page being re-skinned. Theme goes
 * through the kit's own runtime store, so the choice persists exactly as it
 * would in a product: this is a whole page, not a stage inside one.
 *
 * The identity and theme state are NOT wired to the value reader. They do
 * not need to be: the reader observes the DOM effects those controls cause —
 * a stylesheet link arriving, a `data-theme` attribute changing — so it is
 * correct for a change made from anywhere, including one this component
 * never saw.
 *
 * The table carries no live region. The status line announces the identity
 * and theme once per change; announcing four hundred changed cells would
 * make the page unusable with a screen reader, which is the failure a live
 * region exists to prevent.
 */
import { useMemo, useSyncExternalStore } from 'react';
import type { ReactElement } from 'react';

import { oakThemeStore } from '@oaknational/oak-design-react';
import type { OakThemeSnapshot } from '@oaknational/oak-design-react';

import { LabelledSelect } from '../../components/LabelledSelect';
import { useIdentity } from '../../components/brand-identity-binding';
import { IDENTITY_LABELS, type IdentitySlug } from '../../components/useIdentity';
import { THEME_LABELS, THEME_OPTIONS } from '../identity-switchboard/useFrameTheme';

import { FamilyNav } from './FamilyNav';
import { TokenTable, type IdentityDeltaSets } from './TokenTable';
import { liveTokenValues } from './live-token-values';
import { TIER_HEADINGS } from './tier-headings';
import type { TokenTierGroup } from './token-groups';

interface IdentityDeltaView {
  readonly identity: IdentitySlug;
  readonly properties: readonly string[];
}

export interface TokenReferenceProps {
  readonly groups: readonly TokenTierGroup[];
  readonly deltas: readonly IdentityDeltaView[];
  readonly tokenCount: number;
}

function TokenControls({
  identity,
  identities,
  setIdentity,
  theme,
  tokenCount,
}: {
  readonly identity: IdentitySlug;
  readonly identities: readonly IdentitySlug[];
  readonly setIdentity: (value: string) => void;
  readonly theme: OakThemeSnapshot | undefined;
  readonly tokenCount: number;
}): ReactElement {
  return (
    <div className="oak-grid tok-controls">
      <LabelledSelect
        id="tokens-identity-select"
        label="Identity"
        value={identity}
        options={identities}
        labels={IDENTITY_LABELS}
        onChange={setIdentity}
      />
      <LabelledSelect
        id="tokens-theme-select"
        label="Theme"
        value={theme ?? ''}
        options={THEME_OPTIONS}
        labels={THEME_LABELS}
        placeholderLabel="&mdash;"
        disabled={theme === undefined}
        onChange={oakThemeStore.setTheme}
      />
      <p aria-live="polite" className="oak-body-3 tok-status">
        Showing {IDENTITY_LABELS[identity]}
        {theme === undefined ? '' : ` · ${THEME_LABELS[theme]}`} · {tokenCount} tokens
      </p>
    </div>
  );
}

export function TokenReference({ groups, deltas, tokenCount }: TokenReferenceProps): ReactElement {
  const { identity, identities, setIdentity } = useIdentity();
  const theme = useSyncExternalStore(
    oakThemeStore.subscribe,
    oakThemeStore.getTheme,
    oakThemeStore.getServerSnapshot,
  );
  const values = useSyncExternalStore(
    liveTokenValues.subscribe,
    liveTokenValues.getSnapshot,
    liveTokenValues.getServerSnapshot,
  );

  const deltaSets = useMemo<IdentityDeltaSets>(
    () => new Map(deltas.map((delta) => [delta.identity, new Set(delta.properties)])),
    [deltas],
  );

  return (
    <>
      <TokenControls
        identity={identity}
        identities={identities}
        setIdentity={setIdentity}
        theme={theme}
        tokenCount={tokenCount}
      />

      <FamilyNav groups={groups} />

      {groups.map((group) => (
        <section key={group.tier} className="tok-tier">
          <h2 className="oak-heading-5">{TIER_HEADINGS[group.tier].title}</h2>
          <p className="oak-body-2 tok-tier-note">{TIER_HEADINGS[group.tier].note}</p>
          {group.families.map(({ family, tokens }) => (
            <TokenTable
              key={family}
              tier={group.tier}
              family={family}
              tokens={tokens}
              values={values}
              identity={identity}
              deltas={deltaSets}
            />
          ))}
        </section>
      ))}
    </>
  );
}
