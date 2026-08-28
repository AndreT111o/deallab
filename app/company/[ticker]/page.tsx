import Link from "next/link";
import { getFinancialDataProvider } from "@/services";
import { CompanyDashboard } from "@/components/company/company-dashboard";

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
          This ticker isn&apos;t wired to a data source yet in the MVP.
          Ferrari (RACE) is the fully built demo — every module, real
          calculations, no fabricated numbers.
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
