import { useEffect, useState } from "react";

export type ContentSnapshot = {
  version: number;
  generatedAt: string;
  profile: {
    name: string;
    roleEn: string;
    roleAr: string;
    bioEn: string;
    bioAr: string;
    locationEn: string;
    locationAr: string;
    portraitUrl?: string | null;
    coverUrl?: string | null;
  } | null;
  projects: Array<{
    id: number;
    titleEn: string;
    titleAr: string;
    descriptionEn: string;
    descriptionAr: string;
    articleBodyEn?: string;
    articleBodyAr?: string;
    typeEn: string;
    typeAr: string;
    category: "applications" | "tutorials" | "videos";
    href: string;
    sortOrder: number;
    isPublished: boolean;
    imageUrl?: string | null;
    media?: Array<{
      id: number;
      kind: string;
      source: string;
      sourceUrl?: string | null;
      placement: string;
      captionEn: string;
      captionAr: string;
      sortOrder: number;
    }>;
    comments?: Array<{ id: number; authorName: string; body: string; createdAt: string }>;
  }>;
  socialLinks: Array<{
    id: number;
    platform: string;
    platformEn: string;
    platformAr: string;
    handleEn: string;
    handleAr: string;
    href: string;
    sortOrder: number;
    isPublished: boolean;
  }>;
};

export function isStandaloneSite(base = import.meta.env.BASE_URL || "/") {
  return base !== "/";
}

export function contentSnapshotPath(base = import.meta.env.BASE_URL || "/") {
  return `${base}content-sync/site-content.json`;
}

export function useStandaloneContentSnapshot() {
  const [data, setData] = useState<ContentSnapshot | null>(null);

  useEffect(() => {
    if (!isStandaloneSite()) return;
    let active = true;

    void fetch(contentSnapshotPath(), { cache: "no-store" })
      .then((response) => response.ok ? response.json() as Promise<ContentSnapshot> : null)
      .then((snapshot) => {
        if (active && snapshot?.version === 1) setData(snapshot);
      })
      .catch(() => undefined);

    return () => { active = false; };
  }, []);

  return data;
}
