import React from "react";

type ProjectCardTriggerProps = {
  label: string;
  onOpen: (button: HTMLButtonElement) => void;
  children: React.ReactNode;
};

export function ProjectCardTrigger({ label, onOpen, children }: ProjectCardTriggerProps) {
  return (
    <button type="button" className="project-open-button" onClick={(event) => onOpen(event.currentTarget)} aria-label={label}>
      {children}
    </button>
  );
}
