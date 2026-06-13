/**
 * Render coverage for the session-shape indicators: every shape combination
 * from the WS3 acceptance grid (solo/peer/directed × arc on/off ×
 * director/non-director own role), the no-shape tick, clean dropping of absent
 * indicator segments, and placement in both layouts — the single-line layout
 * (indicators as the second segment) and the four-row Oak-mark layout
 * (indicators trailing the identity on row 0).
 */
import { describe, expect, it } from 'vitest';

import { OAK_LOGO_ROWS } from '../../src/claude/oak-logo';
import { renderStatusline, type StatuslineParts } from '../../src/claude/statusline-render';
import { type SessionShape } from '../../src/claude/statusline-session-shape';

const RESET = '[0m';
const DIM = '[2m';
const MAGENTA = '[0;35m';
const CYAN = '[0;36m';

const SEP = `${DIM} · ${RESET}`;

const COMPASS = '\u{1F9ED}';
const FAMILY = '\u{1F46A}';
const BUSTS = '\u{1F465}';
const FEATHER = '\u{1FAB6}';

function parts(sessionShape: SessionShape | undefined): StatuslineParts {
  return {
    identity: 'Monsoon guards Cirrus',
    dir: 'repo',
    branch: undefined,
    dirty: false,
    worktree: undefined,
    usedPercentage: undefined,
    model: undefined,
    sessionShape,
  };
}

function shape(overrides: Partial<SessionShape>): SessionShape {
  return { ownRole: undefined, teamShape: 'solo', arcActive: false, ...overrides };
}

const IDENTITY = `${MAGENTA}Monsoon guards Cirrus${RESET}`;
const PLACE = `${CYAN}repo${RESET}`;

describe('renderStatusline — session-shape indicators', () => {
  it('renders no indicators for a solo session with no live channel', () => {
    expect(renderStatusline(parts(shape({})))).toBe(`${IDENTITY}${SEP}${PLACE}`);
  });

  it('renders identically for an unresolved shape and a quiet solo session', () => {
    expect(renderStatusline(parts(undefined))).toBe(renderStatusline(parts(shape({}))));
  });

  it('renders the peer icon for a peer window', () => {
    expect(renderStatusline(parts(shape({ teamShape: 'peer' })))).toBe(
      `${IDENTITY}${SEP}${BUSTS}${SEP}${PLACE}`,
    );
  });

  it('renders the family icon for a directed window without my demark', () => {
    expect(renderStatusline(parts(shape({ teamShape: 'directed' })))).toBe(
      `${IDENTITY}${SEP}${FAMILY}${SEP}${PLACE}`,
    );
  });

  it('suffixes the compass demark to the identity when I am the director', () => {
    expect(renderStatusline(parts(shape({ teamShape: 'directed', ownRole: 'director' })))).toBe(
      `${IDENTITY} ${COMPASS}${SEP}${FAMILY}${SEP}${PLACE}`,
    );
  });

  it('shows no demark for a non-director own role', () => {
    expect(renderStatusline(parts(shape({ teamShape: 'peer', ownRole: 'curator' })))).toBe(
      `${IDENTITY}${SEP}${BUSTS}${SEP}${PLACE}`,
    );
  });

  it('renders the wing alone for a solo session with a live channel', () => {
    expect(renderStatusline(parts(shape({ arcActive: true })))).toBe(
      `${IDENTITY}${SEP}${FEATHER}${SEP}${PLACE}`,
    );
  });

  it('renders peer icon and wing together', () => {
    expect(renderStatusline(parts(shape({ teamShape: 'peer', arcActive: true })))).toBe(
      `${IDENTITY}${SEP}${BUSTS} ${FEATHER}${SEP}${PLACE}`,
    );
  });

  it('renders family icon and wing for a directed window I am not directing', () => {
    expect(renderStatusline(parts(shape({ teamShape: 'directed', arcActive: true })))).toBe(
      `${IDENTITY}${SEP}${FAMILY} ${FEATHER}${SEP}${PLACE}`,
    );
  });

  it('renders the full directed-director-with-wing combination', () => {
    expect(
      renderStatusline(
        parts(shape({ teamShape: 'directed', ownRole: 'director', arcActive: true })),
      ),
    ).toBe(`${IDENTITY} ${COMPASS}${SEP}${FAMILY} ${FEATHER}${SEP}${PLACE}`);
  });

  it('keeps indicators in the single-line layout, before the model segment', () => {
    const rendered = renderStatusline({
      ...parts(shape({ teamShape: 'peer', arcActive: true })),
      model: 'Fable 5',
      usedPercentage: 12,
      branch: 'feat/statusline-enhancements',
    });

    const indicatorsAt = rendered.indexOf(BUSTS);
    const modelAt = rendered.indexOf('Fable 5');
    const branchAt = rendered.indexOf('feat/statusline-enhancements');
    expect(indicatorsAt).toBeGreaterThan(-1);
    expect(indicatorsAt).toBeLessThan(modelAt);
    expect(modelAt).toBeLessThan(branchAt);
  });

  it('shows team indicators even when identity is unavailable', () => {
    const rendered = renderStatusline({
      ...parts(shape({ teamShape: 'peer' })),
      identity: undefined,
    });

    expect(rendered).toBe(`${BUSTS}${SEP}${PLACE}`);
  });
});

describe('renderStatusline — session-shape indicators in the four-row layout', () => {
  // Raw ESC matches the renderer's GREEN byte-for-byte (same convention as the
  // RESET/DIM/MAGENTA/CYAN constants above).
  const GREEN = '[0;32m';
  const SEXTANT = OAK_LOGO_ROWS.sextant;
  const mark = (row: string): string => `${GREEN}${row}${RESET}`;
  const GAP = '  ';

  it('trails the indicators and demark on the identity row (full combo)', () => {
    const out = renderStatusline(
      parts(shape({ teamShape: 'directed', ownRole: 'director', arcActive: true })),
      { logo: 'sextant' },
    );
    expect(out.split('\n')).toEqual([
      `${mark(SEXTANT[0])}${GAP}${IDENTITY} ${COMPASS}${SEP}${FAMILY} ${FEATHER}`,
      mark(SEXTANT[1]),
      mark(SEXTANT[2]),
      `${mark(SEXTANT[3])}${GAP}${PLACE}`,
    ]);
  });

  it('shows the peer icon on the identity row with no demark for a peer window', () => {
    const out = renderStatusline(parts(shape({ teamShape: 'peer' })), { logo: 'sextant' });
    expect(out.split('\n')[0]).toBe(`${mark(SEXTANT[0])}${GAP}${IDENTITY}${SEP}${BUSTS}`);
  });

  it('leaves the identity row bare of indicators for a quiet solo session', () => {
    const out = renderStatusline(parts(shape({})), { logo: 'sextant' });
    expect(out.split('\n')[0]).toBe(`${mark(SEXTANT[0])}${GAP}${IDENTITY}`);
  });

  it('renders the team icon alone on the identity row when identity is unavailable', () => {
    const out = renderStatusline(
      { ...parts(shape({ teamShape: 'peer' })), identity: undefined },
      { logo: 'sextant' },
    );
    expect(out.split('\n')[0]).toBe(`${mark(SEXTANT[0])}${GAP}${BUSTS}`);
  });
});
