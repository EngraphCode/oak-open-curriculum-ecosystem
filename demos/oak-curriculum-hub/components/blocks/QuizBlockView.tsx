'use client';

import { useId, useMemo } from 'react';
import type { ReactElement } from 'react';

import type { QuizBlock, QuizQuestion } from '@/lib/blocks/types';

import { useQuizQuestionRoving } from './quiz-keyboard';
import { QuizExplainStatus, QuizOptionsGroup, QuizStem } from './quiz-view-support';

/**
 * One quiz question modelled as an ARIA radio group (ARIA APG Radio Group), rendered by
 * {@link QuizOptionsGroup}: the group is labelled by the question stem; each option is
 * `role="radio"` with `aria-checked`. Roving `tabIndex` plus arrow, Home, and End keys move
 * selection, and keyboard selection moves DOM focus to the chosen radio (WCAG 2.2 AA 2.4.3 /
 * 4.1.2). A single always-present `role="status"` region announces the explanation on answer
 * (4.1.3). Correctness is conveyed in text as well as colour.
 */
function QuizQuestionView({
  question,
  number,
  stemId,
}: {
  readonly question: QuizQuestion;
  readonly number: number;
  readonly stemId: string;
}): ReactElement {
  // Roving state (selection, focus target, keyboard contract) lives in the
  // hook; `focusIndex` keeps the first radio tabbable before anything is
  // chosen so the group stays reachable (APG roving-tabindex rule).
  const roving = useQuizQuestionRoving(question.options.length);
  // Stable per-option keys so duplicate option text does not drop or
  // mis-associate roving state (a content key would collide on repeats).
  const keys = useMemo(
    () => question.options.map((_option, index) => `opt-${index}`),
    [question.options],
  );

  return (
    <div>
      <QuizStem number={number} stemId={stemId} stem={question.stem} />
      <QuizOptionsGroup
        question={question}
        keys={keys}
        stemId={stemId}
        selected={roving.selected}
        focusIndex={roving.focusIndex}
        optionRefs={roving.optionRefs}
        onPick={roving.pick}
        onKeyNav={roving.keyNav}
      />
      <QuizExplainStatus answered={roving.selected !== null} explain={question.explain} />
    </div>
  );
}

/**
 * Renders a {@link QuizBlock} as the export's knowledge-check card: a heavy surface-role card (3px border,
 * 4px lemon shadow), the lemon "?" chip beside the bold title, then each question as an
 * independently answerable ARIA radio group.
 */
export function QuizBlockView({ block }: { readonly block: QuizBlock }): ReactElement {
  const baseId = useId();
  // Stable per-question identities so duplicate stems do not drop or
  // mis-associate answer state (a content key would collide on repeated stems).
  const keys = useMemo(
    () => block.questions.map((_question, index) => `${baseId}-q-${index}`),
    [block.questions, baseId],
  );
  return (
    <section
      aria-label={block.title}
      className="rounded-2xl border-[3px] border-line bg-surface p-[22px] pb-6 shadow-[4px_4px_0_var(--color-accent)]"
    >
      <p className="mb-[18px] flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full border-2 border-line bg-decorative-5 text-[18px]"
        >
          ?
        </span>
        <span className="text-[20px] font-bold leading-[26px]">{block.title}</span>
      </p>
      <div className="flex flex-col gap-6">
        {block.questions.map((question, index) => (
          <QuizQuestionView
            key={keys[index]}
            question={question}
            number={index + 1}
            stemId={`${keys[index]}-stem`}
          />
        ))}
      </div>
    </section>
  );
}
