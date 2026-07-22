import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// Lets the client-side admin sidebar decide whether to show the Payments
// link, without ever exposing BILLING_ADMIN_EMAIL to the browser bundle.
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isBillingAdmin = Boolean(user && user.email === process.env.BILLING_ADMIN_EMAIL);
  return NextResponse.json({ isBillingAdmin });
}
