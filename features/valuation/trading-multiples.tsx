import type { CompanyBundle } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMultiple, formatPercent } from "@/lib/calculations/formatters";
import { mean } from "@/lib/calculations/percentiles";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { GLOSSARY } from "@/lib/finance-glossary";

export function TradingMultiples({ bundle }: { bundle: CompanyBundle }) {
  const latest = bundle.valuation[bundle.valuation.length - 1];
  const historicalAvgEvEbitda = mean(bundle.valuation.map((v) => v.evEbitda));
  const historicalAvgEvRevenue = mean(bundle.valuation.map((v) => v.evRevenue));
  const historicalAvgPe = mean(bundle.valuation.map((v) => v.pe));

  const peerMedian = (key: "evEbitda" | "evRevenue" | "pe") => {
    const vals = [...bundle.peers.map((p) => p[key])].sort((a, b) => a - b);
    return vals[Math.floor(vals.length / 2)];
  };

  const rows = [
    {
      label: "EV / Revenue",
      glossary: "EV / Revenue" as const,
      current: latest.evRevenue,
      historical: historicalAvgEvRevenue,
      peer: peerMedian("evRevenue"),
      fmt: formatMultiple,
    },
    {
      label: "EV / EBITDA",
      glossary: "EV / EBITDA" as const,
      current: latest.evEbitda,
      historical: historicalAvgEvEbitda,
      peer: peerMedian("evEbitda"),
      fmt: formatMultiple,
    },
    {
      label: "EV / EBIT",
      glossary: undefined,
      current: latest.evEbit,
      historical: mean(bundle.valuation.map((v) => v.evEbit)),
      peer: NaN,
      fmt: formatMultiple,
    },
    {
      label: "P / E",
      glossary: "P/E" as const,
      current: latest.pe,
      historical: historicalAvgPe,
      peer: peerMedian("pe"),
      fmt: formatMultiple,
    },
    {
      label: "FCF Yield",
      glossary: "FCF Yield" as const,
      current: latest.fcfYield,
      historical: mean(bundle.valuation.map((v) => v.fcfYield)),
      peer: NaN,
      fmt: formatPercent,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trading Multiples</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="px-5 py-2.5 text-2xs font-medium uppercase tracking-[0.05em] text-ink-faint">
                Metric
              </th>
              <th className="px-5 py-2.5 text-right text-2xs font-medium uppercase tracking-[0.05em] text-ink-faint">
                Current
              </th>
              <th className="px-5 py-2.5 text-right text-2xs font-medium uppercase tracking-[0.05em] text-ink-faint">
                5Y Average
              </th>
              <th className="px-5 py-2.5 text-right text-2xs font-medium uppercase tracking-[0.05em] text-ink-faint">
                Peer Median
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-b border-line last:border-b-0">
                <td className="px-5 py-2.5 text-ink-muted">
                  <span className="inline-flex items-center gap-1.5">
                    {r.label}
                    {r.glossary && (
                      <InfoTooltip term={r.glossary} explanation={GLOSSARY[r.glossary]} />
                    )}
                  </span>
                </td>
                <td className="px-5 py-2.5 text-right font-mono tabular text-ink">
                  {r.fmt(r.current)}
                </td>
                <td className="px-5 py-2.5 text-right font-mono tabular text-ink-muted">
                  {r.fmt(r.historical)}
                </td>
                <td className="px-5 py-2.5 text-right font-mono tabular text-ink-muted">
                  {Number.isFinite(r.peer) ? r.fmt(r.peer) : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
