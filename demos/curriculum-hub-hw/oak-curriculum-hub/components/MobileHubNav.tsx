'use client';

import { useId, useRef, useState } from 'react';
import type { FocusEvent, KeyboardEvent, ReactElement } from 'react';

import { HubNavLink } from '@/components/HubNavLink';
import type { HubNavItem } from '@/components/HubNavLink';
import { HubSearch } from '@/components/HubSearch';

const menuLinkClass =
  'block rounded-oak-m2 px-[13px] py-[11px] text-[15px] font-semibold leading-none text-oak-black no-underline transition-colors hover:bg-oak-cream';

/** The open disclosure panel: stacked section links plus the hub search. */
function MenuPanel({
  id,
  items,
  onChoose,
}: {
  id: string;
  items: readonly HubNavItem[];
  onChoose: () => void;
}): ReactElement {
  return (
    <nav
      id={id}
      aria-label="Hub sections menu"
      className="shadow-oak-grey absolute inset-x-0 top-full flex flex-col gap-1 border-b-[3px] border-oak-black bg-white p-4"
    >
      {items.map((item) => (
        <HubNavLink key={item.label} item={item} className={menuLinkClass} onChoose={onChoose} />
      ))}
      <div className="mt-2">
        <HubSearch label="Hub search (menu)" />
      </div>
    </nav>
  );
}

/**
 * Small-viewport hub navigation (`md:hidden`; the inline nav and search hide
 * below `md:`): a disclosure button toggling a full-width panel with the
 * section links and the hub search. A disclosure, not a modal — no focus trap;
 * Escape closes and returns focus to the toggle; choosing a link closes (the
 * APG disclosure-navigation shape). Cures the SC 1.4.10 reflow failure of the
 * inline nav at 320px.
 */
export function MobileHubNav({ items }: { items: readonly HubNavItem[] }): ReactElement {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Escape' && open) {
      setOpen(false);
      toggleRef.current?.focus();
    }
  };
  // Close when focus leaves the disclosure entirely (APG disclosure-navigation);
  // unlike Escape, focus is NOT pulled back — the user is already moving on.
  const onFocusOut = (event: FocusEvent<HTMLDivElement>): void => {
    const next = event.relatedTarget;
    if (open && !(next instanceof Node && event.currentTarget.contains(next))) {
      setOpen(false);
    }
  };
  return (
    <div className="md:hidden" onKeyDown={onKeyDown} onBlur={onFocusOut}>
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Hub sections"
        className="flex h-10 w-10 items-center justify-center rounded-oak-m2 border-2 border-oak-black bg-white text-oak-black"
        onClick={() => setOpen((current) => !current)}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          aria-hidden="true"
        >
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>
      {open && <MenuPanel id={panelId} items={items} onChoose={() => setOpen(false)} />}
    </div>
  );
}
