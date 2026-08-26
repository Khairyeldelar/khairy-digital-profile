type Invalidate = () => Promise<unknown>;
type UpdateProject = (input: { id: number; data: { imageKey: string } }) => Promise<unknown>;

export async function refreshProjectImageCaches(caches: {
  admin: { content: { invalidate: Invalidate } };
  public: { invalidate: Invalidate };
}) {
  await Promise.all([
    caches.admin.content.invalidate(),
    caches.public.invalidate(),
  ]);
}

export async function bindUploadedProjectImage(input: {
  projectId: number;
  imageKey: string;
  updateProject: UpdateProject;
  caches: {
    admin: { content: { invalidate: Invalidate } };
    public: { invalidate: Invalidate };
  };
}) {
  await input.updateProject({ id: input.projectId, data: { imageKey: input.imageKey } });
  await refreshProjectImageCaches(input.caches);
}
