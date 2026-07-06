import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LessonCard, UnitCard } from '@/components/ResultCards';
import type { Hit } from '@/lib/search-client';

const baseHit: Hit = {
  id: 'l1',
  title: 'Comparing fractions',
  url: 'https://www.thenational.academy/l',
};

describe('LessonCard — snippet rendering (ES highlight fragments)', () => {
  it('renders the highlighted term as a real mark element', () => {
    render(<LessonCard hit={{ ...baseHit, snippet: 'all about <em>fractions</em> here' }} />);
    expect(screen.getByText('fractions').tagName).toBe('MARK');
  });

  it('never interprets other markup from the API — angle brackets stay literal text', () => {
    render(<LessonCard hit={{ ...baseHit, snippet: 'not <b>bold</b> <img src=x> markup' }} />);
    // The exact injection shape dangerouslySetInnerHTML permitted: raw tags must render as text.
    expect(screen.getByText(/<b>bold<\/b> <img src=x> markup/)).toBeTruthy();
  });
});

describe('lesson and unit cards — url trust boundary (safeUrl empty-url fallback)', () => {
  // `safeUrl` (search-core) maps a malformed or poisoned index url to '';
  // an empty url must render a non-link card, never an active <a href="">.
  it('renders a lesson hit with a url as a link with the open-on-Oak CTA', () => {
    render(<LessonCard hit={baseHit} />);
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe(baseHit.url);
    expect(screen.getByText('Open lesson on Oak ↗')).toBeTruthy();
  });

  it('renders a lesson hit with an empty url as a non-link card without the CTA', () => {
    render(<LessonCard hit={{ ...baseHit, url: '' }} />);
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('Comparing fractions')).toBeTruthy();
    expect(screen.queryByText('Open lesson on Oak ↗')).toBeNull();
  });

  it('renders a unit hit with an empty url as a non-link card', () => {
    render(<UnitCard hit={{ ...baseHit, url: '' }} />);
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('Comparing fractions')).toBeTruthy();
  });
});
