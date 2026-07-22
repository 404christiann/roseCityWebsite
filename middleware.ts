import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSubscriptionMirrorRow } from "@/lib/subscription-mirror";
import { isAdminLocked, isPublicSiteLocked } from "@/lib/stripe-subscription-state";
import { createServiceRoleClient } from "@/lib/supabase-service-role";

const PUBLIC_LOCKABLE_PATHS = ["/", "/roster", "/schedule", "/shop"];

const PUBLIC_LOCKED_HTML = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Rose City FC</title></head>
<body>
<h1>Rose City FC</h1>
<p>Site temporarily unavailable — check back soon.</p>
</body>
</html>`;

export async function middleware(request: NextRequest) {
  const isPublicLockablePath = PUBLIC_LOCKABLE_PATHS.includes(request.nextUrl.pathname);

  if (isPublicLockablePath && process.env.FORCE_PUBLIC_SITE_ONLINE !== "true") {
    const serviceClient = createServiceRoleClient();
    const subscriptionRow = await getSubscriptionMirrorRow(serviceClient);

    if (isPublicSiteLocked(subscriptionRow)) {
      return new NextResponse(PUBLIC_LOCKED_HTML, {
        status: 503,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Retry-After": "86400",
          "X-Robots-Tag": "noindex",
        },
      });
    }

    return NextResponse.next({ request });
  }

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
  const ALLOWED_EMAILS = (process.env.ADMIN_ALLOWED_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);
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

  // Subscription lapsed past its grace period → lock everything except
  // Payments, so an allowed admin can still see status/reactivate.
  const isPaymentsRoute = request.nextUrl.pathname.startsWith("/admin/payments");
  if (isAdminRoute && !isLoginPage && !isCallbackRoute && isAllowed && !isPaymentsRoute) {
    const subscriptionRow = await getSubscriptionMirrorRow(supabase);
    if (isAdminLocked(subscriptionRow)) {
      const paymentsUrl = request.nextUrl.clone();
      paymentsUrl.pathname = "/admin/payments";
      return NextResponse.redirect(paymentsUrl);
    }
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
  matcher: ["/admin/:path*", "/", "/roster", "/schedule", "/shop"],
};
