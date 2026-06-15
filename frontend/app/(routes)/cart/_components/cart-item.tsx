import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import formatVND from "@/app/utils/formatCurrency";
import useCart from "@/hooks/use-cart";
import { type CartItem as CartItemType } from "@/types";

interface CartItemProps {
  data: CartItemType;
}

export default function CartItem({ data }: CartItemProps) {
  const cart = useCart();
  const itemTotal = data.price * data.quantity;

  return (
    <li className="grid gap-4 p-4 sm:grid-cols-[120px_minmax(0,1fr)_auto] sm:items-center sm:p-5">
      <Link href={`/product/${data.productId}`} className="relative h-28 overflow-hidden rounded-lg bg-[#fff4e6] sm:h-28">
        <Image
          fill
          src={data.image || "/placeholder-image.jpg"}
          alt={data.name || "Product"}
          className="object-contain p-2"
          sizes="120px"
        />
      </Link>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase text-[#c87916]">{data.category}</p>
        <Link href={`/product/${data.productId}`} className="mt-1 block truncate text-base font-semibold hover:text-[#c87916]">
          {data.name}
        </Link>
        <p className="mt-2 text-sm text-[#6b7280]">{formatVND(data.price)} each</p>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex h-10 items-center rounded-lg border border-[#eadcc8] bg-[#fffdf9]">
            <button
              type="button"
              onClick={() => cart.removeItem(data.productId)}
              aria-label={`Decrease ${data.name} quantity`}
              className="flex h-10 w-10 items-center justify-center text-[#6b7280] hover:text-[#c87916]"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-9 text-center text-sm font-semibold">{data.quantity}</span>
            <button
              type="button"
              onClick={() => cart.addItem(data.productId)}
              aria-label={`Increase ${data.name} quantity`}
              className="flex h-10 w-10 items-center justify-center text-[#6b7280] hover:text-[#c87916]"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => cart.removeAll(data.productId)}
            className="inline-flex h-10 items-center gap-2 px-2 text-sm text-[#6b7280] hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Remove</span>
          </button>
        </div>
      </div>

      <div className="flex items-end justify-between border-t border-[#f0e6d8] pt-4 sm:h-full sm:flex-col sm:border-0 sm:pt-0">
        <span className="text-xs text-[#8b8176]">Item total</span>
        <p className="text-lg font-bold">{formatVND(itemTotal)}</p>
      </div>
    </li>
  );
}
