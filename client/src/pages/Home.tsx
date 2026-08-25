/*
 * Design philosophy: Quiet Swiss Card — a calm editorial digital identity with generous whitespace,
 * one owned Burnt Coral accent, compact content, tactile cards, and application-like navigation.
 */
import { useEffect, useState } from "react";
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
} from "lucide-react";

type ProfileItem = {
  name: string;
  handle: string;
  href: string;
  icon: typeof Github;
};

type Project = {
  title: string;
  description: string;
  type: string;
  image: string;
  href: string;
};

const projects: Project[] = [
  {
    title: "Nova Notes",
    description: "A calmer way to capture ideas and keep them moving.",
    type: "Product system",
    image: "/manus-storage/project-nova_c6a1f9ba.jpg",
    href: "https://github.com/",
  },
  {
    title: "Signal Studio",
    description: "A compact visual toolkit for thoughtful content.",
    type: "Creator toolkit",
    image: "/manus-storage/project-signal_5ef777fa.jpg",
    href: "https://www.behance.net/",
  },
  {
    title: "Atlas Flow",
    description: "Turning complex digital journeys into simple paths.",
    type: "Digital direction",
    image: "/manus-storage/project-atlas_0382e072.jpg",
    href: "https://dribbble.com/",
  },
];

const profiles: ProfileItem[] = [
  { name: "GitHub", handle: "Code, experiments & builds", href: "https://github.com/", icon: Github },
  { name: "LinkedIn", handle: "Work, notes & connections", href: "https://www.linkedin.com/", icon: Linkedin },
  { name: "Facebook", handle: "A little more of the human side", href: "https://www.facebook.com/", icon: Facebook },
  { name: "Instagram", handle: "Visual notes from the process", href: "https://www.instagram.com/", icon: Instagram },
  { name: "YouTube", handle: "Ideas in motion", href: "https://www.youtube.com/", icon: Youtube },
  { name: "Email", handle: "Say hello directly", href: "mailto:hello@khairy.dev", icon: Mail },
];

const navItems = [
  { id: "home", label: "Home" },
  { id: "work", label: "Work" },
  { id: "profiles", label: "Profiles" },
  { id: "contact", label: "Contact" },
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const [activeSection, setActiveSection] = useState("home");

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
            <img className="brand-mark" src="/manus-storage/khairy-mark_46e99a1a.png" alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} />
            <span className="brand-glyph brand-glyph-header"><span className="glyph-stroke glyph-stroke-a" /><span className="glyph-stroke glyph-stroke-b" /><span className="glyph-cut" /></span>
          </span>
          <span className="brand-word">KHAIRY <span>EID ALY</span></span>
        </button>
        <div className="header-meta">
          <span className="online-pulse" aria-hidden="true" />
          <span>Digital profile</span>
        </div>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={activeSection === item.id ? "nav-link active" : "nav-link"}
              onClick={() => scrollToId(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="page-wrap">
        <section id="home" className="profile-card reveal" aria-labelledby="profile-name">
          <div className="profile-topline">
            <span className="eyebrow"><span className="eyebrow-line" /> Personal card / 01</span>
            <span className="availability"><span className="availability-dot" /> Open to good ideas</span>
          </div>

          <div className="identity-seal" aria-label="Khairy Eid Aly mark">
            <span className="brand-glyph brand-glyph-seal" aria-hidden="true"><span className="glyph-stroke glyph-stroke-a" /><span className="glyph-stroke glyph-stroke-b" /><span className="glyph-cut" /></span>
            <span>K / E</span>
          </div>

          <div className="profile-hero">
            <div className="portrait-wrap">
              <img
                className="portrait"
                src="/manus-storage/khairy-portrait-anchor_f5c4ca38.jpg"
                alt="Portrait of Khairy Eid Aly"
              />
              <span className="portrait-status" aria-label="Available" />
            </div>
            <div className="profile-copy">
              <p className="profile-kicker">Cairo · Remote · 2026</p>
              <h1 id="profile-name" className="profile-name">Khairy Eid Aly</h1>
              <p className="profile-role">Developer <span>•</span> Creator <span>•</span> Digital Projects</p>
              <p className="profile-bio">I turn ideas into clear, useful digital experiences — with a little character.</p>
              <div className="profile-actions">
                <button className="action action-primary" onClick={() => scrollToId("work")}>
                  My Work <ArrowRight size={16} strokeWidth={1.9} />
                </button>
                <button className="action action-secondary" onClick={() => scrollToId("contact")}>
                  Contact Me <ArrowUpRight size={16} strokeWidth={1.9} />
                </button>
              </div>
            </div>
          </div>

          <div className="meta-strip" aria-label="Focus areas">
            <div className="meta-item">
              <span className="meta-index">01</span>
              <span className="meta-label">Focus</span>
              <strong>Developer</strong>
            </div>
            <div className="meta-item">
              <span className="meta-index">02</span>
              <span className="meta-label">Making</span>
              <strong>Content Creator</strong>
            </div>
            <div className="meta-item">
              <span className="meta-index">03</span>
              <span className="meta-label">Direction</span>
              <strong>Digital Projects</strong>
            </div>
          </div>

          <div className="profile-footer">
            <span className="footer-note"><MapPin size={14} /> Building from curiosity</span>
            <span className="footer-number">K / E <span>•</span> 001</span>
          </div>
        </section>

        <section id="work" className="content-section reveal reveal-delay-1" aria-labelledby="work-title">
          <div className="section-heading">
            <div>
              <p className="section-kicker">02 / Selected work</p>
              <h2 id="work-title">Small digital worlds,<br /><em>made with care.</em></h2>
            </div>
            <p className="section-aside">A few things I have been shaping lately.</p>
          </div>
          <div className="work-rail" aria-label="Selected work projects">
            {projects.map((project, index) => (
              <article className="project-card" key={project.title} style={{ animationDelay: `${index * 70 + 150}ms` }}>
                <a className="project-image-link" href={project.href} target="_blank" rel="noreferrer" aria-label={`View ${project.title}`}>
                  <div className={`project-image-wrap project-art-${index + 1}`}>
                    <div className="project-art-fallback" aria-hidden="true"><span className="project-art-line line-a" /><span className="project-art-line line-b" /><span className="project-art-orb" /></div>
                    <img className="project-image" src={project.image} alt={`${project.title} project preview`} onError={(event) => { event.currentTarget.style.display = "none"; }} />
                    <span className="project-cover-label">{project.type}</span>
                    <span className="project-view"><ArrowUpRight size={17} /></span>
                  </div>
                </a>
                <div className="project-body">
                  <div className="project-row">
                    <h3>{project.title}</h3>
                    <span className="project-count">0{index + 1}</span>
                  </div>
                  <p>{project.description}</p>
                  <span className="project-type">{project.type}</span>
                </div>
              </article>
            ))}
          </div>
          <p className="rail-hint"><span>Swipe to explore</span><ArrowRight size={15} /> <span>or drag the rail</span></p>
        </section>

        <section id="profiles" className="content-section reveal reveal-delay-2" aria-labelledby="profiles-title">
          <div className="section-heading compact">
            <div>
              <p className="section-kicker">03 / Find me around</p>
              <h2 id="profiles-title">My Profiles</h2>
            </div>
            <span className="section-symbol">↘</span>
          </div>
          <div className="profiles-card">
            {profiles.map((profile, index) => {
              const Icon = profile.icon;
              return (
                <a className="profile-row" key={profile.name} href={profile.href} target={profile.name === "Email" ? undefined : "_blank"} rel={profile.name === "Email" ? undefined : "noreferrer"}>
                  <span className="profile-row-index">0{index + 1}</span>
                  <span className="profile-row-icon"><Icon size={18} strokeWidth={1.8} /></span>
                  <span className="profile-row-copy"><strong>{profile.name}</strong><small>{profile.handle}</small></span>
                  <ArrowUpRight className="profile-row-arrow" size={18} strokeWidth={1.7} />
                </a>
              );
            })}
          </div>
        </section>

        <div className="about-grid">
          <section id="about" className="about-card reveal reveal-delay-2" aria-labelledby="about-title">
            <div className="about-card-top"><span className="section-kicker">A little context</span><span className="about-mark">K</span></div>
            <h2 id="about-title">About Me</h2>
            <p>I like the space where technology meets a clear point of view. I build, document, and refine digital ideas until they feel simple to use.</p>
            <span className="about-signature">Khairy Eid Aly <span>↗</span></span>
          </section>

          <section id="contact" className="contact-card reveal reveal-delay-3" aria-labelledby="contact-title">
            <div className="contact-icon"><Mail size={20} strokeWidth={1.7} /></div>
            <p className="section-kicker">04 / Contact</p>
            <h2 id="contact-title">Have a good idea?<br /><em>Let’s make it useful.</em></h2>
            <a className="contact-link" href="mailto:hello@khairy.dev">hello@khairy.dev <ArrowUpRight size={16} /></a>
          </section>
        </div>
      </main>

      <footer className="site-footer">
        <span>© 2026 Khairy Eid Aly</span>
        <span>Made for the next good idea <span className="accent-dot">•</span></span>
      </footer>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navItems.map((item) => (
          <button key={item.id} className={activeSection === item.id ? "mobile-nav-item active" : "mobile-nav-item"} onClick={() => scrollToId(item.id)}>
            <span className="mobile-nav-dot" />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
