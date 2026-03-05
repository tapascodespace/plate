import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  /** The cookProfileId all items in the cart belong to, or null if empty. */
  cookProfileId: string | null;

  addItem: (item: CartItem) => void;
  removeItem: (dishId: string) => void;
  updateQuantity: (dishId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      cookProfileId: null,

      addItem: (item: CartItem) => {
        const state = get();

        // If switching to a different cook, clear the cart first
        if (state.cookProfileId && state.cookProfileId !== item.cookProfileId) {
          set({ items: [{ ...item, quantity: item.quantity || 1 }], cookProfileId: item.cookProfileId });
          return;
        }

        const existing = state.items.find((i) => i.dishId === item.dishId);

        if (existing) {
          // Increment quantity for an existing item
          set({
            items: state.items.map((i) =>
              i.dishId === item.dishId
                ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                : i
            ),
          });
        } else {
          // Add new item
          set({
            items: [...state.items, { ...item, quantity: item.quantity || 1 }],
            cookProfileId: item.cookProfileId,
          });
        }
      },

      removeItem: (dishId: string) => {
        const next = get().items.filter((i) => i.dishId !== dishId);
        set({
          items: next,
          cookProfileId: next.length > 0 ? get().cookProfileId : null,
        });
      },

      updateQuantity: (dishId: string, quantity: number) => {
        if (quantity <= 0) {
          // Delegate to removeItem so cookProfileId stays consistent
          get().removeItem(dishId);
          return;
        }

        set({
          items: get().items.map((i) =>
            i.dishId === dishId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => {
        set({ items: [], cookProfileId: null });
      },

      getTotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: "plate-cart",
    }
  )
);
