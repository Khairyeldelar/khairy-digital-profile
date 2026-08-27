import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Languages, Moon, Sun } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { ArticleRating } from "@/components/ArticleRating";
import { ArticleShare } from "@/components/ArticleShare";
import { RelatedArticles } from "@/components/RelatedArticles";
import { isStandaloneSite, useStandaloneContentSnapshot } from "@/lib/contentSnapshot";
import { getInitialProfileLanguage, shouldPersistProfileLanguage } from "@/lib/languagePreference";
import { resolveProjectImage } from "@/lib/projectImage";
import { hasRichMarkup, sanitizeArticleHtml } from "@/lib/richArticleHtml";
import { trpc } from "@/lib/trpc";
import { useTheme } from "@/contexts/ThemeContext";
import { projects as fallbackProjects, type Project } from "./Home";

type Language = "ar" | "en";

const labels = {
  ar: { back: "العودة إلى الأعمال", article: "شرح ومعلومة", missing: "لم يتم العثور على هذا الشرح.", language: "English" },
  en: { back: "Back to work", article: "Tutorial & insight", missing: "This tutorial could not be found.", language: "العربية" },
};

function decodeArticleSlug(slug: string) {
  try { return decodeURIComponent(slug); } catch { return slug; }
}

function findFallbackProject(slug: string): Project | undefined {
  const title = decodeArticleSlug(slug);
  return fallbackProjects.find((project) => project.title === title);
}

function youtubeEmbedSrc(source: string) {
  try {
    const url = new URL(source);
    const id = url.hostname.includes("youtu.be") ? url.pathname.slice(1) : url.searchParams.get("v") ?? url.pathname.split("/").filter(Boolean).pop();
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : source;
  } catch { return source; }
}

function ArticleMedia({ media, language }: { media: NonNullable<Project["media"]>[number]; language: Language }) {
  const caption = language === "ar" ? media.captionAr : media.captionEn;
  if (!media.source) return null;
  return <figure className="article-inline-media">
    {media.kind === "youtube" ? <div className="article-video-frame"><iframe src={youtubeEmbedSrc(media.source)} title={caption || "Embedded video"} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div> : <img src={media.source} alt={caption || "Article media"} />}
    {caption ? <figcaption>{caption}</figcaption> : null}
  </figure>;
}

export default function Article() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/article/:slug");
  const slug = params?.slug ?? "";
  const articleTitle = decodeArticleSlug(slug);
  const [language, setLanguage] = useState<Language>(() => getInitialProfileLanguage(window.location.search, localStorage.getItem("khairy-language")));
  const { theme, toggleTheme } = useTheme();
  const standaloneContent = useStandaloneContentSnapshot();
  const contentQuery = trpc.content.useQuery(undefined, { enabled: !isStandaloneSite() });
  const contentData = standaloneContent ?? contentQuery.data;
  const availableArticles = useMemo<Project[]>(() => {
    if (contentData?.projects?.length) {
      return contentData.projects.map((remote) => {
      const imageKey = "imageKey" in remote ? remote.imageKey : null;
      const imageUrl = "imageUrl" in remote ? remote.imageUrl : null;
      return {
        id: remote.id,
        title: remote.titleEn,
        titleAr: remote.titleAr,
        description: remote.descriptionEn,
        descriptionAr: remote.descriptionAr,
        articleBodyEn: remote.articleBodyEn,
        articleBodyAr: remote.articleBodyAr,
        type: remote.typeEn,
        typeAr: remote.typeAr,
        category: remote.category,
        image: resolveProjectImage(imageKey, imageUrl),
        imageFallback: resolveProjectImage(imageKey),
        href: remote.href,
        media: (remote.media ?? []).map((item) => {
          const sourceUrl = "sourceUrl" in item && typeof item.sourceUrl === "string" ? item.sourceUrl : null;
          return { id: item.id, kind: item.kind, source: sourceUrl ?? resolveProjectImage(item.source), placement: item.placement, captionEn: item.captionEn, captionAr: item.captionAr, sortOrder: item.sortOrder };
        }),
        comments: remote.comments,
      } as Project;
      });
    }
    return fallbackProjects;
  }, [contentData?.projects]);
  const project = useMemo(() => availableArticles.find((item) => item.title === articleTitle) ?? findFallbackProject(slug), [availableArticles, articleTitle, slug]);
  const profile = contentData?.profile;
  const copy = labels[language];

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = "ltr";
    if (shouldPersistProfileLanguage(window.location.search)) localStorage.setItem("khairy-language", language);
  }, [language]);

  if (!project) return <main className="article-missing"><p>{copy.missing}</p><button onClick={() => setLocation("/")}>{copy.back}</button></main>;

  const title = language === "ar" ? project.titleAr : project.title;
  const articleBody = language === "ar" ? project.articleBodyAr : project.articleBodyEn;
  const role = language === "ar" ? profile?.roleAr : profile?.roleEn;
  const bio = language === "ar" ? profile?.bioAr : profile?.bioEn;
  const name = profile?.name ?? "Khairy Eid Aly";
  const media = project.media ?? [];
  const placedMedia = (placement: string) => media.filter((item) => item.placement === placement).map((item) => <ArticleMedia key={item.id} media={item} language={language} />);
  const ratingKey = project.id ? String(project.id) : articleTitle;
  const articleUrl = window.location.href;

  return <div className={`article-page article-page-${language}`}>
    <header className="article-header">
      <button className="brand-lockup" onClick={() => setLocation("/")} aria-label={copy.back}><span className="brand-emblem"><span className="brand-glyph brand-glyph-header"><span className="glyph-stroke glyph-stroke-a" /><span className="glyph-stroke glyph-stroke-b" /><span className="glyph-cut" /></span></span><span className="brand-word">KHAIRY <span>EID ALY</span></span></button>
      <div className="article-header-actions"><button className="theme-switch" type="button" onClick={() => toggleTheme?.()} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>{theme === "dark" ? <Sun size={16} strokeWidth={1.8} /> : <Moon size={16} strokeWidth={1.8} />}</button><button className="language-switch" onClick={() => setLanguage(language === "ar" ? "en" : "ar")}><Languages size={15} /><span>{copy.language}</span></button></div>
    </header>
    <main className="article-content">
      <section className="article-profile-strip" dir={language} aria-label={language === "ar" ? "الملف التعريفي" : "Profile identity"}><div className="article-profile-avatar"><span>{name.slice(0, 1)}</span></div><div><strong>{name}</strong><p>{role ?? (language === "ar" ? "مطور وصانع محتوى" : "Developer and creator")}</p></div><BadgeCheck className="article-verified" size={21} /><p className="article-profile-bio">{bio}</p></section>
      <article className="article-card" dir={language}>
        <div className="article-kicker">{project.category === "applications" ? (language === "ar" ? "تطبيق أو لعبة" : "Application or game") : project.category === "videos" ? (language === "ar" ? "فيديو" : "Video") : copy.article}</div><h1>{title}</h1><div className="article-meta"><span>{language === "ar" ? project.typeAr : project.type}</span><span>•</span><span>Khairy Eid Aly</span></div>
        {placedMedia("start")}
        <div className="article-body">{articleBody ? hasRichMarkup(articleBody) ? <div className="article-rich-body rich-article-render" dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(articleBody) }} /> : <div className="article-rich-body">{articleBody}</div> : <p className="article-body-empty">{language === "ar" ? "لا توجد تفاصيل مكتوبة لهذه الصفحة بعد. افتح «تحرير محتوى الصفحة الكاملة» من لوحة التحكم وأضف النص والصور والروابط ثم احفظ." : "No full content has been written for this page yet. Use the full-content editor in the control panel, then save."}</p>}</div>
        {placedMedia("middle")}{placedMedia("end")}
      </article>
      <ArticleRating articleKey={ratingKey} language={language} />
      <ArticleShare articleUrl={articleUrl} articleTitle={title} language={language} />
      <RelatedArticles articles={availableArticles} currentArticle={project} language={language} />
    </main>
    <footer className="article-footer">{language === "ar" ? "بطاقة Khairy Eid Aly الرقمية" : "Khairy Eid Aly digital profile"}</footer>
  </div>;
}
