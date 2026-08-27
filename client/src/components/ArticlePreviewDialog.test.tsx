// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ArticlePreviewDialog } from "./ArticlePreviewDialog";

describe("ArticlePreviewDialog", () => {
  it("renders the unsaved title, summary, rich text, and links before publishing", () => {
    render(<ArticlePreviewDialog open onOpenChange={() => {}} title="شرح كامل" summary="ملخص المقال" body={'<h2>خطوة أولى</h2><p>نص <strong>منسق</strong></p><p><a href="https://example.com">رابط</a></p>'} />);

    expect(screen.getByText("معاينة قبل النشر · مشاركة")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "شرح كامل" })).toBeTruthy();
    expect(screen.getByText("خطوة أولى")).toBeTruthy();
    expect(screen.getByText("منسق").tagName).toBe("STRONG");
    expect(screen.getByRole("link", { name: "رابط" }).getAttribute("href")).toBe("https://example.com");
  });
});
