'use client';

/**
 * One family's tokens, as a table of applied specimens.
 *
 * Every specimen is a real element painted through `var(--the-token)`, so a
 * switch of identity or theme repaints the whole page through the cascade
 * with no re-render at all. What React adds is the TEXT of the value, which
 * the cascade cannot render. If this component's live read never arrived,
 * every swatch here would still be correct — only the printed numbers would
 * be stale. That is the right dependency direction for a page whose claim is
 * that presentation is data.
 */
import type { ReactElement } from 'react';

import { IDENTITY_LABELS, type IdentitySlug } from '../../components/useIdentity';

import type { LiveValue, LiveValues } from './live-token-values';
import { RESOLVED_PROPERTY, type SpecimenKind } from './specimen-kind';
import { sectionId } from './tier-headings';
import type { CatalogueToken, TokenTier } from './token-catalogue';

/** Specimen kinds whose paint only reads on real glyphs. */
const SAMPLE_TEXT: Readonly<Partial<Record<SpecimenKind, string>>> = {
  font: 'Ag',
  family: 'Ag',
  weight: 'Ag',
  'font-size': 'Ag',
  leading: 'Ag Ag Ag',
  tracking: 'AVAILABLE',
};

export type IdentityDeltaSets = ReadonlyMap<IdentitySlug, ReadonlySet<string>>;

/** The applied specimen. Decorative by construction: the value printed
 *  beside it carries the information, and four hundred announced sample
 *  glyphs would carry none. */
function Specimen({ token }: { readonly token: CatalogueToken }): ReactElement {
  if (token.kind === 'plain') {
    return (
      <>
        <span aria-hidden="true">&mdash;</span>
        <span className="oak-visually-hidden">No specimen for this token</span>
      </>
    );
  }
  return (
    <span
      className={`tok-paint tok-paint--${token.kind}`}
      data-resolve={RESOLVED_PROPERTY[token.kind]}
      aria-hidden="true"
    >
      {SAMPLE_TEXT[token.kind]}
    </span>
  );
}

/** Which identities re-point this token. The one currently shown is marked,
 *  so the rows that just changed are findable by eye after a switch — and
 *  named in text inside the marker, never by its outline alone. */
function IdentityDeltaCell({
  token,
  identity,
  deltas,
}: {
  readonly token: CatalogueToken;
  readonly identity: IdentitySlug;
  readonly deltas: IdentityDeltaSets;
}): ReactElement {
  const owners = [...deltas].filter(([, properties]) => properties.has(token.name));
  if (owners.length === 0) {
    return (
      <>
        <span aria-hidden="true">&mdash;</span>
        <span className="oak-visually-hidden">No identity re-points this token</span>
      </>
    );
  }
  return (
    <span className="oak-cluster oak-cluster--s tok-owners">
      {owners.map(([slug]) => (
        <span
          key={slug}
          className={slug === identity ? 'oak-tag oak-tag--white tok-owner-shown' : 'oak-tag'}
        >
          {IDENTITY_LABELS[slug]}
          {slug === identity && (
            <span className="oak-visually-hidden">
              {' '}
              &mdash; the identity shown, so this value is theirs
            </span>
          )}
        </span>
      ))}
    </span>
  );
}

function TokenRow({
  token,
  live,
  identity,
  deltas,
}: {
  readonly token: CatalogueToken;
  readonly live: LiveValue | undefined;
  readonly identity: IdentitySlug;
  readonly deltas: IdentityDeltaSets;
}): ReactElement {
  const value = live?.value ?? token.declared;
  const expression = live?.expression ?? token.declared;
  return (
    <tr data-token={token.name}>
      <th scope="row" className="tok-name">
        <span className="oak-code-3">{token.name}</span>
        {token.themes.length > 1 && (
          <span className="oak-body-4 tok-note">moves with the theme</span>
        )}
      </th>
      <td className="tok-specimen">
        <Specimen token={token} />
      </td>
      <td className="tok-value">
        <span className="oak-code-3 tok-value-now">{value}</span>
        {expression !== '' && expression !== value && (
          <span className="oak-code-4 tok-note">{expression}</span>
        )}
      </td>
      <td className="tok-owners-cell">
        <IdentityDeltaCell token={token} identity={identity} deltas={deltas} />
      </td>
    </tr>
  );
}

export interface TokenTableProps {
  readonly tier: TokenTier;
  readonly family: string;
  readonly tokens: readonly CatalogueToken[];
  readonly values: LiveValues;
  readonly identity: IdentitySlug;
  readonly deltas: IdentityDeltaSets;
}

export function TokenTable({
  tier,
  family,
  tokens,
  values,
  identity,
  deltas,
}: TokenTableProps): ReactElement {
  const headingId = sectionId(tier, family);
  return (
    <section className="tok-family">
      <h3 className="oak-heading-6" id={headingId}>
        <span className="oak-code-2-bold">--{family}-*</span>{' '}
        <span className="oak-body-3 tok-count">
          {tokens.length} {tokens.length === 1 ? 'token' : 'tokens'}
        </span>
      </h3>
      {/* Wide content scrolls in its own container so the PAGE never scrolls
          sideways (SC 1.4.10 reflow). The container is a focus stop for the
          reason the kit gives its own scrollable `pre` one: in WebKit a
          scroll container that cannot be focused is pointer-only (SC
          2.1.1), and it is named so the stop says what it is. */}
      <div className="tok-scroll" tabIndex={0} role="group" aria-labelledby={headingId}>
        <table className="oak-table tok-table">
          <thead>
            <tr>
              <th scope="col">Token</th>
              <th scope="col">Applied</th>
              <th scope="col">Value here</th>
              <th scope="col">Re-pointed by</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token) => (
              <TokenRow
                key={token.name}
                token={token}
                live={values.get(token.name)}
                identity={identity}
                deltas={deltas}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
