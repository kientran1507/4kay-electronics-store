"use client";

import EntityDialog, { EntityField } from "@/app/(admin)/components/entity-dialog";
import TitleHeader from "@/app/(admin)/components/title-header";
import { AdminCard, AdminSelect, ConfirmDialog, EmptyState, ProductImage, TableSearch, TableSkeleton } from "@/app/(admin)/components/admin-ui";
import { useAuth } from "@/app/utils/authContext";
import formatVND from "@/app/utils/formatCurrency";
import { createProtectedApi, publicApi } from "@/lib/apiCalls";
import { Product, RequestData } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

const emptyProduct = {
  name: "",
  category: "",
  price: "",
  stock: "",
  image: "",
  description: "",
  descriptionVi: "",
};
const fields: EntityField[] = [
  { key: "name", label: "Product name", required: true, placeholder: "MacBook Air M3" },
  { key: "category", label: "Category key", required: true, placeholder: "phone, laptop, tablet..." },
  { key: "price", label: "Price (VND)", type: "number", min: 1, required: true },
  { key: "stock", label: "Stock", type: "number", min: 0, required: true },
  { key: "image", label: "Image URL", type: "url", required: true, placeholder: "https://..." },
  { key: "description", label: "Description", type: "textarea", required: true },
  { key: "descriptionVi", label: "Vietnamese description", type: "textarea" },
];

export default function ProductTable() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");
  const [pageSize, setPageSize] = useState(10);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const [creating, setCreating] = useState(false);
  const api = user ? createProtectedApi(user.token) : null;

  const { data = [], isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: async () => (await publicApi.getAllProducts({ limit: 100 })).products as Product[],
  });

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    return data
      .filter((product) => category === "all" || product.category === category)
      .filter((product) => !value || `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(value))
      .sort((a, b) => {
        if (sort === "name-asc") return a.name.localeCompare(b.name);
        if (sort === "name-desc") return b.name.localeCompare(a.name);
        if (sort === "price-high") return b.price - a.price;
        if (sort === "price-low") return a.price - b.price;
        const left = new Date(a.createdAt || 0).getTime();
        const right = new Date(b.createdAt || 0).getTime();
        return sort === "oldest" ? left - right : right - left;
      });
  }, [data, query, category, sort]);
  const categories = useMemo(() => Array.from(new Set(data.map((product) => product.category))).sort(), [data]);
  const categoryOptions = useMemo(() => [{ value: "all", label: "All categories" }, ...categories.map((item) => ({ value: item, label: item }))], [categories]);
  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "name-asc", label: "Name: A to Z" },
    { value: "name-desc", label: "Name: Z to A" },
    { value: "price-high", label: "Price: high to low" },
    { value: "price-low", label: "Price: low to high" },
  ];
  const pageSizeOptions = [{ value: 10, label: "10 / page" }, { value: 20, label: "20 / page" }, { value: 50, label: "50 / page" }];
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const save = async (values: Record<string, string>) => {
    if (!api) return;
    const payload: RequestData = {
      name: values.name.trim(),
      category: values.category.trim(),
      description: values.description.trim(),
      descriptionVi: values.descriptionVi.trim(),
      image: values.image.trim(),
      price: Number(values.price),
      stock: Number(values.stock),
    };
    try {
      if (editing) {
        await api.admin.updateProduct(editing._id, payload);
        toast.success("Product updated");
      } else {
        await api.admin.createProduct(payload);
        toast.success("Product created");
      }
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (saveError: any) {
      toast.error(saveError?.response?.data?.message || "Could not save product");
      throw saveError;
    }
  };

  const remove = async () => {
    if (!api || !deleting) return;
    setDeletingBusy(true);
    try {
      await api.admin.deleteProduct(deleting._id);
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted");
      setDeleting(null);
    } catch {
      toast.error("Could not delete product");
    } finally {
      setDeletingBusy(false);
    }
  };

  const dialogProduct = editing || emptyProduct;

  return (
    <>
      <TitleHeader
        title="Products"
        count={data.length}
        description="Manage product catalog, pricing, stock, and visibility."
        action={
          <button onClick={() => setCreating(true)} className="flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700">
            <Plus className="h-4 w-4" /> Add product
          </button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <TableSearch value={query} onChange={(value) => { setQuery(value); setPage(1); }} placeholder="Search products..." />
        <AdminSelect value={category} onChange={(value) => { setCategory(String(value)); setPage(1); }} options={categoryOptions} />
        <AdminSelect value={sort} onChange={(value) => setSort(String(value))} options={sortOptions} className="sm:min-w-[210px]" />
      </div>

      <AdminCard className="overflow-hidden">
        {isLoading ? <TableSkeleton /> : error ? <EmptyState title="Could not load products" description="Check the backend connection and try again." /> : <>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr><th className="px-5 py-3">Product</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Stock</th><th className="px-4 py-3">Added</th><th className="w-28 px-5 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {rows.map((product) => (
                <tr key={product._id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-3"><div className="flex items-center gap-3"><ProductImage src={product.image} alt={product.name} /><div><p className="max-w-64 font-semibold text-slate-900">{product.name}</p><p className="max-w-72 truncate text-xs text-slate-500" title={product.description}>{product.description}</p></div></div></td>
                  <td className="px-4 py-3"><span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">{product.category}</span></td>
                  <td className="px-4 py-3 font-medium">{formatVND(product.price)}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${product.stock > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{product.stock}</span></td>
                  <td className="px-4 py-3 text-slate-500">{product.createdAt ? new Date(product.createdAt).toLocaleDateString("en-GB") : "N/A"}</td>
                  <td className="px-5 py-3"><div className="flex justify-end gap-1"><button onClick={() => setEditing(product)} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100" title="Edit product"><Pencil className="h-4 w-4" /></button><button onClick={() => setDeleting(product)} className="flex h-9 w-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-50" title="Delete product"><Trash2 className="h-4 w-4" /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && <EmptyState title="No products found" description="Try changing your search or filters." />}
        </>}
      </AdminCard>

      <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3"><span>{filtered.length} results</span><AdminSelect value={pageSize} onChange={(value) => { setPageSize(Number(value)); setPage(1); }} options={pageSizeOptions} className="min-w-[128px]" /></div>
        <div className="flex items-center gap-2"><button onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1} className="flex h-9 w-9 items-center justify-center rounded-md border bg-white disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><span className="min-w-20 text-center">Page {page} of {pageCount}</span><button onClick={() => setPage((value) => Math.min(pageCount, value + 1))} disabled={page === pageCount} className="flex h-9 w-9 items-center justify-center rounded-md border bg-white disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div>
      </div>

      <EntityDialog
        open={creating || Boolean(editing)}
        title={editing ? "Edit product" : "Add product"}
        description={editing ? "Update the catalog item and save it in place." : "Create a new catalog item."}
        fields={fields}
        initialValues={{
          name: dialogProduct.name,
          category: dialogProduct.category,
          price: dialogProduct.price,
          stock: dialogProduct.stock,
          image: dialogProduct.image,
          description: dialogProduct.description,
          descriptionVi: dialogProduct.descriptionVi || "",
        }}
        submitLabel={editing ? "Save changes" : "Create product"}
        onClose={() => { setCreating(false); setEditing(null); }}
        onSubmit={save}
      />
      <ConfirmDialog open={Boolean(deleting)} title="Delete product?" description={`"${deleting?.name || "This product"}" will be permanently removed from the catalog.`} loading={deletingBusy} onClose={() => setDeleting(null)} onConfirm={remove} />
    </>
  );
}
