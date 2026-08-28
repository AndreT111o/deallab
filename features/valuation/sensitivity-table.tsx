import type { DCFAssumptions } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildSensitivityMatrix, defaultSensitivityRanges } from "@/lib/calculations/sensitivity";
import { formatPrice } from "@/lib/calculations/formatters";
import { cn } from "@/lib/utils";

export function SensitivityTable({
  assumptions,
  netDebt,
  dilutedShares,
  currentSharePrice,
  currency,
}: {
  assumptions: DCFAssumptions;
  netDebt: number;
  dilutedShares: number;
  currentSharePrice: number;
  currency: string;
}) {
  const { waccRange, terminalGrowthRange } = defaultSensitivityRanges(
    assumptions.wacc,
    assumptions.terminalGrowth
  );
  const matrix = buildSensitivityMatrix(
    assumptions,
    netDebt,
    dilutedShares,
    currentSharePrice,
    waccRange,
    terminalGrowthRange
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sensitivity — Implied Share Price</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="px-3 py-2 text-2xs font-medium uppercase tracking-[0.05em] text-ink-faint">
                WACC \ g
              </th>
              {terminalGrowthRange.map((g) => (
                <th
                  key={g}
                  className={cn(
                    "px-3 py-2 text-right font-mono text-2xs font-medium text-ink-faint",
                    g === assumptions.terminalGrowth && "text-deal-strong"
                  )}
                >
                  {(g * 100).toFixed(1)}%
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => {
              const wacc = waccRange[i];
              return (
                <tr key={wacc} className="border-t border-line">
                  <td
                    className={cn(
                      "px-3 py-2 font-mono text-xs font-medium text-ink-faint",
                      wacc === assumptions.wacc && "text-deal-strong"
                    )}
                  >
                    {(wacc * 100).toFixed(1)}%
                  </td>
                  {row.map((cell, j) => {
                    const isBase =
                      wacc === assumptions.wacc &&
                      terminalGrowthRange[j] === assumptions.terminalGrowth;
                    return (
                      <td
                        key={j}
                        className={cn(
                          "px-3 py-2 text-right font-mono tabular text-xs",
                          isBase
                            ? "bg-deal-soft font-semibold text-deal-strong"
                            : "text-ink"
                        )}
                      >
                        {Number.isFinite(cell.impliedSharePrice)
                          ? formatPrice(cell.impliedSharePrice, currency)
                          : "N/A"}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="mt-3 text-2xs text-ink-faint">
          Highlighted cell reflects the current base-case WACC and terminal
          growth assumptions above.
        </p>
      </CardContent>
    </Card>
  );
}
