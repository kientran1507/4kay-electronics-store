"use client";

import TitleHeader from "../components/title-header";
import { CircleDollarSign, Package, ShoppingCart, TrendingUp, Users, WalletCards } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/app/utils/authContext";
import { createProtectedApi, publicApi } from "@/lib/apiCalls";
import { Order, Product } from "@/types";
import StatsCard from "../components/stats-card";
import MonthlyRevenue from "../components/dashboard-charts/monthly-revenue";
import CustomPieChart from "../components/dashboard-charts/pie-chart";
import TopProducts from "../components/dashboard-charts/top-products";
import SalesLineChart from "../components/dashboard-charts/sales-line-chart";
import formatVND from "@/app/utils/formatCurrency";

const completedStatuses = new Set(["Hoàn thành"]);
const isRevenueOrder = (order: Order) => order.paymentStatus === "paid" || completedStatuses.has(order.status);

export default function AdminPage() {
  const { user } = useAuth();
  const api = user ? createProtectedApi(user.token) : null;

  const dashboard = useQuery({
    queryKey: ["admin-dashboard"],
    enabled: Boolean(api),
    queryFn: async () => {
      if (!api) throw new Error("Not authenticated");
      const [orderResponse, productResponse, customerResponse] = await Promise.all([
        api.admin.getAllOrders(),
        publicApi.getAllProducts({ limit: 1000 }),
        api.admin.getAllCustomers(1, 1),
      ]);
      const orders = orderResponse.orders as Order[];
      const products = productResponse.products as Product[];
      const revenueOrders = orders.filter(isRevenueOrder);
      const totalSales = revenueOrders.reduce((sum, order) => sum + order.totalPrice, 0);
      const productMap = new Map(products.map((product) => [product._id, product]));

      const monthKeys = Array.from({ length: 6 }, (_, index) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - index), 1);
        return { key: `${date.getFullYear()}-${date.getMonth()}`, label: date.toLocaleDateString("en-US", { month: "short" }) };
      });
      const monthTotals = new Map(monthKeys.map((month) => [month.key, 0]));
      revenueOrders.forEach((order) => {
        const date = new Date(order.createdAt);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        if (monthTotals.has(key)) monthTotals.set(key, (monthTotals.get(key) || 0) + order.totalPrice);
      });

      const categoryTotals = new Map<string, number>();
      const productTotals = new Map<string, number>();
      revenueOrders.forEach((order) => order.items.forEach((item) => {
        const rawProduct = item.productId as any;
        const product = typeof rawProduct === "object" ? rawProduct : productMap.get(rawProduct);
        const productId = typeof rawProduct === "object" ? rawProduct?._id : rawProduct;
        const catalogProduct = productMap.get(productId) || product;
        const category = catalogProduct?.category || "Other";
        const name = catalogProduct?.name || product?.name || "Unknown product";
        categoryTotals.set(category, (categoryTotals.get(category) || 0) + item.quantity);
        productTotals.set(name, (productTotals.get(name) || 0) + item.quantity);
      }));

      const statusTotals = new Map<string, number>();
      orders.forEach((order) => statusTotals.set(order.status, (statusTotals.get(order.status) || 0) + 1));
      const last7Days = Array.from({ length: 7 }, (_, index) => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - (6 - index));
        const key = date.toISOString().slice(0, 10);
        const amount = revenueOrders.filter((order) => new Date(order.createdAt).toISOString().slice(0, 10) === key).reduce((sum, order) => sum + order.totalPrice, 0);
        return { date: key, amount };
      });

      const now = new Date();
      const currentRevenue = revenueOrders.filter((order) => {
        const date = new Date(order.createdAt);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }).reduce((sum, order) => sum + order.totalPrice, 0);
      const previous = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const previousRevenue = revenueOrders.filter((order) => {
        const date = new Date(order.createdAt);
        return date.getMonth() === previous.getMonth() && date.getFullYear() === previous.getFullYear();
      }).reduce((sum, order) => sum + order.totalPrice, 0);
      const growth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : currentRevenue > 0 ? 100 : 0;

      return {
        totalSales,
        totalOrders: orders.length,
        totalCustomers: customerResponse.totalCustomers,
        totalStock: products.reduce((sum, product) => sum + (product.stock || 0), 0),
        averageOrderValue: revenueOrders.length ? totalSales / revenueOrders.length : 0,
        growth,
        monthlyRevenue: monthKeys.map((month) => ({ month: month.label, value: monthTotals.get(month.key) || 0 })),
        categoryData: Array.from(categoryTotals, ([name, value]) => ({ name, value })),
        statusData: Array.from(statusTotals, ([name, value]) => ({ name, value })),
        topProducts: Array.from(productTotals, ([name, quantity]) => ({ name, quantity })).sort((a, b) => b.quantity - a.quantity).slice(0, 5),
        salesData: last7Days,
      };
    },
  });

  return (
    <div className="mx-auto w-full max-w-[1500px] p-4 sm:p-7">
      <TitleHeader title="Dashboard" description="A live overview of store performance and operations." />
      {dashboard.isError && <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Dashboard data could not be loaded. Refresh the page or check the backend connection.</div>}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatsCard title="Total sales" value={formatVND(dashboard.data?.totalSales || 0)} icon={CircleDollarSign} loading={dashboard.isLoading} />
        <StatsCard title="Total orders" value={dashboard.data?.totalOrders || 0} icon={ShoppingCart} loading={dashboard.isLoading} />
        <StatsCard title="Total customers" value={dashboard.data?.totalCustomers || 0} icon={Users} loading={dashboard.isLoading} />
        <StatsCard title="Products in stock" value={(dashboard.data?.totalStock || 0).toLocaleString("vi-VN")} icon={Package} loading={dashboard.isLoading} />
        <StatsCard title="Average order value" value={formatVND(dashboard.data?.averageOrderValue || 0)} icon={WalletCards} loading={dashboard.isLoading} />
        <StatsCard title="Monthly revenue growth" value={`${(dashboard.data?.growth || 0).toFixed(1)}%`} icon={TrendingUp} trend={dashboard.data && dashboard.data.growth >= 0 ? "Compared with last month" : "Below last month"} loading={dashboard.isLoading} />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <MonthlyRevenue data={dashboard.data?.monthlyRevenue || []} />
        <CustomPieChart title="Product category sales" subtitle="Units sold by product category" data={dashboard.data?.categoryData || []} singleMessage="Only one category has sales data." />
        <CustomPieChart title="Order status distribution" subtitle="Current order workflow breakdown" data={dashboard.data?.statusData || []} />
        <TopProducts data={dashboard.data?.topProducts || []} />
        <SalesLineChart data={dashboard.data?.salesData || []} />
      </div>
    </div>
  );
}
