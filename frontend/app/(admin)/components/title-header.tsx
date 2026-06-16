import React from "react";

type Props = {
  title: string;
  description: string;
  count?: number;
  action?: React.ReactNode;
};

const TitleHeader = ({ title, description, count, action }: Props) => {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400"><span>Admin</span><span>/</span><span className="text-slate-600">{title}</span></div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">{title}</h1>
          {count !== undefined && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{count}</span>}
        </div>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  );
};

export default TitleHeader;
