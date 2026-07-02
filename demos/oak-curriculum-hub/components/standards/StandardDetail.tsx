import type { ReactElement, RefObject } from 'react';
import type { AreaTag, StandardDetailVM } from '@/lib/standards-view-model';
import { StandardExemplification } from './StandardExemplification';

/**
 * The quality-standard detail view (reproduces the `Oak Standards.dc.html` detail pane): a back
 * control, the statement card (id, type, rubric code, wording), a meta grid (guidance area /
 * applies-to / assessed-in rubric), the faithful {@link StandardExemplification} scaffolding, and
 * related standards in the same area. Pure presentational — driven by the {@link StandardDetailVM}.
 */

/** Inline style for a data-derived guidance-area tag colour. */
function areaTagStyle(colour: string): { readonly backgroundColor: string } {
  return { backgroundColor: colour };
}

/** A row of coloured guidance-area tags, or an em-dash when there are none. */
function AreaTags({ tags }: { readonly tags: readonly AreaTag[] }): ReactElement {
  if (tags.length === 0) {
    return <span className="text-oak-grey">—</span>;
  }
  return (
    <span className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag.label}
          style={areaTagStyle(tag.colour)}
          className="rounded-full border-2 border-oak-black px-2.5 py-1.5 text-[13px] font-bold text-oak-black"
        >
          {tag.label}
        </span>
      ))}
    </span>
  );
}

/** A comma-free chip list of plain strings, or an em-dash when empty. */
function ChipList({ values, tint }: { readonly values: readonly string[]; readonly tint: string }): ReactElement {
  if (values.length === 0) {
    return <span className="text-oak-grey">—</span>;
  }
  return (
    <span className="flex flex-wrap gap-1.5">
      {values.map((value) => (
        <span key={value} className={`rounded-full px-2.5 py-1.5 text-[13px] ${tint}`}>
          {value}
        </span>
      ))}
    </span>
  );
}

/** Pill tint per statement type (default white for the unmapped case). */
function pillTintOf(typeVariant: StandardDetailVM['typeVariant']): string {
  if (typeVariant === 'required') {
    return 'bg-oak-lemon';
  }
  if (typeVariant === 'model') {
    return 'bg-oak-lavender-subdued';
  }
  return 'bg-white';
}

/** The statement card header: id badge, long type label, and optional rubric code. */
function StatementHeader({ vm }: { readonly vm: StandardDetailVM }): ReactElement {
  const pillTint = pillTintOf(vm.typeVariant);
  return (
    <div className="border-b-[3px] border-oak-black bg-oak-lavender-subdued px-[30px] py-6">
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <span className="rounded-oak-m2 border-2 border-oak-navy bg-white px-2.5 py-1.5 text-[13px] font-bold text-oak-navy">
          {vm.id}
        </span>
        <span
          className={`rounded-full border-2 border-oak-black px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.03em] text-oak-black ${pillTint}`}
        >
          {vm.typeLabel}
        </span>
        {vm.hasCode && (
          <span className="rounded-oak-m border-2 border-oak-grey-line bg-white px-2.5 py-1.5 text-[12px] font-bold text-oak-grey">
            Rubric code · {vm.code}
          </span>
        )}
      </div>
      <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.05em] text-oak-grey">The standard</p>
      <p className="m-0 text-[26px] font-semibold leading-[34px] text-pretty">{vm.text}</p>
    </div>
  );
}

/** The three-cell meta grid: guidance area, applies-to components, assessed-in rubrics. */
function MetaGrid({ vm }: { readonly vm: StandardDetailVM }): ReactElement {
  return (
    <dl className="m-0 grid grid-cols-1 gap-0 border-b-2 border-oak-grey-line sm:grid-cols-3">
      <div className="border-oak-grey-line px-[22px] py-[18px] sm:border-r-2">
        <dt className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.05em] text-oak-grey">Guidance area</dt>
        <dd className="m-0">
          <AreaTags tags={vm.areaTags} />
        </dd>
      </div>
      <div className="border-oak-grey-line px-[22px] py-[18px] sm:border-r-2">
        <dt className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.05em] text-oak-grey">Applies to</dt>
        <dd className="m-0">
          <ChipList values={vm.components} tint="border border-oak-grey-line text-oak-black" />
        </dd>
      </div>
      <div className="px-[22px] py-[18px]">
        <dt className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.05em] text-oak-grey">
          Assessed in rubric
        </dt>
        <dd className="m-0">
          <ChipList values={vm.rubrics} tint="border-2 border-oak-black bg-oak-lemon-subdued font-semibold text-oak-black" />
        </dd>
      </div>
    </dl>
  );
}

/** Related standards in the same guidance area; each opens that standard's detail. */
function RelatedStandards({
  vm,
  onOpenRelated,
}: {
  readonly vm: StandardDetailVM;
  readonly onOpenRelated: (id: string) => void;
}): ReactElement | null {
  if (vm.related.length === 0) {
    return null;
  }
  return (
    <section aria-labelledby="related-heading" className="mt-[30px]">
      <h2 id="related-heading" className="mb-3.5 text-[20px] font-semibold leading-[26px]">
        Related standards in this area
      </h2>
      <ul className="flex list-none flex-col gap-2.5 p-0">
        {vm.related.map((related) => (
          <li key={related.id}>
            <button
              type="button"
              aria-label={`${related.id}: ${related.text}`}
              onClick={() => onOpenRelated(related.id)}
              className="flex w-full items-center gap-3.5 rounded-oak-l border-2 border-oak-black bg-white px-4 py-3.5 text-left shadow-oak-lemon"
            >
              <span className="shrink-0 rounded-oak-m border-2 border-oak-navy bg-oak-lavender-subdued px-2.5 py-1.5 text-[12px] font-bold text-oak-navy">
                {related.id}
              </span>
              <span className="flex-1 text-[16px] leading-[22px]">{related.text}</span>
              <span aria-hidden className="shrink-0 text-[20px] font-bold text-oak-grey">
                ›
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function StandardDetail({
  detail,
  rootRef,
  onBack,
  onOpenRelated,
}: {
  readonly detail: StandardDetailVM;
  readonly rootRef: RefObject<HTMLDivElement | null>;
  readonly onBack: () => void;
  readonly onOpenRelated: (id: string) => void;
}): ReactElement {
  return (
    <div ref={rootRef} tabIndex={-1} className="mx-auto max-w-[980px] px-7 pb-24 pt-6 outline-none">
      <button
        type="button"
        onClick={() => onBack()}
        className="mb-[22px] inline-flex items-center gap-2 rounded-full border-2 border-oak-black bg-white px-4 py-2.5 text-[14px] font-bold shadow-oak-lemon"
      >
        <span aria-hidden>←</span> Back to results
      </button>
      <article className="overflow-hidden rounded-oak-l border-[3px] border-oak-black bg-white shadow-oak-grey">
        <StatementHeader vm={detail} />
        <MetaGrid vm={detail} />
        <StandardExemplification />
      </article>
      <RelatedStandards vm={detail} onOpenRelated={onOpenRelated} />
    </div>
  );
}
