import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const reducedMotion of [false, true]) test(`archive previews push later rows down and collapse in flow (${reducedMotion ? "reduced" : "normal"} motion)`, async ({ page, isMobile }, info) => {
  await page.emulateMedia({ reducedMotion: reducedMotion ? "reduce" : "no-preference" });
  const preview = Array.from({ length: 7 }, (_, i) => ({ label: String.fromCharCode(65 + i), title: i === 0 ? "The 3n + 1 problem" : `Very long sample problem title ${i + 1} for responsive wrapping`, uvaId: 100 + i }));
  const exams = ["2026-05-26", "2026-03-24", "2025-12-16"].map((date, i) => ({ id: `preview-${i}`, slug: `cpe-${date}`, title: `CPE ${date}`, kind: "CPE", durationMin: 180, startAt: null, isPublic: true, problemPreview: preview }));
  exams.push({ ...exams[0], id: "preview-gpe", slug: "gpe-2026-06-01", title: "GPE 2026-06-01", kind: "GPE" });
  const requests: string[] = [];
  await page.route("http://127.0.0.1:55440/**", (route) => {
    const path = new URL(route.request().url()).pathname; requests.push(path);
    if (path.startsWith("/auth/")) return route.fulfill({ status: 401, json: {} });
    return route.fulfill({ json: path === "/contests" ? exams : {} });
  });
  await page.goto("/contests");
  const first = page.getByRole("article", { name: exams[0].title, exact: true });
  const second = page.getByRole("article", { name: exams[1].title, exact: true });
  const trigger = first.getByRole("button", { name: /^預覽/ });
  const region = first.locator("[aria-hidden]").filter({ has: page.getByRole("list", { includeHidden: true }) });
  await first.scrollIntoViewIfNeeded();
  const initialY = (await second.boundingBox())!.y;
  if (isMobile) await trigger.tap(); else await first.hover();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  const list = first.getByRole("list"); await expect(list.getByRole("listitem")).toHaveCount(7);
  await expect(list.getByText("The 3n + 1 problem")).toBeVisible();
  expect(await list.locator("a,button,[role=button]").count()).toBe(0);
  await expect.poll(async () => (await second.boundingBox())!.y).toBeGreaterThan(initialY + 40);
  await expect.poll(async () => {
    const outer = (await region.boundingBox())!, last = (await list.getByRole("listitem").last().boundingBox())!;
    return outer.y + outer.height - last.y - last.height;
  }).toBeGreaterThanOrEqual(0);
  if (!reducedMotion) expect(await region.evaluate((el) => getComputedStyle(el).transitionDuration)).not.toBe("0s");
  await page.screenshot({ path: info.outputPath("archive-preview.png"), fullPage: true, animations: "disabled" });
  if (isMobile) await trigger.tap(); else await page.mouse.move(1, 1);
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect.poll(async () => Math.abs((await second.boundingBox())!.y - initialY)).toBeLessThan(2);
  // Keyboard users can preview without following the exam link, and dismiss with Escape.
  await trigger.focus(); await page.keyboard.press("Enter");
  if (await trigger.getAttribute("aria-expanded") === "false") await page.keyboard.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape"); await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await page.getByRole("button", { name: "GPE (1)" }).click();
  await page.getByRole("button", { name: "GPE (1)" }).evaluate(async (element) => { await Promise.all(element.getAnimations().map((animation) => animation.finished)); });
  const gpe = page.getByRole("article", { name: "GPE 2026-06-01", exact: true });
  await expect(gpe).toBeVisible();
  await expect(page.getByRole("article", { name: exams[0].title, exact: true })).toHaveCount(0);
  expect(requests.filter((path) => path.startsWith("/contests/") || path.startsWith("/problems/"))).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const audit = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze(); expect(audit.violations).toEqual([]);
});
