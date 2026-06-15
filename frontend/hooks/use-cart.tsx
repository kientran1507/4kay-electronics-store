import { create } from "zustand";
import { toast } from "react-hot-toast";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartItem, Cart } from "@/types";
import { createProtectedApi } from "@/lib/apiCalls";

interface CartState {
  items: CartItem[];
  totalCartPrice: number;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  removeAll: (productId: string) => Promise<void>;
  removeAllCart: () => void;
  syncCart: (token: string) => Promise<void>;
  calculateTotals: () => void;
  updateCart: (cart: Cart) => void;
}

const getStoredUser = () => {
  if (typeof window === "undefined") return null;

  try {
    return JSON.parse(window.localStorage.getItem("user") || "null");
  } catch {
    window.localStorage.removeItem("user");
    return null;
  }
};

const useCart = create(
  persist<CartState>(
    (set, get) => ({
      items: [],  // Initialize with empty array
      totalCartPrice: 0,

      calculateTotals: () => {
        const items = get().items || [];  // Add fallback empty array
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        set({ totalCartPrice: total });
      },

      updateCart: (cart: Cart) => {
        set({ items: cart?.items || [] });
        get().calculateTotals();
      },

      syncCart: async (token: string) => {
        try {
          const response = await createProtectedApi(token).cart.get();
          set({
            items: response?.items || [],
            totalCartPrice: response?.totalPrice || 0,
          });
        } catch (error) {
          console.error("Cart synchronization failed:", error);
        }
      },

      addItem: async (productId: string, quantity = 1) => {
        const user = getStoredUser();
        if (!user?.token) {
          toast.error("Please sign in to modify cart");
          return;
        }
        try {
          const api = createProtectedApi(user.token);
          const response = await api.cart.add(productId, quantity);
          if (response?.items) {
            set({ 
              items: response.items,
              totalCartPrice: response.totalPrice || 0 
            });
            toast.success("Cart updated successfully");
          }
        } catch (error) {
          console.error("Cart error:", error);
          toast.error("Failed to update cart");
        }
      },

      removeItem: async (productId: string) => {
        const user = getStoredUser();
        if (!user?.token) {
          toast.error("Please sign in to modify cart");
          return;
        }
        try {
          const api = createProtectedApi(user.token);
          const currentItem = get().items.find(i => i.productId === productId);
          
          if (!currentItem || currentItem.quantity <= 1) {
            return get().removeAll(productId);
          }

          const response = await api.cart.update(productId, currentItem.quantity - 1);
          if (response?.items) {
            set({ 
              items: response.items,
              totalCartPrice: response.totalPrice || 0 
            }); 
            toast.success("Item quantity updated");
          }
        } catch (error) {
          toast.error("Failed to update cart");
          console.error(error);
        }
      },

      removeAll: async (productId: string) => {
        const user = getStoredUser();
        if (!user?.token) {
          toast.error("Please sign in to modify cart");
          return;
        }
        try {
          const api = createProtectedApi(user.token);
          const response = await api.cart.remove(productId);
          
          set({ 
            items: response?.items || [], 
            totalCartPrice: response?.totalPrice || 0 
          });
          toast.success("Item removed from cart");
        } catch (error) {
          toast.error("Failed to remove item from cart");
          console.error(error);
        }
      },

      removeAllCart: () => {
        set({ items: [], totalCartPrice: 0 });
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // Initialize state after rehydration
        if (state) {
          state.calculateTotals();
        }
      },
    }
  )
);

export default useCart;
