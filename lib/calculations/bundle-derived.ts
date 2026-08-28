import type { CompanyBundle, DCFResult, CompsImpliedValuation } from "@/types";
import { runDCF } from "./dcf";
import { impliedValuationFromComps } from "./multiples";

export function getLatest(bundle: CompanyBundle) {
  const financials = bundle.financials[bundle.financials.length - 1];
  const balanceSheet = bundle.balanceSheet[bundle.balanceSheet.length - 1];
  const valuation = bundle.valuation[bundle.valuation.length - 1];
  return { financials, balanceSheet, valuation };
}

export function getDefaultDCF(bundle: CompanyBundle): DCFResult {
  const { balanceSheet } = getLatest(bundle);
  return runDCF(
    bundle.dcfDefaults,
    balanceSheet.netDebt,
    bundle.company.dilutedSharesOutstanding,
    bundle.company.sharePrice
  );
}

export function getCompsImplied(bundle: CompanyBundle): CompsImpliedValuation {
  const { financials, balanceSheet } = getLatest(bundle);
  return impliedValuationFromComps(
    "evEbitda",
    bundle.peers,
    financials.ebitda,
    balanceSheet.netDebt,
    bundle.company.dilutedSharesOutstanding
  );
}
