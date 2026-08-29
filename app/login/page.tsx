import Link from "next/link";
import { signInAction } from "@/app/auth/actions";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 inline-block font-display text-lg font-semibold tracking-tight text-ink hover:text-deal-strong transition-colors"
        >
          DealLab
        </Link>

        <h1 className="font-display text-2xl font-medium tracking-tight">
          Sign in
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Welcome back — enter your details below.
        </p>

        {searchParams.error && (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {searchParams.error}
          </p>
        )}

        <form action={signInAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-medium text-ink-muted">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:border-deal focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-xs font-medium text-ink-muted">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:border-deal focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-deal-strong"
          >
            Sign in
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-deal-strong hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
