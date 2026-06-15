import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import Footer from "@/components/footer";
import OpenAssistantButton from "@/components/storefront/OpenAssistantButton";
import ServiceBar from "@/components/storefront/ServiceBar";
import StoreProductCard from "@/components/storefront/ProductCard";
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
  return <><main className="bg-[#fffaf3]"><article className="mx-auto max-w-[960px] space-y-6 px-4 py-8 sm:px-6"><Link href="/guides" className="inline-flex items-center gap-2 text-sm text-[#6b7280]"><ArrowLeft className="h-4 w-4" />Back to guides</Link><header className="rounded-2xl border border-[#eadcc8] bg-white p-6 sm:p-8"><span className="text-xs font-semibold text-[#c87916]">{guide.category}</span><h1 className="mt-2 text-3xl font-bold sm:text-4xl">{guide.title}</h1><p className="mt-4 text-base leading-7 text-[#6b7280]">{guide.summary}</p>{hero && <div className="relative mt-6 h-72 rounded-xl bg-[#fff4e6]"><Image src={hero.image} alt={guide.title} fill className="object-contain p-5" sizes="900px" /></div>}</header><section className="rounded-2xl border border-[#eadcc8] bg-white p-6 sm:p-8">{guide.sections.map((section) => <div key={section.heading} className="border-b border-[#eadcc8] py-5 last:border-0"><h2 className="text-xl font-bold">{section.heading}</h2><p className="mt-3 text-sm leading-7 text-[#6b7280]">{section.body}</p></div>)}</section><section className="rounded-2xl border border-[#eadcc8] bg-[#fff4e6] p-6"><h2 className="text-xl font-bold">Ask AI about this guide</h2><p className="mt-2 text-sm text-[#6b7280]">Tell the assistant your budget and needs for advice based on this guide and the live catalog.</p><OpenAssistantButton className="mt-4" prompt={`I am reading the guide "${guide.title}". Help me apply it to products in the current catalog.`} /></section>{matches.length > 0 && <section><h2 className="mb-4 text-2xl font-bold">Recommended products</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{matches.map((product) => <StoreProductCard key={product._id} product={product} />)}</div></section>}<ServiceBar /></article></main><Footer /></>;
}
