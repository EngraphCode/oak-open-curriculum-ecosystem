import Image from 'next/image';
import Link from 'next/link';
import type { ReactElement } from 'react';

import { HubSearch } from '@/components/HubSearch';
import { MobileHubNav } from '@/components/MobileHubNav';
import type { HubNavItem } from '@/components/MobileHubNav';

// Hub top-level sections, mirroring the reference prototype's header nav. Only
// the first two currently resolve to routes (built in C5); Rubrics/Exemplars/Wiki
// are same-page placeholders in the prototype too.
const navItems: readonly HubNavItem[] = [
  { label: 'Training courses', href: '/course' },
  { label: 'Quality standards', href: '/standards' },
  { label: 'Rubrics', href: '/rubrics' },
  { label: 'Exemplars', href: '/exemplars' },
  { label: 'Wiki', href: '/wiki' },
];

const navLinkClass =
  'whitespace-nowrap rounded-oak-m2 px-[13px] py-[9px] text-[15px] font-semibold leading-none text-oak-black no-underline transition-colors hover:bg-oak-cream';

/** The inline sections nav — `md:` up only; small viewports use {@link MobileHubNav}. */
function HubNav(): ReactElement {
  return (
    <nav aria-label="Hub sections" className="ml-3.5 hidden items-center gap-0.5 md:flex">
      {navItems.map((item) =>
        item.href.startsWith('/') ? (
          <Link key={item.label} href={item.href} className={navLinkClass}>
            {item.label}
          </Link>
        ) : (
          <a key={item.label} href={item.href} className={navLinkClass}>
            {item.label}
          </a>
        ),
      )}
    </nav>
  );
}

/**
 * Oak Curriculum Hub top chrome: sticky white header with the Oak logo, the hub
 * section nav, a hub search affordance and the account avatar. Faithful to the
 * reference prototype's rendered header (sticky, 3px black underline, 1240px
 * content width). Below `md:` the nav and search collapse into the
 * {@link MobileHubNav} disclosure so the header reflows cleanly at 320px
 * (WCAG 1.4.10); the export has no small-width header precedent, so the
 * pattern is designed to tokens on the course drawer's design language.
 */
export default function SiteNav(): ReactElement {
  return (
    <header className="relative sticky top-0 z-50 border-b-[3px] border-oak-black bg-white">
      <div className="mx-auto flex max-w-[1240px] items-center gap-5 px-4 py-3.5 md:px-7">
        <Link href="/" aria-label="Oak Curriculum Hub — home" className="flex shrink-0 items-center">
          {/* Official Oak logo (full lockup) from the canonical Claude Design export,
              served from public/. */}
          <Image
            src="/oak-logo.svg"
            alt="Oak National Academy"
            width={74}
            height={34}
            className="h-[34px] w-auto"
            unoptimized
            priority
          />
        </Link>
        <HubNav />
        <div className="ml-auto flex items-center gap-3.5">
          <div className="hidden w-[230px] md:block">
            <HubSearch />
          </div>
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-oak-black bg-oak-mint text-[14px] font-bold leading-none"
            title="Your account"
            aria-label="Your account"
          >
            CT
          </span>
          <MobileHubNav items={navItems} />
        </div>
      </div>
    </header>
  );
}
