"use client";

import { useAuth } from "@/app/utils/authContext";
import { createProtectedApi } from "@/lib/apiCalls";
import { RequestData } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

type initialState = {
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  stock: string;
};

const AddProduct = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const protectedApi = user ? createProtectedApi(user.token) : null;
  const [dataForm, setDataForm] = useState<initialState>({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
    stock: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
    stock: "",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const imageUrl = e.target.value.trim();
    setDataForm((prevData) => ({ ...prevData, image: imageUrl }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!protectedApi) return;

    setIsLoading(true);
    setErrors({
      name: "",
      description: "",
      price: "",
      image: "",
      category: "",
      stock: "",
    });

    // Validate form data
    if (
      !dataForm.name ||
      dataForm.name.length < 4 ||
      !dataForm.description ||
      dataForm.description.length < 4 ||
      !dataForm.price ||
      !dataForm.category ||
      !dataForm.image ||
      !dataForm.stock
    ) {
      setIsLoading(false);
      setErrors((prevErrors) => ({
        ...prevErrors,
        name:
          dataForm.name.length < 4
            ? "Name must be at least 4 characters"
            : "",
        description:
          dataForm.description.length < 4
            ? "Description must be at least 4 characters"
            : "",
        price: !dataForm.price ? "Please enter a price" : "",
        image: !dataForm.image ? "Please provide an image URL" : "",
        category: !dataForm.category ? "Please select a category" : "",
        stock: !dataForm.stock ? "Please enter stock quantity" : "",
      }));

      return;
    }

    const requestData: RequestData = {
      name: dataForm.name,
      description: dataForm.description,
      price: parseInt(dataForm.price),
      image: dataForm.image,
      category: dataForm.category,
      stock: parseInt(dataForm.stock),
    };

    try {
      await protectedApi.admin.createProduct(requestData);
      toast.success("Product created successfully");

      router.push("/admin/products");
    } catch (error) {
      toast.error("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center max-md:justify-start">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-y-2 max-md:min-w-[90%] min-w-[70%] border p-4 "
      >
        <label htmlFor="name">Enter Product Name</label>
        <Input
          value={dataForm.name}
          type="text"
          id="name"
          name="name"
          required
          placeholder="Enter Product name"
          onChange={(e) => setDataForm({ ...dataForm, name: e.target.value })}
        />
        {errors.name && <p className="text-red-500">{errors.name}</p>}

        <label htmlFor="price">Enter Product Price</label>
        <Input
          value={dataForm.price}
          type="number"
          id="price"
          min={1}
          name="price"
          required
          placeholder="Enter Product price"
          onChange={(e) => setDataForm({ ...dataForm, price: e.target.value })}
        />
        {errors.price && <p className="text-red-500">{errors.price}</p>}

        <label htmlFor="category">Enter Product Category</label>
        <Input
          value={dataForm.category}
          type="text"
          id="category"
          name="category"
          required
          placeholder="Enter Product category"
          onChange={(e) =>
            setDataForm({ ...dataForm, category: e.target.value })
          }
        />
        {errors.category && <p className="text-red-500">{errors.category}</p>}

        <label htmlFor="description">Enter Product Description</label>
        <Input
          value={dataForm.description}
          type="text"
          id="description"
          name="description"
          required
          placeholder="Enter Product description"
          onChange={(e) =>
            setDataForm({ ...dataForm, description: e.target.value })
          }
        />
        {errors.description && (
          <p className="text-red-500">{errors.description}</p>
        )}

        <label htmlFor="image">Enter Product Image URL</label>
        <Input
          type="text"
          id="image"
          name="image"
          required
          placeholder="Enter Image URL"
          value={dataForm.image}
          onChange={handleImageChange}
        />
        {errors.image && <p className="text-red-500">{errors.image}</p>}

        <label htmlFor="stock">Enter Product Stock</label>
        <Input
          value={dataForm.stock}
          type="number"
          id="stock"
          min={0}
          name="stock"
          required
          placeholder="Enter Product stock"
          onChange={(e) => setDataForm({ ...dataForm, stock: e.target.value })}
        />
        {errors.stock && <p className="text-red-500">{errors.stock}</p>}

        <Button disabled={isLoading} className="mt-2 bg-green-600">
          Add Product
        </Button>
      </form>
    </div>
  );
};

export default AddProduct;
