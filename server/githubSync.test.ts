import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  getSiteProfile: vi.fn(),
  getProjects: vi.fn(),
  getSocialLinks: vi.fn(),
  getProjectMedia: vi.fn(),
  getArticleComments: vi.fn(),
  getAutoGithubSync: vi.fn(),
}));

vi.mock("./db", () => dbMocks);

import { buildContentSnapshot, syncGithubContent } from "./githubSync";

describe("GitHub content sync", () => {
  const originalToken = process.env.GITHUB_TOKEN;
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.GITHUB_TOKEN = "test-token";
    dbMocks.getAutoGithubSync.mockResolvedValue(false);
    dbMocks.getSiteProfile.mockResolvedValue({
      name: "Khairy Eid Aly",
      roleEn: "Developer",
      roleAr: "مطور",
      bioEn: "A short bio",
      bioAr: "نبذة قصيرة",
      locationEn: "Egypt",
      locationAr: "مصر",
      portraitKey: "private/portrait.png",
      coverKey: "private/cover.png",
    });
    dbMocks.getProjects.mockResolvedValue([{
      id: 7,
      titleEn: "Atlas Flow",
      titleAr: "أطلس فلو",
      descriptionEn: "A product",
      descriptionAr: "منتج",
      articleBodyEn: "Full tutorial",
      articleBodyAr: "شرح كامل",
      typeEn: "App",
      typeAr: "تطبيق",
      category: "applications",
      href: "https://example.com",
      imageKey: "private/project.png",
      sortOrder: 0,
      isPublished: true,
    }]);
    dbMocks.getSocialLinks.mockResolvedValue([]);
    dbMocks.getProjectMedia.mockResolvedValue([]);
    dbMocks.getArticleComments.mockResolvedValue([]);
  });

  afterEach(() => {
    process.env.GITHUB_TOKEN = originalToken;
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("creates a content commit and omits private storage keys", async () => {
    const snapshot = buildContentSnapshot(
      await dbMocks.getSiteProfile(),
      await dbMocks.getProjects(false),
      await dbMocks.getSocialLinks(false),
    );
    expect(snapshot).not.toContain("private/project.png");
    expect(snapshot).not.toContain("portraitKey");
    expect(snapshot).toContain("Full tutorial");

    global.fetch = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ commit: { html_url: "https://github.com/Khairyeldelar/khairy-digital-profile/commit/abc" } }), { status: 201 }));

    const result = await syncGithubContent();

    expect(result.repository).toBe("Khairyeldelar/khairy-digital-profile");
    expect(result.path).toBe("content-sync/site-content.json");
    expect(global.fetch).toHaveBeenCalledTimes(2);
    const putRequest = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[1][1];
    expect(putRequest.method).toBe("PUT");
    expect(String(putRequest.body)).toContain("Sync site content from admin dashboard");
  });

  it("includes article media and comments in the published content snapshot", async () => {
    const snapshot = buildContentSnapshot(
      await dbMocks.getSiteProfile(),
      [{ ...(await dbMocks.getProjects(false))[0], media: [{ id: 3, kind: "youtube", source: "https://youtu.be/example", placement: "middle", captionEn: "Demo", captionAr: "عرض", sortOrder: 0 }], comments: [{ id: 9, authorName: "Mona", body: "Helpful guide", createdAt: new Date() }] }],
      await dbMocks.getSocialLinks(false),
    );

    expect(snapshot).toContain("https://youtu.be/example");
    expect(snapshot).toContain("Helpful guide");
    expect(snapshot).not.toContain("portraitKey");
  });

  it("fails clearly when the server token is missing", async () => {
    delete process.env.GITHUB_TOKEN;
    await expect(syncGithubContent()).rejects.toThrow("GitHub sync is not configured");
  });
});
