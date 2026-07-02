import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FlipBlockView } from '@/components/blocks/FlipBlockView';
import { HotspotBlockView } from '@/components/blocks/HotspotBlockView';
import { nextRadioIndex } from '@/components/blocks/quiz-keyboard';
import { SortableBlockView, isCorrectOrder, reorder } from '@/components/blocks/SortableBlockView';
import { nextTabIndex } from '@/components/blocks/TabsBlockView';

describe('nextTabIndex', () => {
  it('wraps Right past the end and Left past the start, handles Home/End, ignores other keys', () => {
    expect(nextTabIndex('ArrowRight', 2, 3)).toBe(0);
    expect(nextTabIndex('ArrowLeft', 0, 3)).toBe(2);
    expect(nextTabIndex('Home', 2, 3)).toBe(0);
    expect(nextTabIndex('End', 0, 3)).toBe(2);
    expect(nextTabIndex('Enter', 1, 3)).toBe(1);
  });
});

describe('nextRadioIndex', () => {
  it('advances on Down/Right, retreats on Up/Left (wrapping), handles Home/End, ignores other keys', () => {
    expect(nextRadioIndex('ArrowDown', 2, 3)).toBe(0);
    expect(nextRadioIndex('ArrowRight', 0, 3)).toBe(1);
    expect(nextRadioIndex('ArrowUp', 0, 3)).toBe(2);
    expect(nextRadioIndex('ArrowLeft', 1, 3)).toBe(0);
    expect(nextRadioIndex('Home', 2, 3)).toBe(0);
    expect(nextRadioIndex('End', 0, 3)).toBe(2);
    expect(nextRadioIndex('Enter', 1, 3)).toBe(1);
  });
});

describe('reorder / isCorrectOrder', () => {
  it('swaps an item with its neighbour and is a no-op out of bounds', () => {
    expect(reorder(['a', 'b', 'c'], 0, 1)).toEqual(['b', 'a', 'c']);
    expect(reorder(['a', 'b', 'c'], 0, -1)).toEqual(['a', 'b', 'c']);
  });
  it('detects the correct sequence', () => {
    expect(isCorrectOrder(['a', 'b'], ['a', 'b'])).toBe(true);
    expect(isCorrectOrder(['b', 'a'], ['a', 'b'])).toBe(false);
  });
});

describe('FlipBlockView', () => {
  it('keeps the pinned front-title name and sets aria-expanded when toggled (both faces stay in the DOM)', () => {
    render(
      <FlipBlockView
        block={{
          t: 'flip',
          chip: '#ffc8a6',
          cards: [{ badge: '1', front: 'Resources', back: 'For teachers.' }],
        }}
      />,
    );
    const button = screen.getByRole('button', { name: /Resources/ });
    expect(button.getAttribute('aria-expanded')).toBe('false');
    // Both faces persist in the DOM; the back starts hidden, so it is not announced.
    expect(screen.getByText('For teachers.').hidden).toBe(true);
    fireEvent.click(button);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('For teachers.').hidden).toBe(false);
    // The name is PINNED to the front title via aria-labelledby (SC 4.1.2 quality) —
    // it never churns to the whole back text on flip; the back is CONTENT, not the name.
    expect(screen.getByRole('button', { name: 'Resources' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /For teachers/ })).toBeNull();
  });

  it('renders the front-image slot on card fronts when frontImage is set', () => {
    render(
      <FlipBlockView
        block={{
          t: 'flip',
          chip: '#ffc8a6',
          frontImage: true,
          cards: [{ badge: '1', front: 'Card', back: 'Reveal.' }],
        }}
      />,
    );
    // The export's dashed "Drop image" slot renders on the unflipped front (was a data-attribute
    // hook in the structure-first phase; the treatment is now real).
    expect(screen.getByText('Drop image')).toBeTruthy();
  });
});

describe('HotspotBlockView', () => {
  const block = {
    t: 'hotspot' as const,
    placeholder: 'Timeline',
    spots: [
      { title: 'Before', text: 'Fit it happens before.' },
      { title: 'Within', text: 'Own it, Frame it.' },
    ],
  };
  it('shows the first spot by default and switches on a numbered marker', () => {
    render(<HotspotBlockView block={block} />);
    expect(screen.getByText('Fit it happens before.')).toBeTruthy();
    // Markers show their number; the accessible name carries number AND title.
    const second = screen.getByRole('button', { name: '2: Within' });
    expect(second.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(second);
    expect(second.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText('Own it, Frame it.')).toBeTruthy();
  });
});

describe('SortableBlockView', () => {
  const block = {
    t: 'sortable' as const,
    prompt: 'Put them in order.',
    items: [
      { id: 'own', text: 'Own it' },
      { id: 'fit', text: 'Fit it' },
    ],
    correct: ['fit', 'own'],
  };
  it('reorders via the Down button and reports the export correct copy', () => {
    render(<SortableBlockView block={block} />);
    fireEvent.click(screen.getByRole('button', { name: 'Move Own it down' }));
    fireEvent.click(screen.getByRole('button', { name: 'Check order' }));
    expect(screen.getByRole('status').textContent).toBe(
      '✓ Correct — that’s the order learning happens.',
    );
  });

  it('reports the not-quite copy on a wrong order and hints only the arrow affordance', () => {
    render(<SortableBlockView block={block} />);
    // Edge arrows stay focusable no-ops (aria-disabled): activating one keeps focus in place.
    const topUp = screen.getByRole('button', { name: 'Move Own it up' });
    expect(topUp.getAttribute('aria-disabled')).toBe('true');
    topUp.focus();
    fireEvent.click(topUp);
    expect(document.activeElement).toBe(topUp);
    fireEvent.click(screen.getByRole('button', { name: 'Check order' }));
    expect(screen.getByRole('status').textContent).toBe('Not quite — adjust and check again.');
    expect(screen.getByText('ACTIVITY')).toBeTruthy();
    // The demo has no drag; the hint must describe the affordance that exists.
    expect(screen.getByText('Use the arrow buttons to reorder')).toBeTruthy();
    // Reordering after a check clears the shown result (export behaviour).
    fireEvent.click(screen.getByRole('button', { name: 'Move Own it down' }));
    expect(screen.getByRole('status').textContent).toBe('');
  });
});
