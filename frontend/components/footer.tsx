"use client";

import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";
import Logo from "./Logo";

const columns = {
  en: [
    { title: "Shop", links: [["All Products", "/shop"], ["Phones", "/shop/phone"], ["Laptops", "/shop/laptop"], ["Accessories", "/shop/accessory"]] },
    { title: "Help", links: [["Shipping & Delivery", "/support"], ["Returns & Refunds", "/support"], ["FAQs", "/support"], ["Contact Us", "/support"]] },
    { title: "Company", links: [["About Us", "/guides"], ["Careers", "/guides"], ["Privacy Policy", "/support"], ["Terms of Service", "/support"]] },
  ],
  vi: [
    { title: "Mua sắm", links: [["Tất cả sản phẩm", "/shop"], ["Điện thoại", "/shop/phone"], ["Laptop", "/shop/laptop"], ["Phụ kiện", "/shop/accessory"]] },
    { title: "Trợ giúp", links: [["Giao hàng", "/support"], ["Đổi trả và hoàn tiền", "/support"], ["Câu hỏi thường gặp", "/support"], ["Liên hệ", "/support"]] },
    { title: "Công ty", links: [["Về chúng tôi", "/guides"], ["Tuyển dụng", "/guides"], ["Chính sách bảo mật", "/support"], ["Điều khoản dịch vụ", "/support"]] },
  ],
};

export default function Footer() {
  const { locale } = useLocale();
  const vi = locale === "vi";
  return (
    <footer className="border-t border-[#eadcc8] bg-white">
      <div className="mx-auto grid max-w-[1320px] gap-8 px-4 py-9 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.15fr_2fr_1.2fr] lg:px-8">
        <div><Logo /><p className="mt-3 text-sm text-[#6b7280]">{vi ? "Công nghệ cho cuộc sống, được chọn riêng cho bạn." : "Tech for life, chosen for you."}</p><p className="mt-8 text-xs text-[#8b8176]">© 2026 4Kay Store. {vi ? "Đã đăng ký bản quyền." : "All rights reserved."}</p></div>
        <div className="grid grid-cols-3 gap-5">
          {columns[locale].map((column) => <div key={column.title}><h3 className="text-xs font-bold uppercase text-[#111827]">{column.title}</h3><div className="mt-4 space-y-2">{column.links.map(([label, href]) => <Link key={label} href={href} className="block text-xs text-[#6b7280] hover:text-[#c87916]">{label}</Link>)}</div></div>)}
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase text-[#111827]">{vi ? "Nhận thông tin mới" : "Stay in the loop"}</h3>
          <p className="mt-4 text-xs text-[#6b7280]">{vi ? "Nhận tin công nghệ và ưu đãi mới nhất." : "Get the latest tech and exclusive offers."}</p>
          <form className="mt-4 flex overflow-hidden rounded-xl border border-[#eadcc8] bg-white"><input type="email" placeholder={vi ? "Nhập email" : "Enter your email"} className="h-10 min-w-0 flex-1 px-3 text-xs outline-none" /><button type="submit" className="bg-[#c87916] px-4 text-xs font-semibold text-white">{vi ? "Đăng ký" : "Subscribe"}</button></form>
          <div className="mt-4 flex gap-4 text-[#4b5563]"><Facebook className="h-4 w-4" /><Instagram className="h-4 w-4" /><Youtube className="h-4 w-4" /></div>
        </div>
      </div>
    </footer>
  );
}
