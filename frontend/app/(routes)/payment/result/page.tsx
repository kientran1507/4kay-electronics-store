"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { useAuth } from "@/app/utils/authContext";
import Footer from "@/components/footer";
import { createProtectedApi } from "@/lib/apiCalls";
import { PaymentSession } from "@/types";
import { useLocale } from "@/hooks/use-locale";

export default function PaymentResultPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const orderId = searchParams.get("orderId");
  const result = searchParams.get("result");
  const [payment, setPayment] = useState<PaymentSession | null>(null);
  const { locale } = useLocale();
  const vi = locale === "vi";

  useEffect(() => {
    if (!user?.token || !orderId) return;
    createProtectedApi(user.token).payments.getStatus(orderId).then(setPayment).catch(() => undefined);
  }, [orderId, user?.token]);

  const paid = payment?.status === "paid";
  const cancelled = result === "cancelled" || payment?.status === "cancelled";
  const Icon = paid ? CheckCircle2 : cancelled ? XCircle : Clock3;

  return (
    <div className="min-h-screen bg-[#fffaf3]">
      <main className="mx-auto flex min-h-[70vh] max-w-[760px] items-center px-4 py-12">
        <section className="w-full rounded-xl border border-[#eadcc8] bg-white p-8 text-center shadow-[0_20px_50px_rgba(87,61,25,0.08)] sm:p-12">
          <span className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${paid ? "bg-emerald-50 text-emerald-600" : cancelled ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}>
            <Icon className="h-10 w-10" />
          </span>
          <h1 className="mt-6 text-3xl font-bold">
            {paid ? (vi ? "Đã xác nhận thanh toán" : "Payment confirmed") : cancelled ? (vi ? "Thanh toán đã bị hủy" : "Payment was cancelled") : (vi ? "Đang xác nhận thanh toán" : "Payment is being confirmed")}
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#6b7280]">
            {paid
              ? (vi ? "Đơn hàng đã được thanh toán và chuyển sang xử lý." : "Your order is paid and has moved to processing.")
              : cancelled
                ? (vi ? "Đơn hàng vẫn được lưu. Bạn có thể quay lại Đơn hàng của tôi để thanh toán lại." : "The order is still saved. You can return to My Orders and try payment again.")
                : (vi ? "Ngân hàng có thể cần một chút thời gian để xác nhận. Trạng thái mới nhất sẽ hiển thị trong Đơn hàng của tôi." : "Bank confirmation can take a moment. My Orders will show the latest status.")}
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/user-orders" className="rounded-lg bg-[#c87916] px-5 py-3 text-sm font-semibold text-white">{vi ? "Xem đơn hàng" : "View my orders"}</Link>
            <Link href="/shop" className="rounded-lg border border-[#eadcc8] px-5 py-3 text-sm font-semibold">{vi ? "Tiếp tục mua sắm" : "Continue shopping"}</Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
