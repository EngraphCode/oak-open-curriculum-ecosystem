import { describe, it, expect } from 'vitest';

import { extractCourse } from './course-extract';
import { emitModule, generateFromHtml } from './generate-course';

/**
 * The generator's emit + orchestration half. `emitModule` must produce a `: Course`-annotated module
 * (the compile-time validation gate), and `generateFromHtml` must turn export HTML into that module —
 * the pure core the IO shell `generate()` and the `--check` CI staleness guard (DoD §F) build on.
 * Real-IO freshness (committed module vs a fresh regenerate) is the `--check` CLI's job, not a unit
 * test's (ADR-078 no-real-io-in-tests).
 */
const SYNTHETIC_HTML = `<html><script type="text/x-dc" data-dc-script>
class Component {
  constructor(){ this.units = [{id:'u1', label:'Unit 1', title:'Planning'}]; }
  buildIntro(){ return { id:'intro', title:'Welcome', color:'#fff', sections:[] }; }
  buildCourse(){ return [
    { id:'u1m1', unit:'u1', title:'M', color:'#a', colorStrong:'#b', outcomes:['learn'], sections:[
      { id:'u1m1s1', title:'S', blocks:[ {t:'heading', text:'H'} ] }
    ]}
  ]; }
}
</script></html>`;

describe('emitModule', () => {
  it('emits a Course-annotated module so tsc validates every block at build', () => {
    const source = emitModule(
      extractCourse(
        `class C { constructor(){ this.units = []; } buildIntro(){ return { id:'intro', sections:[] }; } buildCourse(){ return []; } }`,
      ),
    );
    expect(source).toContain("import type { Course } from './types';");
    expect(source).toContain('export const oakCourse: Course =');
    expect(source).toContain('"id": "intro"');
  });
});

describe('generateFromHtml (extract + emit orchestration, pure)', () => {
  it('turns export HTML into a Course-annotated module carrying the extracted content', () => {
    const source = generateFromHtml(SYNTHETIC_HTML);
    expect(source).toContain('export const oakCourse: Course =');
    expect(source).toContain('"id": "intro"');
    expect(source).toContain('"t": "heading"');
  });
});

/**
 * Asset-path boundary: the views render `/${block.href}` and `/${block.src}`, so the generator
 * guarantees every extracted href/src is RELATIVE (no leading slash, no scheme) — an absolute or
 * protocol path in a fresh export must fail the generate run loud, never reach the views as a
 * protocol-relative URL (strict-validation-at-boundary; the boundary is generation, not JSX).
 */
const htmlWithBlock = (block: string): string => `<html><script type="text/x-dc" data-dc-script>
class Component {
  constructor(){ this.units = [{id:'u1', label:'Unit 1', title:'Planning'}]; }
  buildIntro(){ return { id:'intro', title:'Welcome', color:'#fff', sections:[] }; }
  buildCourse(){ return [
    { id:'u1m1', unit:'u1', title:'M', color:'#a', colorStrong:'#b', outcomes:['learn'], sections:[
      { id:'u1m1s1', title:'S', blocks:[ ${block} ] }
    ]}
  ]; }
}
</script></html>`;

describe('generateFromHtml asset-path boundary', () => {
  it('passes relative asset paths through unchanged', () => {
    const source = generateFromHtml(
      htmlWithBlock(`{t:'download', label:'Tool', href:'assets/tool.pdf'}`),
    );
    expect(source).toContain('"href": "assets/tool.pdf"');
  });

  it('fails loud on a leading-slash src, naming the field and value', () => {
    expect(() =>
      generateFromHtml(htmlWithBlock(`{t:'image', src:'/assets/x.png', alt:'x'}`)),
    ).toThrow(/src.*\/assets\/x\.png/);
  });

  it('fails loud on a scheme/protocol href, naming the field and value', () => {
    let message = '';
    try {
      generateFromHtml(htmlWithBlock(`{t:'download', label:'Tool', href:'https://example.org/x.pdf'}`));
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }
    expect(message).toContain('href');
    expect(message).toContain('https://example.org/x.pdf');
  });
});
