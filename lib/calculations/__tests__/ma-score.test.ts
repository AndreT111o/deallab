import { describe, expect, it } from "vitest";
import { computeMAScore } from "../ma-score";
import type { BalanceSheet, FinancialStatement, PeerCompany } from "@/types";

const financials: FinancialStatement = {
  companyId: "test",
  year: 2026,
  period: "actual",
  revenue: 1000,
  revenueGrowth: 0.15, // top of growth scale -> 100
  ebitda: 400, // 40% margin -> top of margin scale
  ebitdaMargin: 0.4,
  ebit: 350,
  ebitMargin: 0.35,
  netIncome: 250,
  eps: 5,
  depreciationAmortization: 50,
  capex: 60,
  changeInNetWorkingCapital: 10,
  freeCashFlow: 280, // 70% conversion -> top of conversion scale
};

const balanceSheet: BalanceSheet = {
  companyId: "test",
  year: 2026,
  cash: 200,
  totalDebt: 200,
  netDebt: 0, // 0x leverage -> top of balance sheet scale
  totalAssets: 2000,
  totalEquity: 1200,
};

const peers: PeerCompany[] = [
  {
    id: "p1",
    ticker: "PEER1",
    name: "Peer One",
    marketCap: 5000,
    enterpriseValue: 5200,
    revenue: 900,
    ebitda: 300,
    ebitdaMargin: 0.33,
    revenueGrowth: 0.08,
    evRevenue: 5.8,
    evEbitda: 13,
    pe: 20,
    source: "DEMO DATA",
  },
  {
    id: "p2",
    ticker: "PEER2",
    name: "Peer Two",
    marketCap: 6000,
    enterpriseValue: 6300,
    revenue: 1100,
    ebitda: 350,
    ebitdaMargin: 0.32,
    revenueGrowth: 0.07,
    evRevenue: 5.7,
    evEbitda: 13,
    pe: 21,
    source: "DEMO DATA",
  },
];

describe("computeMAScore", () => {
  it("scores best-in-class fundamentals near the top of each 0-100 band", () => {
    const score = computeMAScore({
      latestFinancials: financials,
      latestBalanceSheet: balanceSheet,
      peers,
      targetEvEbitda: 13, // trading in line with peer median -> mid-high score
      strategicPositioning: 85,
      consolidationPotential: 80,
    });

    expect(score.growthProfile).toBe(100);
    expect(score.balanceSheet).toBe(100);
    expect(score.financialQuality).toBeGreaterThan(90);
    expect(score.strategicAttractiveness).toBe(85);
    expect(score.industryConsolidation).toBe(80);
    expect(score.overall).toBeGreaterThan(0);
    expect(score.overall).toBeLessThanOrEqual(100);
  });

  it("penalizes high leverage in the balance sheet sub-score", () => {
    const leveredScore = computeMAScore({
      latestFinancials: financials,
      latestBalanceSheet: { ...balanceSheet, netDebt: 1600 }, // 4x EBITDA
      peers,
      targetEvEbitda: 13,
      strategicPositioning: 85,
      consolidationPotential: 80,
    });
    expect(leveredScore.balanceSheet).toBeLessThan(50);
  });

  it("penalizes trading at a large premium to peer multiples", () => {
    const expensiveScore = computeMAScore({
      latestFinancials: financials,
      latestBalanceSheet: balanceSheet,
      peers,
      targetEvEbitda: 20, // well above ~13x peer median
      strategicPositioning: 85,
      consolidationPotential: 80,
    });
    expect(expensiveScore.valuationAttractiveness).toBeLessThan(50);
  });

  it("keeps overall score within 0-100 bounds", () => {
    const worst = computeMAScore({
      latestFinancials: {
        ...financials,
        revenueGrowth: -0.1,
        ebitdaMargin: 0.05,
        freeCashFlow: -50,
      },
      latestBalanceSheet: { ...balanceSheet, netDebt: 5000 },
      peers,
      targetEvEbitda: 40,
      strategicPositioning: 5,
      consolidationPotential: 5,
    });
    expect(worst.overall).toBeGreaterThanOrEqual(0);
    expect(worst.overall).toBeLessThanOrEqual(100);
  });
});
