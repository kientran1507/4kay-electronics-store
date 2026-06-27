"use client";

import Link from "next/link";
import Footer from "@/components/footer";
import NavBar from "@/components/navbar";
import { useLocale } from "@/hooks/use-locale";

export default function NotFound() {
  const { locale } = useLocale();
  const vi = locale === "vi";
  return (
    <>
      <NavBar />
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-5xl font-bold text-[#c87916]">404</p>
        <h1 className="text-2xl font-bold">{vi ? "Không tìm thấy trang" : "Page not found"}</h1>
        <p className="text-sm text-[#6b7280]">{vi ? "Địa chỉ này không tồn tại hoặc đã được di chuyển." : "This address does not exist or has been moved."}</p>
        <Link href="/" className="rounded-lg bg-[#171717] px-5 py-3 text-sm font-semibold text-white">{vi ? "Về trang chủ" : "Back to home"}</Link>
      </main>
      <Footer />
    </>
  );
}
