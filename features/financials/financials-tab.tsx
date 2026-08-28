"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CompanyBundle } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  formatCurrencyM,
  formatMultiple,
  formatPercent,
} from "@/lib/calculations/formatters";
import { runDCF } from "@/lib/calculations/dcf";
import { getLatest } from "@/lib/calculations/bundle-derived";

const CHART_GREEN = "#0E5E45";
const GRID = "#E4E2DA";
const AXIS = "#93968F";

export function FinancialsTab({ bundle }: { bundle: CompanyBundle }) {
  const [view, setView] = useState<"historical" | "forecast">("historical");
  const currency = bundle.company.currency === "EUR" ? "€" : "$";
  const { balanceSheet: latestBs } = getLatest(bundle);

  const dcf = useMemo(
    () =>
      runDCF(
        bundle.dcfDefaults,
        latestBs.netDebt,
        bundle.company.dilutedSharesOutstanding,
        bundle.company.sharePrice
      ),
    [bundle, latestBs]
  );

  const chartData = useMemo(() => {
    if (view === "historical") {
      return bundle.financials.map((f) => ({
        year: f.year,
        revenue: f.revenue,
        ebitda: f.ebitda,
        margin: f.ebitdaMargin * 100,
        fcf: f.freeCashFlow,
      }));
    }
    return dcf.years.map((y) => ({
      year: y.year,
      revenue: y.revenue,
      ebitda: y.ebitda,
      margin: (y.ebitda / y.revenue) * 100,
      fcf: y.unleveredFcf,
    }));
  }, [view, bundle.financials, dcf.years]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-medium">Financial Performance</h2>
        <div className="flex gap-1 rounded-md border border-line bg-surface p-0.5">
          <Button
            size="sm"
            variant={view === "historical" ? "primary" : "ghost"}
            onClick={() => setView("historical")}
          >
            Historical
          </Button>
          <Button
            size="sm"
            variant={view === "forecast" ? "primary" : "ghost"}
            onClick={() => setView("forecast")}
          >
            Forecast
          </Button>
        </div>
      </div>

      {view === "forecast" && (
        <p className="-mt-4 text-xs text-ink-faint">
          Forecast years are derived from the DCF module&apos;s default
          assumptions (Valuation tab) — deterministic, not AI-generated.
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="0" stroke={GRID} vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: AXIS }} axisLine={{ stroke: GRID }} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: AXIS }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${currency}${v}m`}
                  width={60}
                />
                <Tooltip
                  formatter={(v: number) => formatCurrencyM(v, currency)}
                  labelFormatter={(l) => `FY${l}`}
                  contentStyle={{ fontSize: 12, borderRadius: 4, border: `1px solid ${GRID}` }}
                />
                <Bar dataKey="revenue" fill={CHART_GREEN} radius={[3, 3, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>EBITDA</CardTitle>
          </CardHeader>
          <CardContent className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="0" stroke={GRID} vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: AXIS }} axisLine={{ stroke: GRID }} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: AXIS }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${currency}${v}m`}
                  width={60}
                />
                <Tooltip
                  formatter={(v: number) => formatCurrencyM(v, currency)}
                  labelFormatter={(l) => `FY${l}`}
                  contentStyle={{ fontSize: 12, borderRadius: 4, border: `1px solid ${GRID}` }}
                />
                <Bar dataKey="ebitda" fill="#15171B" radius={[3, 3, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>EBITDA Margin</CardTitle>
          </CardHeader>
          <CardContent className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="0" stroke={GRID} vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: AXIS }} axisLine={{ stroke: GRID }} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: AXIS }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v.toFixed(0)}%`}
                  width={44}
                  domain={["dataMin - 2", "dataMax + 2"]}
                />
                <Tooltip
                  formatter={(v: number) => `${v.toFixed(1)}%`}
                  labelFormatter={(l) => `FY${l}`}
                  contentStyle={{ fontSize: 12, borderRadius: 4, border: `1px solid ${GRID}` }}
                />
                <Line type="monotone" dataKey="margin" stroke={CHART_GREEN} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Free Cash Flow</CardTitle>
          </CardHeader>
          <CardContent className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="0" stroke={GRID} vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: AXIS }} axisLine={{ stroke: GRID }} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: AXIS }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${currency}${v}m`}
                  width={60}
                />
                <Tooltip
                  formatter={(v: number) => formatCurrencyM(v, currency)}
                  labelFormatter={(l) => `FY${l}`}
                  contentStyle={{ fontSize: 12, borderRadius: 4, border: `1px solid ${GRID}` }}
                />
                <Bar dataKey="fcf" fill="#96661C" radius={[3, 3, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-x-auto">
        <CardHeader>
          <CardTitle>
            {view === "historical" ? "Financial Statement — Historical" : "Financial Statement — Forecast (DCF-derived)"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {view === "historical" ? (
            <HistoricalTable bundle={bundle} currency={currency} />
          ) : (
            <ForecastTable dcf={dcf} currency={currency} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function HistoricalTable({
  bundle,
  currency,
}: {
  bundle: CompanyBundle;
  currency: string;
}) {
  const rows: { label: string; values: string[] }[] = [
    { label: "Revenue", values: bundle.financials.map((f) => formatCurrencyM(f.revenue, currency)) },
    { label: "Revenue Growth", values: bundle.financials.map((f) => (f.revenueGrowth === null ? "N/A" : formatPercent(f.revenueGrowth))) },
    { label: "EBITDA", values: bundle.financials.map((f) => formatCurrencyM(f.ebitda, currency)) },
    { label: "EBITDA Margin", values: bundle.financials.map((f) => formatPercent(f.ebitdaMargin)) },
    { label: "EBIT", values: bundle.financials.map((f) => formatCurrencyM(f.ebit, currency)) },
    { label: "EBIT Margin", values: bundle.financials.map((f) => formatPercent(f.ebitMargin)) },
    { label: "Net Income", values: bundle.financials.map((f) => formatCurrencyM(f.netIncome, currency)) },
    { label: "EPS", values: bundle.financials.map((f) => `${currency}${f.eps.toFixed(2)}`) },
    { label: "Free Cash Flow", values: bundle.financials.map((f) => formatCurrencyM(f.freeCashFlow, currency)) },
    { label: "Capex", values: bundle.financials.map((f) => formatCurrencyM(f.capex, currency)) },
    { label: "Cash", values: bundle.balanceSheet.map((b) => formatCurrencyM(b.cash, currency)) },
    { label: "Total Debt", values: bundle.balanceSheet.map((b) => formatCurrencyM(b.totalDebt, currency)) },
    { label: "Net Debt", values: bundle.balanceSheet.map((b) => formatCurrencyM(b.netDebt, currency)) },
    {
      label: "Net Debt / EBITDA",
      values: bundle.balanceSheet.map((b, i) =>
        formatMultiple(b.netDebt / bundle.financials[i].ebitda)
      ),
    },
  ];

  return (
    <table className="w-full min-w-[640px] border-collapse text-sm">
      <thead>
        <tr className="border-b border-line text-left">
          <th className="px-5 py-2.5 text-2xs font-medium uppercase tracking-[0.05em] text-ink-faint">
            €m unless noted
          </th>
          {bundle.financials.map((f) => (
            <th
              key={f.year}
              className="px-5 py-2.5 text-right font-mono text-2xs font-medium text-ink-faint"
            >
              FY{f.year}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label} className="border-b border-line last:border-b-0">
            <td className="px-5 py-2.5 text-ink-muted">{row.label}</td>
            {row.values.map((v, i) => (
              <td key={i} className="px-5 py-2.5 text-right font-mono tabular text-ink">
                {v}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ForecastTable({
  dcf,
  currency,
}: {
  dcf: ReturnType<typeof runDCF>;
  currency: string;
}) {
  const rows: { label: string; values: string[] }[] = [
    { label: "Revenue", values: dcf.years.map((y) => formatCurrencyM(y.revenue, currency)) },
    { label: "EBITDA", values: dcf.years.map((y) => formatCurrencyM(y.ebitda, currency)) },
    { label: "EBIT", values: dcf.years.map((y) => formatCurrencyM(y.ebit, currency)) },
    { label: "NOPAT", values: dcf.years.map((y) => formatCurrencyM(y.nopat, currency)) },
    { label: "D&A", values: dcf.years.map((y) => formatCurrencyM(y.da, currency)) },
    { label: "Capex", values: dcf.years.map((y) => formatCurrencyM(-y.capex, currency)) },
    { label: "Δ NWC", values: dcf.years.map((y) => formatCurrencyM(-y.changeInNwc, currency)) },
    { label: "Unlevered FCF", values: dcf.years.map((y) => formatCurrencyM(y.unleveredFcf, currency)) },
    { label: "Discount Factor", values: dcf.years.map((y) => y.discountFactor.toFixed(3)) },
    { label: "PV of FCF", values: dcf.years.map((y) => formatCurrencyM(y.presentValue, currency)) },
  ];

  return (
    <table className="w-full min-w-[640px] border-collapse text-sm">
      <thead>
        <tr className="border-b border-line text-left">
          <th className="px-5 py-2.5 text-2xs font-medium uppercase tracking-[0.05em] text-ink-faint">
            €m unless noted
          </th>
          {dcf.years.map((y) => (
            <th key={y.year} className="px-5 py-2.5 text-right font-mono text-2xs font-medium text-ink-faint">
              {y.year}E
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label} className="border-b border-line last:border-b-0">
            <td className="px-5 py-2.5 text-ink-muted">{row.label}</td>
            {row.values.map((v, i) => (
              <td key={i} className="px-5 py-2.5 text-right font-mono tabular text-ink">
                {v}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
