import { Facebook, Github, Instagram, Linkedin, Mail, Youtube } from "lucide-react";

const iconByPlatform = { Github, LinkedIn: Linkedin, Facebook, Instagram, YouTube: Youtube, Email: Mail } as const;

type SocialLinkRecord = {
  platform: string;
  platformEn?: string | null;
  platformAr?: string | null;
  handleEn: string;
  handleAr: string;
  href: string;
};

export function presentSocialLink(link: SocialLinkRecord) {
  return {
    name: link.platformEn || link.platform,
    nameAr: link.platformAr || link.platformEn || link.platform,
    handle: link.handleEn,
    handleAr: link.handleAr,
    href: link.href,
    icon: iconByPlatform[link.platform as keyof typeof iconByPlatform] ?? Mail,
  };
}
