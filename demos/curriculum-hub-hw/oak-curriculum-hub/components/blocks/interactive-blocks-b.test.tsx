import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FlipBlockView } from '@/components/blocks/FlipBlockView';
import { HotspotBlockView } from '@/components/blocks/HotspotBlockView';
import { nextRadioIndex } from '@/components/blocks/quiz-view-support';
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
  it('reveals the back and sets aria-expanded when toggled', () => {
    render(<FlipBlockView block={{ t: 'flip', chip: '#ffc8a6', cards: [{ badge: '1', front: 'Resources', back: 'For teachers.' }] }} />);
    const button = screen.getByRole('button', { name: /Resources/ });
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByText('For teachers.')).toBeNull();
    fireEvent.click(button);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('For teachers.')).toBeTruthy();
    // The flip is a face SWAP (export behaviour): the front — title, badge, reveal hint — is
    // replaced by the back, not merely appended to.
    expect(screen.queryByText(/Tap to reveal/)).toBeNull();
    expect(screen.queryByText('Resources')).toBeNull();
  });

  it('renders the front-image slot on card fronts when frontImage is set', () => {
    render(
      <FlipBlockView
        block={{ t: 'flip', chip: '#ffc8a6', frontImage: true, cards: [{ badge: '1', front: 'Card', back: 'Reveal.' }] }}
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
  it('shows the first spot by default and switches on selection', () => {
    render(<HotspotBlockView block={block} />);
    expect(screen.getByText('Fit it happens before.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Within' }));
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
  it('reorders via the Down button and reports the result', () => {
    render(<SortableBlockView block={block} />);
    fireEvent.click(screen.getByRole('button', { name: 'Move Own it down' }));
    fireEvent.click(screen.getByRole('button', { name: 'Check order' }));
    expect(screen.getByRole('status').textContent).toBe('Correct order');
  });
});
