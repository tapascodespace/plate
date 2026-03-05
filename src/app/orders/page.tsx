"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Clock,
  ChefHat,
  CheckCircle,
  XCircle,
  Truck,
  Star,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Utensils,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { StarRating } from "@/components/ui/StarRating";
import { Modal } from "@/components/ui/Modal";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  dish: { id: string; name: string; image: string | null };
}

interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  cookProfile: {
    id: string;
    user: { id: string; name: string; avatar: string | null };
  };
  items: OrderItem[];
  review: { id: string; rating: number; comment: string } | null;
}

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "success" | "warning" | "danger" | "info"; icon: React.ElementType }> = {
  PENDING: { label: "Pending", variant: "warning", icon: Clock },
  CONFIRMED: { label: "Confirmed", variant: "info", icon: CheckCircle },
  PREPARING: { label: "Preparing", variant: "info", icon: ChefHat },
  READY: { label: "Ready", variant: "success", icon: Package },
  OUT_FOR_DELIVERY: { label: "On the way", variant: "success", icon: Truck },
  DELIVERED: { label: "Delivered", variant: "success", icon: CheckCircle },
  CANCELLED: { label: "Cancelled", variant: "danger", icon: XCircle },
};

const ACTIVE_STATUSES = ["PENDING", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY"];
const PAST_STATUSES = ["DELIVERED", "CANCELLED"];

const STATUS_STEPS = ["PENDING", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "DELIVERED"];

/* -------------------------------------------------------------------------- */
/*  Skeletons                                                                  */
/* -------------------------------------------------------------------------- */

function OrderSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-stone-200 bg-white p-5 space-y-3">
      <div className="flex justify-between">
        <div className="h-4 w-24 rounded bg-stone-200" />
        <div className="h-6 w-20 rounded-full bg-stone-100" />
      </div>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-stone-200" />
        <div className="h-4 w-32 rounded bg-stone-100" />
      </div>
      <div className="h-3 w-full rounded bg-stone-100" />
      <div className="flex justify-between">
        <div className="h-4 w-20 rounded bg-stone-100" />
        <div className="h-5 w-16 rounded bg-stone-200" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page Component                                                             */
/* -------------------------------------------------------------------------- */

export default function OrdersPage() {
  const [tab, setTab] = useState<"active" | "past">("active");
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Review modal
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const pastOrders = orders.filter((o) => PAST_STATUSES.includes(o.status));
  const displayedOrders = tab === "active" ? activeOrders : pastOrders;

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSubmitReview = async () => {
    if (!reviewOrderId) return;
    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: reviewOrderId,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      const json = await res.json();
      if (json.success) {
        // Update local state
        setOrders((prev) =>
          prev.map((o) =>
            o.id === reviewOrderId
              ? { ...o, review: { id: json.data?.id ?? "", rating: reviewRating, comment: reviewComment } }
              : o
          )
        );
        setReviewOrderId(null);
        setReviewRating(5);
        setReviewComment("");
      }
    } catch {
      // Silently handle
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusStep = (status: string) => {
    const idx = STATUS_STEPS.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <main className="min-h-screen bg-stone-50">
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-stone-200">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
          <h1 className="text-2xl font-bold text-stone-900 mb-4">
            My Orders
          </h1>

          {/* Tabs */}
          <div className="flex gap-1 rounded-lg border border-stone-200 p-1 bg-stone-50 w-fit">
            <button
              onClick={() => setTab("active")}
              className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                tab === "active"
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              <Clock className="h-4 w-4" />
              Active
              {activeOrders.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs text-white">
                  {activeOrders.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab("past")}
              className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                tab === "past"
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              <CheckCircle className="h-4 w-4" />
              Past
            </button>
          </div>
        </div>
      </div>

      {/* ─── Orders List ──────────────────────────────────────────────── */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <OrderSkeleton key={i} />
            ))}
          </div>
        ) : displayedOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-stone-100 mb-6">
              <ShoppingBag className="h-10 w-10 text-stone-400" />
            </div>
            <h3 className="text-xl font-semibold text-stone-900 mb-2">
              No {tab} orders
            </h3>
            <p className="text-stone-500 text-center max-w-sm mb-6">
              {tab === "active"
                ? "You don't have any active orders right now. Browse cooks and place an order!"
                : "You haven't completed any orders yet. Your order history will appear here."}
            </p>
            <Link href="/explore">
              <Button>
                <Utensils className="h-4 w-4" />
                Explore Cooks
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedOrders.map((order, i) => {
              const config = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
              const StatusIcon = config.icon;
              const isExpanded = expandedId === order.id;
              const currentStep = getStatusStep(order.status);

              return (
                <Card
                  key={order.id}
                  padding="none"
                  className="animate-slide-up overflow-hidden"
                >
                  {/* ─── Order Header ───────────────────────────────── */}
                  <button
                    onClick={() => toggleExpand(order.id)}
                    className="w-full text-left p-5 hover:bg-stone-50/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="text-sm font-medium text-stone-500">
                          Order #{order.orderNumber}
                        </p>
                        <p className="text-xs text-stone-400 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={config.variant} size="md">
                          <StatusIcon className="h-3.5 w-3.5" />
                          {config.label}
                        </Badge>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-stone-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-stone-400" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <Avatar
                        src={order.cookProfile.user.avatar}
                        name={order.cookProfile.user.name}
                        size="sm"
                      />
                      <span className="text-sm font-medium text-stone-700">
                        {order.cookProfile.user.name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-stone-500">
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                        {" - "}
                        {order.items
                          .slice(0, 2)
                          .map((item) => item.dish.name)
                          .join(", ")}
                        {order.items.length > 2 ? "..." : ""}
                      </p>
                      <p className="font-bold text-stone-900">
                        ${order.total.toFixed(2)}
                      </p>
                    </div>
                  </button>

                  {/* ─── Expanded Details ───────────────────────────── */}
                  {isExpanded && (
                    <div className="border-t border-stone-100 p-5 animate-fade-in">
                      {/* Status Timeline (active orders) */}
                      {ACTIVE_STATUSES.includes(order.status) && (
                        <div className="mb-6">
                          <h4 className="text-sm font-medium text-stone-700 mb-4">
                            Order Progress
                          </h4>
                          <div className="flex items-center gap-1">
                            {STATUS_STEPS.slice(0, -1).map((step, idx) => {
                              const isComplete = idx < currentStep;
                              const isCurrent = idx === currentStep;
                              return (
                                <React.Fragment key={step}>
                                  <div
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                                      isComplete
                                        ? "bg-green-500 text-white"
                                        : isCurrent
                                        ? "bg-orange-500 text-white animate-pulse"
                                        : "bg-stone-100 text-stone-400"
                                    }`}
                                  >
                                    {isComplete ? (
                                      <CheckCircle className="h-4 w-4" />
                                    ) : (
                                      idx + 1
                                    )}
                                  </div>
                                  {idx < STATUS_STEPS.length - 2 && (
                                    <div
                                      className={`h-0.5 flex-1 rounded ${
                                        idx < currentStep
                                          ? "bg-green-500"
                                          : "bg-stone-200"
                                      }`}
                                    />
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                          <div className="flex justify-between mt-2">
                            {STATUS_STEPS.slice(0, -1).map((step) => (
                              <span
                                key={step}
                                className="text-[10px] text-stone-400 text-center w-8"
                              >
                                {STATUS_CONFIG[step]?.label.split(" ")[0]}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Items */}
                      <div className="space-y-2 mb-4">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-600">
                                {item.quantity}
                              </span>
                              <span className="text-stone-700">
                                {item.dish.name}
                              </span>
                            </div>
                            <span className="font-medium text-stone-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-stone-100">
                        <Link href={`/orders/${order.id}`}>
                          <Button variant="ghost" size="sm">
                            View full details
                          </Button>
                        </Link>

                        {/* Review button for delivered orders without review */}
                        {order.status === "DELIVERED" && !order.review && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setReviewOrderId(order.id);
                            }}
                          >
                            <Star className="h-4 w-4" />
                            Leave a Review
                          </Button>
                        )}

                        {/* Show existing review */}
                        {order.review && (
                          <div className="flex items-center gap-2">
                            <StarRating value={order.review.rating} size="sm" />
                            <span className="text-xs text-stone-500">
                              Your review
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Review Modal ─────────────────────────────────────────────── */}
      <Modal
        open={!!reviewOrderId}
        onClose={() => {
          setReviewOrderId(null);
          setReviewRating(5);
          setReviewComment("");
        }}
        title="Leave a Review"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-3">
              How was your experience?
            </label>
            <div className="flex justify-center">
              <StarRating
                value={reviewRating}
                interactive
                onChange={setReviewRating}
                size="lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Tell us more (optional)
            </label>
            <textarea
              placeholder="What did you enjoy? Any feedback for the cook?"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => {
                setReviewOrderId(null);
                setReviewRating(5);
                setReviewComment("");
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              loading={submittingReview}
              onClick={handleSubmitReview}
            >
              Submit Review
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
