"use client";

import { Dialog } from "@headlessui/react";
import { Loader2, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

export type EntityField = {
  key: string;
  label: string;
  type?: "text" | "email" | "password" | "number" | "url" | "textarea";
  placeholder?: string;
  required?: boolean;
  min?: number;
};

type Props = {
  open: boolean;
  title: string;
  description: string;
  fields: EntityField[];
  initialValues: Record<string, string | number>;
  submitLabel: string;
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => Promise<void>;
};

export default function EntityDialog({
  open,
  title,
  description,
  fields,
  initialValues,
  submitLabel,
  onClose,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValues(Object.fromEntries(
      Object.entries(initialValues).map(([key, value]) => [key, String(value ?? "")]),
    ));
  }, [initialValues, open]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit(values);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => !saving && onClose()} className="relative z-[80]">
      <div className="fixed inset-0 bg-black/45 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 overflow-y-auto p-4 sm:p-8">
        <div className="flex min-h-full items-center justify-center">
          <Dialog.Panel className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-neutral-200 px-6 py-5">
              <div>
                <Dialog.Title className="text-xl font-bold text-neutral-950">{title}</Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-neutral-500">{description}</Dialog.Description>
              </div>
              <button type="button" onClick={onClose} disabled={saving} className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 hover:bg-neutral-50" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={submit} className="p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                {fields.map((field) => {
                  const common = {
                    id: field.key,
                    value: values[field.key] || "",
                    placeholder: field.placeholder,
                    required: field.required,
                    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                      setValues((current) => ({ ...current, [field.key]: event.target.value })),
                    className: "mt-2 w-full rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/15",
                  };

                  return (
                    <label key={field.key} htmlFor={field.key} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                      <span className="text-sm font-semibold text-neutral-800">{field.label}</span>
                      {field.type === "textarea" ? (
                        <textarea {...common} rows={4} />
                      ) : (
                        <input {...common} type={field.type || "text"} min={field.min} />
                      )}
                    </label>
                  );
                })}
              </div>
              <div className="mt-7 flex justify-end gap-3 border-t border-neutral-100 pt-5">
                <button type="button" onClick={onClose} disabled={saving} className="h-10 rounded-xl border border-neutral-300 px-5 text-sm font-semibold hover:bg-neutral-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {submitLabel}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}
