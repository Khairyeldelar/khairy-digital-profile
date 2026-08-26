import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Languages, Moon, Sun } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { isStandaloneSite, useStandaloneContentSnapshot } from "@/lib/contentSnapshot";
import { getInitialProfileLanguage, shouldPersistProfileLanguage } from "@/lib/languagePreference";
import { trpc } from "@/lib/trpc";
import { useTheme } from "@/contexts/ThemeContext";
import { projects as fallbackProjects } from "./Home";

type Language = "ar" | "en";

function decodeSlug(slug: string) { try { return decodeURIComponent(slug); } catch { return slug; } }

function embedUrl(source: string) {
  try {
    const url = new URL(source);
    const id = url.hostname.includes("youtu.be") ? url.pathname.slice(1) : url.searchParams.get("v") ?? url.pathname.split("/").filter(Boolean).pop();
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : source;
  } catch { return source; }
}

export default function Video() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/video/:slug");
  const titleParam = decodeSlug(params?.slug ?? "");
  const [language, setLanguage] = useState<Language>(() => getInitialProfileLanguage(window.location.search, localStorage.getItem("khairy-language")));
  const { theme, toggleTheme } = useTheme();
  const standaloneContent = useStandaloneContentSnapshot();
  const contentQuery = trpc.content.useQuery(undefined, { enabled: !isStandaloneSite() });
  const contentData = standaloneContent ?? contentQuery.data;
  const video = useMemo(() => contentData?.projects?.find((project) => project.category === "videos" && project.titleEn === titleParam) ?? fallbackProjects.find((project) => project.category === "videos" && project.title === titleParam), [contentData?.projects, titleParam]);

  useEffect(() => { document.documentElement.lang = language; document.documentElement.dir = language; if (shouldPersistProfileLanguage(window.location.search)) localStorage.setItem("khairy-language", language); }, [language]);
  if (!video) return <main className="article-missing"><p>{language === "ar" ? "لم يتم العثور على الفيديو." : "Video not found."}</p><button onClick={() => setLocation("/")}>{language === "ar" ? "العودة إلى الأعمال" : "Back to work"}</button></main>;
  const title = language === "ar" ? video.titleAr : ("titleEn" in video ? video.titleEn : video.title);
  const description = language === "ar" ? video.descriptionAr : ("descriptionEn" in video ? video.descriptionEn : video.description);

  return <div className={`article-page article-page-${language}`}>
    <header className="article-header"><button className="brand-lockup" onClick={() => setLocation("/")}><span className="brand-emblem"><span className="brand-glyph brand-glyph-header"><span className="glyph-stroke glyph-stroke-a" /><span className="glyph-stroke glyph-stroke-b" /><span className="glyph-cut" /></span></span><span className="brand-word">KHAIRY <span>EID ALY</span></span></button><div className="article-header-actions"><button className="theme-switch" type="button" onClick={() => toggleTheme?.()}>{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}</button><button className="language-switch" onClick={() => setLanguage(language === "ar" ? "en" : "ar")}><Languages size={15} /><span>{language === "ar" ? "English" : "العربية"}</span></button></div></header>
    <main className="article-content"><button className="article-back" onClick={() => setLocation("/")}><ArrowLeft size={16} />{language === "ar" ? "العودة إلى الأعمال" : "Back to work"}</button><article className="article-card video-page-card" dir={language}><div className="article-kicker">{language === "ar" ? "فيديو" : "Video"}</div><h1>{title}</h1><p className="video-page-description">{description}</p><div className="article-video-frame"><iframe src={embedUrl(video.href)} title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div></article></main>
    <footer className="article-footer">{language === "ar" ? "بطاقة Khairy Eid Aly الرقمية" : "Khairy Eid Aly digital profile"}</footer>
  </div>;
}
