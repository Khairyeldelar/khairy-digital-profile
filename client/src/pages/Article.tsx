import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowUpRight, BadgeCheck, Languages, Loader2, Moon, Send, Sun } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { ProjectImage } from "@/components/ProjectImage";
import { isStandaloneSite, useStandaloneContentSnapshot } from "@/lib/contentSnapshot";
import { getInitialProfileLanguage, shouldPersistProfileLanguage } from "@/lib/languagePreference";
import { resolveProjectImage } from "@/lib/projectImage";
import { hasRichMarkup, sanitizeArticleHtml } from "@/lib/richArticleHtml";
import { trpc } from "@/lib/trpc";
import { useTheme } from "@/contexts/ThemeContext";
import { projects as fallbackProjects, type Project } from "./Home";

type Language = "ar" | "en";

const labels = {
  ar: { back: "العودة إلى الأعمال", article: "شرح ومعلومة", readMore: "المصدر أو الرابط", missing: "لم يتم العثور على هذا الشرح.", language: "English", comments: "التعليقات", commentName: "اسمك", commentBody: "اكتب تعليقك…", send: "نشر التعليق", empty: "كن أول من يضيف تعليقًا.", static: "التعليقات التفاعلية متاحة في النسخة المباشرة من الموقع.", commentSaved: "تم نشر تعليقك." },
  en: { back: "Back to work", article: "Tutorial & insight", readMore: "Source or link", missing: "This tutorial could not be found.", language: "العربية", comments: "Comments", commentName: "Your name", commentBody: "Write a comment…", send: "Post comment", empty: "Be the first to comment.", static: "Interactive comments are available on the live site.", commentSaved: "Your comment was posted." },
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
  const [authorName, setAuthorName] = useState("");
  const [commentBody, setCommentBody] = useState("");
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
    }
    return findFallbackProject(slug);
  }, [contentData?.projects, articleTitle, slug]);
  const commentsQuery = trpc.article.comments.useQuery({ projectId: project?.id ?? 0 }, { enabled: Boolean(project?.id) && !isStandaloneSite() });
  const utils = trpc.useUtils();
  const addComment = trpc.article.addComment.useMutation({
    onSuccess: () => {
      setCommentBody("");
      void utils.article.comments.invalidate({ projectId: project?.id ?? 0 });
    },
  });
  const profile = contentData?.profile;
  const copy = labels[language];

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = "ltr";
    if (shouldPersistProfileLanguage(window.location.search)) localStorage.setItem("khairy-language", language);
  }, [language]);

  if (!project) return <main className="article-missing"><p>{copy.missing}</p><button onClick={() => setLocation("/")}>{copy.back}</button></main>;

  const title = language === "ar" ? project.titleAr : project.title;
  const description = language === "ar" ? project.descriptionAr : project.description;
  const articleBody = language === "ar" ? project.articleBodyAr : project.articleBodyEn;
  const role = language === "ar" ? profile?.roleAr : profile?.roleEn;
  const bio = language === "ar" ? profile?.bioAr : profile?.bioEn;
  const name = profile?.name ?? "Khairy Eid Aly";
  const media = project.media ?? [];
  const placedMedia = (placement: string) => media.filter((item) => item.placement === placement).map((item) => <ArticleMedia key={item.id} media={item} language={language} />);
  const comments = isStandaloneSite() ? project.comments ?? [] : commentsQuery.data ?? project.comments ?? [];

  return <div className={`article-page article-page-${language}`}>
    <header className="article-header">
      <button className="brand-lockup" onClick={() => setLocation("/")} aria-label={copy.back}><span className="brand-emblem"><span className="brand-glyph brand-glyph-header"><span className="glyph-stroke glyph-stroke-a" /><span className="glyph-stroke glyph-stroke-b" /><span className="glyph-cut" /></span></span><span className="brand-word">KHAIRY <span>EID ALY</span></span></button>
      <div className="article-header-actions"><button className="theme-switch" type="button" onClick={() => toggleTheme?.()} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>{theme === "dark" ? <Sun size={16} strokeWidth={1.8} /> : <Moon size={16} strokeWidth={1.8} />}</button><button className="language-switch" onClick={() => setLanguage(language === "ar" ? "en" : "ar")}><Languages size={15} /><span>{copy.language}</span></button></div>
    </header>
    <main className="article-content">
      <button className="article-back" onClick={() => setLocation("/")}><ArrowLeft size={16} />{copy.back}</button>
      <section className="article-profile-strip" dir={language} aria-label={language === "ar" ? "الملف التعريفي" : "Profile identity"}><div className="article-profile-avatar"><span>{name.slice(0, 1)}</span></div><div><strong>{name}</strong><p>{role ?? (language === "ar" ? "مطور وصانع محتوى" : "Developer and creator")}</p></div><BadgeCheck className="article-verified" size={21} /><p className="article-profile-bio">{bio}</p></section>
      <article className="article-card" dir={language}>
        <div className="article-kicker">{project.category === "applications" ? (language === "ar" ? "تطبيق أو لعبة" : "Application or game") : project.category === "videos" ? (language === "ar" ? "فيديو" : "Video") : copy.article}</div><h1>{title}</h1><div className="article-meta"><span>{language === "ar" ? project.typeAr : project.type}</span><span>•</span><span>Khairy Eid Aly</span></div>
        <ProjectImage src={project.image} fallbackSrc={project.imageFallback} className="article-image" alt={title} />
        {placedMedia("start")}
        <div className="article-body"><p>{description}</p>{articleBody ? hasRichMarkup(articleBody) ? <div className="article-rich-body rich-article-render" dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(articleBody) }} /> : <div className="article-rich-body">{articleBody}</div> : null}</div>
        {placedMedia("middle")}{placedMedia("end")}
        {project.href && <a className="article-link" href={project.href} target="_blank" rel="noreferrer">{copy.readMore}<ArrowUpRight size={16} /></a>}
      </article>
      <section className="article-comments" dir={language} aria-labelledby="comments-title">
        <div className="article-comments-heading"><p className="article-kicker">{comments.length}</p><h2 id="comments-title">{copy.comments}</h2></div>
        {comments.length ? <div className="comment-list">{comments.map((comment) => <article key={comment.id} className="comment-item"><strong>{comment.authorName}</strong><p>{comment.body}</p></article>)}</div> : <p className="comment-empty">{copy.empty}</p>}
        {isStandaloneSite() ? <p className="comment-static-note">{copy.static}</p> : <form className="comment-form" onSubmit={(event) => { event.preventDefault(); if (project.id && authorName.trim() && commentBody.trim()) addComment.mutate({ projectId: project.id, authorName: authorName.trim(), body: commentBody.trim() }); }}><input value={authorName} onChange={(event) => setAuthorName(event.target.value)} placeholder={copy.commentName} required maxLength={120} /><textarea value={commentBody} onChange={(event) => setCommentBody(event.target.value)} placeholder={copy.commentBody} required maxLength={2000} /><button disabled={addComment.isPending}>{addComment.isPending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}{copy.send}</button>{addComment.isError ? <p className="comment-error">{language === "ar" ? "تعذر نشر التعليق، حاول مرة أخرى." : "Could not post the comment. Try again."}</p> : null}</form>}
      </section>
    </main>
    <footer className="article-footer">{language === "ar" ? "بطاقة Khairy Eid Aly الرقمية" : "Khairy Eid Aly digital profile"}</footer>
  </div>;
}
