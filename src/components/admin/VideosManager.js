"use client";
import { useEffect, useMemo, useState } from "react";

const empty = { title: "", url: "", description: "" };

/* Video-type sections show the first N videos from this list, in the exact
   order they appear here (see VideoSection in SectionRenderer.js). So a
   video's *position* in this list decides whether it's actually visible —
   this works out, for every video, which sections show it and whether it's
   within that section's limit. Carousel / project-card slides can also
   embed a specific video URL directly. */
function computeVideoUsage(videos, sections) {
  const usage = {};
  videos.forEach((v) => {
    usage[v._id] = [];
  });

  sections.forEach((s) => {
    const label = s.title || `Untitled ${s.type} section`;

    if (s.type === "video") {
      const limit = s.videoLimit || 2;
      videos.slice(0, limit).forEach((v) => {
        usage[v._id].push({ label, detail: `video block (top ${limit})` });
      });
    }

    if (Array.isArray(s.items)) {
      s.items.forEach((it) => {
        if (it?.type === "video" && it?.src) {
          const match = videos.find((v) => v.url === it.src);
          if (match) usage[match._id].push({ label, detail: "slide" });
        }
      });
    }
  });

  return usage;
}

export default function VideosManager() {
  const [videos, setVideos] = useState([]);
  const [sections, setSections] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const [vidRes, secRes] = await Promise.all([
      fetch("/api/admin/videos"),
      fetch("/api/admin/sections?page=home"),
    ]);
    setVideos(await vidRes.json());
    setSections(await secRes.json());
  }
  useEffect(() => {
    load();
  }, []);

  const usage = useMemo(() => computeVideoUsage(videos, sections), [videos, sections]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    const method = editId ? "PATCH" : "POST";
    const url = editId ? `/api/admin/videos/${editId}` : "/api/admin/videos";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (res.ok) {
      setForm(empty);
      setEditId(null);
      load();
    } else alert("Failed to save video");
  }

  async function remove(id) {
    const places = [...new Set((usage[id] || []).map((p) => p.label))];
    const warning =
      places.length > 0
        ? `This video is currently showing on the homepage in: ${places.join(
            ", "
          )}.\n\nDeleting it will leave that spot empty. Delete anyway?`
        : "Delete this video?";
    if (!confirm(warning)) return;
    await fetch(`/api/admin/videos/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Form */}
      <form onSubmit={submit} className="card space-y-3">
        <h3 className="font-bold text-navy-900">
          {editId ? "Edit video" : "Add a video"}
        </h3>
        <div>
          <label className="label">Title *</label>
          <input
            className="input"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">YouTube / video URL *</label>
          <input
            className="input"
            placeholder="https://youtube.com/watch?v=… or embed/mp4 URL"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            required
          />
          <p className="mt-1 text-xs text-navy-400">
            Normal YouTube links are auto-converted to embeddable links.
          </p>
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            className="input"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="flex gap-2">
          <button disabled={busy} className="btn-primary">
            {busy ? "Saving…" : editId ? "Update video" : "Add video"}
          </button>
          {editId && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setEditId(null);
                setForm(empty);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* List */}
      <div className="space-y-4">
        {videos.length === 0 && (
          <p className="text-navy-400">No videos yet.</p>
        )}
        {videos.map((v, i) => {
          const places = [...new Set((usage[v._id] || []).map((p) => p.label))];
          return (
          <div key={v._id} className="card">
            <div className="relative aspect-video overflow-hidden rounded-lg">
              <iframe src={v.url} title={v.title} className="h-full w-full" allowFullScreen />
              <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">
                #{i + 1} in order
              </span>
            </div>
            <h4 className="mt-3 font-bold text-navy-900">{v.title}</h4>
            {v.description && (
              <p className="mt-1 text-sm text-navy-600">{v.description}</p>
            )}
            {places.length > 0 ? (
              <p className="mt-1 text-xs font-medium text-green-700">
                ✓ Used in: {places.join(", ")}
              </p>
            ) : (
              <p className="mt-1 text-xs text-navy-400">
                Not currently shown (add a "Video block" section, or move this
                higher in the list to bring it within a section's limit)
              </p>
            )}
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  setEditId(v._id);
                  setForm({
                    title: v.title,
                    url: v.url,
                    description: v.description || "",
                  });
                }}
                className="btn-secondary text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => remove(v._id)}
                className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
              >
                Delete
              </button>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}
