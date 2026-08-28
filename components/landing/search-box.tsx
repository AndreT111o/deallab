"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  { label: "Ferrari", ticker: "RACE", live: true },
  { label: "Spotify", ticker: "SPOT", live: false },
  { label: "LVMH", ticker: "MC.PA", live: false },
  { label: "Ryanair", ticker: "RYAAY", live: false },
  { label: "Moncler", ticker: "MONC.MI", live: false },
];

export function SearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  function go(ticker: string, live: boolean) {
    if (!live) {
      setNotice(
        `${ticker} isn't wired to live data yet in this MVP — try Ferrari (RACE), the fully built demo.`
      );
      return;
    }
    setNotice(null);
    router.push(`/company/${ticker}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim().toUpperCase();
    if (!trimmed) return;
    go(trimmed === "RACE" || trimmed === "FERRARI" ? "RACE" : trimmed, trimmed === "RACE" || trimmed === "FERRARI");
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
            onClick={() => go(s.ticker, s.live)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs transition-colors",
              s.live
                ? "border-deal/30 bg-deal-soft text-deal-strong hover:bg-deal-soft/70"
                : "border-line text-ink-muted hover:border-line-strong"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {notice && (
        <p className="mt-3 text-xs text-ink-muted">{notice}</p>
      )}
    </div>
  );
}
