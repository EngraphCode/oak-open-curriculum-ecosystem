'use client';

import { useMemo, useState } from 'react';
import type { ReactElement } from 'react';

import type { SortableBlock } from '@/lib/blocks/types';

/** Swap the item at `index` with its neighbour `delta` away; a no-op out of bounds. Pure. */
export function reorder(order: readonly string[], index: number, delta: number): string[] {
  const target = index + delta;
  const next = [...order];
  if (target < 0 || target >= next.length) {
    return next;
  }
  const moved = next[index];
  next[index] = next[target];
  next[target] = moved;
  return next;
}

/** True when the current order matches the correct sequence exactly. Pure. */
export function isCorrectOrder(order: readonly string[], correct: readonly string[]): boolean {
  return order.length === correct.length && order.every((id, index) => id === correct[index]);
}

/**
 * Renders a {@link SortableBlock} as a re-orderable list checked against the
 * correct sequence. Ordering uses Up/Down buttons (keyboard-operable — a
 * drag-only control would exclude keyboard users, failing WCAG 2.2 AA); the
 * result is announced via a single always-present `role="status"` region (WCAG
 * 2.2 AA 4.1.3 Status Messages — a conditionally-mounted region can be missed by
 * assistive tech). Correctness is conveyed as text, not colour.
 */
export function SortableBlockView({ block }: { block: SortableBlock }): ReactElement {
  const [order, setOrder] = useState<readonly string[]>(() => block.items.map((item) => item.id));
  const [result, setResult] = useState('');
  // Derive an id -> text lookup once (O(n)) rather than an O(n) find per row per
  // render (which was O(n²) across the list).
  const textById = useMemo(() => new Map(block.items.map((item) => [item.id, item.text])), [block.items]);
  const textFor = (id: string): string => textById.get(id) ?? id;
  return (
    <section aria-label="Ordering activity">
      <p>{block.prompt}</p>
      <ol>
        {order.map((id, index) => (
          <li key={id}>
            {textFor(id)}
            <button
              type="button"
              aria-label={`Move ${textFor(id)} up`}
              disabled={index === 0}
              onClick={() => setOrder((current) => reorder(current, index, -1))}
            >
              Up
            </button>
            <button
              type="button"
              aria-label={`Move ${textFor(id)} down`}
              disabled={index === order.length - 1}
              onClick={() => setOrder((current) => reorder(current, index, 1))}
            >
              Down
            </button>
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={() => setResult(isCorrectOrder(order, block.correct) ? 'Correct order' : 'Not quite — try again')}
      >
        Check order
      </button>
      <p role="status">{result}</p>
    </section>
  );
}
