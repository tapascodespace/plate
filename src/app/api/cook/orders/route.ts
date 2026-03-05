import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { listCookOrders } from "@/lib/data/orders";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession();
    const { searchParams } = new URL(request.url);

    const limitParam = Number(searchParams.get("limit") ?? 20);
    const limit = Number.isNaN(limitParam) ? 20 : Math.min(Math.max(limitParam, 1), 50);

    const orders = await listCookOrders(session.sub, limit);

    if (!orders) {
      const cookProfile = await prisma.cookProfile.findUnique({
        where: { userId: session.sub },
      });

      if (!cookProfile) {
        return NextResponse.json(
          { success: false, error: "Cook profile not found" },
          { status: 404 }
        );
      }

      const fallbackOrders = await prisma.order.findMany({
        where: { cookProfileId: cookProfile.id },
        include: {
          customer: { select: { name: true } },
          items: { include: { dish: { select: { name: true } } } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      const normalizedOrders: Array<{
        id: string;
        orderNumber: string;
        customerName: string;
        items: Array<{ name: string; qty: number; price: number }>;
        total: number;
        status: string;
        createdAt: Date;
      }> = [];

      for (const order of fallbackOrders) {
        const normalizedItems: Array<{ name: string; qty: number; price: number }> = [];

        for (const item of order.items) {
          normalizedItems.push({
            name: item.dish.name,
            qty: item.quantity,
            price: item.price,
          });
        }

        normalizedOrders.push({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customer.name,
          items: normalizedItems,
          total: order.total,
          status: order.status.toLowerCase(),
          createdAt: order.createdAt,
        });
      }

      return NextResponse.json({
        success: true,
        orders: normalizedOrders,
      });
    }

    return NextResponse.json({ success: true, orders });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    console.error("Get cook orders error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch cook orders" },
      { status: 500 }
    );
  }
}
