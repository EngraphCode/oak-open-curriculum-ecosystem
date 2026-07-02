'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, ReactElement } from 'react';

import type { TabPanel, TabsBlock } from '@/lib/blocks/types';

/**
 * Next active tab for an arrow, Home, or End keypress, or the current index for
 * any other key. Left and Right wrap; Home selects the first tab and End the
 * last. Pure + module-scope so it is unit-testable and so the JSX handler stays
 * a single-expression inline arrow (`jsx-no-bind`).
 */
export function nextTabIndex(key: string, index: number, count: number): number {
  if (key === 'ArrowRight') {
    return (index + 1) % count;
  }
  if (key === 'ArrowLeft') {
    return (index - 1 + count) % count;
  }
  if (key === 'Home') {
    return 0;
  }
  if (key === 'End') {
    return count - 1;
  }
  return index;
}

/**
 * The active tab's panel: `role="tabpanel"` labelled by its owning tab. Export-exact body copy and
 * the green "✓ Example" callout box.
 */
function TabPanelView({ panel, panelKey }: { panel: TabPanel; panelKey: string }): ReactElement {
  return (
    <div
      role="tabpanel"
      id={`panel-${panelKey}`}
      aria-labelledby={`tab-${panelKey}`}
      tabIndex={0}
      className="px-[22px] pb-6 pt-[22px]"
    >
      {panel.paras.map((para) => (
        <p key={para} className="mb-3 max-w-[64ch] text-[17px] font-light leading-[27px]">
          {para}
        </p>
      ))}
      {panel.example !== undefined && (
        <div className="mt-2 rounded-[10px] border-2 border-oak-green bg-oak-mint-subdued px-4 py-3.5">
          <p className="mb-1.5 text-[13px] font-bold uppercase leading-none tracking-[0.04em] text-oak-green">
            ✓ Example
          </p>
          <p className="text-[16px] font-light leading-6">{panel.example}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Renders a {@link TabsBlock} as a WAI-ARIA tablist: one panel visible at a
 * time, tabs are `role="tab"` with `aria-selected`/`aria-controls`, the panel is
 * `role="tabpanel"` labelled by its tab. Roving `tabIndex` plus arrow, Home, and
 * End keys move selection (the ARIA tabs keyboard contract, ARIA APG).
 * Selecting a tab by keyboard also moves DOM focus to the newly-active tab (WCAG
 * 2.2 AA 2.4.3 Focus Order / 4.1.2 Name, Role, Value) so keyboard focus never
 * strands on a `tabIndex=-1` element. `.at()` keeps the active-panel lookup
 * honest.
 */
export function TabsBlockView({ block }: { block: TabsBlock }): ReactElement {
  const [active, setActive] = useState(0);
  const panel = block.tabs.at(active);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // Whether the last selection change came from the keyboard; only then do we
  // move focus, so a mouse click does not yank focus unexpectedly.
  const focusOnSelect = useRef(false);
  // Stable per-tab keys so duplicate labels do not drop or mis-associate roving
  // state. The useId prefix keeps the derived DOM ids unique across the many
  // tabs blocks one course page renders — index-only ids repeat per block and
  // make aria-controls/aria-labelledby ambiguous for assistive technology.
  const baseId = useId();
  const keys = useMemo(
    () => block.tabs.map((_tab, index) => `${baseId}-tab-${index}`),
    [block.tabs, baseId],
  );

  useEffect(() => {
    if (!focusOnSelect.current) {
      return;
    }
    focusOnSelect.current = false;
    tabRefs.current.at(active)?.focus();
  }, [active]);

  return (
    <div className="overflow-hidden rounded-[14px] border-2 border-oak-black bg-white shadow-oak-lemon">
      <div role="tablist" className="flex flex-wrap border-b-2 border-oak-black bg-oak-black/[.03]">
        {block.tabs.map((tab, index) => (
          <TabButton
            key={keys[index]}
            label={tab.label}
            tabKey={keys[index] ?? ''}
            selected={index === active}
            refCallback={(node) => {
              tabRefs.current[index] = node;
            }}
            onSelect={() => setActive(index)}
            onKeyNav={(event) => {
              focusOnSelect.current = true;
              setActive((current) => nextTabIndex(event.key, current, block.tabs.length));
            }}
          />
        ))}
      </div>
      {panel !== undefined && <TabPanelView panel={panel} panelKey={keys[active] ?? ''} />}
    </div>
  );
}

/**
 * One presentational tab button. Only the active panel is rendered, so only the
 * selected tab carries `aria-controls` — a dangling reference to an unrendered
 * panel id is an ARIA defect, not a convenience. State and refs stay with the
 * parent (their owner); this receives plain callbacks.
 */
function TabButton({
  label,
  tabKey,
  selected,
  refCallback,
  onSelect,
  onKeyNav,
}: {
  label: string;
  tabKey: string;
  selected: boolean;
  refCallback: (node: HTMLButtonElement | null) => void;
  onSelect: () => void;
  onKeyNav: (event: KeyboardEvent<HTMLButtonElement>) => void;
}): ReactElement {
  return (
    <button
      ref={refCallback}
      type="button"
      role="tab"
      id={`tab-${tabKey}`}
      aria-controls={selected ? `panel-${tabKey}` : undefined}
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      onClick={onSelect}
      onKeyDown={onKeyNav}
      className={tabClasses(selected)}
    >
      {label}
    </button>
  );
}

/** Export-exact tab treatment: a 4px underline + white wash marks the selected tab. */
function tabClasses(selected: boolean): string {
  const base = 'border-b-4 px-[18px] py-3.5 text-[15px] leading-[1.3]';
  return selected
    ? `${base} border-oak-black bg-white font-bold`
    : `${base} border-transparent font-normal`;
}
