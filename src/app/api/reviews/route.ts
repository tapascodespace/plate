import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { submitReviewForOrder } from "@/lib/data/orders";

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const { orderId, rating, comment } = body;

    if (!orderId || rating == null) {
      return NextResponse.json(
        { success: false, error: "Order ID and rating are required" },
        { status: 400 }
      );
    }

    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be an integer between 1 and 5" },
        { status: 400 }
      );
    }

    const review = await submitReviewForOrder({
      orderId,
      userId: session.sub,
      rating: ratingNum,
      comment: comment ?? null,
    });

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      [
        "Order not found",
        "Only the customer can review this order",
        "Can only review delivered orders",
        "This order has already been reviewed",
      ].includes(error.message)
    ) {
      const status =
        error.message === "Order not found"
          ? 404
          : error.message === "This order has already been reviewed"
            ? 409
            : error.message === "Only the customer can review this order"
              ? 403
              : 400;

      return NextResponse.json(
        { success: false, error: error.message },
        { status }
      );
    }

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    console.error("Create review error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create review" },
      { status: 500 }
    );
  }
}
