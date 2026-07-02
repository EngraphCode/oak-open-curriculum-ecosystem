import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import CurriculumShowcase from '@/components/curriculum/CurriculumShowcase';

export const metadata: Metadata = {
  title: 'Oak curriculum search — Oak Curriculum Hub',
  description:
    'Semantic search over the published national curriculum — live lessons, units and learning ' +
    'threads from Elasticsearch through the Oak search SDK, with highlighted matches and ' +
    'per-scope timings.',
};

/**
 * The E3 `/curriculum` showcase: the demo's standout live capability (semantic search through
 * the Oak search SDK) on its own dedicated page — the 6th destination card's target. No
 * canonical export counterpart (new-by-design, owner-ratified): designed to tokens on the hub's
 * design language.
 */
export default function CurriculumPage(): ReactElement {
  return <CurriculumShowcase />;
}
