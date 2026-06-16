"use client";

import formatVND from "@/app/utils/formatCurrency";
import { EmptyState } from "../admin-ui";
import ChartCard from "./chart-card";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function MonthlyRevenue({ data = [] }: { data: Array<{ month: string; value: number }> }) {
  return <ChartCard title="Monthly revenue" subtitle="Completed and paid order value by month">{data.some((item) => item.value > 0) ? <div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ left: 4, right: 8, top: 8 }}><CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 4" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} /><YAxis axisLine={false} tickLine={false} width={58} tick={{ fill: "#64748b", fontSize: 12 }} tickFormatter={(value) => new Intl.NumberFormat("vi-VN", { notation: "compact" }).format(value)} /><Tooltip cursor={{ fill: "#f1f5f9" }} formatter={(value) => formatVND(Number(value))} contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0" }} /><Bar dataKey="value" name="Revenue" fill="#059669" radius={[7, 7, 2, 2]} maxBarSize={48} /></BarChart></ResponsiveContainer></div> : <EmptyState title="No revenue data yet" description="Completed paid orders will appear here." />}</ChartCard>;
}
