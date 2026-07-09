import { create } from "zustand";

interface ExamTimerState {
  contestId: string | null;
  endsAt: number | null; // epoch ms, authoritative from server
  active: boolean; // true while an ExamModeShell is mounted — NavBar hides itself
  setWindow: (contestId: string, endsAtIso: string) => void;
  setActive: (active: boolean) => void;
  clear: () => void;
  remainingMs: (now?: number) => number;
}

export const useExamTimerStore = create<ExamTimerState>((set, get) => ({
  contestId: null,
  endsAt: null,
  active: false,
  setWindow: (contestId, endsAtIso) => set({ contestId, endsAt: new Date(endsAtIso).getTime() }),
  setActive: (active) => set({ active }),
  clear: () => set({ contestId: null, endsAt: null, active: false }),
  remainingMs: (now = Date.now()) => {
    const { endsAt } = get();
    if (!endsAt) return 0;
    return Math.max(0, endsAt - now);
  },
}));

export function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}
