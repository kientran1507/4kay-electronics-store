"use client";

import { useLocale } from "@/hooks/use-locale";

const categoryLabels: Record<string, { en: string; vi: string }> = {
  phone: { en: "Phones", vi: "Điện thoại" },
  laptop: { en: "Laptops", vi: "Laptop" },
  tablet: { en: "Tablets", vi: "Máy tính bảng" },
  audio: { en: "Audio", vi: "Âm thanh" },
  accessory: { en: "Accessories", vi: "Phụ kiện" },
  keyboard: { en: "Keyboards", vi: "Bàn phím" },
  mouse: { en: "Mice", vi: "Chuột" },
  monitor: { en: "Monitors", vi: "Màn hình" },
  storage: { en: "Storage", vi: "Thiết bị lưu trữ" },
  gaming: { en: "Gaming", vi: "Thiết bị gaming" },
};

export default function ShopPageHeader({ category }: { category?: string }) {
  const { locale } = useLocale();
  const vi = locale === "vi";
  const normalized = category?.trim().toLowerCase();
  const categoryLabel = normalized ? categoryLabels[normalized]?.[locale] || category : undefined;

  return (
    <header className="mb-7">
      <h1 className="text-4xl font-bold text-[#111827]">{categoryLabel || (vi ? "Tất cả sản phẩm" : "Shop All Products")}</h1>
      <p className="mt-2 text-sm text-[#6b7280]">{categoryLabel ? (vi ? "Khám phá các sản phẩm trong danh mục này." : "Browse products in this category.") : (vi ? "Khám phá điện thoại, laptop, máy tính bảng và phụ kiện." : "Browse phones, laptops, tablets, and accessories.")}</p>
    </header>
  );
}
