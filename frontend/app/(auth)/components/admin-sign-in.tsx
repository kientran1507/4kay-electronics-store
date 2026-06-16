"use client";

import { useAuth } from "@/app/utils/authContext";
import { adminApi } from "@/lib/apiCalls";
import { ArrowRight, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await adminApi.login({ email, password });
      setUser(data.user);
      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "Invalid admin credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-68px)] bg-slate-50 px-4 py-10">
      <div className="mx-auto grid min-h-[680px] w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative hidden overflow-hidden bg-slate-950 p-8 text-white lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.25),transparent_34%),radial-gradient(circle_at_85%_12%,rgba(59,130,246,0.18),transparent_30%)]" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="relative h-11 w-11 overflow-hidden rounded-xl bg-white"><Image src="/logo.jpeg" alt="4Kay logo" fill sizes="44px" className="object-cover" /></span>
              <div><p className="font-bold">4Kay Store</p><p className="text-xs text-slate-400">Admin workspace</p></div>
            </Link>
            <div>
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200"><ShieldCheck className="h-3.5 w-3.5" /> Secure admin access</span>
              <h1 className="max-w-md text-4xl font-bold leading-tight">Manage catalog, orders, and customers from one clean dashboard.</h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">Only administrator accounts can enter this area. Customer sign-in stays separate from store operations.</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center text-xs text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3"><p className="text-lg font-bold text-white">Live</p><p>Orders</p></div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3"><p className="text-lg font-bold text-white">Fast</p><p>CRUD</p></div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3"><p className="text-lg font-bold text-white">Safe</p><p>Access</p></div>
            </div>
          </div>
        </section>
        <section className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><LockKeyhole className="h-6 w-6" /></span>
              <h2 className="text-3xl font-bold text-slate-950">Admin login</h2>
              <p className="mt-2 text-sm text-slate-500">Sign in to manage 4Kay Store operations.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
              <AdminField label="Email" type="email" value={email} onChange={setEmail} placeholder="admin@4kay.store" />
              <AdminField label="Password" type="password" value={password} onChange={setPassword} placeholder="Enter your password" />
              <button disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue to dashboard"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
            <div className="mt-6 flex items-center justify-between text-sm">
              <Link href="/" className="font-medium text-slate-500 hover:text-slate-950">Back to store</Link>
              <Link href="/customer-sign-in" className="font-medium text-emerald-700 hover:text-emerald-800">Customer login</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function AdminField({ label, type, value, onChange, placeholder }: { label: string; type: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-800">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} required placeholder={placeholder} className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" />
    </label>
  );
}
