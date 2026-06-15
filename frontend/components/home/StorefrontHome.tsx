"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Cable, Headphones, Keyboard, Laptop, MousePointer2, Send, Smartphone, Tablet } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import KioskScene from "@/components/kiosk/KioskScene";
import StoreProductCard from "@/components/storefront/ProductCard";
import ServiceBar from "@/components/storefront/ServiceBar";
import type { Product } from "@/types";

const categories = [
  { label: "Phones", icon: Smartphone, terms: ["phone", "iphone", "điện thoại"] },
  { label: "Laptops", icon: Laptop, terms: ["laptop", "macbook"] },
  { label: "Tablets", icon: Tablet, terms: ["tablet", "ipad", "máy tính bảng"] },
  { label: "Accessories", icon: Cable, terms: ["access", "phụ kiện", "charger"] },
  { label: "Audio", icon: Headphones, terms: ["headphone", "airpods", "tai nghe"] },
  { label: "Keyboards", icon: Keyboard, terms: ["keyboard", "bàn phím"] },
  { label: "Mice", icon: MousePointer2, terms: ["mouse", "mice", "chuột"] },
];

const matches = (product: Product, terms: string[]) =>
  terms.some((term) => `${product.name} ${product.category}`.toLowerCase().includes(term));

export default function StorefrontHome({ products }: { products: Product[] }) {
  const [question, setQuestion] = useState("");
  const categoryItems = useMemo(
    () => categories.map((category, index) => ({ ...category, product: products.find((product) => matches(product, category.terms)) || products[index % Math.max(products.length, 1)] })).filter((item) => item.product),
    [products],
  );
  const laptop = products.find((product) => matches(product, ["laptop", "macbook"])) || products[0];
  const phone = products.find((product) => matches(product, ["phone", "iphone", "điện thoại"])) || products[1];
  const audio = products.find((product) => matches(product, ["headphone", "airpods", "tai nghe"])) || products[2];

  const openAssistant = (message = "") =>
    window.dispatchEvent(new CustomEvent("open-4kay-assistant", { detail: message }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    openAssistant(question);
    setQuestion("");
  };

  return (
    <main className="bg-[#fffaf3] text-[#111827]">
      <div className="mx-auto max-w-[1320px] space-y-7 px-4 py-5 sm:px-6 lg:px-8">
        <section className="grid gap-4 lg:grid-cols-[0.82fr_1.18fr]">
          <article className="relative min-w-0 overflow-hidden rounded-2xl border border-[#eadcc8] bg-[#fff4e6]">
            <KioskScene compact state="idle" isSpeaking={false} />
            <div className="absolute left-4 top-4 rounded-xl border border-[#eadcc8] bg-white/95 px-3 py-2 text-xs font-semibold shadow-sm">
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500" />AI Assistant · <span className="font-normal text-[#6b7280]">Online</span>
            </div>
            <div className="absolute right-4 top-24 w-[42%] rounded-2xl border border-[#eadcc8] bg-white/95 p-4 text-xs leading-5 shadow-sm">
              <p className="font-semibold">Hi! I’m your AI assistant.</p>
              <p className="mt-2 text-[#6b7280]">I can help you find the perfect phone, laptop, tablet, or accessories.</p>
            </div>
            <form onSubmit={submit} className="absolute bottom-5 left-5 right-5 flex rounded-xl border border-[#eadcc8] bg-white p-1.5 shadow-sm">
              <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask me anything..." className="h-10 min-w-0 flex-1 px-3 text-sm outline-none" />
              <button className="flex h-10 items-center gap-2 rounded-lg bg-[#c87916] px-4 text-sm font-semibold text-white">Start Chat <Send className="h-4 w-4" /></button>
            </form>
          </article>

          <article className="relative min-h-[430px] overflow-hidden rounded-2xl border border-[#eadcc8] bg-white px-8 py-10 sm:px-10">
            <div className="relative z-10 max-w-full sm:max-w-[52%]">
              <h1 className="text-4xl font-bold leading-[1.08] sm:text-5xl">Tech for life,<span className="block text-[#c87916]">chosen for you.</span></h1>
              <p className="mt-5 text-sm leading-6 text-[#6b7280]">Discover top-quality electronics with the best prices. Trusted by thousands. Loved worldwide.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/shop" className="rounded-xl bg-[#c87916] px-6 py-3 text-sm font-semibold text-white">Shop Now</Link>
                <button onClick={() => openAssistant()} className="rounded-xl border border-[#eadcc8] bg-white px-6 py-3 text-sm font-semibold">Ask AI Assistant</button>
              </div>
            </div>
            <div className="absolute bottom-5 right-4 hidden h-[75%] w-[48%] sm:block">
              {laptop?.image && <Image src={laptop.image} alt={laptop.name} fill className="object-contain" sizes="520px" priority />}
              {phone?.image && <div className="absolute bottom-5 left-0 h-40 w-28"><Image src={phone.image} alt={phone.name} fill className="object-contain" sizes="120px" /></div>}
              {audio?.image && <div className="absolute bottom-0 right-0 h-44 w-36"><Image src={audio.image} alt={audio.name} fill className="object-contain" sizes="150px" /></div>}
            </div>
          </article>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold">Shop by Category</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
            {categoryItems.map(({ label, product, icon: Icon }) => (
              <Link key={label} href={`/shop/${encodeURIComponent(product.category)}`} className="flex h-20 min-w-0 items-center gap-3 rounded-2xl border border-[#eadcc8] bg-white px-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fff4e6] text-[#c87916]"><Icon className="h-6 w-6" /></span>
                <span className="truncate text-sm font-semibold">{label}</span><ArrowRight className="ml-auto h-4 w-4 shrink-0" />
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between"><h2 className="text-xl font-bold">Featured Products</h2><Link href="/shop" className="flex items-center gap-1 text-sm font-semibold text-[#c87916]">View all <ArrowRight className="h-4 w-4" /></Link></div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">{products.slice(0, 6).map((product) => <StoreProductCard key={product._id} product={product} />)}</div>
        </section>
        <ServiceBar />
      </div>
    </main>
  );
}
