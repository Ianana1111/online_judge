import { afterEach, expect, it, vi } from "vitest";
import { getQueryClient, queryClient } from "../apps/web/lib/queryClient";

afterEach(() => { vi.unstubAllGlobals(); queryClient.clear(); });

it("does not reuse another server render's data for the same query key", () => {
  const first = getQueryClient();
  first.setQueryData(["collections"], [{ title: "Previous response" }]);
  const second = getQueryClient();
  expect(second.getQueryData(["collections"])).toBeUndefined();
  second.setQueryData(["collections"], [{ title: "Current response" }]);
  expect(first.getQueryData(["collections"])).toEqual([{ title: "Previous response" }]);
  first.clear(); second.clear();
});

it("keeps the browser cache shared with logout and account-switch invalidation", () => {
  vi.stubGlobal("window", {});
  const rendered = getQueryClient();
  rendered.setQueryData(["private", "account"], { id: "previous" });
  expect(getQueryClient()).toBe(rendered);
  queryClient.clear();
  expect(rendered.getQueryData(["private", "account"])).toBeUndefined();
});
