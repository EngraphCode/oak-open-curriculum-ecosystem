/**
 * Client-safe search view models + response guard. Demo by Heather W.
 *
 * Shared by the server seam (`lib/search-client.ts`) AND the client component
 * (`components/SearchHub.tsx`). It must NOT be a `server-only` module and must
 * not import the SDK — hence this separate, dependency-free file. The
 * server-only SDK wiring lives in `lib/search-client.ts`.
 */

/** A single search hit, mapped from the SDK index docs (NOT an API contract). */
export interface Hit {
  id: string;
  title: string;
  url: string; // canonical thenational.academy URL from the index doc
  subjectSlug?: string;
  subjectSlugs?: readonly string[]; // threads can span subjects
  keyStage?: string;
  years?: readonly string[]; // index stores years as strings
  snippet?: string; // ES unified highlight
  lessonCount?: number; // units
  unitCount?: number; // threads
  unitTitle?: string; // lessons
}

export interface SearchResults {
  lessons: Hit[];
  units: Hit[];
  threads: Hit[];
}

/**
 * Runtime guard for the `/api/search` JSON response at the client trust
 * boundary, so the client narrows without a type assertion.
 */
export function isSearchResults(value: unknown): value is SearchResults {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  return (
    'lessons' in value &&
    Array.isArray(value.lessons) &&
    'units' in value &&
    Array.isArray(value.units) &&
    'threads' in value &&
    Array.isArray(value.threads)
  );
}
