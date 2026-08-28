import Link from "next/link";
import { getFinancialDataProvider } from "@/services";
import { CompanyDashboard } from "@/components/company/company-dashboard";

// This page must always render fresh: it depends on live financial data
// and a live AI analysis. Without this, Next.js may treat it as a static
// route (no dynamic APIs are used) and cache the whole rendered page for
// up to 24h at the CDN edge — including a transient failure (e.g. an
// OpenAI quota error that has since been fixed). The individual fetch
// calls inside FMPFinancialDataProvider / generateAIAnalystOutput still
// use their own `next.revalidate` caching for cost control — this only
// disables the outer full-page cache.
export const dynamic = "force-dynamic";

export default async function CompanyPage({
  params,
}: {
  params: { ticker: string };
}) {
  const provider = getFinancialDataProvider();
  const bundle = await provider.getCompanyBundle(params.ticker);

  if (!bundle) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper px-6 text-center">
        <p className="font-mono text-2xs uppercase tracking-[0.1em] text-ink-faint">
          {params.ticker.toUpperCase()}
        </p>
        <h1 className="font-display text-2xl font-medium">Coming soon</h1>
        <p className="max-w-sm text-sm leading-relaxed text-ink-muted">
          This ticker isn&apos;t available yet — either it&apos;s not a
          recognized symbol, or it&apos;s on a non-US exchange, which our
          current (free-tier) data plan doesn&apos;t cover. US-listed
          companies like AAPL, MSFT, or TSLA work today; Ferrari (RACE) is
          the fully built demo either way.
        </p>
        <Link
          href="/company/RACE"
          className="mt-2 rounded bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-deal-strong transition-colors"
        >
          Open the Ferrari demo
        </Link>
        <Link href="/" className="text-2xs text-ink-faint hover:text-ink-muted">
          ← Back to DealLab
        </Link>
      </main>
    );
  }

  return <CompanyDashboard bundle={bundle} />;
}
