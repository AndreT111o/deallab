// ---------------------------------------------------------------------------
// DealLab — Core domain types
//
// These are the normalized data objects every FinancialDataProvider must
// return, and every calculation / UI module consumes. Keeping this layer
// provider-agnostic is what lets mock data be swapped for a live API later
// without touching calculations or components (see services/README.md).
// ---------------------------------------------------------------------------

export type DataSource = "DEMO DATA" | "LIVE";

export interface Company {
  id: string;
  ticker: string;
  name: string;
  exchange: string;
  country: string;
  sector: string;
  industry: string;
  description: string;
  currency: string;
  sharePrice: number;
  dilutedSharesOutstanding: number; // millions
  marketCap: number; // millions, currency units
  source: DataSource;
}

export interface FinancialStatement {
  companyId: string;
  year: number;
  period: "actual" | "estimate";
  revenue: number; // millions
  revenueGrowth: number | null; // decimal, e.g. 0.08
  ebitda: number;
  ebitdaMargin: number;
  ebit: number;
  ebitMargin: number;
  netIncome: number;
  eps: number;
  depreciationAmortization: number;
  capex: number;
  changeInNetWorkingCapital: number;
  freeCashFlow: number;
}

export interface BalanceSheet {
  companyId: string;
  year: number;
  cash: number;
  totalDebt: number;
  netDebt: number;
  totalAssets: number;
  totalEquity: number;
}

export interface ValuationMetrics {
  companyId: string;
  year: number;
  enterpriseValue: number;
  marketCap: number;
  evRevenue: number;
  evEbitda: number;
  evEbit: number;
  pe: number;
  fcfYield: number;
}

export interface PeerCompany {
  id: string;
  ticker: string;
  name: string;
  marketCap: number;
  enterpriseValue: number;
  revenue: number;
  ebitda: number;
  ebitdaMargin: number;
  revenueGrowth: number;
  evRevenue: number;
  evEbitda: number;
  pe: number;
  source: DataSource;
}

export interface DCFAssumptions {
  years: number[]; // forecast years, e.g. [2027, 2028, 2029, 2030, 2031]
  revenueGrowth: number[]; // decimal per year, aligned to `years`
  ebitdaMargin: number[]; // decimal per year
  daPctRevenue: number[]; // D&A as % of revenue, per year
  capexPctRevenue: number[]; // Capex as % of revenue, per year
  nwcPctRevenue: number[]; // change in NWC as % of revenue, per year
  taxRate: number; // decimal
  wacc: number; // decimal
  terminalGrowth: number; // decimal
  baseRevenue: number; // last actual year revenue, forecast starts from here
}

export interface DCFYearResult {
  year: number;
  revenue: number;
  ebitda: number;
  ebit: number;
  nopat: number;
  da: number;
  capex: number;
  changeInNwc: number;
  unleveredFcf: number;
  discountFactor: number;
  presentValue: number;
}

export interface DCFResult {
  years: DCFYearResult[];
  sumOfPvFcf: number;
  terminalValue: number;
  pvTerminalValue: number;
  enterpriseValue: number;
  netDebt: number;
  equityValue: number;
  dilutedShares: number;
  impliedSharePrice: number;
  currentSharePrice: number;
  upsideDownside: number; // decimal
}

export interface SensitivityCell {
  wacc: number;
  terminalGrowth: number;
  impliedSharePrice: number;
}

export interface CompsStats {
  min: number;
  p25: number;
  median: number;
  mean: number;
  p75: number;
  max: number;
}

export interface CompsImpliedValuation {
  metric: "evEbitda" | "evRevenue" | "pe";
  low: { multiple: number; impliedEv: number; impliedSharePrice: number };
  median: { multiple: number; impliedEv: number; impliedSharePrice: number };
  high: { multiple: number; impliedEv: number; impliedSharePrice: number };
}

export type RiskLevel = "Low" | "Medium" | "High";

export interface MARisk {
  label: string;
  level: RiskLevel;
  note: string;
}

export interface MAScoreBreakdown {
  strategicAttractiveness: number;
  financialQuality: number;
  valuationAttractiveness: number;
  growthProfile: number;
  balanceSheet: number;
  industryConsolidation: number;
  overall: number;
}

export type BuyerCategory =
  | "Global strategic competitor"
  | "Adjacent industry player"
  | "Large-cap private equity fund"
  | "Infrastructure investor"
  | "Sovereign wealth fund"
  | "Family office / long-term holder";

export interface PotentialBuyer {
  category: BuyerCategory;
  rationale: string;
}

export interface ScenarioResult {
  label: "Bear" | "Base" | "Bull";
  revenueGrowth: number;
  ebitdaMargin: number;
  exitMultiple: number;
  revenue: number;
  ebitda: number;
  enterpriseValue: number;
  equityValue: number;
  impliedSharePrice: number;
  upsideDownside: number;
}

export interface AIAnalystOutput {
  summary: string;
  investment_highlights: string[];
  risks: MARisk[];
  ma_rationale: string[];
  buyer_types: PotentialBuyer[];
  bull_case: string;
  bear_case: string;
  conclusion: string;
}

export interface CompanyBundle {
  company: Company;
  financials: FinancialStatement[];
  balanceSheet: BalanceSheet[];
  valuation: ValuationMetrics[];
  peers: PeerCompany[];
  dcfDefaults: DCFAssumptions;
  analystAnalysis: AIAnalystOutput;
  maScore: MAScoreBreakdown;
}

export interface WatchlistItem {
  ticker: string;
  name: string;
  sector: string;
  enterpriseValue: number;
  evEbitda: number;
  maScore: number;
  savedAt: string;
}
