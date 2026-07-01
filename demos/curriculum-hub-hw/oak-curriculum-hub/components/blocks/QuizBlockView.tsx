'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { ReactElement } from 'react';

import type { QuizBlock, QuizOption, QuizQuestion } from '@/lib/blocks/types';

/**
 * Answer-state suffix conveyed as TEXT (not colour alone) so correctness is
 * perceivable without relying on colour — WCAG 2.2 AA (1.4.1 Use of Colour).
 */
function optionSuffix(answered: boolean, isSelected: boolean, isCorrect: boolean): string {
  if (!answered) {
    return '';
  }
  if (isCorrect) {
    return ' — correct';
  }
  if (isSelected) {
    return ' — your answer, incorrect';
  }
  return '';
}

/**
 * Next selected option for an arrow, Home, or End keypress within a radio group,
 * or the current index for any other key. Down/Right advance, Up/Left retreat
 * (both wrap), Home selects the first and End the last (ARIA APG Radio Group).
 * Pure + module-scope so the JSX handler stays a single inline arrow
 * (`jsx-no-bind`) and so it is unit-testable.
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

/**
 * One quiz question modelled as an ARIA radio group (ARIA APG Radio Group): the
 * group is `role="radiogroup"` labelled by the question stem (`aria-labelledby`);
 * each option is `role="radio"` with `aria-checked`. Exactly one option can be
 * chosen (answer-set semantics — a bare list of `aria-pressed` buttons would let
 * multiple be visibly selected). Roving `tabIndex` plus arrow, Home, and End
 * keys move selection, and keyboard selection moves DOM focus to the chosen
 * radio (WCAG 2.2 AA 2.4.3 Focus Order / 4.1.2 Name, Role, Value). A single
 * always-present `role="status"` region announces the explanation on answer
 * (WCAG 2.2 AA 4.1.3 Status Messages — a conditionally-mounted region can be
 * missed by assistive tech). Correctness is conveyed in TEXT, not colour.
 */
function QuizQuestionView({ question, stemId }: { question: QuizQuestion; stemId: string }): ReactElement {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const count = question.options.length;
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const focusOnSelect = useRef(false);
  // Focus target for a group with nothing chosen yet: the first radio is
  // tabbable so the group is reachable, matching the APG roving-tabindex rule.
  const focusIndex = selected ?? 0;
  // Stable per-option keys so duplicate option text does not drop or
  // mis-associate roving state (a content key would collide on repeats).
  const keys = useMemo(() => question.options.map((_option, index) => `opt-${index}`), [question.options]);

  useEffect(() => {
    if (!focusOnSelect.current || selected === null) {
      return;
    }
    focusOnSelect.current = false;
    optionRefs.current.at(selected)?.focus();
  }, [selected]);

  return (
    <div>
      <p id={stemId}>{question.stem}</p>
      <div role="radiogroup" aria-labelledby={stemId}>
        {question.options.map((option: QuizOption, index) => (
          <button
            key={keys[index]}
            ref={(node) => {
              optionRefs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={index === selected}
            tabIndex={index === focusIndex ? 0 : -1}
            onClick={() => setSelected(index)}
            onKeyDown={(event) => {
              focusOnSelect.current = true;
              setSelected((current) => nextRadioIndex(event.key, current ?? 0, count));
            }}
          >
            {option.text}
            {optionSuffix(answered, index === selected, option.correct === true)}
          </button>
        ))}
      </div>
      <p role="status">{answered && question.explain !== undefined ? question.explain : ''}</p>
    </div>
  );
}

/**
 * Renders a {@link QuizBlock} as an interactive knowledge check: a titled group
 * of questions, each an independently answerable ARIA radio group.
 */
export function QuizBlockView({ block }: { block: QuizBlock }): ReactElement {
  const baseId = useId();
  // Stable per-question identities so duplicate stems do not drop or
  // mis-associate answer state (a content key would collide on repeated stems).
  const keys = useMemo(() => block.questions.map((_question, index) => `${baseId}-q-${index}`), [block.questions, baseId]);
  return (
    <section aria-label={block.title}>
      <p>{block.title}</p>
      {block.questions.map((question, index) => (
        <QuizQuestionView key={keys[index]} question={question} stemId={`${keys[index]}-stem`} />
      ))}
    </section>
  );
}
