"use client";

import formatVND from "@/app/utils/formatCurrency";
import { EmptyState } from "../admin-ui";
import ChartCard from "./chart-card";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function SalesLineChart({ data }: { data: Array<{ date: string; amount: number }> }) {
  const hasSales = data.some((item) => item.amount > 0);
  return <ChartCard title="Sales last 7 days" subtitle="Daily revenue from completed paid orders" className="xl:col-span-2">{hasSales ? <div className="h-72"><ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{ left: 5, right: 12, top: 10 }}><CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 4" /><XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} tickFormatter={(value) => new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" })} /><YAxis axisLine={false} tickLine={false} width={60} tick={{ fill: "#64748b", fontSize: 12 }} tickFormatter={(value) => new Intl.NumberFormat("vi-VN", { notation: "compact" }).format(value)} /><Tooltip formatter={(value) => formatVND(Number(value))} labelFormatter={(value) => new Date(`${value}T00:00:00`).toLocaleDateString()} contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0" }} /><Line type="monotone" dataKey="amount" name="Sales" stroke="#059669" strokeWidth={3} dot={{ r: 4, fill: "#fff", strokeWidth: 2 }} activeDot={{ r: 6 }} /></LineChart></ResponsiveContainer></div> : <EmptyState title="No sales in the last 7 days" description="New completed payments will be plotted here automatically." />}</ChartCard>;
}
