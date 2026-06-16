"use client";

import { AdminCard, AdminSelect, EmptyState, TableSearch, TableSkeleton } from "@/app/(admin)/components/admin-ui";
import TitleHeader from "@/app/(admin)/components/title-header";
import { useAuth } from "@/app/utils/authContext";
import formatVND from "@/app/utils/formatCurrency";
import { createProtectedApi } from "@/lib/apiCalls";
import { Order } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CSSProperties, useMemo, useState } from "react";
import toast from "react-hot-toast";

const orderStatuses: Order["status"][] = ["Chờ thanh toán", "Chờ xử lý", "Đang giao", "Hoàn thành", "Đã hủy"];

function statusStyle(status: string): CSSProperties {
  const raw = status.toLowerCase();
  const plain = raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (plain.includes("hoan") || raw.includes("hoã")) {
    return { borderColor: "#a7f3d0", backgroundColor: "#ecfdf5", color: "#047857" };
  }
  if (plain.includes("huy") || raw.includes("hủy") || raw.includes("hÃ¡Â»Â§y".toLowerCase())) {
    return { borderColor: "#fecaca", backgroundColor: "#fef2f2", color: "#dc2626" };
  }
  if (plain.includes("dang") || raw.includes("giao")) {
    return { borderColor: "#ddd6fe", backgroundColor: "#f5f3ff", color: "#7c3aed" };
  }
  if (plain.includes("thanh toan") || raw.includes("thanh to")) {
    return { borderColor: "#fed7aa", backgroundColor: "#fff7ed", color: "#c2410c" };
  }
  return { borderColor: "#bae6fd", backgroundColor: "#f0f9ff", color: "#0369a1" };
}

function PaymentBadge({ status }: { status?: Order["paymentStatus"] }) {
  const paid = status === "paid";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${paid ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{paid ? "Paid" : status || "Unpaid"}</span>;
}

export default function TableOrders() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const api = user ? createProtectedApi(user.token) : null;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");

  const ordersQuery = useQuery<{ message: string; orders: Order[] }>({
    queryKey: ["orders"],
    enabled: Boolean(api),
    queryFn: () => {
      if (!api) throw new Error("Not authenticated");
      return api.admin.getAllOrders();
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ orderId, nextStatus }: { orderId: string; nextStatus: Order["status"] }) => {
      if (!api) throw new Error("Not authenticated");
      return api.admin.updateOrderStatus(orderId, nextStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      toast.success("Order status updated");
    },
    onError: () => toast.error("Could not update order status"),
  });

  const orders = useMemo(() => (ordersQuery.data?.orders || [])
    .filter((order) => {
      const products = order.items.map((item) => (item.productId as any)?.name || "").join(" ");
      const searchText = `${order._id} ${order.shippingAddress} ${order.paymentMethod} ${products}`.toLowerCase();
      return (status === "all" || order.status === status) && searchText.includes(query.toLowerCase());
    })
    .sort((a, b) => {
      if (sort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sort === "total-high") return b.totalPrice - a.totalPrice;
      if (sort === "total-low") return a.totalPrice - b.totalPrice;
      if (sort === "status") return a.status.localeCompare(b.status);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }), [ordersQuery.data, query, status, sort]);

  const statusOptions = [{ value: "all", label: "All statuses" }, ...orderStatuses.map((item) => ({ value: item, label: item }))];
  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "total-high", label: "Total: high to low" },
    { value: "total-low", label: "Total: low to high" },
    { value: "status", label: "Status: A to Z" },
  ];
  const pageSizeOptions = [{ value: 10, label: "10 / page" }, { value: 20, label: "20 / page" }];
  const pageCount = Math.max(1, Math.ceil(orders.length / pageSize));
  const rows = orders.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <TitleHeader title="Orders" count={ordersQuery.data?.orders.length || 0} description="Track payments, fulfilment, and customer deliveries." />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <TableSearch value={query} onChange={(value) => { setQuery(value); setPage(1); }} placeholder="Search order, product, or address..." />
        <AdminSelect value={status} onChange={(value) => { setStatus(String(value)); setPage(1); }} options={statusOptions} />
        <AdminSelect value={sort} onChange={(value) => setSort(String(value))} options={sortOptions} className="sm:min-w-[210px]" />
      </div>
      <AdminCard className="overflow-hidden">
        {ordersQuery.isLoading ? <TableSkeleton /> : ordersQuery.isError ? <EmptyState title="Could not load orders" description="Check the backend connection and try again." /> : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                  <tr><th className="px-5 py-3">Order</th><th className="px-4 py-3">Items</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Payment status</th><th className="px-4 py-3">Order status</th><th className="px-5 py-3">Date</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((order) => (
                    <tr key={order._id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-3"><p className="font-semibold text-slate-900">#{order._id.slice(-8).toUpperCase()}</p><p className="mt-1 max-w-52 truncate text-xs text-slate-500" title={order.shippingAddress}>{order.shippingAddress}</p></td>
                      <td className="px-4 py-3"><p className="font-medium">{order.items.length} item{order.items.length === 1 ? "" : "s"}</p><p className="max-w-48 truncate text-xs text-slate-500">{order.items.map((item) => (item.productId as any)?.name).filter(Boolean).join(", ") || "Product details unavailable"}</p></td>
                      <td className="px-4 py-3 font-semibold">{formatVND(order.totalPrice)}</td>
                      <td className="px-4 py-3"><p className="font-medium">{order.paymentProvider === "payos" ? "PayOS" : order.paymentMethod}</p><p className="text-xs capitalize text-slate-500">{order.paymentProvider?.replaceAll("_", " ")}</p></td>
                      <td className="px-4 py-3"><PaymentBadge status={order.paymentStatus} /></td>
                      <td className="px-4 py-3"><AdminSelect value={order.status} disabled={updateStatus.isPending} onChange={(value) => updateStatus.mutate({ orderId: order._id, nextStatus: value as Order["status"] })} options={orderStatuses.map((item) => ({ value: item, label: item }))} className="min-w-[170px]" triggerClassName="rounded-full text-xs font-semibold shadow-none" triggerStyle={statusStyle(order.status)} /></td>
                      <td className="px-5 py-3 text-slate-500">{new Date(order.createdAt).toLocaleDateString("en-GB")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!rows.length && <EmptyState title="No orders found" description="Try changing the search or status filter." />}
          </>
        )}
      </AdminCard>
      <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3"><span>{orders.length} results</span><AdminSelect value={pageSize} onChange={(value) => { setPageSize(Number(value)); setPage(1); }} options={pageSizeOptions} className="min-w-[128px]" /></div>
        <div className="flex items-center gap-2"><button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><span className="min-w-24 text-center">Page {page} of {pageCount}</span><button onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={page === pageCount} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div>
      </div>
    </>
  );
}
