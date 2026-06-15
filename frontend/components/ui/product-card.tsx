"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Product } from "@/types";
import formatVND from "@/app/utils/formatCurrency";

interface ProductCardProps {
  data: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ data }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/product/${data._id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white group cursor-pointer rounded-xl border p-3 space-y-4 relative"
    >
      {/* Image Section */}
      <div className="aspect-square rounded-xl bg-gray-100 relative overflow-hidden">
        <Image
          src={data.image}
          alt={data.name || "Product Image"}
          fill
          className="aspect-square object-cover rounded-md opacity-0 hover:opacity-100 transform scale-100 hover:scale-110 duration-300 transition-all"
          onLoad={(event: React.SyntheticEvent<HTMLImageElement, Event>) =>
            event.currentTarget.classList.remove("opacity-0")
          }
          sizes="any"
        />
        {/* Optional Overlay */}
        <div className="opacity-0 group-hover:opacity-100 transition absolute w-full px-6 bottom-5">
          <div className="flex gap-x-6 justify-center"></div>
        </div>
      </div>

      {/* Product Info Section */}
      <div>
        <div className="min-h-[4rem]">
          <p className="font-semibold text-lg">{data.name}</p>
        </div>
        <p className="text-sm text-gray-500">
          {data.category.charAt(0).toUpperCase() + data.category.slice(1)}
        </p>
      </div>

      {/* Price Section */}
      <div className="flex items-center justify-between">
        <div className="font-semibold">{formatVND(data.price)}</div>
        <div className="text-sm text-gray-500">
          {data.stock > 0 ? `Còn ${data.stock}` : 'Hết hàng'}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
