"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AssistantVisual from "@/components/storefront/AssistantVisual";
import ServiceBar from "@/components/storefront/ServiceBar";
import StoreProductCard from "@/components/storefront/ProductCard";
import { useLocale } from "@/hooks/use-locale";
import type { Product } from "@/types";

const categories = [
  { key: "phone", en: "Phones", vi: "Điện thoại", descriptionEn: "Smartphones and mobile devices", descriptionVi: "Điện thoại thông minh và thiết bị di động", terms: ["phone", "iphone", "điện thoại"] },
  { key: "laptop", en: "Laptops", vi: "Laptop", descriptionEn: "Powerful laptops for every need", descriptionVi: "Laptop phù hợp cho mọi nhu cầu", terms: ["laptop", "macbook"] },
  { key: "tablet", en: "Tablets", vi: "Máy tính bảng", descriptionEn: "Portable performance for work and play", descriptionVi: "Gọn nhẹ cho công việc và giải trí", terms: ["tablet", "ipad", "máy tính bảng"] },
  { key: "audio", en: "Audio", vi: "Âm thanh", descriptionEn: "Headphones, speakers, and more", descriptionVi: "Tai nghe, loa và thiết bị âm thanh", terms: ["audio", "headphone", "airpods", "tai nghe"] },
  { key: "accessory", en: "Accessories", vi: "Phụ kiện", descriptionEn: "Cables, chargers, and essentials", descriptionVi: "Cáp, sạc và phụ kiện thiết yếu", terms: ["accessory", "phụ kiện", "charger"] },
  { key: "keyboard", en: "Keyboards", vi: "Bàn phím", descriptionEn: "Mechanical, wireless, and more", descriptionVi: "Bàn phím cơ, không dây và nhiều loại khác", terms: ["keyboard", "bàn phím"] },
  { key: "mouse", en: "Mice", vi: "Chuột", descriptionEn: "Ergonomic and high-precision", descriptionVi: "Thiết kế công thái học, độ chính xác cao", terms: ["mouse", "mice", "chuột"] },
  { key: "smart-device", en: "Smart Devices", vi: "Thiết bị thông minh", descriptionEn: "Smartwatches, cameras, and more", descriptionVi: "Đồng hồ, camera và thiết bị thông minh", terms: ["watch", "camera", "smart"] },
] as const;

const findProduct = (products: Product[], terms: readonly string[], index: number) =>
  products.find((product) => terms.some((term) => `${product.name} ${product.category}`.toLocaleLowerCase().includes(term))) ||
  products[index % Math.max(products.length, 1)];

export default function CategoriesContent({ products }: { products: Product[] }) {
  const { locale } = useLocale();
  const vi = locale === "vi";

  return (
    <main className="bg-[#fffaf3]">
      <div className="mx-auto max-w-[1320px] space-y-7 px-4 py-5 sm:px-6 lg:px-8">
        <section className="grid min-h-48 gap-5 rounded-2xl border border-[#eadcc8] bg-white p-6 md:grid-cols-[1.3fr_0.9fr] md:p-8">
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-bold">{vi ? "Mua sắm theo danh mục" : "Browse by Category"}</h1>
            <p className="mt-4 text-[#6b7280]">{vi ? "Tìm thiết bị phù hợp cho công việc, học tập, giải trí và cuộc sống hằng ngày." : "Find the right tech for work, study, play, and everyday life."}</p>
          </div>
          <AssistantVisual message={vi ? "Bạn chưa biết nên chọn danh mục nào? Tôi có thể giúp." : "Need help choosing a category? I can help."} />
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, index) => {
            const product = findProduct(products, category.terms, index);
            if (!product) return null;
            const label = vi ? category.vi : category.en;
            return (
              <Link key={category.key} href={`/shop/${encodeURIComponent(category.key)}`} className="flex min-h-36 items-center gap-4 rounded-2xl border border-[#eadcc8] bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-[var(--store-shadow)]">
                <span className="relative h-28 w-24 shrink-0"><Image src={product.image} alt={label} fill className="object-contain" sizes="100px" /></span>
                <span className="min-w-0"><span className="block font-semibold">{label}</span><span className="mt-2 block text-sm leading-5 text-[#6b7280]">{vi ? category.descriptionVi : category.descriptionEn}</span></span>
                <ArrowRight className="ml-auto h-4 w-4 shrink-0" />
              </Link>
            );
          })}
        </section>

        <section>
          <div className="mb-3 flex justify-between"><h2 className="text-xl font-bold">{vi ? "Sản phẩm nổi bật" : "Popular Picks"}</h2><Link href="/shop" className="flex items-center gap-1 text-sm font-semibold text-[#c87916]">{vi ? "Xem tất cả" : "View all"} <ArrowRight className="h-4 w-4" /></Link></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{products.slice(0, 4).map((product) => <StoreProductCard key={product._id} product={product} horizontal />)}</div>
        </section>
        <ServiceBar />
      </div>
    </main>
  );
}
