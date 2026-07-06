import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import HubLanding from '@/components/HubLanding';

afterEach(cleanup);

describe('HubLanding — persistent search live region (WCAG 2.2 SC 4.1.3)', () => {
  it('mounts the live region empty in the destinations branch, before any search', () => {
    render(<HubLanding />);
    expect(screen.getByRole('status').textContent).toBe('');
  });

  it('announces the search from the same already-mounted region once a query is typed', () => {
    render(<HubLanding />);
    const region = screen.getByRole('status');
    fireEvent.change(screen.getByLabelText('Search the hub'), {
      target: { value: 'fractions' },
    });
    expect(screen.getByRole('status')).toBe(region);
    expect(region.textContent).toBe('Searching the Oak curriculum');
  });
});
