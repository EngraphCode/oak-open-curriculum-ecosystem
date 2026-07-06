import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { TrainingGroup, StandardsGroup } from '@/components/HubLocalGroups';
import {
  HubResultsView,
  ResultsHeader,
  CurriculumGroup,
  curriculumAnnouncement,
} from '@/components/HubResults';
import type { CourseHit, StandardHit } from '@/lib/hub-search';
import type { CurriculumSearchState } from '@/lib/use-curriculum-search';

afterEach(cleanup);

describe('HubResults — search-state announcement (WCAG 2.2 SC 4.1.3)', () => {
  it('keeps the visible results heading free of live-region semantics', () => {
    render(<ResultsHeader query="fractions" onClear={() => undefined} />);
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByText(/Results for/).textContent).toContain('fractions');
  });

  it('renders the curriculum group without its own live region (HubLanding owns the region)', () => {
    render(<CurriculumGroup state={{ status: 'loading' }} />);
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByText('Searching…')).toBeTruthy();
  });

  it('announces a constant loading string, silence when idle, and the query when settled', () => {
    expect(curriculumAnnouncement({ status: 'loading' }, 'f')).toBe('Searching the Oak curriculum');
    expect(curriculumAnnouncement({ status: 'loading' }, 'fr')).toBe(
      'Searching the Oak curriculum',
    );
    expect(curriculumAnnouncement({ status: 'idle' }, '')).toBe('');
    const oneLesson: CurriculumSearchState = {
      status: 'ok',
      results: {
        lessons: [{ id: 'l1', title: 'Comparing fractions', url: 'https://example.test/l1' }],
        units: [],
        threads: [],
      },
    };
    expect(curriculumAnnouncement(oneLesson, 'fractions')).toBe(
      '1 result for “fractions” from the Oak curriculum',
    );
    expect(curriculumAnnouncement({ status: 'empty' }, 'zzz')).toBe(
      'No matching Oak curriculum results',
    );
  });
});

describe('HubResults — TrainingGroup (local training-course search results)', () => {
  const hits: readonly CourseHit[] = [
    { title: 'Feedback', module: 'Checks for understanding', href: '/course#section=m4s4' },
  ];

  it('renders each training-course hit as a link to its course section', () => {
    render(<TrainingGroup hits={hits} />);
    const link = screen.getByRole('link', { name: /Feedback/ });
    expect(link.getAttribute('href')).toBe('/course#section=m4s4');
    expect(screen.getByText('Checks for understanding')).toBeTruthy();
  });

  it('shows an honest empty state when there are no training-course hits', () => {
    render(<TrainingGroup hits={[]} />);
    expect(screen.getByText(/No matching training courses/)).toBeTruthy();
    expect(screen.queryByRole('link')).toBeNull();
  });
});

describe('HubResults — StandardsGroup (local quality-standards search results)', () => {
  const hits: readonly StandardHit[] = [
    {
      id: 'QS-70',
      text: 'Content uses an appropriate and consistent tone',
      area: 'Curriculum',
      href: '/standards#qs=QS-70',
    },
  ];

  it('renders each standard hit as a deep link into the Standards focus view', () => {
    render(<StandardsGroup hits={hits} />);
    const link = screen.getByRole('link', { name: /QS-70/ });
    expect(link.getAttribute('href')).toBe('/standards#qs=QS-70');
    expect(screen.getByText('Content uses an appropriate and consistent tone')).toBeTruthy();
    expect(screen.getByText('Curriculum')).toBeTruthy();
  });

  it('shows an empty state when there are no standard hits', () => {
    render(<StandardsGroup hits={[]} />);
    expect(screen.getByText(/No matching quality standards/)).toBeTruthy();
    expect(screen.queryByRole('link')).toBeNull();
  });
});

describe('HubResults — group ordering (E2: live curriculum is secondary)', () => {
  it('renders training and standards first, the live curriculum group below them', () => {
    render(
      <HubResultsView
        query="fractions"
        onClear={() => undefined}
        curriculum={{ status: 'idle' }}
      />,
    );
    const headers = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent ?? '');
    // Presence first, so the index comparisons can never pass vacuously on -1.
    for (const title of [
      'In the training courses',
      'Quality standards',
      'From the Oak curriculum',
    ]) {
      expect(headers).toContain(title);
    }
    expect(headers.indexOf('In the training courses')).toBeLessThan(
      headers.indexOf('From the Oak curriculum'),
    );
    expect(headers.indexOf('Quality standards')).toBeLessThan(
      headers.indexOf('From the Oak curriculum'),
    );
  });
});
