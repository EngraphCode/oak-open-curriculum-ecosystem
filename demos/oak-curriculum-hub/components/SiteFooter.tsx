import Image from 'next/image';
import type { ReactElement } from 'react';

import ThemeSwitcher from '@/components/ThemeSwitcher';

/**
 * Oak Curriculum Hub footer: a display-settings band (theme + motion controls
 * on the default surface, so the kit-styled selects stay theme-aware) above
 * the dark internal-hub bar with the inverted Oak mark, a one-line description
 * and an internal-use note. Faithful to the reference prototype's footer.
 * Muted text uses Oak grey40 (#cacaca) rather than the prototype's lighter
 * greys so the contrast on the dark surface meets WCAG 2.2 AA.
 */
export default function SiteFooter(): ReactElement {
  return (
    <footer className="border-t-[3px] border-line bg-surface-inverted text-white">
      <div className="bg-surface py-4 pl-4 pr-4 text-ink md:pl-7 md:pr-7">
        <div className="mx-auto flex max-w-[1240px] items-center justify-end">
          <ThemeSwitcher />
        </div>
      </div>
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-5 px-7 py-[34px]">
        <div className="flex items-center gap-3.5">
          <Image
            src="/oak-logo-mark.svg"
            alt="Oak National Academy"
            width={22}
            height={30}
            className="h-[30px] w-auto brightness-0 invert"
            unoptimized
          />
          <span className="max-w-[46ch] text-[15px] font-light leading-[21px] text-ink-inverted-subdued">
            Oak Curriculum and Lesson Creation &mdash; the internal hub for creating high-quality
            lessons at Oak.
          </span>
        </div>
        <div className="text-sm font-light leading-5 text-ink-inverted-subdued">
          Internal use &middot; Oak National Academy
        </div>
      </div>
      {/* Open Government Licence attribution — curriculum content shown here is OGL v3.0
          (root LICENCE-DATA.md); attribution is a condition of that licence. */}
      <div className="border-t border-line-neutral px-7 py-4">
        <p className="mx-auto max-w-[1240px] text-[13px] font-light leading-5 text-ink-inverted-subdued">
          Contains public sector information licensed under the{' '}
          <a
            href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-white underline"
          >
            Open Government Licence v3.0
          </a>
          {/* explicit expression: the full stop sits flush against the link */}
          {'.'}
        </p>
      </div>
    </footer>
  );
}
