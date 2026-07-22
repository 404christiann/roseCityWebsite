import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getSubscriptionMirrorRow } from "@/lib/subscription-mirror";
import { getStripeClient } from "@/lib/stripe-client";

const ROSE_CITY_BILLING_EMAIL = "info@rosecityfutbolclub.com";

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.BILLING_ADMIN_EMAIL) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const mirrorRow = await getSubscriptionMirrorRow(supabase);
  const stripe = getStripeClient();
  const origin = new URL(request.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${origin}/admin/payments?checkout=success`,
    cancel_url: `${origin}/admin/payments?checkout=cancelled`,
    ...(mirrorRow?.stripe_customer_id
      ? { customer: mirrorRow.stripe_customer_id }
      : { customer_email: ROSE_CITY_BILLING_EMAIL }),
  });

  return NextResponse.redirect(session.url!, 303);
}
