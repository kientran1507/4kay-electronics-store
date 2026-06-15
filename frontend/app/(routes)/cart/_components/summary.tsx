"use client";

import { useState } from "react";
import { CreditCard, ShieldCheck, Truck } from "lucide-react";
import formatVND from "@/app/utils/formatCurrency";
import useCart from "@/hooks/use-cart";
import CheckoutModal from "./checkout-modal";

export default function Summary({ itemCount }: { itemCount: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const totalCartPrice = useCart((state) => state.totalCartPrice);

  return (
    <aside className="sticky top-24 rounded-xl border border-[#eadcc8] bg-white p-6 shadow-[0_16px_40px_rgba(87,61,25,0.08)]">
      <h2 className="text-xl font-bold">Order summary</h2>
      <div className="mt-6 space-y-4 text-sm">
        <div className="flex justify-between text-[#6b7280]">
          <span>Subtotal ({itemCount} items)</span>
          <span className="font-medium text-[#111827]">{formatVND(totalCartPrice)}</span>
        </div>
        <div className="flex justify-between text-[#6b7280]">
          <span>Standard delivery</span>
          <span className="font-semibold text-emerald-700">Free</span>
        </div>
        <div className="border-t border-[#eadcc8] pt-4">
          <div className="flex items-end justify-between">
            <span className="font-semibold">Total</span>
            <span className="text-2xl font-bold">{formatVND(totalCartPrice)}</span>
          </div>
          <p className="mt-1 text-right text-xs text-[#8b8176]">VAT included where applicable</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#171717] text-sm font-semibold text-white hover:bg-[#c87916]"
      >
        <CreditCard className="h-4 w-4" />
        Continue to checkout
      </button>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#eadcc8] pt-5 text-xs text-[#6b7280]">
        <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#c87916]" /> Secure payment</span>
        <span className="flex items-center gap-2"><Truck className="h-4 w-4 text-[#c87916]" /> Fast delivery</span>
      </div>

      <CheckoutModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        totalPrice={totalCartPrice}
      />
    </aside>
  );
}
