"use client";

import { EmptyState } from "../admin-ui";
import ChartCard from "./chart-card";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#059669", "#0ea5e9", "#f59e0b", "#8b5cf6", "#f43f5e", "#64748b"];

export default function CustomPieChart({ data, title, subtitle, singleMessage }: { data: Array<{ name: string; value: number }>; title: string; subtitle: string; singleMessage?: string }) {
  return <ChartCard title={title} subtitle={subtitle}>{!data.length ? <EmptyState title="No data available" description="This chart will populate as orders are processed." /> : <><div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius={58} outerRadius={88} paddingAngle={data.length > 1 ? 3 : 0} strokeWidth={0}>{data.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0" }} /><Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} /></PieChart></ResponsiveContainer></div>{data.length === 1 && <p className="mt-1 rounded-xl bg-slate-50 px-3 py-2 text-center text-xs text-slate-500">{singleMessage || "Only one segment currently has data."}</p>}</>}</ChartCard>;
}
