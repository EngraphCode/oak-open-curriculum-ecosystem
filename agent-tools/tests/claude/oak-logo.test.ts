import { OAK_LOGO_ROWS, resolveLogoStyle } from '../../src/claude/oak-logo';

describe('OAK_LOGO_ROWS', () => {
  it('renders each visible style as three rows', () => {
    expect(OAK_LOGO_ROWS.sextant).toHaveLength(3);
    expect(OAK_LOGO_ROWS.quad).toHaveLength(3);
  });

  it('keeps a uniform five-column display width within each style', () => {
    for (const rows of Object.values(OAK_LOGO_ROWS)) {
      for (const row of rows) {
        // Count Unicode code points (not UTF-16 units: sextant glyphs are astral
        // and would each count as two units). Five code points assumes each
        // glyph renders at narrow width, per the rendering assumption documented
        // in oak-logo.ts.
        expect([...row]).toHaveLength(5);
      }
    }
  });
});

describe('resolveLogoStyle', () => {
  it('passes through the known styles', () => {
    expect(resolveLogoStyle('sextant')).toBe('sextant');
    expect(resolveLogoStyle('quad')).toBe('quad');
    expect(resolveLogoStyle('braille')).toBe('braille');
    expect(resolveLogoStyle('none')).toBe('none');
  });

  it('falls back to the default quad style for an unset or unrecognised value', () => {
    expect(resolveLogoStyle(undefined)).toBe('quad');
    expect(resolveLogoStyle('')).toBe('quad');
    expect(resolveLogoStyle('rainbow')).toBe('quad');
  });
});
