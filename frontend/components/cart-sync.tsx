"use client";

import { useEffect } from "react";
import { useAuth } from "@/app/utils/authContext";
import useCart from "@/hooks/use-cart";

export default function CartSync() {
  const { user, loading } = useAuth();
  const syncCart = useCart((state) => state.syncCart);
  const clearCart = useCart((state) => state.removeAllCart);

  useEffect(() => {
    if (loading) return;
    if (user?.token) {
      void syncCart(user.token);
    } else {
      clearCart();
    }
  }, [clearCart, loading, syncCart, user?.token]);

  return null;
}
