import { describe, expect, it } from 'vitest';

import { findLocalCssDependencies } from './kit-asset-parity';

describe('findLocalCssDependencies', () => {
  it('reports a local @import target', () => {
    expect(findLocalCssDependencies("@import url('brand-a.css');")).toEqual(['brand-a.css']);
  });

  it('reports a relative url() reference', () => {
    expect(findLocalCssDependencies('.x { background-image: url(texture.svg); }')).toEqual([
      'texture.svg',
    ]);
  });

  it('skips remote, protocol-relative and data references', () => {
    const css = `
      @import url('https://fonts.googleapis.com/css2?family=Public+Sans');
      .a { background: url('https://cdn.jsdelivr.net/icons/search.svg'); }
      .b { background: url('//cdn.example.net/x.svg'); }
      .c { background: url('data:image/svg+xml;utf8,<svg/>'); }
    `;
    expect(findLocalCssDependencies(css)).toEqual([]);
  });

  it('deduplicates repeated references', () => {
    const css = ".a { background: url('t.svg'); } .b { background: url('t.svg'); }";
    expect(findLocalCssDependencies(css)).toEqual(['t.svg']);
  });
});
