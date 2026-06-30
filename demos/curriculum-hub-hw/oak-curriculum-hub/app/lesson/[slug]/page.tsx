import type { ReactElement } from 'react';
import Link from 'next/link';
import { isLessonContent, type LessonContent } from '@/lib/curriculum';

export const dynamic = 'force-dynamic';

type Summary = LessonContent['summary'];
type Quiz = LessonContent['quiz'];
type Assets = LessonContent['assets'];

interface LessonView {
  title: string;
  hasContent: boolean;
  outcome: string | null;
  quiz: { starter: number; exit: number } | null;
  assets: readonly { type: string; label: string }[];
  oakUrl: string | undefined;
}

async function fetchLesson(slug: string, base: string): Promise<unknown> {
  const res = await fetch(`${base}/api/lesson/${slug}`, { cache: 'no-store' });
  const json: unknown = await res.json();
  return json;
}

function resolveTitle(summary: Summary, slug: string): string {
  return summary?.lessonTitle ?? summary?.title ?? slug.replaceAll('-', ' ');
}

function resolveOutcome(summary: Summary): string | null {
  return summary?.pupilLessonOutcome ?? null;
}

// Oak gates downloads behind signed URLs, so the demo links out to the lesson
// on thenational.academy rather than proxying files.
function resolveOakUrl(summary: Summary, assets: Assets): string | undefined {
  return assets?.oakUrl ?? summary?.oakUrl ?? summary?.canonicalUrl ?? undefined;
}

function resolveQuiz(quiz: Quiz): { starter: number; exit: number } | null {
  if (!quiz) {
    return null;
  }
  return { starter: quiz.starterQuiz?.length ?? 0, exit: quiz.exitQuiz?.length ?? 0 };
}

function resolveAssets(assets: Assets): readonly { type: string; label: string }[] {
  return assets?.assets ?? [];
}

function buildLessonView(data: unknown, slug: string): LessonView {
  const lesson = isLessonContent(data) ? data : null;
  const summary = lesson?.summary ?? null;
  const assets = lesson?.assets ?? null;
  return {
    title: resolveTitle(summary, slug),
    hasContent: summary !== null,
    outcome: resolveOutcome(summary),
    quiz: resolveQuiz(lesson?.quiz ?? null),
    assets: resolveAssets(assets),
    oakUrl: resolveOakUrl(summary, assets),
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<ReactElement> {
  const { slug } = await params;
  // Server component → call our own route via absolute URL.
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3010';
  const view = buildLessonView(await fetchLesson(slug, base), slug);

  return (
    <main className="mx-auto max-w-[760px] px-6 pt-10 pb-20">
      <Link href="/" className="text-[13px] font-bold text-oak-navy hover:text-oak-navy-hover">
        ← Back to search
      </Link>

      <h1 className="mt-[18px] mb-2.5 text-[30px] font-semibold leading-tight">{view.title}</h1>

      {!view.hasContent && (
        <p className="text-[15px] font-light leading-relaxed text-oak-grey">
          This lesson&rsquo;s content is unavailable.
        </p>
      )}

      {view.outcome && (
        <p className="mb-6 text-[17px] font-light leading-relaxed text-oak-black">{view.outcome}</p>
      )}

      {view.quiz && <QuizStats starter={view.quiz.starter} exit={view.quiz.exit} />}

      {view.assets.length > 0 && <LessonResources items={view.assets} oakUrl={view.oakUrl} />}
    </main>
  );
}

function QuizStats({ starter, exit }: { starter: number; exit: number }): ReactElement {
  return (
    <div className="mb-6 flex gap-3">
      <Stat n={starter} label="Starter quiz questions" />
      <Stat n={exit} label="Exit quiz questions" />
    </div>
  );
}

function LessonResources({
  items,
  oakUrl,
}: {
  items: readonly { type: string; label: string }[];
  oakUrl: string | undefined;
}): ReactElement {
  return (
    <section>
      <div className="mb-2.5 text-xs font-bold uppercase tracking-[0.05em] text-oak-grey">
        Resources for this lesson
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {items.map((a) => (
          <span
            key={a.type}
            className="inline-flex items-center rounded-full border border-oak-grey-line px-3 py-[7px] text-[13px] font-semibold text-oak-grey"
          >
            {a.label}
          </span>
        ))}
      </div>
      {oakUrl && (
        <a
          href={oakUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-full border-2 border-oak-black bg-white px-[18px] py-[11px] text-sm font-bold text-oak-black no-underline shadow-oak-lemon transition-[box-shadow,transform] duration-150 hover:shadow-oak-wide-lemon active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          Download these on thenational.academy ↗
        </a>
      )}
    </section>
  );
}

function Stat({ n, label }: { n: number; label: string }): ReactElement {
  return (
    <div className="min-w-[120px] rounded-xl border-2 border-oak-black bg-white px-[18px] py-3">
      <div className="text-[28px] font-bold leading-none">{n}</div>
      <div className="mt-1 text-xs font-light leading-snug text-oak-grey">{label}</div>
    </div>
  );
}
