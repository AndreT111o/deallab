import Link from "next/link";
import { LineChart, Calculator, ShieldCheck, FileText } from "lucide-react";
import { SearchBox } from "@/components/landing/search-box";
import { TickerStrip } from "@/components/landing/ticker-strip";
import { AuthStatus } from "@/components/auth/account-menu";
import { createClient } from "@/lib/supabase/server";

const STEPS = [
  {
    n: "01",
    icon: LineChart,
    title: "Analyze",
    body: "Understand the business and its historical financial performance.",
  },
  {
    n: "02",
    icon: Calculator,
    title: "Value",
    body: "Build DCF and comparable-company valuations with editable assumptions.",
  },
  {
    n: "03",
    icon: ShieldCheck,
    title: "Evaluate",
    body: "Assess the company from an M&A perspective — fit, risk, and rationale.",
  },
  {
    n: "04",
    icon: FileText,
    title: "Present",
    body: "Generate an investment-grade analysis and memo in minutes.",
  },
];

async function WatchlistSection() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: items } = await supabase
    .from("watchlist")
    .select("ticker, company_name")
    .eq("user_id", user.id)
    .order("added_at", { ascending: false });

  if (!items || items.length === 0) return null;

  return (
    <div className="mt-8">
      <p className="mb-3 text-2xs uppercase tracking-[0.08em] text-ink-faint">
        Your Watchlist
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Link
            key={item.ticker}
            href={`/company/${item.ticker}`}
            className="rounded-full border border-line-strong bg-surface px-3 py-1.5 text-sm text-ink transition-colors hover:border-deal hover:text-deal-strong"
          >
            {item.company_name}{" "}
            <span className="font-mono text-2xs text-ink-faint">{item.ticker}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default async function LandingPage() {
  return (
    <main className="min-h-screen bg-paper">
      <TickerStrip />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="font-display text-lg font-semibold tracking-tight">
          DealLab
        </span>
        <nav className="flex items-center gap-6 text-sm text-ink-muted">
          <Link href="/company/RACE" className="hover:text-ink transition-colors">
            Demo
          </Link>
          <span className="hidden text-2xs text-ink-faint sm:inline">
            Analytical & educational platform
          </span>
          <AuthStatus />
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-10 sm:pt-16">
        <p className="mb-5 text-2xs font-semibold uppercase tracking-[0.14em] text-deal">
          AI M&amp;A Analyst
        </p>
        <h1 className="max-w-3xl text-balance font-display text-[2.75rem] font-medium leading-[1.05] tracking-tight sm:text-[3.75rem]">
          Your AI{" "}
          <span className="italic text-deal-strong">M&amp;A Analyst.</span>
        </h1>
        <p className="mt-6 max-w-xl text-balance text-lg leading-relaxed text-ink-muted">
          Analyze companies, build valuations, and evaluate transactions in
          minutes — with the rigor of an investment-banking model, not a
          retail stock app.
        </p>

        <div className="mt-9">
          <SearchBox />
        </div>

        <WatchlistSection />
      </section>

      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <div key={step.n}>
                <div className="mb-4 flex items-center gap-3">
                  <span className="font-mono text-2xs text-ink-faint">
                    {step.n}
                  </span>
                  <step.icon size={16} className="text-deal-strong" strokeWidth={1.75} />
                </div>
                <h3 className="mb-1.5 font-display text-lg font-medium">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-ink-muted">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-lg border border-line bg-surface p-6">
            <p className="font-mono text-2xs text-ink-faint">01 / DCF</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Fully interactive discounted cash flow model with a live
              WACC × terminal-growth sensitivity matrix.
            </p>
          </div>
          <div className="rounded-lg border border-line bg-surface p-6">
            <p className="font-mono text-2xs text-ink-faint">02 / Comps</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Peer trading multiples with percentile statistics and
              comps-implied valuation ranges.
            </p>
          </div>
          <div className="rounded-lg border border-line bg-surface p-6">
            <p className="font-mono text-2xs text-ink-faint">03 / M&amp;A</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              A transparent, component-level M&amp;A attractiveness score —
              an analytical framework, never a prediction.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <p className="max-w-2xl text-2xs leading-relaxed text-ink-faint">
            DealLab is an analytical and educational platform. Information
            generated by the platform does not constitute investment advice.
            Company data shown in this MVP is clearly labeled DEMO DATA and
            is illustrative only.
          </p>
        </div>
      </footer>
    </main>
  );
}
