import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AccordionBlockView } from '@/components/blocks/AccordionBlockView';
import { QuizBlockView } from '@/components/blocks/QuizBlockView';
import { TabsBlockView } from '@/components/blocks/TabsBlockView';

describe('AccordionBlockView', () => {
  it('renders each item question and answer', () => {
    render(
      <AccordionBlockView
        block={{
          t: 'accordion',
          chip: '#ffc8a6',
          items: [{ q: 'Curriculum information', badge: '1', a: ['Unit and lesson detail.'] }],
        }}
      />,
    );
    expect(screen.getByText('Curriculum information')).toBeTruthy();
    expect(screen.getByText('Unit and lesson detail.')).toBeTruthy();
  });

  it('renders a badgeless item and an item image placeholder (no chip)', () => {
    render(
      <AccordionBlockView
        block={{
          t: 'accordion',
          items: [
            { q: 'Simple question', a: ['A plain answer.'] },
            { q: 'With an image', a: ['See below.'], img: { placeholder: 'Fit it — add image' } },
          ],
        }}
      />,
    );
    expect(screen.getByText('Simple question')).toBeTruthy();
    // The placeholder is a decorative slot with ONE visible label — no img role, so screen
    // readers hear the label once (the old role="img" + figcaption double-announced it).
    expect(screen.getByText('Fit it — add image')).toBeTruthy();
    expect(screen.queryByRole('img')).toBeNull();
  });
});

describe('TabsBlockView', () => {
  const block = {
    t: 'tabs' as const,
    tabs: [
      { label: 'Lesson outcome', paras: ['The aim of the lesson.'] },
      { label: 'Lesson outline', paras: ['The sequence of the lesson.'] },
    ],
  };

  it('shows the first panel and marks its tab selected', () => {
    render(<TabsBlockView block={block} />);
    expect(screen.getByText('The aim of the lesson.')).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Lesson outcome' }).getAttribute('aria-selected')).toBe('true');
  });

  it('switches panel on tab click', () => {
    render(<TabsBlockView block={block} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Lesson outline' }));
    expect(screen.getByText('The sequence of the lesson.')).toBeTruthy();
  });

  it('moves selection and DOM focus with the Right arrow key', () => {
    render(<TabsBlockView block={block} />);
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Lesson outcome' }), { key: 'ArrowRight' });
    const outline = screen.getByRole('tab', { name: 'Lesson outline' });
    expect(outline.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(outline);
  });

  it('selects the last tab with End and the first with Home, moving focus', () => {
    render(<TabsBlockView block={block} />);
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Lesson outcome' }), { key: 'End' });
    const outline = screen.getByRole('tab', { name: 'Lesson outline' });
    expect(outline.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(outline);
    fireEvent.keyDown(outline, { key: 'Home' });
    const outcome = screen.getByRole('tab', { name: 'Lesson outcome' });
    expect(outcome.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(outcome);
  });
});

describe('QuizBlockView', () => {
  const block = {
    t: 'quiz' as const,
    title: 'Quick check',
    questions: [
      {
        kind: 'mcq' as const,
        stem: 'How many components make up a lesson?',
        options: [{ text: 'Five' }, { text: 'Eight', correct: true }],
        explain: 'Eight components make up a lesson.',
      },
    ],
  };

  it('models options as a radio group labelled by the stem, empty status region before answering', () => {
    render(<QuizBlockView block={block} />);
    expect(screen.getByText('How many components make up a lesson?')).toBeTruthy();
    const group = screen.getByRole('radiogroup', { name: 'How many components make up a lesson?' });
    expect(group).toBeTruthy();
    const five = screen.getByRole('radio', { name: 'Five' });
    expect(five.getAttribute('aria-checked')).toBe('false');
    expect(screen.queryByText(/Eight components make up a lesson\./)).toBeNull();
    // The status region is always present (WCAG 4.1.3) but empty before answering.
    expect(screen.getByRole('status').textContent).toBe('');
  });

  it('checks the chosen radio, reveals correctness in text, and announces the explanation', () => {
    render(<QuizBlockView block={block} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Five' }));
    expect(screen.getByRole('radio', { name: /Five — your answer, incorrect/ }).getAttribute('aria-checked')).toBe(
      'true',
    );
    expect(screen.getByRole('radio', { name: /Eight — correct/ })).toBeTruthy();
    expect(screen.getByRole('status').textContent).toBe('Eight components make up a lesson.');
  });

  it('moves selection and DOM focus with the Down arrow key', () => {
    render(<QuizBlockView block={block} />);
    fireEvent.keyDown(screen.getByRole('radio', { name: 'Five' }), { key: 'ArrowDown' });
    const eight = screen.getByRole('radio', { name: /Eight/ });
    expect(eight.getAttribute('aria-checked')).toBe('true');
    expect(document.activeElement).toBe(eight);
  });
});
