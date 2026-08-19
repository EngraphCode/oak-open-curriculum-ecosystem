'use client';

/**
 * Children inline at wide, behind a kit disclosure at narrow (owner ruling
 * 2026-08-18: narrow navigation and control rows become a slide-out
 * disclosure instead of scrolling or clipping — everything visible when
 * open, nothing behind a gesture with no affordance when closed).
 *
 * Built on the kit's native `<details class="oak-disclosure">`, so the
 * closed/open contract needs no script of its own and works before
 * hydration: the server renders the NARROW shape (narrow first, wide
 * follows), and a wide viewport dissolves the wrapper at mount, restoring
 * the inline arrangement. A pre-hydration wide visitor has a working
 * native disclosure rather than a broken control — the enhancement is the
 * dissolution, not the behaviour.
 *
 * THE TRADE, priced deliberately: a wide first paint ships the CLOSED
 * disclosure and expands at hydration — a one-time layout shift on
 * desktop loads, and the disclosure form is permanent with JS off.
 * Narrow-first makes the phone's first paint the honest one. (CSS
 * `::details-content` forcing is newly Baseline and not yet safe
 * cross-engine, so the open state rides the prop instead.)
 *
 * Framedness's sibling: viewport width is a client-only fact, so it is
 * read through an external-store subscription (never an effect setState),
 * which keeps the server snapshot honest and the client render
 * cascade-free.
 */
import { useCallback, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { ReactElement, ReactNode } from 'react';

/** Adopt OPEN when the seam closes over the focused control: the commit
 *  closes the details before this effect runs, but style has not
 *  recalculated yet, so the control is still the activeElement — the
 *  synchronous re-render before paint keeps it visible (400% zoom and
 *  rotation cross the seam; focus continuity is the contract, review
 *  round 1). */
function useFocusHoldsOpen(
  wide: boolean,
  details: { readonly current: HTMLDetailsElement | null },
  setChosenOpen: (open: boolean) => void,
): void {
  useLayoutEffect(() => {
    const element = details.current;
    if (!wide && element !== null && element.contains(document.activeElement)) {
      setChosenOpen(true);
    }
  }, [wide, details, setChosenOpen]);
}

function useMediaQueryMatch(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void): (() => void) => {
      const list = globalThis.matchMedia?.(query);
      list?.addEventListener('change', onChange);
      return () => {
        list?.removeEventListener('change', onChange);
      };
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => globalThis.matchMedia?.(query).matches === true,
    () => false,
  );
}

export function NarrowDisclosure({
  summary,
  wideQuery,
  className,
  children,
}: {
  /** The closed state's whole promise — name the contents, not "menu". */
  readonly summary: string;
  /** The media query at which the wrapper dissolves and children render
   *  inline — the same seam the surrounding layout band uses. */
  readonly wideQuery: string;
  readonly className?: string;
  readonly children: ReactNode;
}): ReactElement {
  const wide = useMediaQueryMatch(wideQuery);
  // The user's own narrow open/closed choice, kept OUTSIDE the element so
  // crossing the seam and back restores it.
  const [chosenOpen, setChosenOpen] = useState(false);
  const details = useRef<HTMLDetailsElement | null>(null);
  useFocusHoldsOpen(wide, details, setChosenOpen);
  // ONE mounted <details> at every width — never a swap to a fragment.
  // Remounting on the seam destroys focus (measured: a focused control
  // dropped to BODY) and the open state, and the seam is crossed by
  // accessibility paths (400% browser zoom, tablet rotation), not only
  // window dragging. At wide the wrapper DISSOLVES in CSS instead:
  // display: contents hands the children to the surrounding layout and
  // the summary leaves the tree, while the forced open keeps the panel
  // rendered.
  const classes = ['oak-disclosure', className, wide ? 'narrow-disclosure-dissolved' : undefined]
    .filter((name) => name !== undefined)
    .join(' ');
  return (
    <details
      ref={details}
      className={classes}
      open={wide ? true : chosenOpen}
      onToggle={(event) => {
        if (!wide) {
          setChosenOpen(event.currentTarget.open);
        }
      }}
    >
      <summary>{summary}</summary>
      {children}
    </details>
  );
}
