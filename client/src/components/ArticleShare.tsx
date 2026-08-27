import React, { useState } from "react";
import { Facebook, Linkedin, Link as LinkIcon } from "lucide-react";
import { buildSocialShareLinks } from "@/lib/articlePageExtras";

type Language = "ar" | "en";

type ArticleShareProps = {
  articleUrl: string;
  articleTitle: string;
  language: Language;
};

const copy = {
  ar: { title: "شارك المقال", copy: "نسخ الرابط", copied: "تم نسخ رابط المقال" },
  en: { title: "Share article", copy: "Copy link", copied: "Article link copied" },
};

export function ArticleShare({ articleUrl, articleTitle, language }: ArticleShareProps) {
  const [copied, setCopied] = useState(false);
  const labels = copy[language];
  const shareLinks = buildSocialShareLinks(articleUrl, articleTitle);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return <section className="article-share" dir={language} aria-label={labels.title}>
    <span className="article-share-label">{labels.title}</span>
    <div className="article-share-actions">
      <a href={shareLinks.facebook} target="_blank" rel="noreferrer" aria-label={`${labels.title} Facebook`}><Facebook size={16} aria-hidden="true" /></a>
      <a href={shareLinks.linkedin} target="_blank" rel="noreferrer" aria-label={`${labels.title} LinkedIn`}><Linkedin size={16} aria-hidden="true" /></a>
      <a href={shareLinks.x} target="_blank" rel="noreferrer" aria-label={`${labels.title} X`}><span aria-hidden="true">X</span></a>
      <button type="button" onClick={() => void copyLink()} aria-label={labels.copy}><LinkIcon size={16} aria-hidden="true" /></button>
    </div>
    <span className="article-share-status" aria-live="polite">{copied ? labels.copied : ""}</span>
  </section>;
}
