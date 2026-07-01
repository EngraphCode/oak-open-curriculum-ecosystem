import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { TrainingGroup, StandardsGroup, ResultsHeader, CurriculumGroup } from '@/components/HubResults';
import type { CourseHit, StandardHit } from '@/lib/hub-search';

afterEach(cleanup);

describe('HubResults — results announcement (WCAG 2.2 SC 4.1.3)', () => {
  it('announces the results view in a polite live region naming the query', () => {
    render(<ResultsHeader query="fractions" onClear={() => undefined} />);
    expect(screen.getByRole('status').textContent).toContain('fractions');
  });

  it('announces the live-curriculum search state as it resolves', () => {
    render(<CurriculumGroup state={{ status: 'loading' }} />);
    expect(screen.getByRole('status').textContent).toMatch(/Searching/);
    cleanup();
    render(<CurriculumGroup state={{ status: 'empty' }} />);
    expect(screen.getByRole('status').textContent).toMatch(/No matching/);
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
