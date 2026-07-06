import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ColumnsBlockView } from '@/components/blocks/ColumnsBlockView';
import { CompareBlockView } from '@/components/blocks/CompareBlockView';
import { DownloadBlockView } from '@/components/blocks/DownloadBlockView';
import { HeadingBlockView } from '@/components/blocks/HeadingBlockView';
import { StatsBlockView } from '@/components/blocks/StatsBlockView';
import { SummaryBlockView } from '@/components/blocks/SummaryBlockView';
import { TextBlockView } from '@/components/blocks/TextBlockView';

describe('TextBlockView', () => {
  it('renders one paragraph per entry', () => {
    render(<TextBlockView block={{ t: 'text', paras: ['Alpha para.', 'Beta para.'] }} />);
    expect(screen.getByText('Alpha para.')).toBeTruthy();
    expect(screen.getByText('Beta para.')).toBeTruthy();
  });
});

describe('HeadingBlockView', () => {
  it('renders the text as a heading', () => {
    render(<HeadingBlockView block={{ t: 'heading', text: 'The eight components' }} />);
    expect(screen.getByRole('heading', { name: 'The eight components' })).toBeTruthy();
  });
});

describe('SummaryBlockView', () => {
  it('renders each point and the reflection question under the export labels', () => {
    render(
      <SummaryBlockView
        block={{ t: 'summary', points: ['Lessons scale.'], question: 'What changes for you?' }}
      />,
    );
    expect(screen.getByText('Lessons scale.')).toBeTruthy();
    expect(screen.getByText('What changes for you?')).toBeTruthy();
    expect(screen.getByText('Key takeaways')).toBeTruthy();
    expect(screen.getByText('Reflect as you design')).toBeTruthy();
  });
});

describe('StatsBlockView', () => {
  it('renders the intro, each stat value and label', () => {
    render(
      <StatsBlockView
        block={{
          t: 'stats',
          intro: 'In 2022:',
          items: [{ value: '102,000', label: 'pupils each week' }],
        }}
      />,
    );
    expect(screen.getByText('In 2022:')).toBeTruthy();
    expect(screen.getByText('102,000')).toBeTruthy();
    expect(screen.getByText(/pupils each week/)).toBeTruthy();
  });
});

describe('ColumnsBlockView', () => {
  it('renders each column title and its points', () => {
    render(
      <ColumnsBlockView
        block={{
          t: 'columns',
          cols: [{ title: 'Starter quiz', points: ['Six questions', 'Activates prior knowledge'] }],
        }}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Starter quiz' })).toBeTruthy();
    expect(screen.getByText('Six questions')).toBeTruthy();
  });

  it('marks every point with the green tick, excluded from the accessible tree', () => {
    render(
      <ColumnsBlockView
        block={{
          t: 'columns',
          cols: [{ title: 'Starter quiz', points: ['Six questions', 'Activates prior knowledge'] }],
        }}
      />,
    );
    const ticks = screen.getAllByText('✓');
    expect(ticks).toHaveLength(2);
    expect(ticks.every((tick) => tick.getAttribute('aria-hidden') === 'true')).toBe(true);
  });
});

describe('DownloadBlockView', () => {
  it('renders a root-resolved download card with title, meta and the Download pill', () => {
    render(
      <DownloadBlockView
        block={{
          t: 'download',
          title: 'Planning tool',
          desc: 'A step-by-step template.',
          meta: 'PDF · 1 page',
          href: 'assets/plan.pdf',
        }}
      />,
    );
    const link = screen.getByRole('link', { name: /Planning tool/ });
    expect(link.getAttribute('href')).toBe('/assets/plan.pdf');
    expect(screen.getByText('PDF · 1 page')).toBeTruthy();
    expect(screen.getByText('Download')).toBeTruthy();
  });
});

describe('CompareBlockView', () => {
  it('renders the example and non-example with their notes', () => {
    render(
      <CompareBlockView
        block={{
          t: 'compare',
          goodText: 'Plain white background.',
          goodNote: 'Meets 4.5:1 contrast.',
          badText: 'Coloured background.',
          badNote: 'Risks failing contrast.',
        }}
      />,
    );
    expect(screen.getByText('Plain white background.')).toBeTruthy();
    expect(screen.getByText('Coloured background.')).toBeTruthy();
    expect(screen.getByText('Meets 4.5:1 contrast.')).toBeTruthy();
  });

  it('heads each panel with its visible bar, and names the panel to match', () => {
    render(
      <CompareBlockView
        block={{
          t: 'compare',
          goodText: 'Plain white background.',
          badText: 'Coloured background.',
        }}
      />,
    );
    expect(screen.getByText('Example')).toBeTruthy();
    expect(screen.getByText('Non-example')).toBeTruthy();
    expect(screen.getByText('✓').getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByText('✕').getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByRole('region', { name: 'Example' })).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Non-example' })).toBeTruthy();
  });
});
