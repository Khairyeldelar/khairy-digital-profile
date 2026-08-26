import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { ENV } from "./_core/env";
import type { TrpcContext } from "./_core/context";

function contextFor(user: TrpcContext["user"]): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const owner = {
  id: 1,
  openId: ENV.ownerOpenId,
  name: "Khairy Eid Aly",
  email: "khairy.eldelar5@gmail.com",
  loginMethod: "manus",
  role: "admin" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

describe("admin content access", () => {
  it("exposes the owner signal only for the designated identity", async () => {
    expect(await appRouter.createCaller(contextFor(owner)).ownerCheck()).toBe(true);
    expect(await appRouter.createCaller(contextFor({ ...owner, openId: "different-admin" })).ownerCheck()).toBe(false);
  });

  it("rejects unauthenticated access", async () => {
    const caller = appRouter.createCaller(contextFor(null));
    await expect(caller.admin.content()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects an admin with a different identity", async () => {
    const caller = appRouter.createCaller(contextFor({ ...owner, openId: "different-admin" }));
    await expect(caller.admin.content()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("allows the designated owner to read the control-room content", async () => {
    const caller = appRouter.createCaller(contextFor(owner));
    const result = await caller.admin.content();
    expect(result.projects).toBeInstanceOf(Array);
    expect(result.socialLinks).toBeInstanceOf(Array);
  });

  it("allows public content loading without authentication", async () => {
    const caller = appRouter.createCaller(contextFor(null));
    const result = await caller.content();
    expect(result.projects).toBeInstanceOf(Array);
    expect(result.socialLinks).toBeInstanceOf(Array);
  });

  it("allows the designated owner to update an existing social link", async () => {
    const caller = appRouter.createCaller(contextFor(owner));
    const content = await caller.admin.content();
    const email = content.socialLinks.find((link) => link.platform === "Email");
    expect(email).toBeDefined();
    if (!email) return;
    const updated = await caller.admin.updateSocialLink({
      id: email.id,
      data: {
        handleEn: email.handleEn,
        handleAr: email.handleAr,
        href: email.href,
        sortOrder: email.sortOrder,
        isPublished: email.isPublished,
      },
    });
    expect(updated?.id).toBe(email.id);
  });

  it("rejects invalid mutation input before touching the database", async () => {
    const caller = appRouter.createCaller(contextFor(owner));
    await expect(caller.admin.createProject({
      titleEn: "x",
      titleAr: "x",
      descriptionEn: "x",
      descriptionAr: "x",
      typeEn: "x",
      typeAr: "x",
      href: "not-a-url",
      sortOrder: 0,
      isPublished: true,
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
