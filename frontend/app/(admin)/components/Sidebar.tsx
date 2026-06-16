import NavItem from "./nav-item";

const Sidebar = () => {
  return (
    <aside className="relative h-[calc(100vh-72px)] w-full overflow-y-auto overflow-x-hidden border-r border-slate-200 bg-white px-4 py-6 text-sm font-medium lg:fixed lg:w-64">
      <p className="mb-3 px-3 text-[11px] font-bold uppercase text-slate-400">Store management</p>
      <NavItem />
      <div className="absolute inset-x-4 bottom-5 rounded-xl border border-emerald-100 bg-emerald-50 p-3">
        <p className="text-xs font-semibold text-emerald-900">4Kay operations</p>
        <p className="mt-1 text-xs leading-5 text-emerald-700">Catalog, customers and orders in one workspace.</p>
      </div>
    </aside>
  );
};

export default Sidebar;
