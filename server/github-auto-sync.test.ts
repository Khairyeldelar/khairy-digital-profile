import { describe, expect, it, vi } from "vitest";
import { ENV } from "./_core/env";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  createProject: vi.fn(),
  createSocialLink: vi.fn(),
  deleteProject: vi.fn(),
  getAutoGithubSync: vi.fn(),
  getProjects: vi.fn(async () => []),
  getSiteProfile: vi.fn(async () => undefined),
  getSocialLinks: vi.fn(async () => []),
  setAutoGithubSync: vi.fn(),
  updateProject: vi.fn(),
  updateSocialLink: vi.fn(),
  upsertSiteProfile: vi.fn(),
}));
const syncGithubContent = vi.hoisted(() => vi.fn());

vi.mock("./db", () => dbMocks);
vi.mock("./githubSync", () => ({ syncGithubContent }));
vi.mock("./storage", () => ({
  storageGetSignedUrl: vi.fn(async () => null),
  storagePut: vi.fn(),
}));

import { appRouter } from "./routers";

type Owner = NonNullable<TrpcContext["user"]>;

function ownerContext(): TrpcContext {
  const owner: Owner = {
    id: 1,
    openId: ENV.ownerOpenId,
    name: "Khairy",
    email: null,
    loginMethod: "oauth",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user: owner,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("automatic GitHub sync after save", () => {
  it("persists the owner-controlled setting", async () => {
    dbMocks.setAutoGithubSync.mockResolvedValue(true);
    const result = await appRouter.createCaller(ownerContext()).admin.setAutoGithubSync({ enabled: true });
    expect(dbMocks.setAutoGithubSync).toHaveBeenCalledWith(true);
    expect(result).toBe(true);
  });

  it("does not sync after a successful content save when disabled", async () => {
    dbMocks.getAutoGithubSync.mockResolvedValue(false);
    dbMocks.updateProject.mockResolvedValue({ id: 6, titleEn: "Saved without sync" });

    const result = await appRouter.createCaller(ownerContext()).admin.updateProject({ id: 6, data: { titleEn: "Saved without sync" } });

    expect(result.id).toBe(6);
    expect(result.autoGithubSync).toBe(false);
    expect(syncGithubContent).not.toHaveBeenCalled();
  });

  it("saves an administrator-selected default cover with the site profile", async () => {
    dbMocks.getAutoGithubSync.mockResolvedValue(false);
    dbMocks.upsertSiteProfile.mockResolvedValue({ id: 1, defaultCoverKey: "admin/owner/defaultCover/editorial.png" });

    const result = await appRouter.createCaller(ownerContext()).admin.updateProfile({
      name: "Khairy Eid Aly",
      roleEn: "Developer",
      roleAr: "مطور",
      bioEn: "Short bio",
      bioAr: "نبذة",
      locationEn: "Egypt",
      locationAr: "مصر",
      defaultCoverKey: "admin/owner/defaultCover/editorial.png",
    });

    expect(dbMocks.upsertSiteProfile).toHaveBeenCalledWith(expect.objectContaining({ defaultCoverKey: "admin/owner/defaultCover/editorial.png" }));
    expect(result.autoGithubSync).toBe(false);
  });

  it("syncs once after a successful content save when enabled", async () => {
    dbMocks.getAutoGithubSync.mockResolvedValue(true);
    dbMocks.updateProject.mockResolvedValue({ id: 7, titleEn: "Updated" });
    syncGithubContent.mockResolvedValue({ repository: "Khairyeldelar/khairy-digital-profile", path: "content-sync/site-content.json", commitUrl: "https://github.com/example/commit/1" });

    const result = await appRouter.createCaller(ownerContext()).admin.updateProject({ id: 7, data: { titleEn: "Updated" } });

    expect(result.id).toBe(7);
    expect(result.autoGithubSync).toBe(true);
    expect(result.githubSync?.path).toBe("content-sync/site-content.json");
    expect(syncGithubContent).toHaveBeenCalledTimes(1);
  });

  it("keeps the saved content successful when automatic GitHub sync fails", async () => {
    dbMocks.getAutoGithubSync.mockResolvedValue(true);
    dbMocks.updateProject.mockResolvedValue({ id: 8, titleEn: "Saved despite sync error" });
    syncGithubContent.mockRejectedValue(new Error("GitHub unavailable"));

    const result = await appRouter.createCaller(ownerContext()).admin.updateProject({ id: 8, data: { titleEn: "Saved despite sync error" } });

    expect(result.id).toBe(8);
    expect(result.githubSync).toBeNull();
    expect(result.githubSyncError).toContain("GitHub synchronization failed");
  });
});
