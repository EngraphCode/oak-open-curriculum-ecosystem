# S1 deterministic evidence (v1)

This compact record makes the S1 deterministic layer reproducible without
versioning its generated bulk outputs. Sources, frozen inputs, generators, and
this verification contract are durable; the five generated outputs are local
and ignored.

## Verdict and boundary

The deterministic layer is complete and recomputable. Two complete runs from
base `0a04617d420ad47145c8af27af45d529581f830a` produced identical counts and
byte-identical SHA-256 values for all five outputs. The standing freeze check
verified all 681/681 denominator files with no missing, unreadable, changed, or
extra entries.

This evidence does **not** close full S1. The 77 residue candidates and 3,514
sweep hits across 523 files are J3 adjudication inputs. The declared-rate
reader sample remains the open, owner-gated fleet residual. No judgement or
fleet work is represented here.

## Recorded outputs

`Lines` means physical newline-delimited lines. For JSONL outputs it is also
the semantic row count. The residue semantic-row count is its candidate count;
the proof semantic-row count is its three planted-defect proofs.

| Output | Bytes | Lines | Semantic rows | SHA-256 |
| --- | ---: | ---: | ---: | --- |
| `inventory.v1.jsonl` | 18,958,318 | 69,623 | 69,623 | `8c212300a2e256ea24e67925456fe79cbc36b7612b122d5183f70d7df8125b37` |
| `net-diff.v1.report.json` | 19,244,678 | 497,993 | n/a | `108428ac876e3f718a3e57abfa5003a2d0b6684fa8f7c2aa36374abfc3ac3fb4` |
| `residue.v1.report.json` | 9,464,455 | 424,989 | 77 candidates | `29b969f1160982e539cdd806404e4c8d7b0886185fee5899378681d53742318b` |
| `sweep/sweep-hits.v1.jsonl` | 1,473,731 | 3,514 | 3,514 | `1e79010da165a88645d11b86455270710690269cd5610180f3b92f3e5017eee8` |
| `proofs/orphan-discrimination.v1.md` | 2,116 | 62 | 3 proofs | `22b38d4f1e1e6a95b0b45416f6df21f8616a423e65194e97f39294af38f279f1` |

The machine-readable twin is
[`s1-deterministic-evidence.v1.json`](s1-deterministic-evidence.v1.json).

## Headline measurements

- Inventory: 643 Markdown files, 169,258 lines, 69,623 anchors, and a 41.13%
  anchor ratio.
- Residue: 77 candidates. Reason memberships overlap: 73 `oversized-block`,
  five `low-anchor-file`, and one `file-preamble`. The exclusive combinations
  are 72 oversized only, three low-anchor only, one preamble plus low-anchor,
  and one low-anchor plus oversized.
- Sweep: 3,514 marker hits in 523 of the 694 files scanned.

These non-zero outputs are queues for placed judgement, not automatic findings
or closure evidence.

## P4 calibration

All plants ran against staged scratch copies; the frozen archive was not
modified.

1. An anchorless 30-line work-bearing preamble produced exactly one new
   residue candidate at lines 1–30.
2. A misspelt Net-C keyword remained inventory-invisible while the correctly
   spelt control shifted Net C by exactly one.
3. The marker-free sweep plant produced zero hits while a marker-bearing
   control in the same staged copy produced one hit.

Calibration disclosure: marker-free sweep plant invisible while control hit —
the sweep's zero is NOT trusted for marker-free content.

The disclosure is a demonstrated detector boundary, not a pass. It is why the
declared-rate reader sample remains open.

## Regenerate

Use a clean checkout at the exact recorded run base
`0a04617d420ad47145c8af27af45d529581f830a`. From the repository root, run
this exact sequence without adding a `--help` probe:

```sh
pnpm install
pnpm build
pnpm --filter @oaknational/agent-tools refound-verify-freeze
pnpm --filter @oaknational/agent-tools refound-inventory
pnpm --filter @oaknational/agent-tools refound-residue
pnpm --filter @oaknational/agent-tools refound-sweep
pnpm --filter @oaknational/agent-tools refound-plant-orphan
```

The tools write the five ignored outputs under `.agent/plans-refounding/`.
Repeat the five `refound-*` commands a second time. The second run must report
the same counts and the verification below must pass after both runs.

## Verify byte identity

From the repository root, run:

```sh
shasum -a 256 -c <<'EOF'
8c212300a2e256ea24e67925456fe79cbc36b7612b122d5183f70d7df8125b37  .agent/plans-refounding/inventory.v1.jsonl
108428ac876e3f718a3e57abfa5003a2d0b6684fa8f7c2aa36374abfc3ac3fb4  .agent/plans-refounding/net-diff.v1.report.json
29b969f1160982e539cdd806404e4c8d7b0886185fee5899378681d53742318b  .agent/plans-refounding/residue.v1.report.json
1e79010da165a88645d11b86455270710690269cd5610180f3b92f3e5017eee8  .agent/plans-refounding/sweep/sweep-hits.v1.jsonl
22b38d4f1e1e6a95b0b45416f6df21f8616a423e65194e97f39294af38f279f1  .agent/plans-refounding/proofs/orphan-discrimination.v1.md
EOF

wc -lc \
  .agent/plans-refounding/inventory.v1.jsonl \
  .agent/plans-refounding/net-diff.v1.report.json \
  .agent/plans-refounding/residue.v1.report.json \
  .agent/plans-refounding/sweep/sweep-hits.v1.jsonl \
  .agent/plans-refounding/proofs/orphan-discrimination.v1.md
```

Every checksum must print `OK`; `wc -lc` must reproduce the `Lines` and
`Bytes` columns above. A mismatch is a failed recomputation, not a reason to
refresh this record silently.
