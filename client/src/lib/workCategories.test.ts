import { describe, expect, it } from "vitest";
import { filterProjectsByCategory, workCategories } from "./workCategories";

describe("work categories", () => {
  it("exposes the three bilingual categories and filters projects", () => {
    expect(workCategories.map((category) => category.id)).toEqual(["applications", "tutorials", "videos"]);
    expect(workCategories.map((category) => category.labelAr)).toEqual(["تطبيقاتي", "شروحاتي", "فيديوهاتي"]);

    const projects = [
      { title: "App", category: "applications" as const },
      { title: "Guide", category: "tutorials" as const },
      { title: "Video", category: "videos" as const },
    ];
    expect(filterProjectsByCategory(projects, "tutorials")).toEqual([{ title: "Guide", category: "tutorials" }]);
  });
});
