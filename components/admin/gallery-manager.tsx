"use client";

import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { db, storage } from "@/firebase/client";
import { demoGallery } from "@/lib/demo-data";
import type { GalleryImage } from "@/types";

export function GalleryManager() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadImages() {
    setLoading(true);
    try {
      const snapshot = await getDocs(query(collection(db, "gallery"), orderBy("createdAt", "desc")));
      setImages(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as GalleryImage));
    } catch {
      setImages(demoGallery);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadImages();
  }, []);

  async function uploadGalleryImages() {
    if (!files?.length) {
      toast.error("ছবি নির্বাচন করুন");
      return;
    }

    setUploading(true);
    try {
      await Promise.all(
        Array.from(files).map(async (file) => {
          const imageRef = ref(storage, `gallery/${Date.now()}-${file.name}`);
          await uploadBytes(imageRef, file);
          const imageUrl = await getDownloadURL(imageRef);
          await addDoc(collection(db, "gallery"), {
            title: file.name.replace(/\.[^.]+$/, ""),
            imageUrl,
            height: "medium",
            createdAt: serverTimestamp()
          });
        })
      );
      toast.success("গ্যালারি আপডেট হয়েছে");
      setFiles(null);
      await loadImages();
    } catch {
      toast.error("ছবি আপলোড করা যায়নি");
    } finally {
      setUploading(false);
    }
  }

  async function removeImage(image: GalleryImage) {
    if (!confirm(`${image.title} মুছে ফেলবেন?`)) return;
    try {
      await deleteDoc(doc(db, "gallery", image.id));
      toast.success("ছবি মুছে ফেলা হয়েছে");
      await loadImages();
    } catch {
      toast.error("ছবি মুছে ফেলা যায়নি");
    }
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-[#17351a]">নতুন ছবি আপলোড</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <input type="file" multiple accept="image/*" onChange={(event) => setFiles(event.target.files)} className="rounded-xl border border-dashed border-[#2E7D32]/40 p-4 text-sm" />
          <button onClick={uploadGalleryImages} disabled={uploading} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#2E7D32] px-6 font-semibold text-white disabled:opacity-70">
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
            আপলোড
          </button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? <p className="text-neutral-500">লোড হচ্ছে...</p> : null}
        {images.map((image) => (
          <div key={image.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="relative aspect-[4/3] bg-[#E8F5E9]">
              <Image src={image.imageUrl} alt={image.title} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
            </div>
            <div className="flex items-center justify-between gap-3 p-4">
              <p className="font-semibold text-[#17351a]">{image.title}</p>
              <button onClick={() => removeImage(image)} className="grid size-10 place-items-center rounded-full bg-red-50 text-red-700">
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
