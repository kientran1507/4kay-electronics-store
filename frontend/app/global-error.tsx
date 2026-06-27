"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { useLocale } from "@/hooks/use-locale";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { locale } = useLocale();
  const vi = locale === "vi";
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang={locale}>
      <body>
        <main className="flex min-h-screen items-center justify-center bg-[#fffaf3] px-4 py-12 font-sans text-[#111827]">
          <section className="w-full max-w-xl rounded-2xl border border-[#eadcc8] bg-white p-8 text-center shadow-[0_16px_40px_rgba(87,61,25,0.08)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff4e6] text-[#c87916]">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h1 className="mt-5 text-2xl font-bold">{vi ? "Không thể khởi động 4Kay Store" : "4Kay Store could not start"}</h1>
            <p className="mt-3 text-sm leading-6 text-[#6b7280]">
              {vi ? "Ứng dụng gặp lỗi nghiêm trọng. Hãy thử tải lại; nếu lỗi tiếp tục xảy ra, hãy kiểm tra log frontend và backend." : "A critical page error happened. Try reloading the app; if it keeps happening, check the frontend and backend logs."}
            </p>
            {error.digest && (
              <p className="mt-3 text-xs text-[#8b8176]">{vi ? "Mã lỗi" : "Error reference"}: {error.digest}</p>
            )}
            <button
              type="button"
              onClick={reset}
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#171717] px-5 text-sm font-semibold text-white hover:bg-[#c87916]"
            >
              <RotateCcw className="h-4 w-4" />
              {vi ? "Tải lại ứng dụng" : "Reload app"}
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
