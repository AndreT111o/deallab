import type { FinancialDataProvider } from "../financial-data-provider";
import type { CompanyBundle } from "@/types";
import { ferrariBundle } from "./ferrari-data";

/**
 * MockFinancialDataProvider
 * --------------------------
 * Phase 1 data source. Backed entirely by hand-curated DEMO DATA bundles
 * (see ./ferrari-data.ts). Implements the same FinancialDataProvider
 * interface a live vendor integration would, so it's a drop-in swap later.
 *
 * Companies beyond the seeded demo set return `null` / no search matches —
 * the UI surfaces this as "Coming soon" rather than fabricating data.
 */
const BUNDLES: Record<string, CompanyBundle> = {
  RACE: ferrariBundle,
};

// Lightweight catalogue so the landing-page search can suggest names that
// aren't backed by a full bundle yet — clearly routed to a "coming soon" state.
const COMING_SOON = [
  { ticker: "SPOT", name: "Spotify Technology S.A.", sector: "Communication Services", country: "Luxembourg" },
  { ticker: "MC.PA", name: "LVMH Moët Hennessy Louis Vuitton", sector: "Consumer Discretionary", country: "France" },
  { ticker: "RYAAY", name: "Ryanair Holdings plc", sector: "Industrials", country: "Ireland" },
  { ticker: "MONC.MI", name: "Moncler S.p.A.", sector: "Consumer Discretionary", country: "Italy" },
];

export class MockFinancialDataProvider implements FinancialDataProvider {
  async searchCompanies(query: string) {
    const q = query.trim().toLowerCase();
    const seeded = Object.values(BUNDLES).map((b) => ({
      ticker: b.company.ticker,
      name: b.company.name,
      sector: b.company.sector,
      country: b.company.country,
    }));
    const all = [...seeded, ...COMING_SOON];
    if (!q) return all;
    return all.filter(
      (c) =>
        c.ticker.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    );
  }

  async getCompanyBundle(ticker: string) {
    const bundle = BUNDLES[ticker.toUpperCase()];
    return bundle ?? null;
  }
}
