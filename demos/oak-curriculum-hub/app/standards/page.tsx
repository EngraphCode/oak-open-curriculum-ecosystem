import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import StandardsBrowser from '@/components/StandardsBrowser';

export const metadata: Metadata = {
  title: 'Quality standards — Oak Curriculum Hub',
  description:
    'Browse and filter the Oak quality standards that lessons are assessed against, by guidance area, rubric and resource.',
};

/**
 * `/standards` — the Oak Quality Standards browser (reproduces `Oak Standards.dc.html`). The page
 * itself is a thin shell: the interactive page-head (search), guidance-area rail, filter chips and
 * paginated result list all live in the client {@link StandardsBrowser}, which owns browse state.
 */
export default function StandardsPage(): ReactElement {
  return <StandardsBrowser />;
}
