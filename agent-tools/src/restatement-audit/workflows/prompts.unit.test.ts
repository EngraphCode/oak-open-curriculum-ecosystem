import { describe, expect, it } from 'vitest';

import {
  BANNED_GAP_BRIDGING_VOCABULARY,
  finderPrompt,
  metaPrompt,
  reducerPrompt,
  votePrompt,
} from './prompts.js';
import type { Gazetteer } from './gazetteer.js';
import type { Cluster } from '../schemas.js';
import type { GroundingInstance, MetaCluster, PartitionWindow } from './stage-io.js';

const gazetteer: Gazetteer = {
  subjects: { gates: ['G1', 'G2'], tools: ['refound-tile'] },
  statusVocabulary: ['done', 'merged'],
};

const window: PartitionWindow = {
  window: 'W01',
  files: ['.agent/plans-refounding/walk-a-agenda.md', '.agent/plans-refounding/r2-lane-seed.v1.md'],
};

describe('finderPrompt', () => {
  const prompt = finderPrompt(window, gazetteer);

  it('lists every window file for the Read tool', () => {
    for (const file of window.files) {
      expect(prompt).toContain(file);
    }
  });

  it('inlines every gazetteer subject id', () => {
    expect(prompt).toContain('G1');
    expect(prompt).toContain('G2');
    expect(prompt).toContain('refound-tile');
  });

  it('names all five trigger classes', () => {
    expect(prompt).toContain('STATUS / AUTHORIZATION LANGUAGE');
    expect(prompt).toContain('CLOSED-SET / MEMBERSHIP LANGUAGE');
    expect(prompt).toContain('BARE NUMERIC RESTATEMENT');
    expect(prompt).toContain('COVERAGE / MAPPING CLAIM');
    expect(prompt).toContain('NAMED-ENTITY OR DATE CLAIM');
  });

  it('wires the gazetteer statusVocabulary into the status trigger (validated AND used)', () => {
    expect(prompt).toContain("This sweep's gazetteer status vocabulary: done, merged");
    expect(prompt).toContain('indicative, not exhaustive');
  });

  it('mandates line + verbatim quote grounding', () => {
    expect(prompt).toContain('MANDATORY GROUNDING');
    expect(prompt).toMatch(/line number/);
    expect(prompt).toMatch(/verbatim quote/);
  });

  it('bans gap-bridging vocabulary and lists every banned word', () => {
    expect(prompt).toContain('BANNED GAP-BRIDGING VOCABULARY');
    for (const word of BANNED_GAP_BRIDGING_VOCABULARY) {
      expect(prompt).toContain(word);
    }
  });

  it('bans cross-file reasoning', () => {
    expect(prompt).toContain('NO CROSS-FILE REASONING');
  });

  it('names all four assertionKind values with their definitions', () => {
    expect(prompt).toContain('authored:');
    expect(prompt).toContain('citation:');
    expect(prompt).toContain('history:');
    expect(prompt).toContain('generated:');
  });

  it('scopes emitted ids to this window only', () => {
    expect(prompt).toContain(window.window);
  });
});

describe('reducerPrompt', () => {
  const instances: GroundingInstance[] = [
    {
      id: 'f1',
      file: 'a.md',
      line: 1,
      quote: 'seven lanes',
      valueNorm: '7',
      assertionKind: 'authored',
    },
  ];
  const prompt = reducerPrompt(instances);

  it('never asks for a verdict, only membership', () => {
    expect(prompt).toContain('NEVER emit a verdict');
  });

  it('inlines the supplied instances', () => {
    expect(prompt).toContain('seven lanes');
  });
});

describe('votePrompt', () => {
  const cluster: Cluster = {
    id: 'exact:status-assertion:G1:status',
    clusterKind: 'exact-key',
    factClass: 'status-assertion',
    subject: 'G1',
    predicate: 'status',
    verdict: 'conflict',
    distinctValueNorms: ['discharged', 'done'],
    memberInstanceIds: ['f1', 'f2'],
  };
  const members: GroundingInstance[] = [
    {
      id: 'f1',
      file: 'a.md',
      line: 324,
      quote: 'DISCHARGED 2026-07-07',
      valueNorm: 'discharged',
      assertionKind: 'authored',
    },
    {
      id: 'f2',
      file: 'b.md',
      line: 16,
      quote: 'DONE 2026-07-07',
      valueNorm: 'done',
      assertionKind: 'authored',
    },
  ];
  const prompt = votePrompt({ cluster, members });

  it('names all four conjunctive tests', () => {
    expect(prompt).toContain('sameFact:');
    expect(prompt).toContain('authoredNotCited:');
    expect(prompt).toContain('genuineConflict:');
    expect(prompt).toContain('liveSurface:');
  });

  it('never asks the voter for a disposition', () => {
    expect(prompt).toContain('Do NOT emit a flagged/dismissed disposition');
  });

  it('inlines every member quote', () => {
    for (const member of members) {
      expect(prompt).toContain(member.quote);
    }
  });
});

describe('metaPrompt', () => {
  const clusters: MetaCluster[] = [
    {
      id: 'exact:status-assertion:G1:status',
      factClass: 'status-assertion',
      subject: 'G1',
      predicate: 'status',
      verdict: 'conflict',
      instances: [
        {
          id: 'f1',
          file: 'a.md',
          line: 324,
          quote: 'DISCHARGED 2026-07-07',
          valueNorm: 'discharged',
          assertionKind: 'authored',
        },
        {
          id: 'f2',
          file: 'b.md',
          line: 16,
          quote: 'DONE 2026-07-07',
          valueNorm: 'done',
          assertionKind: 'authored',
        },
      ],
    },
  ];
  const prompt = metaPrompt(clusters);

  it('requires byte verification before trusting any quote', () => {
    expect(prompt).toContain('byte-verify');
    expect(prompt).toContain('grep -F');
  });

  it('lists the full closed cure menu', () => {
    for (const cure of [
      'cite-register',
      'extract-to-data',
      'derive-from-generator',
      'delete-restatement',
      'mark-as-history',
      'new-single-source',
    ]) {
      expect(prompt).toContain(cure);
    }
  });

  it('allows sourceOfTruth to be null', () => {
    expect(prompt).toContain('`null`');
  });

  it('pins each row id to its cluster id (code recomputes coverage)', () => {
    expect(prompt).toContain("Each row's `id` MUST be its cluster's `id`");
    expect(prompt).toContain('coverage is recomputed in code');
  });
});
