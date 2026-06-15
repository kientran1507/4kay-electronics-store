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
    <div className="p-4 mt-2 w-3/4 max-md:w-full mx-auto">
      <ProductTable />
    </div>
  );
};

export default ProductsPage;
