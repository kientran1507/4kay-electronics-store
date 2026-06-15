"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/utils/authContext";
import { customerApi } from "@/lib/apiCalls";
import CustomerAuthShell from "./customer-auth-shell";

export default function CustomerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuth();
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); setError(""); setLoading(true);
    try { const data = await customerApi.login({ email, password }); setUser(data.user); router.push("/"); }
    catch (err: any) { setError(err.message || "Invalid login credentials"); }
    finally { setLoading(false); }
  };
  return <CustomerAuthShell title="Welcome back" subtitle="Sign in to continue shopping at 4Kay Store."><form onSubmit={handleSubmit} className="space-y-4">{error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<Field label="Email" type="email" value={email} onChange={setEmail} /><Field label="Password" type="password" value={password} onChange={setPassword} /><div className="flex items-center justify-between text-sm"><label className="flex items-center gap-2 text-[#6b7280]"><input type="checkbox" className="accent-[#c87916]" />Remember me</label><Link href="/forgot-password" className="font-semibold text-[#c87916]">Forgot password?</Link></div><button disabled={loading} className="h-11 w-full rounded-xl bg-[#c87916] font-semibold text-white disabled:opacity-60">{loading ? "Signing in..." : "Sign in"}</button><p className="text-center text-sm text-[#6b7280]">Don’t have an account? <Link href="/customer-sign-up" className="font-semibold text-[#c87916]">Sign up</Link></p></form></CustomerAuthShell>;
}

export function Field({ label, type = "text", value, onChange, required = true }: { label: string; type?: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-semibold">{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} className="h-11 w-full rounded-xl border border-[#eadcc8] px-3 outline-none focus:border-[#c87916]" /></label>;
}
