"use client";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, ReceiptText, ShieldCheck, Users } from "lucide-react";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: `/admin`,
  },
  {
    label: "Orders",
    icon: ReceiptText,
    href: `/admin/orders`,
  },
  {
    label: "Products",
    icon: Package,
    href: `/admin/products`,
  },
  {
    label: "Customers",
    icon: Users,
    href: `/admin/users`,
  },
  {
    label: "Administrators",
    icon: ShieldCheck,
    href: `/admin/admins`,
  },
];

const NavItem = () => {
  const router = useRouter();
  const pathname = usePathname();

  const onClickHandler = (href: string) => {
    router.push(href);
  };

  return (
    <div className="flex flex-col gap-1">
      {routes.map((route) => {
        const Icon = route.icon;
        const active = pathname === route.href || (route.href !== "/admin" && pathname.startsWith(route.href));
        return (
        <button
          onClick={() => onClickHandler(route.href)}
          key={route.href}
          className={`relative flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium transition ${
            active
              ? "bg-emerald-50 text-emerald-800"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
          }`}
        >
          {active && <span className="absolute -left-4 h-6 w-1 rounded-r-full bg-emerald-600" />}
          <Icon className="h-[18px] w-[18px]" />
          {route.label}
        </button>
      )})}
    </div>
  );
};

export default NavItem;
