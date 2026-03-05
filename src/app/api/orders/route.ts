import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { createOrderForUser, listOrdersForUser } from "@/lib/data/orders";

export async function GET() {
  try {
    const session = await requireSession();
    const orders = await listOrdersForUser(session.sub, session.role);

    return NextResponse.json({ success: true, data: orders });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    console.error("List orders error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();

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

    return NextResponse.json({ success: true, data: order }, { status: 201 });
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

    console.error("Create order error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}
