import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import Destinations from '@/components/Destinations';

afterEach(cleanup);

describe('Destinations — the hub landing card grid', () => {
  it('renders all six destination cards (the five canonical + the live Oak-curriculum search card)', () => {
    render(<Destinations />);
    for (const title of [
      'eLearning training courses',
      'Quality standards',
      'Rubrics',
      'Exemplars',
      'Wiki',
      'Oak curriculum',
    ]) {
      expect(screen.getByRole('heading', { level: 3, name: title })).toBeTruthy();
    }
  });

  it('points the live Oak-curriculum card at the dedicated /curriculum showcase (E3)', () => {
    render(<Destinations />);
    const card = screen.getByRole('link', { name: /Oak curriculum/ });
    expect(card.getAttribute('href')).toBe('/curriculum');
    expect(screen.getByText('Explore curriculum search')).toBeTruthy();
  });
});
