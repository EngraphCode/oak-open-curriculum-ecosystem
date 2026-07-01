'use client';

import { useMemo, useState } from 'react';
import type { ReactElement } from 'react';

import type { HotspotBlock } from '@/lib/blocks/types';

/**
 * Renders a {@link HotspotBlock} as a described image region plus a list of
 * spot buttons; selecting one reveals its title + text in a `role="status"`
 * panel. Buttons (not absolutely-positioned click targets) keep the hotspots
 * keyboard-operable and announced; `.at()` keeps the active lookup honest.
 */
export function HotspotBlockView({ block }: { block: HotspotBlock }): ReactElement {
  const [active, setActive] = useState(0);
  const spot = block.spots.at(active);
  // Stable per-spot keys so duplicate titles do not drop or mis-associate
  // roving state (a content key would collide on repeated titles).
  const keys = useMemo(() => block.spots.map((_entry, index) => `spot-${index}`), [block.spots]);
  return (
    <div>
      <div role="img" aria-label={block.placeholder} data-placeholder>
        {block.placeholder}
      </div>
      <ul>
        {block.spots.map((entry, index) => (
          <li key={keys[index]}>
            <button type="button" aria-pressed={index === active} onClick={() => setActive(index)}>
              {entry.title}
            </button>
          </li>
        ))}
      </ul>
      {spot !== undefined && (
        <div role="status">
          <p>{spot.title}</p>
          <p>{spot.text}</p>
        </div>
      )}
    </div>
  );
}
