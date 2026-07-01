import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import Link from 'next/link';
import { PageHeader, HonestEmptyNotice } from '@/components/SectionScaffold';

export const metadata: Metadata = {
  title: 'Exemplars — Oak Curriculum Hub',
  description: 'Worked examples of the Oak quality standards in practice.',
};

/**
 * C5/item-3 /exemplars route. No exemplar content was decodable from the prototype (verified
 * first-hand), so this is an honest empty state — never fabricated worked examples.
 */
export default function ExemplarsPage(): ReactElement {
  return (
    <>
      <PageHeader
        title="Exemplars"
        intro="Worked examples of the quality standards in practice."
        tint="bg-oak-pink-subdued"
      />
      <HonestEmptyNotice title="Not included in this demo">
        No exemplar content was available to wire into this demo, so this section is intentionally
        empty rather than showing placeholder examples. See the{' '}
        <Link href="/standards" className="font-bold text-oak-navy underline">
          quality standards
        </Link>{' '}
        the exemplars would illustrate.
      </HonestEmptyNotice>
    </>
  );
}
