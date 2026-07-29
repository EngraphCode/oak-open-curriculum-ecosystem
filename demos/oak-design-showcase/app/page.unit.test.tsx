import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ShowcasePage from './page';

describe('showcase page', () => {
  it('presents one top-level heading inside the landmark structure', () => {
    render(<ShowcasePage />);
    expect(screen.queryAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.queryByRole('main')).not.toBeNull();
    expect(screen.queryByRole('banner')).not.toBeNull();
    expect(screen.queryByRole('contentinfo')).not.toBeNull();
  });

  it('offers the identity control independent of the theme runtime', () => {
    render(<ShowcasePage />);
    // No runtime exists in this environment, so the theme/motion selects
    // correctly stay absent — the identity axis must not be coupled to
    // them. Full switchboard contracts live in Switchboard.unit.test.tsx;
    // the served page is Playwright's to prove.
    expect(screen.queryByRole('combobox', { name: 'Identity' })).not.toBeNull();
  });
});
