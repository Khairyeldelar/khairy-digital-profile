import { describe, expect, it } from "vitest";
import { resolveProjectImage } from "./projectImage";

describe("resolveProjectImage", () => {
  it("prefers the signed URL returned by the server", () => {
    expect(resolveProjectImage("admin/project/image.png", "https://cdn.example/image.png")).toBe("https://cdn.example/image.png");
  });

  it("keeps a storage-key fallback for legacy content", () => {
    expect(resolveProjectImage("admin/project/image.png")).toBe("/manus-storage/admin/project/image.png");
    expect(resolveProjectImage("/manus-storage/legacy.png")).toBe("/manus-storage/legacy.png");
    expect(resolveProjectImage(null)).toBe("");
  });
});
