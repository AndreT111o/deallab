import Link from "next/link";
import type { Company } from "@/types";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyM, formatPrice } from "@/lib/calculations/formatters";

export function CompanyHeader({ company }: { company: Company }) {
  return (
    <div className="border-b border-line bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-5">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/"
            className="font-display text-base font-semibold tracking-tight text-ink hover:text-deal-strong transition-colors"
          >
            DealLab
          </Link>
          {company.source === "DEMO DATA" && (
            <Badge tone="amber">Demo Data</Badge>
          )}
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2.5">
              <h1 className="font-display text-2xl font-medium tracking-tight">
                {company.name}
              </h1>
              <span className="font-mono text-sm text-ink-faint">
                {company.ticker}
              </span>
            </div>
            <p className="mt-1 text-sm text-ink-muted">
              {company.industry} · {company.country}
            </p>
          </div>

          <div className="flex gap-6 text-right">
            <div>
              <div className="text-2xs uppercase tracking-[0.06em] text-ink-faint">
                Share Price
              </div>
              <div className="font-mono text-lg tabular">
                {formatPrice(company.sharePrice, company.currency === "EUR" ? "€" : "$")}
              </div>
            </div>
            <div>
              <div className="text-2xs uppercase tracking-[0.06em] text-ink-faint">
                Market Cap
              </div>
              <div className="font-mono text-lg tabular">
                {formatCurrencyM(company.marketCap, company.currency === "EUR" ? "€" : "$")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
