import { MockFinancialDataProvider } from "./providers/mock-provider";
import type { FinancialDataProvider } from "./financial-data-provider";

/**
 * Swap this line to point the entire app at a live provider once one is
 * implemented (e.g. `new CapitalIQProvider()` / `new PolygonProvider()`).
 * Every consumer imports `getFinancialDataProvider()`, never a concrete
 * provider class, so this is the only line that needs to change.
 */
export function getFinancialDataProvider(): FinancialDataProvider {
  return new MockFinancialDataProvider();
}
