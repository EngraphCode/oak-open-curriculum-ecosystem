import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';

import { courseFixture } from '@/components/course/course-shell.test-fixtures';
import { CourseShell } from '@/components/course/CourseShell';
import { CurriculumShowcaseView } from '@/components/curriculum/CurriculumShowcase';
import { ShowcaseResults } from '@/components/curriculum/ShowcaseResults';
import Destinations from '@/components/Destinations';
import { HubResultsView } from '@/components/HubResults';
import SiteNav from '@/components/SiteNav';
import type { SearchResults } from '@/lib/search-types';

expect.extend(toHaveNoViolations);
afterEach(cleanup);

// colour-contrast needs a canvas jsdom does not provide; every palette pair on these
// surfaces is contrast-verified by reviewer recompute (§E ledger) — a documented scope
// bound, not a silent cap. All other WCAG 2.x axe rules run.
const axeOptions = { rules: { 'color-contrast': { enabled: false } } };

const results: SearchResults = {
  lessons: [
    {
      id: 'l1',
      title: 'Comparing fractions',
      url: 'https://www.thenational.academy/l',
      snippet: 'all about <mark>fractions</mark>',
    },
  ],
  units: [{ id: 'u1', title: 'Fractions', url: 'https://www.thenational.academy/u' }],
  threads: [{ id: 't1', title: 'Number', url: '' }],
  meta: {
    lessons: { total: 9, took: 41 },
    units: { total: 6, took: 87 },
    threads: { total: 2, took: 12 },
  },
};

describe('axe backstop — the demo surfaces render with no WCAG violations (DoD §E)', () => {
  it.each([
    ['SiteNav (menu closed)', () => <SiteNav />] as const,
    ['Home destinations', () => <Destinations />] as const,
    [
      'Hub results (ok state)',
      () => (
        <HubResultsView
          query="fractions"
          onClear={() => undefined}
          curriculum={{ status: 'ok', results }}
        />
      ),
    ] as const,
    [
      'Course shell (player)',
      () => <CourseShell course={courseFixture} title="Creating lessons at Oak" />,
    ] as const,
    [
      'Curriculum showcase (idle)',
      () => (
        <CurriculumShowcaseView
          query=""
          onQueryChange={() => undefined}
          state={{ status: 'idle' }}
        />
      ),
    ] as const,
    [
      'Curriculum results (ok)',
      () => <ShowcaseResults state={{ status: 'ok', results }} />,
    ] as const,
    ['Curriculum results (error)', () => <ShowcaseResults state={{ status: 'error' }} />] as const,
  ])('%s has no axe violations', async (_name, make) => {
    const { container } = render(make());
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it('SiteNav with the disclosure menu open has no axe violations', async () => {
    const { container } = render(<SiteNav />);
    fireEvent.click(screen.getByRole('button', { name: 'Hub sections' }));
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
