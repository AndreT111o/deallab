"use client";

import { useMemo, useState } from "react";
import type { CompanyBundle } from "@/types";
import { runDCF } from "@/lib/calculations/dcf";
import { getLatest } from "@/lib/calculations/bundle-derived";
import { TradingMultiples } from "./trading-multiples";
import { DCFPanel } from "./dcf-panel";
import { SensitivityTable } from "./sensitivity-table";
import { CompsTable } from "@/features/comps/comps-table";
import { FootballField } from "./football-field";

export function ValuationTab({ bundle }: { bundle: CompanyBundle }) {
  const [assumptions, setAssumptions] = useState(bundle.dcfDefaults);
  const { balanceSheet } = getLatest(bundle);
  const currency = bundle.company.currency === "EUR" ? "€" : "$";

  const dcfResult = useMemo(
    () =>
      runDCF(
        assumptions,
        balanceSheet.netDebt,
        bundle.company.dilutedSharesOutstanding,
        bundle.company.sharePrice
      ),
    [assumptions, balanceSheet.netDebt, bundle.company]
  );

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-4 font-display text-lg font-medium">Trading Multiples</h2>
        <TradingMultiples bundle={bundle} />
      </section>

      <section>
        <h2 className="mb-4 font-display text-lg font-medium">Discounted Cash Flow</h2>
        <div className="space-y-6">
          <DCFPanel
            assumptions={assumptions}
            setAssumptions={setAssumptions}
            result={dcfResult}
            currency={currency}
          />
          <SensitivityTable
            assumptions={assumptions}
            netDebt={balanceSheet.netDebt}
            dilutedShares={bundle.company.dilutedSharesOutstanding}
            currentSharePrice={bundle.company.sharePrice}
            currency={currency}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-lg font-medium">Comparable Companies</h2>
        <CompsTable bundle={bundle} />
      </section>

      <section>
        <h2 className="mb-4 font-display text-lg font-medium">Football Field</h2>
        <FootballField bundle={bundle} assumptions={assumptions} />
      </section>
    </div>
  );
}
