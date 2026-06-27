"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Bot, Minus, Plus, ShieldCheck, ShoppingCart, Truck } from "lucide-react";
import { useQueries, type UseQueryResult } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { publicApi } from "@/lib/apiCalls";
import useCart from "@/hooks/use-cart";
import { useAuth } from "@/app/utils/authContext";
import formatVND from "@/app/utils/formatCurrency";
import StoreProductCard from "@/components/storefront/ProductCard";
import ServiceBar from "@/components/storefront/ServiceBar";
import LoadingSkeleton from "./loading-skeleton";
import type { Product } from "@/types";
import { getProductText } from "@/lib/i18n";
import { useLocale } from "@/hooks/use-locale";

export default function ProductItem() {
  const params = useParams();
  const router = useRouter();
  const cart = useCart();
  const { locale } = useLocale();
  const vi = locale === "vi";
  const { isAuthenticated } = useAuth();
  const productId = params.productId as string;
  const [quantity, setQuantity] = useState(1);

  const [productQuery, relatedQuery] = useQueries({
    queries: [
      { queryKey: ["single product", productId], queryFn: () => publicApi.getProduct(productId).then((res) => res.product), enabled: !!productId },
      {
        queryKey: ["related products", productId],
        queryFn: async () => {
          const product = (await publicApi.getProduct(productId)).product;
          return publicApi.getCategoryProducts(product.category).then((res) => res.products);
        },
        enabled: !!productId,
      },
    ],
  }) as [UseQueryResult<Product>, UseQueryResult<Product[]>];

  if (!productId || productQuery.isLoading) return <LoadingSkeleton />;
  if (!productQuery.data || productQuery.isError) return <div className="mx-auto max-w-[1320px] px-4 py-20 text-center">{vi ? "Không tìm thấy sản phẩm hoặc đã xảy ra lỗi." : "Product not found or something went wrong."}</div>;

  const product = productQuery.data;
  const productText = getProductText(product, locale);
  const related = (relatedQuery.data || []).filter((item) => item._id !== product._id).slice(0, 4);
  const addQuantity = () => cart.addItem(product._id, quantity);
  const askAi = () => window.dispatchEvent(new CustomEvent("open-4kay-assistant", {
    detail: `I am viewing ${product.name}, priced at ${formatVND(product.price)} in category ${product.category}. Explain whether it suits me and compare alternatives.`,
  }));

  return (
    <main className="bg-[#fffaf3]">
      <div className="mx-auto max-w-[1320px] space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-[#4b5563] hover:text-[#c87916]"><ArrowLeft className="h-4 w-4" />{vi ? "Quay lại cửa hàng" : "Back to shop"}</Link>
        <section className="grid gap-8 lg:grid-cols-2">
          <div className="relative min-h-[420px] overflow-hidden rounded-2xl border border-[#eadcc8] bg-white shadow-[var(--store-shadow)] sm:min-h-[560px]">
            <Image src={product.image} alt={product.name} fill className="object-contain p-8" sizes="(max-width: 1024px) 100vw, 620px" priority />
          </div>
          <div className="flex flex-col justify-center rounded-2xl border border-[#eadcc8] bg-white p-6 shadow-[var(--store-shadow)] sm:p-8">
            <p className="text-sm font-semibold text-[#c87916]">{productText.category}</p>
            <h1 className="mt-2 text-3xl font-bold text-[#111827] sm:text-4xl">{productText.name}</h1>
            <p className="mt-4 text-2xl font-bold">{formatVND(product.price)}</p>
            <p className={`mt-3 w-fit rounded-full px-3 py-1 text-xs font-semibold ${product.stock > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{product.stock > 0 ? (vi ? `Còn ${product.stock} sản phẩm` : `${product.stock} in stock`) : (vi ? "Hết hàng" : "Out of stock")}</p>
            <p className="mt-6 text-sm leading-7 text-[#6b7280]">{productText.description}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <div className="flex h-11 items-center rounded-xl border border-[#eadcc8]">
                <button onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="flex h-full w-10 items-center justify-center"><Minus className="h-4 w-4" /></button>
                <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
                <button onClick={() => setQuantity((value) => Math.min(product.stock || 1, value + 1))} className="flex h-full w-10 items-center justify-center"><Plus className="h-4 w-4" /></button>
              </div>
              <button disabled={product.stock <= 0} onClick={addQuantity} className="flex h-11 items-center gap-2 rounded-xl bg-[#c87916] px-5 text-sm font-semibold text-white disabled:opacity-50"><ShoppingCart className="h-4 w-4" />{vi ? "Thêm vào giỏ" : "Add to Cart"}</button>
              <button disabled={product.stock <= 0} onClick={async () => { if (!isAuthenticated) { router.push("/customer-sign-in"); return; } await addQuantity(); router.push("/cart"); }} className="h-11 rounded-xl border border-[#c87916] px-5 text-sm font-semibold text-[#9a5a08] disabled:opacity-50">{vi ? "Mua ngay" : "Buy Now"}</button>
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button onClick={askAi} className="flex items-center gap-3 rounded-xl border border-[#eadcc8] p-3 text-left text-sm font-semibold"><Bot className="h-5 w-5 text-[#c87916]" />{vi ? "Hỏi AI về sản phẩm" : "Ask AI about this product"}</button>
              <Link href="/support" className="flex items-center gap-3 rounded-xl border border-[#eadcc8] p-3 text-sm font-semibold"><ShieldCheck className="h-5 w-5 text-[#c87916]" />{vi ? "Thông tin giao hàng và bảo hành" : "Delivery & warranty info"}</Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <InfoPanel title={vi ? "Tổng quan sản phẩm" : "Product Overview"}>{productText.description}</InfoPanel>
          <InfoPanel title={vi ? "Giao hàng và đổi trả" : "Delivery & Returns"}>{vi ? "Thời gian và phí giao hàng phụ thuộc vào địa chỉ nhận hàng. Sản phẩm còn nguyên vẹn và đầy đủ có thể yêu cầu đổi trả trong vòng 14 ngày." : "Shipping timing and fees depend on the delivery address. Eligible returns can be requested within 14 days when the product is complete and undamaged."}</InfoPanel>
          <InfoPanel title={vi ? "Bảo hành" : "Warranty"}>{vi ? "Điều khoản bảo hành phụ thuộc vào hãng và sản phẩm. Hãy cung cấp thông tin sản phẩm hoặc đơn hàng để bộ phận hỗ trợ kiểm tra." : "Warranty terms depend on the manufacturer and product. Contact support with the product or order information to confirm coverage."}</InfoPanel>
        </section>

        {product.specs && Object.keys(product.specs).length > 0 && (
          <section className="rounded-2xl border border-[#eadcc8] bg-white p-6">
            <h2 className="text-xl font-bold">{vi ? "Thông số kỹ thuật" : "Specifications"}</h2>
            <dl className="mt-4 divide-y divide-[#eadcc8]">{Object.entries(product.specs).map(([key, value]) => <div key={key} className="grid grid-cols-[140px_1fr] gap-4 py-3 text-sm"><dt className="font-semibold capitalize">{key}</dt><dd className="text-[#6b7280]">{value}</dd></div>)}</dl>
          </section>
        )}

        <section className="flex flex-col justify-between gap-4 rounded-2xl border border-[#eadcc8] bg-[#fff4e6] p-6 sm:flex-row sm:items-center">
          <div><h2 className="text-xl font-bold">{vi ? "Bạn cần hỗ trợ lựa chọn?" : "Need help deciding?"}</h2><p className="mt-1 text-sm text-[#6b7280]">{vi ? "Hãy nhờ trợ lý AI so sánh sản phẩm hoặc gợi ý lựa chọn khác." : "Ask the AI assistant to compare this product or recommend alternatives."}</p></div>
          <button onClick={askAi} className="flex w-fit items-center gap-2 rounded-xl bg-[#c87916] px-5 py-3 text-sm font-semibold text-white"><Bot className="h-4 w-4" />{vi ? "Hỏi trợ lý AI" : "Ask AI Assistant"}</button>
        </section>

        {related.length > 0 && <section><div className="mb-4 flex items-center justify-between"><h2 className="text-2xl font-bold">{vi ? "Sản phẩm liên quan" : "Related Products"}</h2><Link href={`/shop/${encodeURIComponent(product.category)}`} className="text-sm font-semibold text-[#c87916]">{vi ? "Xem thêm sản phẩm" : "View more products"}</Link></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{related.map((item) => <StoreProductCard key={item._id} product={item} />)}</div></section>}
        <ServiceBar />
      </div>
    </main>
  );
}

function InfoPanel({ title, children }: { title: string; children: React.ReactNode }) {
  const Icon = title.startsWith("Delivery") || title.startsWith("Giao") ? Truck : ShieldCheck;
  return <article className="rounded-2xl border border-[#eadcc8] bg-white p-5"><Icon className="h-6 w-6 text-[#c87916]" /><h2 className="mt-3 font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-[#6b7280]">{children}</p></article>;
}
