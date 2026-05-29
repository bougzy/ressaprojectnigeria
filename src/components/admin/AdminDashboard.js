"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LogoImage from "@/components/LogoImage";
import ImagesManager from "./ImagesManager";
import VideosManager from "./VideosManager";
import SettingsManager from "./SettingsManager";
import MessagesManager from "./MessagesManager";

const TABS = [
  { key: "images", label: "Images & Gallery", icon: "🖼️" },
  { key: "videos", label: "Videos", icon: "🎬" },
  { key: "content", label: "Site Text & Settings", icon: "📝" },
  { key: "messages", label: "Messages", icon: "✉️" },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState("images");
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="flex flex-col border-b border-navy-100 bg-navy-900 text-white lg:w-64 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between p-4 lg:block">
          <div className="flex items-center gap-2.5">
            <LogoImage
              alt="Ressa"
              width={44}
              height={44}
              animate
              className="h-10 w-10 bg-white p-0.5"
            />
            <span className="text-sm font-extrabold text-white">
              RESSA Admin
            </span>
          </div>
          <button
            className="rounded-lg p-2 ring-1 ring-white/20 lg:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
          >
            ☰
          </button>
        </div>

        <nav className={`${menuOpen ? "block" : "hidden"} px-3 pb-4 lg:block`}>
          <p className="mb-2 mt-2 px-2 text-xs uppercase tracking-wide text-navy-300">
            Manage
          </p>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                setMenuOpen(false);
              }}
              className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                tab === t.key
                  ? "bg-brand-500 text-white"
                  : "text-navy-100 hover:bg-white/10"
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}

          <div className="mt-6 border-t border-white/10 pt-4">
            <a
              href="/"
              target="_blank"
              className="mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-navy-100 hover:bg-white/10"
            >
              🌐 View site
            </a>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-navy-100 hover:bg-white/10"
            >
              🚪 Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-4 md:p-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-navy-900">
            {TABS.find((t) => t.key === tab)?.label}
          </h1>
          <p className="text-sm text-navy-500">
            Changes are saved to your database and appear on the live site
            immediately.
          </p>
        </header>

        {tab === "images" && <ImagesManager />}
        {tab === "videos" && <VideosManager />}
        {tab === "content" && <SettingsManager />}
        {tab === "messages" && <MessagesManager />}
      </main>
    </div>
  );
}
