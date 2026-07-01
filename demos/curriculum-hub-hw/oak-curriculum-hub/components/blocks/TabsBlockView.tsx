'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactElement } from 'react';

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

/** The active tab's panel: `role="tabpanel"` labelled by its owning tab. */
function TabPanelView({ panel, panelKey }: { panel: TabPanel; panelKey: string }): ReactElement {
  return (
    <div role="tabpanel" id={`panel-${panelKey}`} aria-labelledby={`tab-${panelKey}`} tabIndex={0}>
      {panel.paras.map((para) => (
        <p key={para}>{para}</p>
      ))}
      {panel.example !== undefined && <p>{panel.example}</p>}
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
  const count = block.tabs.length;
  const panel = block.tabs.at(active);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // Whether the last selection change came from the keyboard; only then do we
  // move focus, so a mouse click does not yank focus unexpectedly.
  const focusOnSelect = useRef(false);
  // Stable per-tab keys so duplicate labels do not drop or mis-associate roving
  // state (a content key would collide on repeated labels).
  const keys = useMemo(() => block.tabs.map((_tab, index) => `tab-key-${index}`), [block.tabs]);

  useEffect(() => {
    if (!focusOnSelect.current) {
      return;
    }
    focusOnSelect.current = false;
    tabRefs.current.at(active)?.focus();
  }, [active]);

  return (
    <div>
      <div role="tablist">
        {block.tabs.map((tab, index) => (
          <button
            key={keys[index]}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            type="button"
            role="tab"
            id={`tab-${keys[index]}`}
            aria-controls={`panel-${keys[index]}`}
            aria-selected={index === active}
            tabIndex={index === active ? 0 : -1}
            onClick={() => setActive(index)}
            onKeyDown={(event) => {
              focusOnSelect.current = true;
              setActive((current) => nextTabIndex(event.key, current, count));
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {panel !== undefined && <TabPanelView panel={panel} panelKey={keys[active] ?? ''} />}
    </div>
  );
}
