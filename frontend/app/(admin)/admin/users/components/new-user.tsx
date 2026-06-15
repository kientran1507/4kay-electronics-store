"use client";
import { Customer } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/app/utils/authContext";
import { createProtectedApi } from "@/lib/apiCalls";

type CustomerFormData = Omit<Customer, '_id' | 'createdAt' | 'updatedAt'>;

const NewCustomer = () => {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const customerId = params.userId as string;

  const isEditMode = !!customerId;
  const initialState: CustomerFormData = {
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  };

  const [formData, setFormData] = useState<CustomerFormData>(initialState);
  const [errors, setErrors] = useState<Partial<CustomerFormData>>({});

  const { data: customerData } = useQuery({
    queryKey: ["getCustomer", customerId],
    queryFn: async () => {
      if (!isEditMode || !user?.token) return null;
      const api = createProtectedApi(user.token);
      const data = await api.admin.getCustomerById(customerId);
      setFormData({
        name: data.name,
        email: data.email,
        password: "",
        phone: data.phone || "",
        address: data.address || "",
      });
      return data;
    },
    enabled: isEditMode && !!user?.token,
  });

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.token) {
      toast.error("Unauthorized");
      return;
    }

    setErrors({});

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

    if (!formData.email || !emailRegex.test(formData.email)) {
      setErrors((prev) => ({ ...prev, email: "Invalid email address." }));
      return;
    }

    if (!isEditMode && (!formData.password || !passwordRegex.test(formData.password))) {
      setErrors((prev) => ({
        ...prev,
        password: "Password must have one uppercase letter, one number, and one special character.",
      }));
      return;
    }

    try {
      const api = createProtectedApi(user.token);
      
      if (isEditMode) {
        await api.admin.updateCustomer(customerId, formData);
        toast.success("User updated successfully");
      } else {
        await api.admin.createCustomer(formData);
        toast.success("User created successfully");
      }
      
      router.push("/admin/users");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Operation failed");
    }
  };

  return (
    <>
      <form onSubmit={onSubmitHandler}>
        <div className="flex gap-10 max-md:flex-col">
          <div className="flex flex-col gap-y-2">
            <label htmlFor="name" className="font-semibold">
              Name
            </label>
            <Input
              value={formData.name}
              type="text"
              name="name"
              id="name"
              required
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <label htmlFor="email" className="font-semibold">
              Email
            </label>
            <Input
              value={formData.email}
              type="email"
              name="email"
              id="email"
              required
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {errors.email && <p className="text-red-500">{errors.email}</p>}
          </div>

          <div className="flex flex-col gap-y-2">
            <label htmlFor="password" className="font-semibold">
              Password
            </label>
            <Input
              value={isEditMode ? "********" : formData.password}
              disabled={isEditMode}
              type="password"
              name="password"
              id="password"
              required={!isEditMode}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            {errors.password && <p className="text-red-500">{errors.password}</p>}
            <label htmlFor="phone" className="font-semibold">
              Phone
            </label>
            <Input
              value={formData.phone}
              type="tel"
              name="phone"
              id="phone"
              required
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <label htmlFor="address" className="font-semibold">
              Address
            </label>
            <Input
              value={formData.address}
              type="text"
              name="address"
              id="address"
              required
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        </div>
        <Button type="submit" className="mt-4 px-7 bg-green-600" variant="default">
          {isEditMode ? "Edit" : "Create"}
        </Button>
      </form>
    </>
  );
};

export default NewCustomer;
