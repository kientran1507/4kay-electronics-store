"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export default function CustomerAuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-68px)] items-center justify-center bg-[#fffaf3] px-4 py-10">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-[#eadcc8] bg-white shadow-[var(--store-shadow)] md:grid-cols-[1fr_0.8fr]">
        <div className="p-6 sm:p-9"><Link href="/" className="inline-flex items-center gap-2"><span className="relative h-10 w-10 overflow-hidden rounded-lg"><Image src="/logo.jpeg" alt="4Kay logo" fill className="object-cover" sizes="40px" /></span><span className="font-bold">4Kay Store</span></Link><h1 className="mt-7 text-3xl font-bold">{title}</h1><p className="mt-2 text-sm text-[#6b7280]">{subtitle}</p><div className="mt-7">{children}</div></div>
        <aside className="relative hidden min-h-[520px] overflow-hidden bg-[#fff4e6] p-8 md:block"><div className="relative mx-auto mt-8 aspect-square max-w-[280px] overflow-hidden rounded-full"><Image src="/images/ai-assistant-portrait.png" alt="4Kay AI assistant" fill className="object-cover" sizes="280px" /></div><div className="mx-auto mt-6 max-w-xs rounded-2xl bg-white p-5 text-center shadow-sm"><h2 className="font-semibold">Need help signing in?</h2><p className="mt-2 text-sm text-[#6b7280]">The assistant can explain accounts, orders, and shopping steps.</p><Link href="/support" className="mt-4 inline-flex rounded-xl bg-[#c87916] px-4 py-2 text-sm font-semibold text-white">Get help</Link></div></aside>
      </div>
    </div>
  );
}
