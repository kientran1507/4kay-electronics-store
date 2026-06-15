"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const PRICE_RANGES = [
  { value: "", label: "All Prices" },
  { value: "under1m", label: "Under 1M" },
  { value: "1mTo3m", label: "1M to 3M" },
  { value: "3mTo10m", label: "3M to 10M" },
  { value: "10mTo20m", label: "10M to 20M" },
  { value: "above20m", label: "Over 20M" }
];

const PriceRangeSelect = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentRange = searchParams.get("priceRange") || "";

  const handlePriceRangeChange = useCallback((range: string) => {
    const params = new URLSearchParams(searchParams);
    if (range === currentRange) {
      params.delete("priceRange");
    } else {
      params.set("priceRange", range);
    }
    params.set("page", "1"); // Reset to first page
    router.replace(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams, currentRange]);

  return (
    <div className="flex flex-col gap-2 mt-2">
      {PRICE_RANGES.map(range => (
        <button
          key={range.value}
          onClick={() => handlePriceRangeChange(range.value)}
          className={`px-3 py-2 text-sm text-left border rounded-md transition-colors
            ${currentRange === range.value 
              ? 'bg-black text-white' 
              : 'bg-white hover:bg-gray-100'
            }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
};

export default PriceRangeSelect;