import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CurriculumShowcaseView } from '@/components/curriculum/CurriculumShowcase';
import { ShowcaseResults } from '@/components/curriculum/ShowcaseResults';
import type { SearchResults } from '@/lib/search-types';

const results: SearchResults = {
  lessons: [{ id: 'l1', title: 'Comparing fractions', url: 'https://www.thenational.academy/l' }],
  units: [{ id: 'u1', title: 'Fractions', url: 'https://www.thenational.academy/u' }],
  threads: [],
  meta: {
    lessons: { total: 9, took: 41 },
    units: { total: 6, took: 87 },
    // threads meta ABSENT: that scope failed (never "0 results").
  },
};

describe('ShowcaseResults — per-scope meta stats (E3)', () => {
  it('shows total/shown/took per scope and the max-latency line', () => {
    render(<ShowcaseResults state={{ status: 'ok', results }} />);
    expect(screen.getByText(/9 total matches · showing 1 · 41\sms/)).toBeTruthy();
    expect(screen.getByText(/6 total matches · showing 1 · 87\sms/)).toBeTruthy();
    // Max across scopes (parallel queries), never a sum (41+87).
    expect(screen.getByText(/slowest scope answered in 87\sms/)).toBeTruthy();
  });

  it('renders a failed scope as unavailable when its meta is absent', () => {
    render(<ShowcaseResults state={{ status: 'ok', results }} />);
    expect(screen.getByText(/unavailable — this part of the search failed/)).toBeTruthy();
  });

  it('prompts on the idle state without expecting any meta', () => {
    render(<ShowcaseResults state={{ status: 'idle' }} />);
    expect(screen.getByText(/Try a search above/)).toBeTruthy();
  });
});

describe('ShowcaseResults — state announcements (WCAG 2.2 SC 4.1.3)', () => {
  it('announces results with counts and any failed scope in the polite live region', () => {
    render(<ShowcaseResults state={{ status: 'ok', results }} />);
    expect(screen.getByRole('status').textContent).toBe(
      '2 results from the Oak curriculum; threads unavailable',
    );
  });

  it('renders and announces the loading state', () => {
    render(<ShowcaseResults state={{ status: 'loading' }} />);
    expect(screen.getByText('Searching…')).toBeTruthy();
    expect(screen.getByRole('status').textContent).toBe('Searching the Oak curriculum');
  });

  it('renders and announces the empty state', () => {
    render(<ShowcaseResults state={{ status: 'empty' }} />);
    expect(screen.getByText(/No lessons, units or threads matched/)).toBeTruthy();
    expect(screen.getByRole('status').textContent).toBe('No matching curriculum content');
  });

  it('renders and announces the unconfigured state', () => {
    render(<ShowcaseResults state={{ status: 'unconfigured' }} />);
    expect(screen.getByText('Search backend not configured')).toBeTruthy();
    expect(screen.getByRole('status').textContent).toBe('Oak curriculum search is not configured');
  });

  it('renders and announces the error state', () => {
    render(<ShowcaseResults state={{ status: 'error' }} />);
    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.getByRole('status').textContent).toBe('Oak curriculum search failed');
  });
});

describe('CurriculumShowcaseView — example queries', () => {
  it('seeds the search from an example chip', () => {
    const onQueryChange = vi.fn();
    render(
      <CurriculumShowcaseView query="" onQueryChange={onQueryChange} state={{ status: 'idle' }} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'photosynthesis' }));
    expect(onQueryChange).toHaveBeenCalledWith('photosynthesis');
  });
});
