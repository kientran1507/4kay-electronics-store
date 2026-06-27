import Footer from "@/components/footer";
import GuidesContent from "@/components/storefront/GuidesContent";
import { publicApi } from "@/lib/apiCalls";
import type { Product } from "@/types";

export const dynamic = "force-dynamic";

export default async function GuidesPage() {
  const response = await publicApi.getAllProducts();
  const products: Product[] = response.products || [];
  return <><GuidesContent products={products} /><Footer /></>;
}
