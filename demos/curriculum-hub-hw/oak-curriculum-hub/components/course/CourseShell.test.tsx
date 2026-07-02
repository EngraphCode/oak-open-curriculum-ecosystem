import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { CourseShell } from '@/components/course/CourseShell';

import { courseFixture as fixture } from './course-shell.test-fixtures';

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

  it('renders a static section-progress indicator (fixed zero-state, no role=progressbar)', () => {
    render(<CourseShell course={fixture} title="Creating lessons at Oak" />);
    // Export-grounded: progress counts MODULE sections ("0 of 63 done" on the real course — the
    // intro's section is excluded). The fixture carries three module sections; no persisted progress.
    expect(screen.getByText('0 of 3 done')).toBeTruthy();
    expect(screen.queryByRole('progressbar')).toBeNull();
  });
});

describe('CourseShell — sidebar (export-grounded spec)', () => {
  afterEach(() => {
    globalThis.location.hash = '';
  });

  it('renders each unit as a dark pill + visible title label (a group header, not a numbered badge)', () => {
    render(<CourseShell course={fixture} title="Creating lessons at Oak" />);
    const nav = screen.getByRole('navigation', { name: 'Course navigation' });
    expect(within(nav).getByText('Unit 1')).toBeTruthy();
    expect(within(nav).getByText('First unit')).toBeTruthy();
    expect(within(nav).getByText('Unit 2')).toBeTruthy();
  });

  it('numbers module badges PER UNIT (each unit restarts at 1)', () => {
    render(<CourseShell course={fixture} title="Creating lessons at Oak" />);
    const nav = screen.getByRole('navigation', { name: 'Course navigation' });
    const moduleA = within(nav).getByRole('button', { name: 'Module A' });
    const moduleB = within(nav).getByRole('button', { name: 'Module B' });
    expect(within(moduleA).getByText('1')).toBeTruthy();
    expect(within(moduleB).getByText('1')).toBeTruthy();
  });

  it('marks the intro item current on a plain arrival, with every module collapsed', () => {
    render(<CourseShell course={fixture} title="Creating lessons at Oak" />);
    // Scoped to the nav landmark: the in-content coursemap block renders same-named links.
    const nav = screen.getByRole('navigation', { name: 'Course navigation' });
    const introLink = within(nav).getByRole('link', { name: 'Welcome & overview' });
    expect(introLink.getAttribute('aria-current')).toBe('true');
    expect(within(nav).getByRole('button', { name: 'Module A' }).getAttribute('aria-expanded')).toBe(
      'false',
    );
    expect(within(nav).queryByRole('link', { name: 'Section one' })).toBeNull();
  });
});

describe('CourseShell — sidebar disclosure and current-marking', () => {
  afterEach(() => {
    globalThis.location.hash = '';
  });

  it("expands the active section's module after a deep-link arrival and marks its row current", () => {
    globalThis.location.hash = '#section=u1m1s1';
    render(<CourseShell course={fixture} title="Creating lessons at Oak" />);
    const nav = screen.getByRole('navigation', { name: 'Course navigation' });
    const moduleA = within(nav).getByRole('button', { name: 'Module A' });
    expect(moduleA.getAttribute('aria-expanded')).toBe('true');
    const rowOne = within(nav).getByRole('link', { name: 'Section one' });
    expect(rowOne.getAttribute('aria-current')).toBe('true');
    expect(within(nav).getByRole('link', { name: 'Section two' }).getAttribute('aria-current')).toBeNull();
    expect(
      within(nav).getByRole('link', { name: 'Welcome & overview' }).getAttribute('aria-current'),
    ).toBeNull();
  });

  it('toggles a module open to browse its section rows without navigating', () => {
    render(<CourseShell course={fixture} title="Creating lessons at Oak" />);
    const nav = screen.getByRole('navigation', { name: 'Course navigation' });
    const moduleB = within(nav).getByRole('button', { name: 'Module B' });
    fireEvent.click(moduleB);
    expect(moduleB.getAttribute('aria-expanded')).toBe('true');
    const row = within(nav).getByRole('link', { name: 'Section three' });
    expect(row.getAttribute('href')).toBe('#section=u2m1s1');
    // Browsing does not navigate: the intro stays the current item.
    expect(
      within(nav).getByRole('link', { name: 'Welcome & overview' }).getAttribute('aria-current'),
    ).toBe('true');
    fireEvent.click(moduleB);
    expect(within(nav).queryByRole('link', { name: 'Section three' })).toBeNull();
  });
});

describe('CourseShell — content eyebrow pills (export-grounded)', () => {
  it('renders the intro eyebrow as "Course overview", not the intro module title', () => {
    render(<CourseShell course={fixture} title="Creating lessons at Oak" />);
    expect(screen.getByText('Course overview')).toBeTruthy();
  });

  it("tints each module's eyebrow pill with the module accent colour (not hardcoded lemon)", () => {
    const { container } = render(<CourseShell course={fixture} title="Creating lessons at Oak" />);
    const pill = container.querySelector<HTMLElement>('#module-h-u1m1');
    expect(pill?.style.backgroundColor).toBe('#aabbcc');
  });
});
