import type { ReactElement, ReactNode } from 'react';

/**
 * Shared page-header band for the hub's section routes (course, standards, rubrics, exemplars,
 * wiki). A single source for the "Curriculum hub" kicker + title + intro so every section page
 * matches the hub chrome. `tint` is the Oak decorative background for the band.
 */
export function PageHeader({
  title,
  intro,
  tint,
}: {
  title: string;
  intro: ReactNode;
  tint: string;
}): ReactElement {
  return (
    <header className={`border-b-2 border-oak-black ${tint}`}>
      <div className="mx-auto max-w-[1080px] px-6 py-10">
        <p className="mb-2 text-[13px] font-bold uppercase tracking-[0.06em] text-oak-navy">
          Curriculum hub
        </p>
        <h1 className="text-[32px] font-bold leading-tight">{title}</h1>
        <p className="mt-2 max-w-[640px] text-[16px] font-light leading-relaxed text-oak-grey">
          {intro}
        </p>
      </div>
    </header>
  );
}

/**
 * Honest empty-state notice for a section whose content was not decodable from the prototype.
 * Never fabricates content — states plainly that the section is not included in this demo.
 */
export function HonestEmptyNotice({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactElement {
  return (
    <div className="mx-auto max-w-[1080px] px-6 pb-20 pt-8">
      <div className="max-w-[560px] rounded-[10px] border-2 border-l-[6px] border-oak-black bg-oak-notice px-[18px] py-4">
        <h2 className="mb-1 text-base font-semibold leading-tight">{title}</h2>
        <p className="text-sm font-light leading-[1.55] text-oak-grey">{children}</p>
      </div>
    </div>
  );
}
