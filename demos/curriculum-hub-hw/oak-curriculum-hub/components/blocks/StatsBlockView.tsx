import type { ReactElement } from 'react';

import type { StatsBlock } from '@/lib/blocks/types';

/**
 * Renders a {@link StatsBlock} as an optional intro, a list of value/label
 * statistics, and an optional note. The stat-card grid fidelity lands in the
 * styling pass; the value leads each item so it reads first.
 */
export function StatsBlockView({ block }: { block: StatsBlock }): ReactElement {
  return (
    <section aria-label="Statistics">
      {block.intro !== undefined && <p>{block.intro}</p>}
      <ul>
        {block.items.map((item) => (
          <li key={item.label}>
            <strong>{item.value}</strong> {item.label}
          </li>
        ))}
      </ul>
      {block.note !== undefined && <p>{block.note}</p>}
    </section>
  );
}
