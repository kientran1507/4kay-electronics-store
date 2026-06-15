"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { customerApi } from "@/lib/apiCalls";
import CustomerAuthShell from "./customer-auth-shell";
import { Field } from "./customer-sign-in";

export default function CustomerSignup() {
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [phone, setPhone] = useState(""); const [address, setAddress] = useState(""); const [password, setPassword] = useState(""); const [confirmPassword, setConfirmPassword] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const router = useRouter();
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setError(""); if (password !== confirmPassword) { setError("Passwords do not match."); return; } setLoading(true); try { await customerApi.register({ name, email, password, phone, address }); router.push("/customer-sign-in"); } catch (err: any) { setError(err.message || "Unable to register"); } finally { setLoading(false); } };
  return <CustomerAuthShell title="Create your account" subtitle="Save your cart, manage orders, and get personalized recommendations."><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">{error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700 sm:col-span-2">{error}</p>}<Field label="Full name" value={name} onChange={setName} /><Field label="Email" type="email" value={email} onChange={setEmail} /><Field label="Phone number" type="tel" value={phone} onChange={setPhone} /><Field label="Address" value={address} onChange={setAddress} /><Field label="Password" type="password" value={password} onChange={setPassword} /><Field label="Confirm password" type="password" value={confirmPassword} onChange={setConfirmPassword} /><button disabled={loading} className="h-11 rounded-xl bg-[#c87916] font-semibold text-white disabled:opacity-60 sm:col-span-2">{loading ? "Creating account..." : "Create account"}</button><p className="text-center text-sm text-[#6b7280] sm:col-span-2">Already have an account? <Link href="/customer-sign-in" className="font-semibold text-[#c87916]">Sign in</Link></p></form></CustomerAuthShell>;
}
