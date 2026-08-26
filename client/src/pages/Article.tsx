import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowUpRight, BadgeCheck, Languages, Moon, Sun } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { ProjectImage } from "@/components/ProjectImage";
import { isStandaloneSite, useStandaloneContentSnapshot } from "@/lib/contentSnapshot";
import { getInitialProfileLanguage, shouldPersistProfileLanguage } from "@/lib/languagePreference";
import { resolveProjectImage } from "@/lib/projectImage";
import { trpc } from "@/lib/trpc";
import { useTheme } from "@/contexts/ThemeContext";
import { projects as fallbackProjects, type Project } from "./Home";

type Language = "ar" | "en";

const labels = {
  ar: {
    back: "العودة إلى الأعمال",
    article: "شرح ومعلومة",
    readMore: "المصدر أو الرابط",
    missing: "لم يتم العثور على هذا الشرح.",
    language: "English",
  },
  en: {
    back: "Back to work",
    article: "Tutorial & insight",
    readMore: "Source or link",
    missing: "This tutorial could not be found.",
    language: "العربية",
  },
};

function decodeArticleSlug(slug: string) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

function findFallbackProject(slug: string): Project | undefined {
  const title = decodeArticleSlug(slug);
  return fallbackProjects.find((project) => project.title === title);
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
  const project = useMemo(() => {
    const remote = contentData?.projects?.find((item) => item.titleEn === articleTitle);
    if (remote) {
      const imageKey = "imageKey" in remote ? remote.imageKey : null;
      const imageUrl = "imageUrl" in remote ? remote.imageUrl : null;
      return {
        title: remote.titleEn,
        titleAr: remote.titleAr,
        description: remote.descriptionEn,
        descriptionAr: remote.descriptionAr,
        articleBodyEn: remote.articleBodyEn,
        articleBodyAr: remote.articleBodyAr,
        type: remote.typeEn,
        typeAr: remote.typeAr,
        category: "tutorials" as const,
        image: resolveProjectImage(imageKey, imageUrl),
        imageFallback: resolveProjectImage(imageKey),
        href: remote.href,
      };
    }
    return findFallbackProject(slug);
  }, [contentData?.projects, articleTitle, slug]);
  const profile = contentData?.profile;
  const copy = labels[language];

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = "ltr";
    if (shouldPersistProfileLanguage(window.location.search)) localStorage.setItem("khairy-language", language);
  }, [language]);

  if (!project) {
    return <main className="article-missing"><p>{copy.missing}</p><button onClick={() => setLocation("/")}>{copy.back}</button></main>;
  }

  const title = language === "ar" ? project.titleAr : project.title;
  const description = language === "ar" ? project.descriptionAr : project.description;
  const articleBody = language === "ar" ? project.articleBodyAr : project.articleBodyEn;
  const role = language === "ar" ? profile?.roleAr : profile?.roleEn;
  const bio = language === "ar" ? profile?.bioAr : profile?.bioEn;
  const name = profile?.name ?? "Khairy Eid Aly";

  return (
    <div className={`article-page article-page-${language}`}>
      <header className="article-header">
        <button className="brand-lockup" onClick={() => setLocation("/")} aria-label={copy.back}>
          <span className="brand-emblem"><span className="brand-glyph brand-glyph-header"><span className="glyph-stroke glyph-stroke-a" /><span className="glyph-stroke glyph-stroke-b" /><span className="glyph-cut" /></span></span>
          <span className="brand-word">KHAIRY <span>EID ALY</span></span>
        </button>
        <div className="article-header-actions">
          <button className="theme-switch" type="button" onClick={() => toggleTheme?.()} aria-label={language === "ar" ? (theme === "dark" ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الليلي") : (theme === "dark" ? "Switch to light mode" : "Switch to dark mode")} title={language === "ar" ? (theme === "dark" ? "الوضع الفاتح" : "الوضع الليلي") : (theme === "dark" ? "Light mode" : "Dark mode")}>
            {theme === "dark" ? <Sun size={16} strokeWidth={1.8} /> : <Moon size={16} strokeWidth={1.8} />}
          </button>
          <button className="language-switch" onClick={() => setLanguage(language === "ar" ? "en" : "ar")}><Languages size={15} /><span>{copy.language}</span></button>
        </div>
      </header>

      <main className="article-content">
        <button className="article-back" onClick={() => setLocation("/")}><ArrowLeft size={16} />{copy.back}</button>
        <section className="article-profile-strip" dir={language} aria-label={language === "ar" ? "الملف التعريفي" : "Profile identity"}>
          <div className="article-profile-avatar"><span>{name.slice(0, 1)}</span></div>
          <div><strong>{name}</strong><p>{role ?? (language === "ar" ? "مطور وصانع محتوى" : "Developer and creator")}</p></div>
          <BadgeCheck className="article-verified" size={21} />
          <p className="article-profile-bio">{bio}</p>
        </section>
        <article className="article-card" dir={language}>
          <div className="article-kicker">{copy.article}</div>
          <h1>{title}</h1>
          <div className="article-meta"><span>{language === "ar" ? project.typeAr : project.type}</span><span>•</span><span>Khairy Eid Aly</span></div>
          <ProjectImage src={project.image} fallbackSrc={project.imageFallback} className="article-image" alt={title} />
          <div className="article-body"><p>{description}</p>{articleBody ? <div className="article-rich-body">{articleBody}</div> : null}</div>
          {project.href && <a className="article-link" href={project.href} target="_blank" rel="noreferrer">{copy.readMore}<ArrowUpRight size={16} /></a>}
        </article>
      </main>
      <footer className="article-footer">{language === "ar" ? "بطاقة Khairy Eid Aly الرقمية" : "Khairy Eid Aly digital profile"}</footer>
    </div>
  );
}
