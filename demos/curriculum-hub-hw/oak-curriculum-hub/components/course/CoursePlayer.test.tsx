import { fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';

import { CourseShell } from '@/components/course/CourseShell';

import { courseFixture as fixture } from './course-shell.test-fixtures';

describe('CoursePlayer — arrival states', () => {
  afterEach(() => {
    globalThis.location.hash = '';
  });

  it('reveals only the first section after a plain arrival, without stealing focus', () => {
    const { container } = render(<CourseShell course={fixture} title="Creating lessons at Oak" />);
    expect(container.querySelector<HTMLElement>('#section-introMain')?.hidden).toBe(false);
    expect(container.querySelector<HTMLElement>('#section-u1m1s1')?.hidden).toBe(true);
    expect(container.querySelector<HTMLElement>('#intro')?.hidden).toBe(false);
    expect(container.querySelector<HTMLElement>('#u1m1')?.hidden).toBe(true);
    expect(document.activeElement).toBe(document.body);
  });

  it('reveals the deep-linked section on arrival and focuses its heading (SC 2.4.3)', () => {
    globalThis.location.hash = '#section=u1m1s2';
    const { container } = render(<CourseShell course={fixture} title="Creating lessons at Oak" />);
    // The h3 is the focus target: a screen reader announces the title as a level-3 heading.
    expect(document.activeElement?.id).toBe('section-h-u1m1s2');
    expect(container.querySelector<HTMLElement>('#section-u1m1s2')?.hidden).toBe(false);
    expect(container.querySelector<HTMLElement>('#section-introMain')?.hidden).toBe(true);
    expect(container.querySelector<HTMLElement>('#u1m1')?.hidden).toBe(false);
    expect(container.querySelector<HTMLElement>('#intro')?.hidden).toBe(true);
  });
});

describe('CoursePlayer — hash resilience and the SSR fallback', () => {
  afterEach(() => {
    globalThis.location.hash = '';
  });

  it('keeps the last-resolved section active on an unresolvable in-page anchor (no player reset)', () => {
    globalThis.location.hash = '#section=u1m1s2';
    const { container } = render(<CourseShell course={fixture} title="Creating lessons at Oak" />);
    globalThis.location.hash = '#some-inline-anchor';
    fireEvent(globalThis.window, new HashChangeEvent('hashchange'));
    expect(container.querySelector<HTMLElement>('#section-u1m1s2')?.hidden).toBe(false);
    expect(container.querySelector<HTMLElement>('#section-introMain')?.hidden).toBe(true);
  });

  it("focuses the fallback first section's heading on history-back to a hashless URL", () => {
    globalThis.location.hash = '#section=u2m1s1';
    const { container } = render(<CourseShell course={fixture} title="Creating lessons at Oak" />);
    globalThis.location.hash = '';
    fireEvent(globalThis.window, new HashChangeEvent('hashchange'));
    expect(container.querySelector<HTMLElement>('#section-introMain')?.hidden).toBe(false);
    expect(document.activeElement?.id).toBe('section-h-introMain');
  });

  it('server-renders every section visible — no hidden attribute in the SSR output', () => {
    // jsdom renders post-hydration, so the pre-hydration/no-JS claim needs the server renderer.
    // React serialises the boolean hidden attribute as `hidden=""` (class substrings like
    // overflow-hidden and aria-hidden="true" are not the gating attribute).
    const markup = renderToString(<CourseShell course={fixture} title="Creating lessons at Oak" />);
    expect(markup.includes('hidden=""')).toBe(false);
    expect(markup.includes('id="section-u2m1s1"')).toBe(true);
  });
});

describe('CoursePlayer — navigation', () => {
  afterEach(() => {
    globalThis.location.hash = '';
  });

  it('navigates to the next section with the controls, writing the hash and moving focus', () => {
    const { container } = render(<CourseShell course={fixture} title="Creating lessons at Oak" />);
    expect(screen.getByText('Section 1 of 4')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Next section' }));
    expect(globalThis.location.hash).toBe('#section=u1m1s1');
    expect(document.activeElement?.id).toBe('section-h-u1m1s1');
    expect(screen.getByText('Section 2 of 4')).toBeTruthy();
    expect(container.querySelector<HTMLElement>('#section-introMain')?.hidden).toBe(true);
  });

  it('disables Previous at the start of the sequence and Next at the end', () => {
    render(<CourseShell course={fixture} title="Creating lessons at Oak" />);
    expect(screen.getByRole('button', { name: 'Previous section' }).hasAttribute('disabled')).toBe(true);
    const next = screen.getByRole('button', { name: 'Next section' });
    fireEvent.click(next);
    fireEvent.click(next);
    fireEvent.click(next);
    expect(screen.getByText('Section 4 of 4')).toBeTruthy();
    expect(next.hasAttribute('disabled')).toBe(true);
  });

  it("activates a module's first section on a module-anchor hash change (the coursemap scheme)", () => {
    const { container } = render(<CourseShell course={fixture} title="Creating lessons at Oak" />);
    globalThis.location.hash = '#u2m1';
    fireEvent(globalThis.window, new HashChangeEvent('hashchange'));
    expect(document.activeElement?.id).toBe('section-h-u2m1s1');
    expect(container.querySelector<HTMLElement>('#u2m1')?.hidden).toBe(false);
    expect(container.querySelector<HTMLElement>('#section-u2m1s1')?.hidden).toBe(false);
    expect(container.querySelector<HTMLElement>('#intro')?.hidden).toBe(true);
  });
});
