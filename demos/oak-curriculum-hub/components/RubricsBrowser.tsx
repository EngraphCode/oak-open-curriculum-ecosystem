'use client';

import { useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import Link from 'next/link';

import { PageHeader } from './SectionScaffold';
import { standardsFacets, browseStandards } from '@/lib/standards-view';
import type { QualityStandard } from '@/lib/static-quality-standards';

/** Sentinel for the "All rubrics" (no rubric constraint) facet selection. */
const ALL = 'ALL';

/** A rubric-filtered standard row: black-bordered white pill with a lemon hover shadow, deep-linking
 *  to the standard's detail on the /standards page (the same `#qs=` target the Course callouts use). */
const rowLinkClass =
  'flex items-center gap-3 rounded-xl border-2 border-oak-black bg-white px-4 py-3 text-oak-black no-underline transition-shadow hover:shadow-oak-lemon';

/** One quality-standard row under the selected rubric, linking to its /standards detail. */
function RubricStandardRow({ standard }: { standard: QualityStandard }): ReactElement {
  const badge = standard.code !== '' ? standard.code : standard.id;
  const area = standard.areas[0];
  return (
    <Link href={`/standards#qs=${standard.id}`} className={rowLinkClass}>
      <span className="shrink-0 rounded-oak-s border border-oak-navy px-2 py-0.5 text-[11px] font-bold text-oak-navy">
        {badge}
      </span>
      <span className="flex-1 text-[14px] leading-snug">{standard.text}</span>
      {area !== undefined && (
        <span className="shrink-0 rounded-full border border-oak-grey-line px-2.5 py-1 text-[11px] font-bold text-oak-grey">
          {area}
        </span>
      )}
    </Link>
  );
}

/** A rubric facet toggle: the rubric name and its live count; the count carries an sr-only unit so
 *  a screen reader announces "Pedagogical Rubric, 89 standards", not "Pedagogical Rubric, 89". */
function RubricFacet({
  label,
  count,
  pressed,
  onSelect,
}: {
  label: string;
  count: number;
  pressed: boolean;
  onSelect: () => void;
}): ReactElement {
  const tint = pressed ? 'bg-oak-black text-white' : 'bg-white text-oak-black';
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onSelect}
      className={`flex items-center gap-2 rounded-full border-2 border-oak-black px-4 py-1.5 text-[13px] font-bold transition-colors ${tint}`}
    >
      <span>{label}</span>
      <span className={pressed ? 'text-white/80' : 'text-oak-grey'}>
        {count}
        <span className="sr-only"> standards</span>
      </span>
    </button>
  );
}

/**
 * The Rubrics page: a real quality-standard facet view over the three assessment rubrics
 * (`Pedagogical Rubric`, `Technical Rubric`, `Curriculum and Lesson Specification - Annex B`). It
 * lists the 299 rubric-bearing standards, filterable to a single rubric, each row deep-linking to
 * its detail on `/standards`. Real data from the `standards-view` seam — no fabrication, no stub.
 */
export default function RubricsBrowser(): ReactElement {
  const [selected, setSelected] = useState<string>(ALL);

  const rubricFacets = useMemo(() => standardsFacets().rubrics, []);
  const rubricBearing = useMemo(() => browseStandards({}).filter((s) => s.rubrics.length > 0), []);
  const results = useMemo(
    () => (selected === ALL ? rubricBearing : browseStandards({ rubric: selected })),
    [selected, rubricBearing],
  );

  const scope = selected === ALL ? '' : ` in ${selected}`;
  const countLabel = `Showing ${results.length} ${results.length === 1 ? 'standard' : 'standards'}${scope}`;

  return (
    <>
      <PageHeader
        title="Rubrics"
        intro="The assessment rubrics behind the Oak quality standards. Filter the rubric-bearing standards by rubric to see exactly which benchmarks each one covers."
        tint="bg-oak-aqua"
      />
      <section aria-label="Rubrics results" className="mx-auto max-w-[1080px] px-6 pb-20 pt-8">
        <nav aria-label="Filter by rubric" className="mb-5 flex flex-wrap gap-2.5">
          <RubricFacet
            label="All rubrics"
            count={rubricBearing.length}
            pressed={selected === ALL}
            onSelect={() => setSelected(ALL)}
          />
          {rubricFacets.map((facet) => (
            <RubricFacet
              key={facet.value}
              label={facet.value}
              count={facet.count}
              pressed={selected === facet.value}
              onSelect={() => setSelected(facet.value)}
            />
          ))}
        </nav>
        <output className="mb-4 block text-[14px] text-oak-grey">{countLabel}</output>
        <div className="flex flex-col gap-2.5">
          {results.map((standard) => (
            <RubricStandardRow key={standard.id} standard={standard} />
          ))}
        </div>
      </section>
    </>
  );
}
