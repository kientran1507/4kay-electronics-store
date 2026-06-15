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
    <div className="h-full">
      <Navbar />
      <main className="pt-14 flex h-full gap-x-7">
        <div className="w-64 shrink-0 hidden md:block">
          <Sidebar />
        </div>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
