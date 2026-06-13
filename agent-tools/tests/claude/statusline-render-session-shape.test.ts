/**
 * Render coverage for the session-shape indicators in the statusline's
 * fixed-width prefix: every shape combination from the WS3 acceptance grid
 * (solo/peer/directed × arc on/off × director/non-director own role), the
 * no-shape tick, and clean dropping of absent indicator segments.
 */
import { describe, expect, it } from 'vitest';

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
    expect(renderStatusline(parts(shape({})))).toBe(`${IDENTITY}\n${PLACE}`);
  });

  it('renders identically for an unresolved shape and a quiet solo session', () => {
    expect(renderStatusline(parts(undefined))).toBe(renderStatusline(parts(shape({}))));
  });

  it('renders the peer icon for a peer window', () => {
    expect(renderStatusline(parts(shape({ teamShape: 'peer' })))).toBe(
      `${IDENTITY}${SEP}${BUSTS}\n${PLACE}`,
    );
  });

  it('renders the family icon for a directed window without my demark', () => {
    expect(renderStatusline(parts(shape({ teamShape: 'directed' })))).toBe(
      `${IDENTITY}${SEP}${FAMILY}\n${PLACE}`,
    );
  });

  it('suffixes the compass demark to the identity when I am the director', () => {
    expect(renderStatusline(parts(shape({ teamShape: 'directed', ownRole: 'director' })))).toBe(
      `${IDENTITY} ${COMPASS}${SEP}${FAMILY}\n${PLACE}`,
    );
  });

  it('shows no demark for a non-director own role', () => {
    expect(renderStatusline(parts(shape({ teamShape: 'peer', ownRole: 'curator' })))).toBe(
      `${IDENTITY}${SEP}${BUSTS}\n${PLACE}`,
    );
  });

  it('renders the wing alone for a solo session with a live channel', () => {
    expect(renderStatusline(parts(shape({ arcActive: true })))).toBe(
      `${IDENTITY}${SEP}${FEATHER}\n${PLACE}`,
    );
  });

  it('renders peer icon and wing together', () => {
    expect(renderStatusline(parts(shape({ teamShape: 'peer', arcActive: true })))).toBe(
      `${IDENTITY}${SEP}${BUSTS} ${FEATHER}\n${PLACE}`,
    );
  });

  it('renders family icon and wing for a directed window I am not directing', () => {
    expect(renderStatusline(parts(shape({ teamShape: 'directed', arcActive: true })))).toBe(
      `${IDENTITY}${SEP}${FAMILY} ${FEATHER}\n${PLACE}`,
    );
  });

  it('renders the full directed-director-with-wing combination', () => {
    expect(
      renderStatusline(
        parts(shape({ teamShape: 'directed', ownRole: 'director', arcActive: true })),
      ),
    ).toBe(`${IDENTITY} ${COMPASS}${SEP}${FAMILY} ${FEATHER}\n${PLACE}`);
  });

  it('keeps indicators inside the fixed-width prefix, before the model segment', () => {
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

    expect(rendered).toBe(`${BUSTS}\n${PLACE}`);
  });
});
