"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LockKeyhole, ShoppingBag } from "lucide-react";
import { useAuth } from "@/app/utils/authContext";
import Footer from "@/components/footer";
import useCart from "@/hooks/use-cart";
import CartItem from "./_components/cart-item";
import Summary from "./_components/summary";

export default function CartPage() {
  const [isMounted, setIsMounted] = useState(false);
  const cart = useCart();
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (!loading && !isAuthenticated && isMounted) {
      router.push("/customer-sign-in");
    }
  }, [loading, isAuthenticated, isMounted, router]);

  if (!isMounted || loading || !isAuthenticated) return null;

  const items = cart?.items || [];

  return (
    <div className="min-h-screen bg-[#fffaf3] text-[#111827]">
      <main className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mb-8 flex flex-col gap-5 border-b border-[#eadcc8] pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-[#6b7280] hover:text-[#c87916]">
              <ArrowLeft className="h-4 w-4" />
              Continue shopping
            </Link>
            <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Your shopping cart</h1>
            <p className="mt-2 text-sm text-[#6b7280]">
              {items.length} {items.length === 1 ? "item" : "items"} ready for checkout
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-[#eadcc8] bg-white px-3 py-2 text-xs font-medium text-[#59606b]">
            <LockKeyhole className="h-4 w-4 text-[#c87916]" />
            Secure checkout
          </div>
        </div>

        {items.length === 0 ? (
          <section className="flex min-h-[430px] flex-col items-center justify-center rounded-xl border border-[#eadcc8] bg-white px-6 text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#fff4e6] text-[#c87916]">
              <ShoppingBag className="h-9 w-9" />
            </span>
            <h2 className="mt-5 text-2xl font-bold">Your cart is empty</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-[#6b7280]">
              Browse the catalog or ask the AI assistant to find a device that fits your budget.
            </p>
            <Link href="/shop" className="mt-6 rounded-lg bg-[#c87916] px-5 py-3 text-sm font-semibold text-white hover:bg-[#a9600f]">
              Browse products
            </Link>
          </section>
        ) : (
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
            <section className="overflow-hidden rounded-xl border border-[#eadcc8] bg-white">
              <div className="border-b border-[#eadcc8] px-5 py-4">
                <h2 className="font-semibold">Items in your cart</h2>
              </div>
              <ul className="divide-y divide-[#eadcc8]">
                {items.map((item) => (
                  <CartItem key={item.productId} data={item} />
                ))}
              </ul>
            </section>
            <Summary itemCount={items.reduce((sum, item) => sum + item.quantity, 0)} />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
