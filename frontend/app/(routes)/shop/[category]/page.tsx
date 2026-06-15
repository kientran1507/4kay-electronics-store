import Footer from "@/components/footer";
import ServiceBar from "@/components/storefront/ServiceBar";
import ShopCatalog from "@/components/storefront/ShopCatalog";
import { publicApi } from "@/lib/apiCalls";
import type { Product } from "@/types";

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: encodedCategory } = await params;
  const category = decodeURIComponent(encodedCategory);
  const response = await publicApi.getCategoryProducts(category, {});
  const products: Product[] = response.products || [];

  return (
    <>
      <main className="bg-[#fffaf3]">
        <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
          <header className="mb-7"><h1 className="text-4xl font-bold text-[#111827]">{category}</h1><p className="mt-2 text-sm text-[#6b7280]">Browse products in this category.</p></header>
          <ShopCatalog products={products} />
          <div className="mt-8"><ServiceBar /></div>
        </div>
      </main>
      <Footer />
    </>
  );
}
