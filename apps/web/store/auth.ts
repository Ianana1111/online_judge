import { create } from "zustand";
import type { User } from "@/lib/types";
import { apiFetch } from "@/lib/api";

interface AuthState {
  user: User | null;
  status: "idle" | "loading" | "ready";
  hydrate: () => Promise<void>;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "idle",
  hydrate: async () => {
    set({ status: "loading" });
    try {
      const user = await apiFetch<User>("/auth/me");
      set({ user, status: "ready" });
    } catch {
      set({ user: null, status: "ready" });
    }
  },
  setUser: (user) => set({ user }),
  logout: async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } finally {
      set({ user: null });
    }
  },
}));
