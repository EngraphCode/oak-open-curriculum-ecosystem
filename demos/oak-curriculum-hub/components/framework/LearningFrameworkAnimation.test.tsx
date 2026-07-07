import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import LearningFrameworkAnimation from '@/components/framework/LearningFrameworkAnimation';

afterEach(cleanup);

describe('LearningFrameworkAnimation — the SC 2.2.2 pause control over the auto-play walk-through', () => {
  it('offers a keyboard-operable control to stop the motion, playing by default (SC 2.2.2 needs an in-content stop)', () => {
    render(<LearningFrameworkAnimation />);
    // A native <button> is keyboard-operable; its accessible name states the action it performs.
    expect(screen.getByRole('button', { name: 'Pause animation' })).toBeTruthy();
  });

  it('toggles between pause and play so every user can stop and restart the motion', () => {
    render(<LearningFrameworkAnimation />);
    fireEvent.click(screen.getByRole('button', { name: 'Pause animation' }));
    expect(screen.getByRole('button', { name: 'Play animation' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Play animation' }));
    expect(screen.getByRole('button', { name: 'Pause animation' })).toBeTruthy();
  });

  it('stops the walk-through clock when paused (the motion actually halts, not just the label)', () => {
    const cancel = vi.spyOn(globalThis, 'cancelAnimationFrame');
    render(<LearningFrameworkAnimation />);
    fireEvent.click(screen.getByRole('button', { name: 'Pause animation' }));
    expect(cancel).toHaveBeenCalled();
    cancel.mockRestore();
  });

  it('cancels the animation frame on unmount (no leaked rAF loop)', () => {
    const cancel = vi.spyOn(globalThis, 'cancelAnimationFrame');
    const { unmount } = render(<LearningFrameworkAnimation />);
    unmount();
    expect(cancel).toHaveBeenCalled();
    cancel.mockRestore();
  });

  it('renders the static seven-stage baseline alongside the control (accessibility never depends on motion)', () => {
    render(<LearningFrameworkAnimation />);
    const list = screen.getByRole('list', { name: 'The seven stages' });
    expect(list.tagName).toBe('OL');
  });
});
