"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Clock,
  DollarSign,
  Star,
  Plus,
  ArrowRight,
  Package,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  revenue: number;
  rating: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  items: { name: string; qty: number }[];
  status: string;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/*  Animated counter                                                   */
/* ------------------------------------------------------------------ */

function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1200,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const from = 0;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (value - from) * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  return (
    <span>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-stone-200 rounded-lg ${className}`} />;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-orange-100 text-orange-700",
  ready: "bg-emerald-100 text-emerald-700",
  picked_up: "bg-stone-100 text-stone-600",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function CookDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const [statsRes, ordersRes] = await Promise.all([
        fetch("/api/cook/stats"),
        fetch("/api/cook/orders?limit=5&sort=recent"),
      ]);

      if (!statsRes.ok || !ordersRes.ok) throw new Error("Failed to load dashboard data");

      const statsData = await statsRes.json();
      const ordersData = await ordersRes.json();

      setStats(statsData.data ?? null);
      setRecentOrders(ordersData.orders ?? ordersData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ---------- Loading skeleton ---------- */
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-6 w-36" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  /* ---------- Error state ---------- */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
          <Package className="w-8 h-8 text-red-400" />
        </div>
        <p className="text-stone-600 font-medium">{error}</p>
        <Button onClick={fetchData} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
          <RefreshCw className="w-4 h-4" /> Retry
        </Button>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Orders",
      value: stats?.totalOrders ?? 0,
      prefix: "",
      suffix: "",
      decimals: 0,
      icon: ShoppingBag,
      color: "bg-orange-50 text-orange-500",
    },
    {
      label: "Pending Orders",
      value: stats?.pendingOrders ?? 0,
      prefix: "",
      suffix: "",
      decimals: 0,
      icon: Clock,
      color: "bg-yellow-50 text-yellow-500",
    },
    {
      label: "Revenue",
      value: stats?.revenue ?? 0,
      prefix: "$",
      suffix: "",
      decimals: 2,
      icon: DollarSign,
      color: "bg-emerald-50 text-emerald-500",
    },
    {
      label: "Rating",
      value: stats?.rating ?? 0,
      prefix: "",
      suffix: "/5",
      decimals: 1,
      icon: Star,
      color: "bg-amber-50 text-amber-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Dashboard</h1>
          <p className="text-stone-500 text-sm mt-1">
            Welcome back! Here is what is happening in your kitchen.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/cook/menu">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2 shadow-sm">
              <Plus className="w-4 h-4" /> Add New Dish
            </Button>
          </Link>
          <Link href="/cook/orders">
            <Button className="border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 gap-2 shadow-sm">
              View All Orders <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-stone-500">{card.label}</span>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-stone-800">
                <AnimatedNumber
                  value={card.value}
                  prefix={card.prefix}
                  suffix={card.suffix}
                  decimals={card.decimals}
                />
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-stone-800">Recent Orders</h2>
          <Link
            href="/cook/orders"
            className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
            <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 font-medium">No orders yet</p>
            <p className="text-stone-400 text-sm mt-1">
              Orders will appear here once customers start ordering.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-stone-200 p-4 hover:shadow-sm transition-shadow flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-bold text-stone-800">#{order.orderNumber}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        statusColors[order.status] ?? "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {order.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-sm text-stone-600">{order.customerName}</p>
                  <p className="text-xs text-stone-400 mt-0.5 truncate">
                    {order.items.map((i) => `${i.qty}x ${i.name}`).join(", ")}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-stone-400">{timeAgo(order.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
