"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarItemsProps {
  categories: string[];
}

const SidebarItems = ({ categories }: SidebarItemsProps) => {
  const pathname = usePathname();
  const currentCategory = pathname.split("/").pop();
  const isShopPage = pathname === "/shop";

  return (
    <div className="flex flex-col gap-2 mt-2">
      <Link 
        href="/shop"
        className={cn(
          "px-3 py-2 text-sm text-left border rounded-md transition-colors hover:bg-gray-100",
          isShopPage ? "bg-black text-white hover:bg-black" : ""
        )}
      >
        All Products
      </Link>
      
      {categories.map((category) => (
        <Link 
          key={category}
          href={`/shop/${category}`}
          className={cn(
            "px-3 py-2 text-sm text-left border rounded-md transition-colors hover:bg-gray-100",
            decodeURIComponent(currentCategory || '') === category ? "bg-black text-white hover:bg-black" : ""
          )}
        >
          {category}
        </Link>
      ))}
    </div>
  );
};

export default SidebarItems;
