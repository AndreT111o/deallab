import { createClient } from "@/lib/supabase/server";
import { addToWatchlistAction, removeFromWatchlistAction } from "@/app/watchlist/actions";

export async function WatchlistButton({
  ticker,
  companyName,
}: {
  ticker: string;
  companyName: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Signed-out visitors don't get a watchlist button at all — keeps the
  // header uncluttered rather than nudging them to sign in from here.
  if (!user) return null;

  const { data } = await supabase
    .from("watchlist")
    .select("id")
    .eq("user_id", user.id)
    .eq("ticker", ticker)
    .maybeSingle();

  const inWatchlist = !!data;

  if (inWatchlist) {
    return (
      <form action={removeFromWatchlistAction}>
        <input type="hidden" name="ticker" value={ticker} />
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-md border border-deal/30 bg-deal-soft px-3 py-1.5 text-sm font-medium text-deal-strong transition-colors hover:bg-deal-soft/70"
        >
          ★ In Watchlist
        </button>
      </form>
    );
  }

  return (
    <form action={addToWatchlistAction}>
      <input type="hidden" name="ticker" value={ticker} />
      <input type="hidden" name="companyName" value={companyName} />
      <button
        type="submit"
        className="flex items-center gap-1.5 rounded-md border border-line-strong px-3 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:border-deal hover:text-deal-strong"
      >
        ☆ Add to Watchlist
      </button>
    </form>
  );
}
