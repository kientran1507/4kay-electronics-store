import Footer from "@/components/footer";
import ServiceBar from "@/components/storefront/ServiceBar";
import ShopCatalog from "@/components/storefront/ShopCatalog";
import ShopPageHeader from "@/components/storefront/ShopPageHeader";
import { publicApi } from "@/lib/apiCalls";

export const metadata = { title: "Shop | 4Kay Store", description: "Browse phones, laptops, tablets, and accessories." };
export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const { products } = await publicApi.getAllProducts();
  return (
    <>
      <main className="bg-[#fffaf3]">
        <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
          <ShopPageHeader />
          <ShopCatalog products={products || []} />
          <div className="mt-8"><ServiceBar /></div>
        </div>
      </main>
      <Footer />
    </>
  );
}
