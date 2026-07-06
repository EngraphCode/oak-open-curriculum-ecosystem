import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { LearningFrameworkStatic } from '@/components/framework/LearningFrameworkStatic';

afterEach(cleanup);

describe('LearningFrameworkStatic — the reduced-motion / SSR baseline (all seven stages, accessible)', () => {
  it('renders all seven stages as headings, in walk-through order', () => {
    render(<LearningFrameworkStatic />);
    const headings = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent ?? '');
    expect(headings).toHaveLength(7);
    expect(headings[0]).toContain('Fit it');
    expect(headings[1]).toContain('Own it');
    expect(headings[6]).toContain('Check it');
  });

  it('renders each stage’s phase, summary and supporting features', () => {
    render(<LearningFrameworkStatic />);
    expect(screen.getByText('Before the lesson')).toBeTruthy();
    expect(screen.getByText(/Ensuring pupils are motivated to learn/)).toBeTruthy();
    expect(screen.getByText('Modelling')).toBeTruthy();
  });

  it('presents the stages as an ordered list (the sequence is conveyed to assistive tech)', () => {
    render(<LearningFrameworkStatic />);
    const list = screen.getByRole('list', { name: 'The seven stages' });
    expect(list.tagName).toBe('OL');
  });
});
