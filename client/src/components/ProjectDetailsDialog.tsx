import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProjectImage } from "@/components/ProjectImage";
import { ArrowUpRight } from "lucide-react";

export type ProjectDetails = {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  type: string;
  typeAr: string;
  image: string;
  imageFallback?: string;
  href: string;
};

type ProjectDetailsDialogProps = {
  project: ProjectDetails | null;
  projectIndex: number;
  language: "ar" | "en";
  visitLabel: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnFocusRef: React.MutableRefObject<HTMLButtonElement | null>;
};

export function ProjectDetailsDialog({ project, projectIndex, language, visitLabel, open, onOpenChange, returnFocusRef }: ProjectDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="project-dialog"
        dir={language === "ar" ? "rtl" : "ltr"}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusRef.current?.focus();
        }}
      >
        {project && (
          <>
            <div className="project-dialog-image-wrap">
              <div className={`project-image-wrap project-art-${(projectIndex % 3) + 1}`}>
                <div className="project-art-fallback" aria-hidden="true"><span className="project-art-line line-a" /><span className="project-art-line line-b" /><span className="project-art-orb" /></div>
                <ProjectImage src={project.image} fallbackSrc={project.imageFallback} className="project-image" alt={`${project.title} project preview`} />
              </div>
            </div>
            <DialogHeader>
              <DialogTitle>{language === "ar" ? project.titleAr : project.title}</DialogTitle>
              <DialogDescription>{language === "ar" ? project.descriptionAr : project.description}</DialogDescription>
            </DialogHeader>
            <p className="project-dialog-type">{language === "ar" ? project.typeAr : project.type}</p>
            {project && (
              <DialogFooter>
                <a className="action action-primary project-dialog-link" href={`/article/${encodeURIComponent(project.title)}`}>
                  {language === "ar" ? "دخول إلى الصفحة" : "Open content"} <ArrowUpRight size={16} strokeWidth={1.9} />
                </a>
              </DialogFooter>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
