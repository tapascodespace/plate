import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { getCookStats } from "@/lib/data/orders";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await requireSession();

    const stats = await getCookStats(session.sub);

    if (!stats) {
      const cookProfile = await prisma.cookProfile.findUnique({
        where: { userId: session.sub },
      });

      if (!cookProfile) {
        return NextResponse.json(
          { success: false, error: "Cook profile not found" },
          { status: 404 }
        );
      }

      const orders = await prisma.order.findMany({
        where: { cookProfileId: cookProfile.id },
        include: {
          customer: { select: { name: true } },
          items: { include: { dish: { select: { name: true } } } },
        },
        orderBy: { createdAt: "desc" },
      });

      const totalOrders = orders.length;
      const pendingOrders = orders.filter((order) =>
        ["PENDING", "CONFIRMED", "PREPARING"].includes(order.status)
      ).length;
      const revenue = orders
        .filter((order) => order.status === "DELIVERED")
        .reduce((sum, order) => sum + order.total, 0);

      return NextResponse.json({
        success: true,
        data: {
          totalOrders,
          pendingOrders,
          revenue,
          rating: cookProfile.rating,
          recentOrders: orders.slice(0, 10).map((order) => ({
            id: order.id,
            orderNumber: order.orderNumber,
            customerName: order.customer.name,
            items: order.items.map((item) => ({
              name: item.dish.name,
              qty: item.quantity,
              price: item.price,
            })),
            total: order.total,
            status: order.status.toLowerCase(),
            createdAt: order.createdAt,
          })),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        totalOrders: stats.totalOrders,
        pendingOrders: stats.pendingOrders,
        revenue: stats.revenue,
        rating: stats.rating,
        recentOrders: stats.recentOrders,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    console.error("Get cook stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch cook stats" },
      { status: 500 }
    );
  }
}
