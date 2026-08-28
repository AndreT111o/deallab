
import type { FinancialDataProvider } from "../financial-data-provider";
import type {

  BalanceSheet,
  Company,
  CompanyBundle,
  DCFAssumptions,
  FinancialStatement,
  PeerCompany,
  ValuationMetrics,
} from "@/types";
import { computeMAScore } from "@/lib/calculations/ma-score";
import { generateAIAnalystOutput } from "@/services/ai-analyst";

/**
 * FMPFinancialDataProvider
 * -------------------------
 * Live data provider backed by Financial Modeling Prep's `/stable` REST API
 * (https://site.financialmodelingprep.com/developer/docs). Implements the
 * same FinancialDataProvider interface as the mock provider, so nothing in
 * app/, features/, or lib/calculations/ needs to change to use this.
 *
 * Two honest limitations, by design (not oversights):
 *
 * 1. `analystAnalysis` (the narrative AI Analyst tab) is NOT generated here.
 *    Writing fake investment analysis for a real, named public company would
 *    be actively misleading. This returns a clearly-labelled placeholder
 *    until a live LLM call is wired in (see roadmap Fase 2, item 9).
 *
 * 2. `strategicPositioning` and `consolidationPotential` — the two M&A Score
 *    sub-scores that ma-score.ts explicitly documents as analyst judgment
 *    calls, not something derivable from financial statements — default to
 *    a neutral 50/100 here. They are NOT invented from the data.
 */

const BASE_URL = "https://financialmodelingprep.com/stable";

function apiKey(): string {
  const key = process.env.FMP_API_KEY;
  if (!key) {
    throw new Error(
      "FMP_API_KEY is not set. Add it to .env.local (and to your Vercel project's Environment Variables)."
    );
  }
  return key;
}

async function fmpGet<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("apikey", apiKey());
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error(`FMP request failed (${res.status}): ${url.pathname}`);
  }
  const data = await res.json();
  if (data && typeof data === "object" && "Error Message" in data) {
    throw new Error(`FMP error: ${(data as { "Error Message": string })["Error Message"]}`);
  }
  return data as T;
}

// --- Raw FMP response shapes (only the fields we actually use) -------------

interface FmpProfile {
  symbol: string;
  companyName: string;
  price: number;
  marketCap: number;
  currency: string;
  exchangeFullName: string;
  exchange: string;
  country: string;
  sector: string;
  industry: string;
  description: string;
}

interface FmpIncomeStatement {
  date: string;
  fiscalYear: string;
  period: string;
  revenue: number;
  operatingIncome: number;
  incomeBeforeTax: number;
  incomeTaxExpense: number;
  netIncome: number;
  epsDiluted: number;
  weightedAverageShsOutDil: number;
}

interface FmpCashFlowStatement {
  date: string;
  depreciationAndAmortization: number;
  capitalExpenditure: number; // negative
  changeInWorkingCapital: number;
  freeCashFlow: number;
}

interface FmpBalanceSheet {
  date: string;
  cashAndCashEquivalents: number;
  totalDebt: number;
  netDebt: number;
  totalAssets: number;
  totalStockholdersEquity: number;
}

interface FmpEnterpriseValues {
  date: string;
  marketCapitalization: number;
  enterpriseValue: number;
}

interface FmpSearchResult {
  symbol: string;
  name: string;
  currency: string;
  exchangeFullName: string;
  exchange: string;
}

interface FmpPeers {
  symbol: string;
  peersList: string[];
}

const M = 1_000_000; // FMP returns raw currency units; our types are in millions

// --- Helpers to turn raw FMP series into DealLab's normalized types --------

function buildFinancials(
  companyId: string,
  income: FmpIncomeStatement[],
  cashflow: FmpCashFlowStatement[]
): FinancialStatement[] {
  // FMP returns most-recent-first; we need oldest-first to compute YoY growth.
  const sorted = [...income].sort((a, b) => a.date.localeCompare(b.date));
  return sorted.map((f, i) => {
    const cf = cashflow.find((c) => c.date === f.date);
    const da = cf?.depreciationAndAmortization ?? 0;
    const ebitda = f.operatingIncome + da;
    const prevRevenue = i > 0 ? sorted[i - 1].revenue : null;
    return {
      companyId,
      year: Number(f.fiscalYear),
      period: "actual",
      revenue: f.revenue / M,
      revenueGrowth: prevRevenue ? f.revenue / prevRevenue - 1 : null,
      ebitda: ebitda / M,
      ebitdaMargin: f.revenue !== 0 ? ebitda / f.revenue : 0,
      ebit: f.operatingIncome / M,
      ebitMargin: f.revenue !== 0 ? f.operatingIncome / f.revenue : 0,
      netIncome: f.netIncome / M,
      eps: f.epsDiluted,
      depreciationAmortization: da / M,
      capex: Math.abs(cf?.capitalExpenditure ?? 0) / M,
      changeInNetWorkingCapital: (cf?.changeInWorkingCapital ?? 0) / M,
      freeCashFlow: (cf?.freeCashFlow ?? f.netIncome + da) / M,
    };
  });
}

function buildBalanceSheet(companyId: string, balance: FmpBalanceSheet[]): BalanceSheet[] {
  return [...balance]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((b) => ({
      companyId,
      year: Number(b.date.slice(0, 4)),
      cash: b.cashAndCashEquivalents / M,
      totalDebt: b.totalDebt / M,
      netDebt: b.netDebt / M,
      totalAssets: b.totalAssets / M,
      totalEquity: b.totalStockholdersEquity / M,
    }));
}

function buildValuation(
  companyId: string,
  ev: FmpEnterpriseValues[],
  financials: FinancialStatement[]
): ValuationMetrics[] {
  return [...ev]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => {
      const year = Number(e.date.slice(0, 4));
      const f = financials.find((x) => x.year === year);
      const marketCap = e.marketCapitalization / M;
      const enterpriseValue = e.enterpriseValue / M;
      return {
        companyId,
        year,
        enterpriseValue,
        marketCap,
        evRevenue: f && f.revenue !== 0 ? enterpriseValue / f.revenue : 0,
        evEbitda: f && f.ebitda !== 0 ? enterpriseValue / f.ebitda : 0,
        evEbit: f && f.ebit !== 0 ? enterpriseValue / f.ebit : 0,
        pe: f && f.netIncome !== 0 ? marketCap / f.netIncome : 0,
        fcfYield: f && marketCap !== 0 ? f.freeCashFlow / marketCap : 0,
      };
    });
}



async function fetchPeer(ticker: string): Promise<PeerCompany | null> {
  try {
    const [profile, income, ev] = await Promise.all([
      fmpGet<FmpProfile[]>("/profile", { symbol: ticker }),
      fmpGet<FmpIncomeStatement[]>("/income-statement", { symbol: ticker, period: "annual", limit: 2 }),
      fmpGet<FmpEnterpriseValues[]>("/enterprise-values", { symbol: ticker, limit: 1 }),
    ]);
    const p = profile[0];
    const latest = income[0];
    const prior = income[1];
    const e = ev[0];
    if (!p || !latest || !e) return null;

    const ebitda = latest.operatingIncome; // D&A omitted here to keep peer fan-out to 3 calls/peer
    const marketCap = e.marketCapitalization / M;
    const enterpriseValue = e.enterpriseValue / M;
    const revenueGrowth = prior ? latest.revenue / prior.revenue - 1 : 0;

    return {
      id: ticker.toLowerCase(),
      ticker,
      name: p.companyName,
      marketCap,
      enterpriseValue,
      revenue: latest.revenue / M,
      ebitda: ebitda / M,
      ebitdaMargin: latest.revenue !== 0 ? ebitda / latest.revenue : 0,
      revenueGrowth,
      evRevenue: latest.revenue !== 0 ? enterpriseValue / (latest.revenue / M) : 0,
      evEbitda: ebitda !== 0 ? enterpriseValue / (ebitda / M) : 0,
      pe: latest.netIncome !== 0 ? marketCap / (latest.netIncome / M) : 0,
      source: "LIVE",
    };
  } catch {
    return null; // one bad peer shouldn't sink the whole bundle
  }
}

function buildDcfDefaults(financials: FinancialStatement[]): DCFAssumptions {
  const latest = financials[financials.length - 1];
  const growthSamples = financials
    .map((f) => f.revenueGrowth)
    .filter((g): g is number => g !== null)
    .slice(-3);
  const avgGrowth = growthSamples.length
    ? growthSamples.reduce((s, g) => s + g, 0) / growthSamples.length
    : 0.05;
  const clampedGrowth = Math.min(Math.max(avgGrowth, 0.02), 0.15);

  const avg = (vals: number[]) => (vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0);
  const capexPct = avg(financials.map((f) => (f.revenue !== 0 ? f.capex / f.revenue : 0)));
  const daPct = avg(
    financials.map((f) => (f.revenue !== 0 ? f.depreciationAmortization / f.revenue : 0))
  );
  const nwcPct = avg(
    financials.map((f) => (f.revenue !== 0 ? f.changeInNetWorkingCapital / f.revenue : 0))
  );

  const years = [1, 2, 3, 4, 5].map((i) => latest.year + i);

  return {
    years,
    revenueGrowth: years.map(() => clampedGrowth),
    ebitdaMargin: years.map(() => latest.ebitdaMargin),
    daPctRevenue: years.map(() => daPct || 0.05),
    capexPctRevenue: years.map(() => capexPct || 0.05),
    nwcPctRevenue: years.map(() => nwcPct || 0.01),
    taxRate: 0.25, // generic default — editable in the Valuation tab
    wacc: 0.09, // generic default — editable in the Valuation tab
    terminalGrowth: 0.025,
    baseRevenue: latest.revenue,
  };
}

export class FMPFinancialDataProvider implements FinancialDataProvider {
  async searchCompanies(query: string) {
    const q = query.trim();
    if (!q) return [];
    const results = await fmpGet<FmpSearchResult[]>("/search-name", { query: q, limit: 10 });
    return results.map((r) => ({
      ticker: r.symbol,
      name: r.name,
      sector: "", // not returned by the search endpoint; populated once the full bundle loads
      country: r.exchangeFullName,
    }));
  }

  async getCompanyBundle(ticker: string): Promise<CompanyBundle | null> {
    const symbol = ticker.toUpperCase();
    try {
      const [profileArr, income, balance, cashflow, ev, peersArr] = await Promise.all([
        fmpGet<FmpProfile[]>("/profile", { symbol }),
        fmpGet<FmpIncomeStatement[]>("/income-statement", { symbol, period: "annual", limit: 5 }),
        fmpGet<FmpBalanceSheet[]>("/balance-sheet-statement", { symbol, period: "annual", limit: 5 }),
        fmpGet<FmpCashFlowStatement[]>("/cash-flow-statement", { symbol, period: "annual", limit: 5 }),
        fmpGet<FmpEnterpriseValues[]>("/enterprise-values", { symbol, limit: 5 }),
        fmpGet<FmpPeers[]>("/stock-peers", { symbol }),
      ]);

      const profile = profileArr[0];
      if (!profile || income.length === 0) return null;

      const companyId = symbol.toLowerCase();
      const financials = buildFinancials(companyId, income, cashflow);
      const balanceSheet = buildBalanceSheet(companyId, balance);
      const valuation = buildValuation(companyId, ev, financials);

      const company: Company = {
        id: companyId,
        ticker: symbol,
        name: profile.companyName,
        exchange: profile.exchangeFullName,
        country: profile.country,
        sector: profile.sector,
        industry: profile.industry,
        description: profile.description,
        currency: profile.currency,
        sharePrice: profile.price,
        dilutedSharesOutstanding:
          income[0]?.weightedAverageShsOutDil != null
            ? income[0].weightedAverageShsOutDil / M
            : profile.marketCap / profile.price / M,
        marketCap: profile.marketCap / M,
        source: "LIVE",
      };

      // Cap peer fan-out at 5 tickers to stay well within the free-tier rate limit.
      const peerTickers = (peersArr[0]?.peersList ?? []).slice(0, 5);
      const peerResults = await Promise.all(peerTickers.map(fetchPeer));
      const peers = peerResults.filter((p): p is PeerCompany => p !== null);

      const dcfDefaults = buildDcfDefaults(financials);

      const latestFinancials = financials[financials.length - 1];
      const latestBalanceSheet = balanceSheet[balanceSheet.length - 1];
      const latestValuation = valuation[valuation.length - 1];

      const maScore = computeMAScore({
        latestFinancials,
        latestBalanceSheet,
        peers,
        targetEvEbitda: latestValuation?.evEbitda ?? 0,
        // Neutral, non-fabricated defaults — see file header.
        strategicPositioning: 50,
        consolidationPotential: 50,
      });

      const analystAnalysis = await generateAIAnalystOutput(
        company,
        financials,
        balanceSheet,
        valuation,
        peers,
        maScore
      );
      
      return {
        company,
        financials,
        balanceSheet,
        valuation,
        peers,
        dcfDefaults,
        analystAnalysis,
        maScore,
      };
    } catch (err) {
      console.error(`FMPFinancialDataProvider.getCompanyBundle(${symbol}) failed:`, err);
      return null;
    }
  }
}