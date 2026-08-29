import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for use in Server Components, Server Actions, and Route
 * Handlers. Reads/writes the session via cookies, so the user's login state
 * is available on the server without a client-side round trip.
 *
 * Note: when called from a Server Component (not a Server Action or Route
 * Handler), writing cookies will throw and is caught silently below — this
 * is expected and harmless as long as middleware.ts is refreshing the
 * session on every request (it is, see middleware.ts).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — safe to ignore since
            // middleware.ts refreshes the session on every request.
          }
        },
      },
    }
  );
}
