import { ReactNode } from "react";
import { AdminCard } from "../admin-ui";

export default function ChartCard({ title, subtitle, children, className = "" }: { title: string; subtitle: string; children: ReactNode; className?: string }) {
  return <AdminCard className={className}><header className="border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-slate-900">{title}</h2><p className="mt-1 text-xs text-slate-500">{subtitle}</p></header><div className="p-4 sm:p-5">{children}</div></AdminCard>;
}
