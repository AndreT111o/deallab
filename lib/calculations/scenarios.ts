import type { ScenarioResult } from "@/types";

export interface ScenarioAssumption {
  label: "Bear" | "Base" | "Bull";
  revenueGrowth: number; // forward-year growth applied to base revenue
  ebitdaMargin: number;
  exitMultiple: number; // EV/EBITDA applied to scenario EBITDA
}

/**
 * Simple forward-year scenario valuation: grows revenue one year forward,
 * applies a scenario EBITDA margin, then capitalizes at a scenario
 * EV/EBITDA multiple. Deterministic — no LLM in the math.
 */
export function computeScenario(
  assumption: ScenarioAssumption,
  baseRevenue: number,
  netDebt: number,
  dilutedShares: number,
  currentSharePrice: number
): ScenarioResult {
  const revenue = baseRevenue * (1 + assumption.revenueGrowth);
  const ebitda = revenue * assumption.ebitdaMargin;
  const enterpriseValue = ebitda * assumption.exitMultiple;
  const equityValue = enterpriseValue - netDebt;
  const impliedSharePrice = equityValue / dilutedShares;
  const upsideDownside = impliedSharePrice / currentSharePrice - 1;

  return {
    label: assumption.label,
    revenueGrowth: assumption.revenueGrowth,
    ebitdaMargin: assumption.ebitdaMargin,
    exitMultiple: assumption.exitMultiple,
    revenue,
    ebitda,
    enterpriseValue,
    equityValue,
    impliedSharePrice,
    upsideDownside,
  };
}

export function computeScenarios(
  assumptions: ScenarioAssumption[],
  baseRevenue: number,
  netDebt: number,
  dilutedShares: number,
  currentSharePrice: number
): ScenarioResult[] {
  return assumptions.map((a) =>
    computeScenario(a, baseRevenue, netDebt, dilutedShares, currentSharePrice)
  );
}
