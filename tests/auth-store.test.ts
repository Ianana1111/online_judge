import { beforeEach, describe, expect, it, vi } from "vitest";
const api = vi.hoisted(() => vi.fn());
vi.mock("@/lib/api", () => ({ apiFetch: api, setCsrfToken: vi.fn() }));
vi.mock("@/lib/queryClient", () => ({ queryClient: { cancelQueries: vi.fn().mockResolvedValue(undefined), clear: vi.fn() } }));
import { useAuthStore } from "../apps/web/store/auth";
const account = (id: string) => ({ id, handle: id, bio: "original" }) as any;
describe("asynchronous account state isolation", () => {
  beforeEach(() => { useAuthStore.getState().setUser(null); api.mockReset(); });
  it("ignores an old account's late profile response", () => {
    useAuthStore.getState().setUser(account("first")); useAuthStore.getState().setUser(account("second"));
    useAuthStore.getState().patchUser("first", { bio: "late" }); expect(useAuthStore.getState().user?.id).toBe("second"); expect(useAuthStore.getState().user?.bio).toBe("original");
  });
  it("merges completed field updates without restoring unrelated old values", () => {
    useAuthStore.getState().setUser(account("first")); useAuthStore.getState().patchUser("first", { bio: "new" }); useAuthStore.getState().patchUser("first", { handle: "renamed" });
    expect(useAuthStore.getState().user).toMatchObject({ bio: "new", handle: "renamed" });
  });
  it("does not let an older hydrate overwrite a newer identity", async () => {
    let finish!: (value: any) => void; api.mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    const loading = useAuthStore.getState().hydrate(); useAuthStore.getState().setUser(account("second")); finish({ ...account("first"), csrfToken: "old" }); await loading;
    expect(useAuthStore.getState().user?.id).toBe("second");
  });
  it("does not clear a new login when a previous logout finishes", async () => {
    let finish!: (value: any) => void; useAuthStore.getState().setUser(account("first")); api.mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    const logout = useAuthStore.getState().logout(); useAuthStore.getState().setUser(account("second")); finish({ ok: true }); await logout;
    expect(useAuthStore.getState().user?.id).toBe("second");
  });
});
