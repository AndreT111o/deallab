import { describe, expect, it } from "vitest";
import { runDCF } from "../dcf";
import type { DCFAssumptions } from "@/types";

// Known-inputs case, hand-verifiable:
// Base revenue 100, flat 10% growth, flat 30% EBITDA margin, no D&A/Capex/NWC,
// 25% tax, 10% WACC, 2% terminal growth, single forecast year.
const singleYearAssumptions: DCFAssumptions = {
  years: [2027],
  revenueGrowth: [0.1],
  ebitdaMargin: [0.3],
  daPctRevenue: [0],
  capexPctRevenue: [0],
  nwcPctRevenue: [0],
  taxRate: 0.25,
  wacc: 0.1,
  terminalGrowth: 0.02,
  baseRevenue: 100,
};

describe("runDCF", () => {
  it("computes revenue, EBITDA, EBIT and NOPAT correctly for a single year", () => {
    const result = runDCF(singleYearAssumptions, 0, 10, 20);
    const y = result.years[0];

    expect(y.revenue).toBeCloseTo(110, 6); // 100 * 1.10
    expect(y.ebitda).toBeCloseTo(33, 6); // 110 * 0.30
    expect(y.ebit).toBeCloseTo(33, 6); // no D&A
    expect(y.nopat).toBeCloseTo(24.75, 6); // 33 * (1 - 0.25)
    expect(y.unleveredFcf).toBeCloseTo(24.75, 6); // no D&A/Capex/NWC add-backs
  });

  it("discounts UFCF at WACC using end-of-year convention", () => {
    const result = runDCF(singleYearAssumptions, 0, 10, 20);
    const y = result.years[0];
    expect(y.discountFactor).toBeCloseTo(1 / 1.1, 6);
    expect(y.presentValue).toBeCloseTo(24.75 / 1.1, 6);
  });

  it("computes Gordon Growth terminal value correctly", () => {
    const result = runDCF(singleYearAssumptions, 0, 10, 20);
    // TV = UFCF * (1+g) / (WACC - g) = 24.75 * 1.02 / 0.08
    const expectedTV = (24.75 * 1.02) / 0.08;
    expect(result.terminalValue).toBeCloseTo(expectedTV, 6);
    expect(result.pvTerminalValue).toBeCloseTo(
      expectedTV * result.years[0].discountFactor,
      6
    );
  });

  it("derives enterprise value, equity value and implied share price", () => {
    const netDebt = 50;
    const dilutedShares = 10;
    const currentPrice = 20;
    const result = runDCF(
      singleYearAssumptions,
      netDebt,
      dilutedShares,
      currentPrice
    );

    const expectedEV = result.sumOfPvFcf + result.pvTerminalValue;
    expect(result.enterpriseValue).toBeCloseTo(expectedEV, 6);
    expect(result.equityValue).toBeCloseTo(expectedEV - netDebt, 6);
    expect(result.impliedSharePrice).toBeCloseTo(
      (expectedEV - netDebt) / dilutedShares,
      6
    );
    expect(result.upsideDownside).toBeCloseTo(
      result.impliedSharePrice / currentPrice - 1,
      6
    );
  });

  it("throws when WACC is not greater than terminal growth", () => {
    expect(() =>
      runDCF(
        { ...singleYearAssumptions, wacc: 0.02, terminalGrowth: 0.02 },
        0,
        10,
        20
      )
    ).toThrow();
  });

  it("compounds revenue correctly across multiple forecast years", () => {
    const multiYear: DCFAssumptions = {
      ...singleYearAssumptions,
      years: [2027, 2028, 2029],
      revenueGrowth: [0.1, 0.08, 0.06],
      ebitdaMargin: [0.3, 0.31, 0.32],
      daPctRevenue: [0.03, 0.03, 0.03],
      capexPctRevenue: [0.04, 0.04, 0.04],
      nwcPctRevenue: [0.01, 0.01, 0.01],
    };
    const result = runDCF(multiYear, 0, 10, 20);
    expect(result.years).toHaveLength(3);
    expect(result.years[0].revenue).toBeCloseTo(110, 6);
    expect(result.years[1].revenue).toBeCloseTo(110 * 1.08, 6);
    expect(result.years[2].revenue).toBeCloseTo(110 * 1.08 * 1.06, 6);
  });
});
