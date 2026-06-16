"use client";

import EntityDialog, { EntityField } from "@/app/(admin)/components/entity-dialog";
import TitleHeader from "@/app/(admin)/components/title-header";
import { AdminCard, AdminSelect, ConfirmDialog, EmptyState, TableSearch, TableSkeleton } from "@/app/(admin)/components/admin-ui";
import { useAuth } from "@/app/utils/authContext";
import { createProtectedApi } from "@/lib/apiCalls";
import { Customer } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

type CustomersResponse = { customers: Customer[]; currentPage: number; totalPages: number; totalCustomers: number };
const fields: EntityField[] = [
  { key: "name", label: "Name", required: true },
  { key: "email", label: "Email", type: "email", required: true },
  { key: "phone", label: "Phone" },
  { key: "address", label: "Address" },
  { key: "password", label: "Password", type: "password", placeholder: "Required for new users; blank keeps current password" },
];

export default function UserTable() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [editing, setEditing] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState<Customer | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const [creating, setCreating] = useState(false);
  const api = user ? createProtectedApi(user.token) : null;

  const { data, isLoading, error } = useQuery<CustomersResponse>({
    queryKey: ["customers", page],
    queryFn: () => {
      if (!api) throw new Error("Unauthorized");
      return api.admin.getAllCustomers(page, 10);
    },
  });
  const rows = (data?.customers || []).filter((customer) =>
    `${customer.name} ${customer.email} ${customer.phone || ""} ${customer.address || ""}`.toLowerCase().includes(query.toLowerCase()),
  ).sort((a, b) => {
    if (sort === "name-asc") return a.name.localeCompare(b.name);
    if (sort === "name-desc") return b.name.localeCompare(a.name);
    const left = new Date(a.createdAt || 0).getTime();
    const right = new Date(b.createdAt || 0).getTime();
    return sort === "oldest" ? left - right : right - left;
  });
  const sortOptions = [
    { value: "newest", label: "Newest first" },
    { value: "oldest", label: "Oldest first" },
    { value: "name-asc", label: "Name: A to Z" },
    { value: "name-desc", label: "Name: Z to A" },
  ];

  const save = async (values: Record<string, string>) => {
    if (!api) return;
    const payload = {
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      address: values.address.trim(),
      ...(values.password ? { password: values.password } : {}),
    };
    if (!editing && !values.password) {
      toast.error("A password is required for a new customer");
      throw new Error("Password required");
    }
    try {
      if (editing) await api.admin.updateCustomer(editing._id, payload);
      else await api.admin.createCustomer(payload);
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success(editing ? "Customer updated" : "Customer created");
    } catch (saveError: any) {
      toast.error(saveError?.response?.data?.message || "Could not save customer");
      throw saveError;
    }
  };

  const remove = async () => {
    if (!api || !deleting) return;
    setDeletingBusy(true);
    try {
      await api.admin.deleteCustomer(deleting._id);
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer deleted");
      setDeleting(null);
    } catch {
      toast.error("Could not delete customer");
    } finally {
      setDeletingBusy(false);
    }
  };

  return (
    <>
      <TitleHeader title="Manage Users" count={data?.totalCustomers || 0} description="View and manage customer accounts." action={<button onClick={() => setCreating(true)} className="flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700"><Plus className="h-4 w-4" /> Add user</button>} />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row"><TableSearch value={query} onChange={setQuery} placeholder="Search name, email, or phone..." /><AdminSelect value={sort} onChange={(value) => setSort(String(value))} options={sortOptions} className="sm:min-w-[180px]" /></div>
      <AdminCard className="overflow-hidden">
        {isLoading ? <TableSkeleton /> : error ? <EmptyState title="Could not load users" description="Check the backend connection and try again." /> : <>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs font-semibold uppercase text-slate-500"><tr><th className="px-5 py-3">Customer</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Address</th><th className="px-4 py-3">Date joined</th><th className="w-28 px-5 py-3 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-neutral-100">
              {rows.map((customer) => <tr key={customer._id} className="transition hover:bg-slate-50"><td className="px-5 py-3"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-xs font-bold text-sky-700">{customer.name.slice(0, 2).toUpperCase()}</span><div><p className="font-semibold text-slate-900">{customer.name}</p><p className="text-xs text-slate-500">{customer.email}</p></div></div></td><td className="px-4 py-3 text-slate-600">{customer.phone || "Not provided"}</td><td className="max-w-64 truncate px-4 py-3 text-slate-600">{customer.address || "Not provided"}</td><td className="px-4 py-3 text-slate-500">{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString("en-GB") : "N/A"}</td><td className="px-5 py-3"><div className="flex justify-end gap-1"><button onClick={() => setEditing(customer)} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100" title="Edit user"><Pencil className="h-4 w-4" /></button><button onClick={() => setDeleting(customer)} className="flex h-9 w-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-50" title="Delete user"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}
            </tbody>
          </table>
        </div>
        {!rows.length && <EmptyState title="No users found" description="Try another search or add a new customer account." />}</>}
      </AdminCard>
      <div className="mt-4 flex justify-end gap-2"><button onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1} className="flex h-9 w-9 items-center justify-center rounded-md border bg-white disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><span className="flex h-9 min-w-24 items-center justify-center text-sm text-neutral-500">Page {page} of {data?.totalPages || 1}</span><button onClick={() => setPage((value) => Math.min(data?.totalPages || 1, value + 1))} disabled={page === (data?.totalPages || 1)} className="flex h-9 w-9 items-center justify-center rounded-md border bg-white disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div>
      <EntityDialog open={creating || Boolean(editing)} title={editing ? "Edit customer" : "Add customer"} description="Account changes are applied immediately." fields={fields} initialValues={{ name: editing?.name || "", email: editing?.email || "", phone: editing?.phone || "", address: editing?.address || "", password: "" }} submitLabel={editing ? "Save changes" : "Create customer"} onClose={() => { setCreating(false); setEditing(null); }} onSubmit={save} />
      <ConfirmDialog open={Boolean(deleting)} title="Delete user?" description={`${deleting?.name || "This user"} will lose access to their customer account. Existing order records remain unchanged.`} loading={deletingBusy} onClose={() => setDeleting(null)} onConfirm={remove} />
    </>
  );
}
