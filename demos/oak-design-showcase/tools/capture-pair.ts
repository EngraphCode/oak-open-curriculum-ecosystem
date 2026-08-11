/**
 * Capture a reference/rebuild pair at a canonical width and run the
 * windowed rejection statistics over it (DDR-010: comparison is visual
 * first; the statistics direct the looking). Writes, under --out:
 * `<tag>-{left,right,heatmap}.png` (left = rebuild, right = reference,
 * heatmap = left with rejecting windows tinted red) plus
 * `<tag>-stats.json`; the stdout summary names the causal frontier and
 * top rejecting regions with σ-scores so a reader (human or LLM) starts
 * where the evidence points. Widths are canonical only (DDR-009's seam).
 *
 *   pnpm exec tsx tools/capture-pair.ts --left <url> --right <url>
 *     --width 1280 --out <dir> [--tag pair] [--window 32] [--threshold 6]
 *
 * (Invoke via `pnpm exec tsx`, not `pnpm run … -- …`: pnpm's run
 * passthrough swallows the leading `--left` flag.)
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { chromium } from '@playwright/test';

import { err, ok, type Result } from '@oaknational/result';
import { cropToHeight, decodePng, encodePng } from '@oaknational/fidelity-review/png-codec';
import {
  analysePair,
  renderHeatmapOverlay,
  type PairAnalysis,
} from '@oaknational/fidelity-review/visual-stats';
import { assertCanonicalWidth } from './measurement-widths';

export interface CapturePairConfig {
  readonly left: string;
  readonly right: string;
  readonly width: number;
  readonly out: string;
  readonly tag: string;
  readonly window: number;
  readonly threshold: number;
}

/** argv as --flag value pairs. */
function collectFlags(argv: readonly string[]): Result<ReadonlyMap<string, string>, string> {
  const flags = new Map<string, string>();
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key === undefined || !key.startsWith('--') || value === undefined) {
      return err(`arguments come in --flag value pairs; saw '${key ?? ''} ${value ?? ''}'`);
    }
    flags.set(key.slice(2), value);
  }
  return ok(flags);
}

function requireUrls(
  flags: ReadonlyMap<string, string>,
): Result<Pick<CapturePairConfig, 'left' | 'right' | 'out'>, string> {
  const left = flags.get('left');
  const right = flags.get('right');
  const out = flags.get('out');
  if (left === undefined || right === undefined || out === undefined) {
    return err('required: --left <url> --right <url> --out <dir>');
  }
  return ok({ left, right, out });
}

function parseWindow(flags: ReadonlyMap<string, string>): Result<number, string> {
  const window = Number(flags.get('window') ?? 32);
  return !Number.isInteger(window) || window < 4
    ? err(`--window must be an integer ≥ 4, saw '${flags.get('window') ?? ''}'`)
    : ok(window);
}

function parseThreshold(flags: ReadonlyMap<string, string>): Result<number, string> {
  const threshold = Number(flags.get('threshold') ?? 6);
  return !Number.isFinite(threshold) || threshold <= 0
    ? err(`--threshold must be a positive number, saw '${flags.get('threshold') ?? ''}'`)
    : ok(threshold);
}

/** Parse argv into a validated config. Pure. */
export function parseCapturePairArgs(argv: readonly string[]): Result<CapturePairConfig, string> {
  const flags = collectFlags(argv);
  if (!flags.ok) {
    return flags;
  }
  const urls = requireUrls(flags.value);
  if (!urls.ok) {
    return urls;
  }
  const width = assertCanonicalWidth(Number(flags.value.get('width') ?? Number.NaN));
  if (!width.ok) {
    return err(width.error);
  }
  const window = parseWindow(flags.value);
  if (!window.ok) {
    return window;
  }
  const threshold = parseThreshold(flags.value);
  if (!threshold.ok) {
    return threshold;
  }
  return ok({
    ...urls.value,
    width: width.value,
    tag: flags.value.get('tag') ?? 'pair',
    window: window.value,
    threshold: threshold.value,
  });
}

async function captureRgba(
  url: string,
  width: number,
): Promise<Result<{ rgba: Uint8Array; height: number }, string>> {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForTimeout(600);
    const shot = await page.screenshot({ fullPage: true });
    const decoded = decodePng(shot);
    if (!decoded.ok) {
      return err(`${url}: ${decoded.error}`);
    }
    return ok({ rgba: decoded.value.rgba, height: decoded.value.height });
  } finally {
    await browser.close();
  }
}

/** Both captures cropped to their common height. */
async function captureBoth(
  config: CapturePairConfig,
): Promise<Result<{ left: Uint8Array; right: Uint8Array; height: number }, string>> {
  const left = await captureRgba(config.left, config.width);
  if (!left.ok) {
    return err(`left: ${left.error}`);
  }
  const right = await captureRgba(config.right, config.width);
  if (!right.ok) {
    return err(`right: ${right.error}`);
  }
  const height = Math.min(left.value.height, right.value.height);
  const leftCrop = cropToHeight(left.value.rgba, config.width, left.value.height, height);
  const rightCrop = cropToHeight(right.value.rgba, config.width, right.value.height, height);
  if (!leftCrop.ok || !rightCrop.ok) {
    return err('crop refused a capture the codec accepted — report this');
  }
  return ok({ left: leftCrop.value, right: rightCrop.value, height });
}

/** Analyse the cropped pair and write the four outputs. */
function analyseAndWrite(
  config: CapturePairConfig,
  pair: { readonly left: Uint8Array; readonly right: Uint8Array; readonly height: number },
): Result<PairAnalysis, string> {
  const { width, out, tag } = config;
  const analysis = analysePair(pair.left, pair.right, width, pair.height, {
    windowSize: config.window,
    threshold: config.threshold,
  });
  if (!analysis.ok) {
    return analysis;
  }
  mkdirSync(out, { recursive: true });
  const writes: (readonly [string, Result<Uint8Array, string>])[] = [
    [`${tag}-left.png`, encodePng(pair.left, width, pair.height)],
    [`${tag}-right.png`, encodePng(pair.right, width, pair.height)],
    [
      `${tag}-heatmap.png`,
      encodePng(renderHeatmapOverlay(pair.left, width, analysis.value), width, pair.height),
    ],
  ];
  for (const [name, encoded] of writes) {
    if (!encoded.ok) {
      return err(`${name}: ${encoded.error}`);
    }
    writeFileSync(join(out, name), encoded.value);
  }
  writeFileSync(
    join(out, `${tag}-stats.json`),
    `${JSON.stringify({ left: config.left, right: config.right, ...analysis.value }, null, 2)}\n`,
  );
  return analysis;
}

function summarise(analysis: PairAnalysis): string {
  const top = analysis.rejecting.slice(0, 10);
  // The causal frontier: an offset shifts everything below it, so read
  // from the FIRST rejecting row, not the largest z (DDR-010).
  const firstY = analysis.rejecting.reduce(
    (min, windowScore) => Math.min(min, windowScore.y),
    Number.POSITIVE_INFINITY,
  );
  const frontier =
    analysis.rejecting.length > 0 ? ` first-rejecting-row=${firstY} (read top-down from here)` : '';
  const lines = [
    `sigma0=${analysis.sigma0.toFixed(3)} windows=${analysis.scores.length} rejecting=${analysis.rejecting.length} (z ≥ ${analysis.threshold})${frontier}`,
    ...top.map(
      (windowScore) =>
        `  reject ${windowScore.z.toFixed(1)}σ at (${windowScore.x},${windowScore.y}) ${windowScore.w}×${windowScore.h} meanΔ=${windowScore.meanAbsDiff.toFixed(2)}`,
    ),
  ];
  if (analysis.rejecting.length > top.length) {
    lines.push(
      `  … ${analysis.rejecting.length - top.length} further rejecting windows in stats.json`,
    );
  }
  return lines.join('\n');
}

async function main(): Promise<number> {
  const config = parseCapturePairArgs(process.argv.slice(2));
  if (!config.ok) {
    process.stderr.write(`capture-pair: ${config.error}\n`);
    return 2;
  }
  const pair = await captureBoth(config.value);
  if (!pair.ok) {
    process.stderr.write(`capture-pair: ${pair.error}\n`);
    return 1;
  }
  const analysis = analyseAndWrite(config.value, pair.value);
  if (!analysis.ok) {
    process.stderr.write(`capture-pair: ${analysis.error}\n`);
    return 1;
  }
  const { tag, out } = config.value;
  process.stdout.write(
    `${summarise(analysis.value)}\ncapture-pair: wrote ${tag}-{left,right,heatmap}.png + ${tag}-stats.json to ${out}\n`,
  );
  return 0;
}

const isDirectRun = process.argv[1]?.endsWith('capture-pair.ts') === true;
if (isDirectRun) {
  try {
    process.exitCode = await main();
  } catch (error: unknown) {
    process.stderr.write(
      `capture-pair: ${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
  }
}
