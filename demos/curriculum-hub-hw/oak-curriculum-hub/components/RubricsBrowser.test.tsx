import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import RubricsBrowser from '@/components/RubricsBrowser';

afterEach(cleanup);

describe('RubricsBrowser — real QS-facet view over the rubric-bearing quality standards', () => {
  it('offers an "All rubrics" filter (default-selected) plus each real rubric type', () => {
    render(<RubricsBrowser />);
    expect(screen.getByRole('button', { name: /All rubrics/, pressed: true })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Pedagogical Rubric/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Technical Rubric/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Annex B/ })).toBeTruthy();
  });

  it('defaults to the 299 rubric-bearing standards and announces the count in a live region', () => {
    render(<RubricsBrowser />);
    expect(screen.getByRole('status').textContent).toContain('299');
  });

  it('filters to a single rubric when its facet is selected, updating the count and pressed state', () => {
    render(<RubricsBrowser />);
    fireEvent.click(screen.getByRole('button', { name: /Pedagogical Rubric/ }));
    expect(screen.getByRole('button', { name: /Pedagogical Rubric/, pressed: true })).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('89');
  });

  it('links each standard to its detail on the standards page via the #qs= deep-link', () => {
    render(<RubricsBrowser />);
    const [firstLink] = screen.getAllByRole('link');
    expect(firstLink?.getAttribute('href')).toMatch(/^\/standards#qs=QS-/);
  });

  it('renders the results in a labelled region, not a nested main (the layout owns main)', () => {
    render(<RubricsBrowser />);
    expect(screen.queryByRole('main')).toBeNull();
    expect(screen.getByRole('region', { name: 'Rubrics results' })).toBeTruthy();
  });
});
