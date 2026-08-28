import type {
  BalanceSheet,
  FinancialStatement,
  MAScoreBreakdown,
  PeerCompany,
} from "@/types";

/**
 * M&A Attractiveness Score — methodology notes
 * ---------------------------------------------
 * This score is an ANALYTICAL FRAMEWORK, not a prediction. It is never
 * presented to the user as an estimate of acquisition probability.
 *
 * Every sub-score is 0–100 and derived from a documented, deterministic
 * formula below so the result is fully auditable. Two inputs
 * (`strategicPositioning` and `consolidationPotential`) are analyst
 * judgment calls that must be supplied explicitly by whoever curates the
 * company data (see services/providers/ferrari-data.ts) — they are never
 * invented at render time and are clearly separated from the quantitative
 * sub-scores below.
 *
 * Overall score = simple average of the six components (equal-weighted).
 */

export const SCORE_WEIGHTS = {
  strategicAttractiveness: 1 / 6,
  financialQuality: 1 / 6,
  valuationAttractiveness: 1 / 6,
  growthProfile: 1 / 6,
  balanceSheet: 1 / 6,
  industryConsolidation: 1 / 6,
};

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

/** Linear interpolation of `value` from [inLow, inHigh] to [0, 100]. */
function scale(value: number, inLow: number, inHigh: number): number {
  if (inHigh === inLow) return 50;
  const t = (value - inLow) / (inHigh - inLow);
  return clamp(t * 100);
}

export interface MAScoreInputs {
  latestFinancials: FinancialStatement;
  latestBalanceSheet: BalanceSheet;
  peers: PeerCompany[];
  targetEvEbitda: number;
  /** Analyst-supplied 0–100 judgment on brand strength / market leadership. */
  strategicPositioning: number;
  /** Analyst-supplied 0–100 judgment on how consolidated the industry is
   * and how plausible further consolidation is. */
  consolidationPotential: number;
}

export function computeMAScore(inputs: MAScoreInputs): MAScoreBreakdown {
  const { latestFinancials, latestBalanceSheet, peers, targetEvEbitda } =
    inputs;

  // Growth: 0% growth -> 30, 15%+ growth -> 100
  const growthProfile = scale(latestFinancials.revenueGrowth ?? 0, 0, 0.15);

  // Financial quality: blend of EBITDA margin (10%->30, 40%->100) and
  // FCF conversion (FCF / EBITDA: 0%->20, 70%+ ->100)
  const marginScore = scale(latestFinancials.ebitdaMargin, 0.1, 0.4);
  const fcfConversion =
    latestFinancials.ebitda > 0
      ? latestFinancials.freeCashFlow / latestFinancials.ebitda
      : 0;
  const conversionScore = scale(fcfConversion, 0, 0.7);
  const financialQuality = marginScore * 0.6 + conversionScore * 0.4;

  // Balance sheet: Net Debt / EBITDA. 0.0x -> 100, 4.0x+ -> 15 (inverse)
  const netDebtToEbitda =
    latestFinancials.ebitda !== 0
      ? latestBalanceSheet.netDebt / latestFinancials.ebitda
      : 0;
  const balanceSheet = clamp(100 - scale(netDebtToEbitda, 0, 4) * 0.85);

  // Valuation attractiveness: target EV/EBITDA vs peer median. Trading
  // AT OR BELOW peer median reads as more attractive to an acquirer
  // (less premium to pay); trading well above peer median reads as less
  // attractive on a pure entry-multiple basis. This is a valuation-entry
  // lens only, not a comment on whether the company is a good business.
  const peerMultiples = peers.map((p) => p.evEbitda).filter(Number.isFinite);
  const peerMedian =
    peerMultiples.length > 0
      ? [...peerMultiples].sort((a, b) => a - b)[
          Math.floor(peerMultiples.length / 2)
        ]
      : targetEvEbitda;
  const premiumToPeers = targetEvEbitda / peerMedian - 1; // + = trades above peers
  // -30% discount -> 100, +30% premium -> 20
  const valuationAttractiveness = clamp(
    100 - scale(premiumToPeers, -0.3, 0.3) * 0.8
  );

  const strategicAttractiveness = clamp(inputs.strategicPositioning);
  const industryConsolidation = clamp(inputs.consolidationPotential);

  const overall =
    strategicAttractiveness * SCORE_WEIGHTS.strategicAttractiveness +
    financialQuality * SCORE_WEIGHTS.financialQuality +
    valuationAttractiveness * SCORE_WEIGHTS.valuationAttractiveness +
    growthProfile * SCORE_WEIGHTS.growthProfile +
    balanceSheet * SCORE_WEIGHTS.balanceSheet +
    industryConsolidation * SCORE_WEIGHTS.industryConsolidation;

  return {
    strategicAttractiveness: Math.round(strategicAttractiveness),
    financialQuality: Math.round(financialQuality),
    valuationAttractiveness: Math.round(valuationAttractiveness),
    growthProfile: Math.round(growthProfile),
    balanceSheet: Math.round(balanceSheet),
    industryConsolidation: Math.round(industryConsolidation),
    overall: Math.round(overall),
  };
}
