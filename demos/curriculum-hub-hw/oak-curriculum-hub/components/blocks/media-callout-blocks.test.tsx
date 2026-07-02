import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CalloutBlockView } from '@/components/blocks/CalloutBlockView';
import { ImageBlockView } from '@/components/blocks/ImageBlockView';
import { VideoBlockView } from '@/components/blocks/VideoBlockView';
import { VideoImportBlockView } from '@/components/blocks/VideoImportBlockView';

describe('CalloutBlockView', () => {
  it('renders a single quality standard as a QS-chip link deep-linking /standards#qs=', () => {
    render(
      <CalloutBlockView
        block={{ t: 'callout', variant: 'info', title: 'Quality standard', qs: ['QS-87'], text: 'Small steps.' }}
      />,
    );
    const chip = screen.getByRole('link', { name: 'QS-87' });
    expect(chip.getAttribute('href')).toBe('/standards#qs=QS-87');
    expect(screen.getByText(/Small steps\./)).toBeTruthy();
  });

  it('renders each standard as its own bullet for a multi-standard callout', () => {
    render(
      <CalloutBlockView
        block={{
          t: 'callout',
          variant: 'info',
          title: 'Quality standard',
          items: [
            { qs: 'QS-87', text: 'Small steps.' },
            { qs: 'QS-85', text: 'Key points evident.' },
          ],
        }}
      />,
    );
    expect(screen.getByRole('link', { name: 'QS-87' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'QS-85' })).toBeTruthy();
  });

  it('renders a non-standard callout as its title and prose', () => {
    render(<CalloutBlockView block={{ t: 'callout', variant: 'tip', title: 'Welcome', text: 'We help you plan.' }} />);
    expect(screen.getByText('Welcome')).toBeTruthy();
    expect(screen.getByText('We help you plan.')).toBeTruthy();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('renders a titleless quote callout with its prose and an attribution citation', () => {
    render(
      <CalloutBlockView
        block={{ t: 'callout', variant: 'quote', text: 'Small steps win.', attrib: 'Rosenshine' }}
      />,
    );
    expect(screen.getByText('Small steps win.')).toBeTruthy();
    expect(screen.getByText('— Rosenshine')).toBeTruthy();
  });
});

describe('ImageBlockView', () => {
  it('renders the placeholder as a labelled region with its caption', () => {
    render(
      <ImageBlockView
        block={{ t: 'image', placeholder: 'Lesson creation diagram', caption: 'The suggested order.' }}
      />,
    );
    expect(screen.getByRole('img', { name: 'Lesson creation diagram' })).toBeTruthy();
    expect(screen.getByText('The suggested order.')).toBeTruthy();
  });
});

describe('VideoBlockView', () => {
  it('renders a described slot with its caption', () => {
    render(<VideoBlockView block={{ t: 'video', caption: 'Course intro.', placeholder: 'Intro video' }} />);
    expect(screen.getByRole('img', { name: 'Intro video' })).toBeTruthy();
    expect(screen.getByText('Course intro.')).toBeTruthy();
  });
});

describe('VideoImportBlockView', () => {
  it('renders a described media slot (duration labelled by caption) for a generic embed', () => {
    render(
      <VideoImportBlockView
        block={{ t: 'videoimport', embed: 'clip', filename: 'intro.mp4', duration: '2:02', caption: 'Course introduction clip.' }}
      />,
    );
    expect(screen.getByRole('img', { name: 'Course introduction clip.' })).toBeTruthy();
    expect(screen.getByText('2:02')).toBeTruthy();
  });

  it('reproduces the interactive LearningFramework for the learningframework embed (Option A)', () => {
    render(
      <VideoImportBlockView
        block={{ t: 'videoimport', embed: 'learningframework', filename: 'lf.mp4', duration: '2:02', caption: 'The learning framework explained.' }}
      />,
    );
    // The framework mounts its static, accessible baseline (reduced-motion defaults true in tests);
    // the described-media-slot fallback is NOT rendered for this embed.
    expect(screen.getByRole('list', { name: 'The seven stages' })).toBeTruthy();
    expect(screen.queryByRole('img', { name: 'The learning framework explained.' })).toBeNull();
  });
});
