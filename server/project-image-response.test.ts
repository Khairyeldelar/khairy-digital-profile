import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const getProjects = vi.hoisted(() => vi.fn(async () => [{
  id: 7,
  titleEn: "Uploaded Project",
  titleAr: "مشروع مرفوع",
  descriptionEn: "Description",
  descriptionAr: "وصف",
  typeEn: "Project",
  typeAr: "مشروع",
  href: "https://example.com",
  imageKey: "admin/project/uploaded.png",
  sortOrder: 0,
  isPublished: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}]));
const storageGetSignedUrl = vi.hoisted(() => vi.fn(async (key: string) => `https://cdn.example/${key}`));

vi.mock("./db", () => ({
  getProjects,
  getSiteProfile: vi.fn(async () => undefined),
  getSocialLinks: vi.fn(async () => []),
}));
vi.mock("./storage", () => ({
  storageGetSignedUrl,
  storagePut: vi.fn(),
}));

const context: TrpcContext = {
  user: null,
  req: { protocol: "https", headers: {} } as TrpcContext["req"],
  res: {} as TrpcContext["res"],
};

describe("project image response", () => {
  it("adds the signed image URL to public project content", async () => {
    const result = await appRouter.createCaller(context).content();
    expect(result.projects[0]?.imageUrl).toBe("https://cdn.example/admin/project/uploaded.png");
    expect(storageGetSignedUrl).toHaveBeenCalledWith("admin/project/uploaded.png");
  });
});
