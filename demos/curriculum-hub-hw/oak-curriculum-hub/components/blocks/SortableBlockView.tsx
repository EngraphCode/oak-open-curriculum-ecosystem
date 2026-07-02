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

/** The export's fixed result copy (block-independent in the source bindings). */
const RESULT_TEXT = {
  correct: '✓ Correct — that’s the order learning happens.',
  wrong: 'Not quite — adjust and check again.',
} as const;

// h-6: 24px min target height so the stacked pair meets WCAG 2.5.8 (20px circles intersected).
const ARROW_BUTTON =
  'flex h-6 w-7 items-center justify-center rounded-md border-2 border-oak-black bg-white text-[11px] disabled:opacity-40';

/** One white row: the item text plus its stacked ▲▼ move buttons. */
function SortableRow({
  text,
  index,
  count,
  onMove,
}: {
  text: string;
  index: number;
  count: number;
  onMove: (delta: number) => void;
}): ReactElement {
  return (
    <li className="flex items-center gap-3 rounded-[10px] border-2 border-oak-black bg-white p-[11px_13px]">
      <span className="flex-1 text-base leading-[22px] font-light">{text}</span>
      <span className="flex shrink-0 flex-col gap-[3px]">
        <button
          type="button"
          aria-label={`Move ${text} up`}
          disabled={index === 0}
          className={ARROW_BUTTON}
          onClick={() => onMove(-1)}
        >
          ▲
        </button>
        <button
          type="button"
          aria-label={`Move ${text} down`}
          disabled={index === count - 1}
          className={ARROW_BUTTON}
          onClick={() => onMove(1)}
        >
          ▼
        </button>
      </span>
    </li>
  );
}

/** The black "Check order" pill plus the always-present result status region. */
function CheckRow({
  checked,
  onCheck,
}: {
  checked: 'correct' | 'wrong' | null;
  onCheck: () => void;
}): ReactElement {
  return (
    <div className="flex flex-wrap items-center gap-3.5">
      <button
        type="button"
        className="shadow-oak-lemon rounded-lg border-2 border-oak-black bg-oak-black px-5 py-[11px] text-[15px] leading-none font-bold text-white"
        onClick={onCheck}
      >
        Check order
      </button>
      <p
        role="status"
        className={`text-[15px] leading-[1.3] font-bold ${checked === 'wrong' ? 'text-oak-red' : 'text-oak-green'}`}
      >
        {checked === null ? '' : RESULT_TEXT[checked]}
      </p>
    </div>
  );
}

/**
 * Renders a {@link SortableBlock} as the export's lemon activity card: ACTIVITY
 * pill + arrow hint, white rows with stacked ▲▼ buttons, and the black
 * "Check order" pill. Ordering uses buttons only (keyboard-operable — the
 * export's drag affordance is not reproduced, so the hint names the arrows);
 * the export's fixed result copy is announced via a single always-present
 * `role="status"` region (WCAG 2.2 AA 4.1.3), coloured AND worded by outcome.
 * Reordering clears a shown result (export behaviour).
 */
export function SortableBlockView({ block }: { block: SortableBlock }): ReactElement {
  const [order, setOrder] = useState<readonly string[]>(() => block.items.map((item) => item.id));
  const [checked, setChecked] = useState<'correct' | 'wrong' | null>(null);
  // Derive an id -> text lookup once (O(n)) rather than an O(n) find per row per
  // render (which was O(n²) across the list).
  const textById = useMemo(
    () => new Map(block.items.map((item) => [item.id, item.text])),
    [block.items],
  );
  const move = (index: number, delta: number): void => {
    setOrder((current) => reorder(current, index, delta));
    setChecked(null);
  };
  return (
    <section
      aria-label="Ordering activity"
      className="shadow-oak-lemon rounded-[14px] border-2 border-oak-black bg-oak-lemon-subdued p-[18px_18px_20px]"
    >
      <p className="mb-1 flex items-center gap-2">
        <span className="rounded-full bg-oak-black px-2.5 py-[5px] text-[11px] leading-none font-bold tracking-[0.04em] text-white">
          ACTIVITY
        </span>
        <span className="text-[13px] leading-none font-bold text-oak-grey">
          Use the arrow buttons to reorder
        </span>
      </p>
      <p className="mt-1.5 mb-3.5 text-[17px] leading-[25px] font-light">{block.prompt}</p>
      <ol className="mb-3.5 flex flex-col gap-2">
        {order.map((id, index) => (
          <SortableRow
            key={id}
            text={textById.get(id) ?? id}
            index={index}
            count={order.length}
            onMove={(delta) => move(index, delta)}
          />
        ))}
      </ol>
      <CheckRow
        checked={checked}
        onCheck={() => setChecked(isCorrectOrder(order, block.correct) ? 'correct' : 'wrong')}
      />
    </section>
  );
}
