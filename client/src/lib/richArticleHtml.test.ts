import { describe, expect, it } from "vitest";
import { hasRichMarkup, sanitizeArticleHtml } from "./richArticleHtml";

describe("rich article HTML", () => {
  it("keeps standard editorial markup", () => {
    const html = "<h2>عنوان</h2><p><strong>نص</strong></p><img src=\"https://cdn.example/image.jpg\">";
    expect(sanitizeArticleHtml(html)).toContain("<h2>عنوان</h2>");
    expect(hasRichMarkup(html)).toBe(true);
  });

  it("removes script content, event attributes, and javascript URLs", () => {
    const unsafe = '<p onclick="alert(1)">Text</p><script>alert(1)</script><a href="javascript:alert(1)">bad</a>';
    const safe = sanitizeArticleHtml(unsafe);
    expect(safe).not.toContain("script");
    expect(safe).not.toContain("onclick");
    expect(safe).not.toContain("javascript:");
  });
});
