"use client";

import { ChevronDown, CreditCard, Mail, Package, Phone, RotateCcw, Search, ShieldCheck, Truck, UserRound } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useLocale } from "@/hooks/use-locale";
import { supportTopics, supportTopicsVi } from "@/data/supportKnowledge";
import AssistantVisual from "./AssistantVisual";
import OpenAssistantButton from "./OpenAssistantButton";

const topicIcons = { orders: Package, returns: RotateCcw, warranty: ShieldCheck, payment: CreditCard, account: UserRound, delivery: Truck };

export default function SupportContent() {
  const { locale } = useLocale();
  const vi = locale === "vi";
  const topics = vi ? supportTopicsVi : supportTopics;
  const [query, setQuery] = useState("");
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const faqRef = useRef<HTMLElement | null>(null);
  const normalized = query.trim().toLowerCase();
  const visibleTopics = useMemo(() => topics.map((topic) => ({ ...topic, faqs: topic.faqs.filter((faq) => !normalized || `${topic.title} ${topic.description} ${faq.question} ${faq.answer}`.toLowerCase().includes(normalized)) })).filter((topic) => (!activeTopic || topic.id === activeTopic) && (!normalized || topic.faqs.length)), [activeTopic, normalized, topics]);
  const faqCount = visibleTopics.reduce((total, topic) => total + topic.faqs.length, 0);
  const chooseTopic = (id: string) => { setActiveTopic((current) => current === id ? null : id); setQuery(""); window.setTimeout(() => faqRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50); };

  return <div className="mx-auto max-w-[1320px] space-y-6 px-4 py-5 sm:px-6 lg:px-8">
    <section className="grid min-h-56 overflow-hidden rounded-2xl border border-[#eadcc8] bg-white md:grid-cols-[0.8fr_1.8fr]"><AssistantVisual message="" /><div className="flex flex-col justify-center p-7"><h1 className="text-4xl font-bold">{vi ? "Chúng tôi có thể" : "How can we"} <span className="text-[#c87916]">{vi ? "hỗ trợ gì?" : "help?"}</span></h1><p className="mt-2 text-sm text-[#6b7280]">{vi ? "Tìm chủ đề hỗ trợ, theo dõi đơn hàng và liên hệ với chúng tôi." : "Search help topics, track orders, and contact support."}</p><div className="relative mt-5 max-w-xl"><input value={query} onChange={(event) => { setQuery(event.target.value); setActiveTopic(null); }} placeholder={vi ? "Tìm chủ đề hỗ trợ..." : "Search help topics..."} className="h-14 w-full rounded-xl border border-[#eadcc8] bg-white px-5 pr-12 outline-none focus:border-[#c87916]" /><Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2" /></div></div></section>
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">{topics.map((topic) => { const Icon = topicIcons[topic.id as keyof typeof topicIcons]; return <button key={topic.id} onClick={() => chooseTopic(topic.id)} className={`rounded-2xl border bg-white p-4 text-left transition hover:-translate-y-0.5 ${activeTopic === topic.id ? "border-[#c87916] shadow-[var(--store-shadow)]" : "border-[#eadcc8]"}`}><span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff4e6] text-[#c87916]"><Icon className="h-6 w-6" /></span><h2 className="mt-4 font-semibold">{topic.title}</h2><p className="mt-2 text-xs leading-5 text-[#6b7280]">{topic.description}</p></button>; })}</section>
    <section className="grid gap-4 lg:grid-cols-2">
      <article className="rounded-2xl border border-[#eadcc8] bg-white p-5"><h2 className="text-xl font-bold">{vi ? "Liên hệ hỗ trợ" : "Contact Support"}</h2><ContactRow icon={Mail} title={vi ? "Chat trực tiếp" : "Live Chat"} text={vi ? "Chat với trợ lý AI để được hướng dẫn ngay." : "Chat with the AI assistant for immediate guidance."} action={vi ? "Bắt đầu chat" : "Start Chat"} kind="chat" /><ContactRow icon={Mail} title={vi ? "Hỗ trợ qua email" : "Email Support"} text={vi ? "Gửi email và chúng tôi sẽ phản hồi bạn." : "Send us an email and we’ll get back to you."} action={vi ? "Gửi email" : "Send Email"} kind="email" /><ContactRow icon={Phone} title="Hotline" text={vi ? "Gọi cho chúng tôi để được hỗ trợ ngay." : "Call us for immediate assistance."} action={vi ? "Gọi ngay" : "Call Now"} kind="phone" /><div className="mt-3 flex flex-col items-start justify-between gap-4 rounded-xl bg-[#fff4e6] p-4 sm:flex-row sm:items-center"><div><h3 className="font-semibold">{vi ? "Hỏi tôi bất cứ lúc nào." : "Ask me for quick help anytime."}</h3><p className="mt-1 text-xs text-[#6b7280]">{vi ? "Tôi có thể giải thích về đơn hàng, giao hàng, đổi trả, bảo hành, thanh toán, tài khoản và giỏ hàng." : "I can explain orders, delivery, returns, warranty, payments, accounts, and cart steps."}</p></div><OpenAssistantButton label={vi ? "Hỏi trợ lý 4Kay" : "Ask 4Kay Assistant"} /></div></article>
      <article ref={faqRef} className="scroll-mt-24 rounded-2xl border border-[#eadcc8] bg-white p-5"><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-bold">{vi ? "Câu hỏi thường gặp" : "Frequently Asked Questions"}</h2>{activeTopic && <button onClick={() => setActiveTopic(null)} className="text-xs font-semibold text-[#c87916]">{vi ? "Hiện tất cả" : "Show all"}</button>}</div><div className="mt-4 space-y-4">{visibleTopics.map((topic) => <div key={topic.id}><h3 className="mb-2 text-xs font-bold uppercase text-[#c87916]">{topic.title}</h3><div className="space-y-2">{topic.faqs.map((faq) => <details key={faq.question} className="rounded-xl border border-[#eadcc8] px-4 py-3"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium">{faq.question}<ChevronDown className="h-4 w-4 shrink-0" /></summary><p className="pt-3 text-sm leading-6 text-[#6b7280]">{faq.answer}</p></details>)}</div></div>)}</div>{!faqCount && <div className="rounded-xl bg-[#fff4e6] p-5 text-sm text-[#6b7280]">{vi ? "Không tìm thấy kết quả chính xác. Hãy hỏi trợ lý AI." : "No exact match found. Try asking the AI assistant."}<OpenAssistantButton className="mt-3" /></div>}</article>
    </section>
  </div>;
}

function ContactRow({ icon: Icon, title, text, action, kind }: { icon: typeof Mail; title: string; text: string; action: string; kind: "chat" | "email" | "phone" }) {
  const href = kind === "email" ? "mailto:support@4kay.store" : kind === "phone" ? "tel:+84000000000" : undefined;
  const classes = "rounded-xl border border-[#eadcc8] px-4 py-2 text-xs font-semibold";
  return <div className="mt-3 flex items-center gap-3 rounded-xl border border-[#eadcc8] p-3"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff4e6] text-[#c87916]"><Icon className="h-5 w-5" /></span><div className="min-w-0 flex-1"><h3 className="text-sm font-semibold">{title}</h3><p className="text-xs text-[#6b7280]">{text}</p></div>{href ? <a href={href} className={classes}>{action}</a> : <button onClick={() => window.dispatchEvent(new CustomEvent("open-4kay-assistant", { detail: "I need help with a store support question." }))} className={classes}>{action}</button>}</div>;
}
