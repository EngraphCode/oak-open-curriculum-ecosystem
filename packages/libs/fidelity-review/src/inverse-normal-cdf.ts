/**
 * Φ⁻¹ (inverse standard-normal CDF) as a standalone numeric primitive —
 * the Acklam rational approximation, relative error below 1.15e-9 over
 * (0, 1), no dependency. Extracted from visual-calibration at its line
 * cap; the calibration module remains its consumer.
 */
import { err, ok, type Result } from '@oaknational/result';

/** Φ⁻¹ via the Acklam rational approximation. */
export function inverseNormalCdf(p: number): Result<number, string> {
  if (!(p > 0 && p < 1)) {
    return err(`inverseNormalCdf domain is (0, 1); saw ${p}`);
  }
  const a = [
    -39.696_830_286_653_76, 220.946_098_424_520_5, -275.928_510_446_968_9, 138.357_751_867_269,
    -30.664_798_066_147_16, 2.506_628_277_459_239,
  ] as const;
  const b = [
    -54.476_098_798_224_06, 161.585_836_858_040_9, -155.698_979_859_886_6, 66.801_311_887_719_72,
    -13.280_681_552_885_72,
  ] as const;
  const c = [
    -0.007_784_894_002_430_293, -0.322_396_458_041_136_5, -2.400_758_277_161_838,
    -2.549_732_539_343_734, 4.374_664_141_464_968, 2.938_163_982_698_783,
  ] as const;
  const d = [
    0.007_784_695_709_041_462, 0.322_467_129_070_039_8, 2.445_134_137_142_996,
    3.754_408_661_907_416,
  ] as const;
  const pLow = 0.024_25;
  const pHigh = 1 - pLow;
  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    return ok(
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
        ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1),
    );
  }
  if (p > pHigh) {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    return ok(
      -(
        (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
        ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
      ),
    );
  }
  const q = p - 0.5;
  const r = q * q;
  return ok(
    ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1),
  );
}
