"use client";
import { useEffect, useState } from "react";

const FONT_OPTIONS = [
  "Inter",
  "Poppins",
  "Montserrat",
  "Lato",
  "Raleway",
  "Playfair Display",
  "Merriweather",
  "Nunito",
  "Work Sans",
  "DM Sans",
];

const RADIUS_OPTIONS = [
  { id: "sharp", label: "Sharp (minimal rounding)" },
  { id: "rounded", label: "Rounded (default)" },
  { id: "soft", label: "Extra soft / pill" },
];

const PRESETS = [
  { name: "Ressa Orange & Navy", primary: "#fc5a13", secondary: "#0f2347" },
  { name: "Emerald & Charcoal", primary: "#059669", secondary: "#1f2937" },
  { name: "Royal Blue & Slate", primary: "#2563eb", secondary: "#0f172a" },
  { name: "Gold & Deep Green", primary: "#d4a017", secondary: "#0b3d2e" },
  { name: "Crimson & Ink", primary: "#dc2626", secondary: "#111827" },
  { name: "Teal & Plum", primary: "#0d9488", secondary: "#3b0764" },
];

export default function ThemeManager() {
  const [theme, setTheme] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      setTheme(
        data.theme || {
          primary: "#fc5a13",
          secondary: "#0f2347",
          fontHeading: "Inter",
          fontBody: "Inter",
          radius: "rounded",
        }
      );
    })();
  }, []);

  if (!theme) return <p className="text-navy-400">Loading…</p>;

  function set(k, v) {
    setTheme((t) => ({ ...t, [k]: v }));
  }

  async function save() {
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "theme", value: theme }),
    });
    setBusy(false);
    setMsg(
      res.ok
        ? "✓ Theme saved! Reload the site to see it everywhere."
        : "Save failed"
    );
  }

  return (
    <div className="max-w-3xl space-y-8">
      <section className="card">
        <h3 className="mb-1 font-bold text-navy-900">Quick presets</h3>
        <p className="mb-4 text-xs text-navy-400">
          One click sets both brand colours. Fine-tune below if needed.
        </p>
        <div className="flex flex-wrap gap-3">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => setTheme((t) => ({ ...t, primary: p.primary, secondary: p.secondary }))}
              className="flex items-center gap-2 rounded-lg border border-navy-200 px-3 py-2 text-xs font-medium hover:border-brand-400"
              type="button"
            >
              <span className="flex h-4 w-4 rounded-full" style={{ background: p.primary }} />
              <span className="flex h-4 w-4 rounded-full" style={{ background: p.secondary }} />
              {p.name}
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <h3 className="mb-4 font-bold text-navy-900">Brand colours</h3>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="label">Primary colour (buttons, accents)</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={theme.primary}
                onChange={(e) => set("primary", e.target.value)}
                className="h-11 w-14 cursor-pointer rounded border border-navy-200"
              />
              <input
                className="input"
                value={theme.primary}
                onChange={(e) => set("primary", e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="label">Secondary colour (headers, dark sections)</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={theme.secondary}
                onChange={(e) => set("secondary", e.target.value)}
                className="h-11 w-14 cursor-pointer rounded border border-navy-200"
              />
              <input
                className="input"
                value={theme.secondary}
                onChange={(e) => set("secondary", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* live shade preview */}
        <div className="mt-6 grid grid-cols-10 gap-1 overflow-hidden rounded-lg">
          {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((s) => (
            <div
              key={s}
              className="h-8"
              style={{ background: `color-mix(in srgb, ${theme.primary} ${100 - Math.abs(500 - s) / 9}%, ${s < 500 ? "white" : "black"})` }}
              title={`brand-${s}`}
            />
          ))}
        </div>
        <p className="mt-1 text-xs text-navy-400">Approximate preview — the real shade scale is generated on save.</p>
      </section>

      <section className="card">
        <h3 className="mb-4 font-bold text-navy-900">Fonts</h3>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="label">Heading font</label>
            <select
              className="input"
              value={theme.fontHeading}
              onChange={(e) => set("fontHeading", e.target.value)}
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <p className="mt-2 text-2xl font-bold" style={{ fontFamily: `'${theme.fontHeading}', sans-serif` }}>
              Own Land. Build Wealth.
            </p>
          </div>
          <div>
            <label className="label">Body font</label>
            <select
              className="input"
              value={theme.fontBody}
              onChange={(e) => set("fontBody", e.target.value)}
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <p className="mt-2 text-sm text-navy-600" style={{ fontFamily: `'${theme.fontBody}', sans-serif` }}>
              Ressa Project Nigeria helps everyday Nigerians own genuine, documented land.
            </p>
          </div>
        </div>
      </section>

      <section className="card">
        <h3 className="mb-4 font-bold text-navy-900">Shape</h3>
        <div className="flex flex-wrap gap-3">
          {RADIUS_OPTIONS.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => set("radius", r.id)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                theme.radius === r.id
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-navy-200 text-navy-600 hover:border-navy-300"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </section>

      <div className="sticky bottom-4 flex items-center gap-3 rounded-xl bg-white p-3 shadow-lg ring-1 ring-navy-100">
        <button onClick={save} disabled={busy} className="btn-primary">
          {busy ? "Saving…" : "Save theme"}
        </button>
        {msg && <span className="text-sm text-navy-700">{msg}</span>}
      </div>
    </div>
  );
}
