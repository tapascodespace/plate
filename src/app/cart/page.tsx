"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Utensils,
  ArrowLeft,
  MapPin,
  Truck,
  MessageSquare,
  CreditCard,
  CheckCircle,
  ChefHat,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useCartStore } from "@/lib/store";

/* -------------------------------------------------------------------------- */
/*  Page Component                                                             */
/* -------------------------------------------------------------------------- */

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
    cookProfileId,
  } = useCartStore();

  const [address, setAddress] = useState("");
  const [instructions, setInstructions] = useState("");
  const [placing, setPlacing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const subtotal = getTotal();
  const deliveryFee = items.length > 0 ? 3.99 : 0;
  const total = subtotal + deliveryFee;
  const itemCount = getItemCount();

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      setError("Please enter a delivery address.");
      return;
    }

    setPlacing(true);
    setError(null);

    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cookProfileId,
          items: items.map((item) => ({
            dishId: item.dishId,
            quantity: item.quantity,
            price: item.price,
          })),
          deliveryAddress: address,
          specialInstructions: instructions || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to start checkout");
      }

      const checkoutUrl = json.data?.checkoutUrl;
      if (!checkoutUrl) {
        throw new Error("Missing checkout URL");
      }

      setOrderId(json.data?.orderId ?? null);
      clearCart();
      window.location.href = checkoutUrl;
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  /* ─── Empty Cart ────────────────────────────────────────────────── */
  if (items.length === 0 && !showConfirmation) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="text-center animate-fade-in">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-stone-100">
            <ShoppingCart className="h-12 w-12 text-stone-400" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 mb-2">
            Your cart is empty
          </h1>
          <p className="text-stone-500 mb-8 max-w-sm mx-auto">
            Discover delicious home-cooked meals from talented local cooks and
            add some to your cart.
          </p>
          <Link href="/explore">
            <Button size="lg">
              <Utensils className="h-5 w-5" />
              Explore Cooks
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50">
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-stone-200">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/explore"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-stone-900">Your Cart</h1>
              <p className="text-sm text-stone-500">
                {itemCount} item{itemCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ─── Cart Items ───────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Cook info */}
            {cookProfileId && (
              <div className="mb-6 animate-fade-in">
                <Link
                  href={`/cook/${cookProfileId}`}
                  className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-orange-600 transition-colors"
                >
                  <ChefHat className="h-4 w-4" />
                  Ordering from this cook
                  <span className="text-orange-500">&rarr;</span>
                </Link>
              </div>
            )}

            {/* Items list */}
            <div className="space-y-4">
              {items.map((item, i) => (
                <Card
                  key={item.dishId}
                  padding="none"
                  className="animate-slide-up"
                >
                  <div className="flex items-center gap-4 p-4">
                    {/* Image */}
                    <div className="h-20 w-20 shrink-0 rounded-lg overflow-hidden bg-stone-100">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
                          <Utensils className="h-6 w-6 text-orange-300" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-stone-900 truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm text-stone-500">
                        ${item.price.toFixed(2)} each
                      </p>

                      {/* Quantity controls */}
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              item.quantity <= 1
                                ? removeItem(item.dishId)
                                : updateQuantity(item.dishId, item.quantity - 1)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-50 transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-semibold text-stone-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.dishId, item.quantity + 1)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.dishId)}
                          className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Line total */}
                    <div className="text-right shrink-0">
                      <p className="font-bold text-stone-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* ─── Delivery Address ────────────────────────────────────── */}
            <div className="mt-8 animate-fade-in">
              <h2 className="text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-orange-500" />
                Delivery Address
              </h2>
              <Input
                placeholder="Enter your delivery address"
                icon={<Truck className="h-4 w-4" />}
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (error) setError(null);
                }}
                error={error && !address.trim() ? error : undefined}
              />
            </div>

            {/* ─── Special Instructions ────────────────────────────────── */}
            <div className="mt-6 animate-fade-in">
              <h2 className="text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-orange-500" />
                Special Instructions
              </h2>
              <textarea
                placeholder="Any allergies, preferences, or special requests? (optional)"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 resize-none"
              />
            </div>
          </div>

          {/* ─── Order Summary Sidebar ─────────────────────────────────── */}
          <div className="lg:w-80 shrink-0">
            <div className="lg:sticky lg:top-24">
              <Card padding="lg" className="animate-slide-up">
                <h2 className="text-lg font-semibold text-stone-900 mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-stone-600">
                    <span>
                      Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})
                    </span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Delivery fee</span>
                    <span>${deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-stone-100 pt-3 flex justify-between font-bold text-stone-900 text-base">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <Button
                  className="w-full mt-6"
                  size="lg"
                  loading={placing}
                  onClick={handlePlaceOrder}
                >
                  <CreditCard className="h-5 w-5" />
                  Pay with Stripe
                </Button>

                <button
                  onClick={clearCart}
                  className="w-full mt-3 text-sm text-stone-500 hover:text-red-500 transition-colors"
                >
                  Clear cart
                </button>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Confirmation Modal ───────────────────────────────────────── */}
      <Modal
        open={showConfirmation}
        onClose={() => {
          setShowConfirmation(false);
          if (orderId) {
            router.push(`/orders/${orderId}`);
          } else {
            router.push("/orders");
          }
        }}
        title="Order Placed!"
      >
        <div className="text-center py-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-stone-900 mb-2">
            Your order has been placed!
          </h3>
          <p className="text-stone-500 text-sm mb-6">
            Your cook will start preparing your meal shortly. You can track
            your order status in real-time.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => {
                setShowConfirmation(false);
                if (orderId) {
                  router.push(`/orders/${orderId}`);
                } else {
                  router.push("/orders");
                }
              }}
            >
              Track Order
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowConfirmation(false);
                router.push("/explore");
              }}
            >
              Continue Browsing
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
