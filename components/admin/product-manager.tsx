"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Loader2, Plus, Star, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  deleteAdminProduct,
  deleteAdminProductImage,
  getAdminProductManagerData,
  saveAdminProduct,
  setPrimaryAdminProductImage
} from "@/actions/admin-products";
import type { AdminCategory, AdminProduct } from "@/lib/supabase/admin-products";
import type { ProductPackage } from "@/types";
import { formatCurrency, getProductPackages, getStartingPrice, slugify } from "@/utils/format";

const defaultPackages: ProductPackage[] = [
  { weight: "৫ কেজি", price: 540 },
  { weight: "১০ কেজি", price: 850, recommended: true },
  { weight: "২০ কেজি", price: 1600 }
];

const packageSchema = z.object({
  id: z.string().optional(),
  label: z.string().optional(),
  weight: z.string().min(1, "ওজন লিখুন"),
  price: z.coerce.number().min(0, "দাম লিখুন"),
  compareAtPrice: z.coerce.number().min(0).optional(),
  stockQuantity: z.coerce.number().min(0).optional(),
  sortOrder: z.coerce.number().min(0).default(0),
  recommended: z.boolean().default(false),
  isActive: z.boolean().default(true)
});

const productSchema = z.object({
  categoryId: z.string().optional(),
  name: z.string().min(2),
  slug: z.string().optional().default(""),
  shortDescription: z.string().min(4),
  description: z.string().min(8),
  basePrice: z.coerce.number().min(0),
  stockQuantity: z.coerce.number().min(0).default(0),
  sortOrder: z.coerce.number().min(0).default(0),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  isActive: z.boolean().default(true),
  packages: z.array(packageSchema).min(1, "কমপক্ষে একটি প্যাকেজ দিন")
});

type ProductFormInput = z.input<typeof productSchema>;
type ProductInput = z.output<typeof productSchema>;

function packageDefaults() {
  return defaultPackages.map((item, index) => ({
    id: undefined,
    label: "",
    weight: item.weight,
    price: item.price,
    compareAtPrice: undefined,
    stockQuantity: 0,
    sortOrder: index,
    recommended: Boolean(item.recommended),
    isActive: true
  }));
}

function productDefaults(): ProductFormInput {
  return {
    categoryId: "",
    name: "",
    slug: "",
    shortDescription: "",
    description: "",
    basePrice: 0,
    stockQuantity: 0,
    sortOrder: 0,
    featured: false,
    published: false,
    isActive: true,
    packages: packageDefaults()
  };
}

function productToForm(product: AdminProduct): ProductFormInput {
  return {
    categoryId: product.categoryId || "",
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription,
    description: product.description,
    basePrice: product.basePrice,
    stockQuantity: product.stockQuantity,
    sortOrder: product.sortOrder,
    featured: product.featured,
    published: product.published,
    isActive: product.isActive,
    packages: product.packageRecords.length
      ? product.packageRecords.map((item) => ({
          id: item.id,
          label: item.label || "",
          weight: item.weight,
          price: item.price,
          compareAtPrice: item.compareAtPrice,
          stockQuantity: item.stockQuantity ?? 0,
          sortOrder: item.sortOrder,
          recommended: item.recommended,
          isActive: item.isActive
        }))
      : [{ id: undefined, label: "", weight: "৫ কেজি", price: product.price, sortOrder: 0, recommended: true, isActive: true }]
  };
}

export function ProductManager() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [pending, startTransition] = useTransition();
  const {
    register,
    reset,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors }
  } = useForm<ProductFormInput, unknown, ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: productDefaults()
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "packages"
  });
  async function loadProducts() {
    setLoading(true);
    try {
      const data = await getAdminProductManagerData();
      setProducts(data.products);
      setCategories(data.categories);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "পণ্য লোড করা যায়নি");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  function syncSlugFromName() {
    const slugValue = getValues("slug");
    const nameValue = getValues("name");
    if (!slugValue && nameValue) {
      setValue("slug", slugify(nameValue), { shouldValidate: true });
    }
  }

  function sanitizeSlugField() {
    const slugValue = getValues("slug");
    const nameValue = getValues("name");
    setValue("slug", slugify(slugValue || nameValue), { shouldValidate: true });
  }

  async function onSubmit(data: ProductInput) {
    setSaving(true);
    try {
      const formData = new FormData();
      if (editing) formData.set("productId", editing.id);
      formData.set("categoryId", data.categoryId || "");
      formData.set("name", data.name);
      formData.set("slug", data.slug || "");
      formData.set("shortDescription", data.shortDescription);
      formData.set("description", data.description);
      formData.set("basePrice", String(data.basePrice));
      formData.set("stockQuantity", String(data.stockQuantity));
      formData.set("sortOrder", String(data.sortOrder));
      formData.set("featured", String(data.featured));
      formData.set("published", String(data.published));
      formData.set("isActive", String(data.isActive));
      formData.set("packages", JSON.stringify(data.packages.map((item, index) => ({ ...item, sortOrder: item.sortOrder ?? index }))));

      Array.from(files || []).forEach((file) => formData.append("images", file));

      const result = await saveAdminProduct(null, formData);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setFiles(null);
      setEditing(null);
      reset(productDefaults());
      await loadProducts();
    } finally {
      setSaving(false);
    }
  }

  async function removeProduct(product: AdminProduct) {
    if (!confirm(`${product.name} inactive করবেন?`)) return;
    const result = await deleteAdminProduct(product.id);
    if (result.ok) {
      toast.success(result.message);
      await loadProducts();
    } else {
      toast.error(result.message);
    }
  }

  function startEdit(product: AdminProduct) {
    setEditing(product);
    setFiles(null);
    reset(productToForm(product));
  }

  function clearForm() {
    setEditing(null);
    setFiles(null);
    reset(productDefaults());
  }

  function deleteImage(imageId: string) {
    startTransition(async () => {
      const result = await deleteAdminProductImage(imageId);
      if (result.ok) {
        toast.success(result.message);
        await loadProducts();
      } else {
        toast.error(result.message);
      }
    });
  }

  function setPrimaryImage(imageId: string, productId: string) {
    startTransition(async () => {
      const result = await setPrimaryAdminProductImage(imageId, productId);
      if (result.ok) {
        toast.success(result.message);
        await loadProducts();
      } else {
        toast.error(result.message);
      }
    });
  }

  const previewCount = useMemo(() => files?.length ?? 0, [files]);

  return (
    <div className="grid gap-6 xl:grid-cols-[460px_1fr]">
      <form onSubmit={handleSubmit(onSubmit)} className="h-fit rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#17351a]">{editing ? "পণ্য এডিট" : "নতুন পণ্য"}</h2>
            <p className="mt-1 text-sm text-neutral-500">প্রতিটি পণ্যের জন্য একাধিক প্যাকেজ ও ছবি যোগ করুন।</p>
          </div>
          {editing ? (
            <button type="button" onClick={clearForm} className="rounded-full bg-[#E8F5E9] px-3 py-1.5 text-xs font-bold text-[#1B5E20]">
              বাতিল
            </button>
          ) : null}
        </div>

        <div className="mt-4 grid gap-3">
          <input
            {...register("name", { onBlur: syncSlugFromName })}
            placeholder="পণ্যের নাম"
            className="rounded-xl border border-[#E8F5E9] px-4 py-3 outline-none focus:border-[#2E7D32]"
          />
          {errors.name ? <p className="text-xs text-red-600">নাম লিখুন</p> : null}
          <input
            {...register("slug", { onBlur: sanitizeSlugField })}
            placeholder="slug"
            className="rounded-xl border border-[#E8F5E9] px-4 py-3 outline-none focus:border-[#2E7D32]"
          />
          <p className="text-xs text-neutral-500">Slug lowercase English letter, number and hyphen diye hobe.</p>
          {errors.slug ? <p className="text-xs text-red-600">slug লিখুন</p> : null}
          <select {...register("categoryId")} className="rounded-xl border border-[#E8F5E9] px-4 py-3 outline-none focus:border-[#2E7D32]">
            <option value="">Category নেই</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <input
            {...register("shortDescription")}
            placeholder="সংক্ষিপ্ত বিবরণ"
            className="rounded-xl border border-[#E8F5E9] px-4 py-3 outline-none focus:border-[#2E7D32]"
          />
          <textarea
            {...register("description")}
            rows={4}
            placeholder="বিস্তারিত বিবরণ"
            className="rounded-xl border border-[#E8F5E9] px-4 py-3 outline-none focus:border-[#2E7D32]"
          />
          <div className="grid gap-2 sm:grid-cols-3">
            <input {...register("basePrice")} type="number" placeholder="Base price" className="rounded-xl border border-[#E8F5E9] px-4 py-3 outline-none focus:border-[#2E7D32]" />
            <input {...register("stockQuantity")} type="number" placeholder="Stock" className="rounded-xl border border-[#E8F5E9] px-4 py-3 outline-none focus:border-[#2E7D32]" />
            <input {...register("sortOrder")} type="number" placeholder="Sort" className="rounded-xl border border-[#E8F5E9] px-4 py-3 outline-none focus:border-[#2E7D32]" />
          </div>

          <div className="rounded-2xl border border-[#E8F5E9] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-[#17351a]">প্যাকেজ</h3>
                <p className="text-xs text-neutral-500">ওজন, দাম এবং recommended badge সেট করুন।</p>
              </div>
              <button
                type="button"
                onClick={() => append({ weight: "", price: 0, compareAtPrice: undefined, stockQuantity: 0, sortOrder: fields.length, recommended: false, isActive: true })}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[#E8F5E9] px-3 text-xs font-bold text-[#1B5E20]"
              >
                <Plus className="size-3.5" />
                প্যাকেজ
              </button>
            </div>

            <div className="mt-3 grid gap-3">
              {fields.map((field, index) => (
                <div key={field.id} className="grid gap-2 rounded-xl bg-[#F7FBF7] p-3">
                  <div className="grid gap-2 sm:grid-cols-[1fr_100px_auto]">
                    <input
                      {...register(`packages.${index}.weight`)}
                      placeholder="ওজন"
                      className="rounded-lg border border-[#E8F5E9] px-3 py-2 text-sm outline-none focus:border-[#2E7D32]"
                    />
                    <input
                      {...register(`packages.${index}.price`)}
                      type="number"
                      placeholder="দাম"
                      className="rounded-lg border border-[#E8F5E9] px-3 py-2 text-sm outline-none focus:border-[#2E7D32]"
                    />
                    <button
                      type="button"
                      onClick={() => fields.length > 1 && remove(index)}
                      className="grid size-10 place-items-center rounded-full bg-red-50 text-red-700 disabled:opacity-40"
                      disabled={fields.length <= 1}
                      aria-label="প্যাকেজ মুছুন"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <input {...register(`packages.${index}.label`)} placeholder="Label" className="rounded-lg border border-[#E8F5E9] px-3 py-2 text-sm outline-none focus:border-[#2E7D32]" />
                    <input {...register(`packages.${index}.compareAtPrice`)} type="number" placeholder="Compare price" className="rounded-lg border border-[#E8F5E9] px-3 py-2 text-sm outline-none focus:border-[#2E7D32]" />
                    <input {...register(`packages.${index}.stockQuantity`)} type="number" placeholder="Stock" className="rounded-lg border border-[#E8F5E9] px-3 py-2 text-sm outline-none focus:border-[#2E7D32]" />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <label className="flex items-center gap-2 text-xs font-semibold text-[#1B5E20]">
                      <input {...register(`packages.${index}.recommended`)} type="checkbox" />
                      জনপ্রিয়
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-[#1B5E20]">
                      <input {...register(`packages.${index}.isActive`)} type="checkbox" />
                      Active
                    </label>
                  </div>
                </div>
              ))}
            </div>
            {errors.packages ? <p className="mt-2 text-xs text-red-600">কমপক্ষে একটি সঠিক প্যাকেজ দিন</p> : null}
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <label className="flex items-center gap-2 rounded-xl bg-[#E8F5E9] px-4 py-3 text-sm font-semibold text-[#1B5E20]">
              <input {...register("featured")} type="checkbox" />
              Featured
            </label>
            <label className="flex items-center gap-2 rounded-xl bg-[#E8F5E9] px-4 py-3 text-sm font-semibold text-[#1B5E20]">
              <input {...register("published")} type="checkbox" />
              Published
            </label>
            <label className="flex items-center gap-2 rounded-xl bg-[#E8F5E9] px-4 py-3 text-sm font-semibold text-[#1B5E20]">
              <input {...register("isActive")} type="checkbox" />
              Active
            </label>
          </div>
          <label className="rounded-xl border border-dashed border-[#2E7D32]/40 p-4 text-sm text-neutral-600">
            ছবি আপলোড করুন
            <input type="file" multiple accept="image/*" onChange={(event) => setFiles(event.target.files)} className="mt-2 block w-full text-sm" />
            {previewCount ? <span className="mt-1 block text-[#2E7D32]">{previewCount}টি ছবি নির্বাচিত</span> : null}
          </label>
          {editing?.imageRecords?.length ? (
            <div className="grid grid-cols-3 gap-2">
              {editing.imageRecords.filter((image) => image.isActive).map((image) => (
                <div key={image.id} className="relative aspect-square overflow-hidden rounded-xl bg-[#E8F5E9]">
                  <Image src={image.imageUrl} alt={image.altText || editing.name} fill sizes="120px" className="object-cover" />
                  <div className="absolute inset-x-1 bottom-1 flex gap-1">
                    <button type="button" onClick={() => setPrimaryImage(image.id, editing.id)} disabled={pending} className="grid size-8 place-items-center rounded-full bg-white/90 text-[#1B5E20]">
                      <Star className={`size-4 ${image.isPrimary ? "fill-[#D99600] text-[#D99600]" : ""}`} />
                    </button>
                    <button type="button" onClick={() => deleteImage(image.id)} disabled={pending} className="grid size-8 place-items-center rounded-full bg-white/90 text-red-700">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          <button disabled={saving} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#2E7D32] font-semibold text-white disabled:opacity-70">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            {editing ? "আপডেট করুন" : "যোগ করুন"}
          </button>
        </div>
      </form>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-[#17351a]">পণ্যের তালিকা</h2>
        <div className="mt-4 grid gap-3">
          {loading ? <p className="text-neutral-500">লোড হচ্ছে...</p> : null}
          {!loading && !products.length ? <p className="text-neutral-500">কোনো পণ্য পাওয়া যায়নি।</p> : null}
          {products.map((product) => {
            const packages = getProductPackages(product);
            return (
              <div key={product.id} className="grid gap-3 rounded-2xl border border-[#E8F5E9] p-3 sm:grid-cols-[96px_1fr_auto] sm:items-center">
                <div className="relative h-24 overflow-hidden rounded-xl bg-[#E8F5E9]">
                  {product.images?.[0] ? <Image src={product.images[0]} alt={product.name} fill sizes="96px" className="object-cover" /> : null}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-[#17351a]">{product.name}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${product.published && product.isActive ? "bg-[#E8F5E9] text-[#1B5E20]" : "bg-neutral-100 text-neutral-600"}`}>
                      {product.published && product.isActive ? "Published" : "Draft/Inactive"}
                    </span>
                    {product.featured ? <span className="rounded-full bg-[#FFF8E1] px-2.5 py-1 text-xs font-bold text-[#9A6A00]">Featured</span> : null}
                  </div>
                  <p className="text-sm text-neutral-500">{formatCurrency(getStartingPrice(product))} থেকে</p>
                  <p className="line-clamp-1 text-sm text-neutral-600">{product.shortDescription}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {packages.slice(0, 3).map((item) => (
                      <span key={`${item.weight}-${item.price}`} className="rounded-full bg-[#E8F5E9] px-2.5 py-1 text-xs font-semibold text-[#1B5E20]">
                        {item.weight}: {formatCurrency(item.price)}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => startEdit(product)} className="grid size-10 place-items-center rounded-full bg-[#E8F5E9] text-[#1B5E20]">
                    <Edit className="size-4" />
                  </button>
                  <button type="button" onClick={() => removeProduct(product)} className="grid size-10 place-items-center rounded-full bg-red-50 text-red-700">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
