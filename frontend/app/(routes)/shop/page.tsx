import Footer from "@/components/footer";
import ServiceBar from "@/components/storefront/ServiceBar";
import ShopCatalog from "@/components/storefront/ShopCatalog";
import { publicApi } from "@/lib/apiCalls";

export const metadata = { title: "Shop | 4Kay Store", description: "Browse phones, laptops, tablets, and accessories." };
export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const { products } = await publicApi.getAllProducts();
  return (
    <>
      <main className="bg-[#fffaf3]">
        <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
          <header className="mb-7"><h1 className="text-4xl font-bold text-[#111827]">Shop All Products</h1><p className="mt-2 text-sm text-[#6b7280]">Browse phones, laptops, tablets, and accessories.</p></header>
          <ShopCatalog products={products || []} />
          <div className="mt-8"><ServiceBar /></div>
        </div>
      </main>
      <Footer />
    </>
  );
}
