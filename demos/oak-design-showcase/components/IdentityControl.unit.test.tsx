import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { IdentityControl } from './IdentityControl';

const ALL_IDENTITIES = ['oak', 'freedonia', 'creature'];

describe('IdentityControl', () => {
  it('offers every supplied identity through a labelled select', () => {
    render(
      <IdentityControl identity="oak" identities={ALL_IDENTITIES} onChange={() => undefined} />,
    );
    const select = screen.getByRole('combobox', { name: 'Identity' });
    expect(select.querySelectorAll('option')).toHaveLength(ALL_IDENTITIES.length);
  });

  it('reports an identity choice through the callback with the option value', () => {
    let chosen: string | undefined;
    render(
      <IdentityControl
        identity="oak"
        identities={ALL_IDENTITIES}
        onChange={(value) => {
          chosen = value;
        }}
      />,
    );
    fireEvent.change(screen.getByRole('combobox', { name: 'Identity' }), {
      target: { value: 'freedonia' },
    });
    expect(chosen).toBe('freedonia');
  });
});
