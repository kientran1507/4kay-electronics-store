"use client";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { redirect } from "next/navigation";
import { useAuth } from "@/app/utils/authContext";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  if (!user || user.role !== "admin") {
    redirect("/admin-sign-in");
  }

  return (
    <div className="h-screen overflow-hidden bg-slate-50 text-slate-950">
      <Navbar />
      <main className="flex h-screen min-w-0 overflow-hidden pt-[72px]">
        <div className="hidden w-64 shrink-0 lg:block">
          <Sidebar />
        </div>
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden" style={{ scrollbarGutter: "stable" }}>{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
