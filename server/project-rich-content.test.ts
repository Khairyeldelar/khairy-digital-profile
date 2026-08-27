import { describe, expect, it } from "vitest";
import { projectInput, publishedPostInput } from "./routers";

describe("rich project content input", () => {
  it("keeps a full Arabic editor body containing text, an image, and a link", () => {
    const body = '<h2>العنوان</h2><p>تفاصيل المقال كاملة</p><img src="/manus-storage/article/image.png"><p><a href="https://example.com">رابط مفيد</a></p>';
    const parsed = projectInput.parse({
      titleEn: "Battery guide",
      titleAr: "دليل البطارية",
      descriptionEn: "Summary",
      descriptionAr: "ملخص",
      articleBodyAr: body,
      articleBodyEn: "",
      typeEn: "Content",
      typeAr: "محتوى",
      category: "tutorials",
      href: "https://example.com",
    });

    expect(parsed.articleBodyAr).toBe(body);
  });

  it("does not allow a new published post with only a short card description", () => {
    const parsed = publishedPostInput.safeParse({
      titleEn: "Safety app",
      titleAr: "تطبيق آمن",
      descriptionEn: "Summary",
      descriptionAr: "ملخص",
      articleBodyAr: "",
      articleBodyEn: "",
      typeEn: "Post",
      typeAr: "مشاركة",
      category: "applications",
      href: "https://example.com",
    });

    expect(parsed.success).toBe(false);
  });
});
