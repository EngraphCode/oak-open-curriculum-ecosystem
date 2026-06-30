import type { ReactElement } from 'react';
import SearchHub from '@/components/SearchHub';

export default function Page(): ReactElement {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="mb-9 border-b-2 border-oak-black bg-white px-6 py-[18px]">
        <div className="mx-auto flex max-w-[1080px] items-center gap-3">
          <span
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] border-2 border-oak-black bg-oak-lemon font-bold"
            aria-hidden
          >
            O
          </span>
          <strong className="text-lg font-bold leading-none">Curriculum hub</strong>
          <span className="text-sm font-light leading-none text-oak-grey">Oak National Academy</span>
        </div>
      </header>

      {/* Hero */}
      <div className="mx-auto max-w-[1080px] px-6 pb-3">
        <h1 className="mb-2 text-[34px] font-semibold leading-[1.15] tracking-[0.0115rem]">
          Find any lesson, unit or thread
        </h1>
        <p className="mb-5 max-w-[620px] text-[17px] font-light leading-relaxed text-oak-grey">
          Search Oak&rsquo;s free, fully sequenced curriculum &mdash; from key stage 1 to key stage
          4, every subject &mdash; powered by live curriculum search.
        </p>
      </div>

      <SearchHub />
    </main>
  );
}
