import { describe, expect, it, vi } from "vitest";
import { bindUploadedProjectImage, refreshProjectImageCaches } from "./projectUploadSync";

describe("project upload cache refresh", () => {
  it("binds the uploaded key to the selected project before refreshing both caches", async () => {
    const updateProject = vi.fn().mockResolvedValue({ id: 42, imageKey: "admin/project/uploaded.png" });
    const adminInvalidate = vi.fn().mockResolvedValue(undefined);
    const publicInvalidate = vi.fn().mockResolvedValue(undefined);

    await bindUploadedProjectImage({
      projectId: 42,
      imageKey: "admin/project/uploaded.png",
      updateProject,
      caches: { admin: { content: { invalidate: adminInvalidate } }, public: { invalidate: publicInvalidate } },
    });

    expect(updateProject).toHaveBeenCalledWith({ id: 42, data: { imageKey: "admin/project/uploaded.png" } });
    expect(adminInvalidate).toHaveBeenCalledOnce();
    expect(publicInvalidate).toHaveBeenCalledOnce();
  });

  it("invalidates admin and public content caches", async () => {
    const adminInvalidate = vi.fn().mockResolvedValue(undefined);
    const publicInvalidate = vi.fn().mockResolvedValue(undefined);

    await refreshProjectImageCaches({
      admin: { content: { invalidate: adminInvalidate } },
      public: { invalidate: publicInvalidate },
    });

    expect(adminInvalidate).toHaveBeenCalledOnce();
    expect(publicInvalidate).toHaveBeenCalledOnce();
  });
});
