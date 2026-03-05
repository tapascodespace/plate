import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { updateOrderStatus } from "@/lib/data/orders";
import { getStripeServerClient, getStripeWebhookSecret } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const stripe = getStripeServerClient();
  const webhookSecret = getStripeWebhookSecret();

  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { success: false, error: "Stripe webhook is not configured" },
      { status: 503 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { success: false, error: "Missing stripe signature" },
      { status: 400 }
    );
  }

  try {
    const payload = await request.text();
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      const orderId = checkoutSession.metadata?.orderId;

      if (orderId) {
        try {
          await updateOrderStatus(orderId, "CONFIRMED");
        } catch (error) {
          console.warn("Could not mark order as confirmed from webhook", {
            orderId,
            error,
          });
        }
      }
    }

    if (event.type === "checkout.session.expired") {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      const orderId = checkoutSession.metadata?.orderId;

      if (orderId) {
        try {
          await updateOrderStatus(orderId, "CANCELLED");
        } catch (error) {
          console.warn("Could not mark order as cancelled from webhook", {
            orderId,
            error,
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { success: false, error: "Invalid webhook payload" },
      { status: 400 }
    );
  }
}
