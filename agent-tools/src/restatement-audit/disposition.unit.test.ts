import { describe, expect, it } from 'vitest';

import { dispositionFromVoters } from './disposition.js';
import type { VoterVerdict } from './schemas.js';

function verdict(overrides: Partial<VoterVerdict> = {}): VoterVerdict {
  return {
    sameFact: { pass: true, confidence: 'high' },
    authoredNotCited: { pass: true, confidence: 'high' },
    genuineConflict: { pass: true, confidence: 'high' },
    liveSurface: { pass: true, confidence: 'high' },
    importance: 'high',
    ...overrides,
  };
}

describe('dispositionFromVoters', () => {
  it('flags when both voters pass all four tests', () => {
    expect(dispositionFromVoters(verdict(), verdict())).toBe('flagged');
  });

  it('dismisses when both voters agree sameFact fails (bad join)', () => {
    const failing = verdict({ sameFact: { pass: false, confidence: 'high' } });
    expect(dispositionFromVoters(failing, failing)).toBe('dismissed');
  });

  it('dismisses when both voters agree authoredNotCited fails (citation/history)', () => {
    const failing = verdict({ authoredNotCited: { pass: false, confidence: 'med' } });
    expect(dispositionFromVoters(failing, failing)).toBe('dismissed');
  });

  it('dismisses when both voters agree liveSurface fails (archived)', () => {
    const failing = verdict({ liveSurface: { pass: false, confidence: 'high' } });
    expect(dispositionFromVoters(failing, failing)).toBe('dismissed');
  });

  it('dismisses when both voters agree genuineConflict fails', () => {
    const failing = verdict({ genuineConflict: { pass: false, confidence: 'low' } });
    expect(dispositionFromVoters(failing, failing)).toBe('dismissed');
  });

  it('holds for review when voters disagree on a single test', () => {
    const a = verdict();
    const b = verdict({ liveSurface: { pass: false, confidence: 'med' } });
    expect(dispositionFromVoters(a, b)).toBe('held-for-review');
  });

  it('holds for review when voters disagree on multiple tests (never averages to flagged)', () => {
    const a = verdict({ sameFact: { pass: false, confidence: 'low' } });
    const b = verdict({ authoredNotCited: { pass: false, confidence: 'low' } });
    expect(dispositionFromVoters(a, b)).toBe('held-for-review');
  });

  it('is symmetric in its two arguments', () => {
    const a = verdict();
    const b = verdict({ liveSurface: { pass: false, confidence: 'med' } });
    expect(dispositionFromVoters(a, b)).toBe(dispositionFromVoters(b, a));
  });
});
