import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ShowcasePlaceholder from './page';

describe('showcase page', () => {
  it('presents its content in a main landmark under a single top-level heading', () => {
    render(<ShowcasePlaceholder />);
    expect(screen.queryAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.queryByRole('main')).not.toBeNull();
  });
});
