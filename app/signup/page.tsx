import Link from "next/link";
import { signUpAction } from "@/app/auth/actions";

export default function SignupPage({
  searchParams,
}: {
  searchParams: { error?: string; checkEmail?: string };
}) {
  if (searchParams.checkEmail) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper px-6">
        <div className="w-full max-w-sm text-center">
          <h1 className="font-display text-2xl font-medium tracking-tight">
            Check your email
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            We sent you a confirmation link. Click it to activate your
            account, then come back and sign in.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block text-sm font-medium text-deal-strong hover:underline"
          >
            ← Back to sign in
          </Link>
        </div>
      </main>
    );
  }

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
          Create an account
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Free — save your analyses as you go.
        </p>

        {searchParams.error && (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {searchParams.error}
          </p>
        )}

        <form action={signUpAction} className="mt-6 space-y-4">
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
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:border-deal focus:outline-none"
            />
            <p className="mt-1 text-2xs text-ink-faint">At least 8 characters.</p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-xs font-medium text-ink-muted"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              className="w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:border-deal focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-deal-strong"
          >
            Create account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-deal-strong hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
