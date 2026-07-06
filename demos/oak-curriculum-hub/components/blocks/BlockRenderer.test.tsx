import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BlockRenderer } from '@/components/blocks/BlockRenderer';
import type { Block } from '@/lib/blocks/types';

describe('BlockRenderer', () => {
  it('dispatches a text block to paragraph output', () => {
    render(<BlockRenderer block={{ t: 'text', paras: ['Lessons scale.'] }} />);
    expect(screen.getByText('Lessons scale.')).toBeTruthy();
  });

  it('dispatches a callout block to its QS deep-link', () => {
    const block: Block = {
      t: 'callout',
      variant: 'info',
      title: 'Quality standard',
      qs: ['QS-87'],
      text: 'Small steps.',
    };
    render(<BlockRenderer block={block} />);
    expect(screen.getByRole('link', { name: 'QS-87' }).getAttribute('href')).toBe(
      '/standards#qs=QS-87',
    );
  });

  it('dispatches a quiz block to an interactive radio-group option', () => {
    const block: Block = {
      t: 'quiz',
      title: 'Check',
      questions: [{ kind: 'mcq', stem: 'How many?', options: [{ text: 'Eight', correct: true }] }],
    };
    render(<BlockRenderer block={block} />);
    expect(screen.getByRole('radio', { name: 'Eight' })).toBeTruthy();
  });

  it('dispatches a coursemap block to an (initially empty) course-map nav', () => {
    render(<BlockRenderer block={{ t: 'coursemap' }} />);
    expect(screen.getByRole('navigation', { name: 'Course map' })).toBeTruthy();
  });
});
