import { LockKeyhole, ShieldCheck, Truck } from "lucide-react";

const services = [
  { icon: ShieldCheck, title: "Authentic Products", text: "Genuine products you can trust." },
  { icon: Truck, title: "Fast Shipping", text: "Quick delivery to your door." },
  { icon: LockKeyhole, title: "Secure Payment", text: "Safe and secure checkout." },
];

export default function ServiceBar() {
  return (
    <section className="grid gap-4 rounded-2xl border border-[#eadcc8] bg-[#fffaf3] px-5 py-4 sm:grid-cols-3">
      {services.map(({ icon: Icon, title, text }, index) => (
        <div key={title} className={`flex items-center justify-center gap-3 ${index ? "sm:border-l sm:border-[#eadcc8]" : ""}`}>
          <Icon className="h-7 w-7 shrink-0 text-[#c87916]" />
          <div>
            <p className="text-sm font-semibold text-[#111827]">{title}</p>
            <p className="text-xs text-[#6b7280]">{text}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
