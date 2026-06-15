"use client";

import { useAuth } from "@/app/utils/authContext";
import { createProtectedApi, publicApi } from "@/lib/apiCalls";
import { Product, RequestData } from "@/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import EditForm from "./edit-form";
import Spinner from "@/components/Spinner";
import toast from "react-hot-toast";

export type createData = {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
};

const EditProduct = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const protectedApi = user ? createProtectedApi(user.token) : null;

  const { productId } = params;

  const { data, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const product = await publicApi.getProduct(productId as string);
      return product as Product;
    },
  });

  if (isLoading || !data) {
    return (
      <div>
        <Spinner />
      </div>
    );
  }

  if (!data) {
    return <div>Product not found</div>;
  }

  const handleFormSubmit = async (formData: RequestData) => {
    if (!protectedApi) return;

    try {
      await protectedApi.admin.updateProduct(productId as string, formData);
      toast.success("Product updated successfully");
      router.push("/admin/products");
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="flex justify-center items-center max-md:justify-start">
      <EditForm onSubmit={handleFormSubmit} data={data} />
    </div>
  );
};

export default EditProduct;
