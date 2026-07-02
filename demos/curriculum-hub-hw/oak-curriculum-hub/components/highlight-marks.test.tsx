import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { highlightToNodes } from '@/components/highlight-marks';

describe('highlightToNodes — ES <em> fragments become real mark elements', () => {
  it('passes plain text through untouched', () => {
    render(<p>{highlightToNodes('no highlight here')}</p>);
    expect(screen.getByText('no highlight here')).toBeTruthy();
  });

  it('renders a single highlighted term as a mark element', () => {
    render(<p>{highlightToNodes('all about <em>fractions</em> today')}</p>);
    const mark = screen.getByText('fractions');
    expect(mark.tagName).toBe('MARK');
    expect(screen.getByText(/all about/)).toBeTruthy();
    expect(screen.getByText(/today/)).toBeTruthy();
  });

  it('renders the live payload <mark> pair identically (the ES config emits mark, not em)', () => {
    render(<p>{highlightToNodes('light creates cells for <mark>photosynthesis</mark>, B')}</p>);
    expect(screen.getByText('photosynthesis').tagName).toBe('MARK');
    expect(screen.getByText(/light creates cells for/)).toBeTruthy();
  });

  it('renders every highlighted term in a multi-match fragment', () => {
    render(<p>{highlightToNodes('<em>compare</em> and <em>order</em> fractions')}</p>);
    expect(screen.getByText('compare').tagName).toBe('MARK');
    expect(screen.getByText('order').tagName).toBe('MARK');
  });

  it('marks an unterminated open tag to the end of the fragment (the documented contract)', () => {
    render(<p>{highlightToNodes('broken <em>fragment')}</p>);
    const tail = screen.getByText('fragment');
    expect(tail.tagName).toBe('MARK');
    expect(screen.getByText(/broken/)).toBeTruthy();
  });

  it('never interprets other markup — angle brackets render as literal text', () => {
    render(<p>{highlightToNodes('literal <b>bold</b> stays text')}</p>);
    expect(screen.getByText(/<b>bold<\/b>/)).toBeTruthy();
  });
});
