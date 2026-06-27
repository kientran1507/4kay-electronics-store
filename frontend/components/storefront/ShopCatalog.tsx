"use client";

import { SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import StoreProductCard from "./ProductCard";
import type { Product } from "@/types";
import { getProductText } from "@/lib/i18n";
import { useLocale } from "@/hooks/use-locale";

const categories = [
  { key: "phone", en: "Phones", vi: "Điện thoại" }, { key: "laptop", en: "Laptops", vi: "Laptop" },
  { key: "tablet", en: "Tablets", vi: "Máy tính bảng" }, { key: "accessory", en: "Accessories", vi: "Phụ kiện" },
  { key: "audio", en: "Audio", vi: "Âm thanh" }, { key: "keyboard", en: "Keyboards", vi: "Bàn phím" },
  { key: "mouse", en: "Mice", vi: "Chuột" },
];
const brands = ["Apple", "Samsung", "OPPO", "Xiaomi"];
const priceRanges = [
  { min: 0, max: 10_000_000, en: "Under 10,000,000 ₫", vi: "Dưới 10.000.000 ₫" },
  { min: 10_000_000, max: 20_000_000, en: "10,000,000 ₫ – 20,000,000 ₫", vi: "10.000.000 ₫ – 20.000.000 ₫" },
  { min: 20_000_000, max: 30_000_000, en: "20,000,000 ₫ – 30,000,000 ₫", vi: "20.000.000 ₫ – 30.000.000 ₫" },
  { min: 30_000_000, max: Infinity, en: "Over 30,000,000 ₫", vi: "Trên 30.000.000 ₫" },
];

export default function ShopCatalog({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const { locale } = useLocale();
  const vi = locale === "vi";
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceIndex, setPriceIndex] = useState<number | null>(null);
  const [sort, setSort] = useState("popular");
  const [page, setPage] = useState(1);
  const query = (searchParams.get("q") || "").toLowerCase();

  const visible = useMemo(() => {
    let result = products.filter((product) => {
      const translated = getProductText(product, locale);
      const searchable = [product.name, product.category, product.brand, product.description, product.descriptionVi, translated.description, translated.category, ...(product.useCases || []), ...Object.values(product.specs || {})].join(" ").toLowerCase();
      return !query || searchable.includes(query);
    });
    if (selectedCategories.length) result = result.filter((product) => selectedCategories.includes(product.category));
    if (selectedBrands.length) result = result.filter((product) => {
      const known = brands.find((brand) => `${product.brand} ${product.name}`.toLowerCase().includes(brand.toLowerCase())) || "other";
      return selectedBrands.includes(known);
    });
    if (priceIndex !== null) result = result.filter((product) => product.price >= priceRanges[priceIndex].min && product.price < priceRanges[priceIndex].max);
    if (sort === "low") result.sort((a, b) => a.price - b.price);
    if (sort === "high") result.sort((a, b) => b.price - a.price);
    if (sort === "newest") result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return result;
  }, [locale, priceIndex, products, query, selectedBrands, selectedCategories, sort]);

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(visible.length / pageSize));
  const pageProducts = visible.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => setPage(1), [priceIndex, query, selectedBrands, selectedCategories, sort]);
  const toggle = (value: string, list: string[], setter: (next: string[]) => void) => setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);

  const filters = <div className="space-y-6">
    <FilterGroup title={vi ? "Danh mục" : "Category"}>{categories.map((category) => <Check key={category.key} label={category[locale]} checked={selectedCategories.includes(category.key)} onChange={() => toggle(category.key, selectedCategories, setSelectedCategories)} />)}</FilterGroup>
    <FilterGroup title={vi ? "Khoảng giá" : "Price Range"}>{priceRanges.map((range, index) => <Check key={range.en} radio label={range[locale]} checked={priceIndex === index} onChange={() => setPriceIndex(priceIndex === index ? null : index)} />)}</FilterGroup>
    <FilterGroup title={vi ? "Thương hiệu" : "Brand"}>{[...brands, "other"].map((brand) => <Check key={brand} label={brand === "other" ? (vi ? "Khác" : "Others") : brand} checked={selectedBrands.includes(brand)} onChange={() => toggle(brand, selectedBrands, setSelectedBrands)} />)}</FilterGroup>
  </div>;

  return <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
    <aside className="hidden rounded-2xl border border-[#eadcc8] bg-white p-5 lg:block">{filters}</aside>
    <div className="min-w-0">
      <details className="mb-4 rounded-2xl border border-[#eadcc8] bg-white p-4 lg:hidden"><summary className="flex cursor-pointer list-none items-center gap-2 font-semibold"><SlidersHorizontal className="h-4 w-4" /> {vi ? "Bộ lọc" : "Filters"}</summary><div className="mt-5">{filters}</div></details>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#6b7280]">{vi ? `Hiển thị ${visible.length ? (page - 1) * pageSize + 1 : 0}–${Math.min(page * pageSize, visible.length)} trong ${visible.length} sản phẩm` : `Showing ${visible.length ? (page - 1) * pageSize + 1 : 0}–${Math.min(page * pageSize, visible.length)} of ${visible.length} products`}</p>
        <select value={sort} onChange={(event) => setSort(event.target.value)} className="h-11 rounded-xl border border-[#eadcc8] bg-white px-4 text-sm outline-none"><option value="popular">{vi ? "Phổ biến" : "Sort by: Popular"}</option><option value="low">{vi ? "Giá: thấp đến cao" : "Price: Low to High"}</option><option value="high">{vi ? "Giá: cao đến thấp" : "Price: High to Low"}</option><option value="newest">{vi ? "Mới nhất" : "Newest"}</option></select>
      </div>
      {visible.length ? <><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">{pageProducts.map((product) => <StoreProductCard key={product._id} product={product} />)}</div>{totalPages > 1 && <div className="mt-6 flex justify-center gap-2">{Array.from({ length: totalPages }, (_, index) => index + 1).slice(Math.max(0, page - 3), page + 2).map((number) => <button key={number} onClick={() => setPage(number)} className={`h-9 w-9 rounded-lg border text-sm ${page === number ? "border-[#c87916] bg-[#c87916] text-white" : "border-[#eadcc8] bg-white"}`}>{number}</button>)}</div>}</> : <div className="rounded-2xl border border-[#eadcc8] bg-white p-10 text-center text-[#6b7280]">{vi ? "Không có sản phẩm phù hợp với bộ lọc." : "No products match these filters."}</div>}
    </div>
  </div>;
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) { return <section><h3 className="mb-3 text-sm font-bold">{title}</h3><div className="space-y-2.5">{children}</div></section>; }
function Check({ label, checked, onChange, radio = false }: { label: string; checked: boolean; onChange: () => void; radio?: boolean }) { return <label className="flex cursor-pointer items-center gap-2 text-sm text-[#4b5563]"><input type={radio ? "radio" : "checkbox"} checked={checked} onChange={onChange} className="h-4 w-4 accent-[#c87916]" />{label}</label>; }
