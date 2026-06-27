import Footer from "@/components/footer";
import CategoriesContent from "@/components/storefront/CategoriesContent";
import { publicApi } from "@/lib/apiCalls";
import type { Product } from "@/types";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const response = await publicApi.getAllProducts();
  const products: Product[] = response.products || [];
  return <><CategoriesContent products={products} /><Footer /></>;
}
