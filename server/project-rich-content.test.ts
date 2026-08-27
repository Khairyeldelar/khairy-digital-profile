import { describe, expect, it } from "vitest";
import { projectInput } from "./routers";

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
});
