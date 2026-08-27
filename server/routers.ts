import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import {
  createProject,
  createProjectMedia,
  createSocialLink,
  createArticleComment,
  deleteProject,
  deleteProjectMedia,
  deleteSocialLink,
  getArticleComments,
  getProjectMedia,
  getProjects,
  getSiteProfile,
  getSocialLinks,
  getAutoGithubSync,
  setAutoGithubSync,
  updateProject,
  updateSocialLink,
  upsertSiteProfile,
} from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { storageGetSignedUrl, storagePut } from "./storage";
import { systemRouter } from "./_core/systemRouter";
import { syncGithubContent } from "./githubSync";
import { adminProcedure, isDesignatedOwner, publicProcedure, router } from "./_core/trpc";

const profileInput = z.object({
  name: z.string().min(1).max(160),
  roleEn: z.string().min(1).max(240),
  roleAr: z.string().min(1).max(240),
  bioEn: z.string().min(1),
  bioAr: z.string().min(1),
  locationEn: z.string().min(1).max(160),
  locationAr: z.string().min(1).max(160),
  portraitKey: z.string().nullable().optional(),
  coverKey: z.string().nullable().optional(),
  defaultCoverKey: z.string().nullable().optional(),
});

export const projectInput = z.object({
  titleEn: z.string().min(1).max(160),
  titleAr: z.string().min(1).max(160),
  descriptionEn: z.string().min(1),
  descriptionAr: z.string().min(1),
  articleBodyEn: z.string().default(""),
  articleBodyAr: z.string().default(""),
  typeEn: z.string().min(1).max(120),
  typeAr: z.string().min(1).max(120),
  category: z.enum(["applications", "tutorials", "videos"]).default("applications"),
  href: z.string().url(),
  imageKey: z.string().nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
});

export const socialInput = z.object({
  platform: z.string().min(1).max(40),
  platformEn: z.string().min(1).max(80),
  platformAr: z.string().min(1).max(80),
  handleEn: z.string().min(1).max(160),
  handleAr: z.string().min(1).max(160),
  href: z.string().url(),
  sortOrder: z.number().int().min(0),
  isPublished: z.boolean(),
});

const projectMediaInput = z.object({
  projectId: z.number().int(),
  kind: z.enum(["image", "youtube"]),
  source: z.string().min(1).max(2_000),
  placement: z.enum(["start", "middle", "end"]).default("middle"),
  captionEn: z.string().max(240).default(""),
  captionAr: z.string().max(240).default(""),
  sortOrder: z.number().int().min(0).default(0),
});

async function runAutoGithubSync<T>(result: T) {
  const attach = (metadata: Record<string, unknown>) => {
    if (result && typeof result === "object" && !Array.isArray(result)) {
      return { ...(result as Record<string, unknown>), ...metadata };
    }
    return { result, ...metadata };
  };

  const enabled = await getAutoGithubSync();
  if (!enabled) return attach({ autoGithubSync: false, githubSync: null });

  try {
    return attach({ autoGithubSync: true, githubSync: await syncGithubContent() });
  } catch (error) {
    console.error("[GitHub] Automatic sync failed after save:", error);
    return attach({
      autoGithubSync: true,
      githubSync: null,
      githubSyncError: "Content saved, but GitHub synchronization failed.",
    });
  }
}

async function projectsWithImageUrls(publishedOnly: boolean) {
  const rows = await getProjects(publishedOnly);
  return Promise.all(rows.map(async (project) => {
    const media = await getProjectMedia(project.id);
    return {
      ...project,
      imageUrl: project.imageKey ? await storageGetSignedUrl(project.imageKey).catch(() => null) : null,
      comments: await getArticleComments(project.id),
      media: await Promise.all(media.map(async (item) => ({
        ...item,
        sourceUrl: item.kind === "image" ? await storageGetSignedUrl(item.source).catch(() => null) : item.source,
      }))),
    };
  }));
}

async function profileWithImageUrls() {
  const profile = await getSiteProfile();
  return profile ? {
    ...profile,
    defaultCoverUrl: profile.defaultCoverKey ? await storageGetSignedUrl(profile.defaultCoverKey).catch(() => null) : null,
  } : undefined;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  ownerCheck: publicProcedure.query(({ ctx }) => isDesignatedOwner(ctx.user)),
  content: publicProcedure.query(async () => ({
    profile: await profileWithImageUrls(),
    projects: await projectsWithImageUrls(true),
    socialLinks: await getSocialLinks(true),
  })),
  article: router({
    comments: publicProcedure.input(z.object({ projectId: z.number().int().positive() })).query(({ input }) => getArticleComments(input.projectId)),
    addComment: publicProcedure.input(z.object({ projectId: z.number().int().positive(), authorName: z.string().trim().min(2).max(120), body: z.string().trim().min(2).max(2_000) })).mutation(({ input }) => createArticleComment(input)),
  }),
    admin: router({
    content: adminProcedure.query(async () => ({
      profile: await profileWithImageUrls(),
      projects: await projectsWithImageUrls(false),
      socialLinks: await getSocialLinks(false),
      autoGithubSync: await getAutoGithubSync(),
    })),
    updateProfile: adminProcedure.input(profileInput).mutation(async ({ input }) => runAutoGithubSync(await upsertSiteProfile(input))),
    uploadAsset: adminProcedure.input(z.object({ fileName: z.string().min(1).max(180), mimeType: z.string().min(1).max(120), data: z.string().min(1).max(12_000_000), target: z.enum(["portrait", "cover", "defaultCover", "project", "article"]), projectId: z.number().int().optional() })).mutation(async ({ ctx, input }) => {
      const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
      return storagePut(`admin/${ctx.user.openId}/${input.target}/${safeName}`, Buffer.from(input.data, "base64"), input.mimeType);
    }),
    setAutoGithubSync: adminProcedure.input(z.object({ enabled: z.boolean() })).mutation(({ input }) => setAutoGithubSync(input.enabled)),
    createProject: adminProcedure.input(projectInput).mutation(async ({ input }) => runAutoGithubSync(await createProject(input))),
    updateProject: adminProcedure.input(z.object({ id: z.number().int(), data: projectInput.partial() })).mutation(async ({ input }) => runAutoGithubSync(await updateProject(input.id, input.data))),
    deleteProject: adminProcedure.input(z.object({ id: z.number().int() })).mutation(async ({ input }) => runAutoGithubSync(await deleteProject(input.id))),
    createProjectMedia: adminProcedure.input(projectMediaInput).mutation(async ({ input }) => runAutoGithubSync(await createProjectMedia(input))),
    deleteProjectMedia: adminProcedure.input(z.object({ id: z.number().int() })).mutation(async ({ input }) => runAutoGithubSync(await deleteProjectMedia(input.id))),
    createSocialLink: adminProcedure.input(socialInput.omit({ platform: true })).mutation(async ({ input }) => runAutoGithubSync(await createSocialLink({ ...input, platform: `custom-${Date.now()}` }))),
    updateSocialLink: adminProcedure.input(z.object({ id: z.number().int(), data: socialInput.partial() })).mutation(async ({ input }) => runAutoGithubSync(await updateSocialLink(input.id, input.data))),
    deleteSocialLink: adminProcedure.input(z.object({ id: z.number().int() })).mutation(async ({ input }) => runAutoGithubSync(await deleteSocialLink(input.id))),
    syncGithub: adminProcedure.mutation(() => syncGithubContent()),
  }),
});

export type AppRouter = typeof appRouter;
