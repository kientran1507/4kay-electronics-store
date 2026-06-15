"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import formatVND from "@/app/utils/formatCurrency";
import { RecommendedProduct } from "@/types";
import { Button } from "@/components/ui/button";

interface KioskProductShelfProps {
  products: RecommendedProduct[];
  onAdd: (productId: string) => void;
  onCompare: (productId: string) => void;
  onAskWhy: (productName: string) => void;
}

const KioskProductShelf = ({ products, onAdd, onCompare, onAskWhy }: KioskProductShelfProps) => {
  if (!products.length) return null;

  return (
    <div className="grid gap-3 xl:grid-cols-2">
      {products.map((item) => (
        <div key={item.product._id} className="rounded-lg border bg-white p-3 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
          <div className="relative aspect-square overflow-hidden rounded-md bg-gray-100">
            {item.product.image && (
              <Image src={item.product.image} alt={item.product.name} fill className="object-cover" sizes="220px" />
            )}
          </div>
          <div>
            <p className="line-clamp-2 text-base font-semibold text-gray-950">{item.product.name}</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{formatVND(item.product.price)}</p>
            <p className="text-xs text-gray-500">{item.product.stock > 0 ? `Stock: ${item.product.stock}` : "Out of stock"}</p>
            {item.product.specs && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {Object.entries(item.product.specs).slice(0, 4).map(([key, value]) => (
                  <span key={key} className="rounded-full bg-gray-100 px-2 py-1 text-[11px] text-gray-700">
                    {key}: {value}
                  </span>
                ))}
              </div>
            )}
          </div>
          </div>
          <div className="mt-3 space-y-2 text-xs text-gray-700">
            <p><span className="font-semibold text-gray-950">Why this fits:</span> {item.reason}</p>
            <p><span className="font-semibold text-gray-950">Trade-off:</span> {item.tradeoff || "It may not be the strongest choice for every use case, so compare it with the alternatives before buying."}</p>
            <p><span className="font-semibold text-gray-950">Best for:</span> {item.bestFor}</p>
            {(item.comparisonNote || item.betterThan) && (
              <p><span className="font-semibold text-gray-950">Compared with:</span> {item.comparisonNote || item.betterThan}</p>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link href={`/product/${item.product._id}`}>View detail</Link>
            </Button>
            <Button size="sm" onClick={() => onAdd(item.product._id)}>
              <ShoppingCart className="mr-1 h-3.5 w-3.5" />
              Add
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onCompare(item.product._id)}>Compare</Button>
            <Button size="sm" variant="ghost" onClick={() => onAskWhy(item.product.name)}>Ask why</Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KioskProductShelf;
