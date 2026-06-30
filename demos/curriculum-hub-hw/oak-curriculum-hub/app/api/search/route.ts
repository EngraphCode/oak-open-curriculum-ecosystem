import { search } from '@/lib/search-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request): Promise<Response> {
  const q = new URL(req.url).searchParams.get('q')?.trim() ?? '';
  if (!q) {
    return Response.json({ lessons: [], units: [], threads: [] });
  }

  const result = await search(q);
  if (result.ok) {
    return Response.json(result.value);
  }
  if (result.error.kind === 'not_configured') {
    return Response.json(
      {
        error: 'search_not_configured',
        message: 'Set ELASTICSEARCH_URL and ELASTICSEARCH_API_KEY.',
      },
      { status: 503 },
    );
  }
  return Response.json({ error: 'search_failed' }, { status: 502 });
}
