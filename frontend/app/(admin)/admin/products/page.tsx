"use client";

import { useAuth } from "@/app/utils/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ProductTable from "./components/table-products";

const ProductsPage = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/admin-sign-in');
    }
  }, [isAuthenticated, isAdmin, router]);

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="mx-auto mt-2 w-full max-w-[1500px] p-5 sm:p-7">
      <ProductTable />
    </div>
  );
};

export default ProductsPage;
