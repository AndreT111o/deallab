import type { CompanyBundle, RiskLevel } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { ScoreBar } from "@/components/company/score-bar";
import {
  formatCurrencyM,
  formatPrice,
  formatSignedPercent,
} from "@/lib/calculations/formatters";
import { computeScenarios } from "@/lib/calculations/scenarios";
import { getLatest } from "@/lib/calculations/bundle-derived";
import { percentile } from "@/lib/calculations/percentiles";

const RISK_TONE: Record<RiskLevel, BadgeTone> = {
  Low: "positive",
  Medium: "amber",
  High: "negative",
};

export function MATab({ bundle }: { bundle: CompanyBundle }) {
  const { company, maScore, analystAnalysis } = bundle;
  const { financials, balanceSheet, valuation } = getLatest(bundle);
  const currency = company.currency === "EUR" ? "€" : "$";

  const peerEvEbitda = bundle.peers.map((p) => p.evEbitda);
  const p25 = percentile(peerEvEbitda, 0.25);
  const p75 = percentile(peerEvEbitda, 0.75);

  const scenarios = computeScenarios(
    [
      {
        label: "Bear",
        revenueGrowth: (financials.revenueGrowth ?? 0.05) * 0.4,
        ebitdaMargin: financials.ebitdaMargin - 0.03,
        exitMultiple: p25,
      },
      {
        label: "Base",
        revenueGrowth: bundle.dcfDefaults.revenueGrowth[0],
        ebitdaMargin: bundle.dcfDefaults.ebitdaMargin[0],
        exitMultiple: valuation.evEbitda,
      },
      {
        label: "Bull",
        revenueGrowth: bundle.dcfDefaults.revenueGrowth[0] * 1.6,
        ebitdaMargin: financials.ebitdaMargin + 0.02,
        exitMultiple: p75 > valuation.evEbitda ? p75 : valuation.evEbitda * 1.08,
      },
    ],
    financials.revenue,
    balanceSheet.netDebt,
    company.dilutedSharesOutstanding,
    company.sharePrice
  );

  return (
    <div className="space-y-10">
      <section>
        <Card>
          <CardHeader>
            <CardTitle>M&amp;A Attractiveness Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex items-end gap-3">
              <span className="font-mono text-5xl tabular tracking-tight text-deal-strong">
                {maScore.overall}
              </span>
              <span className="mb-1 text-sm text-ink-faint">/ 100</span>
            </div>
            <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              <ScoreBar label="Strategic Attractiveness" value={maScore.strategicAttractiveness} />
              <ScoreBar label="Financial Quality" value={maScore.financialQuality} />
              <ScoreBar label="Valuation Attractiveness" value={maScore.valuationAttractiveness} />
              <ScoreBar label="Growth Profile" value={maScore.growthProfile} />
              <ScoreBar label="Balance Sheet" value={maScore.balanceSheet} />
              <ScoreBar label="Industry Consolidation Potential" value={maScore.industryConsolidation} />
            </div>
            <p className="mt-6 border-t border-line pt-4 text-xs leading-relaxed text-ink-faint">
              This score is an analytical framework built from transparent,
              equal-weighted, deterministic sub-scores (see methodology in{" "}
              <code className="font-mono">lib/calculations/ma-score.ts</code>
              ). It is not a prediction that this company will be acquired.
            </p>
          </CardContent>
        </Card>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Investment Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {analystAnalysis.investment_highlights.map((h, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-ink-muted">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-deal" />
                  {h}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Potential Acquisition Rationale</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {analystAnalysis.ma_rationale.map((r, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-ink-muted">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
                  {r}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Potential Buyer Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {analystAnalysis.buyer_types.map((b, i) => (
              <div key={i} className="rounded-md border border-line p-4">
                <Badge tone="deal">{b.category}</Badge>
                <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                  {b.rationale}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-x-auto">
        <CardHeader>
          <CardTitle>M&amp;A Risks</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="px-5 py-2.5 text-2xs font-medium uppercase tracking-[0.05em] text-ink-faint">Risk</th>
                <th className="px-5 py-2.5 text-2xs font-medium uppercase tracking-[0.05em] text-ink-faint">Level</th>
                <th className="px-5 py-2.5 text-2xs font-medium uppercase tracking-[0.05em] text-ink-faint">Note</th>
              </tr>
            </thead>
            <tbody>
              {analystAnalysis.risks.map((r, i) => (
                <tr key={i} className="border-b border-line last:border-b-0">
                  <td className="px-5 py-3 font-medium text-ink">{r.label}</td>
                  <td className="px-5 py-3">
                    <Badge tone={RISK_TONE[r.level]}>{r.level}</Badge>
                  </td>
                  <td className="px-5 py-3 text-xs leading-relaxed text-ink-muted">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="overflow-x-auto">
        <CardHeader>
          <CardTitle>Bull / Base / Bear</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="px-5 py-2.5 text-2xs font-medium uppercase tracking-[0.05em] text-ink-faint">Scenario</th>
                <th className="px-5 py-2.5 text-right text-2xs font-medium uppercase tracking-[0.05em] text-ink-faint">Revenue</th>
                <th className="px-5 py-2.5 text-right text-2xs font-medium uppercase tracking-[0.05em] text-ink-faint">EBITDA</th>
                <th className="px-5 py-2.5 text-right text-2xs font-medium uppercase tracking-[0.05em] text-ink-faint">EV</th>
                <th className="px-5 py-2.5 text-right text-2xs font-medium uppercase tracking-[0.05em] text-ink-faint">Equity Value</th>
                <th className="px-5 py-2.5 text-right text-2xs font-medium uppercase tracking-[0.05em] text-ink-faint">Implied Price</th>
                <th className="px-5 py-2.5 text-right text-2xs font-medium uppercase tracking-[0.05em] text-ink-faint">Upside/Downside</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((s) => (
                <tr key={s.label} className="border-b border-line last:border-b-0">
                  <td className="px-5 py-3">
                    <Badge
                      tone={s.label === "Bull" ? "positive" : s.label === "Bear" ? "negative" : "neutral"}
                    >
                      {s.label}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right font-mono tabular">{formatCurrencyM(s.revenue, currency)}</td>
                  <td className="px-5 py-3 text-right font-mono tabular">{formatCurrencyM(s.ebitda, currency)}</td>
                  <td className="px-5 py-3 text-right font-mono tabular">{formatCurrencyM(s.enterpriseValue, currency)}</td>
                  <td className="px-5 py-3 text-right font-mono tabular">{formatCurrencyM(s.equityValue, currency)}</td>
                  <td className="px-5 py-3 text-right font-mono tabular">{formatPrice(s.impliedSharePrice, currency)}</td>
                  <td
                    className={`px-5 py-3 text-right font-mono tabular ${
                      s.upsideDownside >= 0 ? "text-positive" : "text-negative"
                    }`}
                  >
                    {formatSignedPercent(s.upsideDownside)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
