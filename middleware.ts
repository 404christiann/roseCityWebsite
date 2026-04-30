import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser();

  const isAdminRoute    = request.nextUrl.pathname.startsWith("/admin");
  const isLoginPage     = request.nextUrl.pathname === "/admin/login";
  const isCallbackRoute = request.nextUrl.pathname === "/admin/auth/callback";

  // Allowlist — only these emails can access the admin panel
  const ALLOWED_EMAILS = ["christianjavieralcala@gmail.com", "info@rosecityfutbolclub.com", "calcala1@berkeley.edu"];
  const isAllowed = user && ALLOWED_EMAILS.includes(user.email ?? "");

  // Not logged in and trying to access admin → redirect to login
  if (isAdminRoute && !isLoginPage && !isCallbackRoute && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }

  // Logged in but not on the allowlist → sign out and redirect to login
  if (isAdminRoute && !isLoginPage && user && !isAllowed) {
    await supabase.auth.signOut();
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }

  // Already logged in and hitting login page → redirect to dashboard
  if (isLoginPage && isAllowed) {
    const dashUrl = request.nextUrl.clone();
    dashUrl.pathname = "/admin";
    return NextResponse.redirect(dashUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*"],
};
