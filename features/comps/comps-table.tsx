"use client";

import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import type { CompanyBundle, PeerCompany } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  formatCurrencyM,
  formatMultiple,
  formatPercent,
  formatPrice,
} from "@/lib/calculations/formatters";
import { summaryStats } from "@/lib/calculations/percentiles";
import { impliedValuationFromComps } from "@/lib/calculations/multiples";
import { getLatest } from "@/lib/calculations/bundle-derived";

const emptyDraft = {
  name: "",
  ticker: "",
  evRevenue: "",
  evEbitda: "",
  pe: "",
};

export function CompsTable({ bundle }: { bundle: CompanyBundle }) {
  const [peers, setPeers] = useState<PeerCompany[]>(bundle.peers);
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);

  const currency = bundle.company.currency === "EUR" ? "€" : "$";
  const { financials, balanceSheet } = getLatest(bundle);

  const statsEvEbitda = useMemo(
    () => summaryStats(peers.map((p) => p.evEbitda)),
    [peers]
  );
  const statsEvRevenue = useMemo(
    () => summaryStats(peers.map((p) => p.evRevenue)),
    [peers]
  );
  const statsPe = useMemo(() => summaryStats(peers.map((p) => p.pe)), [peers]);

  const impliedFromEbitda = useMemo(
    () =>
      impliedValuationFromComps(
        "evEbitda",
        peers,
        financials.ebitda,
        balanceSheet.netDebt,
        bundle.company.dilutedSharesOutstanding
      ),
    [peers, financials.ebitda, balanceSheet.netDebt, bundle.company.dilutedSharesOutstanding]
  );

  function removePeer(id: string) {
    setPeers((prev) => prev.filter((p) => p.id !== id));
  }

  function addPeer() {
    if (!draft.name.trim()) return;
    const newPeer: PeerCompany = {
      id: `manual-${Date.now()}`,
      ticker: draft.ticker.trim() || "N/A",
      name: draft.name.trim(),
      marketCap: NaN,
      enterpriseValue: NaN,
      revenue: NaN,
      ebitda: NaN,
      ebitdaMargin: NaN,
      revenueGrowth: NaN,
      evRevenue: draft.evRevenue ? Number(draft.evRevenue) : NaN,
      evEbitda: draft.evEbitda ? Number(draft.evEbitda) : NaN,
      pe: draft.pe ? Number(draft.pe) : NaN,
      source: "DEMO DATA",
    };
    setPeers((prev) => [...prev, newPeer]);
    setDraft(emptyDraft);
    setShowAdd(false);
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-x-auto">
        <CardHeader>
          <CardTitle>Comparable Companies</CardTitle>
          <Button size="sm" variant="secondary" onClick={() => setShowAdd((s) => !s)}>
            <Plus size={13} /> Add peer
          </Button>
        </CardHeader>

        {showAdd && (
          <div className="grid grid-cols-2 gap-3 border-b border-line bg-surface-sunken px-5 py-4 sm:grid-cols-6">
            <input
              placeholder="Company name"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className="col-span-2 rounded border border-line bg-surface px-2 py-1.5 text-xs focus:border-deal focus:outline-none"
            />
            <input
              placeholder="Ticker"
              value={draft.ticker}
              onChange={(e) => setDraft({ ...draft, ticker: e.target.value })}
              className="rounded border border-line bg-surface px-2 py-1.5 text-xs focus:border-deal focus:outline-none"
            />
            <input
              placeholder="EV/Rev"
              value={draft.evRevenue}
              onChange={(e) => setDraft({ ...draft, evRevenue: e.target.value })}
              className="rounded border border-line bg-surface px-2 py-1.5 text-xs focus:border-deal focus:outline-none"
            />
            <input
              placeholder="EV/EBITDA"
              value={draft.evEbitda}
              onChange={(e) => setDraft({ ...draft, evEbitda: e.target.value })}
              className="rounded border border-line bg-surface px-2 py-1.5 text-xs focus:border-deal focus:outline-none"
            />
            <div className="flex gap-2">
              <input
                placeholder="P/E"
                value={draft.pe}
                onChange={(e) => setDraft({ ...draft, pe: e.target.value })}
                className="w-full rounded border border-line bg-surface px-2 py-1.5 text-xs focus:border-deal focus:outline-none"
              />
              <Button size="sm" onClick={addPeer}>
                Add
              </Button>
            </div>
          </div>
        )}

        <CardContent className="p-0">
          <table className="w-full min-w-[820px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <Th>Company</Th>
                <Th align="right">Market Cap</Th>
                <Th align="right">EV</Th>
                <Th align="right">Revenue</Th>
                <Th align="right">EBITDA Margin</Th>
                <Th align="right">Rev Growth</Th>
                <Th align="right">EV/Revenue</Th>
                <Th align="right">EV/EBITDA</Th>
                <Th align="right">P/E</Th>
                <Th align="right"></Th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-line bg-deal-soft/40">
                <td className="px-4 py-2.5 font-medium text-ink">
                  {bundle.company.name}{" "}
                  <Badge tone="deal" className="ml-1">Target</Badge>
                </td>
                <td className="px-4 py-2.5 text-right font-mono tabular">
                  {formatCurrencyM(bundle.company.marketCap, currency)}
                </td>
                <td className="px-4 py-2.5 text-right font-mono tabular">
                  {formatCurrencyM(bundle.valuation[bundle.valuation.length - 1].enterpriseValue, currency)}
                </td>
                <td className="px-4 py-2.5 text-right font-mono tabular">
                  {formatCurrencyM(financials.revenue, currency)}
                </td>
                <td className="px-4 py-2.5 text-right font-mono tabular">
                  {formatPercent(financials.ebitdaMargin)}
                </td>
                <td className="px-4 py-2.5 text-right font-mono tabular">
                  {formatPercent(financials.revenueGrowth ?? 0)}
                </td>
                <td className="px-4 py-2.5 text-right font-mono tabular">
                  {formatMultiple(bundle.valuation[bundle.valuation.length - 1].evRevenue)}
                </td>
                <td className="px-4 py-2.5 text-right font-mono tabular">
                  {formatMultiple(bundle.valuation[bundle.valuation.length - 1].evEbitda)}
                </td>
                <td className="px-4 py-2.5 text-right font-mono tabular">
                  {formatMultiple(bundle.valuation[bundle.valuation.length - 1].pe)}
                </td>
                <td />
              </tr>
              {peers.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-b-0">
                  <td className="px-4 py-2.5 text-ink-muted">{p.name}</td>
                  <td className="px-4 py-2.5 text-right font-mono tabular text-ink-muted">
                    {Number.isFinite(p.marketCap) ? formatCurrencyM(p.marketCap, currency) : "N/A"}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular text-ink-muted">
                    {Number.isFinite(p.enterpriseValue) ? formatCurrencyM(p.enterpriseValue, currency) : "N/A"}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular text-ink-muted">
                    {Number.isFinite(p.revenue) ? formatCurrencyM(p.revenue, currency) : "N/A"}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular text-ink-muted">
                    {Number.isFinite(p.ebitdaMargin) ? formatPercent(p.ebitdaMargin) : "N/A"}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular text-ink-muted">
                    {Number.isFinite(p.revenueGrowth) ? formatPercent(p.revenueGrowth) : "N/A"}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular text-ink">
                    {formatMultiple(p.evRevenue)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular text-ink">
                    {formatMultiple(p.evEbitda)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular text-ink">
                    {formatMultiple(p.pe)}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      aria-label={`Remove ${p.name}`}
                      onClick={() => removePeer(p.id)}
                      className="text-ink-faint hover:text-negative transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="overflow-x-auto">
        <CardHeader>
          <CardTitle>Peer Statistics</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <Th>Metric</Th>
                <Th align="right">Min</Th>
                <Th align="right">P25</Th>
                <Th align="right">Median</Th>
                <Th align="right">Mean</Th>
                <Th align="right">P75</Th>
                <Th align="right">Max</Th>
              </tr>
            </thead>
            <tbody>
              <StatsRow label="EV / Revenue" stats={statsEvRevenue} />
              <StatsRow label="EV / EBITDA" stats={statsEvEbitda} />
              <StatsRow label="P / E" stats={statsPe} />
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Implied Valuation from Comps (EV/EBITDA)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {(["low", "median", "high"] as const).map((k) => (
              <div key={k} className="rounded-md border border-line p-4">
                <div className="text-2xs uppercase tracking-[0.05em] text-ink-faint">
                  {k === "low" ? "25th Percentile" : k === "median" ? "Median" : "75th Percentile"}
                </div>
                <div className="mt-1 font-mono text-xs text-ink-faint">
                  {formatMultiple(impliedFromEbitda[k].multiple)} × {formatCurrencyM(financials.ebitda, currency)} EBITDA
                </div>
                <div className="mt-2 font-mono text-xl tabular text-ink">
                  {formatPrice(impliedFromEbitda[k].impliedSharePrice, currency)}{" "}
                  <span className="text-sm text-ink-faint">/ share</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Th({
  children,
  align = "left",
}: {
  children?: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-4 py-2.5 text-2xs font-medium uppercase tracking-[0.05em] text-ink-faint ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function StatsRow({
  label,
  stats,
}: {
  label: string;
  stats: ReturnType<typeof summaryStats>;
}) {
  return (
    <tr className="border-b border-line last:border-b-0">
      <td className="px-4 py-2.5 text-ink-muted">{label}</td>
      <td className="px-4 py-2.5 text-right font-mono tabular">{formatMultiple(stats.min)}</td>
      <td className="px-4 py-2.5 text-right font-mono tabular">{formatMultiple(stats.p25)}</td>
      <td className="px-4 py-2.5 text-right font-mono tabular font-semibold">{formatMultiple(stats.median)}</td>
      <td className="px-4 py-2.5 text-right font-mono tabular">{formatMultiple(stats.mean)}</td>
      <td className="px-4 py-2.5 text-right font-mono tabular">{formatMultiple(stats.p75)}</td>
      <td className="px-4 py-2.5 text-right font-mono tabular">{formatMultiple(stats.max)}</td>
    </tr>
  );
}
