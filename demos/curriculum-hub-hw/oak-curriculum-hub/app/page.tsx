import type { ReactElement } from 'react';
import HubLanding from '@/components/HubLanding';

// The Oak Curriculum Hub landing: a unified hub-wide search (hero → destinations when idle,
// grouped live + static results when searching). Chrome (nav/footer) is provided by the layout.
export default function Page(): ReactElement {
  return <HubLanding />;
}
