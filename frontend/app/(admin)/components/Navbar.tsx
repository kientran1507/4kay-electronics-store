"use client";

import { useAuth } from "@/app/utils/authContext";
import { Bell, ChevronDown, ExternalLink, LogOut, Search, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import MobileSidebar from "./mobile-sidebar";
import Sidebar from "./Sidebar";

const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const value = search.trim();
    if (value) router.push(`/admin/products?search=${encodeURIComponent(value)}`);
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex h-[72px] items-center border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      <div className="flex w-full items-center gap-4">
        <div className="flex w-64 shrink-0 items-center gap-3">
          <MobileSidebar><Sidebar /></MobileSidebar>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">4K</span>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-slate-950">4Kay Store</p>
            <p className="text-xs text-slate-500">Admin panel</p>
          </div>
        </div>
        <form onSubmit={submitSearch} className="mx-auto hidden max-w-xl flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 lg:flex">
          <Search className="h-4 w-4 text-slate-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="Search products, orders, users..." />
        </form>
        <div className="relative ml-auto flex items-center gap-2">
          <button onClick={() => { setNotificationsOpen((value) => !value); setProfileOpen(false); }} className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50" aria-label="Notifications">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          </button>
          {notificationsOpen && <div className="absolute right-14 top-12 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl"><p className="px-2 pb-2 text-sm font-bold text-slate-900">Notifications</p><div className="space-y-2"><div className="rounded-xl bg-emerald-50 p-3"><p className="text-sm font-semibold text-emerald-900">Admin dashboard updated</p><p className="mt-1 text-xs text-emerald-700">Tables now support inline editing and filtering.</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-sm font-semibold text-slate-900">Payment reminder</p><p className="mt-1 text-xs text-slate-500">Check pending PayOS orders from the orders page.</p></div></div></div>}
          <button onClick={() => { setProfileOpen((value) => !value); setNotificationsOpen(false); }} className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-2.5 text-left transition hover:bg-slate-50" title="Open profile menu">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-700">{user?.name?.slice(0, 2).toUpperCase() || "AD"}</span>
            <span className="hidden md:block"><span className="block max-w-28 truncate text-xs font-semibold">{user?.name || "Administrator"}</span><span className="block text-[11px] text-slate-500">Administrator</span></span>
            <ChevronDown className="hidden h-4 w-4 text-slate-400 md:block" />
          </button>
          {profileOpen && <div className="absolute right-0 top-12 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"><div className="border-b border-slate-100 px-3 py-3"><p className="text-sm font-bold">{user?.name || "Administrator"}</p><p className="truncate text-xs text-slate-500">{user?.email}</p></div><Link href="/admin" className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-slate-50"><UserRound className="h-4 w-4" /> Admin dashboard</Link><Link href="/" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-slate-50"><ExternalLink className="h-4 w-4" /> View storefront</Link><button onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"><LogOut className="h-4 w-4" /> Sign out</button></div>}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
