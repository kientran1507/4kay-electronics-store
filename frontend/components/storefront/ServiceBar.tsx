"use client";

import { LockKeyhole, ShieldCheck, Truck } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";

export default function ServiceBar() {
  const { locale } = useLocale();
  const services = locale === "vi" ? [
    { icon: ShieldCheck, title: "Sản phẩm chính hãng", text: "Sản phẩm uy tín, nguồn gốc rõ ràng." },
    { icon: Truck, title: "Giao hàng nhanh", text: "Giao hàng thuận tiện đến tận nơi." },
    { icon: LockKeyhole, title: "Thanh toán an toàn", text: "Quy trình thanh toán bảo mật." },
  ] : [
    { icon: ShieldCheck, title: "Authentic Products", text: "Genuine products you can trust." },
    { icon: Truck, title: "Fast Shipping", text: "Quick delivery to your door." },
    { icon: LockKeyhole, title: "Secure Payment", text: "Safe and secure checkout." },
  ];
  return <section className="grid gap-4 rounded-2xl border border-[#eadcc8] bg-[#fffaf3] px-5 py-4 sm:grid-cols-3">{services.map(({ icon: Icon, title, text }, index) => <div key={title} className={`flex items-center justify-center gap-3 ${index ? "sm:border-l sm:border-[#eadcc8]" : ""}`}><Icon className="h-7 w-7 shrink-0 text-[#c87916]" /><div><p className="text-sm font-semibold text-[#111827]">{title}</p><p className="text-xs text-[#6b7280]">{text}</p></div></div>)}</section>;
}
