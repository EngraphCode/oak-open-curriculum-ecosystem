import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import RubricsBrowser from '@/components/RubricsBrowser';

export const metadata: Metadata = {
  title: 'Rubrics — Oak Curriculum Hub',
  description:
    'The assessment rubrics behind the Oak quality standards — filter the rubric-bearing standards by rubric.',
};

/**
 * The `/rubrics` route: a real quality-standard facet view over the three assessment rubrics
 * (the 299 rubric-bearing standards of the 685), filterable by rubric, each deep-linking to its
 * detail on `/standards`. Real data via the `standards-view` seam — no fabrication, no stub.
 */
export default function RubricsPage(): ReactElement {
  return <RubricsBrowser />;
}
