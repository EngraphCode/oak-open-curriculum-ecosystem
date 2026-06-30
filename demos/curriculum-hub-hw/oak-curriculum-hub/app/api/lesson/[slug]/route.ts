import { getLesson } from '@/lib/curriculum';

export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;

  const result = await getLesson(slug);
  if (result.ok) {
    return Response.json(result.value);
  }
  if (result.error.kind === 'not_configured') {
    return Response.json(
      { error: 'content_not_configured', message: 'Set OAK_API_KEY.' },
      { status: 503 },
    );
  }
  // Includes the Open API BAD_REQUEST "blocked for copyright reasons" case.
  return Response.json({ error: 'lesson_unavailable' }, { status: 502 });
}
