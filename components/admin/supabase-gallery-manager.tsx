"use client";

import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  deleteAdminGalleryImage,
  getAdminGalleryManagerData,
  uploadAdminGalleryImages
} from "@/actions/admin-gallery";
import type { AdminGalleryImage } from "@/lib/supabase/admin-gallery";

export function SupabaseGalleryManager() {
  const [images, setImages] = useState<AdminGalleryImage[]>([]);
  const [files, setFiles] = useState<FileList | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [altText, setAltText] = useState("");
  const [height, setHeight] = useState<"short" | "medium" | "tall">("medium");
  const [sortOrder, setSortOrder] = useState(0);
  const [published, setPublished] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const selectedFileCount = files?.length ?? 0;

  async function loadImages() {
    setLoading(true);
    try {
      setImages(await getAdminGalleryManagerData());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gallery images could not be loaded.");
      setImages([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadImages();
  }, []);

  async function uploadGalleryImages() {
    if (!files?.length) {
      toast.error("Please select at least one image.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("title", title);
      formData.set("description", description);
      formData.set("altText", altText);
      formData.set("height", height);
      formData.set("sortOrder", String(sortOrder));
      formData.set("published", String(published));
      Array.from(files).forEach((file) => formData.append("images", file));

      const result = await uploadAdminGalleryImages(null, formData);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setFiles(null);
      setFileInputKey((value) => value + 1);
      setTitle("");
      setDescription("");
      setAltText("");
      setHeight("medium");
      setSortOrder(0);
      setPublished(true);
      await loadImages();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gallery image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function removeImage(image: AdminGalleryImage) {
    if (!confirm(`Delete ${image.title}?`)) return;

    try {
      const result = await deleteAdminGalleryImage(image.id);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      await loadImages();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gallery image could not be deleted.");
    }
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-[#17351a]">Upload gallery image</h2>
        <div className="mt-4 grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Title, optional"
              className="rounded-xl border border-[#E8F5E9] px-4 py-3 text-sm outline-none focus:border-[#2E7D32]"
            />
            <input
              value={altText}
              onChange={(event) => setAltText(event.target.value)}
              placeholder="Alt text, optional"
              className="rounded-xl border border-[#E8F5E9] px-4 py-3 text-sm outline-none focus:border-[#2E7D32]"
            />
          </div>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={2}
            placeholder="Description, optional"
            className="rounded-xl border border-[#E8F5E9] px-4 py-3 text-sm outline-none focus:border-[#2E7D32]"
          />
          <div className="grid gap-3 sm:grid-cols-[1fr_140px_140px]">
            <input
              key={fileInputKey}
              type="file"
              multiple
              accept="image/*"
              onChange={(event) => setFiles(event.target.files)}
              className="rounded-xl border border-dashed border-[#2E7D32]/40 p-4 text-sm"
            />
            <select
              value={height}
              onChange={(event) => setHeight(event.target.value as "short" | "medium" | "tall")}
              className="rounded-xl border border-[#E8F5E9] px-4 py-3 text-sm outline-none focus:border-[#2E7D32]"
            >
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="tall">Tall</option>
            </select>
            <input
              value={sortOrder}
              onChange={(event) => setSortOrder(Number(event.target.value) || 0)}
              type="number"
              placeholder="Sort"
              className="rounded-xl border border-[#E8F5E9] px-4 py-3 text-sm outline-none focus:border-[#2E7D32]"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-[#1B5E20]">
              <input
                type="checkbox"
                checked={published}
                onChange={(event) => setPublished(event.target.checked)}
              />
              Published
            </label>
            {selectedFileCount ? (
              <span className="text-sm font-semibold text-[#2E7D32]">{selectedFileCount} image selected</span>
            ) : null}
            <button
              type="button"
              onClick={uploadGalleryImages}
              disabled={uploading}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#2E7D32] px-6 font-semibold text-white disabled:opacity-70"
            >
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
              Upload
            </button>
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? <p className="text-neutral-500">Loading...</p> : null}
        {!loading && !images.length ? <p className="text-neutral-500">No gallery images found.</p> : null}
        {images.map((image) => (
          <div key={image.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="relative aspect-[4/3] bg-[#E8F5E9]">
              <Image src={image.imageUrl} alt={image.altText || image.title} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
            </div>
            <div className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate font-semibold text-[#17351a]">{image.title}</p>
                <p className="mt-1 text-xs font-semibold text-neutral-500">
                  {image.published ? "Published" : "Draft"} - {image.height || "medium"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeImage(image)}
                className="grid size-10 shrink-0 place-items-center rounded-full bg-red-50 text-red-700"
                aria-label={`Delete ${image.title}`}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
