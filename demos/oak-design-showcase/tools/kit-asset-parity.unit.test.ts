import { describe, expect, it } from 'vitest';

import { closureFailures, findLocalCssDependencies } from './kit-asset-parity';

describe('findLocalCssDependencies', () => {
  it('reports a local @import target', () => {
    expect(findLocalCssDependencies("@import url('brand-a.css');")).toEqual(['brand-a.css']);
  });

  it('reports a url() import with interior whitespace and double quotes', () => {
    expect(findLocalCssDependencies('@import url( "brand-a.css" );')).toEqual(['brand-a.css']);
  });

  it('reports a bare-quoted import target behind a layer prelude', () => {
    expect(findLocalCssDependencies("@import layer(brand) 'brand-a.css';")).toEqual([
      'brand-a.css',
    ]);
  });

  it('reports a relative url() reference', () => {
    expect(findLocalCssDependencies('.x { background-image: url(texture.svg); }')).toEqual([
      'texture.svg',
    ]);
  });

  it('reports a bare url() target with surrounding whitespace', () => {
    expect(findLocalCssDependencies('.x { background-image: url( texture.svg ); }')).toEqual([
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

describe('closureFailures', () => {
  const copies = new Set(['public/brands/x/brand.css', 'public/brands/x/brand-a.css']);

  it('accepts a sheet whose local dependencies are all manifest copies', () => {
    expect(
      closureFailures('public/brands/x/brand.css', "@import url('brand-a.css');", copies),
    ).toEqual([]);
  });

  it('fails loudly on a dependency outside the manifest', () => {
    const failures = closureFailures(
      'public/brands/x/brand.css',
      "@import url('icons.css');",
      copies,
    );
    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain('public/brands/x/icons.css');
  });

  it('fails loudly on an app-absolute reference instead of mis-resolving it', () => {
    const failures = closureFailures(
      'public/brands/x/brand.css',
      ".a { background: url('/fonts/x.woff'); }",
      copies,
    );
    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain('app-absolute');
  });

  it('ignores non-CSS copies', () => {
    expect(closureFailures('public/oak-theme.js', 'not css at all {', copies)).toEqual([]);
  });
});
