import { create } from "zustand";
import type { User } from "@/lib/types";
import { apiFetch, setCsrfToken } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";

let authRevision = 0;
function clearPrivateCache() {
  void queryClient.cancelQueries();
  queryClient.clear();
}

interface AuthState {
  user: User | null;
  status: "idle" | "loading" | "ready";
  hydrate: () => Promise<void>;
  setUser: (user: User | null) => void;
  patchUser: (expectedId: string, patch: Partial<Omit<User, "id">>) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: "idle",
  hydrate: async () => {
    const revision = ++authRevision;
    set({ status: "loading" });
    try {
      const { csrfToken, ...user } = await apiFetch<User & { csrfToken: string }>("/auth/me");
      if (revision !== authRevision) return;
      if (get().user?.id !== user.id) clearPrivateCache();
      setCsrfToken(csrfToken);
      set({ user, status: "ready" });
    } catch {
      if (revision !== authRevision) return;
      clearPrivateCache();
      setCsrfToken(null);
      set({ user: null, status: "ready" });
    }
  },
  setUser: (user) => {
    authRevision += 1;
    if (get().user?.id !== user?.id) clearPrivateCache();
    set({ user, status: "ready" });
  },
  patchUser: (expectedId, patch) => {
    const current = get().user;
    if (!current || current.id !== expectedId) return;
    authRevision += 1;
    set({ user: { ...current, ...patch, id: current.id }, status: "ready" });
  },
  logout: async () => {
    const revision = ++authRevision;
    clearPrivateCache();
    await apiFetch("/auth/logout", { method: "POST" });
    if (revision !== authRevision) return;
    clearPrivateCache();
    setCsrfToken(null);
    set({ user: null });
  },
}));
