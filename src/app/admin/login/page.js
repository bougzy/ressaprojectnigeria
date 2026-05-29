"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LogoImage from "@/components/LogoImage";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const data = Object.fromEntries(new FormData(e.target).entries());
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setLoading(false);
    if (res.ok) {
      router.push(params.get("from") || "/admin");
      router.refresh();
    } else {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "Login failed");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center">
          <LogoImage
            alt="Ressa"
            width={88}
            height={88}
            animate
            priority
            className="h-20 w-20"
          />
          <h1 className="mt-4 text-xl font-bold text-navy-900">
            Admin Dashboard
          </h1>
          <p className="text-sm text-navy-500">Sign in to manage your site</p>
        </div>

        <form onSubmit={onSubmit} className="card space-y-4">
          <div>
            <label className="label">Username</label>
            <input name="username" required className="input" autoFocus />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" name="password" required className="input" />
          </div>
          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-navy-400">
          Default login: <b>admin</b> / <b>Ressa@2024</b> (change in .env.local)
        </p>
      </div>
    </div>
  );
}
