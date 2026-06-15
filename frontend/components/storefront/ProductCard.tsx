"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { ImageOff } from "lucide-react";
import { useState } from "react";
import useCart from "@/hooks/use-cart";
import formatVND from "@/app/utils/formatCurrency";
import type { Product } from "@/types";

export default function StoreProductCard({ product, horizontal = false }: { product: Product; horizontal?: boolean }) {
  const cart = useCart();
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article className={`group relative flex min-w-0 rounded-2xl border border-[#eadcc8] bg-white p-3 shadow-[0_8px_24px_rgba(120,72,20,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(120,72,20,0.09)] ${horizontal ? "items-center gap-4" : "h-full flex-col"}`}>
      <Link href={`/product/${product._id}`} className={horizontal ? "relative h-24 w-24 shrink-0" : "block"}>
        <div className={`relative overflow-hidden rounded-xl bg-[#fffaf3] ${horizontal ? "h-24 w-24" : "h-44 w-full"}`}>
          {product.image && !imageFailed ? (
            <Image src={product.image} alt={product.name} fill onError={() => setImageFailed(true)} className="object-contain p-2 transition duration-300 group-hover:scale-[1.03]" sizes={horizontal ? "96px" : "240px"} />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[#cbbba6]"><ImageOff className="h-8 w-8" /></span>
          )}
        </div>
      </Link>
      <div className={`min-w-0 ${horizontal ? "flex-1" : "flex flex-1 flex-col pt-3"}`}>
        <Link href={`/product/${product._id}`}>
          <h3 className="line-clamp-2 min-h-10 text-sm font-semibold text-[#111827]">{product.name}</h3>
        </Link>
        <p className="mt-1 text-xs text-[#6b7280]">{product.category}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <p className="text-sm font-bold text-[#111827]">{formatVND(product.price)}</p>
          <button
            type="button"
            onClick={() => cart.addItem(product._id)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#eadcc8] text-[#9a5a08] transition hover:bg-[#fff4e6]"
            title={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
