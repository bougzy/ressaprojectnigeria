"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

const CATEGORIES = ["hero", "flyer", "project", "event", "logo", "about", "misc"];

/* Work out, for every image, exactly which homepage sections currently show
   it — either because it was picked directly (hero/richtext/imageBlock
   image, or a carousel/project-card slide), or because a "gallery" section
   auto-pulls it in by category and it falls within that section's limit.
   This lets an admin see precisely where an image is placed before they
   remove or replace it, instead of guessing. */
function computeImageUsage(images, sections) {
  const usage = {};
  images.forEach((img) => {
    usage[img._id] = [];
  });

  sections.forEach((s) => {
    const label = s.title || `Untitled ${s.type} section`;

    if (s.image) {
      const match = images.find((i) => i.src === s.image);
      if (match) usage[match._id].push({ label, detail: "main image" });
    }

    if (Array.isArray(s.items)) {
      s.items.forEach((it) => {
        if (it?.type !== "video" && it?.src) {
          const match = images.find((i) => i.src === it.src);
          if (match) usage[match._id].push({ label, detail: "slide" });
        }
      });
    }

    if (s.type === "gallery") {
      const cat = s.galleryCategory;
      const pool = !cat
        ? images
        : cat === "featured"
        ? images.filter((i) => i.featured)
        : images.filter((i) => i.category === cat);
      const shown = pool.slice(0, s.galleryLimit || 8);
      shown.forEach((img) => usage[img._id].push({ label, detail: "gallery photo" }));
    }
  });

  return usage;
}

export default function ImagesManager() {
  const [images, setImages] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState(null); // image object being edited
  const [uploadOpen, setUploadOpen] = useState(false);

  async function load() {
    setLoading(true);
    const [imgRes, secRes] = await Promise.all([
      fetch("/api/admin/images"),
      fetch("/api/admin/sections?page=home"),
    ]);
    setImages(await imgRes.json());
    setSections(await secRes.json());
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  const usage = useMemo(() => computeImageUsage(images, sections), [images, sections]);

  async function remove(id) {
    const places = usage[id] || [];
    const uniquePlaces = [...new Set(places.map((p) => p.label))];
    const warning =
      uniquePlaces.length > 0
        ? `This image is currently showing on the homepage in: ${uniquePlaces.join(
            ", "
          )}.\n\nDeleting it will leave that spot empty. Delete anyway?`
        : "Delete this image permanently?";
    if (!confirm(warning)) return;
    await fetch(`/api/admin/images/${id}`, { method: "DELETE" });
    setImages((x) => x.filter((i) => i._id !== id));
  }

  const cats = ["all", ...new Set(images.map((i) => i.category))];
  const shown =
    filter === "all" ? images : images.filter((i) => i.category === filter);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize ${
                filter === c
                  ? "bg-brand-500 text-white"
                  : "bg-white text-navy-700 ring-1 ring-navy-200"
              }`}
            >
              {c} {c !== "all" && `(${images.filter((i) => i.category === c).length})`}
            </button>
          ))}
        </div>
        <button onClick={() => setUploadOpen(true)} className="btn-primary">
          + Add / Upload image
        </button>
      </div>

      {loading ? (
        <p className="text-navy-400">Loading…</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {shown.map((img) => {
            const places = [...new Set((usage[img._id] || []).map((p) => p.label))];
            return (
            <div
              key={img._id}
              className="group overflow-hidden rounded-xl bg-white ring-1 ring-navy-100"
            >
              <div className="relative aspect-square">
                <Image
                  src={img.src}
                  alt={img.alt || ""}
                  fill
                  className="object-cover"
                  sizes="200px"
                />
                <span className="absolute left-1.5 top-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] capitalize text-white">
                  {img.category}
                  {img.year ? ` · ${img.year}` : ""}
                </span>
              </div>
              <div className="px-2 pt-1.5">
                {places.length > 0 ? (
                  <p className="truncate text-[11px] font-medium text-green-700" title={`Used on the homepage in: ${places.join(", ")}`}>
                    ✓ Used in: {places.join(", ")}
                  </p>
                ) : (
                  <p className="truncate text-[11px] text-navy-400">Not on homepage</p>
                )}
              </div>
              <div className="flex gap-1 p-2">
                <button
                  onClick={() => setEditing(img)}
                  className="flex-1 rounded-md bg-navy-50 py-1.5 text-xs font-medium text-navy-700 hover:bg-navy-100"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(img._id)}
                  className="flex-1 rounded-md bg-red-50 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}
      <p className="mt-4 text-sm text-navy-500">
        {images.length} images total. None of your original site images are left
        out — they’re all here, organised by category.
      </p>

      {editing && (
        <EditModal
          img={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setImages((x) =>
              x.map((i) => (i._id === updated._id ? updated : i))
            );
            setEditing(null);
          }}
        />
      )}
      {uploadOpen && (
        <UploadModal
          onClose={() => setUploadOpen(false)}
          onAdded={(doc) => {
            setImages((x) => [...x, doc]);
            setUploadOpen(false);
          }}
        />
      )}
    </div>
  );
}

/* ---------------- Edit / Change image ---------------- */
function EditModal({ img, onClose, onSaved }) {
  const [form, setForm] = useState({
    alt: img.alt || "",
    caption: img.caption || "",
    category: img.category || "event",
    year: img.year || "",
    featured: !!img.featured,
  });
  const [busy, setBusy] = useState(false);
  const fileRef = useRef();

  async function saveText() {
    setBusy(true);
    const res = await fetch(`/api/admin/images/${img._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (res.ok) onSaved(await res.json());
  }

  async function replaceImage() {
    const file = fileRef.current?.files?.[0];
    if (!file) return alert("Choose a file first");
    setBusy(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("replaceId", img._id);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    setBusy(false);
    if (res.ok) onSaved(await res.json());
  }

  return (
    <Modal title="Edit image" onClose={onClose}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-lg ring-1 ring-navy-100">
          <Image src={img.src} alt="" fill className="object-cover" sizes="300px" />
        </div>
        <div className="space-y-3">
          <div>
            <label className="label">Alt text (for SEO / accessibility)</label>
            <input
              className="input"
              value={form.alt}
              onChange={(e) => setForm({ ...form, alt: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Caption</label>
            <input
              className="input"
              value={form.caption}
              onChange={(e) => setForm({ ...form, caption: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category</label>
              <select
                className="input"
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Year</label>
              <input
                className="input"
                placeholder="2024"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-navy-700">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) =>
                setForm({ ...form, featured: e.target.checked })
              }
            />
            Featured on homepage
          </label>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-navy-50 p-3">
        <label className="label">Replace the actual image file</label>
        <div className="flex flex-wrap items-center gap-2">
          <input type="file" accept="image/*" ref={fileRef} className="text-sm" />
          <button
            onClick={replaceImage}
            disabled={busy}
            className="btn-secondary text-sm"
          >
            Upload replacement
          </button>
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button onClick={saveText} disabled={busy} className="btn-primary">
          {busy ? "Saving…" : "Save changes"}
        </button>
      </div>
    </Modal>
  );
}

/* ---------------- Upload / Add new image ---------------- */
function UploadModal({ onClose, onAdded }) {
  const [busy, setBusy] = useState(false);
  const [meta, setMeta] = useState({
    category: "event",
    year: "",
    alt: "",
    caption: "",
    featured: false,
  });
  const fileRef = useRef();

  async function upload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return alert("Choose a file");
    setBusy(true);
    const fd = new FormData();
    fd.append("file", file);
    Object.entries(meta).forEach(([k, v]) => fd.append(k, String(v)));
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    setBusy(false);
    if (res.ok) onAdded(await res.json());
    else alert("Upload failed");
  }

  return (
    <Modal title="Add a new image" onClose={onClose}>
      <div className="space-y-3">
        <div>
          <label className="label">Image file</label>
          <input type="file" accept="image/*" ref={fileRef} className="text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Category</label>
            <select
              className="input"
              value={meta.category}
              onChange={(e) => setMeta({ ...meta, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Year</label>
            <input
              className="input"
              placeholder="2024"
              value={meta.year}
              onChange={(e) => setMeta({ ...meta, year: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="label">Alt text</label>
          <input
            className="input"
            value={meta.alt}
            onChange={(e) => setMeta({ ...meta, alt: e.target.value })}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-navy-700">
          <input
            type="checkbox"
            checked={meta.featured}
            onChange={(e) => setMeta({ ...meta, featured: e.target.checked })}
          />
          Feature on homepage
        </label>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button onClick={upload} disabled={busy} className="btn-primary">
          {busy ? "Uploading…" : "Upload image"}
        </button>
      </div>
    </Modal>
  );
}

/* ---------------- Generic modal ---------------- */
function Modal({ title, children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-navy-900">{title}</h3>
          <button onClick={onClose} className="text-2xl text-navy-400 hover:text-navy-700">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
