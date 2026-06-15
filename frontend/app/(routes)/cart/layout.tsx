"use client";

import { useAuth } from "@/app/utils/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const CartLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'customer') {
      router.push('/customer-sign-in');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'customer') {
    return null;
  }

  return children;
};

export default CartLayout;
