import { createHash } from "node:crypto";
import { getArticleComments, getProjectMedia, getProjects, getSiteProfile, getSocialLinks } from "./db";
import { storageGetSignedUrl } from "./storage";

const GITHUB_API = "https://api.github.com";
const DEFAULT_REPOSITORY = "Khairyeldelar/khairy-digital-profile";
const SYNC_PATH = "content-sync/site-content.json";
const STATIC_ASSET_DIRECTORY = "content-sync/assets";
const BRANCH = "main";

type GithubFile = {
  sha?: string;
};

type GithubCommit = {
  content?: {
    sha?: string;
  };
  commit?: {
    html_url?: string;
  };
};

type GithubAsset = {
  key: string;
  path: string;
  bytes: Buffer;
};

function githubHeaders(token: string) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "khairy-digital-profile-sync",
  };
}

function repositoryName() {
  return process.env.GITHUB_REPOSITORY || DEFAULT_REPOSITORY;
}

type SnapshotProject = Awaited<ReturnType<typeof getProjects>>[number] & {
  media?: Awaited<ReturnType<typeof getProjectMedia>>;
  comments?: Awaited<ReturnType<typeof getArticleComments>>;
};

function extractStorageKey(value?: string | null) {
  if (!value?.startsWith("/manus-storage/")) return null;
  const rawKey = value.slice("/manus-storage/".length).split(/[?#]/, 1)[0];

  try {
    return decodeURIComponent(rawKey);
  } catch {
    return rawKey;
  }
}

function getStaticAssetPath(key: string, contentType: string) {
  const originalExtension = key.match(/\.([a-z0-9]{1,8})$/i)?.[1];
  const mime = contentType.split(";", 1)[0];
  const mimeExtension = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : mime === "image/gif" ? "gif" : "jpg";
  const hash = createHash("sha256").update(key).digest("hex").slice(0, 20);
  return `${STATIC_ASSET_DIRECTORY}/${hash}.${originalExtension ?? mimeExtension}`;
}

function replaceStorageImages(html: string, assetUrls: Map<string, string>) {
  return html.replace(/(\bsrc\s*=\s*["'])\/manus-storage\/([^"']+)(["'])/gi, (match, prefix, encodedKey, suffix) => {
    const key = extractStorageKey(`/manus-storage/${encodedKey}`);
    const staticUrl = key ? assetUrls.get(key) : null;
    return staticUrl ? `${prefix}${staticUrl}${suffix}` : match;
  });
}

export function buildContentSnapshot(profile: Awaited<ReturnType<typeof getSiteProfile>>, projects: SnapshotProject[], socialLinks: Awaited<ReturnType<typeof getSocialLinks>>, assetUrls = new Map<string, string>()) {
  return `${JSON.stringify({
    version: 1,
    generatedAt: new Date().toISOString(),
    profile: profile ? {
      name: profile.name,
      roleEn: profile.roleEn,
      roleAr: profile.roleAr,
      bioEn: profile.bioEn,
      bioAr: profile.bioAr,
      locationEn: profile.locationEn,
      locationAr: profile.locationAr,
      portraitUrl: profile.portraitKey ? assetUrls.get(profile.portraitKey) ?? null : null,
      coverUrl: profile.coverKey ? assetUrls.get(profile.coverKey) ?? null : null,
      defaultCoverUrl: profile.defaultCoverKey ? assetUrls.get(profile.defaultCoverKey) ?? null : null,
    } : null,
    projects: projects.map((project) => ({
      id: project.id,
      titleEn: project.titleEn,
      titleAr: project.titleAr,
      descriptionEn: project.descriptionEn,
      descriptionAr: project.descriptionAr,
      articleBodyEn: replaceStorageImages(project.articleBodyEn, assetUrls),
      articleBodyAr: replaceStorageImages(project.articleBodyAr, assetUrls),
      typeEn: project.typeEn,
      typeAr: project.typeAr,
      category: project.category,
      href: project.href,
      sortOrder: project.sortOrder,
      isPublished: project.isPublished,
      imageUrl: project.imageKey ? assetUrls.get(project.imageKey) ?? null : null,
      media: (project.media ?? []).map((item) => ({
        id: item.id,
        kind: item.kind,
        source: item.source,
        sourceUrl: assetUrls.get(extractStorageKey(item.source) ?? "") ?? null,
        placement: item.placement,
        captionEn: item.captionEn,
        captionAr: item.captionAr,
        sortOrder: item.sortOrder,
      })),
      comments: (project.comments ?? []).map((comment) => ({
        id: comment.id,
        authorName: comment.authorName,
        body: comment.body,
        createdAt: comment.createdAt,
      })),
    })),
    socialLinks: socialLinks.map((link) => ({
      id: link.id,
      platform: link.platform,
      platformEn: link.platformEn,
      platformAr: link.platformAr,
      handleEn: link.handleEn,
      handleAr: link.handleAr,
      href: link.href,
      sortOrder: link.sortOrder,
      isPublished: link.isPublished,
    })),
  }, null, 2)}\n`;
}

async function readExistingFile(token: string, repository: string, path = SYNC_PATH) {
  const response = await fetch(`${GITHUB_API}/repos/${repository}/contents/${path}?ref=${BRANCH}`, {
    headers: githubHeaders(token),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`GitHub content lookup failed (${response.status}).`);
  return response.json() as Promise<GithubFile>;
}

async function writeGithubFile(token: string, repository: string, path: string, content: Buffer | string, message: string) {
  const existing = await readExistingFile(token, repository, path);
  const response = await fetch(`${GITHUB_API}/repos/${repository}/contents/${path}`, {
    method: "PUT",
    headers: githubHeaders(token),
    body: JSON.stringify({
      message,
      content: Buffer.isBuffer(content) ? content.toString("base64") : Buffer.from(content, "utf8").toString("base64"),
      branch: BRANCH,
      ...(existing?.sha ? { sha: existing.sha } : {}),
    }),
  });

  if (!response.ok) throw new Error(`GitHub file upload failed (${response.status}).`);
  return response.json() as Promise<GithubCommit>;
}

async function fetchStaticAsset(key: string): Promise<GithubAsset> {
  const sourceUrl = await storageGetSignedUrl(key);
  const response = await fetch(sourceUrl);
  if (!response.ok) throw new Error(`Storage image download failed (${response.status}).`);
  const contentType = response.headers.get("content-type") || "image/jpeg";
  return { key, path: getStaticAssetPath(key, contentType), bytes: Buffer.from(await response.arrayBuffer()) };
}

async function exportStaticAssets(token: string, repository: string, profile: Awaited<ReturnType<typeof getSiteProfile>>, projects: SnapshotProject[]) {
  const keys = new Set<string>();
  if (profile?.portraitKey) keys.add(profile.portraitKey);
  if (profile?.coverKey) keys.add(profile.coverKey);
  if (profile?.defaultCoverKey) keys.add(profile.defaultCoverKey);
  for (const project of projects) {
    if (project.imageKey) keys.add(project.imageKey);
    for (const media of project.media ?? []) {
      const key = extractStorageKey(media.source);
      if (key) keys.add(key);
    }
    for (const body of [project.articleBodyEn, project.articleBodyAr]) {
      for (const match of Array.from(body.matchAll(/\bsrc\s*=\s*["'](\/manus-storage\/[^"']+)["']/gi))) {
        const key = extractStorageKey(match[1]);
        if (key) keys.add(key);
      }
    }
  }

  const assets = await Promise.all(Array.from(keys).map(fetchStaticAsset));
  for (const asset of assets) {
    await writeGithubFile(token, repository, asset.path, asset.bytes, "Sync public site image from admin dashboard");
  }
  return new Map(assets.map((asset) => [asset.key, asset.path]));
}

export async function syncGithubContent() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GitHub sync is not configured on the server.");

  const repository = repositoryName();
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository)) throw new Error("GitHub repository configuration is invalid.");

  const [profile, projects, socialLinks] = await Promise.all([
    getSiteProfile(),
    getProjects(false),
    getSocialLinks(false),
  ]);
  const snapshotProjects = await Promise.all(projects.map(async (project) => ({
    ...project,
    media: await getProjectMedia(project.id),
    comments: await getArticleComments(project.id),
  })));
  const assetUrls = await exportStaticAssets(token, repository, profile, snapshotProjects);
  const snapshot = buildContentSnapshot(profile, snapshotProjects, socialLinks, assetUrls);
  const result = await writeGithubFile(token, repository, SYNC_PATH, snapshot, "Sync site content from admin dashboard");
  return {
    repository,
    path: SYNC_PATH,
    commitUrl: result.commit?.html_url ?? null,
  };
}
