"use client";

import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useCart from "@/hooks/use-cart";
import { useAuth } from "@/app/utils/authContext";
import { useLocale } from "@/hooks/use-locale";

const NavbarActions = () => {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const cart = useCart();
  const { user } = useAuth();
  const { locale } = useLocale();

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <button
      type="button"
      onClick={() => router.push(user ? "/cart" : "/customer-sign-in")}
      className="relative flex h-9 w-9 items-center justify-center rounded-md hover:bg-[#f7efe4]"
      title={locale === "vi" ? "Giỏ hàng" : "Shopping cart"}
    >
      <ShoppingCart className="h-[18px] w-[18px]" />
      {totalItems > 0 && (
        <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c77918] px-1 text-[9px] font-bold text-white">
          {Math.min(totalItems, 99)}
        </span>
      )}
    </button>
  );
};

export default NavbarActions;
