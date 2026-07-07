import { search } from '@/lib/search-client';
import { createSearchHandler } from '@/lib/search-handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = createSearchHandler(search);
