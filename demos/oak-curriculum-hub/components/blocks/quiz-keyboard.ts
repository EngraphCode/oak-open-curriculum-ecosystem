'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, RefObject } from 'react';

/**
 * The keys the radio-group roving contract handles (ARIA APG Radio Group). Any
 * other key — Tab, characters, Enter — must fall through to the browser
 * untouched: on an unanswered group, treating "any key" as navigation selected
 * option 0 and revealed correctness just by tabbing through the page.
 */
export const RADIO_NAV_KEYS: ReadonlySet<string> = new Set([
  'ArrowDown',
  'ArrowRight',
  'ArrowUp',
  'ArrowLeft',
  'Home',
  'End',
]);

/**
 * Next selected option for an arrow, Home, or End keypress within a radio group,
 * or the current index for any other key. Down/Right advance, Up/Left retreat
 * (both wrap), Home selects the first and End the last (ARIA APG Radio Group).
 * Pure + module-scope so it is unit-testable.
 */
export function nextRadioIndex(key: string, index: number, count: number): number {
  if (key === 'ArrowDown' || key === 'ArrowRight') {
    return (index + 1) % count;
  }
  if (key === 'ArrowUp' || key === 'ArrowLeft') {
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

/** Everything a quiz question view needs to render one roving radio group. */
export interface QuizQuestionRovingState {
  selected: number | null;
  focusIndex: number;
  optionRefs: RefObject<(HTMLButtonElement | null)[]>;
  pick: (index: number) => void;
  keyNav: (event: KeyboardEvent<HTMLButtonElement>) => void;
}

/**
 * Owns one question's roving-radio state: selection, the roving focus target,
 * and the keyboard contract. Navigation keys select the next option and move
 * DOM focus to it (WCAG 2.2 AA 2.4.3 / 4.1.2); every other key stays with the
 * browser so page traversal cannot answer a question. Focus follows only
 * keyboard selection — a mouse click never yanks focus.
 */
export function useQuizQuestionRoving(count: number): QuizQuestionRovingState {
  const [selected, setSelected] = useState<number | null>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const focusOnSelect = useRef(false);

  useEffect(() => {
    if (!focusOnSelect.current || selected === null) {
      return;
    }
    focusOnSelect.current = false;
    optionRefs.current.at(selected)?.focus();
  }, [selected]);

  const pick = useCallback((index: number) => {
    setSelected(index);
  }, []);

  const keyNav = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (!RADIO_NAV_KEYS.has(event.key)) {
        return;
      }
      event.preventDefault();
      focusOnSelect.current = true;
      setSelected((current) => nextRadioIndex(event.key, current ?? 0, count));
    },
    [count],
  );

  return { selected, focusIndex: selected ?? 0, optionRefs, pick, keyNav };
}
