"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Edit, Loader2, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { db, storage } from "@/firebase/client";
import { demoProducts } from "@/lib/demo-data";
import type { Product, ProductPackage } from "@/types";
import { formatCurrency, getProductPackages, getStartingPrice, slugify } from "@/utils/format";

const defaultPackages: ProductPackage[] = [
  { weight: "৫ কেজি", price: 540 },
  { weight: "১০ কেজি", price: 850, recommended: true },
  { weight: "২০ কেজি", price: 1600 }
];

const packageSchema = z.object({
  weight: z.string().min(1, "ওজন লিখুন"),
  price: z.coerce.number().int().min(1, "দাম লিখুন"),
  recommended: z.boolean().default(false)
});

const productSchema = z.object({
  name: z.string().min(2),
  shortDescription: z.string().min(8),
  description: z.string().min(20),
  featured: z.boolean().default(false),
  stock: z.coerce.number().min(0).optional(),
  packages: z.array(packageSchema).min(1, "কমপক্ষে একটি প্যাকেজ দিন")
});

type ProductFormInput = z.input<typeof productSchema>;
type ProductInput = z.output<typeof productSchema>;

export function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const {
    register,
    reset,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<ProductFormInput, unknown, ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: { featured: false, stock: 0, packages: defaultPackages }
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "packages"
  });

  async function loadProducts() {
    setLoading(true);
    try {
      const snapshot = await getDocs(query(collection(db, "products"), orderBy("createdAt", "desc")));
      setProducts(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Product));
    } catch {
      setProducts(demoProducts);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  async function uploadImages(productName: string) {
    if (!files?.length) return editing?.images ?? [];
    const uploads = Array.from(files).map(async (file) => {
      const imageRef = ref(storage, `products/${Date.now()}-${productName}-${file.name}`);
      await uploadBytes(imageRef, file);
      return getDownloadURL(imageRef);
    });
    const uploaded = await Promise.all(uploads);
    return editing ? [...editing.images, ...uploaded] : uploaded;
  }

  async function onSubmit(data: ProductInput) {
    setSaving(true);
    try {
      const images = await uploadImages(data.name);
      const packages = data.packages.map((item) => ({
        weight: item.weight.trim(),
        price: item.price,
        recommended: Boolean(item.recommended)
      }));
      const payload = {
        ...data,
        packages,
        price: packages[0]?.price ?? 0,
        slug: slugify(data.name),
        images
      };

      if (editing) {
        await updateDoc(doc(db, "products", editing.id), payload);
        toast.success("পণ্য আপডেট হয়েছে");
      } else {
        await addDoc(collection(db, "products"), {
          ...payload,
          createdAt: serverTimestamp()
        });
        toast.success("নতুন পণ্য যোগ হয়েছে");
      }

      setFiles(null);
      setEditing(null);
      reset({ featured: false, stock: 0, packages: defaultPackages });
      await loadProducts();
    } catch {
      toast.error("পণ্য সংরক্ষণ করা যায়নি। Firebase config ও rules যাচাই করুন।");
    } finally {
      setSaving(false);
    }
  }

  async function removeProduct(product: Product) {
    if (!confirm(`${product.name} মুছে ফেলবেন?`)) return;
    try {
      await deleteDoc(doc(db, "products", product.id));
      toast.success("পণ্য মুছে ফেলা হয়েছে");
      await loadProducts();
    } catch {
      toast.error("পণ্য মুছে ফেলা যায়নি");
    }
  }

  function startEdit(product: Product) {
    setEditing(product);
    reset({
      name: product.name,
      shortDescription: product.shortDescription,
      description: product.description,
      featured: product.featured,
      stock: product.stock ?? 0,
      packages: product.packages?.length ? product.packages : [{ weight: "৫ কেজি", price: product.price, recommended: true }]
    });
  }

  function clearForm() {
    setEditing(null);
    setFiles(null);
    reset({ featured: false, stock: 0, packages: defaultPackages });
  }

  const previewCount = useMemo(() => files?.length ?? 0, [files]);

  return (
    <div className="grid gap-6 xl:grid-cols-[460px_1fr]">
      <form onSubmit={handleSubmit(onSubmit)} className="h-fit rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#17351a]">{editing ? "পণ্য এডিট" : "নতুন পণ্য"}</h2>
            <p className="mt-1 text-sm text-neutral-500">প্রতিটি পণ্যের জন্য একাধিক প্যাকেজ যোগ করুন।</p>
          </div>
          {editing ? (
            <button type="button" onClick={clearForm} className="rounded-full bg-[#E8F5E9] px-3 py-1.5 text-xs font-bold text-[#1B5E20]">
              বাতিল
            </button>
          ) : null}
        </div>

        <div className="mt-4 grid gap-3">
          <input {...register("name")} placeholder="পণ্যের নাম" className="rounded-xl border border-[#E8F5E9] px-4 py-3 outline-none focus:border-[#2E7D32]" />
          {errors.name ? <p className="text-xs text-red-600">নাম লিখুন</p> : null}

          <input {...register("shortDescription")} placeholder="সংক্ষিপ্ত বিবরণ" className="rounded-xl border border-[#E8F5E9] px-4 py-3 outline-none focus:border-[#2E7D32]" />
          <textarea {...register("description")} rows={4} placeholder="বিস্তারিত বিবরণ" className="rounded-xl border border-[#E8F5E9] px-4 py-3 outline-none focus:border-[#2E7D32]" />
          <input {...register("stock")} type="number" placeholder="স্টক" className="rounded-xl border border-[#E8F5E9] px-4 py-3 outline-none focus:border-[#2E7D32]" />

          <div className="rounded-2xl border border-[#E8F5E9] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-[#17351a]">প্যাকেজ</h3>
                <p className="text-xs text-neutral-500">ওজন ও দাম লিখুন, যেমন ১০ কেজি - ৮৫০ টাকা।</p>
              </div>
              <button
                type="button"
                onClick={() => append({ weight: "", price: 0, recommended: false })}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[#E8F5E9] px-3 text-xs font-bold text-[#1B5E20]"
              >
                <Plus className="size-3.5" />
                প্যাকেজ
              </button>
            </div>

            <div className="mt-3 grid gap-3">
              {fields.map((field, index) => (
                <div key={field.id} className="grid gap-2 rounded-xl bg-[#F7FBF7] p-3">
                  <div className="grid gap-2 sm:grid-cols-[1fr_120px_auto]">
                    <input
                      {...register(`packages.${index}.weight`)}
                      placeholder="ওজন, যেমন ৫ কেজি"
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
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#1B5E20]">
                    <input {...register(`packages.${index}.recommended`)} type="checkbox" />
                    জনপ্রিয় ব্যাজ দেখান
                  </label>
                </div>
              ))}
            </div>
            {errors.packages ? <p className="mt-2 text-xs text-red-600">কমপক্ষে একটি সঠিক প্যাকেজ দিন</p> : null}
          </div>

          <label className="flex items-center gap-2 rounded-xl bg-[#E8F5E9] px-4 py-3 text-sm font-semibold text-[#1B5E20]">
            <input {...register("featured")} type="checkbox" />
            Featured পণ্য
          </label>
          <label className="rounded-xl border border-dashed border-[#2E7D32]/40 p-4 text-sm text-neutral-600">
            ছবি আপলোড করুন
            <input type="file" multiple accept="image/*" onChange={(event) => setFiles(event.target.files)} className="mt-2 block w-full text-sm" />
            {previewCount ? <span className="mt-1 block text-[#2E7D32]">{previewCount}টি ছবি নির্বাচিত</span> : null}
          </label>
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
          {products.map((product) => {
            const packages = getProductPackages(product);
            return (
              <div key={product.id} className="grid gap-3 rounded-2xl border border-[#E8F5E9] p-3 sm:grid-cols-[96px_1fr_auto] sm:items-center">
                <div className="relative h-24 overflow-hidden rounded-xl bg-[#E8F5E9]">
                  {product.images?.[0] ? <Image src={product.images[0]} alt={product.name} fill sizes="96px" className="object-cover" /> : null}
                </div>
                <div>
                  <h3 className="font-bold text-[#17351a]">{product.name}</h3>
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
