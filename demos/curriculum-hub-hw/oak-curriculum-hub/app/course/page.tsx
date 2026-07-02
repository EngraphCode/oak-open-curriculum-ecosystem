import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { CourseShell } from '@/components/course/CourseShell';
import { oakCourse } from '@/lib/course/oak-course.generated';

/** The full course title, grounded first-hand from the canonical export (`Oak Course.dc.html` h1). */
const COURSE_TITLE = 'Creating lessons at Oak';

export const metadata: Metadata = {
  title: `${COURSE_TITLE} — Oak Curriculum Hub`,
  description:
    'A professional course on planning and creating high-quality Oak lessons: the learning framework, ' +
    'high-quality explanation and checks for understanding, practice and feedback, questioning and quizzes.',
};

/**
 * The `/course` route renders the full Oak Course (`oakCourse`, 214 blocks / 4 units / 11 modules,
 * compile-time-validated against the Block union) through the shared {@link CourseShell}. The shell
 * owns the page `h1` (the course title in its sidebar), so this page adds no heading of its own.
 */
export default function CoursePage(): ReactElement {
  return <CourseShell course={oakCourse} title={COURSE_TITLE} />;
}
