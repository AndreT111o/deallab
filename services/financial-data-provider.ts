import type { CompanyBundle } from "@/types";

/**
 * FinancialDataProvider
 * ----------------------
 * The single seam between DealLab's UI/calculation layer and wherever
 * company data actually comes from. Phase 1 ships a MockFinancialDataProvider
 * backed by hand-curated demo data (clearly marked `source: "DEMO DATA"`).
 *
 * To connect a real data vendor later, implement this interface against
 * that vendor's API and swap the provider in `services/index.ts` — nothing
 * in `app/`, `features/`, or `lib/calculations/` needs to change.
 */
export interface FinancialDataProvider {
  /** Search companies by ticker or name fragment. */
  searchCompanies(query: string): Promise<
    { ticker: string; name: string; sector: string; country: string }[]
  >;

  /** Fetch the full normalized bundle needed to render a company page. */
  getCompanyBundle(ticker: string): Promise<CompanyBundle | null>;
}
