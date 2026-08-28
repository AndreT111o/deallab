
import { MockFinancialDataProvider } from "./providers/mock-provider";
import { FMPFinancialDataProvider } from "./providers/fmp-provider";
import type { FinancialDataProvider } from "./financial-data-provider";

/**
 * Every consumer imports `getFinancialDataProvider()`, never a concrete
 * provider class. Uses live Financial Modeling Prep data when FMP_API_KEY
 * is configured; falls back to the curated Ferrari demo data otherwise
 * (e.g. local dev without a key, or if the free-tier rate limit is hit).
 */
export function getFinancialDataProvider(): FinancialDataProvider {
  if (process.env.FMP_API_KEY) {
    return new FMPFinancialDataProvider();
  }
  return new MockFinancialDataProvider();
}