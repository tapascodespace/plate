import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { createOrderForUser } from "@/lib/data/orders";
import { getStripeServerClient } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const stripe = getStripeServerClient();

    if (!stripe) {
      return NextResponse.json(
        { success: false, error: "Stripe is not configured" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { items, deliveryAddress, specialInstructions } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one item is required" },
        { status: 400 }
      );
    }

    const order = await createOrderForUser(session.sub, {
      items,
      deliveryAddress,
      specialInstructions,
    });

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      `${request.nextUrl.protocol}//${request.nextUrl.host}`;

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: session.email,
      success_url: `${appUrl}/orders?paid=1&orderId=${order.id}`,
      cancel_url: `${appUrl}/cart?cancelled=1&orderId=${order.id}`,
      metadata: {
        orderId: order.id,
        userId: session.sub,
      },
      line_items: order.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(item.price * 100),
          product_data: {
            name: item.dish.name,
          },
        },
      })),
    });

    if (!checkoutSession.url) {
      return NextResponse.json(
        { success: false, error: "Failed to create checkout URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        sessionId: checkoutSession.id,
        checkoutUrl: checkoutSession.url,
      },
    });
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      ["One or more dishes are unavailable", "All items must be from the same cook"].includes(
        error.message
      )
    ) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    console.error("Create Stripe checkout error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to start checkout" },
      { status: 500 }
    );
  }
}
