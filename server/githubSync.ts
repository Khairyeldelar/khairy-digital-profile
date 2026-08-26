import { getArticleComments, getProjectMedia, getProjects, getSiteProfile, getSocialLinks } from "./db";

const GITHUB_API = "https://api.github.com";
const DEFAULT_REPOSITORY = "Khairyeldelar/khairy-digital-profile";
const SYNC_PATH = "content-sync/site-content.json";
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

export function buildContentSnapshot(profile: Awaited<ReturnType<typeof getSiteProfile>>, projects: SnapshotProject[], socialLinks: Awaited<ReturnType<typeof getSocialLinks>>) {
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
    } : null,
    projects: projects.map((project) => ({
      id: project.id,
      titleEn: project.titleEn,
      titleAr: project.titleAr,
      descriptionEn: project.descriptionEn,
      descriptionAr: project.descriptionAr,
      articleBodyEn: project.articleBodyEn,
      articleBodyAr: project.articleBodyAr,
      typeEn: project.typeEn,
      typeAr: project.typeAr,
      category: project.category,
      href: project.href,
      sortOrder: project.sortOrder,
      isPublished: project.isPublished,
      media: (project.media ?? []).map((item) => ({
        id: item.id,
        kind: item.kind,
        source: item.source,
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

async function readExistingFile(token: string, repository: string) {
  const response = await fetch(`${GITHUB_API}/repos/${repository}/contents/${SYNC_PATH}?ref=${BRANCH}`, {
    headers: githubHeaders(token),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`GitHub content lookup failed (${response.status}).`);
  return response.json() as Promise<GithubFile>;
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
  const snapshot = buildContentSnapshot(profile, snapshotProjects, socialLinks);
  const existing = await readExistingFile(token, repository);
  const response = await fetch(`${GITHUB_API}/repos/${repository}/contents/${SYNC_PATH}`, {
    method: "PUT",
    headers: githubHeaders(token),
    body: JSON.stringify({
      message: "Sync site content from admin dashboard",
      content: Buffer.from(snapshot, "utf8").toString("base64"),
      branch: BRANCH,
      ...(existing?.sha ? { sha: existing.sha } : {}),
    }),
  });

  if (!response.ok) throw new Error(`GitHub sync failed (${response.status}).`);
  const result = await response.json() as GithubCommit;
  return {
    repository,
    path: SYNC_PATH,
    commitUrl: result.commit?.html_url ?? null,
  };
}
