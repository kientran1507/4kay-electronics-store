"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/utils/authContext";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/apiCalls";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { setUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await adminApi.login({ email, password });
      setUser(data.user);
      router.push("/admin"); // Redirect to admin dashboard
    } catch (err: any) {
      setError(err.message || "Invalid login credentials");
    }
  };

  return (
    <div className="flex justify-center p-4 min-h-[90vh] items-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-gray-800 p-6 rounded-lg shadow-md"
      >
        <h2 className="text-white text-2xl font-semibold mb-4">Admin Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-white mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>
        <div className="mb-4">
          <label className="block text-white mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>
        <Button type="submit" className="w-full rounded-md">
          Login
        </Button>
      </form>
    </div>
  );
}
