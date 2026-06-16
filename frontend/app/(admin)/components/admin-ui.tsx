"use client";

import { Dialog, Listbox } from "@headlessui/react";
import { AlertTriangle, Check, ChevronDown, ImageIcon, Loader2, Search, X } from "lucide-react";
import Image from "next/image";
import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";

export function AdminCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</section>;
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="flex min-h-48 flex-col items-center justify-center px-6 text-center"><span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400"><Search className="h-5 w-5" /></span><p className="font-semibold text-slate-800">{title}</p><p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p></div>;
}

export function TableSearch({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 sm:max-w-sm"><Search className="h-4 w-4 text-slate-400" /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="min-w-0 flex-1 text-sm outline-none placeholder:text-slate-400" /></label>;
}

export type AdminSelectOption = {
  value: string | number;
  label: string;
};

export function AdminSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className = "",
  triggerClassName = "",
  triggerStyle,
  disabled = false,
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  options: AdminSelectOption[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  triggerStyle?: CSSProperties;
  disabled?: boolean;
}) {
  const selected = options.find((option) => option.value === value);

  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      {({ open }) => (
        <AdminSelectContent
          open={open}
          selectedLabel={selected?.label || placeholder}
          options={options}
          className={className}
          triggerClassName={triggerClassName}
          triggerStyle={triggerStyle}
        />
      )}
    </Listbox>
  );
}

function AdminSelectContent({
  open,
  selectedLabel,
  options,
  className,
  triggerClassName,
  triggerStyle,
}: {
  open: boolean;
  selectedLabel: string;
  options: AdminSelectOption[];
  className: string;
  triggerClassName: string;
  triggerStyle?: CSSProperties;
}) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({
    position: "fixed",
    left: -9999,
    top: -9999,
    width: 0,
    maxHeight: 288,
  });

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const spaceBelow = window.innerHeight - rect.bottom - 12;
      const maxHeight = Math.min(288, Math.max(160, spaceBelow));
      setMenuStyle({
        position: "fixed",
        left: rect.left,
        top: rect.bottom + 8,
        width: rect.width,
        maxHeight,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  return (
    <div className={`relative min-w-[176px] ${className}`}>
      <Listbox.Button ref={buttonRef} style={triggerStyle} className={`flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 text-left text-sm font-medium text-slate-950 shadow-sm outline-none transition hover:border-slate-300 hover:bg-slate-50 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-60 ${triggerClassName}`}>
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </Listbox.Button>
      {open && (
        <Listbox.Options style={menuStyle} className="z-[100] overflow-auto overscroll-contain rounded-xl border border-slate-200 bg-white p-1.5 text-sm shadow-[0_12px_30px_rgba(15,23,42,0.12)] outline-none">
          {options.map((option) => (
            <Listbox.Option
              key={String(option.value)}
              value={option.value}
              className="group flex cursor-pointer select-none items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-slate-700 transition data-[focus]:bg-slate-100 data-[selected]:bg-emerald-50 data-[selected]:text-emerald-700"
            >
              {({ selected }) => (
                <>
                  <span className="truncate">{option.label}</span>
                  {selected && <Check className="h-4 w-4 text-emerald-600" />}
                </>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      )}
    </div>
  );
}

export function ProductImage({ src, alt }: { src?: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  return <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">{src && !failed ? <Image src={src} alt={alt} fill sizes="48px" className="object-contain p-1" onError={() => setFailed(true)} /> : <ImageIcon className="h-5 w-5 text-slate-300" />}</div>;
}

export function ConfirmDialog({ open, title, description, confirmLabel = "Delete", loading = false, onClose, onConfirm }: { open: boolean; title: string; description: string; confirmLabel?: string; loading?: boolean; onClose: () => void; onConfirm: () => void }) {
  return <Dialog open={open} onClose={() => !loading && onClose()} className="relative z-[90]"><div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm" /><div className="fixed inset-0 flex items-center justify-center p-4"><Dialog.Panel className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"><div className="flex items-start gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600"><AlertTriangle className="h-5 w-5" /></span><div className="min-w-0 flex-1"><Dialog.Title className="text-lg font-bold">{title}</Dialog.Title><Dialog.Description className="mt-1 text-sm leading-6 text-slate-500">{description}</Dialog.Description></div><button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button></div><div className="mt-6 flex justify-end gap-3"><button onClick={onClose} disabled={loading} className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold hover:bg-slate-50">Cancel</button><button onClick={onConfirm} disabled={loading} className="flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">{loading && <Loader2 className="h-4 w-4 animate-spin" />}{confirmLabel}</button></div></Dialog.Panel></div></Dialog>;
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return <div className="space-y-2 p-4">{Array.from({ length: rows }).map((_, index) => <div key={index} className="h-14 animate-pulse rounded-xl bg-slate-100" />)}</div>;
}
