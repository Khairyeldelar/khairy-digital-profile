// @vitest-environment jsdom
import React, { useRef, useState } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ProjectCardTrigger } from "./ProjectCardTrigger";
import { ProjectDetailsDialog, type ProjectDetails } from "./ProjectDetailsDialog";

const project: ProjectDetails = {
  title: "Nova Notes",
  titleAr: "نوفا نوتس",
  description: "A calmer way to capture ideas.",
  descriptionAr: "طريقة أهدأ لالتقاط الأفكار.",
  type: "Product system",
  typeAr: "نظام منتج",
  image: "",
  href: "https://example.com",
};

function ProjectDialogHarness() {
  const [open, setOpen] = useState(false);
  const returnFocusRef = useRef<HTMLButtonElement | null>(null);
  return (
    <>
      <ProjectCardTrigger label="مشاهدة: نوفا نوتس" onOpen={(button) => { returnFocusRef.current = button; setOpen(true); }}>
        <span>نوفا نوتس</span>
      </ProjectCardTrigger>
      <ProjectDetailsDialog project={project} projectIndex={0} language="ar" visitLabel="الذهاب إلى المشروع" open={open} onOpenChange={setOpen} returnFocusRef={returnFocusRef} />
    </>
  );
}

describe("ProjectDetailsDialog keyboard flow", () => {
  it("opens from the card button and closes with Escape", async () => {
    const user = userEvent.setup();
    render(<ProjectDialogHarness />);

    const trigger = screen.getByRole("button", { name: "مشاهدة: نوفا نوتس" });
    await user.tab();
    await user.keyboard("{Enter}");
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeTruthy();
    expect(within(dialog).getByText("نوفا نوتس")).toBeTruthy();

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(document.activeElement).toBe(trigger);
  });
});
