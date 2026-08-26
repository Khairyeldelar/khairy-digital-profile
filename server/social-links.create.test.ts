import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import { ENV } from "./_core/env";
import type { TrpcContext } from "./_core/context";

const createSocialLink = vi.hoisted(() => vi.fn(async (input: Record<string, unknown>) => ({ id: 44, ...input })));
vi.mock("./db", () => ({
  createSocialLink,
  createProject: vi.fn(),
  deleteProject: vi.fn(),
  getProjects: vi.fn(async () => []),
  getSiteProfile: vi.fn(async () => undefined),
  getSocialLinks: vi.fn(async () => []),
  updateProject: vi.fn(),
  updateSocialLink: vi.fn(),
  upsertSiteProfile: vi.fn(),
}));

function ownerContext(): TrpcContext {
  return {
    user: { id: 1, openId: ENV.ownerOpenId, name: "Khairy", email: null, loginMethod: "oauth", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("custom social-link creation", () => {
  it("allows the designated owner to create a bilingual custom link", async () => {
    const result = await appRouter.createCaller(ownerContext()).admin.createSocialLink({
      platformEn: "Behance",
      platformAr: "بيهانس",
      handleEn: "Selected work",
      handleAr: "أعمال مختارة",
      href: "https://behance.net/khairy",
      sortOrder: 4,
      isPublished: true,
    });

    expect(createSocialLink).toHaveBeenCalledWith(expect.objectContaining({
      platformEn: "Behance",
      platformAr: "بيهانس",
      sortOrder: 4,
      isPublished: true,
    }));
    expect(result?.id).toBe(44);
  });
});
