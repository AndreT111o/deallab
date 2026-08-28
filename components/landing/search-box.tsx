"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// These are just quick-start suggestions now — every ticker is attempted
// against the live provider (FMP) when configured, or falls back to the
// Ferrari demo bundle / a "Coming soon" page otherwise. See
// app/company/[ticker]/page.tsx for that fallback logic.
//
// FMP's free tier only covers US-exchange-listed companies, so the
// suggestions below are deliberately all US names — European/foreign
// tickers (Spotify, LVMH, Ryanair, Moncler...) return a 402 on free plan
// and would always dead-end into "Coming soon". Revisit this list if the
// FMP plan is upgraded (see roadmap notes on data provider tiers).
const SUGGESTIONS = [
  { label: "Ferrari", ticker: "RACE" },
  { label: "Apple", ticker: "AAPL" },
  { label: "Microsoft", ticker: "MSFT" },
  { label: "Tesla", ticker:"TSLA" },
  { label: "Nike", ticker: "NKE" },
];

export function SearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function go(ticker: string) {
    router.push(`/company/${ticker.toUpperCase()}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim().toUpperCase();
    if (!trimmed) return;
    go(trimmed === "FERRARI" ? "RACE" : trimmed);
  }

  return (
    <div className="w-full max-w-xl">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 rounded-md border border-line-strong bg-surface px-4 py-3 shadow-card transition-colors focus-within:border-deal"
      >
        <span className="font-mono text-xs text-ink-faint">$</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter company or ticker..."
          className="flex-1 bg-transparent font-mono text-sm text-ink placeholder:text-ink-faint focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Analyze company"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-ink text-paper transition-colors hover:bg-deal-strong"
        >
          <ArrowRight size={15} />
        </button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-2xs uppercase tracking-[0.08em] text-ink-faint">
          Try
        </span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s.ticker}
            onClick={() => go(s.ticker)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs transition-colors",
              "border-deal/30 bg-deal-soft text-deal-strong hover:bg-deal-soft/70"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
