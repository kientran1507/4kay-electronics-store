"use client";

import EntityDialog, { EntityField } from "@/app/(admin)/components/entity-dialog";
import TitleHeader from "@/app/(admin)/components/title-header";
import { AdminCard, AdminSelect, ConfirmDialog, EmptyState, TableSearch, TableSkeleton } from "@/app/(admin)/components/admin-ui";
import { useAuth } from "@/app/utils/authContext";
import { createProtectedApi } from "@/lib/apiCalls";
import { Admin } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

type AdminsResponse = { admins: Admin[]; totalAdmins: number; totalPages: number };
const fields: EntityField[] = [
  { key: "name", label: "Name", required: true },
  { key: "email", label: "Email", type: "email", required: true },
  { key: "phone", label: "Phone" },
  { key: "password", label: "Password", type: "password", placeholder: "Required when creating; blank keeps current password" },
];

export default function AdminTable() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Admin | null>(null);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [deleting, setDeleting] = useState<Admin | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const api = user ? createProtectedApi(user.token) : null;
  const { data, isLoading, error } = useQuery<AdminsResponse>({
    queryKey: ["admins"],
    queryFn: () => {
      if (!api) throw new Error("Unauthorized");
      return api.admin.getAllAdmins();
    },
  });

  const save = async (values: Record<string, string>) => {
    if (!api) return;
    if (!editing && !values.password) {
      toast.error("A password is required for a new administrator");
      throw new Error("Password required");
    }
    const payload = { name: values.name.trim(), email: values.email.trim(), phone: values.phone.trim(), ...(values.password ? { password: values.password } : {}) };
    try {
      if (editing) await api.admin.updateAdmin({ ...payload, _id: editing._id });
      else await api.admin.registerAdmin(payload as any);
      await queryClient.invalidateQueries({ queryKey: ["admins"] });
      toast.success(editing ? "Administrator updated" : "Administrator created");
    } catch (saveError: any) {
      toast.error(saveError?.response?.data?.message || "Could not save administrator");
      throw saveError;
    }
  };

  const remove = async () => {
    if (!api || !deleting) return;
    setDeletingBusy(true);
    try {
      await api.admin.deleteAdmin(deleting._id);
      await queryClient.invalidateQueries({ queryKey: ["admins"] });
      toast.success("Administrator deleted");
      setDeleting(null);
    } catch (removeError: any) {
      toast.error(removeError?.response?.data?.message || "Could not delete administrator");
    } finally {
      setDeletingBusy(false);
    }
  };

  const rows = (data?.admins || []).filter((admin) => `${admin.name} ${admin.email} ${admin.phone || ""}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => {
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

  return (
    <>
      <TitleHeader title="Manage Admins" count={data?.totalAdmins || 0} description="Manage administrator accounts and permissions." action={<button onClick={() => setCreating(true)} className="flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700"><Plus className="h-4 w-4" /> Add admin</button>} />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row"><TableSearch value={query} onChange={setQuery} placeholder="Search administrators..." /><AdminSelect value={sort} onChange={(value) => setSort(String(value))} options={sortOptions} className="sm:min-w-[180px]" /></div>
      <AdminCard className="overflow-hidden">
        {isLoading ? <TableSkeleton rows={4} /> : error ? <EmptyState title="Could not load administrators" description="Check the backend connection and try again." /> :
        <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs font-semibold uppercase text-slate-500"><tr><th className="px-5 py-3">Administrator</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Date created</th><th className="w-28 px-5 py-3 text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.map((admin) => <tr key={admin._id} className="transition hover:bg-slate-50"><td className="px-5 py-3"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-xs font-bold text-emerald-700">{admin.name.slice(0, 2).toUpperCase()}</span><div><p className="font-semibold">{admin.name}</p><p className="text-xs text-slate-500">{admin.email}</p></div></div></td><td className="px-4 py-3 text-slate-600">{admin.phone || "Not provided"}</td><td className="px-4 py-3"><span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">Administrator</span></td><td className="px-4 py-3 text-slate-500">{admin.createdAt ? new Date(admin.createdAt).toLocaleDateString("en-GB") : "N/A"}</td><td className="px-5 py-3"><div className="flex justify-end gap-1"><button onClick={() => setEditing(admin)} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100" title="Edit administrator"><Pencil className="h-4 w-4" /></button><button onClick={() => setDeleting(admin)} disabled={admin._id === user?._id} className="flex h-9 w-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30" title={admin._id === user?._id ? "You cannot delete your current account" : "Delete administrator"}><Trash2 className="h-4 w-4" /></button></div></td></tr>)}
          </tbody>
        </table>
        {!rows.length && <EmptyState title="No administrators found" description="Try another search or add an administrator." />}</div>}
      </AdminCard>
      <EntityDialog open={creating || Boolean(editing)} title={editing ? "Edit administrator" : "Add administrator"} description="Administrator access takes effect immediately." fields={fields} initialValues={{ name: editing?.name || "", email: editing?.email || "", phone: editing?.phone || "", password: "" }} submitLabel={editing ? "Save changes" : "Create administrator"} onClose={() => { setCreating(false); setEditing(null); }} onSubmit={save} />
      <ConfirmDialog open={Boolean(deleting)} title="Delete administrator?" description={`${deleting?.name || "This administrator"} will immediately lose access to the admin workspace.`} loading={deletingBusy} onClose={() => setDeleting(null)} onConfirm={remove} />
    </>
  );
}
