"use client";
import { useEffect, useState } from "react";

const empty = { title: "", url: "", description: "" };

export default function VideosManager() {
  const [videos, setVideos] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/videos");
    setVideos(await res.json());
  }
  useEffect(() => {
    load();
  }, []);

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
    if (!confirm("Delete this video?")) return;
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
        {videos.map((v) => (
          <div key={v._id} className="card">
            <div className="aspect-video overflow-hidden rounded-lg">
              <iframe src={v.url} title={v.title} className="h-full w-full" allowFullScreen />
            </div>
            <h4 className="mt-3 font-bold text-navy-900">{v.title}</h4>
            {v.description && (
              <p className="mt-1 text-sm text-navy-600">{v.description}</p>
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
        ))}
      </div>
    </div>
  );
}
