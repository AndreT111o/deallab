"use client";

import type { DCFAssumptions, DCFResult } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { GLOSSARY } from "@/lib/finance-glossary";
import {
  formatCurrencyM,
  formatPercent,
  formatPrice,
  formatSignedPercent,
} from "@/lib/calculations/formatters";

function pct(v: number) {
  return Math.round(v * 1000) / 10; // one decimal, as a percent number e.g. 8.0
}

function AssumptionRow({
  label,
  values,
  onChange,
  step = 0.1,
}: {
  label: string;
  values: number[]; // decimals
  onChange: (index: number, decimalValue: number) => void;
  step?: number;
}) {
  return (
    <tr className="border-b border-line last:border-b-0">
      <td className="px-4 py-2 text-xs text-ink-muted">{label}</td>
      {values.map((v, i) => (
        <td key={i} className="px-2 py-1.5">
          <div className="flex items-center justify-end gap-0.5">
            <input
              type="number"
              step={step}
              value={pct(v)}
              onChange={(e) => onChange(i, Number(e.target.value) / 100)}
              className="w-16 rounded border border-line bg-surface px-1.5 py-1 text-right font-mono text-xs tabular text-ink focus:border-deal focus:outline-none"
            />
            <span className="text-2xs text-ink-faint">%</span>
          </div>
        </td>
      ))}
    </tr>
  );
}

export function DCFPanel({
  assumptions,
  setAssumptions,
  result,
  currency,
}: {
  assumptions: DCFAssumptions;
  setAssumptions: (a: DCFAssumptions) => void;
  result: DCFResult;
  currency: string;
}) {
  function updateArray(
    key: keyof Pick<
      DCFAssumptions,
      "revenueGrowth" | "ebitdaMargin" | "daPctRevenue" | "capexPctRevenue" | "nwcPctRevenue"
    >,
    index: number,
    value: number
  ) {
    const next = [...assumptions[key]];
    next[index] = value;
    setAssumptions({ ...assumptions, [key]: next });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>DCF Model — Editable Assumptions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse">
            <thead>
              <tr className="border-b border-line">
                <th className="px-4 py-2 text-left text-2xs font-medium uppercase tracking-[0.05em] text-ink-faint">
                  Assumption
                </th>
                {assumptions.years.map((y) => (
                  <th
                    key={y}
                    className="px-2 py-2 text-right font-mono text-2xs font-medium text-ink-faint"
                  >
                    {y}E
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AssumptionRow
                label="Revenue Growth"
                values={assumptions.revenueGrowth}
                onChange={(i, v) => updateArray("revenueGrowth", i, v)}
              />
              <AssumptionRow
                label="EBITDA Margin"
                values={assumptions.ebitdaMargin}
                onChange={(i, v) => updateArray("ebitdaMargin", i, v)}
              />
              <AssumptionRow
                label="D&A (% Revenue)"
                values={assumptions.daPctRevenue}
                onChange={(i, v) => updateArray("daPctRevenue", i, v)}
              />
              <AssumptionRow
                label="Capex (% Revenue)"
                values={assumptions.capexPctRevenue}
                onChange={(i, v) => updateArray("capexPctRevenue", i, v)}
              />
              <AssumptionRow
                label="Δ NWC (% Revenue)"
                values={assumptions.nwcPctRevenue}
                onChange={(i, v) => updateArray("nwcPctRevenue", i, v)}
              />
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-line pt-5 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 flex items-center gap-1 text-2xs uppercase tracking-[0.05em] text-ink-faint">
              Tax Rate
            </span>
            <div className="flex items-center gap-1 rounded border border-line bg-surface px-2 py-1.5">
              <input
                type="number"
                step={0.5}
                value={pct(assumptions.taxRate)}
                onChange={(e) =>
                  setAssumptions({ ...assumptions, taxRate: Number(e.target.value) / 100 })
                }
                className="w-full bg-transparent font-mono text-sm tabular text-ink focus:outline-none"
              />
              <span className="text-xs text-ink-faint">%</span>
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center gap-1 text-2xs uppercase tracking-[0.05em] text-ink-faint">
              WACC <InfoTooltip term="WACC" explanation={GLOSSARY.WACC} />
            </span>
            <div className="flex items-center gap-1 rounded border border-line bg-surface px-2 py-1.5">
              <input
                type="number"
                step={0.1}
                value={pct(assumptions.wacc)}
                onChange={(e) =>
                  setAssumptions({ ...assumptions, wacc: Number(e.target.value) / 100 })
                }
                className="w-full bg-transparent font-mono text-sm tabular text-ink focus:outline-none"
              />
              <span className="text-xs text-ink-faint">%</span>
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center gap-1 text-2xs uppercase tracking-[0.05em] text-ink-faint">
              Terminal Growth{" "}
              <InfoTooltip term="Terminal Value" explanation={GLOSSARY["Terminal Value"]} />
            </span>
            <div className="flex items-center gap-1 rounded border border-line bg-surface px-2 py-1.5">
              <input
                type="number"
                step={0.1}
                value={pct(assumptions.terminalGrowth)}
                onChange={(e) =>
                  setAssumptions({
                    ...assumptions,
                    terminalGrowth: Number(e.target.value) / 100,
                  })
                }
                className="w-full bg-transparent font-mono text-sm tabular text-ink focus:outline-none"
              />
              <span className="text-xs text-ink-faint">%</span>
            </div>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-4">
          <SummaryCell label="Sum PV of FCF" value={formatCurrencyM(result.sumOfPvFcf, currency)} />
          <SummaryCell label="PV of Terminal Value" value={formatCurrencyM(result.pvTerminalValue, currency)} />
          <SummaryCell
            label="Enterprise Value"
            value={formatCurrencyM(result.enterpriseValue, currency)}
            glossary="Enterprise Value"
          />
          <SummaryCell
            label="Equity Value"
            value={formatCurrencyM(result.equityValue, currency)}
            glossary="Equity Value"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 rounded-md border border-line bg-surface-sunken p-5 sm:grid-cols-3">
          <div>
            <div className="text-2xs uppercase tracking-[0.05em] text-ink-faint">Current Share Price</div>
            <div className="mt-1 font-mono text-2xl tabular">{formatPrice(result.currentSharePrice, currency)}</div>
          </div>
          <div>
            <div className="text-2xs uppercase tracking-[0.05em] text-ink-faint">DCF Implied Price</div>
            <div className="mt-1 font-mono text-2xl tabular text-deal-strong">
              {formatPrice(result.impliedSharePrice, currency)}
            </div>
          </div>
          <div>
            <div className="text-2xs uppercase tracking-[0.05em] text-ink-faint">Upside / Downside</div>
            <div
              className={`mt-1 font-mono text-2xl tabular ${
                result.upsideDownside >= 0 ? "text-positive" : "text-negative"
              }`}
            >
              {formatSignedPercent(result.upsideDownside)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryCell({
  label,
  value,
  glossary,
}: {
  label: string;
  value: string;
  glossary?: keyof typeof GLOSSARY;
}) {
  return (
    <div className="bg-surface px-4 py-3">
      <div className="mb-1 flex items-center gap-1 text-2xs uppercase tracking-[0.05em] text-ink-faint">
        {label}
        {glossary && <InfoTooltip term={glossary} explanation={GLOSSARY[glossary]} />}
      </div>
      <div className="font-mono text-sm tabular text-ink">{value}</div>
    </div>
  );
}
