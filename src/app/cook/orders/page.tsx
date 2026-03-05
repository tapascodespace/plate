"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  ChefHat,
  Package,
  Truck,
  RefreshCw,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
}

type TabKey = "all" | "pending" | "active" | "completed" | "cancelled";

const tabs: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const activeStatuses = ["confirmed", "preparing", "ready"];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-stone-200 rounded-lg ${className}`} />;
}

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

const statusConfig: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  pending: { color: "text-yellow-700", bg: "bg-yellow-100", icon: Clock },
  confirmed: { color: "text-blue-700", bg: "bg-blue-100", icon: CheckCircle2 },
  preparing: { color: "text-orange-700", bg: "bg-orange-100", icon: ChefHat },
  ready: { color: "text-emerald-700", bg: "bg-emerald-100", icon: Package },
  picked_up: { color: "text-indigo-700", bg: "bg-indigo-100", icon: Truck },
  delivered: { color: "text-green-700", bg: "bg-green-100", icon: CheckCircle2 },
  cancelled: { color: "text-red-600", bg: "bg-red-100", icon: XCircle },
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CookOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchOrders = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      const res = await fetch("/api/cook/orders");
      if (!res.ok) throw new Error("Failed to load orders");
      const data = await res.json();
      setOrders(data.orders ?? data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(true);
    // Auto-refresh every 30 seconds
    intervalRef.current = setInterval(() => fetchOrders(false), 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchOrders]);

  /* ---- Status transition ---- */
  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update order");
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch {
      alert("Could not update order status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  /* ---- Filter orders ---- */
  const filtered = orders.filter((o) => {
    switch (activeTab) {
      case "pending":
        return o.status === "pending";
      case "active":
        return activeStatuses.includes(o.status);
      case "completed":
        return o.status === "delivered" || o.status === "picked_up";
      case "cancelled":
        return o.status === "cancelled";
      default:
        return true;
    }
  });

  /* ---- Action buttons per status ---- */
  const renderActions = (order: Order) => {
    const disabled = updatingId === order.id;
    const baseClasses = "text-sm font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50";

    switch (order.status) {
      case "pending":
        return (
          <div className="flex gap-2">
            <button
              onClick={() => updateStatus(order.id, "confirmed")}
              disabled={disabled}
              className={`${baseClasses} bg-green-500 hover:bg-green-600 text-white`}
            >
              {disabled ? "Updating..." : "Accept"}
            </button>
            <button
              onClick={() => updateStatus(order.id, "cancelled")}
              disabled={disabled}
              className={`${baseClasses} bg-white border border-red-300 text-red-600 hover:bg-red-50`}
            >
              Decline
            </button>
          </div>
        );
      case "confirmed":
        return (
          <button
            onClick={() => updateStatus(order.id, "preparing")}
            disabled={disabled}
            className={`${baseClasses} bg-orange-500 hover:bg-orange-600 text-white`}
          >
            {disabled ? "Updating..." : "Start Preparing"}
          </button>
        );
      case "preparing":
        return (
          <button
            onClick={() => updateStatus(order.id, "ready")}
            disabled={disabled}
            className={`${baseClasses} bg-emerald-500 hover:bg-emerald-600 text-white`}
          >
            {disabled ? "Updating..." : "Mark Ready"}
          </button>
        );
      case "ready":
        return (
          <button
            onClick={() => updateStatus(order.id, "picked_up")}
            disabled={disabled}
            className={`${baseClasses} bg-indigo-500 hover:bg-indigo-600 text-white`}
          >
            {disabled ? "Updating..." : "Mark Picked Up"}
          </button>
        );
      default:
        return null;
    }
  };

  /* ---- Loading ---- */
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-24" />
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-stone-600 font-medium">{error}</p>
        <Button
          onClick={() => fetchOrders(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Orders</h1>
          <p className="text-stone-500 text-sm mt-1">
            Manage incoming orders and track their progress.
          </p>
        </div>
        <Button
          onClick={() => fetchOrders(false)}
          className="border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 gap-2 shadow-sm self-start"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const count = orders.filter((o) => {
            switch (tab.key) {
              case "pending":
                return o.status === "pending";
              case "active":
                return activeStatuses.includes(o.status);
              case "completed":
                return o.status === "delivered" || o.status === "picked_up";
              case "cancelled":
                return o.status === "cancelled";
              default:
                return true;
            }
          }).length;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                ${
                  activeTab === tab.key
                    ? "bg-orange-500 text-white shadow-sm"
                    : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
                }
              `}
            >
              {tab.label}
              <span
                className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === tab.key
                    ? "bg-orange-400 text-white"
                    : "bg-stone-100 text-stone-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Auto-refresh indicator */}
      <p className="text-xs text-stone-400 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
        Auto-refreshing every 30 seconds
      </p>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <Filter className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 font-medium">No orders found</p>
          <p className="text-stone-400 text-sm mt-1">
            {activeTab === "all"
              ? "Orders will appear here once customers start ordering."
              : `No ${activeTab} orders at the moment.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const config = statusConfig[order.status] ?? statusConfig.pending;
            const StatusIcon = config.icon;

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-sm transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Left: order info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="text-sm font-bold text-stone-800">
                        #{order.orderNumber}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${config.bg} ${config.color}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {order.status.replace("_", " ")}
                      </span>
                      <span className="text-xs text-stone-400">{timeAgo(order.createdAt)}</span>
                    </div>

                    <p className="text-sm font-medium text-stone-700 mb-1">
                      {order.customerName}
                    </p>

                    {/* Items */}
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      {order.items.map((item, idx) => (
                        <span key={idx} className="text-xs text-stone-500">
                          {item.qty}x {item.name}
                          {item.price > 0 && (
                            <span className="text-stone-400 ml-1">
                              (${(item.price * item.qty).toFixed(2)})
                            </span>
                          )}
                        </span>
                      ))}
                    </div>

                    <p className="text-sm font-bold text-stone-800 mt-2">
                      Total: ${order.total.toFixed(2)}
                    </p>
                  </div>

                  {/* Right: actions */}
                  <div className="shrink-0">{renderActions(order)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
