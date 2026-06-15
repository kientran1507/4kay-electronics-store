import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Footer from "@/components/footer";
import AssistantVisual from "@/components/storefront/AssistantVisual";
import ServiceBar from "@/components/storefront/ServiceBar";
import StoreProductCard from "@/components/storefront/ProductCard";
import { publicApi } from "@/lib/apiCalls";
import type { Product } from "@/types";

export const dynamic = "force-dynamic";

const categories = [
  ["Phones", "Smartphones and mobile devices", ["phone", "iphone", "điện thoại"]],
  ["Laptops", "Powerful laptops for every need", ["laptop", "macbook"]],
  ["Tablets", "Portable performance for work and play", ["tablet", "ipad"]],
  ["Audio", "Headphones, speakers, and more", ["audio", "headphone", "airpods", "tai nghe"]],
  ["Accessories", "Cables, chargers, and essentials", ["access", "phụ kiện", "charger"]],
  ["Keyboards", "Mechanical, wireless, and more", ["keyboard", "bàn phím"]],
  ["Mice", "Ergonomic and high-precision", ["mouse", "mice", "chuột"]],
  ["Smart Devices", "Smartwatches, cameras, and more", ["watch", "camera", "smart"]],
] as const;

const findProduct = (products: Product[], terms: readonly string[], index: number) =>
  products.find((product) => terms.some((term) => `${product.name} ${product.category}`.toLowerCase().includes(term))) || products[index % Math.max(products.length, 1)];

export default async function CategoriesPage() {
  const response = await publicApi.getAllProducts();
  const products: Product[] = response.products || [];
  return (
    <>
      <main className="bg-[#fffaf3]"><div className="mx-auto max-w-[1320px] space-y-7 px-4 py-5 sm:px-6 lg:px-8">
        <section className="grid min-h-48 gap-5 rounded-2xl border border-[#eadcc8] bg-white p-6 md:grid-cols-[1.3fr_0.9fr] md:p-8">
          <div className="flex flex-col justify-center"><h1 className="text-4xl font-bold">Browse by Category</h1><p className="mt-4 text-[#6b7280]">Find the right tech for work, study, play, and everyday life.</p></div>
          <AssistantVisual message="Need help choosing a category? I can help." />
        </section>
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map(([label, description, terms], index) => {
            const product = findProduct(products, terms, index);
            return product && <Link key={label} href={`/shop/${encodeURIComponent(product.category)}`} className="flex min-h-36 items-center gap-4 rounded-2xl border border-[#eadcc8] bg-white p-4">
              <span className="relative h-28 w-24 shrink-0"><Image src={product.image} alt={label} fill className="object-contain" sizes="100px" /></span>
              <span className="min-w-0"><span className="block font-semibold">{label}</span><span className="mt-2 block text-sm leading-5 text-[#6b7280]">{description}</span></span><ArrowRight className="ml-auto h-4 w-4 shrink-0" />
            </Link>;
          })}
        </section>
        <section><div className="mb-3 flex justify-between"><h2 className="text-xl font-bold">Popular Picks</h2><Link href="/shop" className="flex items-center gap-1 text-sm font-semibold text-[#c87916]">View all <ArrowRight className="h-4 w-4" /></Link></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{products.slice(0, 4).map((product) => <StoreProductCard key={product._id} product={product} horizontal />)}</div></section>
        <ServiceBar />
      </div></main><Footer />
    </>
  );
}
