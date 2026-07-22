import { createClient } from "@/lib/supabase-server";
import { getSubscriptionMirrorRow } from "@/lib/subscription-mirror";
import { resolvePaymentsUiState } from "@/lib/stripe-subscription-state";

const SUPPORT_EMAIL = "onziofutbol@gmail.com";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function PaymentsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const mirrorRow = await getSubscriptionMirrorRow(supabase);
  const uiState = resolvePaymentsUiState(mirrorRow);
  const isBillingAdmin = user?.email === process.env.BILLING_ADMIN_EMAIL;

  const statusLabel =
    uiState.state === "no_subscription"
      ? "No active subscription"
      : uiState.state === "active"
        ? "Active"
        : uiState.state === "active_canceling"
          ? `Ends ${formatDate(uiState.periodEndsAt)}`
          : "Subscription ended";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1
          className="font-display font-black uppercase leading-none text-white"
          style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)" }}
        >
          Payments
        </h1>
        <p className="mt-2 max-w-2xl font-body text-sm leading-relaxed text-white/40">
          Rose City FC — Pro plan, $99.99/mo.
        </p>
      </div>

      <section className="rounded-xl border border-white/10 bg-[#141414] p-5 sm:p-7">
        <p className="font-display text-xs font-black uppercase tracking-[0.16em] text-[#E7001B]">
          Subscription Status
        </p>
        <h2 className="mt-2 font-display text-2xl font-black uppercase text-white">
          {statusLabel}
        </h2>

        {uiState.state === "active_canceling" && (
          <p className="mt-3 rounded-lg border border-white/10 bg-black/20 px-4 py-3 font-body text-sm text-white/60">
            Your subscription is scheduled to cancel and will end on {formatDate(uiState.periodEndsAt)}.
            Use Manage Billing below to keep it active instead.
          </p>
        )}

        {uiState.state === "terminal" && (
          <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 font-body text-sm text-red-300">
            Full admin access is on hold until the subscription is renewed. Questions about your
            billing? Contact{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">
              {SUPPORT_EMAIL}
            </a>
            .
          </p>
        )}

        {isBillingAdmin ? (
          <div className="mt-6">
            {(uiState.state === "no_subscription" || uiState.state === "terminal") && (
              <form action="/api/stripe/checkout" method="POST">
                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#E7001B] px-6 py-4 font-display text-lg font-black uppercase tracking-widest text-white transition hover:bg-[#ff0a25] sm:w-auto"
                >
                  Subscribe — $99.99/mo
                </button>
              </form>
            )}

            {(uiState.state === "active" || uiState.state === "active_canceling") && (
              <form action="/api/stripe/portal" method="POST">
                <button
                  type="submit"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-6 py-4 font-display text-lg font-black uppercase tracking-widest text-white/80 transition hover:border-white/20 hover:text-white sm:w-auto"
                >
                  Manage Billing
                </button>
              </form>
            )}
          </div>
        ) : (
          <p className="mt-6 font-body text-sm text-white/35">
            Only the billing admin can subscribe or manage this subscription.
          </p>
        )}
      </section>
    </div>
  );
}
