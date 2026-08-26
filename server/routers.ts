import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import {
  createProject,
  deleteProject,
  getProjects,
  getSiteProfile,
  getSocialLinks,
  updateProject,
  updateSocialLink,
  upsertSiteProfile,
} from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { storagePut } from "./storage";
import { ENV } from "./_core/env";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";

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
});

const projectInput = z.object({
  titleEn: z.string().min(1).max(160),
  titleAr: z.string().min(1).max(160),
  descriptionEn: z.string().min(1),
  descriptionAr: z.string().min(1),
  typeEn: z.string().min(1).max(120),
  typeAr: z.string().min(1).max(120),
  href: z.string().url(),
  imageKey: z.string().nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
});

const socialInput = z.object({
  handleEn: z.string().min(1).max(160),
  handleAr: z.string().min(1).max(160),
  href: z.string().min(1),
  sortOrder: z.number().int().min(0),
  isPublished: z.boolean(),
});

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
  ownerCheck: publicProcedure.query(({ ctx }) => Boolean(ctx.user && ctx.user.openId === ENV.ownerOpenId)),
  content: publicProcedure.query(async () => ({
    profile: await getSiteProfile(),
    projects: await getProjects(true),
    socialLinks: await getSocialLinks(true),
  })),
  admin: router({
    content: adminProcedure.query(async () => ({
      profile: await getSiteProfile(),
      projects: await getProjects(false),
      socialLinks: await getSocialLinks(false),
    })),
    updateProfile: adminProcedure.input(profileInput).mutation(({ input }) => upsertSiteProfile(input)),
    uploadAsset: adminProcedure.input(z.object({ fileName: z.string().min(1).max(180), mimeType: z.string().min(1).max(120), data: z.string().min(1).max(12_000_000), target: z.enum(["portrait", "cover", "project"]), projectId: z.number().int().optional() })).mutation(async ({ ctx, input }) => {
      const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
      return storagePut(`admin/${ctx.user.openId}/${input.target}/${safeName}`, Buffer.from(input.data, "base64"), input.mimeType);
    }),
    createProject: adminProcedure.input(projectInput).mutation(({ input }) => createProject(input)),
    updateProject: adminProcedure.input(z.object({ id: z.number().int(), data: projectInput.partial() })).mutation(({ input }) => updateProject(input.id, input.data)),
    deleteProject: adminProcedure.input(z.object({ id: z.number().int() })).mutation(({ input }) => deleteProject(input.id)),
    updateSocialLink: adminProcedure.input(z.object({ id: z.number().int(), data: socialInput })).mutation(({ input }) => updateSocialLink(input.id, input.data)),
  }),
});

export type AppRouter = typeof appRouter;
