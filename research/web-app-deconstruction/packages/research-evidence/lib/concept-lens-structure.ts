export function withoutFencedMarkdown(source: string): string {
  let fence: string | null = null;

  return source
    .split('\n')
    .map((line) => {
      const marker = /^\s*(`{3,}|~{3,})/.exec(line)?.[1];
      if (marker) {
        if (!fence) {
          fence = marker[0];
        } else if (marker.startsWith(fence)) {
          fence = null;
        }
        return '';
      }
      return fence ? '' : line;
    })
    .join('\n');
}

export function validateConceptLensStructure(
  source: string,
  fileName: string,
): { lensCount: number; failures: string[] } {
  const markdown = withoutFencedMarkdown(source);
  const headings = [...markdown.matchAll(/^## Lens (\d+):[^\n]+$/gm)];
  const headingCandidates = [...markdown.matchAll(/^## Lens\b[^\n]*$/gm)];
  const failures: string[] = [];

  const recognizedHeadingPositions = new Set(headings.map((heading) => heading.index));
  for (const candidate of headingCandidates) {
    if (!recognizedHeadingPositions.has(candidate.index)) {
      failures.push(`${fileName}: malformed concept-lens heading: ${candidate[0]}`);
    }
  }

  if (headings.length === 0) {
    return {
      lensCount: 0,
      failures: [`${fileName}: concept-lens record contains no lenses`],
    };
  }

  headings.forEach((heading, index) => {
    const expectedNumber = index + 1;
    const actualNumber = Number(heading[1]);
    const label = heading[0].replace(/^## /, '');
    if (actualNumber !== expectedNumber) {
      failures.push(`${fileName}: expected Lens ${expectedNumber}; found Lens ${actualNumber}`);
    }

    const start = heading.index ?? 0;
    const searchStart = start + heading[0].length;
    const nextSectionOffset = markdown.slice(searchStart).search(/^## /m);
    const end = nextSectionOffset >= 0 ? searchStart + nextSectionOffset : markdown.length;
    const lens = markdown.slice(start, end);
    const movementMatches = [...lens.matchAll(/^### Movement (\d+):[^\n]+$/gm)];
    const movements = movementMatches.map((match) => Number(match[1]));

    if (
      movements.length !== 4 ||
      movements.some((movement, movementIndex) => movement !== movementIndex + 1)
    ) {
      failures.push(
        `${fileName}: ${label} must contain exact ordered Movements 1, 2, 3 and 4; found ${movements.join(', ') || 'none'}`,
      );
    }

    const checks: [string, RegExp, string?][] = [
      ['governing question', /Governing question/i],
      [
        'changed assumption',
        /(?:Changed assumptions?|Assumptions?(?: and inherited shapes)? (?:that )?changed|Assumption changed)/i,
      ],
      [
        'mechanism-neutral problem frame',
        /(?:Problem frame|problem space|mechanism-neutral problem|The problem is)/i,
        movementMatches[1] && movementMatches[2]
          ? lens.slice(
              (movementMatches[1].index ?? 0) + movementMatches[1][0].length,
              movementMatches[2].index,
            )
          : '',
      ],
      [
        'warrant',
        /\bWarrant\b/i,
        movementMatches[3]
          ? lens.slice((movementMatches[3].index ?? 0) + movementMatches[3][0].length)
          : '',
      ],
      [
        'falsifier',
        /\bFalsifier\b/i,
        movementMatches[3]
          ? lens.slice((movementMatches[3].index ?? 0) + movementMatches[3][0].length)
          : '',
      ],
      [
        'unresolved evidence',
        /Unresolved evidence/i,
        movementMatches[3]
          ? lens.slice((movementMatches[3].index ?? 0) + movementMatches[3][0].length)
          : '',
      ],
    ];
    for (const [name, pattern, scope = lens] of checks) {
      if (!pattern.test(scope)) {
        failures.push(`${fileName}: ${label} missing ${name}`);
      }
    }
  });

  return { lensCount: headings.length, failures };
}
