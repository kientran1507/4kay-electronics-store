import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Footer from "@/components/footer";
import AssistantVisual from "@/components/storefront/AssistantVisual";
import ServiceBar from "@/components/storefront/ServiceBar";
import OpenAssistantButton from "@/components/storefront/OpenAssistantButton";
import { guides } from "@/data/guidesData";
import { publicApi } from "@/lib/apiCalls";
import type { Product } from "@/types";

export const dynamic = "force-dynamic";

const findImage = (products: Product[], terms: string[], index: number) => products.find((product) => terms.some((term) => `${product.name} ${product.category}`.toLowerCase().includes(term))) || products[index % Math.max(products.length, 1)];

export default async function GuidesPage() {
  const response = await publicApi.getAllProducts();
  const products: Product[] = response.products || [];
  const featured = guides[0];
  const featuredProduct = findImage(products, featured.imageTerms, 0);
  return <><main className="bg-[#fffaf3]"><div className="mx-auto max-w-[1120px] space-y-6 px-4 py-5 sm:px-6">
    <section className="grid min-h-52 gap-5 rounded-2xl border border-[#eadcc8] bg-white p-6 md:grid-cols-[1.3fr_0.9fr] md:p-8"><div className="flex flex-col justify-center"><h1 className="text-4xl font-bold">Buying Guides & <span className="text-[#c87916]">Tech Tips</span></h1><p className="mt-4 text-[#6b7280]">Simple advice to help you choose the right products.</p></div><AssistantVisual message="I can help you choose the best product for your needs." /></section>
    {featuredProduct && <Link href={`/guides/${featured.slug}`} className="grid gap-6 rounded-2xl border border-[#eadcc8] bg-white p-4 transition hover:shadow-[var(--store-shadow)] md:grid-cols-[1fr_1.6fr]"><div className="relative min-h-48 overflow-hidden rounded-xl bg-[#fff4e6]"><Image src={featuredProduct.image} alt={featured.title} fill className="object-contain p-3" sizes="420px" /></div><div className="flex flex-col justify-center p-3"><span className="w-fit rounded-md bg-[#fff4e6] px-2 py-1 text-xs text-[#9a5a08]">Featured Guide</span><h2 className="mt-3 text-2xl font-bold">{featured.title}</h2><p className="mt-3 text-sm leading-6 text-[#6b7280]">{featured.summary}</p><span className="mt-4 flex items-center gap-1 text-sm font-semibold text-[#c87916]">Read More <ArrowRight className="h-4 w-4" /></span></div></Link>}
    <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{guides.slice(1).map((guide, index) => { const product = findImage(products, guide.imageTerms, index + 1); return product && <Link key={guide.slug} href={`/guides/${guide.slug}`} className="flex min-h-40 gap-4 rounded-2xl border border-[#eadcc8] bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-[var(--store-shadow)]"><div className="relative min-h-28 w-32 shrink-0 rounded-xl bg-[#fff4e6]"><Image src={product.image} alt={guide.title} fill className="object-contain p-2" sizes="130px" /></div><div><span className="text-[10px] font-semibold text-[#c87916]">{guide.category}</span><h3 className="mt-1 font-semibold">{guide.title}</h3><p className="mt-2 line-clamp-3 text-xs leading-5 text-[#6b7280]">{guide.summary}</p><span className="mt-2 block text-xs font-semibold text-[#c87916]">Read More →</span></div></Link>; })}</section>
    <article className="flex flex-col justify-between gap-4 rounded-2xl border border-[#eadcc8] bg-[#fff4e6] p-6 sm:flex-row sm:items-center"><div><h3 className="text-lg font-semibold">Not sure what to choose?</h3><p className="mt-2 text-sm text-[#6b7280]">Tell the AI assistant your budget and purpose. It will recommend products from our catalog.</p></div><OpenAssistantButton /></article>
    <ServiceBar />
  </div></main><Footer /></>;
}
