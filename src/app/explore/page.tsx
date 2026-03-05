"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  X,
  Utensils,
  MapPin,
  Star,
  Plus,
  ChefHat,
  LayoutGrid,
  Users,
  Frown,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { StarRating } from "@/components/ui/StarRating";
import { useCartStore } from "@/lib/store";

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const CUISINES = [
  "Indian",
  "Italian",
  "Mexican",
  "Chinese",
  "Thai",
  "Mediterranean",
  "Japanese",
  "American",
  "Middle Eastern",
  "African",
];

const CATEGORIES = ["All", "Main", "Appetizer", "Dessert", "Drink", "Side"];

const DIETS = ["Vegetarian", "Vegan"];

const SORT_OPTIONS = [
  { value: "nearest", label: "Nearest" },
  { value: "rating", label: "Rating" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
];

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface Cook {
  id: string;
  user: { id: string; name: string; avatar: string | null };
  bio: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  neighborhood: string;
  dishCount?: number;
}

interface Dish {
  id: string;
  name: string;
  price: number;
  image: string | null;
  category: string;
  cookProfileId: string;
  rating?: number;
  cookProfile: {
    id: string;
    user: { id: string; name: string; avatar: string | null };
  };
}

/* -------------------------------------------------------------------------- */
/*  Skeletons                                                                  */
/* -------------------------------------------------------------------------- */

function CookSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-stone-200 bg-white p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-14 w-14 rounded-full bg-stone-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded bg-stone-200" />
          <div className="h-3 w-24 rounded bg-stone-100" />
        </div>
      </div>
      <div className="h-3 w-full rounded bg-stone-100 mb-2" />
      <div className="h-3 w-3/4 rounded bg-stone-100 mb-4" />
      <div className="flex gap-2">
        <div className="h-6 w-16 rounded-full bg-stone-100" />
        <div className="h-6 w-16 rounded-full bg-stone-100" />
        <div className="h-6 w-16 rounded-full bg-stone-100" />
      </div>
    </div>
  );
}

function DishSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-stone-200 bg-white overflow-hidden">
      <div className="aspect-[4/3] bg-stone-200" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-3/4 rounded bg-stone-200" />
        <div className="h-3 w-1/2 rounded bg-stone-100" />
        <div className="flex justify-between items-center mt-3">
          <div className="h-5 w-16 rounded bg-stone-200" />
          <div className="h-8 w-8 rounded-lg bg-stone-200" />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page Component                                                             */
/* -------------------------------------------------------------------------- */

export default function ExplorePage() {
  // View mode
  const [viewMode, setViewMode] = useState<"cooks" | "dishes">("dishes");

  // Search
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Filters
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50]);
  const [sortBy, setSortBy] = useState("rating");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Data
  const [cooks, setCooks] = useState<Cook[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

  // Cart
  const addItem = useCartStore((s) => s.addItem);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();

    if (debouncedQuery) params.set("q", debouncedQuery);
    if (selectedCuisines.length) params.set("cuisines", selectedCuisines.join(","));
    if (selectedCategory !== "All") params.set("category", selectedCategory);
    if (selectedDiets.length) params.set("diet", selectedDiets.join(","));
    if (sortBy) params.set("sort", sortBy);
    params.set("minPrice", String(priceRange[0]));
    params.set("maxPrice", String(priceRange[1]));

    try {
      const endpoint = viewMode === "cooks" ? "/api/cooks" : "/api/dishes";
      const res = await fetch(`${endpoint}?${params.toString()}`);
      const json = await res.json();

      if (viewMode === "cooks") {
        setCooks(json.data ?? []);
      } else {
        setDishes(json.data ?? []);
      }
    } catch {
      // Silently handle fetch errors
    } finally {
      setLoading(false);
    }
  }, [viewMode, debouncedQuery, selectedCuisines, selectedCategory, selectedDiets, priceRange, sortBy]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleCuisine = (c: string) => {
    setSelectedCuisines((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const toggleDiet = (d: string) => {
    setSelectedDiets((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const clearFilters = () => {
    setSelectedCuisines([]);
    setSelectedCategory("All");
    setSelectedDiets([]);
    setPriceRange([0, 50]);
    setSortBy("rating");
    setQuery("");
  };

  const hasActiveFilters =
    selectedCuisines.length > 0 ||
    selectedCategory !== "All" ||
    selectedDiets.length > 0 ||
    priceRange[0] !== 0 ||
    priceRange[1] !== 50;

  const handleAddToCart = (dish: Dish) => {
    addItem({
      dishId: dish.id,
      name: dish.name,
      price: dish.price,
      quantity: 1,
      cookProfileId: dish.cookProfileId,
      image: dish.image ?? undefined,
    });
  };

  /* ─── Render ──────────────────────────────────────────────────────── */

  return (
    <main className="min-h-screen bg-stone-50">
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1 max-w-2xl">
              <Input
                placeholder="Search cooks, dishes, cuisines..."
                icon={<Search className="h-4 w-4" />}
                variant="filled"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {/* Filter toggle (mobile) */}
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="lg:hidden flex items-center gap-2 rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs text-white">
                  !
                </span>
              )}
            </button>

            {/* View toggle */}
            <div className="hidden sm:flex items-center gap-1 rounded-lg border border-stone-200 p-1 bg-stone-50">
              <button
                onClick={() => setViewMode("dishes")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === "dishes"
                    ? "bg-white text-orange-600 shadow-sm"
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                Dishes
              </button>
              <button
                onClick={() => setViewMode("cooks")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === "cooks"
                    ? "bg-white text-orange-600 shadow-sm"
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                <Users className="h-4 w-4" />
                Cooks
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <div className="flex gap-8">
          {/* ─── Sidebar Filters ──────────────────────────────────────── */}
          <aside
            className={`${
              filtersOpen ? "fixed inset-0 z-40 bg-black/40 lg:static lg:bg-transparent" : ""
            } lg:block`}
          >
            <div
              className={`${
                filtersOpen
                  ? "fixed right-0 top-0 h-full w-80 overflow-y-auto bg-white p-6 shadow-xl animate-slide-up lg:static lg:shadow-none lg:animate-none"
                  : "hidden lg:block"
              } w-64 shrink-0 space-y-6`}
            >
              {/* Mobile close */}
              {filtersOpen && (
                <div className="flex items-center justify-between lg:hidden mb-4">
                  <h3 className="font-semibold text-stone-900">Filters</h3>
                  <button onClick={() => setFiltersOpen(false)}>
                    <X className="h-5 w-5 text-stone-500" />
                  </button>
                </div>
              )}

              {/* Mobile view toggle */}
              <div className="sm:hidden flex items-center gap-1 rounded-lg border border-stone-200 p-1 bg-stone-50">
                <button
                  onClick={() => setViewMode("dishes")}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    viewMode === "dishes"
                      ? "bg-white text-orange-600 shadow-sm"
                      : "text-stone-500"
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                  Dishes
                </button>
                <button
                  onClick={() => setViewMode("cooks")}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    viewMode === "cooks"
                      ? "bg-white text-orange-600 shadow-sm"
                      : "text-stone-500"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Cooks
                </button>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Sort by
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cuisine */}
              <div>
                <h4 className="text-sm font-medium text-stone-700 mb-3">
                  Cuisine
                </h4>
                <div className="space-y-2">
                  {CUISINES.map((c) => (
                    <label
                      key={c}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCuisines.includes(c)}
                        onChange={() => toggleCuisine(c)}
                        className="h-4 w-4 rounded border-stone-300 text-orange-500 focus:ring-orange-500/20"
                      />
                      <span className="text-sm text-stone-600 group-hover:text-stone-900 transition-colors">
                        {c}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category (dishes only) */}
              {viewMode === "dishes" && (
                <div>
                  <h4 className="text-sm font-medium text-stone-700 mb-3">
                    Category
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                          selectedCategory === cat
                            ? "bg-orange-500 text-white"
                            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Diet */}
              <div>
                <h4 className="text-sm font-medium text-stone-700 mb-3">
                  Dietary
                </h4>
                <div className="space-y-2">
                  {DIETS.map((d) => (
                    <label
                      key={d}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedDiets.includes(d)}
                        onChange={() => toggleDiet(d)}
                        className="h-4 w-4 rounded border-stone-300 text-orange-500 focus:ring-orange-500/20"
                      />
                      <span className="text-sm text-stone-600 group-hover:text-stone-900 transition-colors">
                        {d}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price range */}
              {viewMode === "dishes" && (
                <div>
                  <h4 className="text-sm font-medium text-stone-700 mb-3">
                    Price range
                  </h4>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min={0}
                      max={50}
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], Number(e.target.value)])
                      }
                      className="w-full accent-orange-500"
                    />
                    <div className="flex items-center justify-between text-sm text-stone-500">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}+</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Clear filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full rounded-lg border border-stone-300 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  Clear all filters
                </button>
              )}

              {/* Mobile apply */}
              {filtersOpen && (
                <div className="lg:hidden pt-4">
                  <Button
                    className="w-full"
                    onClick={() => setFiltersOpen(false)}
                  >
                    Show results
                  </Button>
                </div>
              )}
            </div>
          </aside>

          {/* ─── Results ──────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Active filter badges */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-4 animate-fade-in">
                {selectedCuisines.map((c) => (
                  <Badge key={c} removable onRemove={() => toggleCuisine(c)}>
                    {c}
                  </Badge>
                ))}
                {selectedCategory !== "All" && (
                  <Badge
                    removable
                    onRemove={() => setSelectedCategory("All")}
                  >
                    {selectedCategory}
                  </Badge>
                )}
                {selectedDiets.map((d) => (
                  <Badge key={d} removable onRemove={() => toggleDiet(d)}>
                    {d}
                  </Badge>
                ))}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div
                className={`grid gap-6 ${
                  viewMode === "dishes"
                    ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1 sm:grid-cols-2"
                }`}
              >
                {viewMode === "dishes"
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <DishSkeleton key={i} />
                    ))
                  : Array.from({ length: 4 }).map((_, i) => (
                      <CookSkeleton key={i} />
                    ))}
              </div>
            )}

            {/* Empty state */}
            {!loading &&
              ((viewMode === "cooks" && cooks.length === 0) ||
                (viewMode === "dishes" && dishes.length === 0)) && (
                <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-stone-100 mb-6">
                    <Frown className="h-10 w-10 text-stone-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-stone-900 mb-2">
                    No results found
                  </h3>
                  <p className="text-stone-500 text-center max-w-sm mb-6">
                    We could not find any {viewMode === "cooks" ? "cooks" : "dishes"}{" "}
                    matching your filters. Try adjusting your search or filters.
                  </p>
                  <Button variant="secondary" onClick={clearFilters}>
                    Clear all filters
                  </Button>
                </div>
              )}

            {/* ─── Cook Results ────────────────────────────────────────── */}
            {!loading && viewMode === "cooks" && cooks.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {cooks.map((cook, i) => (
                  <Link
                    href={`/cook/${cook.id}`}
                    key={cook.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
                  >
                    <Card
                      padding="lg"
                      clickable
                      className="h-full hover:border-orange-200 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <Avatar
                          src={cook.user.avatar}
                          name={cook.user.name}
                          size="lg"
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-stone-900 truncate">
                            {cook.user.name}
                          </h3>
                          <div className="flex items-center gap-1 text-sm text-stone-500 mt-0.5">
                            <MapPin className="h-3.5 w-3.5" />
                            {cook.neighborhood}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <StarRating value={cook.rating} size="sm" />
                            <span className="text-sm font-medium text-stone-700">
                              {cook.rating.toFixed(1)}
                            </span>
                            <span className="text-xs text-stone-400">
                              ({cook.reviewCount})
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="mt-3 text-sm text-stone-500 line-clamp-2">
                        {cook.bio}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {cook.specialties.slice(0, 4).map((s) => (
                          <Badge key={s} size="sm">
                            {s}
                          </Badge>
                        ))}
                        {cook.dishCount !== undefined && (
                          <Badge variant="info" size="sm">
                            <Utensils className="h-3 w-3" />
                            {cook.dishCount} dishes
                          </Badge>
                        )}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {/* ─── Dish Results ────────────────────────────────────────── */}
            {!loading && viewMode === "dishes" && dishes.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {dishes.map((dish, i) => (
                  <div
                    key={dish.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
                  >
                    <Card className="group h-full">
                      <div className="aspect-[4/3] w-full overflow-hidden bg-stone-100">
                        {dish.image ? (
                          <img
                            src={dish.image}
                            alt={dish.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
                            <Utensils className="h-10 w-10 text-orange-300" />
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold text-stone-900 truncate">
                          {dish.name}
                        </h3>
                        <Link
                          href={`/cook/${dish.cookProfile.id}`}
                          className="text-sm text-stone-500 hover:text-orange-600 transition-colors"
                        >
                          by {dish.cookProfile.user.name}
                        </Link>

                        {dish.rating !== undefined && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                            <span className="text-xs text-stone-500">
                              {dish.rating.toFixed(1)}
                            </span>
                          </div>
                        )}

                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-lg font-bold text-orange-600">
                            ${dish.price.toFixed(2)}
                          </span>
                          <button
                            onClick={() => handleAddToCart(dish)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-white shadow-sm transition-all hover:bg-orange-600 hover:shadow active:scale-95"
                            aria-label={`Add ${dish.name} to cart`}
                          >
                            <Plus className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
