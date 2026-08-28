import type {
  CompsImpliedValuation,
  FinancialStatement,
  PeerCompany,
} from "@/types";
import { percentile } from "./percentiles";

export interface TradingMultiples {
  evRevenue: number;
  evEbitda: number;
  evEbit: number;
  pe: number;
  fcfYield: number;
}

export function computeTradingMultiples(
  enterpriseValue: number,
  marketCap: number,
  financials: FinancialStatement,
  netIncome: number
): TradingMultiples {
  return {
    evRevenue: enterpriseValue / financials.revenue,
    evEbitda: enterpriseValue / financials.ebitda,
    evEbit: enterpriseValue / financials.ebit,
    pe: marketCap / netIncome,
    fcfYield: financials.freeCashFlow / marketCap,
  };
}

/**
 * Implied enterprise/equity value & share price from a peer multiple,
 * evaluated at the 25th percentile, median, and 75th percentile of the
 * peer set. Never invents a peer multiple — callers must supply `peers`.
 */
export function impliedValuationFromComps(
  metric: "evEbitda" | "evRevenue" | "pe",
  peers: PeerCompany[],
  targetMetricValue: number, // target EBITDA, Revenue, or Net Income depending on metric
  netDebt: number,
  dilutedShares: number
): CompsImpliedValuation {
  const multiples = peers.map((p) => p[metric]).filter(Number.isFinite);

  const build = (multiple: number) => {
    if (metric === "pe") {
      const impliedEquityValue = multiple * targetMetricValue;
      return {
        multiple,
        impliedEv: impliedEquityValue + netDebt,
        impliedSharePrice: impliedEquityValue / dilutedShares,
      };
    }
    const impliedEv = multiple * targetMetricValue;
    const impliedEquityValue = impliedEv - netDebt;
    return {
      multiple,
      impliedEv,
      impliedSharePrice: impliedEquityValue / dilutedShares,
    };
  };

  return {
    metric,
    low: build(percentile(multiples, 0.25)),
    median: build(percentile(multiples, 0.5)),
    high: build(percentile(multiples, 0.75)),
  };
}
