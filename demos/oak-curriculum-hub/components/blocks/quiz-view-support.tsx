'use client';

import type { KeyboardEvent, ReactElement, RefObject } from 'react';

import type { QuizOption, QuizQuestion } from '@/lib/blocks/types';

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
 * The export's answered-state treatment for one option: correct = mint wash + green border and a ✓
 * mark chip; the chosen wrong answer = red-subdued wash + red border and a ✕ chip; other options
 * fade to a neutral wash. Unanswered options are white with the lettered chip. (The text suffix from
 * {@link optionSuffix} carries the same information non-visually.)
 */
function optionClasses(answered: boolean, isSelected: boolean, isCorrect: boolean): string {
  const base = 'flex items-center gap-3 rounded-[10px] border-2 px-3.5 py-2.5 text-left';
  if (!answered) {
    return `${base} border-line bg-white`;
  }
  if (isCorrect) {
    return `${base} border-line-success bg-success-subtle`;
  }
  if (isSelected) {
    return `${base} border-line-error bg-error-subtle`;
  }
  return `${base} border-line/40 bg-surface-inverted/[.03]`;
}

/** The option's leading chip: the letter before answering; ✓ / ✕ state marks after. */
function OptionChip({
  letter,
  answered,
  isSelected,
  isCorrect,
}: {
  readonly letter: string;
  readonly answered: boolean;
  readonly isSelected: boolean;
  readonly isCorrect: boolean;
}): ReactElement {
  if (answered && isCorrect) {
    return (
      <span
        aria-hidden="true"
        className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 border-line-success bg-success-subtle text-[12px] font-bold text-ink"
      >
        ✓
      </span>
    );
  }
  if (answered && isSelected) {
    return (
      <span
        aria-hidden="true"
        className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 border-line-error bg-error-subtle text-[12px] font-bold text-ink"
      >
        ✕
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 border-line bg-white text-[12px] font-bold uppercase"
    >
      {letter}
    </span>
  );
}

/** The export's stem row: the grey Q-number label beside the semibold stem (the group's label). */
export function QuizStem({
  number,
  stemId,
  stem,
}: {
  readonly number: number;
  readonly stemId: string;
  readonly stem: string;
}): ReactElement {
  return (
    <p id={stemId} className="mb-3 flex gap-2.5">
      <span className="shrink-0 text-[16px] font-bold leading-6 text-ink-subdued">Q{number}</span>
      <span className="text-[18px] font-semibold leading-[25px]">{stem}</span>
    </p>
  );
}

/**
 * The question's `role="radiogroup"`: one `role="radio"` button per option with `aria-checked`,
 * roving `tabIndex`, the lettered/marked chip, and the export's answered-state washes. True/false
 * groups lay out in a row (half-width options), multiple-choice in a column. State stays with the
 * caller; this renders it.
 */
export function QuizOptionsGroup({
  question,
  keys,
  stemId,
  selected,
  focusIndex,
  optionRefs,
  onPick,
  onKeyNav,
}: {
  readonly question: QuizQuestion;
  readonly keys: readonly string[];
  readonly stemId: string;
  readonly selected: number | null;
  readonly focusIndex: number;
  readonly optionRefs: RefObject<(HTMLButtonElement | null)[]>;
  readonly onPick: (index: number) => void;
  readonly onKeyNav: (event: KeyboardEvent<HTMLButtonElement>) => void;
}): ReactElement {
  return (
    <div
      role="radiogroup"
      aria-labelledby={stemId}
      className={question.kind === 'tf' ? 'flex flex-wrap gap-2.5' : 'flex flex-col gap-[9px]'}
    >
      {question.options.map((option: QuizOption, index) => (
        <OptionRow
          key={keys[index]}
          option={option}
          index={index}
          selected={selected}
          tabbable={index === focusIndex}
          row={question.kind === 'tf'}
          refCallback={(node) => {
            optionRefs.current[index] = node;
          }}
          onPick={onPick}
          onKeyNav={onKeyNav}
        />
      ))}
    </div>
  );
}

/** One radio row: the state-washed button with its chip and text suffix (see {@link optionClasses}). */
function OptionRow({
  option,
  index,
  selected,
  tabbable,
  row,
  refCallback,
  onPick,
  onKeyNav,
}: {
  readonly option: QuizOption;
  readonly index: number;
  readonly selected: number | null;
  readonly tabbable: boolean;
  readonly row: boolean;
  readonly refCallback: (node: HTMLButtonElement | null) => void;
  readonly onPick: (index: number) => void;
  readonly onKeyNav: (event: KeyboardEvent<HTMLButtonElement>) => void;
}): ReactElement {
  const answered = selected !== null;
  const isSelected = index === selected;
  const isCorrect = option.correct === true;
  return (
    <button
      ref={refCallback}
      type="button"
      role="radio"
      aria-checked={isSelected}
      tabIndex={tabbable ? 0 : -1}
      onClick={() => onPick(index)}
      onKeyDown={onKeyNav}
      className={`${optionClasses(answered, isSelected, isCorrect)} ${row ? 'min-w-[200px] flex-1' : 'w-full'}`}
    >
      <OptionChip
        letter={String.fromCodePoint(65 + index)}
        answered={answered}
        isSelected={isSelected}
        isCorrect={isCorrect}
      />
      <span className="flex-1 text-[16px] font-light leading-[22px]">
        {option.text}
        {optionSuffix(answered, isSelected, isCorrect)}
      </span>
    </button>
  );
}

/**
 * The always-present `role="status"` region announcing the explanation once answered (WCAG 2.2 AA
 * 4.1.3 Status Messages — a conditionally-mounted region can be missed by assistive tech).
 */
export function QuizExplainStatus({
  answered,
  explain,
}: {
  readonly answered: boolean;
  readonly explain: string | undefined;
}): ReactElement {
  const visible = answered && explain !== undefined;
  return (
    // Native <output> carries the implicit status role (WCAG 4.1.3 live region).
    <output className={visible ? 'mt-2.5 block text-[15px] font-light leading-[22px]' : 'block'}>
      {visible ? explain : ''}
    </output>
  );
}
