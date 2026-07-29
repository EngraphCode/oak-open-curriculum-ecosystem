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
