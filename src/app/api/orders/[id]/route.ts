import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import {
  getCookProfileByUser,
  getOrderById,
  updateOrderStatus,
} from "@/lib/data/orders";

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["DELIVERED"],
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    const { id } = await params;

    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const cookProfile = await getCookProfileByUser(session.sub);
    const isCookOwner = Boolean(cookProfile && cookProfile.id === order.cookProfileId);
    const isBuyer = order.customerId === session.sub;

    if (!isCookOwner && !isBuyer) {
      return NextResponse.json(
        { success: false, error: "You do not have access to this order" },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    console.error("Get order error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const { status } = await request.json();
    const nextStatus = String(status ?? "").toUpperCase();

    if (!nextStatus) {
      return NextResponse.json(
        { success: false, error: "Status is required" },
        { status: 400 }
      );
    }

    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const cookProfile = await getCookProfileByUser(session.sub);
    const isCookOwner = Boolean(cookProfile && cookProfile.id === order.cookProfileId);
    const isBuyer = order.customerId === session.sub;

    if (!isCookOwner && !isBuyer) {
      return NextResponse.json(
        { success: false, error: "You do not have access to this order" },
        { status: 403 }
      );
    }

    const allowedNext = VALID_TRANSITIONS[order.status] ?? [];
    if (!allowedNext.includes(nextStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status transition from ${order.status} to ${nextStatus}`,
        },
        { status: 400 }
      );
    }

    if (nextStatus !== "CANCELLED" && !isCookOwner) {
      return NextResponse.json(
        { success: false, error: "Only the cook can perform this update" },
        { status: 403 }
      );
    }

    const updated = await updateOrderStatus(id, nextStatus);

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    console.error("Update order status error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
