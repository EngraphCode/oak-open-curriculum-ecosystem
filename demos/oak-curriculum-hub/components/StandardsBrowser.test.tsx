import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import StandardsBrowser from '@/components/StandardsBrowser';

/** Reset the deep-link hash and mounted tree between cases (jsdom-style global location). */
afterEach(() => {
  globalThis.location.hash = '';
  cleanup();
});

/** The first quality-standard result card (fails the test if none rendered). */
function firstCard(): HTMLElement {
  const [card] = screen.getAllByRole('button', { name: /^QS-/ });
  if (card === undefined) {
    expect.fail('expected at least one standard card');
  }
  return card;
}

describe('StandardsBrowser — chrome and defaults', () => {
  it('renders the page head, search and the whole-corpus result label', () => {
    render(<StandardsBrowser />);
    expect(screen.getByRole('heading', { level: 1, name: 'Quality standards' })).toBeTruthy();
    expect(screen.getByLabelText('Search quality standards')).toBeTruthy();
    expect(screen.getByText('Showing 100 of 685 standards')).toBeTruthy();
  });

  it('exposes the guidance-area rail as a labelled navigation with an "All standards" entry', () => {
    render(<StandardsBrowser />);
    const rail = screen.getByRole('navigation', { name: 'Filter by guidance area' });
    expect(rail).toBeTruthy();
    expect(screen.getByRole('button', { name: /All standards/ })).toBeTruthy();
  });

  it('offers the closed type chips as accessible toggle buttons', () => {
    render(<StandardsBrowser />);
    expect(screen.getByRole('button', { name: 'Required standard', pressed: false })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Model practice', pressed: false })).toBeTruthy();
  });
});

describe('StandardsBrowser — filtering', () => {
  it('marks a type chip pressed and re-labels the results when selected', () => {
    render(<StandardsBrowser />);
    fireEvent.click(screen.getByRole('button', { name: 'Required standard', pressed: false }));
    expect(screen.getByRole('button', { name: 'Required standard', pressed: true })).toBeTruthy();
    expect(screen.getByText('Showing 100 of 356 standards')).toBeTruthy();
  });

  it('filters on free-text search', () => {
    render(<StandardsBrowser />);
    fireEvent.change(screen.getByLabelText('Search quality standards'), {
      target: { value: 'accessibility' },
    });
    // The corpus has far fewer than 100 accessibility matches, so the label drops the "Showing … of".
    expect(screen.queryByText('Showing 100 of 685 standards')).toBeNull();
    expect(screen.getByRole('button', { name: 'Reset filters' })).toBeTruthy();
  });

  // Rendering the full 685-standard corpus needs more than the 5s default on shared CI runners.
  it('reveals the whole corpus via "Show all" and drops the pagination controls', () => {
    render(<StandardsBrowser />);
    fireEvent.click(screen.getByRole('button', { name: 'Show all 685' }));
    expect(screen.getByText('685 standards')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Show all 685' })).toBeNull();
  }, 20_000);

  it('clears every filter via reset', () => {
    render(<StandardsBrowser />);
    fireEvent.click(screen.getByRole('button', { name: 'Required standard', pressed: false }));
    fireEvent.click(screen.getByRole('button', { name: 'Reset filters' }));
    expect(screen.getByText('Showing 100 of 685 standards')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Required standard', pressed: false })).toBeTruthy();
  });
});

describe('StandardsBrowser — deep-link focus mode', () => {
  it('enters focus mode from a #qs= hash and shows only the linked standards', () => {
    globalThis.location.hash = '#qs=QS-70,QS-68';
    render(<StandardsBrowser />);
    expect(screen.getByText(/You followed a link from a training course/)).toBeTruthy();
    expect(screen.getByText('Linked from training · 2 standards')).toBeTruthy();
    expect(screen.getByRole('link', { name: /Return to training/ }).getAttribute('href')).toBe(
      '/course',
    );
  });

  it('leaves focus mode when the visitor chooses "Browse all standards"', () => {
    globalThis.location.hash = '#qs=QS-70';
    render(<StandardsBrowser />);
    fireEvent.click(screen.getByRole('button', { name: 'Browse all standards' }));
    expect(screen.queryByText(/You followed a link from a training course/)).toBeNull();
    expect(screen.getByText('Showing 100 of 685 standards')).toBeTruthy();
  });
});

describe('StandardsBrowser — detail view', () => {
  it('opens a standard detail from a card and returns to browse on back', () => {
    render(<StandardsBrowser />);
    fireEvent.click(firstCard());
    expect(screen.getByRole('heading', { name: 'Exemplification' })).toBeTruthy();
    expect(screen.getByText('To be added')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Back to results/ }));
    expect(screen.getByText('Showing 100 of 685 standards')).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Exemplification' })).toBeNull();
  });

  it('moves focus into the detail view when a standard is opened (AA focus order)', () => {
    render(<StandardsBrowser />);
    fireEvent.click(firstCard());
    const back = screen.getByRole('button', { name: /Back to results/ });
    expect(document.activeElement?.contains(back)).toBe(true);
  });
});

describe('StandardsBrowser — a11y announcements and landmarks', () => {
  it('exposes the result count as a polite live region', () => {
    render(<StandardsBrowser />);
    const status = screen.getByRole('status');
    expect(status.textContent).toContain('Showing 100 of 685 standards');
  });

  it('renders no nested <main> (the app layout owns the main landmark)', () => {
    render(<StandardsBrowser />);
    expect(screen.queryByRole('main')).toBeNull();
    expect(screen.getByRole('region', { name: 'Quality standards results' })).toBeTruthy();
  });

  it('moves focus to the results region on deep-link entry', () => {
    globalThis.location.hash = '#qs=QS-70';
    render(<StandardsBrowser />);
    expect(document.activeElement).toBe(
      screen.getByRole('region', { name: 'Quality standards results' }),
    );
  });
});
