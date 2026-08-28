import type { DCFAssumptions, DCFResult, DCFYearResult } from "@/types";

/**
 * Deterministic DCF engine.
 *
 * IMPORTANT: per DealLab's financial engineering rule, valuation math is
 * never delegated to the LLM. This function is pure, synchronous, and
 * fully unit-testable (see lib/calculations/__tests__/dcf.test.ts).
 *
 * Revenue -> EBITDA -> EBIT -> NOPAT -> +D&A -> -Capex -> -ΔNWC -> UFCF
 * UFCF is discounted at WACC; terminal value uses the Gordon Growth method.
 */
export function runDCF(
  assumptions: DCFAssumptions,
  netDebt: number,
  dilutedShares: number,
  currentSharePrice: number
): DCFResult {
  const {
    years,
    revenueGrowth,
    ebitdaMargin,
    daPctRevenue,
    capexPctRevenue,
    nwcPctRevenue,
    taxRate,
    wacc,
    terminalGrowth,
    baseRevenue,
  } = assumptions;

  if (wacc <= terminalGrowth) {
    throw new Error(
      "WACC must be greater than the terminal growth rate for a Gordon Growth terminal value to be defined."
    );
  }

  const yearResults: DCFYearResult[] = [];
  let priorRevenue = baseRevenue;

  years.forEach((year, i) => {
    const g = revenueGrowth[i] ?? 0;
    const margin = ebitdaMargin[i] ?? 0;
    const daPct = daPctRevenue[i] ?? 0;
    const capexPct = capexPctRevenue[i] ?? 0;
    const nwcPct = nwcPctRevenue[i] ?? 0;

    const revenue = priorRevenue * (1 + g);
    const ebitda = revenue * margin;
    const da = revenue * daPct;
    const ebit = ebitda - da;
    const nopat = ebit * (1 - taxRate);
    const capex = revenue * capexPct;
    const changeInNwc = revenue * nwcPct;
    const unleveredFcf = nopat + da - capex - changeInNwc;

    const t = i + 1;
    const discountFactor = 1 / Math.pow(1 + wacc, t);
    const presentValue = unleveredFcf * discountFactor;

    yearResults.push({
      year,
      revenue,
      ebitda,
      ebit,
      nopat,
      da,
      capex,
      changeInNwc,
      unleveredFcf,
      discountFactor,
      presentValue,
    });

    priorRevenue = revenue;
  });

  const sumOfPvFcf = yearResults.reduce((sum, y) => sum + y.presentValue, 0);

  const lastYear = yearResults[yearResults.length - 1];
  const terminalValue =
    (lastYear.unleveredFcf * (1 + terminalGrowth)) / (wacc - terminalGrowth);
  const pvTerminalValue = terminalValue * lastYear.discountFactor;

  const enterpriseValue = sumOfPvFcf + pvTerminalValue;
  const equityValue = enterpriseValue - netDebt;
  const impliedSharePrice = equityValue / dilutedShares;
  const upsideDownside = impliedSharePrice / currentSharePrice - 1;

  return {
    years: yearResults,
    sumOfPvFcf,
    terminalValue,
    pvTerminalValue,
    enterpriseValue,
    netDebt,
    equityValue,
    dilutedShares,
    impliedSharePrice,
    currentSharePrice,
    upsideDownside,
  };
}
