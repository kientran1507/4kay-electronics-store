"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@headlessui/react";
import {
  Banknote,
  CheckCircle2,
  ExternalLink,
  LockKeyhole,
  QrCode,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "@/app/utils/authContext";
import formatVND from "@/app/utils/formatCurrency";
import useCart from "@/hooks/use-cart";
import { createProtectedApi } from "@/lib/apiCalls";
import { PaymentSession, PricingQuote } from "@/types";
import { useLocale } from "@/hooks/use-locale";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalPrice: number;
}

type CheckoutMethod = "cash" | "online";

export default function CheckoutModal({ isOpen, onClose, totalPrice }: CheckoutModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const userToken = user?.token;
  const cart = useCart();
  const { locale } = useLocale();
  const vi = locale === "vi";
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<CheckoutMethod>("online");
  const [shippingAddress, setShippingAddress] = useState(user?.address || "");
  const [voucherCode, setVoucherCode] = useState("");
  const [pricing, setPricing] = useState<PricingQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [payment, setPayment] = useState<PaymentSession | null>(null);

  const displayedPricing = useMemo<PricingQuote>(() => pricing || {
    subtotal: totalPrice,
    discountAmount: 0,
    voucherCode: "",
    shippingFee: 0,
    shippingZone: "pending",
    shippingLabel: vi ? "Tính khi thanh toán" : "Calculated at checkout",
    freeShippingMin: 0,
    totalPrice,
  }, [pricing, totalPrice, vi]);

  const loadQuote = useCallback(async (options?: { showToast?: boolean }) => {
    if (!userToken) return;
    setQuoteLoading(true);
    try {
      const api = createProtectedApi(userToken);
      const quote = await api.orders.quote({
        shippingAddress: shippingAddress.trim(),
        voucherCode: voucherCode.trim(),
      });
      setPricing(quote.pricing);
      if (options?.showToast) {
        toast.success(quote.pricing.voucherCode ? (vi ? "Đã áp dụng mã giảm giá." : "Voucher applied.") : (vi ? "Đã cập nhật giá." : "Price updated."));
      }
    } catch (error: any) {
      if (options?.showToast) {
        toast.error(error?.response?.data?.message || (vi ? "Không thể áp dụng mã giảm giá." : "Could not apply voucher."));
      }
      if (voucherCode.trim()) setPricing(null);
    } finally {
      setQuoteLoading(false);
    }
  }, [shippingAddress, userToken, voucherCode, vi]);

  useEffect(() => {
    if (!isOpen || !userToken) return;
    const timer = window.setTimeout(() => {
      loadQuote();
    }, 500);
    return () => window.clearTimeout(timer);
  }, [isOpen, loadQuote, userToken]);

  const closeModal = () => {
    if (!loading) {
      setPayment(null);
      onClose();
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!shippingAddress.trim()) {
      toast.error(vi ? "Vui lòng nhập địa chỉ giao hàng." : "Please enter a shipping address.");
      return;
    }

    setLoading(true);
    try {
      if (!userToken) throw new Error("Unauthorized");
      const api = createProtectedApi(userToken);
      const orderResponse = await api.orders.create({
        shippingAddress: shippingAddress.trim(),
        paymentMethod: method === "cash" ? "Tiền mặt" : "Chuyển khoản",
        voucherCode: voucherCode.trim(),
      });

      cart.removeAllCart();

      if (method === "cash") {
        toast.success(vi ? "Đặt hàng thành công." : "Order placed successfully.");
        onClose();
        router.push("/user-orders");
        return;
      }

      const session = await api.payments.create(orderResponse.order._id);
      if (session.provider === "payos" && session.paymentUrl) {
        toast.success(vi ? "Đang chuyển đến trang thanh toán PayOS..." : "Redirecting to secure PayOS checkout...");
        window.location.assign(session.paymentUrl);
        return;
      }

      setPayment(session);
      toast.success(vi ? "Hướng dẫn chuyển khoản đã sẵn sàng." : "Bank transfer instructions are ready.");
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error?.response?.data?.message || (vi ? "Không thể đặt hàng" : "Failed to place order"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={closeModal} className="relative z-[70]">
      <div className="fixed inset-0 bg-[#111827]/55 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 overflow-y-auto p-4 sm:p-8">
        <div className="flex min-h-full items-center justify-center">
          <Dialog.Panel className="w-full max-w-2xl overflow-hidden rounded-xl border border-[#eadcc8] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#eadcc8] px-6 py-5">
              <div>
                <Dialog.Title className="text-2xl font-bold">
                  {payment ? (vi ? "Hoàn tất thanh toán" : "Complete your payment") : (vi ? "Thanh toán bảo mật" : "Secure checkout")}
                </Dialog.Title>
                <p className="mt-1 text-sm text-[#6b7280]">
                  {payment ? (vi ? "Đơn hàng đã được lưu. Hãy chọn một phương thức bên dưới." : "Your order is saved. Use either option below.") : (vi ? "Chọn cách bạn muốn thanh toán đơn hàng." : "Choose how you want to pay for this order.")}
                </p>
              </div>
              <button type="button" onClick={closeModal} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#eadcc8] text-[#6b7280] hover:text-[#111827]" aria-label={vi ? "Đóng thanh toán" : "Close checkout"}>
                <X className="h-4 w-4" />
              </button>
            </div>

            {payment ? (
              <div className="grid gap-6 p-6 md:grid-cols-[180px_1fr]">
                <div className="flex min-h-44 items-center justify-center rounded-xl border border-[#eadcc8] bg-[#fffaf3] p-4">
                  <ExternalLink className="h-16 w-16 text-[#c9b9a4]" />
                </div>
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {vi ? "Đã tạo đơn hàng" : "Order created"}
                  </span>
                  <p className="mt-4 text-sm leading-6 text-[#6b7280]">
                    {payment.message || (vi ? "Mở trang PayOS bảo mật để hoàn tất thanh toán trực tuyến." : "Open the secure PayOS checkout to complete your online payment.")}
                  </p>
                  <div className="mt-5 rounded-lg bg-[#fff4e6] p-4">
                    <p className="text-xs text-[#8b8176]">{vi ? "Số tiền cần thanh toán" : "Amount to pay"}</p>
                    <p className="mt-1 text-2xl font-bold">{formatVND(payment.amount)}</p>
                    <p className="mt-2 text-xs text-[#6b7280]">
                      {vi ? "Mã tham chiếu" : "Reference"}: {payment.orderCode || String(payment.orderId).slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <div className="mt-5 flex flex-col gap-3">
                    {payment.paymentUrl && (
                      <a href={payment.paymentUrl} className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#c87916] text-sm font-semibold text-white hover:bg-[#a9600f]">
                        {vi ? "Mở trang thanh toán" : "Open secure payment"}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <button type="button" onClick={() => router.push("/user-orders")} className="h-11 rounded-lg border border-[#eadcc8] text-sm font-semibold hover:bg-[#fffaf3]">
                      {vi ? "Xem đơn hàng" : "View my order"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setMethod("online")}
                    className={`flex min-h-28 items-start gap-3 rounded-xl border p-4 text-left transition ${method === "online" ? "border-[#c87916] bg-[#fff8ee] ring-1 ring-[#c87916]" : "border-[#eadcc8] hover:bg-[#fffaf3]"}`}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#c87916] shadow-sm"><QrCode className="h-5 w-5" /></span>
                    <span>
                      <strong className="block text-sm">{vi ? "Thanh toán trực tuyến" : "Online payment"}</strong>
                      <span className="mt-1 block text-xs leading-5 text-[#6b7280]">{vi ? "Chuyển khoản payOS và VietQR. Thanh toán được xác nhận tự động." : "payOS bank transfer and VietQR. Payment is confirmed automatically."}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod("cash")}
                    className={`flex min-h-28 items-start gap-3 rounded-xl border p-4 text-left transition ${method === "cash" ? "border-[#c87916] bg-[#fff8ee] ring-1 ring-[#c87916]" : "border-[#eadcc8] hover:bg-[#fffaf3]"}`}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#c87916] shadow-sm"><Banknote className="h-5 w-5" /></span>
                    <span>
                      <strong className="block text-sm">{vi ? "Thanh toán khi nhận hàng" : "Cash on delivery"}</strong>
                      <span className="mt-1 block text-xs leading-5 text-[#6b7280]">{vi ? "Thanh toán cho đơn vị vận chuyển khi nhận hàng. Không cần thanh toán trực tuyến." : "Pay the courier when the order arrives. No online payment required."}</span>
                    </span>
                  </button>
                </div>

                <label className="mt-6 block">
                  <span className="text-sm font-semibold">{vi ? "Địa chỉ giao hàng" : "Shipping address"}</span>
                  <textarea
                    rows={3}
                    value={shippingAddress}
                    onChange={(event) => setShippingAddress(event.target.value)}
                    placeholder={vi ? "Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố" : "House number, street, ward, district, city"}
                    className="mt-2 w-full resize-none rounded-lg border border-[#d9c9b5] bg-[#fffdf9] px-4 py-3 text-sm outline-none transition focus:border-[#c87916] focus:ring-2 focus:ring-[#c87916]/15"
                    required
                  />
                </label>

                <label className="mt-5 block">
                  <span className="text-sm font-semibold">{vi ? "Mã giảm giá" : "Voucher code"}</span>
                  <div className="mt-2 flex gap-2">
                    <input
                      value={voucherCode}
                      onChange={(event) => setVoucherCode(event.target.value.toUpperCase())}
                      placeholder="STUDENT10"
                      className="h-11 min-w-0 flex-1 rounded-lg border border-[#d9c9b5] bg-[#fffdf9] px-4 text-sm uppercase outline-none transition focus:border-[#c87916] focus:ring-2 focus:ring-[#c87916]/15"
                    />
                    <button
                      type="button"
                      onClick={() => loadQuote({ showToast: true })}
                      disabled={quoteLoading}
                      className="h-11 rounded-lg border border-[#eadcc8] px-4 text-sm font-semibold hover:bg-[#fffaf3] disabled:opacity-60"
                    >
                      {quoteLoading ? (vi ? "Đang kiểm tra..." : "Checking...") : (vi ? "Áp dụng" : "Apply")}
                    </button>
                  </div>
                </label>

                <div className="mt-6 rounded-xl border border-[#eadcc8] bg-[#fffaf3] p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between text-[#6b7280]">
                      <span>{vi ? "Tạm tính" : "Subtotal"}</span>
                      <span>{formatVND(displayedPricing.subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[#6b7280]">
                      <span>{vi ? "Giảm giá" : "Voucher"} {displayedPricing.voucherCode ? `(${displayedPricing.voucherCode})` : ""}</span>
                      <span className={displayedPricing.discountAmount ? "font-semibold text-emerald-700" : ""}>
                        {displayedPricing.discountAmount ? `-${formatVND(displayedPricing.discountAmount)}` : formatVND(0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[#6b7280]">
                      <span>{vi ? "Vận chuyển" : "Shipping"} {displayedPricing.shippingLabel ? `- ${displayedPricing.shippingLabel}` : ""}</span>
                      <span className={displayedPricing.shippingFee === 0 ? "font-semibold text-emerald-700" : ""}>
                        {displayedPricing.shippingFee === 0 ? (vi ? "Miễn phí" : "Free") : formatVND(displayedPricing.shippingFee)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-[#eadcc8] pt-3">
                      <span className="font-semibold text-[#111827]">{vi ? "Tổng đơn hàng" : "Order total"}</span>
                      <span className="text-xl font-bold">{formatVND(displayedPricing.totalPrice)}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 border-t border-[#eadcc8] pt-3 text-xs text-[#6b7280]">
                    <LockKeyhole className="h-4 w-4 text-[#c87916]" />
                    {vi ? "Thông tin thanh toán do payOS xử lý và không được lưu tại 4Kay Store." : "Payment credentials are handled by payOS, not stored by 4Kay Store."}
                  </div>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button type="button" onClick={closeModal} className="h-11 rounded-lg border border-[#eadcc8] px-5 text-sm font-semibold hover:bg-[#fffaf3]">
                    {vi ? "Hủy" : "Cancel"}
                  </button>
                  <button type="submit" disabled={loading} className="h-11 rounded-lg bg-[#171717] px-6 text-sm font-semibold text-white hover:bg-[#c87916] disabled:opacity-60">
                    {loading ? (vi ? "Đang tạo đơn..." : "Creating order...") : method === "online" ? (vi ? "Tạo thanh toán bảo mật" : "Create secure payment") : (vi ? "Đặt hàng" : "Place order")}
                  </button>
                </div>
              </form>
            )}
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}
