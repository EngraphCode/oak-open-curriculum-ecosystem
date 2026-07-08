import { describe, expect, it } from 'vitest';

import {
  BINARY_SNIFF_WINDOW_BYTES,
  classifyInventoryMode,
  compareByCodeUnit,
  countLines,
  parseDenominator,
  parseFreezeIdentityProof,
  renderJsonlArtefact,
  sha256Hex,
  splitLineBytes,
} from './refounding-artefacts.js';
import { parseDenominatorAmendment } from './refound-amendments.js';

const SHA256_EMPTY = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
const SHA256_ABC = 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad';

describe('sha256Hex', () => {
  it('matches known SHA-256 vectors', () => {
    expect(sha256Hex(Buffer.from(''))).toBe(SHA256_EMPTY);
    expect(sha256Hex(Buffer.from('abc'))).toBe(SHA256_ABC);
  });
});

describe('renderJsonlArtefact', () => {
  it('renders one JSON document per line, each LF-terminated, no indentation', () => {
    expect(renderJsonlArtefact([])).toBe('');
    expect(renderJsonlArtefact([{ a: 1 }, { b: 'x' }])).toBe('{"a":1}\n{"b":"x"}\n');
  });
});

describe('splitLineBytes', () => {
  it('splits by LF into one buffer per counted line, excluding the LF byte', () => {
    expect(splitLineBytes(Buffer.from(''))).toEqual([]);
    expect(splitLineBytes(Buffer.from('a'))).toEqual([Buffer.from('a')]);
    expect(splitLineBytes(Buffer.from('a\n'))).toEqual([Buffer.from('a')]);
    expect(splitLineBytes(Buffer.from('a\nb'))).toEqual([Buffer.from('a'), Buffer.from('b')]);
    expect(splitLineBytes(Buffer.from('a\n\nb\n'))).toEqual([
      Buffer.from('a'),
      Buffer.from(''),
      Buffer.from('b'),
    ]);
  });

  it('keeps CR bytes as line content (no EOL normalisation, D7)', () => {
    expect(splitLineBytes(Buffer.from('a\r\nb\r\n'))).toEqual([
      Buffer.from('a\r'),
      Buffer.from('b\r'),
    ]);
  });

  it('always agrees with countLines on the number of lines', () => {
    for (const text of ['', 'a', 'a\n', 'a\nb', 'a\nb\n', '\n', 'a\r\nb']) {
      const bytes = Buffer.from(text);
      expect(splitLineBytes(bytes)).toHaveLength(countLines(bytes));
    }
  });
});

describe('compareByCodeUnit', () => {
  it('orders by UTF-16 code units, where locale order disagrees', () => {
    // 'B' (0x42) precedes 'a' (0x61) by code units; localeCompare orders
    // lowercase first. A localeCompare regression flips these expectations.
    expect(compareByCodeUnit('B', 'a')).toBe(-1);
    expect(compareByCodeUnit('a', 'B')).toBe(1);
    expect(compareByCodeUnit('same', 'same')).toBe(0);
    expect('B'.localeCompare('a')).toBeGreaterThan(0);
  });
});

describe('countLines', () => {
  it('counts by LF-split of raw bytes, not counting a trailing empty split', () => {
    expect(countLines(Buffer.from(''))).toBe(0);
    expect(countLines(Buffer.from('a'))).toBe(1);
    expect(countLines(Buffer.from('a\n'))).toBe(1);
    expect(countLines(Buffer.from('a\nb'))).toBe(2);
    expect(countLines(Buffer.from('a\nb\n'))).toBe(2);
    expect(countLines(Buffer.from('\n'))).toBe(1);
  });

  it('treats CRLF as content plus LF (no EOL normalisation)', () => {
    expect(countLines(Buffer.from('a\r\nb\r\n'))).toBe(2);
  });
});

describe('classifyInventoryMode', () => {
  it('classifies markdown text as lines', () => {
    expect(classifyInventoryMode('plans/a.md', Buffer.from('# hi\n'))).toBe('lines');
  });

  it('classifies non-markdown text as whole-file', () => {
    expect(classifyInventoryMode('plans/a.ts', Buffer.from('export {};\n'))).toBe('whole-file');
    expect(classifyInventoryMode('plans/a.tsv', Buffer.from('x\ty\n'))).toBe('whole-file');
  });

  it('classifies a null byte in the sniff window as opaque, even for .md', () => {
    expect(classifyInventoryMode('plans/a.md', Buffer.from([0x61, 0x00, 0x62]))).toBe('opaque');
    expect(classifyInventoryMode('plans/a.bin', Buffer.from([0x00]))).toBe('opaque');
  });

  it('only sniffs the first window for null bytes', () => {
    const bytes = Buffer.alloc(BINARY_SNIFF_WINDOW_BYTES + 100, 0x61);
    bytes[BINARY_SNIFF_WINDOW_BYTES + 50] = 0x00;
    expect(classifyInventoryMode('plans/a.txt', bytes)).toBe('whole-file');
  });
});

/** A minimal valid denominator document, spreadable per-test. */
const validDenominator = (): Record<string, unknown> => ({
  version: 1,
  generatedFrom: { freezeRuleVersion: 1, ratifiedBy: '.agent/decisions/g1.md' },
  files: [
    {
      path: 'plans/a.md',
      bytes: 5,
      sha256: SHA256_ABC,
      lines: 1,
      inventory_mode: 'lines',
    },
  ],
  totals: { files: 1, lines: 1, bytes: 5 },
});

describe('parseDenominator', () => {
  it('parses a valid denominator', () => {
    const result = parseDenominator(validDenominator());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.totals.files).toBe(1);
      expect(result.value.files[0].inventory_mode).toBe('lines');
    }
  });

  it('rejects unknown keys at every level (closed shape)', () => {
    expect(parseDenominator({ ...validDenominator(), extra: 1 }).ok).toBe(false);
    const withBadFile = validDenominator();
    withBadFile.files = [
      {
        path: 'plans/a.md',
        bytes: 5,
        sha256: SHA256_ABC,
        lines: 1,
        inventory_mode: 'lines',
        note: 'nope',
      },
    ];
    expect(parseDenominator(withBadFile).ok).toBe(false);
  });

  it('rejects a malformed sha256 and an unknown inventory_mode', () => {
    const badSha = validDenominator();
    badSha.files = [
      { path: 'plans/a.md', bytes: 5, sha256: 'abc123', lines: 1, inventory_mode: 'lines' },
    ];
    expect(parseDenominator(badSha).ok).toBe(false);

    const badMode = validDenominator();
    badMode.files = [
      { path: 'plans/a.md', bytes: 5, sha256: SHA256_ABC, lines: 1, inventory_mode: 'text' },
    ];
    expect(parseDenominator(badMode).ok).toBe(false);
  });
});

describe('parseFreezeIdentityProof', () => {
  it('parses a valid proof array', () => {
    const result = parseFreezeIdentityProof([
      { path: 'plans/a.md', source_sha256: SHA256_ABC, copy_sha256: SHA256_ABC, bytes: 3 },
    ]);
    expect(result.ok).toBe(true);
  });

  it('rejects an entry with unknown keys or a missing hash', () => {
    expect(
      parseFreezeIdentityProof([
        {
          path: 'plans/a.md',
          source_sha256: SHA256_ABC,
          copy_sha256: SHA256_ABC,
          bytes: 3,
          spare: true,
        },
      ]).ok,
    ).toBe(false);
    expect(
      parseFreezeIdentityProof([{ path: 'plans/a.md', source_sha256: SHA256_ABC, bytes: 3 }]).ok,
    ).toBe(false);
  });
});

describe('path-traversal refusal at the artefact read boundary', () => {
  /** A one-row valid freeze-identity proof, with `path` overridable per case. */
  const proofWithPath = (rowPath: string): Record<string, unknown>[] => [
    { path: rowPath, source_sha256: SHA256_ABC, copy_sha256: SHA256_ABC, bytes: 3 },
  ];

  /** A minimal valid amendment, with the single file/proof `path` overridable. */
  const amendmentWithFilePath = (rowPath: string): Record<string, unknown> => ({
    version: 1,
    files: [{ path: rowPath, bytes: 5, sha256: SHA256_ABC, lines: 1, inventory_mode: 'lines' }],
    identityProof: [
      { path: rowPath, source_sha256: SHA256_ABC, copy_sha256: SHA256_ABC, bytes: 5 },
    ],
  });

  it('refuses a `..` segment, an absolute path, and a backslash in a denominator file.path', () => {
    for (const badPath of [
      'plans/../secret.md',
      '/etc/passwd',
      String.raw`plans\a.md`,
      '../escape.md',
    ]) {
      const doc = validDenominator();
      doc.files = [
        { path: badPath, bytes: 5, sha256: SHA256_ABC, lines: 1, inventory_mode: 'lines' },
      ];
      expect(parseDenominator(doc).ok).toBe(false);
    }
  });

  it('still accepts an ordinary relative POSIX file.path (no false positive)', () => {
    const doc = validDenominator();
    doc.files = [
      { path: 'plans/alpha/a.md', bytes: 5, sha256: SHA256_ABC, lines: 1, inventory_mode: 'lines' },
    ];
    expect(parseDenominator(doc).ok).toBe(true);
  });

  it('refuses a `..`-bearing freeze-identity proof.path', () => {
    expect(parseFreezeIdentityProof(proofWithPath('proofs/../../secret')).ok).toBe(false);
    expect(parseFreezeIdentityProof(proofWithPath('/abs/proof')).ok).toBe(false);
  });

  it('refuses a `..`-bearing amendment file.path AND proof.path (nothing merged downstream)', () => {
    // The amendment reuses the SAME refined denominator/freeze-identity schemas,
    // so a traversal path is refused at parse — before any effective-denominator
    // merge or write can consume it.
    expect(parseDenominatorAmendment(amendmentWithFilePath('plans/../../etc/passwd')).ok).toBe(
      false,
    );
    expect(parseDenominatorAmendment(amendmentWithFilePath('plans/ok.md')).ok).toBe(true);
  });
});
