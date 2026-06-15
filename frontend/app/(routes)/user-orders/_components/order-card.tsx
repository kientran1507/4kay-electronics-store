"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Banknote, CalendarDays, CreditCard, ExternalLink, MapPin, Package } from "lucide-react";
import { toast } from "react-hot-toast";
import formatDate from "@/app/utils/formateDate";
import formatVND from "@/app/utils/formatCurrency";
import { useAuth } from "@/app/utils/authContext";
import { createProtectedApi } from "@/lib/apiCalls";
import { Order } from "@/types";

const getStatusStyle = (status: string) => {
  if (status.includes("hủy")) return "bg-red-50 text-red-700 ring-red-200";
  if (status.includes("Hoàn")) return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status.includes("giao")) return "bg-purple-50 text-purple-700 ring-purple-200";
  if (status.includes("thanh toán")) return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-blue-50 text-blue-700 ring-blue-200";
};

export default function OrderCard({ order }: { order: Order }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [action, setAction] = useState<"cancel" | "pay" | null>(null);

  const canCancel = !["Đang giao", "Hoàn thành", "Đã hủy"].includes(order.status);
  const canPay = order.paymentMethod === "Chuyển khoản" && order.paymentStatus !== "paid" && !order.status.includes("hủy");

  const handleCancel = async () => {
    if (!user?.token) return;
    setAction("cancel");
    try {
      await createProtectedApi(user.token).orders.cancel(order._id);
      toast.success("Order cancelled.");
      queryClient.invalidateQueries({ queryKey: ["user-orders"] });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to cancel order");
    } finally {
      setAction(null);
    }
  };

  const handlePayment = async () => {
    if (!user?.token) return;
    setAction("pay");
    try {
      const payment = await createProtectedApi(user.token).payments.create(order._id);
      if (payment.paymentUrl) {
        window.location.assign(payment.paymentUrl);
      } else if (payment.qrCode) {
        window.open(payment.qrCode, "_blank", "noopener,noreferrer");
      } else {
        toast.error(payment.message || "Online payment is not configured.");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Could not open payment");
    } finally {
      setAction(null);
    }
  };

  return (
    <article className="overflow-hidden rounded-xl border border-[#eadcc8] bg-white shadow-[0_10px_28px_rgba(87,61,25,0.05)]">
      <header className="flex flex-col gap-3 border-b border-[#eadcc8] bg-[#fffdf9] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#6b7280]">
          <span className="font-semibold text-[#111827]">Order #{order._id.slice(-8).toUpperCase()}</span>
          <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> {formatDate(order.createdAt.toString())}</span>
          <span className="flex items-center gap-1.5"><Package className="h-3.5 w-3.5" /> {order.items.length} {order.items.length === 1 ? "product" : "products"}</span>
        </div>
        <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusStyle(order.status)}`}>
          {order.status}
        </span>
      </header>

      <div className="divide-y divide-[#f0e6d8] px-5">
        {order.items.map((item) => (
          <div key={item.productId._id} className="flex items-center gap-4 py-4">
            <Link href={`/product/${item.productId._id}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[#fff4e6]">
              <Image fill src={item.productId.image || "/placeholder-image.jpg"} alt={item.productId.name} className="object-contain p-2" sizes="80px" />
            </Link>
            <div className="min-w-0 flex-1">
              <Link href={`/product/${item.productId._id}`} className="block truncate font-semibold hover:text-[#c87916]">{item.productId.name}</Link>
              <p className="mt-1 text-xs text-[#6b7280]">Quantity {item.quantity} × {formatVND(item.price)}</p>
            </div>
            <p className="hidden font-semibold sm:block">{formatVND(item.price * item.quantity)}</p>
          </div>
        ))}
      </div>

      <footer className="grid gap-5 border-t border-[#eadcc8] bg-[#fffdf9] px-5 py-5 md:grid-cols-[1fr_auto] md:items-end">
        <div className="space-y-2 text-sm text-[#6b7280]">
          <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#c87916]" /><span>{order.shippingAddress}</span></p>
          <p className="flex items-center gap-2">
            {order.paymentMethod === "Chuyển khoản" ? <CreditCard className="h-4 w-4 text-[#c87916]" /> : <Banknote className="h-4 w-4 text-[#c87916]" />}
            <span>{order.paymentMethod === "Chuyển khoản" ? "Online bank payment" : "Cash on delivery"}</span>
            {order.paymentStatus && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${order.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                {order.paymentStatus}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <div className="mr-2 text-right">
            <p className="text-xs text-[#8b8176]">Order total</p>
            <p className="text-xl font-bold">{formatVND(order.totalPrice)}</p>
          </div>
          {canPay && (
            <button onClick={handlePayment} disabled={action !== null} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#c87916] px-4 text-sm font-semibold text-white hover:bg-[#a9600f] disabled:opacity-60">
              {action === "pay" ? "Opening..." : "Pay now"} <ExternalLink className="h-4 w-4" />
            </button>
          )}
          {canCancel && (
            <button onClick={handleCancel} disabled={action !== null} className="h-10 rounded-lg border border-red-200 px-4 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60">
              {action === "cancel" ? "Cancelling..." : "Cancel"}
            </button>
          )}
        </div>
      </footer>
    </article>
  );
}
