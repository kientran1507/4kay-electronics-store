"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale } from "@/hooks/use-locale";
import CustomerAuthShell from "./customer-auth-shell";
import { Field } from "./customer-sign-in";

export default function ForgotPassword() {
  const [email, setEmail] = useState(""); const [message, setMessage] = useState(""); const { locale } = useLocale(); const vi = locale === "vi";
  return <CustomerAuthShell title={vi ? "Đặt lại mật khẩu" : "Reset your password"} subtitle={vi ? "Nhập email để nhận hỗ trợ đặt lại mật khẩu." : "Enter your email and we’ll help you reset your password."}><form onSubmit={(event) => { event.preventDefault(); setMessage(vi ? "Tính năng đặt lại mật khẩu chưa khả dụng. Vui lòng liên hệ hỗ trợ." : "Password reset is not available yet. Please contact support."); }} className="space-y-4">{message && <p className="rounded-xl bg-[#fff4e6] p-3 text-sm text-[#9a5a08]">{message}</p>}<Field label="Email" type="email" value={email} onChange={setEmail} /><button className="h-11 w-full rounded-xl bg-[#c87916] font-semibold text-white">{vi ? "Tiếp tục" : "Continue"}</button><p className="text-center text-sm"><Link href="/customer-sign-in" className="font-semibold text-[#c87916]">{vi ? "Quay lại đăng nhập" : "Back to Sign in"}</Link></p></form></CustomerAuthShell>;
}
