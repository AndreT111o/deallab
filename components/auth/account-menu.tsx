import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/auth/actions";

export async function AuthStatus() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <Link href="/login" className="text-ink-muted hover:text-ink transition-colors">
          Sign in
        </Link>
        <Link
          href="/signup"
          className="rounded-md bg-ink px-3 py-1.5 font-medium text-paper transition-colors hover:bg-deal-strong"
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="hidden text-2xs text-ink-faint sm:inline">{user.email}</span>
      <form action={signOutAction}>
        <button
          type="submit"
          className="text-ink-muted hover:text-ink transition-colors"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
