"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

const sortOptions = [
  { value: "", label: "Relevance" },
  { value: "latest-arrivals", label: "Latest arrivals" },
  { value: "price-low-to-high", label: "Price: Low to high" },
  { value: "price-high-to-low", label: "Price: High to low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" }
];

const SortItems = () => {
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get the current sort value from URL
  const currentSort = searchParams.get("sort") || "";

  const handleSortChange = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams);
    if (!value) {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }

    router.replace(`${pathName}?${params.toString()}`);
  }, [pathName, router, searchParams]);

  return (
    <div className="flex items-center mb-4">
      <div className="flex-grow h-0.5 bg-neutral-800 ml-1 mr-5" />
      <div className="flex items-center">
        <label htmlFor="sort" className="font-semibold text-sm">Sort by</label>
        <select
          id="sort"
          className="ml-2 border border-neutral-800 p-1 text-sm"
          value={currentSort}
          onChange={(e) => handleSortChange(e.target.value)}
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SortItems;
