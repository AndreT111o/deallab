import type { DCFAssumptions, SensitivityCell } from "@/types";
import { runDCF } from "./dcf";

/**
 * Builds a WACC (rows) x terminal growth (columns) sensitivity matrix of
 * implied share price. Re-runs the full deterministic DCF for each cell so
 * the table always reflects the current assumption set.
 */
export function buildSensitivityMatrix(
  assumptions: DCFAssumptions,
  netDebt: number,
  dilutedShares: number,
  currentSharePrice: number,
  waccRange: number[],
  terminalGrowthRange: number[]
): SensitivityCell[][] {
  return waccRange.map((wacc) =>
    terminalGrowthRange.map((terminalGrowth) => {
      if (wacc <= terminalGrowth) {
        return { wacc, terminalGrowth, impliedSharePrice: NaN };
      }
      const result = runDCF(
        { ...assumptions, wacc, terminalGrowth },
        netDebt,
        dilutedShares,
        currentSharePrice
      );
      return {
        wacc,
        terminalGrowth,
        impliedSharePrice: result.impliedSharePrice,
      };
    })
  );
}

/** Default step ranges shown around a base-case WACC / terminal growth. */
export function defaultSensitivityRanges(
  baseWacc: number,
  baseTerminalGrowth: number
) {
  const waccRange = [-1, -0.5, 0, 0.5, 1].map(
    (stepPct) => Math.round((baseWacc + stepPct / 100) * 1000) / 1000
  );
  const terminalGrowthRange = [-1, -0.5, 0, 0.5, 1].map(
    (stepPct) => Math.round((baseTerminalGrowth + stepPct / 100) * 1000) / 1000
  );
  return { waccRange, terminalGrowthRange };
}
