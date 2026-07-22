import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe-client";
import { createServiceRoleClient } from "@/lib/supabase-service-role";

export const runtime = "nodejs";

async function upsertMirrorRow(
  supabase: ReturnType<typeof createServiceRoleClient>,
  subscription: Stripe.Subscription,
) {
  const item = subscription.items.data[0];
  const currentPeriodEnd = item ? new Date(item.current_period_end * 1000).toISOString() : null;
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

  // Stripe expresses "scheduled to cancel" two different ways depending on
  // how the cancellation was initiated: the legacy cancel_at_period_end
  // boolean, or (as the Billing Portal's cancel action does on this API
  // version) a cancel_at timestamp with cancel_at_period_end left false.
  // Treat either signal as scheduled-to-cancel.
  const cancelAtPeriodEnd = subscription.cancel_at_period_end || Boolean(subscription.cancel_at);

  const { error } = await supabase.from("stripe_subscription").upsert(
    {
      id: 1,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      cancel_at_period_end: cancelAtPeriodEnd,
      current_period_end: currentPeriodEnd,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) {
    // Throwing (rather than swallowing) makes this event return a non-2xx
    // response, so Stripe automatically retries delivery until it succeeds.
    throw new Error(`Failed to upsert stripe_subscription: ${error.message}`);
  }
}

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature ?? "", process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "subscription" && session.subscription) {
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription.id;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await upsertMirrorRow(supabase, subscription);
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await upsertMirrorRow(supabase, subscription);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionRef = invoice.parent?.subscription_details?.subscription;
      if (subscriptionRef) {
        const subscriptionId = typeof subscriptionRef === "string" ? subscriptionRef : subscriptionRef.id;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await upsertMirrorRow(supabase, subscription);
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
