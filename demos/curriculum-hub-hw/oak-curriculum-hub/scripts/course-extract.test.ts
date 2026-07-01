import { describe, it, expect } from 'vitest';

import { extractScript, extractCourse } from './course-extract';

/**
 * The Oak Course extractor evaluates course content authored as JavaScript object literals inside the
 * canonical export. These tests pin the extraction contract on synthetic input: literal shapes are
 * evaluated faithfully, and any non-literal value is a loud failure (never a silent mis-read) — the
 * property that lets the emitted module be trusted as compile-time-validated data.
 */

/** A minimal export-shaped script: the class fields + methods the extractor reads. */
const SYNTHETIC_SCRIPT = `
class Component extends DCLogic {
  constructor(props){
    super(props);
    this.units = [{id:'u1', label:'Unit 1', title:'Planning'}];
    let noise = localStorage.getItem('x');
  }
  buildIntro(){
    return { id:'intro', title:'Welcome', color:'#fff2aa', sections:[
      { id:'introMain', title:'Start', blocks:[ {t:'text', paras:['Hello ' + 'world']} ] }
    ]};
  }
  buildCourse(){
    return [
      { id:'u1m1', unit:'u1', title:'M1', color:'#a', colorStrong:'#b', outcomes:['learn'], sections:[
        { id:'u1m1s1', title:'S1', blocks:[ {t:'heading', text:'H'}, {t:'coursemap'} ] }
      ]}
    ];
  }
}
`;

/** Wrap a single block value in a minimal extractable script for fail-loud cases. */
function scriptWithBlock(block: string): string {
  return `class Component {
    constructor(){ this.units = []; }
    buildIntro(){ return { sections:[] }; }
    buildCourse(){ return [ { blocks:[ ${block} ] } ]; }
  }`;
}

describe('extractCourse', () => {
  it('extracts units, intro, and modules as faithful literal data', () => {
    const course = extractCourse(SYNTHETIC_SCRIPT);
    expect(course.units).toEqual([{ id: 'u1', label: 'Unit 1', title: 'Planning' }]);
    expect(course.intro).toMatchObject({ id: 'intro' });
    expect(course.modules).toMatchObject([
      { id: 'u1m1', sections: [{ blocks: [{ t: 'heading', text: 'H' }, { t: 'coursemap' }] }] },
    ]);
  });

  it('evaluates string concatenation in literal values', () => {
    const course = extractCourse(SYNTHETIC_SCRIPT);
    expect(course.intro).toMatchObject({
      sections: [{ blocks: [{ paras: ['Hello world'] }] }],
    });
  });

  it('normalises a bare-string accordion answer to a single-element array', () => {
    const course = extractCourse(
      scriptWithBlock(`{t:'accordion', items:[{q:'Q', a:'one paragraph'}]}`),
    );
    expect(course.modules).toMatchObject([
      { blocks: [{ t: 'accordion', items: [{ q: 'Q', a: ['one paragraph'] }] }] },
    ]);
  });

  it('fails loud when a required method or field is absent', () => {
    const script = `class Component { buildIntro(){ return {}; } buildCourse(){ return []; } }`;
    expect(() => extractCourse(script)).toThrow(/this\.units/);
  });
});

describe('extractCourse fail-loud on non-literals', () => {
  it.each([
    ['a function-call value', `{t:'text', paras: getStuff()}`],
    ['a variable-reference value', `{t:'text', paras: someVar}`],
    ['a non-string concatenation', `{t:'stats', items: 1 + 2}`],
    ['a computed property key', `{['t']:'text'}`],
  ])('throws on %s', (_label, block) => {
    expect(() => extractCourse(scriptWithBlock(block))).toThrow(/non-literal|unsupported|concatenation/);
  });
});

describe('extractScript', () => {
  it('pulls the text/x-dc script body from the export HTML', () => {
    const html = '<html><script type="text/x-dc" data-dc-script>const x = 1;</script></html>';
    expect(extractScript(html)).toContain('const x = 1;');
  });

  it('fails loud when the export has no text/x-dc script block', () => {
    expect(() => extractScript('<html><body>no script</body></html>')).toThrow(/no <script/);
  });
});
