import { EmptyState } from "../admin-ui";
import ChartCard from "./chart-card";

export default function TopProducts({ data }: { data: Array<{ name: string; quantity: number }> }) {
  const maximum = Math.max(...data.map((item) => item.quantity), 1);
  return <ChartCard title="Top selling products" subtitle="Products ranked by units sold">{data.length ? <div className="space-y-5 py-2">{data.map((product, index) => <div key={product.name}><div className="mb-2 flex items-center justify-between gap-4"><div className="flex min-w-0 items-center gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">{index + 1}</span><p className="truncate text-sm font-semibold text-slate-800">{product.name}</p></div><span className="text-sm font-bold text-slate-950">{product.quantity}</span></div><div className="ml-10 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.max(8, (product.quantity / maximum) * 100)}%` }} /></div></div>)}</div> : <EmptyState title="No product sales yet" description="Product rankings appear after completed orders." />}</ChartCard>;
}
