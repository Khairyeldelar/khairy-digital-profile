/*
 * Design philosophy: Quiet Swiss Card — a calm editorial digital identity with generous whitespace,
 * one owned Burnt Coral accent, compact content, tactile cards, and application-like navigation.
 */
import React, { useEffect, useRef, useState } from "react";
import { ProjectCardTrigger } from "@/components/ProjectCardTrigger";
import { ProjectImage } from "@/components/ProjectImage";
import { ProjectDetailsDialog } from "@/components/ProjectDetailsDialog";
import { presentSocialLink } from "@/lib/socialLinkPresentation";
import { getInitialProfileLanguage, shouldPersistProfileLanguage } from "@/lib/languagePreference";
import { filterProjectsByCategory, workCategories, type WorkCategory } from "@/lib/workCategories";
import { isStandaloneSite, useStandaloneContentSnapshot } from "@/lib/contentSnapshot";
import { publicAssetPath, resolveProjectImage } from "@/lib/projectImage";
import { defaultArticleCover } from "@/lib/defaultArticleCover";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Facebook,
  Github,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Youtube,
  Languages,
  Moon,
  Sun,
} from "lucide-react";

type Language = "en" | "ar";

type ProfileItem = {
  name: string;
  nameAr?: string;
  handle: string;
  handleAr: string;
  href: string;
  icon: typeof Github;
};

export type Project = {
  id?: number;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  articleBodyEn?: string;
  articleBodyAr?: string;
  type: string;
  typeAr: string;
  image: string;
  imageFallback?: string;
  href: string;
  category: WorkCategory;
  media?: Array<{
    id: number;
    kind: string;
    source: string;
    placement: string;
    captionEn: string;
    captionAr: string;
    sortOrder: number;
  }>;
  comments?: Array<{ id: number; authorName: string; body: string; createdAt: Date | string }>;
};

export const projects: Project[] = [
  {
    title: "Nova Notes",
    titleAr: "نوفا نوتس",
    description: "A calmer way to capture ideas and keep them moving.",
    descriptionAr: "طريقة أهدأ لالتقاط الأفكار وإبقائها في حركة.",
    type: "Product system",
    typeAr: "نظام منتج",
    image: "",
    href: "https://github.com/",
    category: "applications",
  },
  {
    title: "Signal Studio",
    titleAr: "سيجنال ستوديو",
    description: "A compact visual toolkit for thoughtful content.",
    descriptionAr: "مجموعة بصرية صغيرة لصناعة محتوى مدروس.",
    type: "Creator toolkit",
    typeAr: "أدوات صانع محتوى",
    image: "",
    href: "https://www.behance.net/",
    category: "tutorials",
  },
  {
    title: "Atlas Flow",
    titleAr: "أطلس فلو",
    description: "Turning complex digital journeys into simple paths.",
    descriptionAr: "تحويل الرحلات الرقمية المعقدة إلى مسارات بسيطة.",
    type: "Digital direction",
    typeAr: "توجيه رقمي",
    image: "",
    href: "https://dribbble.com/",
    category: "videos",
  },
];

const profiles: ProfileItem[] = [
  { name: "GitHub", handle: "Code, experiments & builds", handleAr: "كود وتجارب ومشاريع", href: "https://github.com/", icon: Github },
  { name: "LinkedIn", handle: "Work, notes & connections", handleAr: "عمل وملاحظات وتواصل", href: "https://www.linkedin.com/", icon: Linkedin },
  { name: "Facebook", handle: "A little more of the human side", handleAr: "جانب أكثر إنسانية", href: "https://www.facebook.com/", icon: Facebook },
  { name: "Instagram", handle: "Visual notes from the process", handleAr: "ملاحظات بصرية من الرحلة", href: "https://www.instagram.com/", icon: Instagram },
  { name: "YouTube", handle: "Ideas in motion", handleAr: "أفكار تتحرك", href: "https://www.youtube.com/", icon: Youtube },
  { name: "Email", handle: "Say hello directly", handleAr: "راسلني مباشرة", href: "mailto:khairy.eldelar5@gmail.com", icon: Mail },
];

const navItems = [
  { id: "home", labelEn: "Home", labelAr: "الرئيسية" },
  { id: "work", labelEn: "Work", labelAr: "أعمالي" },
  { id: "profiles", labelEn: "Profiles", labelAr: "حساباتي" },
  { id: "contact", labelEn: "Contact", labelAr: "تواصل" },
];

const copy = {
  en: {
    languageLabel: "Switch to Arabic",
    languageName: "العربية",
    digitalProfile: "Digital profile",
    personalCard: "Personal card / 01",
    availability: "Open to good ideas",
    location: "Cairo · Remote · 2026",
    role: "Developer",
    creator: "Creator",
    projects: "Digital Projects",
    bio: "I turn ideas into clear, useful digital experiences — with a little character.",
    myWork: "My Work",
    contactMe: "Contact Me",
    focus: "Focus",
    making: "Making",
    direction: "Direction",
    building: "Building from curiosity",
    selectedWork: "02 / My work",
    workTitle: "My Work",
    workTitleEm: "",
    workAside: "",
    findMe: "03 / Find me around",
    profilesTitle: "My Profiles",
    aboutKicker: "A little context",
    aboutTitle: "About Me",
    aboutText: "I like the space where technology meets a clear point of view. I build, document, and refine digital ideas until they feel simple to use.",
    contactKicker: "04 / Contact",
    contactTitle: "Have a good idea?",
    contactTitleEm: "Let’s make it useful.",
    footer: "Made for the next good idea",
    viewProject: "View",
    visitProject: "Go to project",
    visitShort: "Visit",
    close: "Close",
    workCategoryLabel: "Work category",
    emptyCategory: "New work is coming soon.",
  },
  ar: {
    languageLabel: "التبديل إلى الإنجليزية",
    languageName: "English",
    digitalProfile: "بطاقة رقمية",
    personalCard: "بطاقة شخصية / 01",
    availability: "منفتح على الأفكار الجيدة",
    location: "القاهرة · عن بُعد · 2026",
    role: "مطور",
    creator: "صانع محتوى",
    projects: "مشاريع رقمية",
    bio: "أحوّل الأفكار إلى تجارب رقمية واضحة ومفيدة — بلمسة شخصية.",
    myWork: "أعمالي",
    contactMe: "تواصل معي",
    focus: "التخصص",
    making: "صناعة",
    direction: "التوجه",
    building: "أبني بدافع الفضول",
    selectedWork: "02 / أعمالي",
    workTitle: "أعمالي",
    workTitleEm: "",
    workAside: "",
    findMe: "03 / تجدني هنا",
    profilesTitle: "حساباتي",
    aboutKicker: "نبذة قصيرة",
    aboutTitle: "عني",
    aboutText: "أحب المساحة التي تلتقي فيها التقنية مع وجهة نظر واضحة. أبني الأفكار الرقمية وأوثقها وأصقلها حتى تصبح سهلة الاستخدام.",
    contactKicker: "04 / تواصل",
    contactTitle: "لديك فكرة جيدة؟",
    contactTitleEm: "لنجعلها مفيدة.",
    footer: "مصمم للفكرة الجيدة القادمة",
    viewProject: "مشاهدة",
    visitProject: "الذهاب إلى المشروع",
    visitShort: "زيارة",
    close: "إغلاق",
    workCategoryLabel: "فئة الأعمال",
    emptyCategory: "أعمال جديدة قريبًا.",
  },
};

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

type WorkShowcaseCopy = {
  workTitle: string;
  workCategoryLabel: string;
  emptyCategory: string;
  viewProject: string;
  visitProject: string;
  visitShort: string;
};

export function WorkShowcase({ projects, language, copy, category, sectionId = "work" }: { projects: Project[]; language: Language; copy: WorkShowcaseCopy; category?: WorkCategory; sectionId?: string }) {
  const [selectedCategory, setSelectedCategory] = useState<WorkCategory>(category ?? "applications");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const projectTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [, setLocation] = useLocation();
  const activeCategory = category ?? selectedCategory;
  const categoryMeta = workCategories.find((item) => item.id === category);
  const visibleProjects = filterProjectsByCategory(projects, activeCategory);

  return (
    <>
      <section id={sectionId} className="content-section reveal reveal-delay-1" aria-labelledby={`${sectionId}-title`}>
        <div className="work-heading-card" aria-label={categoryMeta ? (language === "ar" ? categoryMeta.labelAr : categoryMeta.labelEn) : copy.workTitle}>
          <h2 id={`${sectionId}-title`}>{categoryMeta ? (language === "ar" ? categoryMeta.labelAr : categoryMeta.labelEn) : copy.workTitle}</h2>
        </div>
        {!categoryMeta && <div className="work-category-tabs" role="tablist" aria-label={copy.workCategoryLabel}>
          {workCategories.map((category) => {
            const isActive = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={isActive ? "work-category-tab active" : "work-category-tab"}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span>{language === "ar" ? category.labelAr : category.labelEn}</span>
                <small>0{workCategories.findIndex((item) => item.id === category.id) + 1}</small>
              </button>
            );
          })}
        </div>}
        <div className="work-rail" aria-label={language === "ar" ? "مشاريع الفئة المختارة" : "Selected work projects"}>
          {visibleProjects.length > 0 ? visibleProjects.map((project, index) => (
            <article className="project-card" key={project.title} style={{ animationDelay: `${index * 70 + 150}ms` }}>
              <ProjectCardTrigger
                onOpen={(button) => {
                  projectTriggerRef.current = button;
                  setSelectedProject(project);
                }}
                label={`${project.category === "tutorials" ? (language === "ar" ? "قراءة" : "Read") : copy.viewProject}: ${language === "ar" ? project.titleAr : project.title}`}
              >
                <div className={`project-image-wrap project-art-${index + 1}`}>
                  <div className="project-art-fallback" aria-hidden="true"><span className="project-art-line line-a" /><span className="project-art-line line-b" /><span className="project-art-orb" /></div>
                  <ProjectImage src={project.image} fallbackSrc={project.imageFallback} className="project-image" alt={`${project.title} project preview`} />
                  <span className="project-view"><ArrowUpRight size={17} /></span>
                </div>
                <div className="project-body">
                  <div className="project-row">
                    <h3>{language === "ar" ? project.titleAr : project.title}</h3>
                  </div>
                  <span className="project-open-label">{project.category === "tutorials" ? (language === "ar" ? "قراءة" : "Read") : project.href ? copy.visitShort : copy.viewProject}</span>
                </div>
              </ProjectCardTrigger>
            </article>
          )) : (
            <div className="work-empty-state" role="status">{copy.emptyCategory}</div>
          )}
        </div>
      </section>
      <ProjectDetailsDialog
        project={selectedProject}
        projectIndex={selectedProject ? projects.findIndex((item) => item.title === selectedProject.title) : 0}
        language={language}
        visitLabel={copy.visitProject}
        open={Boolean(selectedProject)}
        onOpenChange={(open) => { if (!open) setSelectedProject(null); }}
        returnFocusRef={projectTriggerRef}
      />
    </>
  );
}

export default function Home() {
  // The useAuth hook provides authentication state.
  // To implement login/logout, call logout(), or start login from an event
  // handler: onClick={() => startLogin()} (imported from "@/const"). Never call
  // startLogin() during render (no href={startLogin()}) — it mints a one-time
  // nonce cookie and must run only at the moment of navigation.
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const [language, setLanguage] = useState<Language>(() => {
    return getInitialProfileLanguage(window.location.search, localStorage.getItem("khairy-language"));
  });
  const [activeSection, setActiveSection] = useState("home");
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const checkMobileOverflow = () => {
      if (window.innerWidth > 760) return;
      const hasOverflow = document.documentElement.scrollWidth > window.innerWidth + 1;
      document.documentElement.dataset.mobileOverflow = hasOverflow ? "true" : "false";
      if (hasOverflow) console.warn("Mobile layout overflow detected");
    };
    const timer = window.setTimeout(checkMobileOverflow, 350);
    window.addEventListener("resize", checkMobileOverflow);
    window.addEventListener("load", checkMobileOverflow);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", checkMobileOverflow);
      window.removeEventListener("load", checkMobileOverflow);
    };
  }, []);
  const t = copy[language];
  const standaloneContent = useStandaloneContentSnapshot();
  const contentQuery = trpc.content.useQuery(undefined, { enabled: !isStandaloneSite() });
  const contentData = standaloneContent ?? contentQuery.data;
  const contentProfile = contentData?.profile;
  const defaultCoverKey = contentProfile && "defaultCoverKey" in contentProfile ? contentProfile.defaultCoverKey : null;
  const defaultCoverUrl = contentProfile && "defaultCoverUrl" in contentProfile ? contentProfile.defaultCoverUrl : null;
  const defaultProjectCover = resolveProjectImage(defaultCoverKey, defaultCoverUrl) || defaultArticleCover;
  const displayedProjects: Project[] = contentData?.projects?.length
    ? contentData.projects.map((project) => {
        const imageKey = "imageKey" in project ? project.imageKey : null;
        const imageUrl = "imageUrl" in project ? project.imageUrl : null;
        return {
        id: project.id,
        title: project.titleEn,
        titleAr: project.titleAr,
        description: project.descriptionEn,
        descriptionAr: project.descriptionAr,
        type: project.typeEn,
        typeAr: project.typeAr,
        category: project.category === "tutorials" || project.category === "videos" ? project.category : "applications",
        image: resolveProjectImage(imageKey, imageUrl),
        imageFallback: defaultProjectCover,
        href: project.href,
        media: (project.media ?? []).map((item) => {
          const sourceUrl = "sourceUrl" in item && typeof item.sourceUrl === "string" ? item.sourceUrl : null;
          return {
            id: item.id,
            kind: item.kind,
            source: resolveProjectImage(null, sourceUrl ?? item.source),
            placement: item.placement,
            captionEn: item.captionEn,
            captionAr: item.captionAr,
            sortOrder: item.sortOrder,
          };
        }),
        comments: project.comments,
      };
      })
    : projects;
  const displayedProfiles: ProfileItem[] = contentData?.socialLinks?.length
    ? contentData.socialLinks.map(presentSocialLink)
    : profiles;
  const displayName = contentProfile?.name ?? "Khairy Eid Aly";
  const displayRole = language === "ar" ? contentProfile?.roleAr : contentProfile?.roleEn;
  const displayBio = language === "ar" ? contentProfile?.bioAr : contentProfile?.bioEn;
  const displayLocation = language === "ar" ? contentProfile?.locationAr : contentProfile?.locationEn;
  const portraitKey = contentProfile && "portraitKey" in contentProfile ? contentProfile.portraitKey : null;
  const coverKey = contentProfile && "coverKey" in contentProfile ? contentProfile.coverKey : null;
  const portraitUrl = contentProfile && "portraitUrl" in contentProfile ? contentProfile.portraitUrl : null;
  const coverUrl = contentProfile && "coverUrl" in contentProfile ? contentProfile.coverUrl : null;
  const portraitSrc = resolveProjectImage(portraitKey, portraitUrl) || publicAssetPath("assets/khairy-profile-portrait.webp");
  const coverSrc = resolveProjectImage(coverKey, coverUrl) || publicAssetPath("assets/khairy-profile-cover.webp");
  const emailSubject = language === "ar" ? "تواصل بخصوص مشروع رقمي" : "Hello Khairy — Digital Project";
  const emailBody = language === "ar"
    ? "مرحبًا خيري،\n\nأرغب في مناقشة مشروع رقمي معك.\n\nالاسم:\nفكرة المشروع:\nالميزانية أو الإطار الزمني:\n\nشكرًا لك."
    : "Hi Khairy,\n\nI’d like to discuss a digital project with you.\n\nName:\nProject idea:\nBudget or timeline:\n\nThank you.";
  const emailHref = `mailto:khairy.eldelar5@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    if (shouldPersistProfileLanguage(window.location.search)) localStorage.setItem("khairy-language", language);
  }, [language]);

  useEffect(() => {
    const sections = navItems
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target instanceof HTMLElement) setActiveSection(visible.target.id);
      },
      { rootMargin: "-25% 0px -60% 0px", threshold: [0.1, 0.25, 0.5] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="app-shell">
      <header className="site-header" aria-label="Site header">
        <button className="brand-lockup" onClick={() => scrollToId("home")} aria-label="Back to home">
          <span className="brand-emblem" aria-hidden="true">
            <img className="brand-mark" src={publicAssetPath("assets/khairy-mark.svg")} alt="" />
            <span className="brand-glyph brand-glyph-header"><span className="glyph-stroke glyph-stroke-a" /><span className="glyph-stroke glyph-stroke-b" /><span className="glyph-cut" /></span>
          </span>
          <span className="brand-word">KHAIRY <span>EID ALY</span></span>
        </button>
        <div className="header-meta">
          <span className="online-pulse" aria-hidden="true" />
          <span>{t.digitalProfile}</span>
        </div>
        <button
          className="theme-switch"
          type="button"
          onClick={() => toggleTheme?.()}
          aria-label={language === "ar" ? (theme === "dark" ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الليلي") : (theme === "dark" ? "Switch to light mode" : "Switch to dark mode")}
          title={language === "ar" ? (theme === "dark" ? "الوضع الفاتح" : "الوضع الليلي") : (theme === "dark" ? "Light mode" : "Dark mode")}
        >
          {theme === "dark" ? <Sun size={16} strokeWidth={1.8} /> : <Moon size={16} strokeWidth={1.8} />}
        </button>
        <button className="language-switch" onClick={() => setLanguage(language === "en" ? "ar" : "en")} aria-label={t.languageLabel}>
          <Languages size={15} strokeWidth={1.8} />
          <span>{t.languageName}</span>
        </button>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={activeSection === item.id ? "nav-link active" : "nav-link"}
              onClick={() => scrollToId(item.id)}
            >
              {language === "ar" ? item.labelAr : item.labelEn}
            </button>
          ))}
        </nav>
      </header>

      <main className="page-wrap">
        <section id="home" className="profile-card reveal" aria-labelledby="profile-name">
          <div className="profile-cover" aria-hidden="true">
            <img
              src={coverSrc}
              alt=""
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = publicAssetPath("assets/khairy-profile-cover.webp");
              }}
            />
          </div>
          <div className="profile-hero profile-hero-refined">
            <div className="portrait-wrap">
              <img
                className="portrait"
                src={portraitSrc}
                alt="Portrait of Khairy Eid Aly"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = publicAssetPath("assets/khairy-profile-portrait.webp");
                }}
              />
              <span className="portrait-status" aria-label="Available" />
            </div>
            <div className="profile-copy">
              <div className="profile-name-row">
                <h1 id="profile-name" className="profile-name">{displayName}</h1>
                <span className="verified-badge" aria-label={language === "ar" ? "حساب موثق" : "Verified profile"} title={language === "ar" ? "موثق" : "Verified"}>
                  <BadgeCheck size={22} strokeWidth={2.2} aria-hidden="true" />
                </span>
              </div>
              <p className="profile-role">{displayRole ?? `${t.role} • ${t.creator} • ${t.projects}`}</p>
              <p className="profile-bio">{displayBio ?? t.bio}</p>
            </div>
          </div>

          <div className="meta-strip" aria-label="Focus areas">
            <span className="meta-item"><strong>{t.role}</strong></span>
            <span className="meta-divider" aria-hidden="true">—</span>
            <span className="meta-item"><strong>{t.creator}</strong></span>
            <span className="meta-divider" aria-hidden="true">—</span>
            <span className="meta-item"><strong>{t.projects}</strong></span>
          </div>
        </section>

        <div className="section-flow">
          <WorkShowcase projects={displayedProjects} language={language} copy={t} category="applications" sectionId="work" />
          <WorkShowcase projects={displayedProjects} language={language} copy={t} category="tutorials" sectionId="tutorials" />
          <WorkShowcase projects={displayedProjects} language={language} copy={t} category="videos" sectionId="videos" />

        <section id="profiles" className="content-section reveal reveal-delay-2" aria-labelledby="profiles-title">
          <div className="section-heading compact">
            <div>
              <p className="section-kicker">{t.findMe}</p>
              <h2 id="profiles-title">{t.profilesTitle}</h2>
            </div>
            <span className="section-symbol">↘</span>
          </div>
          <div className="profiles-card profiles-grid-card">
            {displayedProfiles.map((profile, index) => {
              const Icon = profile.icon;
              return (
                <a className="profile-row profile-tile" key={profile.name} href={profile.name === "Email" ? emailHref : profile.href} target={profile.name === "Email" ? undefined : "_blank"} rel={profile.name === "Email" ? undefined : "noreferrer"}>
                  <span className="profile-row-index">0{index + 1}</span>
                  <span className="profile-row-icon"><Icon size={18} strokeWidth={1.8} /></span>
                  <span className="profile-row-copy"><strong>{language === "ar" ? (profile.nameAr || profile.name) : profile.name}</strong><small>{language === "ar" ? profile.handleAr : profile.handle}</small></span>
                  <ArrowUpRight className="profile-row-arrow" size={18} strokeWidth={1.7} />
                </a>
              );
            })}
          </div>
        </section>

        </div>
      </main>
      <footer className="site-footer">
        <span>© 2026 Khairy Eid Aly</span>
      </footer>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navItems.map((item) => (
          <button key={item.id} className={activeSection === item.id ? "mobile-nav-item active" : "mobile-nav-item"} onClick={() => scrollToId(item.id)}>
            <span className="mobile-nav-dot" />
            {language === "ar" ? item.labelAr : item.labelEn}
          </button>
        ))}
      </nav>
    </div>
  );
}
