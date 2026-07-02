import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CourseShell } from '@/components/course/CourseShell';
import type { Course } from '@/lib/course/types';

/**
 * A discriminating fixture: the intro (one section, one coursemap block so the provider wiring is
 * observable), two units, and two modules — module A under u1 with two sections, module B under u2
 * with one. It describes the shell's structure, not the real course's counts, so the tests stay
 * stable as the generated data changes.
 */
const fixture: Course = {
  units: [
    { id: 'u1', label: 'Unit 1', title: 'First unit' },
    { id: 'u2', label: 'Unit 2', title: 'Second unit' },
  ],
  intro: {
    id: 'intro',
    title: 'Welcome & overview',
    color: '#fff2aa',
    sections: [
      {
        id: 'introMain',
        title: 'Welcome to the course',
        blocks: [{ t: 'coursemap' }],
      },
    ],
  },
  modules: [
    {
      id: 'u1m1',
      unit: 'u1',
      title: 'Module A',
      color: '#eeeeee',
      colorStrong: '#cccccc',
      outcomes: ['Understand small steps'],
      sections: [
        { id: 'u1m1s1', title: 'Section one', blocks: [{ t: 'text', paras: ['Alpha paragraph'] }] },
        { id: 'u1m1s2', title: 'Section two', blocks: [{ t: 'heading', text: 'Beta heading' }] },
      ],
    },
    {
      id: 'u2m1',
      unit: 'u2',
      title: 'Module B',
      color: '#eeeeee',
      colorStrong: '#cccccc',
      outcomes: [],
      sections: [
        { id: 'u2m1s1', title: 'Section three', blocks: [{ t: 'text', paras: ['Gamma paragraph'] }] },
      ],
    },
  ],
};

describe('CourseShell — structure and content rendering', () => {
  it('renders the course title as the single h1', () => {
    render(<CourseShell course={fixture} title="Creating lessons at Oak" />);
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]?.textContent).toBe('Creating lessons at Oak');
  });

  it('renders a course-navigation landmark listing the intro and every unit with its modules', () => {
    render(<CourseShell course={fixture} title="Creating lessons at Oak" />);
    const nav = screen.getByRole('navigation', { name: 'Course navigation' });
    expect(within(nav).getByText('Welcome & overview')).toBeTruthy();
    expect(within(nav).getByText('First unit')).toBeTruthy();
    expect(within(nav).getByText('Second unit')).toBeTruthy();
    expect(within(nav).getByText('Module A')).toBeTruthy();
    expect(within(nav).getByText('Module B')).toBeTruthy();
  });

  it("renders each section's blocks through BlockRenderer", () => {
    render(<CourseShell course={fixture} title="Creating lessons at Oak" />);
    expect(screen.getByText('Alpha paragraph')).toBeTruthy();
    expect(screen.getByText('Beta heading')).toBeTruthy();
    expect(screen.getByText('Gamma paragraph')).toBeTruthy();
  });

  it('wires CourseNavProvider so an in-content coursemap block renders the module list', () => {
    render(<CourseShell course={fixture} title="Creating lessons at Oak" />);
    // The coursemap block (in the intro section) reads useCourseNav → the flat [intro, ...modules].
    const courseMap = screen.getByRole('navigation', { name: 'Course map' });
    expect(within(courseMap).getByText('Module A')).toBeTruthy();
    expect(within(courseMap).getByText('Module B')).toBeTruthy();
  });
});

describe('CourseShell — landmarks, deep-link targets and progress', () => {
  it('renders every section as a deep-link target keyed on its section id', () => {
    const { container } = render(<CourseShell course={fixture} title="Creating lessons at Oak" />);
    for (const id of ['introMain', 'u1m1s1', 'u1m1s2', 'u2m1s1']) {
      expect(container.querySelector(`#section-${id}`)).not.toBeNull();
    }
  });

  it('anchors each module element on its module id (the coursemap `#<moduleId>` scheme)', () => {
    const { container } = render(<CourseShell course={fixture} title="Creating lessons at Oak" />);
    expect(container.querySelector('#u1m1')).not.toBeNull();
    expect(container.querySelector('#u2m1')).not.toBeNull();
  });

  it('renders no nested <main> — the content is a labelled region, since the app layout owns main', () => {
    render(<CourseShell course={fixture} title="Creating lessons at Oak" />);
    expect(screen.queryByRole('main')).toBeNull();
    expect(screen.getByRole('region', { name: 'Course content' })).toBeTruthy();
  });

  it('renders a static module-progress indicator (fixed zero-state, no role=progressbar)', () => {
    render(<CourseShell course={fixture} title="Creating lessons at Oak" />);
    // The fixture carries two modules (Module A + Module B); the demo persists no progress.
    expect(screen.getByText('0 of 2 modules complete')).toBeTruthy();
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('moves focus to the deep-linked section on arrival at #section=<id> (SC 2.4.3)', () => {
    globalThis.location.hash = '#section=u1m1s1';
    try {
      render(<CourseShell course={fixture} title="Creating lessons at Oak" />);
      expect(document.activeElement?.id).toBe('section-u1m1s1');
    } finally {
      globalThis.location.hash = '';
    }
  });
});
