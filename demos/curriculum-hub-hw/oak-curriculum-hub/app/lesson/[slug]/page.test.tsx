import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ok, err } from '@oaknational/result';
import LessonPage from './page';

// The lesson page is a Server Component: React (react.dev) and Next.js 16 both
// direct a Server Component to read its data layer directly, not to HTTP-fetch
// its own Route Handler. These tests describe that contract — the page sources
// lesson data from `getLesson` and performs NO network fetch to render.
// `vi.hoisted` gives the mock factory a handle to the spy; vitest hoists the
// `vi.mock` above the static `./page` import so the page binds the mock.
const { getLesson } = vi.hoisted(() => ({ getLesson: vi.fn() }));
vi.mock('@/lib/curriculum', () => ({ getLesson }));

const renderPage = async (slug: string) =>
  render(await LessonPage({ params: Promise.resolve({ slug }) }));

afterEach(cleanup);
beforeEach(() => {
  getLesson.mockReset();
  vi.stubGlobal('fetch', vi.fn());
});

describe('LessonPage — sources data via the direct data function (no self-fetch)', () => {
  it('renders the lesson from getLesson(slug) without any HTTP fetch', async () => {
    getLesson.mockResolvedValue(
      ok({
        summary: {
          lessonTitle: 'Comparing fractions',
          pupilLessonOutcome: 'Pupils can compare fractions with different denominators',
        },
        quiz: null,
        assets: null,
      }),
    );

    await renderPage('comparing-fractions');

    expect(getLesson).toHaveBeenCalledWith('comparing-fractions');
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('Comparing fractions');
    expect(
      screen.getByText('Pupils can compare fractions with different denominators'),
    ).toBeTruthy();
    // The anti-pattern being removed: a Server Component must not HTTP-fetch its own route.
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('renders the unavailable state when getLesson returns an error Result', async () => {
    getLesson.mockResolvedValue(err({ kind: 'not_configured' }));

    await renderPage('comparing-fractions');

    expect(screen.getByText(/content is unavailable/i)).toBeTruthy();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});

describe('LessonPage — landmarks', () => {
  it('brings no main landmark of its own (the app layout owns main)', async () => {
    getLesson.mockResolvedValue(
      ok({
        summary: { lessonTitle: 'Comparing fractions', pupilLessonOutcome: 'Outcome.' },
        quiz: null,
        assets: null,
      }),
    );

    await renderPage('comparing-fractions');

    expect(screen.queryByRole('main')).toBeNull();
  });
});
