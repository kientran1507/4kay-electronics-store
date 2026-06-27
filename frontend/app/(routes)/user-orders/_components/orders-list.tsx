"use client";

import Link from "next/link";
import { PackageCheck, ReceiptText, ShoppingBag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/app/utils/authContext";
import Container from "@/components/ui/container";
import { createProtectedApi } from "@/lib/apiCalls";
import { Order } from "@/types";
import OrderCard from "./order-card";
import OrdersSkeleton from "./orders-skeleton";
import { useLocale } from "@/hooks/use-locale";

export default function OrdersList() {
  const { user } = useAuth();
  const { locale } = useLocale();
  const vi = locale === "vi";
  const { data: response, isLoading, error } = useQuery<{ orders: Order[]; success: boolean }>({
    queryKey: ["user-orders"],
    queryFn: async () => {
      if (!user?.token) throw new Error("No auth token");
      return createProtectedApi(user.token).orders.getUserOrders();
    },
    enabled: !!user?.token,
  });

  if (isLoading) return <OrdersSkeleton />;

  if (error) {
    return (
      <Container>
        <div className="py-24 text-center">
          <h2 className="text-2xl font-bold">{vi ? "Không thể tải đơn hàng" : "We could not load your orders"}</h2>
          <p className="mt-2 text-[#6b7280]">{vi ? "Vui lòng tải lại trang và thử lại." : "Please refresh the page and try again."}</p>
        </div>
      </Container>
    );
  }

  const orders = response?.orders || [];
  const completed = orders.filter((order) => order.paymentStatus === "paid" || order.status.includes("Hoàn")).length;

  return (
    <Container>
      <div className="py-8 lg:py-12">
        <header className="flex flex-col gap-5 border-b border-[#eadcc8] pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#c87916]">{vi ? "Tài khoản" : "Account"}</p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{vi ? "Đơn hàng của tôi" : "My orders"}</h1>
            <p className="mt-2 text-sm text-[#6b7280]">{vi ? "Theo dõi giao hàng, tiếp tục thanh toán hoặc xem lại các đơn đã mua." : "Track deliveries, continue online payments, or review past purchases."}</p>
          </div>
          {orders.length > 0 && (
            <div className="flex gap-3">
              <div className="flex items-center gap-3 rounded-lg border border-[#eadcc8] bg-white px-4 py-3">
                <ReceiptText className="h-5 w-5 text-[#c87916]" />
                <div><p className="text-lg font-bold leading-none">{orders.length}</p><p className="mt-1 text-[11px] text-[#6b7280]">{vi ? "Tổng đơn" : "Total orders"}</p></div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-[#eadcc8] bg-white px-4 py-3">
                <PackageCheck className="h-5 w-5 text-emerald-600" />
                <div><p className="text-lg font-bold leading-none">{completed}</p><p className="mt-1 text-[11px] text-[#6b7280]">{vi ? "Đã thanh toán/hoàn tất" : "Paid or complete"}</p></div>
              </div>
            </div>
          )}
        </header>

        {orders.length === 0 ? (
          <section className="mt-8 flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-[#eadcc8] bg-white px-6 text-center">
            <ShoppingBag className="h-12 w-12 text-[#c87916]" />
            <h2 className="mt-5 text-2xl font-bold">{vi ? "Chưa có đơn hàng" : "No orders yet"}</h2>
            <p className="mt-2 text-sm text-[#6b7280]">{vi ? "Đơn hàng sẽ xuất hiện tại đây sau khi bạn thanh toán." : "Your purchases will appear here after checkout."}</p>
            <Link href="/shop" className="mt-6 rounded-lg bg-[#c87916] px-5 py-3 text-sm font-semibold text-white">{vi ? "Bắt đầu mua sắm" : "Start shopping"}</Link>
          </section>
        ) : (
          <div className="mt-8 space-y-5">
            {orders.map((order) => <OrderCard key={order._id} order={order} />)}
          </div>
        )}
      </div>
    </Container>
  );
}
