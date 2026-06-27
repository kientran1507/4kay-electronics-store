"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AssistantVisual from "@/components/storefront/AssistantVisual";
import OpenAssistantButton from "@/components/storefront/OpenAssistantButton";
import ServiceBar from "@/components/storefront/ServiceBar";
import { guideTranslationsVi, guides, type BuyingGuide } from "@/data/guidesData";
import { useLocale } from "@/hooks/use-locale";
import type { Product } from "@/types";

const findImage = (products: Product[], terms: string[], index: number) =>
  products.find((product) => terms.some((term) => `${product.name} ${product.category}`.toLowerCase().includes(term))) ||
  products[index % Math.max(products.length, 1)];

const categoryLabel = (category: BuyingGuide["category"], vi: boolean) => vi ? ({ Guide: "Hướng dẫn", Review: "Đánh giá", Tips: "Mẹo" }[category]) : category;

export default function GuidesContent({ products }: { products: Product[] }) {
  const { locale } = useLocale();
  const vi = locale === "vi";
  const localize = (guide: BuyingGuide) => vi ? { ...guide, ...guideTranslationsVi[guide.slug] } : guide;
  const featured = localize(guides[0]);
  const featuredProduct = findImage(products, guides[0].imageTerms, 0);

  return (
    <main className="bg-[#fffaf3]">
      <div className="mx-auto max-w-[1120px] space-y-6 px-4 py-5 sm:px-6">
        <section className="grid min-h-52 gap-5 rounded-2xl border border-[#eadcc8] bg-white p-6 md:grid-cols-[1.3fr_0.9fr] md:p-8">
          <div className="flex flex-col justify-center"><h1 className="text-4xl font-bold">{vi ? <>Hướng dẫn mua hàng & <span className="text-[#c87916]">Mẹo công nghệ</span></> : <>Buying Guides & <span className="text-[#c87916]">Tech Tips</span></>}</h1><p className="mt-4 text-[#6b7280]">{vi ? "Lời khuyên dễ hiểu giúp bạn chọn đúng sản phẩm." : "Simple advice to help you choose the right products."}</p></div>
          <AssistantVisual message={vi ? "Tôi có thể giúp bạn chọn sản phẩm phù hợp nhất với nhu cầu." : "I can help you choose the best product for your needs."} />
        </section>

        {featuredProduct && <Link href={`/guides/${featured.slug}`} className="grid gap-6 rounded-2xl border border-[#eadcc8] bg-white p-4 transition hover:shadow-[var(--store-shadow)] md:grid-cols-[1fr_1.6fr]">
          <div className="relative min-h-48 overflow-hidden rounded-xl bg-[#fff4e6]"><Image src={featuredProduct.image} alt={featured.title} fill className="object-contain p-3" sizes="420px" /></div>
          <div className="flex flex-col justify-center p-3"><span className="w-fit rounded-md bg-[#fff4e6] px-2 py-1 text-xs text-[#9a5a08]">{vi ? "Hướng dẫn nổi bật" : "Featured Guide"}</span><h2 className="mt-3 text-2xl font-bold">{featured.title}</h2><p className="mt-3 text-sm leading-6 text-[#6b7280]">{featured.summary}</p><span className="mt-4 flex items-center gap-1 text-sm font-semibold text-[#c87916]">{vi ? "Đọc tiếp" : "Read More"} <ArrowRight className="h-4 w-4" /></span></div>
        </Link>}

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {guides.slice(1).map((sourceGuide, index) => {
            const guide = localize(sourceGuide);
            const product = findImage(products, sourceGuide.imageTerms, index + 1);
            return product && <Link key={guide.slug} href={`/guides/${guide.slug}`} className="flex min-h-40 gap-4 rounded-2xl border border-[#eadcc8] bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-[var(--store-shadow)]"><div className="relative min-h-28 w-32 shrink-0 rounded-xl bg-[#fff4e6]"><Image src={product.image} alt={guide.title} fill className="object-contain p-2" sizes="130px" /></div><div><span className="text-[10px] font-semibold text-[#c87916]">{categoryLabel(guide.category, vi)}</span><h3 className="mt-1 font-semibold">{guide.title}</h3><p className="mt-2 line-clamp-3 text-xs leading-5 text-[#6b7280]">{guide.summary}</p><span className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#c87916]">{vi ? "Đọc tiếp" : "Read More"} <ArrowRight className="h-3 w-3" /></span></div></Link>;
          })}
        </section>

        <article className="flex flex-col justify-between gap-4 rounded-2xl border border-[#eadcc8] bg-[#fff4e6] p-6 sm:flex-row sm:items-center"><div><h3 className="text-lg font-semibold">{vi ? "Bạn vẫn chưa biết nên chọn gì?" : "Not sure what to choose?"}</h3><p className="mt-2 text-sm text-[#6b7280]">{vi ? "Cho trợ lý AI biết ngân sách và mục đích sử dụng để nhận gợi ý từ sản phẩm hiện có." : "Tell the AI assistant your budget and purpose. It will recommend products from our catalog."}</p></div><OpenAssistantButton label={vi ? "Hỏi trợ lý AI" : "Ask AI Assistant"} /></article>
        <ServiceBar />
      </div>
    </main>
  );
}
