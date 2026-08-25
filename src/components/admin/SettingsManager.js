"use client";
import { useEffect, useState } from "react";

// Scalar text fields grouped for a friendly editing experience.
const TEXT_GROUPS = [
  {
    group: "Brand",
    fields: [
      ["siteName", "Site name", "text"],
      ["legalName", "Legal / company name", "text"],
      ["tagline", "Tagline", "text"],
      ["logo", "Logo path (pick from Images & Gallery, then paste its path here)", "text"],
    ],
  },
  {
    group: "About page",
    fields: [
      ["aboutHeading", "About heading", "text"],
      ["aboutBody", "About body", "textarea"],
      ["missionHeading", "Mission heading", "text"],
      ["missionBody", "Mission body", "textarea"],
      ["visionHeading", "Vision heading", "text"],
      ["visionBody", "Vision body", "textarea"],
    ],
  },
  {
    group: "Contact page",
    fields: [
      ["contactHeading", "Contact heading", "text"],
      ["contactIntro", "Contact intro", "textarea"],
      ["email", "Email", "text"],
      ["whatsapp", "WhatsApp number (e.g. 2347...)", "text"],
      ["mapEmbed", "Google Maps embed URL", "text"],
    ],
  },
  {
    group: "SEO",
    fields: [
      ["seoTitle", "SEO title", "text"],
      ["seoDescription", "SEO meta description", "textarea"],
      ["seoKeywords", "SEO keywords (comma-separated)", "textarea"],
      ["canonicalUrl", "Canonical site URL (e.g. https://yourdomain.com)", "text"],
    ],
  },
];

// Complex (array/object) fields edited as JSON.
const JSON_FIELDS = [
  ["offices", "Offices — [{label,address}]"],
  ["phones", "Phone numbers — [\"...\"]"],
  ["socials", "Socials — {facebook,instagram,twitter,pinterest}"],
];

export default function SettingsManager() {
  const [s, setS] = useState(null);
  const [jsonText, setJsonText] = useState({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      setS(data);
      const jt = {};
      JSON_FIELDS.forEach(([k]) => {
        jt[k] = JSON.stringify(data[k] ?? (k === "socials" ? {} : []), null, 2);
      });
      setJsonText(jt);
    })();
  }, []);

  if (!s) return <p className="text-navy-400">Loading…</p>;

  function setField(k, v) {
    setS((prev) => ({ ...prev, [k]: v }));
  }

  async function save() {
    setBusy(true);
    setMsg("");
    const settings = { ...s };
    // parse JSON fields
    for (const [k] of JSON_FIELDS) {
      try {
        settings[k] = JSON.parse(jsonText[k]);
      } catch {
        setBusy(false);
        setMsg(`⚠️ Invalid JSON in "${k}". Please fix and try again.`);
        return;
      }
    }
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings }),
    });
    setBusy(false);
    setMsg(res.ok ? "✓ Saved! Refresh the site to see changes." : "Save failed");
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div className="rounded-xl bg-brand-50 p-4 text-sm text-brand-800 ring-1 ring-brand-100">
        Looking for the hero, stats, services, or call-to-action banner?
        Those are now managed as add/remove-able blocks under the{" "}
        <strong>Sections</strong> tab. This tab covers site-wide brand
        details, the About &amp; Contact pages, and SEO.
      </div>

      {TEXT_GROUPS.map((g) => (
        <section key={g.group} className="card">
          <h3 className="mb-4 font-bold text-navy-900">{g.group}</h3>
          <div className="space-y-3">
            {g.fields.map(([key, label, type]) => (
              <div key={key}>
                <label className="label">{label}</label>
                {type === "textarea" ? (
                  <textarea
                    className="input"
                    rows={3}
                    value={s[key] ?? ""}
                    onChange={(e) => setField(key, e.target.value)}
                  />
                ) : (
                  <input
                    className="input"
                    value={s[key] ?? ""}
                    onChange={(e) => setField(key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="card">
        <h3 className="mb-1 font-bold text-navy-900">
          Lists &amp; structured content
        </h3>
        <p className="mb-4 text-xs text-navy-400">
          Edit as JSON. Keep the structure shown — only change the values.
        </p>
        <div className="space-y-4">
          {JSON_FIELDS.map(([key, label]) => (
            <div key={key}>
              <label className="label">{label}</label>
              <textarea
                className="input font-mono text-xs"
                rows={5}
                value={jsonText[key] ?? ""}
                onChange={(e) =>
                  setJsonText((p) => ({ ...p, [key]: e.target.value }))
                }
              />
            </div>
          ))}
        </div>
      </section>

      <div className="sticky bottom-4 flex items-center gap-3 rounded-xl bg-white p-3 shadow-lg ring-1 ring-navy-100">
        <button onClick={save} disabled={busy} className="btn-primary">
          {busy ? "Saving…" : "Save all settings"}
        </button>
        {msg && <span className="text-sm text-navy-700">{msg}</span>}
      </div>
    </div>
  );
}
