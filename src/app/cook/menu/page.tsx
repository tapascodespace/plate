"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  ImageIcon,
  Flame,
  Leaf,
  Sprout,
  Clock,
  Users,
  Search,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  cuisine: string;
  tags: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  spiceLevel: number;
  servingSize: string;
  prepTime: number;
  isAvailable: boolean;
  imageUrl?: string;
}

interface DishForm {
  name: string;
  description: string;
  price: string;
  category: string;
  cuisine: string;
  tags: string;
  isVegetarian: boolean;
  isVegan: boolean;
  spiceLevel: number;
  servingSize: string;
  prepTime: string;
}

const emptyForm: DishForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  cuisine: "",
  tags: "",
  isVegetarian: false,
  isVegan: false,
  spiceLevel: 0,
  servingSize: "",
  prepTime: "",
};

const categories = [
  "Appetizer",
  "Main Course",
  "Side Dish",
  "Dessert",
  "Snack",
  "Beverage",
  "Breakfast",
  "Lunch Special",
];

const cuisines = [
  "Indian",
  "Italian",
  "Mexican",
  "Chinese",
  "Japanese",
  "Thai",
  "Mediterranean",
  "American",
  "French",
  "Korean",
  "Vietnamese",
  "Ethiopian",
  "Other",
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-stone-200 rounded-lg ${className}`} />;
}

const spiceLabels = ["None", "Mild", "Medium", "Medium-Hot", "Hot", "Extra Hot"];

/* ------------------------------------------------------------------ */
/*  Modal                                                              */
/* ------------------------------------------------------------------ */

function DishModal({
  isOpen,
  onClose,
  onSubmit,
  form,
  setForm,
  title,
  saving,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  form: DishForm;
  setForm: (f: DishForm) => void;
  title: string;
  saving: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <h3 className="text-lg font-bold text-stone-800">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form body */}
        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Dish Name *</label>
            <Input
              value={form.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Butter Chicken"
              className="w-full border-stone-300 focus:border-orange-400 focus:ring-orange-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe your dish, ingredients, what makes it special..."
              rows={3}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm
                focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 resize-none"
            />
          </div>

          {/* Price + Category + Cuisine row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Price ($) *</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, price: e.target.value })}
                placeholder="12.99"
                className="w-full border-stone-300 focus:border-orange-400 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white
                  focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
              >
                <option value="">Select...</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Cuisine *</label>
              <select
                value={form.cuisine}
                onChange={(e) => setForm({ ...form, cuisine: e.target.value })}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white
                  focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
              >
                <option value="">Select...</option>
                {cuisines.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Tags <span className="text-stone-400 font-normal">(comma separated)</span>
            </label>
            <Input
              value={form.tags}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, tags: e.target.value })}
              placeholder="spicy, gluten-free, family-style"
              className="w-full border-stone-300 focus:border-orange-400 focus:ring-orange-400"
            />
          </div>

          {/* Toggles row */}
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <button
                type="button"
                onClick={() => setForm({ ...form, isVegetarian: !form.isVegetarian })}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  form.isVegetarian ? "bg-green-500" : "bg-stone-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    form.isVegetarian ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
              <Leaf className="w-4 h-4 text-green-600" />
              <span className="text-sm text-stone-700">Vegetarian</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <button
                type="button"
                onClick={() => setForm({ ...form, isVegan: !form.isVegan })}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  form.isVegan ? "bg-green-500" : "bg-stone-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    form.isVegan ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
              <Sprout className="w-4 h-4 text-green-600" />
              <span className="text-sm text-stone-700">Vegan</span>
            </label>
          </div>

          {/* Spice level */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              <Flame className="w-4 h-4 inline mr-1 text-red-500" />
              Spice Level: <span className="text-orange-600">{spiceLabels[form.spiceLevel]}</span>
            </label>
            <input
              type="range"
              min={0}
              max={5}
              value={form.spiceLevel}
              onChange={(e) => setForm({ ...form, spiceLevel: Number(e.target.value) })}
              className="w-full accent-orange-500"
            />
            <div className="flex justify-between text-xs text-stone-400 mt-1">
              <span>None</span>
              <span>Extra Hot</span>
            </div>
          </div>

          {/* Serving size + Prep time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                <Users className="w-4 h-4 inline mr-1 text-stone-400" />
                Serving Size
              </label>
              <Input
                value={form.servingSize}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, servingSize: e.target.value })}
                placeholder="e.g. Serves 2, 350g"
                className="w-full border-stone-300 focus:border-orange-400 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                <Clock className="w-4 h-4 inline mr-1 text-stone-400" />
                Prep Time (minutes)
              </label>
              <Input
                type="number"
                min="0"
                value={form.prepTime}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, prepTime: e.target.value })}
                placeholder="30"
                className="w-full border-stone-300 focus:border-orange-400 focus:ring-orange-400"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-stone-100">
          <Button
            onClick={onClose}
            className="border border-stone-300 bg-white hover:bg-stone-50 text-stone-700"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={saving || !form.name || !form.price || !form.category || !form.cuisine}
            className="bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Dish"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Delete confirmation                                                */
/* ------------------------------------------------------------------ */

function DeleteConfirmModal({
  isOpen,
  dishName,
  onConfirm,
  onCancel,
  deleting,
}: {
  isOpen: boolean;
  dishName: string;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 z-10 text-center">
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-stone-800 mb-2">Delete Dish</h3>
        <p className="text-stone-500 text-sm mb-6">
          Are you sure you want to delete <strong className="text-stone-700">{dishName}</strong>?
          This cannot be undone.
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={onCancel}
            className="border border-stone-300 bg-white hover:bg-stone-50 text-stone-700"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={deleting}
            className="bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CookMenuPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [form, setForm] = useState<DishForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Dish | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toggling availability
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchDishes = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/cook/profile");
      if (!res.ok) throw new Error("Failed to load menu");
      const data = await res.json();
      setDishes(data.cookProfile?.dishes ?? data.dishes ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDishes();
  }, [fetchDishes]);

  /* ---- Open modal helpers ---- */
  const openAddModal = () => {
    setEditingDish(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (dish: Dish) => {
    setEditingDish(dish);
    setForm({
      name: dish.name,
      description: dish.description,
      price: String(dish.price),
      category: dish.category,
      cuisine: dish.cuisine,
      tags: dish.tags.join(", "),
      isVegetarian: dish.isVegetarian,
      isVegan: dish.isVegan,
      spiceLevel: dish.spiceLevel,
      servingSize: dish.servingSize,
      prepTime: String(dish.prepTime),
    });
    setModalOpen(true);
  };

  /* ---- Save (create / update) ---- */
  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        category: form.category,
        cuisine: form.cuisine,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        isVegetarian: form.isVegetarian,
        isVegan: form.isVegan,
        spiceLevel: form.spiceLevel,
        servingSize: form.servingSize.trim(),
        prepTime: parseInt(form.prepTime, 10) || 0,
      };

      const url = editingDish ? `/api/dishes/${editingDish.id}` : "/api/dishes";
      const method = editingDish ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save dish");

      setModalOpen(false);
      fetchDishes();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  /* ---- Delete ---- */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/dishes/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete dish");
      setDeleteTarget(null);
      fetchDishes();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  /* ---- Toggle availability ---- */
  const toggleAvailability = async (dish: Dish) => {
    setTogglingId(dish.id);
    try {
      const res = await fetch(`/api/dishes/${dish.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !dish.isAvailable }),
      });
      if (!res.ok) throw new Error("Failed to update availability");
      setDishes((prev) =>
        prev.map((d) => (d.id === dish.id ? { ...d, isAvailable: !d.isAvailable } : d))
      );
    } catch {
      alert("Could not update availability");
    } finally {
      setTogglingId(null);
    }
  };

  /* ---- Filter ---- */
  const filtered = dishes.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.category.toLowerCase().includes(search.toLowerCase()) ||
      d.cuisine.toLowerCase().includes(search.toLowerCase())
  );

  /* ---- Loading ---- */
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-36" />
        </div>
        <Skeleton className="h-10 w-full max-w-sm" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-stone-600 font-medium">{error}</p>
        <Button onClick={fetchDishes} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
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
          <h1 className="text-2xl font-bold text-stone-800">Menu</h1>
          <p className="text-stone-500 text-sm mt-1">
            {dishes.length} {dishes.length === 1 ? "dish" : "dishes"} in your menu
          </p>
        </div>
        <Button
          onClick={openAddModal}
          className="bg-orange-500 hover:bg-orange-600 text-white gap-2 shadow-sm self-start"
        >
          <Plus className="w-4 h-4" /> Add New Dish
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <Input
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          placeholder="Search dishes..."
          className="pl-9 border-stone-300 focus:border-orange-400 focus:ring-orange-400"
        />
      </div>

      {/* Dishes grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <ImageIcon className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 font-medium">
            {search ? "No dishes match your search" : "No dishes yet"}
          </p>
          {!search && (
            <Button
              onClick={openAddModal}
              className="mt-4 bg-orange-500 hover:bg-orange-600 text-white gap-2"
            >
              <Plus className="w-4 h-4" /> Add Your First Dish
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((dish) => (
            <div
              key={dish.id}
              className={`bg-white rounded-xl border overflow-hidden hover:shadow-md transition-shadow ${
                dish.isAvailable ? "border-stone-200" : "border-stone-200 opacity-70"
              }`}
            >
              {/* Image placeholder */}
              <div className="h-40 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center relative">
                {dish.imageUrl ? (
                  <img
                    src={dish.imageUrl}
                    alt={dish.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-10 h-10 text-orange-200" />
                )}
                {!dish.isAvailable && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                    <span className="bg-stone-800 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Unavailable
                    </span>
                  </div>
                )}
                {/* Diet badges */}
                <div className="absolute top-2 left-2 flex gap-1.5">
                  {dish.isVegetarian && (
                    <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <Leaf className="w-3 h-3" /> Veg
                    </span>
                  )}
                  {dish.isVegan && (
                    <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <Sprout className="w-3 h-3" /> Vegan
                    </span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-stone-800 truncate">{dish.name}</h3>
                  <span className="text-orange-600 font-bold text-sm whitespace-nowrap">
                    ${dish.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-400 mb-3">
                  <span className="bg-stone-100 px-2 py-0.5 rounded-full">{dish.category}</span>
                  <span className="bg-stone-100 px-2 py-0.5 rounded-full">{dish.cuisine}</span>
                  {dish.spiceLevel > 0 && (
                    <span className="flex items-center gap-0.5 text-red-500">
                      <Flame className="w-3 h-3" />
                      {dish.spiceLevel}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                  <button
                    onClick={() => toggleAvailability(dish)}
                    disabled={togglingId === dish.id}
                    className="flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-700 transition-colors"
                  >
                    {dish.isAvailable ? (
                      <ToggleRight className="w-5 h-5 text-green-500" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-stone-400" />
                    )}
                    {dish.isAvailable ? "Available" : "Unavailable"}
                  </button>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditModal(dish)}
                      className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(dish)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit modal */}
      <DishModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSave}
        form={form}
        setForm={setForm}
        title={editingDish ? "Edit Dish" : "Add New Dish"}
        saving={saving}
      />

      {/* Delete confirmation */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        dishName={deleteTarget?.name ?? ""}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        deleting={deleting}
      />
    </div>
  );
}
