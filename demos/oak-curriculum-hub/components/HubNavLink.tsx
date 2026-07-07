import Link from 'next/link';
import type { ReactElement } from 'react';

/**
 * One hub section entry: label plus an app route or an external https URL —
 * the closed template-literal union makes the external branch below
 * compiler-enforced at the authoring site, not a runtime string sniff.
 */
export interface HubNavItem {
  readonly label: string;
  readonly href: `/${string}` | `https://${string}`;
}

/**
 * One hub nav entry, shared by the inline header nav and the disclosure menu
 * panel (extracted at its second consumer). Internal routes render through
 * `next/link`; an external href (E1 — the Oak-website link-out) renders a
 * new-tab anchor with the demo's ↗ affordance and an sr-only "(opens in new
 * tab)" suffix, so leaving the hub is conveyed to every user, not just
 * sighted ones. `onChoose` is only ever bound by the client menu panel — the
 * server-rendered inline nav passes nothing.
 */
export function HubNavLink({
  item,
  className,
  onChoose,
}: {
  readonly item: HubNavItem;
  readonly className: string;
  readonly onChoose?: () => void;
}): ReactElement {
  if (item.href.startsWith('https://')) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onChoose}
      >
        {item.label}{' '}
        <span aria-hidden="true" className="text-[13px]">
          ↗
        </span>
        <span className="sr-only"> (opens in new tab)</span>
      </a>
    );
  }
  return (
    <Link href={item.href} className={className} onClick={onChoose}>
      {item.label}
    </Link>
  );
}
