"use client";

import { useState } from "react";
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
import { PaymentSession } from "@/types";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalPrice: number;
}

type CheckoutMethod = "cash" | "online";

export default function CheckoutModal({ isOpen, onClose, totalPrice }: CheckoutModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const cart = useCart();
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<CheckoutMethod>("online");
  const [shippingAddress, setShippingAddress] = useState(user?.address || "");
  const [payment, setPayment] = useState<PaymentSession | null>(null);

  const closeModal = () => {
    if (!loading) {
      setPayment(null);
      onClose();
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!shippingAddress.trim()) {
      toast.error("Please enter a shipping address.");
      return;
    }

    setLoading(true);
    try {
      if (!user?.token) throw new Error("Unauthorized");
      const api = createProtectedApi(user.token);
      const orderResponse = await api.orders.create({
        shippingAddress: shippingAddress.trim(),
        paymentMethod: method === "cash" ? "Tiền mặt" : "Chuyển khoản",
      });

      cart.removeAllCart();

      if (method === "cash") {
        toast.success("Order placed successfully.");
        onClose();
        router.push("/user-orders");
        return;
      }

      const session = await api.payments.create(orderResponse.order._id);
      setPayment(session);
      toast.success(session.provider === "payos" ? "Secure payment is ready." : "Bank transfer instructions are ready.");
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error?.response?.data?.message || "Failed to place order");
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
                  {payment ? "Complete your payment" : "Secure checkout"}
                </Dialog.Title>
                <p className="mt-1 text-sm text-[#6b7280]">
                  {payment ? "Your order is saved. Use either option below." : "Choose how you want to pay for this order."}
                </p>
              </div>
              <button type="button" onClick={closeModal} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#eadcc8] text-[#6b7280] hover:text-[#111827]" aria-label="Close checkout">
                <X className="h-4 w-4" />
              </button>
            </div>

            {payment ? (
              <div className="grid gap-6 p-6 md:grid-cols-[220px_1fr]">
                <div className="flex min-h-52 items-center justify-center rounded-xl border border-[#eadcc8] bg-[#fffaf3] p-4">
                  {payment.qrCode ? (
                    <img src={payment.qrCode} alt="Payment QR code" className="h-48 w-48 object-contain" />
                  ) : (
                    <QrCode className="h-20 w-20 text-[#c9b9a4]" />
                  )}
                </div>
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Order created
                  </span>
                  <p className="mt-4 text-sm leading-6 text-[#6b7280]">
                    {payment.message || "Scan the QR code in your banking app or open the secure payOS checkout."}
                  </p>
                  <div className="mt-5 rounded-lg bg-[#fff4e6] p-4">
                    <p className="text-xs text-[#8b8176]">Amount to pay</p>
                    <p className="mt-1 text-2xl font-bold">{formatVND(payment.amount)}</p>
                    <p className="mt-2 text-xs text-[#6b7280]">
                      Reference: {payment.orderCode || String(payment.orderId).slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <div className="mt-5 flex flex-col gap-3">
                    {payment.paymentUrl && (
                      <a href={payment.paymentUrl} className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#c87916] text-sm font-semibold text-white hover:bg-[#a9600f]">
                        Open secure payment
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <button type="button" onClick={() => router.push("/user-orders")} className="h-11 rounded-lg border border-[#eadcc8] text-sm font-semibold hover:bg-[#fffaf3]">
                      View my order
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
                      <strong className="block text-sm">Online payment</strong>
                      <span className="mt-1 block text-xs leading-5 text-[#6b7280]">payOS bank transfer and VietQR. Payment is confirmed automatically.</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod("cash")}
                    className={`flex min-h-28 items-start gap-3 rounded-xl border p-4 text-left transition ${method === "cash" ? "border-[#c87916] bg-[#fff8ee] ring-1 ring-[#c87916]" : "border-[#eadcc8] hover:bg-[#fffaf3]"}`}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#c87916] shadow-sm"><Banknote className="h-5 w-5" /></span>
                    <span>
                      <strong className="block text-sm">Cash on delivery</strong>
                      <span className="mt-1 block text-xs leading-5 text-[#6b7280]">Pay the courier when the order arrives. No online payment required.</span>
                    </span>
                  </button>
                </div>

                <label className="mt-6 block">
                  <span className="text-sm font-semibold">Shipping address</span>
                  <textarea
                    rows={3}
                    value={shippingAddress}
                    onChange={(event) => setShippingAddress(event.target.value)}
                    placeholder="House number, street, ward, district, city"
                    className="mt-2 w-full resize-none rounded-lg border border-[#d9c9b5] bg-[#fffdf9] px-4 py-3 text-sm outline-none transition focus:border-[#c87916] focus:ring-2 focus:ring-[#c87916]/15"
                    required
                  />
                </label>

                <div className="mt-6 rounded-xl border border-[#eadcc8] bg-[#fffaf3] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#6b7280]">Order total</span>
                    <span className="text-xl font-bold">{formatVND(totalPrice)}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 border-t border-[#eadcc8] pt-3 text-xs text-[#6b7280]">
                    <LockKeyhole className="h-4 w-4 text-[#c87916]" />
                    Payment credentials are handled by payOS, not stored by 4Kay Store.
                  </div>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button type="button" onClick={closeModal} className="h-11 rounded-lg border border-[#eadcc8] px-5 text-sm font-semibold hover:bg-[#fffaf3]">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="h-11 rounded-lg bg-[#171717] px-6 text-sm font-semibold text-white hover:bg-[#c87916] disabled:opacity-60">
                    {loading ? "Creating order..." : method === "online" ? "Create secure payment" : "Place order"}
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
