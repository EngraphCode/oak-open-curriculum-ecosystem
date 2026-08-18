import type { ReactElement } from 'react';

import { TIER_HEADINGS, sectionId } from './tier-headings';
import type { TokenTierGroup } from './token-groups';

/**
 * The jump list. A four-hundred-row reference is only usable if a family is
 * reachable without scrolling past the ones before it.
 *
 * The tier labels here are deliberately NOT headings: the tier sections
 * below own those, and a second set would put every tier title in the
 * document outline twice. Each list is named by its label instead, which
 * gives a screen reader the same grouping without the duplicate landmarks.
 */
export function FamilyNav({
  groups,
}: {
  readonly groups: readonly TokenTierGroup[];
}): ReactElement {
  return (
    <nav aria-label="Token families" className="tok-nav">
      {groups.map((group) => {
        const labelId = `tokens-nav-t${String(group.tier)}`;
        return (
          <div key={group.tier} className="tok-nav-group">
            <p className="oak-body-3-bold tok-nav-label" id={labelId}>
              {TIER_HEADINGS[group.tier].title}
            </p>
            <ul className="oak-cluster oak-cluster--s tok-nav-list" aria-labelledby={labelId}>
              {group.families.map(({ family }) => (
                <li key={family}>
                  <a className="oak-link oak-code-3" href={`#${sectionId(group.tier, family)}`}>
                    --{family}-*
                  </a>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
