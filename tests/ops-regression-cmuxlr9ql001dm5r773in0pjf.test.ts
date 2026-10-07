import { describe, expect, it } from "vitest";
import { previewText } from "../apps/web/lib/textPreview";

describe("previewText", () => {
  it("keeps emoji intact at the truncation boundary", () => {
    const prefix = "a".repeat(139);
    expect(previewText(`${prefix}😀b`, 140)).toBe(`${prefix}😀…`);
  });

  it("keeps ZWJ emoji and combining marks intact", () => {
    expect(previewText("ab👨‍👩‍👧‍👦c", 3)).toBe("ab👨‍👩‍👧‍👦…");
    expect(previewText("abe\u0301c", 3)).toBe("abe\u0301…");
  });

  it("does not add an ellipsis at exactly the grapheme limit", () => {
    const exact = `${"a".repeat(139)}😀`;
    expect(previewText(exact, 140)).toBe(exact);
    expect(previewText("中文😀", 3)).toBe("中文😀");
  });

  it("preserves Markdown cleanup, whitespace normalization, and truncation", () => {
    expect(previewText("## Title\n\n```ts\nignored\n```\n![alt](photo.png) [Read](https://example.com) 中文")).toBe("Title Read 中文");
    expect(previewText("Hello", 5)).toBe("Hello");
    expect(previewText("Hello!", 5)).toBe("Hello…");
    expect(previewText("abc de", 4)).toBe("abc…");
  });
});
