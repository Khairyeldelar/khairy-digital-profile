// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { WorkShowcase, type Project } from "./Home";

const projects: Project[] = [
  {
    title: "App Project",
    titleAr: "مشروع تطبيق",
    description: "An application project.",
    descriptionAr: "مشروع تطبيق.",
    type: "Application",
    typeAr: "تطبيق",
    image: "",
    href: "https://example.com/app",
    category: "applications",
  },
  {
    title: "Tutorial Project",
    titleAr: "مشروع شرح",
    description: "A tutorial project.",
    descriptionAr: "مشروع شرح.",
    type: "Tutorial",
    typeAr: "شرح",
    image: "",
    href: "https://example.com/tutorial",
    category: "tutorials",
  },
  {
    title: "Video Project",
    titleAr: "مشروع فيديو",
    description: "A video project.",
    descriptionAr: "مشروع فيديو.",
    type: "Video",
    typeAr: "فيديو",
    image: "https://cdn.example/video-uploaded.png",
    href: "https://example.com/video",
    category: "videos",
  },
];

const copy = {
  workTitle: "My Work",
  workCategoryLabel: "Work category",
  emptyCategory: "New work is coming soon.",
  viewProject: "View",
  visitProject: "Go to project",
  visitShort: "Visit",
};

describe("WorkShowcase category interaction", () => {
  afterEach(() => cleanup());

  it("switches categories and only shows the selected category card", async () => {
    const user = userEvent.setup();
    render(<WorkShowcase projects={projects} language="en" copy={copy} />);

    expect(screen.getByText("App Project")).toBeTruthy();
    expect(screen.queryByText("Tutorial Project")).toBeNull();

    await user.click(screen.getByRole("tab", { name: /Tutorials/ }));

    expect(screen.getByText("Tutorial Project")).toBeTruthy();
    expect(screen.queryByText("App Project")).toBeNull();
    expect(screen.queryByText("Video Project")).toBeNull();
  });

  it("opens tutorial cards in the shared details dialog with a content-page link", async () => {
    const user = userEvent.setup();
    render(<WorkShowcase projects={projects} language="en" copy={copy} category="tutorials" sectionId="tutorials" />);

    await user.click(screen.getByRole("button", { name: /Read: Tutorial Project/ }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Tutorial Project")).toBeTruthy();
    expect(within(dialog).getByRole("link", { name: /Open content/ }).getAttribute("href")).toBe("/article/Tutorial%20Project");
  });

  it("opens video cards in the shared details dialog with a content-page link", async () => {
    const user = userEvent.setup();
    render(<WorkShowcase projects={projects} language="en" copy={copy} />);

    await user.click(screen.getByRole("tab", { name: /Videos/ }));
    expect(screen.getByRole("img", { name: "Video Project project preview" }).getAttribute("src")).toBe("https://cdn.example/video-uploaded.png");
    await user.click(screen.getByRole("button", { name: /View: Video Project/ }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Video Project")).toBeTruthy();
    expect(within(dialog).getByRole("link", { name: /Open content/ }).getAttribute("href")).toBe("/article/Video%20Project");
  });
});
