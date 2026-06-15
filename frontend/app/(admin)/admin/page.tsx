"use client";

import React from "react";
import TitleHeader from "../components/title-header";
import { CreditCard, Package, Users, ShoppingCart, TrendingUp, Calendar } from "lucide-react";
import { useQueries } from "@tanstack/react-query";
import { useAuth } from "@/app/utils/authContext";
import { createProtectedApi, publicApi } from "@/lib/apiCalls";
import { Order } from "@/types";
import StatsCard from "../components/stats-card";
import MonthlyRevenue from "../components/dashboard-charts/monthly-revenue";
import CustomPieChart from "../components/dashboard-charts/pie-chart";
import TopProducts from "../components/dashboard-charts/top-products";
import SalesLineChart from "../components/dashboard-charts/sales-line-chart";
import formatDate from "@/app/utils/formateDate"; 
import formatVND from "@/app/utils/formatCurrency";

const AdminPage = () => {
  const { user } = useAuth();
  const protectedApi = user ? createProtectedApi(user.token) : null;

  const [orderQuery, productQuery, customerQuery, monthlyRevenueQuery] = useQueries({
    queries: [
      {
        queryKey: ["admin-orders"],
        queryFn: async () => {
          if (!protectedApi) throw new Error("Not authenticated");
          const response = await protectedApi.admin.getAllOrders();
          const orders = response.orders;
          
          // Filter paid orders
          const paidOrders = orders.filter((order: Order) => 
            order.status === 'Hoàn thành'
          );

          // Calculate current and previous month revenue
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();
          
          const currentMonthRevenue = paidOrders
            .filter((order: Order) => {
              const orderDate = new Date(order.createdAt);
              return orderDate.getMonth() === currentMonth && 
                     orderDate.getFullYear() === currentYear;
            })
            .reduce((sum: number, order: Order) => sum + order.totalPrice, 0);

          const previousMonthRevenue = paidOrders
            .filter((order: Order) => {
              const orderDate = new Date(order.createdAt);
              return orderDate.getMonth() === (currentMonth - 1) && 
                     orderDate.getFullYear() === currentYear;
            })
            .reduce((sum: number, order: Order) => sum + order.totalPrice, 0);

          const revenueGrowth = previousMonthRevenue === 0 
            ? 100 
            : ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;

          // Calculate metrics
          const totalSales = paidOrders.reduce((acc: number, order: Order) => 
            acc + order.totalPrice, 0);
          
          const averageOrderValue = paidOrders.length > 0 ? 
            totalSales / paidOrders.length : 0;

          // Create sales data for graph (last 7 days)
          const last7Days = [...Array(7)].map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return date.toISOString().split('T')[0];
          }).reverse();

          const salesData = last7Days.map(date => ({
            date: date,
            amount: paidOrders
              .filter((order: Order) => new Date(order.createdAt).toISOString().split('T')[0] === date)
              .reduce((sum: number, order: Order) => sum + order.totalPrice, 0)
          }));

          // Remove averageDailyOrders calculation
          
          return {
            totalSales,
            totalOrders: orders.length,
            averageOrderValue,
            salesData,
            revenueGrowth
          };
        },
        enabled: !!protectedApi
      },
      {
        queryKey: ["admin-products"],
        queryFn: async () => {
          const response = await publicApi.getAllProducts();
          return {
            totalProducts: response.total,
            totalStock: response.products.reduce((acc: number, product: any) => 
              acc + (product.stock || 0), 0)
          };
        }
      },
      {
        queryKey: ["admin-customers"],
        queryFn: async () => {
          if (!protectedApi) throw new Error("Not authenticated");
          const response = await protectedApi.admin.getAllCustomers();
          return response.totalCustomers;
        },
        enabled: !!protectedApi
      },
      {
        queryKey: ["monthly-revenue"],
        queryFn: async () => {
          if (!protectedApi) throw new Error("Not authenticated");
          
          const [ordersResponse, productsResponse] = await Promise.all([
            protectedApi.admin.getAllOrders(),
            publicApi.getAllProducts({ limit: 1000 })
          ]);
          
          const orders = ordersResponse.orders;
          const products = productsResponse.products;

          const productsMap = products.reduce((acc: any, product: any) => {
            acc[product._id] = {
              name: product.name,
              category: product.category
            };
            return acc;
          }, {});

          // Only consider completed orders for statistics
          const completedOrders = orders.filter((order: Order) => 
            order.status === 'Hoàn thành'
          );

          // Add some console logs to debug order filtering
          console.log('All orders:', orders);
          console.log('Completed orders:', completedOrders);

          const monthlyRevenue = completedOrders.reduce((acc: any, order: Order) => {
            const month = new Date(order.createdAt).getMonth();
            if (!acc[month]) acc[month] = 0;
            acc[month] += order.totalPrice;
            return acc;
          }, {});

          const categoryData = completedOrders.reduce((acc: any, order: Order) => {
            order.items.forEach(item => {
              // Handle both cases where productId might be an object or string
              const productId = typeof item.productId === 'object' ? 
                item.productId._id : 
                item.productId;
              
              const product = productsMap[productId];
              
              // Add console.log for debugging
              console.log('Product:', product);
              console.log('ProductId:', productId);
              
              if (product && product.category) {
                const category = product.category;
                if (!acc[category]) {
                  acc[category] = 0;
                }
                acc[category] += item.quantity;
              }
            });
            return acc;
          }, {});

          // Add console.log to check final categoryData
          console.log('Category Data:', categoryData);

          const productSales = completedOrders.reduce((acc: any, order: Order) => {
            order.items.forEach(item => {
              // Get the correct product ID whether it's a string or object
              const productId = typeof item.productId === 'object' ? 
                item.productId._id : 
                item.productId;
              
              const product = productsMap[productId];
          
              if (product) {
                const key = product.name;
                if (!acc[key]) {
                  acc[key] = {
                    name: product.name,
                    quantity: 0,
                    revenue: 0
                  };
                }
                acc[key].quantity += item.quantity;
                acc[key].revenue += item.quantity * item.price;
              }
            });
            return acc;
          }, {});

          const statusData = orders.reduce((acc: any, order: Order) => {
            if (!acc[order.status]) acc[order.status] = 0;
            acc[order.status]++;
            return acc;
          }, {});

          return {
            monthlyRevenue: Object.entries(monthlyRevenue).map(([month, value]) => ({
              month: formatDate(new Date(2024, parseInt(month))),
              value: value as number
            })),
            categoryData: Object.entries(categoryData).map(([name, value]) => ({
              name,
              value: value as number
            })),
            statusData: Object.entries(statusData).map(([name, value]) => ({
              name,
              value: value as number
            })),
            topProducts: Object.values(productSales)
              .sort((a: any, b: any) => b.quantity - a.quantity)
              .slice(0, 3) // Change to top 3 products
              .map((data: any) => ({
                name: data.name,
                quantity: data.quantity
              }))
          };
        },
        enabled: !!protectedApi
      }
    ]
  });

  if (orderQuery.isError || productQuery.isError || customerQuery.isError) {
    return <div className="p-4">Error loading dashboard data</div>;
  }

  return (
    <div className="p-4 mt-2 w-3/4 max-md:w-full mx-auto">
      <TitleHeader title="Dashboard" description="Overview of your store" />
      
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 mb-6">
        <StatsCard
          title="Total Sales"
          value={orderQuery.data ? formatVND(orderQuery.data.totalSales) : 'Loading...'}
          icon={CreditCard}
        />
        <StatsCard
          title="Total Orders"
          value={orderQuery.data?.totalOrders || 'Loading...'}
          icon={ShoppingCart}
        />
        <StatsCard
          title="Total Customers"
          value={customerQuery.data || 'Loading...'}
          icon={Users}
        />
        <StatsCard
          title="Products In Stock"
          value={productQuery.data?.totalStock || 'Loading...'}
          icon={Package}
        />
        <StatsCard
          title="Average Order Value"
          value={orderQuery.data ? formatVND(orderQuery.data.averageOrderValue) : 'Loading...'}
          icon={TrendingUp}
        />
        <StatsCard
          title="Monthly Revenue Growth"
          value={orderQuery.data ? 
            `${orderQuery.data.revenueGrowth.toFixed(1)}%` : 
            'Loading...'}
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <MonthlyRevenue data={monthlyRevenueQuery.data?.monthlyRevenue || []} />
        <CustomPieChart 
          title="Product Category Sales"
          data={monthlyRevenueQuery.data?.categoryData || []}
        />
        <CustomPieChart 
          title="Order Status Distribution"
          data={monthlyRevenueQuery.data?.statusData || []}
          innerRadius={60}
        />
        <TopProducts data={monthlyRevenueQuery.data?.topProducts || []} />
      </div>

      <SalesLineChart data={orderQuery.data?.salesData || []} />
    </div>
  );
};

export default AdminPage;
