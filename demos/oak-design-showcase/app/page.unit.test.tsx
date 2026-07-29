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

  // The switchboard's combobox contract lives in Switchboard.unit.test.tsx
  // (injected fake runtime store — no runtime exists in this environment,
  // so the server-neutral render correctly shows no controls here); the
  // switchboard ON the served page is Playwright's to prove.
});
