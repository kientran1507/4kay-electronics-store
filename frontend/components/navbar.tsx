"use client";

import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "./Logo";
import NavbarActions from "./navbar-actions";
import NavbarSearch from "./navbar-search";
import NavItem from "./nav-item";
import { Button } from "./ui/button";
import { useAuth } from "@/app/utils/authContext";

const NavBar = () => {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 border-b border-[#eee5d9] bg-[#fffdfa]/95 backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-[1320px] items-center gap-5 px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden flex-1 justify-center lg:flex">
          <NavItem />
        </nav>
        <div className="hidden w-[340px] lg:block xl:w-[380px]">
          <NavbarSearch />
        </div>
        <div className="ml-auto flex items-center gap-1">
          <button type="button" onClick={() => setMobileOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-md lg:hidden" title="Search">
            <Search className="h-5 w-5" />
          </button>
          <NavbarActions />
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((open) => !open)}
                className="flex h-9 items-center rounded-md border border-[#e8ddcf] px-3 text-xs font-semibold"
              >
                {user.name}
              </button>
              {accountOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-md border bg-white p-1 shadow-lg">
                  <button className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-gray-50" onClick={() => router.push("/user-orders")}>
                    My orders
                  </button>
                  <button
                    className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-gray-50"
                    onClick={() => {
                      logout();
                      router.push("/");
                    }}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="outline" size="sm" className="rounded-md border-[#e8ddcf]" asChild>
                <Link href="/customer-sign-in">Sign in</Link>
              </Button>
            </div>
          )}
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="flex h-9 w-9 items-center justify-center rounded-md lg:hidden"
            title="Open menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="border-t border-[#eee5d9] bg-white px-4 py-4 lg:hidden">
          <NavbarSearch />
          <div className="mt-3">
            <NavItem />
          </div>
          {!user && <Link href="/customer-sign-in" className="mt-3 block rounded-lg border border-[#eadcc8] px-3 py-2 text-sm font-semibold">Sign in</Link>}
        </div>
      )}
    </header>
  );
};

export default NavBar;
