import type { ReactNode } from 'react';

/**
 * Converts an Elasticsearch highlight fragment into React nodes with real
 * `<mark>` elements. The ONLY markup interpreted is the ES highlighter's own
 * tag pair — the live search config emits `<mark>`/`</mark>` (verified against
 * the running API), with `<em>`/`</em>` accepted too as the highlighter
 * default — everything else stays literal text, so an API-sourced fragment can
 * never inject markup (the reason this exists instead of
 * `dangerouslySetInnerHTML`). An unterminated open tag marks to the end of the
 * fragment — the honest reading of what ES emitted.
 */
export function highlightToNodes(fragment: string): readonly ReactNode[] {
  const normalised = fragment.replaceAll('<mark>', '<em>').replaceAll('</mark>', '</em>');
  const [head, ...rest] = normalised.split('<em>');
  // Precomputed keys: the codebase's accepted idiom — a raw index inside `key` trips the
  // categorical react/no-array-index-key rule (fragments are strings, so no content key exists).
  const keys = rest.map((_part, index) => `h-${index}`);
  const nodes: ReactNode[] = [];
  if (head !== undefined && head !== '') {
    nodes.push(head);
  }
  rest.forEach((part, index) => {
    const closeAt = part.indexOf('</em>');
    const marked = closeAt === -1 ? part : part.slice(0, closeAt);
    const tail = closeAt === -1 ? '' : part.slice(closeAt + '</em>'.length);
    if (marked !== '') {
      nodes.push(
        <mark key={keys[index]} className="rounded-ctl bg-accent-brand px-0.5 text-ink">
          {marked}
        </mark>,
      );
    }
    if (tail !== '') {
      nodes.push(tail);
    }
  });
  return nodes;
}
