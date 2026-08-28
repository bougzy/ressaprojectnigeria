"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const TYPE_LABELS = {
  hero: "🦸 Hero (top banner)",
  marquee: "🎗️ Scrolling trust bar",
  stats: "📊 Stats strip",
  richtext: "📝 Text + image",
  services: "🧩 Service / feature cards",
  gallery: "🖼️ Image gallery",
  video: "🎬 Video block",
  testimonials: "💬 Testimonials",
  faq: "❓ FAQ",
  cta: "📣 Call-to-action banner",
  carousel: "🎠 Photo & video carousel",
  imageBlock: "🖼️ Simple image block",
  projectCards: "🗂️ Our Projects (sliding cards)",
};

const BG_OPTIONS = [
  ["white", "White"],
  ["light", "Light grey"],
  ["dark", "Dark navy"],
  ["brand", "Brand colour"],
  ["gradient", "Animated gradient"],
];

function defaultItemsFor(type) {
  if (type === "stats") return [{ value: "10+", label: "Years" }];
  if (type === "services") return [{ title: "New service", desc: "Description", icon: "land" }];
  if (type === "testimonials") return [{ name: "Happy customer", role: "Subscriber", quote: "Great experience!" }];
  if (type === "faq") return [{ q: "Question?", a: "Answer." }];
  if (type === "marquee") return ["New highlight"];
  if (type === "carousel") return [];
  if (type === "projectCards") return [];
  return [];
}

function ImagePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  async function load() {
    const res = await fetch("/api/admin/images");
    setImages(await res.json());
    setOpen(true);
  }

  async function uploadFromDevice(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("noRecord", "true");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    setUploading(false);
    if (res.ok) {
      const { src } = await res.json();
      onChange(src);
    } else {
      alert("Upload failed — the file may be too large.");
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="file"
          accept="image/*"
          ref={fileRef}
          onChange={uploadFromDevice}
          disabled={uploading}
          className="max-w-[10.5rem] text-xs"
        />
        <button type="button" className="btn-secondary shrink-0 text-sm" onClick={load}>
          Choose from gallery
        </button>
        {uploading && <span className="text-xs font-medium text-brand-600">Uploading…</span>}
      </div>
      <input
        className="input mt-2"
        placeholder="/images/example.jpg"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <div className="relative mt-2 h-24 w-24 overflow-hidden rounded-lg ring-1 ring-navy-100">
          <Image src={value} alt="" fill className="object-cover" />
        </div>
      )}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setOpen(false)}>
          <div className="max-h-[80vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-bold text-navy-900">Choose an image</h4>
              <button className="text-navy-400" onClick={() => setOpen(false)}>✕</button>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {images.map((img) => (
                <button
                  type="button"
                  key={img._id}
                  onClick={() => {
                    onChange(img.src);
                    setOpen(false);
                  }}
                  className="relative aspect-square overflow-hidden rounded-lg ring-1 ring-navy-100 hover:ring-2 hover:ring-brand-400"
                >
                  <Image src={img.src} alt={img.alt || ""} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MediaItemsEditor({ items, onChange, withTitle = false, label = "Slides" }) {
  const [picking, setPicking] = useState(false);
  const [images, setImages] = useState([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoCaption, setVideoCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const fileRef = useRef();

  async function openPicker() {
    const res = await fetch("/api/admin/images");
    setImages(await res.json());
    setPicking(true);
  }

  function addImage(src) {
    onChange([...items, { type: "image", src, title: "", caption: "" }]);
    setPicking(false);
  }

  function addVideo() {
    if (!videoUrl.trim()) return;
    onChange([
      ...items,
      { type: "video", src: videoUrl.trim(), title: videoTitle.trim(), caption: videoCaption.trim() },
    ]);
    setVideoUrl("");
    setVideoTitle("");
    setVideoCaption("");
  }

  // Upload one or several images/videos straight from the admin's device.
  // Files are uploaded one at a time (so a slow/large one doesn't block the
  // rest) and each becomes its own new slide/card, appended in order.
  async function handleFilesSelected(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const newItems = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress(`Uploading ${i + 1} of ${files.length}: ${file.name}`);
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("noRecord", "true");
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        if (!res.ok) throw new Error(await res.text());
        const { src, kind } = await res.json();
        newItems.push({
          type: kind === "video" ? "video" : "image",
          src,
          title: "",
          caption: "",
        });
      } catch {
        alert(`Failed to upload "${file.name}" — it may be too large. Skipping.`);
      }
    }
    if (newItems.length) onChange([...items, ...newItems]);
    setUploading(false);
    setProgress("");
    if (fileRef.current) fileRef.current.value = "";
  }

  function updateField(i, field, value) {
    onChange(items.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)));
  }

  function remove(i) {
    onChange(items.filter((_, idx) => idx !== i));
  }

  function move(i, dir) {
    const j = dir === "up" ? i - 1 : i + 1;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div>
      <label className="label">{label}</label>
      <div className="space-y-2">
        {items.length === 0 && (
          <p className="text-sm text-navy-400">Nothing added yet — add photos/videos below.</p>
        )}
        {items.map((it, i) => (
          <div key={i} className="flex flex-wrap items-center gap-3 rounded-lg border border-navy-100 p-2">
            <div className="flex flex-col text-navy-400">
              <button type="button" disabled={i === 0} onClick={() => move(i, "up")} className="hover:text-brand-500 disabled:opacity-30">▲</button>
              <button type="button" disabled={i === items.length - 1} onClick={() => move(i, "down")} className="hover:text-brand-500 disabled:opacity-30">▼</button>
            </div>
            <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded bg-navy-900">
              {it.type === "video" ? (
                <div className="flex h-full w-full items-center justify-center text-xl text-white">▶</div>
              ) : (
                <Image src={it.src} alt="" fill className="object-cover" />
              )}
            </div>
            <span className="shrink-0 rounded-full bg-navy-50 px-2 py-0.5 text-xs font-semibold text-navy-600">
              {it.type === "video" ? "Video" : "Image"}
            </span>
            <div className="flex flex-1 flex-col gap-1.5 sm:flex-row">
              {withTitle && (
                <input
                  className="input sm:w-40"
                  placeholder="Title"
                  value={it.title || ""}
                  onChange={(e) => updateField(i, "title", e.target.value)}
                />
              )}
              <input
                className="input flex-1"
                placeholder="Optional caption / short text"
                value={it.caption || ""}
                onChange={(e) => updateField(i, "caption", e.target.value)}
              />
            </div>
            <button type="button" className="shrink-0 text-sm font-semibold text-red-500" onClick={() => remove(i)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3 space-y-3 rounded-lg bg-navy-50 p-3">
        <div>
          <label className="label">
            Add photos or videos from your device{" "}
            <span className="font-normal text-navy-400">(select several at once)</span>
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFilesSelected}
              disabled={uploading}
              className="text-sm"
            />
            {uploading && <span className="text-xs font-medium text-brand-600">{progress}</span>}
          </div>
          <p className="mt-1 text-xs text-navy-400">
            Large video files may fail to upload depending on your hosting
            plan — for videos, pasting a YouTube link below is more
            reliable and loads faster for visitors.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-navy-100 pt-3">
          <button type="button" className="btn-secondary" onClick={openPicker}>
            + Choose from existing gallery
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-navy-100 pt-3">
          <input
            className="input max-w-xs"
            placeholder="Or paste a YouTube link"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
          {withTitle && (
            <input
              className="input max-w-[10rem]"
              placeholder="Title (optional)"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
            />
          )}
          <input
            className="input max-w-[10rem]"
            placeholder="Caption (optional)"
            value={videoCaption}
            onChange={(e) => setVideoCaption(e.target.value)}
          />
          <button type="button" className="btn-secondary" onClick={addVideo}>
            + Add video link
          </button>
        </div>
      </div>

      {picking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setPicking(false)}>
          <div className="max-h-[80vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-bold text-navy-900">Choose an image</h4>
              <button className="text-navy-400" onClick={() => setPicking(false)}>✕</button>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {images.map((img) => (
                <button
                  type="button"
                  key={img._id}
                  onClick={() => addImage(img.src)}
                  className="relative aspect-square overflow-hidden rounded-lg ring-1 ring-navy-100 hover:ring-2 hover:ring-brand-400"
                >
                  <Image src={img.src} alt={img.alt || ""} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionEditor({ section, onChange }) {
  const [itemsText, setItemsText] = useState(JSON.stringify(section.items ?? [], null, 2));
  const t = section.type;

  function set(k, v) {
    onChange({ ...section, [k]: v });
  }

  function applyItems() {
    try {
      set("items", JSON.parse(itemsText));
      return true;
    } catch {
      return false;
    }
  }

  const showItems = ["stats", "services", "testimonials", "faq", "marquee"].includes(t);
  const showImage = ["hero", "richtext", "imageBlock"].includes(t);
  const showBody = ["richtext", "cta", "imageBlock"].includes(t);
  const showTitle = t !== "marquee" && t !== "imageBlock";
  const showEyebrow = ["hero", "richtext", "services", "gallery", "video", "testimonials", "faq", "carousel", "projectCards"].includes(t);
  const showSubtitle = ["hero", "gallery", "carousel", "projectCards"].includes(t);
  const showCta = ["hero", "richtext", "gallery", "cta"].includes(t);
  const showCta2 = t === "hero";
  const showGalleryOpts = t === "gallery";
  const showVideoOpts = t === "video";
  const showCarouselOpts = t === "carousel";
  const showProjectCardsOpts = t === "projectCards";

  return (
    <div className="space-y-4 border-t border-navy-100 pt-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Background</label>
          <select className="input" value={section.bg} onChange={(e) => set("bg", e.target.value)}>
            {BG_OPTIONS.map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        {showImage && (
          <div className="sm:row-span-3">
            <label className="label">Image (leave blank to auto-use a gallery photo)</label>
            <ImagePicker value={section.image} onChange={(v) => set("image", v)} />
            {t === "richtext" && (
              <div className="mt-2">
                <label className="label">Image position</label>
                <select className="input" value={section.imagePosition} onChange={(e) => set("imagePosition", e.target.value)}>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {showEyebrow && (
        <div>
          <label className="label">Eyebrow / label</label>
          <input className="input" value={section.eyebrow || ""} onChange={(e) => set("eyebrow", e.target.value)} />
        </div>
      )}
      {showTitle && (
        <div>
          <label className="label">Title</label>
          <input className="input" value={section.title || ""} onChange={(e) => set("title", e.target.value)} />
        </div>
      )}
      {showSubtitle && (
        <div>
          <label className="label">Subtitle</label>
          <textarea className="input" rows={2} value={section.subtitle || ""} onChange={(e) => set("subtitle", e.target.value)} />
        </div>
      )}
      {showBody && (
        <div>
          <label className="label">Body text</label>
          <textarea className="input" rows={4} value={section.body || ""} onChange={(e) => set("body", e.target.value)} />
        </div>
      )}

      {showCta && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Button text</label>
            <input className="input" value={section.ctaText || ""} onChange={(e) => set("ctaText", e.target.value)} />
          </div>
          <div>
            <label className="label">Button link</label>
            <input className="input" value={section.ctaHref || ""} onChange={(e) => set("ctaHref", e.target.value)} />
          </div>
        </div>
      )}
      {showCta2 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Second button text</label>
            <input className="input" value={section.ctaText2 || ""} onChange={(e) => set("ctaText2", e.target.value)} />
          </div>
          <div>
            <label className="label">Second button link</label>
            <input className="input" value={section.ctaHref2 || ""} onChange={(e) => set("ctaHref2", e.target.value)} />
          </div>
        </div>
      )}

      {showGalleryOpts && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Show images from category</label>
            <select className="input" value={section.galleryCategory || ""} onChange={(e) => set("galleryCategory", e.target.value)}>
              <option value="">Any</option>
              <option value="project">Projects</option>
              <option value="event">Events</option>
              <option value="flyer">Flyers</option>
              <option value="featured">Featured only</option>
            </select>
          </div>
          <div>
            <label className="label">Max images to show</label>
            <input type="number" min={1} max={24} className="input" value={section.galleryLimit ?? 8} onChange={(e) => set("galleryLimit", Number(e.target.value))} />
          </div>
        </div>
      )}
      {showVideoOpts && (
        <div>
          <label className="label">Max videos to show</label>
          <input type="number" min={1} max={6} className="input" value={section.videoLimit ?? 2} onChange={(e) => set("videoLimit", Number(e.target.value))} />
        </div>
      )}

      {showItems && (
        <div>
          <label className="label">
            {t === "stats" && "Stats — [{value,label}]"}
            {t === "services" && "Cards — [{title,desc,icon}] icons: land,discount,gift,expert,legal,community"}
            {t === "testimonials" && "Testimonials — [{name,role,quote}]"}
            {t === "faq" && "Questions — [{q,a}]"}
            {t === "marquee" && "Scrolling words — [\"...\"]"}
          </label>
          <textarea
            className="input font-mono text-xs"
            rows={6}
            value={itemsText}
            onChange={(e) => setItemsText(e.target.value)}
            onBlur={applyItems}
          />
        </div>
      )}

      {showCarouselOpts && (
        <MediaItemsEditor
          label="Carousel slides"
          items={Array.isArray(section.items) ? section.items : []}
          onChange={(items) => set("items", items)}
        />
      )}

      {showProjectCardsOpts && (
        <MediaItemsEditor
          label="Project cards"
          withTitle
          items={Array.isArray(section.items) ? section.items : []}
          onChange={(items) => set("items", items)}
        />
      )}
    </div>
  );
}

export default function SectionsManager() {
  const [sections, setSections] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [newType, setNewType] = useState("richtext");
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await fetch("/api/admin/sections?page=home");
    setSections(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  if (!sections) return <p className="text-navy-400">Loading…</p>;

  async function addSection() {
    const res = await fetch("/api/admin/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: newType,
        page: "home",
        title: `New ${TYPE_LABELS[newType]?.replace(/^\S+\s/, "") || newType} section`,
        bg: "white",
        items: defaultItemsFor(newType),
      }),
    });
    if (res.ok) {
      const doc = await res.json();
      setSections((prev) => [...prev, doc]);
      setOpenId(doc._id);
    }
  }

  async function saveSection(section) {
    setBusyId(section._id);
    const res = await fetch(`/api/admin/sections/${section._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(section),
    });
    setBusyId(null);
    setMsg(res.ok ? "✓ Section saved" : "Save failed");
    setTimeout(() => setMsg(""), 2500);
  }

  async function toggleVisible(section) {
    const updated = { ...section, visible: !section.visible };
    setSections((prev) => prev.map((s) => (s._id === section._id ? updated : s)));
    await fetch(`/api/admin/sections/${section._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: updated.visible }),
    });
  }

  async function remove(section) {
    if (!confirm(`Delete the "${section.title || section.type}" section? This cannot be undone.`)) return;
    await fetch(`/api/admin/sections/${section._id}`, { method: "DELETE" });
    setSections((prev) => prev.filter((s) => s._id !== section._id));
  }

  async function move(section, dir) {
    const sorted = [...sections].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((s) => s._id === section._id);
    const swapWith = dir === "up" ? idx - 1 : idx + 1;
    if (swapWith < 0 || swapWith >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[swapWith];
    const orderA = b.order;
    const orderB = a.order;
    const next = sorted.map((s) =>
      s._id === a._id ? { ...s, order: orderA } : s._id === b._id ? { ...s, order: orderB } : s
    );
    setSections(next);
    await fetch("/api/admin/sections/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order: [
          { id: a._id, order: orderA },
          { id: b._id, order: orderB },
        ],
      }),
    });
  }

  const sorted = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className="max-w-4xl space-y-4">
      <div className="rounded-xl bg-brand-50 p-4 text-sm text-brand-800 ring-1 ring-brand-100">
        These blocks build the homepage top to bottom. Reorder, hide, edit or
        delete any of them, or add a brand-new block below.
      </div>

      <div className="card flex flex-wrap items-center gap-3">
        <select className="input max-w-xs" value={newType} onChange={(e) => setNewType(e.target.value)}>
          {Object.entries(TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <button className="btn-primary" onClick={addSection} type="button">
          + Add section
        </button>
        {msg && <span className="text-sm text-navy-600">{msg}</span>}
      </div>

      <div className="space-y-3">
        {sorted.map((section, i) => (
          <div key={section._id} className="card">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-col">
                <button type="button" disabled={i === 0} onClick={() => move(section, "up")} className="text-navy-400 hover:text-brand-500 disabled:opacity-30">▲</button>
                <button type="button" disabled={i === sorted.length - 1} onClick={() => move(section, "down")} className="text-navy-400 hover:text-brand-500 disabled:opacity-30">▼</button>
              </div>
              <span className="rounded-full bg-navy-50 px-2.5 py-1 text-xs font-semibold text-navy-600">
                {TYPE_LABELS[section.type] || section.type}
              </span>
              <span className="flex-1 truncate font-medium text-navy-900">
                {section.title || <em className="text-navy-400">Untitled</em>}
              </span>
              <label className="flex items-center gap-1.5 text-xs text-navy-500">
                <input type="checkbox" checked={section.visible !== false} onChange={() => toggleVisible(section)} />
                Visible
              </label>
              <button type="button" className="text-sm font-semibold text-brand-500" onClick={() => setOpenId(openId === section._id ? null : section._id)}>
                {openId === section._id ? "Close" : "Edit"}
              </button>
              <button type="button" className="text-sm font-semibold text-red-500" onClick={() => remove(section)}>
                Delete
              </button>
            </div>

            {openId === section._id && (
              <>
                <SectionEditor
                  section={section}
                  onChange={(updated) =>
                    setSections((prev) => prev.map((s) => (s._id === updated._id ? updated : s)))
                  }
                />
                <div className="mt-4 flex items-center gap-3">
                  <button type="button" className="btn-primary" disabled={busyId === section._id} onClick={() => saveSection(sections.find((s) => s._id === section._id))}>
                    {busyId === section._id ? "Saving…" : "Save section"}
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
