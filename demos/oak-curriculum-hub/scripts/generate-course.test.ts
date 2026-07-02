import { isErr, isOk } from '@oaknational/result';
import { describe, it, expect } from 'vitest';

import { generateFromHtml } from './generate-course';

/**
 * The Course generator turns export HTML into schema-validated JSON content
 * (`lib/course/oak-course.json`). These tests pin the generation-time belt: extracted content is
 * validated against the course schema BEFORE any JSON is emitted, so a drifted export — an unknown
 * block kind, an absolute asset path — fails the generate run loud, naming the offending path and
 * value, and never reaches the app. Real-IO freshness (committed JSON vs a fresh regenerate) is
 * the `--check` CLI's job, not a unit test's (ADR-078 no-real-io-in-tests).
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

/** Parse an emitted JSON document for structural assertions. */
const parseEmitted = (json: string): unknown => JSON.parse(json);

describe('generateFromHtml (extract + validate + emit orchestration, pure)', () => {
  it('turns export HTML into schema-validated course JSON carrying the extracted content', () => {
    const emitted = generateFromHtml(SYNTHETIC_HTML);
    expect(isOk(emitted)).toBe(true);
    if (isOk(emitted)) {
      expect(parseEmitted(emitted.value)).toEqual({
        units: [{ id: 'u1', label: 'Unit 1', title: 'Planning' }],
        intro: { id: 'intro', title: 'Welcome', color: '#fff', sections: [] },
        modules: [
          {
            id: 'u1m1',
            unit: 'u1',
            title: 'M',
            color: '#a',
            colorStrong: '#b',
            outcomes: ['learn'],
            sections: [{ id: 'u1m1s1', title: 'S', blocks: [{ t: 'heading', text: 'H' }] }],
          },
        ],
      });
    }
  });

  it('fails loud when the export has no extractable script', () => {
    const emitted = generateFromHtml('<html><body>no script</body></html>');
    expect(isErr(emitted)).toBe(true);
  });
});

/** Wrap a single block value in a schema-complete course for boundary cases. */
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

describe('generateFromHtml schema belt', () => {
  it('passes relative asset paths through unchanged', () => {
    const emitted = generateFromHtml(
      htmlWithBlock(`{t:'download', title:'Tool', desc:'D', meta:'PDF', href:'assets/tool.pdf'}`),
    );
    expect(isOk(emitted)).toBe(true);
    if (isOk(emitted)) {
      expect(emitted.value).toContain('"href": "assets/tool.pdf"');
    }
  });

  it('normalises a bare-string accordion answer to a paragraph array at the boundary', () => {
    const emitted = generateFromHtml(
      htmlWithBlock(`{t:'accordion', items:[{q:'Q?', a:'one paragraph'}]}`),
    );
    expect(isOk(emitted)).toBe(true);
    if (isOk(emitted)) {
      expect(parseEmitted(emitted.value)).toMatchObject({
        modules: [
          {
            sections: [
              { blocks: [{ t: 'accordion', items: [{ q: 'Q?', a: ['one paragraph'] }] }] },
            ],
          },
        ],
      });
    }
  });
});

describe('generateFromHtml schema belt — fail-loud diagnostics', () => {
  it('fails loud on a leading-slash src, naming the field path and value', () => {
    const emitted = generateFromHtml(
      htmlWithBlock(`{t:'image', placeholder:'P', src:'/assets/x.png', alt:'x'}`),
    );
    expect(isErr(emitted)).toBe(true);
    if (isErr(emitted)) {
      expect(emitted.error).toMatch(/src.*\/assets\/x\.png/);
    }
  });

  it('fails loud on a scheme/protocol href, naming the field path and value', () => {
    const emitted = generateFromHtml(
      htmlWithBlock(
        `{t:'download', title:'Tool', desc:'D', meta:'PDF', href:'https://example.org/x.pdf'}`,
      ),
    );
    expect(isErr(emitted)).toBe(true);
    if (isErr(emitted)) {
      expect(emitted.error).toContain('href');
      expect(emitted.error).toContain('https://example.org/x.pdf');
    }
  });

  it('fails loud on a block kind outside the closed union, naming the path', () => {
    const emitted = generateFromHtml(htmlWithBlock(`{t:'marquee', text:'nope'}`));
    expect(isErr(emitted)).toBe(true);
    if (isErr(emitted)) {
      expect(emitted.error).toContain('modules.0.sections.0.blocks.0');
    }
  });
});
