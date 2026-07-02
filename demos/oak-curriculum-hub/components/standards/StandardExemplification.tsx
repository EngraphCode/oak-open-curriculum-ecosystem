import type { ReactElement } from 'react';

/**
 * The "Exemplification" section of a quality-standard detail view, reproduced faithfully from the
 * canonical `Oak Standards.dc.html` — including its own "To be added" scaffolding (what-good-looks-
 * like, worked example / non-example, guidance notes). This is the export's deliberate design (the
 * same class as the media-block placeholders); reproducing it represents the surface truthfully as
 * what it is, per the Director's fidelity ruling. Not a stub — the canonical's own placeholder copy.
 */

/** One worked-example tile: a positive "Example" (green) or a negative "Non-example" (red). */
function ExampleTile({
  tone,
  heading,
  caption,
}: {
  readonly tone: 'good' | 'bad';
  readonly heading: string;
  readonly caption: string;
}): ReactElement {
  const border = tone === 'good' ? 'border-oak-green' : 'border-oak-red';
  const headBg = tone === 'good' ? 'bg-oak-green' : 'bg-oak-red';
  const bodyBg = tone === 'good' ? 'bg-oak-mint-subdued' : 'bg-oak-pink-subdued';
  return (
    <div className={`overflow-hidden rounded-oak-l border-2 ${border}`}>
      <p className={`m-0 px-4 py-3 text-[14px] font-bold text-white ${headBg}`}>{heading}</p>
      <div
        className={`flex min-h-[150px] flex-col items-center justify-center gap-2 p-4 text-center ${bodyBg}`}
      >
        {/* Decorative swatch: the visible caption below is the single announcement —
            role="img" + aria-label duplicated it for screen readers. */}
        <span
          aria-hidden="true"
          className="block h-8 w-8 rounded-oak-s border-2 border-current opacity-70"
        />
        <span className="text-[13px] leading-[19px] text-oak-grey">{caption}</span>
      </div>
    </div>
  );
}

export function StandardExemplification(): ReactElement {
  return (
    <section aria-labelledby="exemplification-heading" className="px-7 pb-8 pt-7">
      <div className="mb-1.5 flex items-center gap-2.5">
        <h2 id="exemplification-heading" className="m-0 text-[24px] font-semibold leading-[30px]">
          Exemplification
        </h2>
        <span className="rounded-full border-2 border-oak-lemon bg-oak-lemon-subdued px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.03em] text-oak-black">
          To be added
        </span>
      </div>
      <p className="mb-[22px] max-w-[70ch] text-[16px] leading-[24px] text-oak-grey">
        This is where the worked exemplification lives — what meeting this standard looks like in
        practice. The placeholders below show the shape; drop in real guidance, annotated examples
        and media as you build it out.
      </p>
      <div className="mb-4 rounded-oak-l border-2 border-oak-black bg-oak-mint-subdued px-5 py-[18px]">
        <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.04em] text-oak-green">
          What good looks like
        </p>
        <p className="m-0 text-[16px] leading-[24px] text-oak-black">
          Add a short description of how this standard is met well — the key things a reviewer
          should see.
        </p>
      </div>
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ExampleTile
          tone="good"
          heading="✓ Example"
          caption="Annotated example of the standard met"
        />
        <ExampleTile tone="bad" heading="✕ Non-example" caption="What falling short looks like" />
      </div>
      <div className="rounded-oak-l border-2 border-dashed border-oak-grey-40 bg-white px-5 py-[18px]">
        <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.04em] text-oak-grey">
          Guidance notes
        </p>
        <p className="m-0 text-[16px] leading-[24px] text-oak-grey">
          Add any nuance, edge cases or subject-specific notes here — and link out to relevant
          exemplar lessons or the wiki.
        </p>
      </div>
    </section>
  );
}
