"use client";

import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useLocale } from "@/hooks/use-locale";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { locale } = useLocale();
  const vi = locale === "vi";
  useEffect(() => {
    console.error("Application page error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffaf3] px-4 py-12 text-[#111827]">
      <section className="w-full max-w-xl rounded-2xl border border-[#eadcc8] bg-white p-8 text-center shadow-[0_16px_40px_rgba(87,61,25,0.08)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff4e6] text-[#c87916]">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-bold">{vi ? "Có nội dung chưa tải được" : "Something did not load correctly"}</h1>
        <p className="mt-3 text-sm leading-6 text-[#6b7280]">
          {vi ? "Trang chưa thể tải hoàn tất. Nguyên nhân có thể là API tạm thời không hoạt động hoặc kết nối bị gián đoạn." : "The page could not finish loading. This can happen when the API is temporarily unavailable or the connection drops."}
        </p>
        {error.digest && (
          <p className="mt-3 text-xs text-[#8b8176]">{vi ? "Mã lỗi" : "Error reference"}: {error.digest}</p>
        )}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#171717] px-5 text-sm font-semibold text-white hover:bg-[#c87916]"
          >
            <RotateCcw className="h-4 w-4" />
            {vi ? "Thử lại" : "Try again"}
          </button>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#eadcc8] px-5 text-sm font-semibold hover:bg-[#fffaf3]"
          >
            <Home className="h-4 w-4" />
            {vi ? "Về trang chủ" : "Back to home"}
          </Link>
        </div>
      </section>
    </main>
  );
}
