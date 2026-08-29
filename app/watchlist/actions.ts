"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addToWatchlistAction(formData: FormData) {
  const ticker = String(formData.get("ticker") ?? "").toUpperCase().trim();
  const companyName = String(formData.get("companyName") ?? "").trim();
  if (!ticker) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return; // Button shouldn't render for signed-out users anyway.

  await supabase.from("watchlist").insert({
    user_id: user.id,
    ticker,
    company_name: companyName || ticker,
  });

  revalidatePath(`/company/${ticker}`);
  revalidatePath("/");
}

export async function removeFromWatchlistAction(formData: FormData) {
  const ticker = String(formData.get("ticker") ?? "").toUpperCase().trim();
  if (!ticker) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("watchlist")
    .delete()
    .eq("user_id", user.id)
    .eq("ticker", ticker);

  revalidatePath(`/company/${ticker}`);
  revalidatePath("/");
}
