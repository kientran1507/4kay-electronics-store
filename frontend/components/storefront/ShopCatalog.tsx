"use client";

import { SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import StoreProductCard from "./ProductCard";
import type { Product } from "@/types";

const categoryFilters = ["Phones", "Laptops", "Tablets", "Accessories", "Audio", "Keyboards", "Mice"];
const brandFilters = ["Apple", "Samsung", "OPPO", "Xiaomi", "Others"];
const priceFilters = [
  { label: "Under 10.000.000 ₫", min: 0, max: 10_000_000 },
  { label: "10.000.000 ₫ – 20.000.000 ₫", min: 10_000_000, max: 20_000_000 },
  { label: "20.000.000 ₫ – 30.000.000 ₫", min: 20_000_000, max: 30_000_000 },
  { label: "Over 30.000.000 ₫", min: 30_000_000, max: Infinity },
];

const categoryMatch = (product: Product, category: string) => {
  const text = `${product.name} ${product.category}`.toLowerCase();
  const terms: Record<string, string[]> = {
    Phones: ["phone", "iphone", "điện thoại", "galaxy", "oppo"],
    Laptops: ["laptop", "macbook"],
    Tablets: ["tablet", "ipad", "máy tính bảng"],
    Accessories: ["access", "phụ kiện", "charger", "cable"],
    Audio: ["audio", "headphone", "airpods", "tai nghe"],
    Keyboards: ["keyboard", "bàn phím"],
    Mice: ["mouse", "mice", "chuột"],
  };
  return terms[category]?.some((term) => text.includes(term));
};

export default function ShopCatalog({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [priceIndex, setPriceIndex] = useState<number | null>(null);
  const [sort, setSort] = useState("popular");
  const [page, setPage] = useState(1);
  const query = (searchParams.get("q") || "").toLowerCase();

  const visible = useMemo(() => {
    let result = products.filter((product) => !query || `${product.name} ${product.category}`.toLowerCase().includes(query));
    if (categories.length) result = result.filter((product) => categories.some((category) => categoryMatch(product, category)));
    if (brands.length) result = result.filter((product) => {
      const brand = brandFilters.find((item) => item !== "Others" && product.name.toLowerCase().includes(item.toLowerCase())) || "Others";
      return brands.includes(brand);
    });
    if (priceIndex !== null) {
      const range = priceFilters[priceIndex];
      result = result.filter((product) => product.price >= range.min && product.price < range.max);
    }
    if (sort === "low") result.sort((a, b) => a.price - b.price);
    if (sort === "high") result.sort((a, b) => b.price - a.price);
    if (sort === "newest") result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return result;
  }, [brands, categories, priceIndex, products, query, sort]);
  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(visible.length / pageSize));
  const pageProducts = visible.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [brands, categories, priceIndex, query, sort]);

  const toggle = (value: string, list: string[], setter: (next: string[]) => void) =>
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);

  const filters = (
    <div className="space-y-6">
      <FilterGroup title="Category">
        {categoryFilters.map((category) => <Check key={category} label={category} checked={categories.includes(category)} onChange={() => toggle(category, categories, setCategories)} />)}
      </FilterGroup>
      <FilterGroup title="Price Range">
        {priceFilters.map((range, index) => <Check key={range.label} radio label={range.label} checked={priceIndex === index} onChange={() => setPriceIndex(priceIndex === index ? null : index)} />)}
      </FilterGroup>
      <FilterGroup title="Brand">
        {brandFilters.map((brand) => <Check key={brand} label={brand} checked={brands.includes(brand)} onChange={() => toggle(brand, brands, setBrands)} />)}
      </FilterGroup>
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
      <aside className="hidden rounded-2xl border border-[#eadcc8] bg-white p-5 lg:block">{filters}</aside>
      <div className="min-w-0">
        <details className="mb-4 rounded-2xl border border-[#eadcc8] bg-white p-4 lg:hidden">
          <summary className="flex cursor-pointer list-none items-center gap-2 font-semibold"><SlidersHorizontal className="h-4 w-4" /> Filters</summary>
          <div className="mt-5">{filters}</div>
        </details>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[#6b7280]">Showing {visible.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, visible.length)} of {visible.length} products</p>
          <select value={sort} onChange={(event) => setSort(event.target.value)} className="h-11 rounded-xl border border-[#eadcc8] bg-white px-4 text-sm outline-none">
            <option value="popular">Sort by: Popular</option><option value="low">Price: Low to High</option><option value="high">Price: High to Low</option><option value="newest">Newest</option>
          </select>
        </div>
        {visible.length ? <><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">{pageProducts.map((product) => <StoreProductCard key={product._id} product={product} />)}</div>{totalPages > 1 && <div className="mt-6 flex justify-center gap-2">{Array.from({ length: totalPages }, (_, index) => index + 1).slice(Math.max(0, page - 3), page + 2).map((number) => <button key={number} onClick={() => setPage(number)} className={`h-9 w-9 rounded-lg border text-sm ${page === number ? "border-[#c87916] bg-[#c87916] text-white" : "border-[#eadcc8] bg-white"}`}>{number}</button>)}</div>}</> : <div className="rounded-2xl border border-[#eadcc8] bg-white p-10 text-center text-[#6b7280]">No products match these filters.</div>}
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h3 className="mb-3 text-sm font-bold">{title}</h3><div className="space-y-2.5">{children}</div></section>;
}

function Check({ label, checked, onChange, radio = false }: { label: string; checked: boolean; onChange: () => void; radio?: boolean }) {
  return <label className="flex cursor-pointer items-center gap-2 text-sm text-[#4b5563]"><input type={radio ? "radio" : "checkbox"} checked={checked} onChange={onChange} className="h-4 w-4 accent-[#c87916]" />{label}</label>;
}
