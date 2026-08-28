import type { CompanyBundle } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricTile } from "@/components/company/metric-tile";
import { ScoreBar } from "@/components/company/score-bar";
import {
  formatCurrencyM,
  formatMultiple,
  formatPercent,
  formatPrice,
  formatSignedPercent,
} from "@/lib/calculations/formatters";
import { getDefaultDCF, getLatest } from "@/lib/calculations/bundle-derived";
import { MiniTrendChart } from "@/features/financials/mini-trend-chart";

export function OverviewTab({ bundle }: { bundle: CompanyBundle }) {
  const { company, financials, maScore } = bundle;
  const { financials: latest, valuation: latestVal } = getLatest(bundle);
  const dcf = getDefaultDCF(bundle);
  const currency = company.currency === "EUR" ? "€" : "$";

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="py-6">
          <p className="max-w-3xl text-sm leading-relaxed text-ink-muted">
            {company.description}
          </p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Key Metrics — FY{latest.year}</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-2 sm:grid-cols-4">
          <MetricTile
            label="Revenue"
            value={formatCurrencyM(latest.revenue, currency)}
            sub={`+${formatPercent(latest.revenueGrowth ?? 0)} YoY`}
          />
          <MetricTile
            label="EBITDA"
            value={formatCurrencyM(latest.ebitda, currency)}
            glossaryTerm="Net Debt / EBITDA"
          />
          <MetricTile
            label="EBITDA Margin"
            value={formatPercent(latest.ebitdaMargin)}
          />
          <MetricTile
            label="EV / EBITDA"
            value={formatMultiple(latestVal.evEbitda)}
            glossaryTerm="EV / EBITDA"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Financial Performance</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <MiniTrendChart
              title="Revenue"
              data={financials.map((f) => ({ year: f.year, value: f.revenue }))}
              format={(v) => formatCurrencyM(v, currency)}
            />
            <MiniTrendChart
              title="EBITDA"
              data={financials.map((f) => ({ year: f.year, value: f.ebitda }))}
              format={(v) => formatCurrencyM(v, currency)}
            />
            <MiniTrendChart
              title="EBITDA Margin"
              data={financials.map((f) => ({ year: f.year, value: f.ebitdaMargin * 100 }))}
              format={(v) => `${v.toFixed(1)}%`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>M&amp;A Attractiveness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl tabular tracking-tight text-deal-strong">
                {maScore.overall}
              </span>
              <span className="text-sm text-ink-faint">/ 100</span>
            </div>
            <div className="space-y-2.5">
              <ScoreBar label="Strategic Fit" value={maScore.strategicAttractiveness} size="sm" />
              <ScoreBar label="Financial Quality" value={maScore.financialQuality} size="sm" />
              <ScoreBar label="Valuation" value={maScore.valuationAttractiveness} size="sm" />
              <ScoreBar label="Growth" value={maScore.growthProfile} size="sm" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Valuation Snapshot</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-2 sm:grid-cols-4">
          <MetricTile label="Current Price" value={formatPrice(company.sharePrice, currency)} />
          <MetricTile
            label="DCF Implied Value"
            value={formatPrice(dcf.impliedSharePrice, currency)}
          />
          <MetricTile
            label="DCF Upside / Downside"
            value={formatSignedPercent(dcf.upsideDownside)}
            tone={dcf.upsideDownside >= 0 ? "positive" : "negative"}
          />
          <MetricTile
            label="Net Debt / EBITDA"
            value={formatMultiple(
              bundle.balanceSheet[bundle.balanceSheet.length - 1].netDebt / latest.ebitda
            )}
          />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Analyst View</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-ink-muted">
            {bundle.analystAnalysis.summary}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
