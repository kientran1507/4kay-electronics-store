"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/utils/authContext";

interface Route {
  label: string;
  href: string;
  role?: 'admin' | 'customer' | 'all';
}

const NavItem = () => { 
  const pathname = usePathname();
  const { user } = useAuth();

  const routes: Route[] = [
    {
      label: "Shop",
      href: "/shop",
      role: "all"
    },
    {
      label: "Categories",
      href: "/categories",
      role: "all"
    },
    {
      label: "Guides",
      href: "/guides",
      role: "all"
    },
    {
      label: "Support",
      href: "/support",
      role: "all"
    }
  ];

  const filteredRoutes = routes.filter(route => {
    if (route.role === "all") return true;
    if (!user) return false;
    if (route.role === user.role) return true;
    return false;
  });

  return (
    <div className="flex items-center gap-1 max-lg:flex-col max-lg:items-start">
      {filteredRoutes.map((route) => (
        <Link 
          key={`${route.label}-${route.href}`}
          href={route.href} 
          className={`relative px-3 py-2 text-xs font-medium transition-colors duration-200
            ${pathname === route.href || pathname.startsWith(`${route.href}/`)
              ? "text-[#b76b11] after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-[#c77818]"
              : "text-[#4f4a44] hover:text-[#a75f0d]"}`}
        >
          {route.label}
        </Link>
      ))}
    </div>
  );
};

export default NavItem;
