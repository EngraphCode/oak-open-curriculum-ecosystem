import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';

import { subjectName } from '@/components/subjects';

/**
 * C0 smoke test: proves the demo's TDD infrastructure works end to end —
 * `happy-dom` renders a component, `@testing-library/react` queries it, and the
 * `@/*` path alias resolves exactly as the app imports. Deleted once real
 * component tests (C1+) exercise the same pipeline.
 */
function Greeting({ name }: { readonly name: string }): ReactElement {
  return <p>Hello {name}</p>;
}

describe('test infrastructure', () => {
  it('renders a component through happy-dom + testing-library', () => {
    render(<Greeting name="Oak" />);
    expect(screen.getByText('Hello Oak')).toBeTruthy();
  });

  it('resolves the @/ path alias to app modules', () => {
    expect(typeof subjectName('maths')).toBe('string');
  });
});
