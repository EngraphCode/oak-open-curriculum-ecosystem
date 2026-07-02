import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LessonCard } from '@/components/ResultCards';
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
