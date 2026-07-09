"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { User } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch("/auth/login", { method: "POST", body: { handle, password } });
      const user = await apiFetch<User>("/auth/me");
      setUser(user);
      router.push("/");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Log in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm py-12">
      <h1 className="mb-6 font-display text-2xl font-bold text-ink-50">Log in</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="handle" className="mb-1 block text-sm text-ink-300">
            Handle
          </label>
          <input id="handle" className="oj-input" value={handle} onChange={(e) => setHandle(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm text-ink-300">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="oj-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-verdict-wa">{error}</p>}
        <button type="submit" disabled={loading} className="oj-btn-primary w-full">
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="mt-4 text-sm text-ink-400">
        No account yet?{" "}
        <Link href="/register" className="text-brand hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
