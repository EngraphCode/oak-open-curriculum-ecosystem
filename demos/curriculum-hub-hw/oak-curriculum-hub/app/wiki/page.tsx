import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import Link from 'next/link';
import { PageHeader, HonestEmptyNotice } from '@/components/SectionScaffold';

export const metadata: Metadata = {
  title: 'Wiki — Oak Curriculum Hub',
  description: 'Shared guidance and ways of working for creating Oak lessons.',
};

/**
 * C5/item-3 /wiki route. No wiki content was decodable from the prototype (verified first-hand),
 * so this is an honest empty state — never fabricated guidance.
 */
export default function WikiPage(): ReactElement {
  return (
    <>
      <PageHeader
        title="Wiki"
        intro="Shared guidance and ways of working for creating high-quality lessons."
        tint="bg-oak-lemon-subdued"
      />
      <HonestEmptyNotice title="Not included in this demo">
        No wiki content was available to wire into this demo, so this section is intentionally empty
        rather than showing placeholder articles. Head back to{' '}
        <Link href="/" className="font-bold text-oak-navy underline">
          the curriculum hub
        </Link>{' '}
        to search the live curriculum and quality standards.
      </HonestEmptyNotice>
    </>
  );
}
