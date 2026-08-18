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
 *
 * ONE ROW IS ONE LINE. A reference is only useful if you can see enough of
 * it at once to compare, so everything a row says is folded onto a single
 * line at wide: the value and the expression it came from sit side by side,
 * and the annotations are markers within their cells rather than second
 * lines under them.
 *
 * THE ROLES ARE NOT DECORATION. At narrow the stylesheet re-lays these rows
 * as stacked blocks, and changing a table element's `display` strips its
 * implicit ARIA role in every current browser — a silently de-tabled table,
 * which is worse than a table that scrolls. Stating each role explicitly
 * keeps the semantics identical in both layouts. They are redundant at wide
 * by design; that is the point.
 */
import type { ReactElement } from 'react';

import type { IdentitySlug } from '../../components/useIdentity';

import { IdentityDeltaCell, Specimen, TokenName, TokenValue } from './TokenCells';
import { sectionId, type CraftArea } from './craft-areas';
import type { LiveValue, LiveValues } from './live-token-values';
import type { CatalogueToken } from './token-catalogue';

export type IdentityDeltaSets = ReadonlyMap<IdentitySlug, ReadonlySet<string>>;

/**
 * Which families may share a row when the window splits into two columns.
 *
 * Two things disqualify a family, and they are different questions. A LONG
 * family wastes a whole column's height on the short one beside it. A family
 * with LONG NAMES cannot fit four columns of code into half the width, and
 * would push its value and identity columns behind a scrollbar — which is
 * the failure the narrow layout was reworked to remove, and it would be no
 * better for arriving on a big monitor.
 *
 * Name length is measured in characters because the names are set in a
 * monospace face, so characters ARE pixels here. The cap is generous
 * because the columns it guards are generous — the layout gives the rail's
 * width back at this breakpoint, so a paired column is 626px. Twenty-eight
 * is where that measured out: `--filter-icon-on-btn-disabled` at
 * twenty-nine characters wants 651px and is the one family in the system
 * that has to take a whole row for its name alone.
 */
const PAIRABLE_MAX_ROWS = 10;
const PAIRABLE_MAX_NAME = 28;

function needsFullWidth(tokens: readonly CatalogueToken[]): boolean {
  if (tokens.length > PAIRABLE_MAX_ROWS) {
    return true;
  }
  return tokens.some((token) => token.name.length > PAIRABLE_MAX_NAME);
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
  const owners = [...deltas]
    .filter(([, properties]) => properties.has(token.name))
    .map(([slug]) => slug);
  // The count rides on the row so the narrow layout can drop the whole
  // re-pointed line for the three hundred tokens no identity touches,
  // instead of spending a line on an em dash.
  return (
    <tr data-token={token.name} data-owners={owners.length} role="row">
      <th scope="row" className="tok-name" role="rowheader">
        <TokenName token={token} />
      </th>
      <td className="tok-specimen" role="cell">
        <Specimen token={token} />
      </td>
      <td className="tok-value" role="cell">
        <TokenValue token={token} value={value} expression={expression} />
      </td>
      <td className="tok-owners-cell" role="cell">
        {/* Named for a screen reader only where the column header is not
            there to do it — the narrow layout hides the header row, and
            this label hides itself again at wide, so neither width has to
            hear the name twice. */}
        <span className="oak-visually-hidden tok-owners-label">Re-pointed by </span>
        <IdentityDeltaCell owners={owners} identity={identity} />
      </td>
    </tr>
  );
}

/** The column names. Hidden by the narrow band, where the columns they name
 *  no longer exist as columns. */
function TokenTableHead(): ReactElement {
  return (
    <thead role="rowgroup">
      <tr role="row">
        <th scope="col" role="columnheader">
          Token
        </th>
        <th scope="col" role="columnheader">
          Applied
        </th>
        <th scope="col" role="columnheader">
          Value here
        </th>
        <th scope="col" role="columnheader">
          Re-pointed by
        </th>
      </tr>
    </thead>
  );
}

interface TokenTableProps {
  readonly area: CraftArea;
  readonly family: string;
  readonly tokens: readonly CatalogueToken[];
  readonly values: LiveValues;
  readonly identity: IdentitySlug;
  readonly deltas: IdentityDeltaSets;
}

export function TokenTable({
  area,
  family,
  tokens,
  values,
  identity,
  deltas,
}: TokenTableProps): ReactElement {
  const headingId = sectionId(area, family);
  return (
    <section className="tok-family" data-wide={needsFullWidth(tokens) ? 'true' : undefined}>
      <h3 className="oak-heading-6" id={headingId}>
        <span className="oak-code-2-bold">--{family}-*</span>{' '}
        <span className="oak-body-3 tok-count">
          {tokens.length} {tokens.length === 1 ? 'token' : 'tokens'}
        </span>
      </h3>
      {/* The safety net for the middle widths, where four columns of code
          text no longer fit but the rows have not yet stacked: the table
          scrolls HERE rather than taking the page sideways (SC 1.4.10
          reflow). It is a focus stop for the reason the kit gives its own
          scrollable `pre` one — in WebKit a scroll container that cannot be
          focused is pointer-only (SC 2.1.1) — and it is named so the stop
          says what it is. */}
      <div className="tok-scroll" tabIndex={0} role="group" aria-labelledby={headingId}>
        <table className="oak-table tok-table" role="table">
          <TokenTableHead />
          <tbody role="rowgroup">
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
