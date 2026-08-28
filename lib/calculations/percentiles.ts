import type { CompsStats } from "@/types";

/** Linear-interpolation percentile (matches Excel's PERCENTILE.INC). */
export function percentile(values: number[], p: number): number {
  if (values.length === 0) return NaN;
  const sorted = [...values].sort((a, b) => a - b);
  if (sorted.length === 1) return sorted[0];

  const index = p * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];

  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

export function mean(values: number[]): number {
  if (values.length === 0) return NaN;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

export function summaryStats(values: number[]): CompsStats {
  const clean = values.filter((v) => Number.isFinite(v));
  return {
    min: Math.min(...clean),
    p25: percentile(clean, 0.25),
    median: percentile(clean, 0.5),
    mean: mean(clean),
    p75: percentile(clean, 0.75),
    max: Math.max(...clean),
  };
}
