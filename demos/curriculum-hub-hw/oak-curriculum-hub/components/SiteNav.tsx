import Image from 'next/image';
import Link from 'next/link';
import type { ReactElement } from 'react';

// Hub top-level sections, mirroring the reference prototype's header nav. Only
// the first two currently resolve to routes (built in C5); Rubrics/Exemplars/Wiki
// are same-page placeholders in the prototype too.
const navItems: readonly { readonly label: string; readonly href: string }[] = [
  { label: 'Training courses', href: '/course' },
  { label: 'Quality standards', href: '/standards' },
  { label: 'Rubrics', href: '/rubrics' },
  { label: 'Exemplars', href: '/exemplars' },
  { label: 'Wiki', href: '/wiki' },
];

const navLinkClass =
  'whitespace-nowrap rounded-oak-m2 px-[13px] py-[9px] text-[15px] font-semibold leading-none text-oak-black no-underline transition-colors hover:bg-oak-cream';

function HubNav(): ReactElement {
  return (
    <nav aria-label="Hub sections" className="ml-3.5 flex items-center gap-0.5">
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

/** Presentational hub-search affordance (the live search is the hero SearchHub). */
function HubSearch(): ReactElement {
  return (
    <div
      role="search"
      className="flex w-[230px] items-center gap-2 rounded-full border-2 border-oak-black bg-white px-3.5 py-[7px]"
    >
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        className="shrink-0 text-oak-grey"
        aria-hidden
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
      </svg>
      <input
        type="search"
        placeholder="Search the hub"
        aria-label="Search the hub"
        className="w-full border-none bg-transparent text-[15px] font-light leading-none text-oak-black outline-none placeholder:text-oak-grey"
      />
    </div>
  );
}

/**
 * Oak Curriculum Hub top chrome: sticky white header with the Oak logo, the hub
 * section nav, a hub search affordance and the account avatar. Faithful to the
 * reference prototype's rendered header (sticky, 3px black underline, 1240px
 * content width).
 */
export default function SiteNav(): ReactElement {
  return (
    <header className="sticky top-0 z-50 border-b-[3px] border-oak-black bg-white">
      <div className="mx-auto flex max-w-[1240px] items-center gap-5 px-7 py-3.5">
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
          <HubSearch />
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-oak-black bg-oak-mint text-[14px] font-bold leading-none"
            title="Your account"
            aria-label="Your account"
          >
            CT
          </span>
        </div>
      </div>
    </header>
  );
}
