"use client";
import { useEffect, useState } from "react";

export default function MessagesManager() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/messages");
    setMessages(await res.json());
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function toggleRead(m) {
    await fetch(`/api/admin/messages/${m._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: !m.read }),
    });
    load();
  }
  async function remove(id) {
    if (!confirm("Delete this message?")) return;
    await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
    setMessages((x) => x.filter((m) => m._id !== id));
  }

  if (loading) return <p className="text-navy-400">Loading…</p>;
  if (messages.length === 0)
    return (
      <p className="text-navy-400">
        No messages yet. Submissions from the contact form will appear here.
      </p>
    );

  return (
    <div className="space-y-3">
      {messages.map((m) => (
        <div
          key={m._id}
          className={`card ${m.read ? "opacity-70" : "ring-2 ring-brand-200"}`}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h4 className="font-bold text-navy-900">
                {m.name}{" "}
                {!m.read && (
                  <span className="ml-1 rounded bg-brand-500 px-1.5 py-0.5 text-[10px] text-white">
                    NEW
                  </span>
                )}
              </h4>
              <p className="text-xs text-navy-500">
                {m.email} {m.phone && `· ${m.phone}`}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => toggleRead(m)} className="btn-secondary text-xs">
                Mark {m.read ? "unread" : "read"}
              </button>
              <button
                onClick={() => remove(m._id)}
                className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
              >
                Delete
              </button>
            </div>
          </div>
          {m.subject && (
            <p className="mt-2 text-sm font-medium text-navy-800">{m.subject}</p>
          )}
          <p className="mt-1 whitespace-pre-wrap text-sm text-navy-600">
            {m.message}
          </p>
        </div>
      ))}
    </div>
  );
}
