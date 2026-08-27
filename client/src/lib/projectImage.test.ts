import { describe, expect, it } from "vitest";
import { publicAssetPath, resolveProjectImage, rewriteStaticArticleImageUrls } from "./projectImage";

describe("resolveProjectImage", () => {
  it("prefers the signed URL returned by the server", () => {
    expect(resolveProjectImage("admin/project/image.png", "https://cdn.example/image.png")).toBe("https://cdn.example/image.png");
  });

  it("keeps a storage-key fallback for legacy content in the full-stack root build", () => {
    expect(resolveProjectImage("admin/project/image.png", null, "/")).toBe("/manus-storage/admin/project/image.png");
    expect(resolveProjectImage("/manus-storage/legacy.png", null, "/")).toBe("/manus-storage/legacy.png");
    expect(resolveProjectImage("admin/project/image.png", null, "/khairy-digital-profile/")).toBe("");
    expect(resolveProjectImage(null, null, "/")).toBe("");
  });

  it("prefixes local assets with the GitHub Pages base path", () => {
    expect(publicAssetPath("assets/khairy-profile-cover.webp", "/khairy-digital-profile/")).toBe("/khairy-digital-profile/assets/khairy-profile-cover.webp");
    expect(publicAssetPath("/assets/khairy-mark.svg", "/")).toBe("/assets/khairy-mark.svg");
  });

  it("resolves snapshot assets and rich article images under the GitHub Pages base", () => {
    expect(resolveProjectImage(null, "content-sync/assets/card.webp", "/khairy-digital-profile/")).toBe("/khairy-digital-profile/content-sync/assets/card.webp");
    expect(rewriteStaticArticleImageUrls('<p><img src="content-sync/assets/inline.webp" /></p>', "/khairy-digital-profile/")).toContain('src="/khairy-digital-profile/content-sync/assets/inline.webp"');
  });
});
