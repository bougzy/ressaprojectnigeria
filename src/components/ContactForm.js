"use client";
import { useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState(null); // null | "sending" | "ok" | "err"

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    const data = Object.fromEntries(new FormData(e.target).entries());
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setStatus("ok");
      e.target.reset();
    } catch {
      setStatus("err");
    }
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Full name *</label>
          <input name="name" required className="input" placeholder="Your name" />
        </div>
        <div>
          <label className="label">Phone</label>
          <input name="phone" className="input" placeholder="080..." />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            name="email"
            className="input"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="label">Subject</label>
          <input name="subject" className="input" placeholder="Land enquiry" />
        </div>
      </div>
      <div>
        <label className="label">Message *</label>
        <textarea
          name="message"
          required
          rows={5}
          className="input"
          placeholder="Tell us how we can help…"
        />
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="btn-primary w-full disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send message"}
      </button>

      {status === "ok" && (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          ✓ Thank you! Your message has been received — we’ll be in touch shortly.
        </p>
      )}
      {status === "err" && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Something went wrong. Please call us directly or try again.
        </p>
      )}
    </form>
  );
}
