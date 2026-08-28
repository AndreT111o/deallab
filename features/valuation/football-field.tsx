import type { CompanyBundle, DCFAssumptions } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/calculations/formatters";
import { buildSensitivityMatrix, defaultSensitivityRanges } from "@/lib/calculations/sensitivity";
import { impliedValuationFromComps } from "@/lib/calculations/multiples";
import { getLatest } from "@/lib/calculations/bundle-derived";

interface Range {
  label: string;
  low: number;
  high: number;
}

export function FootballField({
  bundle,
  assumptions,
}: {
  bundle: CompanyBundle;
  assumptions: DCFAssumptions;
}) {
  const currency = bundle.company.currency === "EUR" ? "€" : "$";
  const { balanceSheet, financials } = getLatest(bundle);
  const shares = bundle.company.dilutedSharesOutstanding;
  const currentPrice = bundle.company.sharePrice;

  const { waccRange, terminalGrowthRange } = defaultSensitivityRanges(
    assumptions.wacc,
    assumptions.terminalGrowth
  );
  const matrix = buildSensitivityMatrix(
    assumptions,
    balanceSheet.netDebt,
    shares,
    currentPrice,
    waccRange,
    terminalGrowthRange
  );
  const dcfPrices = matrix.flat().map((c) => c.impliedSharePrice).filter(Number.isFinite);

  const compsImplied = impliedValuationFromComps(
    "evEbitda",
    bundle.peers,
    financials.ebitda,
    balanceSheet.netDebt,
    shares
  );

  const historicalPrices = bundle.valuation.map((v) => v.marketCap / shares);

  const ranges: Range[] = [
    { label: "DCF", low: Math.min(...dcfPrices), high: Math.max(...dcfPrices) },
    {
      label: "Trading Comparables",
      low: compsImplied.low.impliedSharePrice,
      high: compsImplied.high.impliedSharePrice,
    },
    {
      label: "Historical Trading Range",
      low: Math.min(...historicalPrices),
      high: Math.max(...historicalPrices),
    },
  ];

  const globalMin = Math.min(...ranges.map((r) => r.low), currentPrice) * 0.9;
  const globalMax = Math.max(...ranges.map((r) => r.high), currentPrice) * 1.1;
  const span = globalMax - globalMin;

  const pct = (v: number) => ((v - globalMin) / span) * 100;
  const currentPct = pct(currentPrice);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Football Field — Implied Share Price</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative pt-2">
          {/* current price marker */}
          <div
            className="pointer-events-none absolute bottom-6 top-2 z-10 border-l border-dashed border-ink/40"
            style={{ left: `${currentPct}%` }}
          >
            <span className="absolute -top-2 -translate-x-1/2 whitespace-nowrap rounded bg-ink px-1.5 py-0.5 text-2xs font-medium text-paper">
              Current {formatPrice(currentPrice, currency)}
            </span>
          </div>

          <div className="space-y-5">
            {ranges.map((r) => {
              const left = pct(r.low);
              const width = pct(r.high) - pct(r.low);
              return (
                <div key={r.label}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-ink-muted">{r.label}</span>
                    <span className="font-mono tabular text-ink-faint">
                      {formatPrice(r.low, currency)} – {formatPrice(r.high, currency)}
                    </span>
                  </div>
                  <div className="relative h-6 rounded-sm bg-surface-sunken">
                    <div
                      className="absolute inset-y-0 rounded-sm bg-deal/80"
                      style={{ left: `${left}%`, width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}

            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-ink-faint">Analyst Consensus</span>
                <span className="font-mono text-2xs text-ink-faint">N/A — no live data feed connected</span>
              </div>
              <div className="h-6 rounded-sm border border-dashed border-line bg-transparent" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
