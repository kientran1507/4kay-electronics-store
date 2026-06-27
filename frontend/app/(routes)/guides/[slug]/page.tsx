import { notFound } from "next/navigation";
import Footer from "@/components/footer";
import GuideDetailContent from "@/components/storefront/GuideDetailContent";
import { findGuide } from "@/data/guidesData";
import { publicApi } from "@/lib/apiCalls";
import type { Product } from "@/types";

export default async function GuideDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = findGuide(slug);
  if (!guide) notFound();
  const response = await publicApi.getAllProducts();
  const products: Product[] = response.products || [];
  const matches = products.filter((product) => `${product.name} ${product.category}`.toLowerCase().includes(guide.relatedCategory)).slice(0, 4);
  const hero = products.find((product) => guide.imageTerms.some((term) => `${product.name} ${product.category}`.toLowerCase().includes(term))) || products[0];
  return <><GuideDetailContent guide={guide} hero={hero} matches={matches} /><Footer /></>;
}
