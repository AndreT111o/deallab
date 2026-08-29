import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session on every request (App Router Server
 * Components can't set cookies themselves — see the comment in
 * lib/supabase/server.ts — so this middleware is what actually keeps the
 * session cookie alive/refreshed across navigations).
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
        ) {
          cookiesToSet.forEach(({ name, value }: { name: string; value: string }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(
            ({ name, value, options }: { name: string; value: string; options: CookieOptions }) =>
              response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Required: this call refreshes the token if needed. Without it, calling
  // getUser() elsewhere may randomly see an expired session.
  await supabase.auth.getUser();

  return response;
}
