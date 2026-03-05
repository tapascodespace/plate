"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Star,
  MapPin,
  Utensils,
  ShoppingCart,
  Plus,
  Minus,
  ArrowLeft,
  Clock,
  ChefHat,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { StarRating } from "@/components/ui/StarRating";
import { useCartStore } from "@/lib/store";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface CookDish {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  category: string;
  cookProfileId: string;
  available: boolean;
}

interface CookReview {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { id: string; name: string; avatar: string | null };
}

interface CookProfileData {
  id: string;
  bio: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  neighborhood: string;
  coverImage: string | null;
  user: { id: string; name: string; avatar: string | null };
  dishes: CookDish[];
  reviews: CookReview[];
}

/* -------------------------------------------------------------------------- */
/*  Skeletons                                                                  */
/* -------------------------------------------------------------------------- */

function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Cover */}
      <div className="h-48 sm:h-64 bg-stone-200" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative -mt-12 flex items-end gap-4 pb-6">
          <div className="h-24 w-24 rounded-full bg-stone-300 border-4 border-white" />
          <div className="space-y-2 pb-2">
            <div className="h-6 w-48 rounded bg-stone-200" />
            <div className="h-4 w-32 rounded bg-stone-100" />
          </div>
        </div>
        <div className="space-y-3 pb-8">
          <div className="h-4 w-full max-w-lg rounded bg-stone-100" />
          <div className="h-4 w-3/4 max-w-lg rounded bg-stone-100" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-stone-100" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page Component                                                             */
/* -------------------------------------------------------------------------- */

export default function CookProfilePage() {
  const params = useParams<{ id: string }>();
  const [cook, setCook] = useState<CookProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  const { items, addItem, removeItem, updateQuantity, getTotal, getItemCount, cookProfileId } =
    useCartStore();

  useEffect(() => {
    if (!params.id) return;
    setLoading(true);
    fetch(`/api/cooks/${params.id}`)
      .then((r) => r.json())
      .then((d) => setCook(d.data ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <ProfileSkeleton />;
  if (!cook) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <ChefHat className="mx-auto h-16 w-16 text-stone-300 mb-4" />
          <h2 className="text-xl font-semibold text-stone-900 mb-2">Cook not found</h2>
          <p className="text-stone-500 mb-6">This cook profile does not exist or has been removed.</p>
          <Link href="/explore">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" />
              Back to Explore
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Derived
  const categories = ["All", ...Array.from(new Set(cook.dishes.map((d) => d.category)))];
  const filteredDishes =
    activeCategory === "All"
      ? cook.dishes
      : cook.dishes.filter((d) => d.category === activeCategory);

  const cartItemsFromThisCook =
    cookProfileId === cook.id ? items : [];
  const cartTotal = cookProfileId === cook.id ? getTotal() : 0;
  const cartCount = cookProfileId === cook.id ? getItemCount() : 0;

  const getCartQuantity = (dishId: string) => {
    const item = cartItemsFromThisCook.find((i) => i.dishId === dishId);
    return item ? item.quantity : 0;
  };

  const handleAdd = (dish: CookDish) => {
    addItem({
      dishId: dish.id,
      name: dish.name,
      price: dish.price,
      quantity: 1,
      cookProfileId: dish.cookProfileId,
      image: dish.image ?? undefined,
    });
  };

  const handleIncrement = (dishId: string) => {
    const qty = getCartQuantity(dishId);
    updateQuantity(dishId, qty + 1);
  };

  const handleDecrement = (dishId: string) => {
    const qty = getCartQuantity(dishId);
    if (qty <= 1) {
      removeItem(dishId);
    } else {
      updateQuantity(dishId, qty - 1);
    }
  };

  return (
    <main className="min-h-screen bg-stone-50 pb-32 lg:pb-8">
      {/* ─── Cover Image ──────────────────────────────────────────────── */}
      <div className="relative h-48 sm:h-64 bg-gradient-to-br from-orange-400 to-amber-500 overflow-hidden">
        {cook.coverImage && (
          <img
            src={cook.coverImage}
            alt=""
            className="h-full w-full object-cover opacity-80"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <Link
          href="/explore"
          className="absolute top-4 left-4 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium text-stone-700 shadow backdrop-blur-sm hover:bg-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* ─── Profile Header ─────────────────────────────────────────── */}
        <div className="relative -mt-12 flex flex-col sm:flex-row sm:items-end gap-4 pb-6 animate-slide-up">
          <Avatar
            src={cook.user.avatar}
            name={cook.user.name}
            size="xl"
            className="ring-4 ring-white"
          />
          <div className="flex-1 min-w-0 pb-1">
            <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">
              {cook.user.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <div className="flex items-center gap-1.5">
                <StarRating value={cook.rating} size="sm" />
                <span className="text-sm font-semibold text-stone-700">
                  {cook.rating.toFixed(1)}
                </span>
                <span className="text-sm text-stone-400">
                  ({cook.reviewCount} reviews)
                </span>
              </div>
              <span className="text-stone-300">|</span>
              <div className="flex items-center gap-1 text-sm text-stone-500">
                <MapPin className="h-4 w-4" />
                {cook.neighborhood}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Specialties ────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 mb-6 animate-fade-in">
          {cook.specialties.map((s) => (
            <Badge key={s} variant="warning" size="md">
              {s}
            </Badge>
          ))}
        </div>

        {/* ─── Bio ────────────────────────────────────────────────────── */}
        {cook.bio && (
          <div className="mb-10 animate-fade-in">
            <p className="text-stone-600 leading-relaxed max-w-3xl">
              {cook.bio}
            </p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ─── Menu Section ─────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-stone-900 mb-6 flex items-center gap-2">
              <Utensils className="h-6 w-6 text-orange-500" />
              Menu
            </h2>

            {/* Category tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    activeCategory === cat
                      ? "bg-orange-500 text-white shadow-sm"
                      : "bg-white text-stone-600 border border-stone-200 hover:border-orange-200 hover:text-orange-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Dish grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {filteredDishes.map((dish, i) => {
                const qty = getCartQuantity(dish.id);
                return (
                  <div
                    key={dish.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
                  >
                    <Card className="group h-full">
                      <div className="aspect-[16/10] w-full overflow-hidden bg-stone-100">
                        {dish.image ? (
                          <img
                            src={dish.image}
                            alt={dish.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
                            <Utensils className="h-8 w-8 text-orange-300" />
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold text-stone-900">
                          {dish.name}
                        </h3>
                        {dish.description && (
                          <p className="mt-1 text-sm text-stone-500 line-clamp-2">
                            {dish.description}
                          </p>
                        )}

                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-lg font-bold text-orange-600">
                            ${dish.price.toFixed(2)}
                          </span>

                          {qty === 0 ? (
                            <button
                              onClick={() => handleAdd(dish)}
                              disabled={!dish.available}
                              className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-orange-600 hover:shadow active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label={`Add ${dish.name} to cart`}
                            >
                              <Plus className="h-4 w-4" />
                              Add
                            </button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDecrement(dish.id)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-50 transition-colors"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-6 text-center font-semibold text-stone-900">
                                {qty}
                              </span>
                              <button
                                onClick={() => handleIncrement(dish.id)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>

                        {!dish.available && (
                          <p className="mt-2 text-xs text-red-500 font-medium">
                            Currently unavailable
                          </p>
                        )}
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>

            {filteredDishes.length === 0 && (
              <div className="py-12 text-center">
                <Utensils className="mx-auto h-10 w-10 text-stone-300 mb-3" />
                <p className="text-stone-500">
                  No dishes in this category yet.
                </p>
              </div>
            )}

            {/* ─── Reviews Section ────────────────────────────────────── */}
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-orange-500" />
                Reviews
                <span className="text-base font-normal text-stone-400">
                  ({cook.reviews.length})
                </span>
              </h2>

              {cook.reviews.length === 0 ? (
                <div className="py-12 text-center">
                  <Star className="mx-auto h-10 w-10 text-stone-300 mb-3" />
                  <p className="text-stone-500">No reviews yet. Be the first!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cook.reviews.map((review, i) => (
                    <Card
                      key={review.id}
                      padding="lg"
                      className="animate-slide-up"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar
                          src={review.user.avatar}
                          name={review.user.name}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-semibold text-stone-900">
                              {review.user.name}
                            </h4>
                            <span className="text-xs text-stone-400 shrink-0">
                              {new Date(review.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <StarRating
                            value={review.rating}
                            size="sm"
                            className="mt-1"
                          />
                          {review.comment && (
                            <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ─── Desktop Sidebar: Order Summary ───────────────────────── */}
          {cartCount > 0 && cookProfileId === cook.id && (
            <aside className="hidden lg:block w-80 shrink-0">
              <div className="sticky top-24">
                <Card padding="lg" className="animate-slide-up">
                  <h3 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-orange-500" />
                    Your Order
                  </h3>

                  <div className="space-y-3 mb-4">
                    {cartItemsFromThisCook.map((item) => (
                      <div
                        key={item.dishId}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-600">
                            {item.quantity}
                          </span>
                          <span className="text-stone-700 truncate">
                            {item.name}
                          </span>
                        </div>
                        <span className="font-medium text-stone-900 shrink-0">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-stone-100 pt-3 mb-4">
                    <div className="flex justify-between font-semibold text-stone-900">
                      <span>Subtotal</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <Link href="/cart">
                    <Button className="w-full">
                      <ShoppingCart className="h-4 w-4" />
                      View Cart ({cartCount})
                    </Button>
                  </Link>
                </Card>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* ─── Mobile Bottom Bar: Order Summary ─────────────────────────── */}
      {cartCount > 0 && cookProfileId === cook.id && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-4 shadow-lg lg:hidden z-30 animate-slide-up">
          <Link href="/cart">
            <Button className="w-full justify-between" size="lg">
              <span className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                View Cart ({cartCount} items)
              </span>
              <span className="font-bold">${cartTotal.toFixed(2)}</span>
            </Button>
          </Link>
        </div>
      )}
    </main>
  );
}
