import { NextResponse } from "next/server";
import { type Prisma } from "@prisma/client";
import { requireSession } from "@/lib/auth";
import { getCookStats } from "@/lib/data/orders";
import prisma from "@/lib/db";

type OrderRow = Prisma.OrderGetPayload<{
  include: {
    customer: { select: { name: true } };
    items: { include: { dish: { select: { name: true } } } };
  };
}>;

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

      const orders = (await prisma.order.findMany({
        where: { cookProfileId: cookProfile.id },
        include: {
          customer: { select: { name: true } },
          items: { include: { dish: { select: { name: true } } } },
        },
        orderBy: { createdAt: "desc" },
      })) as OrderRow[];

      const totalOrders = orders.length;
      let pendingOrders = 0;
      let revenue = 0;

      for (const order of orders) {
        if (["PENDING", "CONFIRMED", "PREPARING"].includes(order.status)) {
          pendingOrders += 1;
        }

        if (order.status === "DELIVERED") {
          revenue += order.total;
        }
      }

      const recentOrders: Array<{
        id: string;
        orderNumber: string;
        customerName: string;
        items: Array<{ name: string; qty: number; price: number }>;
        total: number;
        status: string;
        createdAt: Date;
      }> = [];

      const recentSource = orders.slice(0, 10);
      for (const order of recentSource) {
        const normalizedItems: Array<{ name: string; qty: number; price: number }> = [];

        for (const item of order.items) {
          normalizedItems.push({
            name: item.dish.name,
            qty: item.quantity,
            price: item.price,
          });
        }

        recentOrders.push({
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
        data: {
          totalOrders,
          pendingOrders,
          revenue,
          rating: cookProfile.rating,
          recentOrders,
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
