import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getSubscriptionMirrorRow } from "@/lib/subscription-mirror";
import { getStripeClient } from "@/lib/stripe-client";

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.BILLING_ADMIN_EMAIL) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const mirrorRow = await getSubscriptionMirrorRow(supabase);
  if (!mirrorRow?.stripe_customer_id) {
    return NextResponse.json({ error: "No subscription on file yet." }, { status: 400 });
  }

  const stripe = getStripeClient();
  const origin = new URL(request.url).origin;

  const session = await stripe.billingPortal.sessions.create({
    customer: mirrorRow.stripe_customer_id,
    return_url: `${origin}/admin/payments`,
  });

  return NextResponse.redirect(session.url, 303);
}
