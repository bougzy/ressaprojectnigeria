"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { compressImageFile, uploadFilesInBatches } from "@/lib/clientMedia";

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

  async function load() {
    const res = await fetch("/api/admin/images");
    setImages(await res.json());
    setOpen(true);
  }

  async function uploadNew(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const compressed = await compressImageFile(file);
    const { results, errors } = await uploadFilesInBatches([compressed], { category: "misc" }, "image");
    setUploading(false);
    e.target.value = "";
    if (results[0]) {
      onChange(results[0].src);
      setOpen(false);
    }
    if (errors.length) alert(errors.join("\n\n"));
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <input
          className="input"
          placeholder="/images/example.jpg"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
        <button type="button" className="btn-secondary shrink-0" onClick={load}>
          Choose
        </button>
      </div>
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
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-navy-50 p-2.5">
              <label className="text-sm font-medium text-navy-700 shrink-0">
                Or upload from your device:
              </label>
              <input type="file" accept="image/*" onChange={uploadNew} disabled={uploading} className="text-sm" />
              {uploading && <span className="text-sm text-navy-500">Uploading…</span>}
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
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideos, setUploadingVideos] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");

  async function openPicker() {
    const res = await fetch("/api/admin/images");
    setImages(await res.json());
    setPicking(true);
  }

  function addImage(src) {
    onChange([...items, { type: "image", src, title: "", caption: "" }]);
    setPicking(false);
  }

  // Upload several local image files at once and add each as a new slide —
  // no need to add them to the library first.
  async function uploadImages(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingImages(true);
    const compressed = [];
    for (let i = 0; i < files.length; i++) {
      setUploadMsg(`Compressing image ${i + 1} of ${files.length}…`);
      compressed.push(await compressImageFile(files[i]));
    }
    setUploadMsg(`Uploading ${compressed.length} image${compressed.length === 1 ? "" : "s"}…`);
    const { results, errors } = await uploadFilesInBatches(compressed, { category: "misc" }, "image");
    setUploadingImages(false);
    setUploadMsg("");
    e.target.value = "";
    if (results.length) {
      onChange([...items, ...results.map((r) => ({ type: "image", src: r.src, title: "", caption: "" }))]);
    }
    if (errors.length) alert(errors.join("\n\n"));
  }

  // Upload several short local video clips at once and add each as a new
  // slide. Longer videos should use the "paste a YouTube link" option
  // instead, since uploaded clips are capped to keep pages loading fast.
  async function uploadVideos(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingVideos(true);
    setUploadMsg(`Uploading ${files.length} video${files.length === 1 ? "" : "s"}…`);
    const { results, errors } = await uploadFilesInBatches(
      files,
      {},
      "video",
      3.5 * 1024 * 1024
    );
    setUploadingVideos(false);
    setUploadMsg("");
    e.target.value = "";
    if (results.length) {
      onChange([
        ...items,
        ...results.map((r) => ({ type: "video", src: r.url, title: r.title || "", caption: "" })),
      ]);
    }
    if (errors.length) alert(errors.join("\n\n"));
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
          <p className="text-sm text-navy-400">Nothing added yet — add an image or video below.</p>
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

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" className="btn-secondary" onClick={openPicker}>
          + Add image
        </button>
        <label className="btn-secondary cursor-pointer">
          {uploadingImages ? "Uploading…" : "+ Upload image(s) from device"}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={uploadImages}
            disabled={uploadingImages}
            className="hidden"
          />
        </label>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <input
          className="input max-w-xs"
          placeholder="Paste a YouTube link"
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
          + Add video
        </button>
        <label className="btn-secondary cursor-pointer">
          {uploadingVideos ? "Uploading…" : "+ Upload video file(s) from device"}
          <input
            type="file"
            accept="video/*"
            multiple
            onChange={uploadVideos}
            disabled={uploadingVideos}
            className="hidden"
          />
        </label>
      </div>
      {uploadMsg && <p className="mt-1 text-xs text-navy-500">{uploadMsg}</p>}
      <p className="mt-1 text-xs text-navy-400">
        Uploaded video clips work best under ~3.5MB each. For longer videos, paste a YouTube link instead.
      </p>

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

/* -------- What a gallery / video section actually shows live -------- */
function galleryPool(images, section) {
  const cat = section.galleryCategory;
  const pool = !cat
    ? images
    : cat === "featured"
    ? images.filter((i) => i.featured)
    : images.filter((i) => i.category === cat);
  return pool.slice(0, section.galleryLimit || 8);
}

function videoPool(videos, section) {
  return videos.slice(0, section.videoLimit || 2);
}

/* A small stacked-thumbnail preview shown in the collapsed section row, so
   an admin can see at a glance exactly which photo/video is placed where
   on the homepage without opening "Edit". */
function SectionThumb({ section, images, videos }) {
  const t = section.type;
  const box = "relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-navy-800 ring-2 ring-white";

  if (["richtext", "imageBlock"].includes(t)) {
    if (section.image) {
      return (
        <div className={box}>
          <Image src={section.image} alt="" fill className="object-cover" sizes="44px" />
        </div>
      );
    }
    return (
      <div className={`${box} flex items-center justify-center text-[9px] font-medium text-white/70`}>
        auto
      </div>
    );
  }

  if (["hero", "carousel", "projectCards"].includes(t)) {
    const items = Array.isArray(section.items) ? section.items : [];
    if (!items.length) {
      return (
        <div className={`${box} flex items-center justify-center text-[9px] font-medium text-white/70`}>
          empty
        </div>
      );
    }
    return (
      <div className="flex -space-x-3">
        {items.slice(0, 3).map((it, idx) => (
          <div key={idx} className={box} style={{ zIndex: 3 - idx }}>
            {it.type === "video" ? (
              <div className="flex h-full w-full items-center justify-center text-sm text-white">▶</div>
            ) : (
              <Image src={it.src} alt="" fill className="object-cover" sizes="44px" />
            )}
          </div>
        ))}
        {items.length > 3 && (
          <div className={`${box} flex items-center justify-center text-[9px] font-bold text-white`}>
            +{items.length - 3}
          </div>
        )}
      </div>
    );
  }

  if (t === "gallery") {
    const shown = galleryPool(images, section);
    if (!shown.length) {
      return (
        <div className={`${box} flex items-center justify-center text-[9px] font-medium text-white/70`}>
          none
        </div>
      );
    }
    return (
      <div className="flex -space-x-3">
        {shown.slice(0, 3).map((img, idx) => (
          <div key={img._id} className={box} style={{ zIndex: 3 - idx }}>
            <Image src={img.src} alt="" fill className="object-cover" sizes="44px" />
          </div>
        ))}
        {shown.length > 3 && (
          <div className={`${box} flex items-center justify-center text-[9px] font-bold text-white`}>
            +{shown.length - 3}
          </div>
        )}
      </div>
    );
  }

  if (t === "video") {
    const shown = videoPool(videos, section);
    return (
      <div className={`${box} flex items-center justify-center text-base text-white`}>
        ▶
        {shown.length > 0 && (
          <span className="absolute bottom-0 right-0 rounded-tl bg-black/70 px-1 text-[9px] font-bold text-white">
            {shown.length}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`${box} flex items-center justify-center text-[9px] font-medium text-white/70`}>
      —
    </div>
  );
}

/* One-line plain-English summary of what's currently live in this section,
   shown under the title so an admin doesn't have to open it to know. */
function sectionSummary(section, images, videos) {
  const t = section.type;
  if (["richtext", "imageBlock"].includes(t)) {
    return section.image
      ? "Custom image set"
      : "No image chosen — falls back to a default photo";
  }
  if (["hero", "carousel", "projectCards"].includes(t)) {
    const items = Array.isArray(section.items) ? section.items : [];
    const imgCount = items.filter((i) => i.type !== "video").length;
    const vidCount = items.filter((i) => i.type === "video").length;
    if (!items.length)
      return t === "hero" ? "No slides added yet — falls back to a plain background" : "No slides added yet";
    const parts = [];
    if (imgCount) parts.push(`${imgCount} photo${imgCount === 1 ? "" : "s"}`);
    if (vidCount) parts.push(`${vidCount} video${vidCount === 1 ? "" : "s"}`);
    return parts.join(" + ");
  }
  if (t === "gallery") {
    const shown = galleryPool(images, section);
    const cat = section.galleryCategory || "any category";
    return shown.length
      ? `Shows ${shown.length} photo${shown.length === 1 ? "" : "s"} (${cat})`
      : `No photos match "${cat}" yet`;
  }
  if (t === "video") {
    const shown = videoPool(videos, section);
    return shown.length
      ? `Shows ${shown.length} video${shown.length === 1 ? "" : "s"} (in order from the Videos tab)`
      : "No videos in your library yet";
  }
  return null;
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
  const showImage = ["richtext", "imageBlock"].includes(t);
  const showBody = ["richtext", "cta", "imageBlock"].includes(t);
  const showTitle = t !== "marquee" && t !== "imageBlock";
  const showEyebrow = ["hero", "richtext", "services", "gallery", "video", "testimonials", "faq", "carousel", "projectCards"].includes(t);
  const showSubtitle = ["hero", "gallery", "carousel", "projectCards"].includes(t);
  const showCta = ["hero", "richtext", "gallery", "cta"].includes(t);
  const showCta2 = t === "hero";
  const showGalleryOpts = t === "gallery";
  const showVideoOpts = t === "video";
  const showCarouselOpts = t === "carousel" || t === "hero";
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
          label={t === "hero" ? "Hero slider images" : "Carousel slides"}
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
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [newType, setNewType] = useState("richtext");
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState("");

  async function load() {
    const [secRes, imgRes, vidRes] = await Promise.all([
      fetch("/api/admin/sections?page=home"),
      fetch("/api/admin/images"),
      fetch("/api/admin/videos"),
    ]);
    setSections(await secRes.json());
    setImages(await imgRes.json());
    setVideos(await vidRes.json());
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
              <SectionThumb section={section} images={images} videos={videos} />
              <span className="rounded-full bg-navy-50 px-2.5 py-1 text-xs font-semibold text-navy-600">
                {TYPE_LABELS[section.type] || section.type}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-navy-900">
                  {section.title || <em className="text-navy-400">Untitled</em>}
                </span>
                {sectionSummary(section, images, videos) && (
                  <span className="block truncate text-xs text-navy-400">
                    {sectionSummary(section, images, videos)}
                  </span>
                )}
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
