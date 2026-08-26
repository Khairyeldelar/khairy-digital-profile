/*
 * Design philosophy: Quiet Swiss Card — a calm editorial digital identity with generous whitespace,
 * one owned Burnt Coral accent, compact content, tactile cards, and application-like navigation.
 */
import { useEffect, useRef, useState } from "react";
import { ProjectCardTrigger } from "@/components/ProjectCardTrigger";
import { ProjectDetailsDialog } from "@/components/ProjectDetailsDialog";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  ArrowRight,
  ArrowUpRight,
  Facebook,
  Github,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Youtube,
  Languages,
} from "lucide-react";

type Language = "en" | "ar";

type ProfileItem = {
  name: string;
  handle: string;
  handleAr: string;
  href: string;
  icon: typeof Github;
};

type Project = {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  type: string;
  typeAr: string;
  image: string;
  href: string;
};

const projects: Project[] = [
  {
    title: "Nova Notes",
    titleAr: "نوفا نوتس",
    description: "A calmer way to capture ideas and keep them moving.",
    descriptionAr: "طريقة أهدأ لالتقاط الأفكار وإبقائها في حركة.",
    type: "Product system",
    typeAr: "نظام منتج",
    image: "",
    href: "https://github.com/",
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

const iconByPlatform = { Github, Linkedin, Facebook, Instagram, Youtube, Mail } as const;

const storageAsset = (key?: string | null) => {
  if (!key) return "";
  return key.startsWith("/manus-storage/") ? key : `/manus-storage/${key}`;
};

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
    selectedWork: "02 / Selected work",
    workTitle: "Small digital worlds,",
    workTitleEm: "made with care.",
    workAside: "A few things I have been shaping lately.",
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
    selectedWork: "02 / أعمال مختارة",
    workTitle: "عوالم رقمية صغيرة،",
    workTitleEm: "مصنوعة بعناية.",
    workAside: "بعض الأشياء التي أعمل على تشكيلها مؤخرًا.",
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
  },
};

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  // The useAuth hook provides authentication state.
  // To implement login/logout, call logout(), or start login from an event
  // handler: onClick={() => startLogin()} (imported from "@/const"). Never call
  // startLogin() during render (no href={startLogin()}) — it mints a one-time
  // nonce cookie and must run only at the moment of navigation.
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("khairy-language");
    return saved === "en" ? "en" : "ar";
  });
  const [activeSection, setActiveSection] = useState("home");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const projectTriggerRef = useRef<HTMLButtonElement | null>(null);

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
  const contentQuery = trpc.content.useQuery();
  const contentProfile = contentQuery.data?.profile;
  const displayedProjects: Project[] = contentQuery.data?.projects?.length
    ? contentQuery.data.projects.map((project) => ({
        title: project.titleEn,
        titleAr: project.titleAr,
        description: project.descriptionEn,
        descriptionAr: project.descriptionAr,
        type: project.typeEn,
        typeAr: project.typeAr,
        image: storageAsset(project.imageKey),
        href: project.href,
      }))
    : projects;
  const displayedProfiles: ProfileItem[] = contentQuery.data?.socialLinks?.length
    ? contentQuery.data.socialLinks.map((link) => ({
        name: link.platform,
        handle: link.handleEn,
        handleAr: link.handleAr,
        href: link.href,
        icon: iconByPlatform[link.platform as keyof typeof iconByPlatform] ?? Mail,
      }))
    : profiles;
  const displayName = contentProfile?.name ?? "Khairy Eid Aly";
  const displayRole = language === "ar" ? contentProfile?.roleAr : contentProfile?.roleEn;
  const displayBio = language === "ar" ? contentProfile?.bioAr : contentProfile?.bioEn;
  const displayLocation = language === "ar" ? contentProfile?.locationAr : contentProfile?.locationEn;
  const portraitSrc = storageAsset(contentProfile?.portraitKey) || "/manus-storage/khairy-profile-portrait_8e111237.png";
  const coverSrc = storageAsset(contentProfile?.coverKey) || "/manus-storage/khairy-profile-cover_01195ff9.png";
  const emailSubject = language === "ar" ? "تواصل بخصوص مشروع رقمي" : "Hello Khairy — Digital Project";
  const emailBody = language === "ar"
    ? "مرحبًا خيري،\n\nأرغب في مناقشة مشروع رقمي معك.\n\nالاسم:\nفكرة المشروع:\nالميزانية أو الإطار الزمني:\n\nشكرًا لك."
    : "Hi Khairy,\n\nI’d like to discuss a digital project with you.\n\nName:\nProject idea:\nBudget or timeline:\n\nThank you.";
  const emailHref = `mailto:khairy.eldelar5@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    localStorage.setItem("khairy-language", language);
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
            <img className="brand-mark" src="/assets/khairy-mark.svg" alt="" />
            <span className="brand-glyph brand-glyph-header"><span className="glyph-stroke glyph-stroke-a" /><span className="glyph-stroke glyph-stroke-b" /><span className="glyph-cut" /></span>
          </span>
          <span className="brand-word">KHAIRY <span>EID ALY</span></span>
        </button>
        <div className="header-meta">
          <span className="online-pulse" aria-hidden="true" />
          <span>{t.digitalProfile}</span>
        </div>
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
                event.currentTarget.src = "/assets/khairy-profile-cover.webp";
              }}
            />
          </div>
          <div className="profile-topline">
            <span className="eyebrow"><span className="eyebrow-line" /> {t.personalCard}</span>
            <span className="availability"><span className="availability-dot" /> {t.availability}</span>
          </div>

          <div className="identity-seal" aria-label="Khairy Eid Aly mark">
            <span className="brand-glyph brand-glyph-seal" aria-hidden="true"><span className="glyph-stroke glyph-stroke-a" /><span className="glyph-stroke glyph-stroke-b" /><span className="glyph-cut" /></span>
            <span>K / E</span>
          </div>

          <div className="profile-hero">
            <div className="portrait-wrap">
              <img
                className="portrait"
                src={portraitSrc}
                alt="Portrait of Khairy Eid Aly"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = "/assets/khairy-profile-portrait.webp";
                }}
              />
              <span className="portrait-status" aria-label="Available" />
            </div>
            <div className="profile-copy">
              <p className="profile-kicker">{displayLocation ?? t.location}</p>
              <h1 id="profile-name" className="profile-name">{displayName}</h1>
              <p className="profile-role">{displayRole ?? `${t.role} • ${t.creator} • ${t.projects}`}</p>
              <p className="profile-bio">{displayBio ?? t.bio}</p>
              <div className="profile-actions">
                <button className="action action-primary" onClick={() => scrollToId("work")}>
                  {t.myWork} <ArrowRight size={16} strokeWidth={1.9} />
                </button>
                <button className="action action-secondary" onClick={() => scrollToId("contact")}>
                  {t.contactMe} <ArrowUpRight size={16} strokeWidth={1.9} />
                </button>
              </div>
            </div>
          </div>

          <div className="meta-strip" aria-label="Focus areas">
            <div className="meta-item">
              <span className="meta-index">01</span>
              <span className="meta-label">{t.focus}</span>
              <strong>{t.role}</strong>
            </div>
            <div className="meta-item">
              <span className="meta-index">02</span>
              <span className="meta-label">{t.making}</span>
              <strong>{t.creator}</strong>
            </div>
            <div className="meta-item">
              <span className="meta-index">03</span>
              <span className="meta-label">{t.direction}</span>
              <strong>{t.projects}</strong>
            </div>
          </div>

          <div className="profile-footer">
            <span className="footer-note"><MapPin size={14} /> {t.building}</span>
            <span className="footer-number">K / E <span>•</span> 001</span>
          </div>
        </section>

        <section id="work" className="content-section reveal reveal-delay-1" aria-labelledby="work-title">
          <div className="section-heading">
            <div>
              <p className="section-kicker">{t.selectedWork}</p>
              <h2 id="work-title">{t.workTitle}<br /><em>{t.workTitleEm}</em></h2>
            </div>
            <p className="section-aside">{t.workAside}</p>
          </div>
          <div className="work-rail" aria-label="Selected work projects">
            {displayedProjects.map((project, index) => (
              <article className="project-card" key={project.title} style={{ animationDelay: `${index * 70 + 150}ms` }}>
                <ProjectCardTrigger
                  onOpen={(button) => { projectTriggerRef.current = button; setSelectedProject(project); }}
                  label={`${t.viewProject}: ${language === "ar" ? project.titleAr : project.title}`}
                >
                  <div className={`project-image-wrap project-art-${index + 1}`}>
                    <div className="project-art-fallback" aria-hidden="true"><span className="project-art-line line-a" /><span className="project-art-line line-b" /><span className="project-art-orb" /></div>
                    {project.image && <img className="project-image" src={project.image} alt={`${project.title} project preview`} onError={(event) => { event.currentTarget.style.display = "none"; }} />}
                    <span className="project-view"><ArrowUpRight size={17} /></span>
                  </div>
                  <div className="project-body">
                    <div className="project-row">
                      <h3>{language === "ar" ? project.titleAr : project.title}</h3>
                    </div>
                    <span className="project-open-label">{project.href ? t.visitShort : t.viewProject}</span>
                  </div>
                </ProjectCardTrigger>
              </article>
            ))}
          </div>
        </section>

        <ProjectDetailsDialog
          project={selectedProject}
          projectIndex={selectedProject ? displayedProjects.findIndex((item) => item.title === selectedProject.title) : 0}
          language={language}
          visitLabel={t.visitProject}
          open={Boolean(selectedProject)}
          onOpenChange={(open) => { if (!open) setSelectedProject(null); }}
          returnFocusRef={projectTriggerRef}
        />

        <section id="profiles" className="content-section reveal reveal-delay-2" aria-labelledby="profiles-title">
          <div className="section-heading compact">
            <div>
              <p className="section-kicker">{t.findMe}</p>
              <h2 id="profiles-title">{t.profilesTitle}</h2>
            </div>
            <span className="section-symbol">↘</span>
          </div>
          <div className="profiles-card">
            {displayedProfiles.map((profile, index) => {
              const Icon = profile.icon;
              return (
                <a className="profile-row" key={profile.name} href={profile.name === "Email" ? emailHref : profile.href} target={profile.name === "Email" ? undefined : "_blank"} rel={profile.name === "Email" ? undefined : "noreferrer"}>
                  <span className="profile-row-index">0{index + 1}</span>
                  <span className="profile-row-icon"><Icon size={18} strokeWidth={1.8} /></span>
                  <span className="profile-row-copy"><strong>{profile.name}</strong><small>{language === "ar" ? profile.handleAr : profile.handle}</small></span>
                  <ArrowUpRight className="profile-row-arrow" size={18} strokeWidth={1.7} />
                </a>
              );
            })}
          </div>
        </section>

        <div className="about-grid">
          <section id="about" className="about-card reveal reveal-delay-2" aria-labelledby="about-title">
            <div className="about-card-top"><span className="section-kicker">{t.aboutKicker}</span><span className="about-mark">K</span></div>
            <h2 id="about-title">{t.aboutTitle}</h2>
            <p>{t.aboutText}</p>
            <span className="about-signature">Khairy Eid Aly <span>↗</span></span>
          </section>

          <section id="contact" className="contact-card reveal reveal-delay-3" aria-labelledby="contact-title">
            <div className="contact-icon"><Mail size={20} strokeWidth={1.7} /></div>
            <p className="section-kicker">{t.contactKicker}</p>
            <h2 id="contact-title">{t.contactTitle}<br /><em>{t.contactTitleEm}</em></h2>
            <a className="contact-link" href={emailHref}>khairy.eldelar5@gmail.com <ArrowUpRight size={16} /></a>
          </section>
        </div>
      </main>

      <footer className="site-footer">
        <span>© 2026 Khairy Eid Aly</span>
        <span>{t.footer} <span className="accent-dot">•</span></span>
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
