import { createClient } from "@supabase/supabase-js";

// Bypasses RLS entirely — only ever used by the Stripe webhook route, which
// has no user session, to write the stripe_subscription mirror row.
export function createServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
