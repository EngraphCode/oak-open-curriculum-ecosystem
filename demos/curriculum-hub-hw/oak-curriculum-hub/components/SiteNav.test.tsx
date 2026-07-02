import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import SiteNav from '@/components/SiteNav';

describe('SiteNav — hub sections disclosure', () => {
  it('opens the menu with every section link and the hub search, and closes on a link choose', () => {
    render(<SiteNav />);
    const toggle = screen.getByRole('button', { name: 'Hub sections' });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('navigation', { name: 'Hub sections menu' })).toBeNull();
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    const menu = screen.getByRole('navigation', { name: 'Hub sections menu' });
    // The toggle controls the panel it expands (APG disclosure-navigation).
    expect(toggle.getAttribute('aria-controls')).toBe(menu.getAttribute('id'));
    for (const label of ['Training courses', 'Quality standards', 'Rubrics', 'Exemplars', 'Wiki']) {
      expect(within(menu).getByRole('link', { name: label })).toBeTruthy();
    }
    expect(within(menu).getByRole('searchbox', { name: 'Search the hub' })).toBeTruthy();
    fireEvent.click(within(menu).getByRole('link', { name: 'Rubrics' }));
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('navigation', { name: 'Hub sections menu' })).toBeNull();
  });

  it('closes on Escape and returns focus to the toggle', () => {
    render(<SiteNav />);
    const toggle = screen.getByRole('button', { name: 'Hub sections' });
    fireEvent.click(toggle);
    const menu = screen.getByRole('navigation', { name: 'Hub sections menu' });
    fireEvent.keyDown(menu, { key: 'Escape' });
    expect(screen.queryByRole('navigation', { name: 'Hub sections menu' })).toBeNull();
    expect(document.activeElement).toBe(toggle);
  });

  it('closes when focus leaves the disclosure, without pulling focus back', () => {
    render(<SiteNav />);
    const toggle = screen.getByRole('button', { name: 'Hub sections' });
    fireEvent.click(toggle);
    expect(screen.getByRole('navigation', { name: 'Hub sections menu' })).toBeTruthy();
    fireEvent.focusOut(toggle, { relatedTarget: document.body });
    expect(screen.queryByRole('navigation', { name: 'Hub sections menu' })).toBeNull();
    expect(document.activeElement).not.toBe(toggle);
  });

});

describe('SiteNav — inline chrome', () => {
  it('keeps the inline sections nav complete, with the search outside any menu', () => {
    render(<SiteNav />);
    const inline = screen.getByRole('navigation', { name: 'Hub sections' });
    for (const label of ['Training courses', 'Quality standards', 'Rubrics', 'Exemplars', 'Wiki']) {
      expect(within(inline).getByRole('link', { name: label })).toBeTruthy();
    }
    // Menu closed: exactly one searchbox, inside the named search landmark in the header row.
    expect(screen.getByRole('search', { name: 'Hub search' })).toBeTruthy();
    expect(screen.getByRole('searchbox', { name: 'Search the hub' })).toBeTruthy();
  });
});
