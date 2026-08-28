"use client";

import { useMemo, useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import type { CompanyBundle } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  formatCurrencyM,
  formatMultiple,
  formatPercent,
  formatPrice,
  formatSignedPercent,
} from "@/lib/calculations/formatters";
import { getDefaultDCF, getLatest } from "@/lib/calculations/bundle-derived";

function FactLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-line py-2 text-sm last:border-b-0">
      <span className="text-ink-muted">{label}</span>
      <span className="font-mono tabular text-ink">{value}</span>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-line py-7 last:border-b-0">
      <h3 className="mb-3 font-display text-base font-medium">{title}</h3>
      {children}
    </section>
  );
}

export function MemoTab({ bundle }: { bundle: CompanyBundle }) {
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);

  const { company, analystAnalysis } = bundle;
  const { financials, balanceSheet, valuation } = getLatest(bundle);
  const currency = company.currency === "EUR" ? "€" : "$";
  const dcf = useMemo(() => getDefaultDCF(bundle), [bundle]);

  function handleGenerate() {
    setLoading(true);
    // Deterministic data is already computed; analystAnalysis comes from
    // lib/ai/generate-analyst-output.ts (curated demo output in this MVP,
    // live OpenAI call when OPENAI_API_KEY is configured). Simulated delay
    // only to reflect the real async generation step.
    setTimeout(() => {
      setLoading(false);
      setGenerated(true);
    }, 900);
  }

  function handleDownload() {
    const md = buildMarkdownMemo(bundle, dcf);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${company.ticker}-investment-memo.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!generated) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <FileText size={28} className="text-ink-faint" strokeWidth={1.5} />
          <div>
            <h3 className="font-display text-lg font-medium">Generate Investment Memo</h3>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-muted">
              Compiles company overview, financials, valuation, comps, and
              M&amp;A analysis into a single institutional-style document.
            </p>
          </div>
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Generating…
              </>
            ) : (
              "Generate Investment Memo"
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Badge tone="deal">Generated</Badge>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={handleDownload}>
            <Download size={13} /> Download .md
          </Button>
          <Button size="sm" variant="ghost" onClick={() => window.print()}>
            Print / Save as PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="py-8">
          <header className="mb-8 border-b border-line pb-6">
            <p className="text-2xs uppercase tracking-[0.08em] text-ink-faint">Investment Memo</p>
            <h1 className="mt-1 font-display text-3xl font-medium">{company.name}</h1>
            <p className="mt-1 font-mono text-sm text-ink-faint">{company.ticker} · {company.exchange}</p>
          </header>

          <Section title="Executive Summary">
            <Badge tone="deal" className="mb-2">AI Analysis</Badge>
            <p className="text-sm leading-relaxed text-ink-muted">{analystAnalysis.summary}</p>
          </Section>

          <Section title="Company Overview">
            <Badge tone="neutral" className="mb-2">Facts</Badge>
            <p className="text-sm leading-relaxed text-ink-muted">{company.description}</p>
          </Section>

          <Section title="Historical Financial Performance">
            <Badge tone="neutral" className="mb-2">Facts</Badge>
            <FactLine label={`Revenue (FY${financials.year})`} value={formatCurrencyM(financials.revenue, currency)} />
            <FactLine label="Revenue Growth" value={formatPercent(financials.revenueGrowth ?? 0)} />
            <FactLine label="EBITDA Margin" value={formatPercent(financials.ebitdaMargin)} />
            <FactLine label="Net Debt / EBITDA" value={formatMultiple(balanceSheet.netDebt / financials.ebitda)} />
          </Section>

          <Section title="Valuation">
            <Badge tone="neutral" className="mb-2">Facts (deterministic model output)</Badge>
            <FactLine label="Current Share Price" value={formatPrice(company.sharePrice, currency)} />
            <FactLine label="DCF Implied Share Price" value={formatPrice(dcf.impliedSharePrice, currency)} />
            <FactLine label="DCF Upside / Downside" value={formatSignedPercent(dcf.upsideDownside)} />
            <FactLine label="Current EV / EBITDA" value={formatMultiple(valuation.evEbitda)} />
          </Section>

          <Section title="M&A Rationale">
            <Badge tone="deal" className="mb-2">AI Analysis</Badge>
            <ul className="space-y-2 text-sm leading-relaxed text-ink-muted">
              {analystAnalysis.ma_rationale.map((r, i) => (
                <li key={i}>— {r}</li>
              ))}
            </ul>
          </Section>

          <Section title="Investment Highlights">
            <Badge tone="deal" className="mb-2">AI Analysis</Badge>
            <ul className="space-y-2 text-sm leading-relaxed text-ink-muted">
              {analystAnalysis.investment_highlights.map((h, i) => (
                <li key={i}>— {h}</li>
              ))}
            </ul>
          </Section>

          <Section title="Key Risks">
            <Badge tone="deal" className="mb-2">AI Analysis</Badge>
            <ul className="space-y-2 text-sm leading-relaxed text-ink-muted">
              {analystAnalysis.risks.map((r, i) => (
                <li key={i}>
                  <span className="font-medium text-ink">{r.label}</span> ({r.level}) — {r.note}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Potential Buyers">
            <Badge tone="deal" className="mb-2">AI Analysis</Badge>
            <ul className="space-y-2 text-sm leading-relaxed text-ink-muted">
              {analystAnalysis.buyer_types.map((b, i) => (
                <li key={i}>
                  <span className="font-medium text-ink">{b.category}</span> — {b.rationale}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Bull / Base / Bear Case">
            <Badge tone="deal" className="mb-2">AI Analysis</Badge>
            <p className="mb-2 text-sm leading-relaxed text-ink-muted">
              <span className="font-medium text-positive">Bull —</span> {analystAnalysis.bull_case}
            </p>
            <p className="text-sm leading-relaxed text-ink-muted">
              <span className="font-medium text-negative">Bear —</span> {analystAnalysis.bear_case}
            </p>
          </Section>

          <Section title="Conclusion">
            <Badge tone="deal" className="mb-2">AI Analysis</Badge>
            <p className="text-sm leading-relaxed text-ink-muted">{analystAnalysis.conclusion}</p>
          </Section>

          <p className="pt-4 text-2xs leading-relaxed text-ink-faint">
            This memo is generated by DealLab, an analytical and educational
            platform. It does not constitute investment advice. Figures are
            based on {company.source === "DEMO DATA" ? "illustrative demo data" : "the connected data provider"}.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function buildMarkdownMemo(
  bundle: CompanyBundle,
  dcf: ReturnType<typeof getDefaultDCF>
): string {
  const { company, analystAnalysis } = bundle;
  const { financials, balanceSheet, valuation } = getLatest(bundle);
  const currency = company.currency === "EUR" ? "€" : "$";

  return `# ${company.name} (${company.ticker})
## Investment Memo — generated by DealLab

### Executive Summary
${analystAnalysis.summary}

### Company Overview
${company.description}

### Historical Financial Performance
- Revenue (FY${financials.year}): ${formatCurrencyM(financials.revenue, currency)}
- Revenue Growth: ${formatPercent(financials.revenueGrowth ?? 0)}
- EBITDA Margin: ${formatPercent(financials.ebitdaMargin)}
- Net Debt / EBITDA: ${formatMultiple(balanceSheet.netDebt / financials.ebitda)}

### Valuation
- Current Share Price: ${formatPrice(company.sharePrice, currency)}
- DCF Implied Share Price: ${formatPrice(dcf.impliedSharePrice, currency)}
- DCF Upside / Downside: ${formatSignedPercent(dcf.upsideDownside)}
- Current EV / EBITDA: ${formatMultiple(valuation.evEbitda)}

### M&A Rationale
${analystAnalysis.ma_rationale.map((r) => `- ${r}`).join("\n")}

### Investment Highlights
${analystAnalysis.investment_highlights.map((h) => `- ${h}`).join("\n")}

### Key Risks
${analystAnalysis.risks.map((r) => `- **${r.label}** (${r.level}) — ${r.note}`).join("\n")}

### Potential Buyers
${analystAnalysis.buyer_types.map((b) => `- **${b.category}** — ${b.rationale}`).join("\n")}

### Bull / Base / Bear Case
- **Bull** — ${analystAnalysis.bull_case}
- **Bear** — ${analystAnalysis.bear_case}

### Conclusion
${analystAnalysis.conclusion}

---
DealLab is an analytical and educational platform. This memo does not constitute investment advice. Figures are based on ${company.source === "DEMO DATA" ? "illustrative demo data" : "the connected data provider"}.
`;
}
