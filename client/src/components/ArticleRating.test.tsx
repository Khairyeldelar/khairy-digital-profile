// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { ArticleRating } from "./ArticleRating";

describe("ArticleRating", () => {
  beforeEach(() => window.localStorage.clear());

  it("allows selecting a rating from one to five stars and saves the selected value", () => {
    render(<ArticleRating articleKey="battery-tips" language="ar" />);

    fireEvent.click(screen.getByRole("button", { name: "4 نجمة" }));

    expect(screen.getByText("تم اختيار 4 من 5 نجوم")).toBeTruthy();
    expect(screen.getByRole("button", { name: "4 نجمة" }).getAttribute("aria-pressed")).toBe("true");
    expect(window.localStorage.getItem("khairy-article-rating:battery-tips")).toBe("4");
  });

  it("restores the article rating from the current browser", () => {
    window.localStorage.setItem("khairy-article-rating:battery-tips", "5");
    render(<ArticleRating articleKey="battery-tips" language="ar" />);

    expect(screen.getByText("تم اختيار 5 من 5 نجوم")).toBeTruthy();
  });
});
