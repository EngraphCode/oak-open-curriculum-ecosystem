import { describe, expect, it } from 'vitest';

import { findLiteralDesignValues } from './css-literal-values';

describe('findLiteralDesignValues: literals it must report', () => {
  it('reports a hex colour used directly as a background', () => {
    const findings = findLiteralDesignValues('.x { background: #1d70b8; }');
    expect(findings).toHaveLength(1);
    expect(findings[0]?.prop).toBe('background');
  });

  it('reports a colour function', () => {
    expect(findLiteralDesignValues('.x { color: rgb(34, 34, 34); }')).toHaveLength(1);
  });

  it('reports a px length outside a var() reference', () => {
    expect(findLiteralDesignValues('.x { padding: 12px; }')).toHaveLength(1);
  });

  it('reports a literal fallback inside a var() reference', () => {
    expect(findLiteralDesignValues('.x { z-index: var(--layer-sticky, 20px); }')).toHaveLength(1);
  });

  it('reports a duration literal', () => {
    expect(findLiteralDesignValues('.x { transition-duration: 200ms; }')).toHaveLength(1);
  });
});

describe('findLiteralDesignValues: literal colours, axes and faces', () => {
  it('reports a named colour used directly', () => {
    expect(findLiteralDesignValues('.x { color: white; }')).toHaveLength(1);
    expect(findLiteralDesignValues('.x { background: rebeccapurple; }')).toHaveLength(1);
  });

  it('reports named colours inside light-dark()', () => {
    expect(findLiteralDesignValues('.x { color: light-dark(white, black); }')).toHaveLength(1);
  });

  it('reports an angle literal', () => {
    expect(
      findLiteralDesignValues('.x { background: linear-gradient(135deg, var(--a), var(--b)); }'),
    ).toHaveLength(1);
  });

  it('reports a bare number on the opacity and z-index axes', () => {
    expect(findLiteralDesignValues('.x { opacity: 0.5; }')).toHaveLength(1);
    expect(findLiteralDesignValues('.x { z-index: 20; }')).toHaveLength(1);
  });

  it('reports a literal font stack', () => {
    expect(findLiteralDesignValues('.x { font-family: Georgia, serif; }')).toHaveLength(1);
  });

  it('reports a QUOTED literal family — quotes stay inspectable on the font axes', () => {
    expect(findLiteralDesignValues('.x { font-family: "Comic Sans MS"; }')).toHaveLength(1);
    expect(findLiteralDesignValues('.x { font-family: var(--font-sans), "Arial"; }')).toHaveLength(
      1,
    );
  });

  it('reports a slash-adjacent length in a font shorthand', () => {
    expect(findLiteralDesignValues('.x { font: 16px/1.5 var(--font-sans); }')).toHaveLength(1);
  });

  it('reports a colour literal inside color-mix', () => {
    expect(
      findLiteralDesignValues('.x { background: color-mix(in oklab, #fff, var(--b) 25%); }'),
    ).toHaveLength(1);
  });

  it('reports a non-guard percentage', () => {
    expect(findLiteralDesignValues('.x { width: 50%; }')).toHaveLength(1);
  });
});

describe('findLiteralDesignValues: number grammar and structural arguments', () => {
  it('reports the number grammar edge forms and ignores unknown suffixes', () => {
    expect(findLiteralDesignValues('.x { margin-top: .5px; }')).toHaveLength(1);
    expect(findLiteralDesignValues('.x { margin-top: +2px; }')).toHaveLength(1);
    expect(findLiteralDesignValues('.x { transition-duration: 1s; }')).toHaveLength(1);
    expect(findLiteralDesignValues('.x { padding: 5pxx; }')).toHaveLength(0);
  });

  it('reports literals inside structural functions — no wholesale allowance', () => {
    const css = `.x {
      padding-inline: clamp(var(--space-16), 4vw, var(--space-24));
      grid-template-columns: minmax(30px, 1fr) minmax(min(var(--space-240), 100%), 1fr);
    }`;
    expect(findLiteralDesignValues(css)).toHaveLength(2);
  });
});

describe('findLiteralDesignValues: values it must accept', () => {
  it('accepts a zero margin, which carries no design value', () => {
    expect(findLiteralDesignValues('body { margin: 0; }')).toHaveLength(0);
  });

  it('accepts composed token roles and keywords', () => {
    const css = `.mast {
      border-bottom: var(--border-solid-m) solid var(--border-primary);
      background: var(--bg-primary);
      overflow-wrap: anywhere;
      hyphens: auto;
    }`;
    expect(findLiteralDesignValues(css)).toHaveLength(0);
  });

  it('accepts a var() reference with a var() fallback', () => {
    expect(findLiteralDesignValues('.x { gap: var(--gap-s, var(--space-8)); }')).toHaveLength(0);
  });

  it('does not report a hash inside a content string', () => {
    expect(findLiteralDesignValues(".x::before { content: '#fff'; }")).toHaveLength(0);
  });

  it('does not report a hex inside a comment', () => {
    expect(
      findLiteralDesignValues('.x { color: var(--text-primary) /* was #222 */; }'),
    ).toHaveLength(0);
  });

  it('does not report url() tokens or unitless numbers', () => {
    expect(
      findLiteralDesignValues('.x { background-image: url(#gradient); line-height: 1.5; }'),
    ).toHaveLength(0);
  });
});

describe('findLiteralDesignValues: named allowances', () => {
  it('accepts transparent and currentColor composition keywords', () => {
    expect(
      findLiteralDesignValues('.x { outline-color: transparent; border-color: currentColor; }'),
    ).toHaveLength(0);
  });

  it('accepts token-composed structural functions — fr and bare zero carry no design value', () => {
    const css = `.x {
      padding-inline: clamp(var(--space-16), var(--gutter-vw), var(--space-24));
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }`;
    expect(findLiteralDesignValues(css)).toHaveLength(0);
  });

  it('accepts the full-extent guard and font tokens', () => {
    expect(
      findLiteralDesignValues('.x { max-width: 100%; font: var(--type-heading-1); }'),
    ).toHaveLength(0);
  });

  it('accepts color-mix over var() references only', () => {
    expect(
      findLiteralDesignValues('.x { background: color-mix(in oklab, var(--a), var(--b) 25%); }'),
    ).toHaveLength(0);
  });
});
