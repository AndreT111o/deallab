import { describe, expect, it } from "vitest";
import { mean, percentile, summaryStats } from "../percentiles";

describe("percentile", () => {
  it("matches Excel PERCENTILE.INC on a known dataset", () => {
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(percentile(values, 0)).toBe(1);
    expect(percentile(values, 1)).toBe(10);
    expect(percentile(values, 0.5)).toBeCloseTo(5.5, 6);
    expect(percentile(values, 0.25)).toBeCloseTo(3.25, 6);
    expect(percentile(values, 0.75)).toBeCloseTo(7.75, 6);
  });

  it("handles a single value", () => {
    expect(percentile([42], 0.5)).toBe(42);
  });
});

describe("mean", () => {
  it("computes arithmetic mean", () => {
    expect(mean([2, 4, 6])).toBe(4);
  });
});

describe("summaryStats", () => {
  it("returns min/p25/median/mean/p75/max and ignores non-finite values", () => {
    const stats = summaryStats([10, 12, 14, 16, 18, NaN, Infinity]);
    expect(stats.min).toBe(10);
    expect(stats.max).toBe(18);
    expect(stats.median).toBe(14);
    expect(stats.mean).toBeCloseTo(14, 6);
  });
});
