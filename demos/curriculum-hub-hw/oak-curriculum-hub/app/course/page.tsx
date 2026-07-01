import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import Link from 'next/link';
import { trainingCourses } from '@/lib/static-training-courses';

export const metadata: Metadata = {
  title: 'Training courses — Oak Curriculum Hub',
  description: 'Self-paced eLearning courses for creating Oak lessons.',
};

/**
 * C5 /course route. Honest empty state: no training-course data was decodable from the prototype
 * (see lib/static-training-courses.ts), so this renders a truthful "not in this demo" state rather
 * than fabricated course content. If a real source is wired later, the populated branch renders it.
 */
export default function CoursePage(): ReactElement {
  return (
    <>
      <header className="border-b-2 border-oak-black bg-oak-aqua">
        <div className="mx-auto max-w-[1080px] px-6 py-10">
          <p className="mb-2 text-[13px] font-bold uppercase tracking-[0.06em] text-oak-navy">
            Curriculum hub
          </p>
          <h1 className="text-[32px] font-bold leading-tight">Training courses</h1>
          <p className="mt-2 max-w-[640px] text-[16px] font-light leading-relaxed text-oak-grey">
            Self-paced eLearning courses for creating Oak lessons.
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-[1080px] px-6 pb-20 pt-8">
        {trainingCourses.length === 0 ? (
          <div className="max-w-[560px] rounded-[10px] border-2 border-l-[6px] border-oak-black bg-oak-notice px-[18px] py-4">
            <h2 className="mb-1 text-base font-semibold leading-tight">Not included in this demo</h2>
            <p className="text-sm font-light leading-[1.55] text-oak-grey">
              No training-course content was available to wire into this demo, so this section is
              intentionally empty rather than showing placeholder courses. Head back to{' '}
              <Link href="/" className="font-bold text-oak-navy underline">
                the curriculum hub
              </Link>{' '}
              to search the live curriculum and quality standards.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {trainingCourses.map((c) => (
              <li key={c.id}>
                <a href={c.href} className="font-bold text-oak-navy underline">
                  {c.title}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
