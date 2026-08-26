import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AdminNoticeBanner } from "./AdminNoticeBanner";

describe("AdminNoticeBanner", () => {
  it("renders an accessible success state", () => {
    const html = renderToStaticMarkup(<AdminNoticeBanner kind="success" message="Profile saved successfully." />);
    expect(html).toContain('role="status"');
    expect(html).toContain("Profile saved successfully.");
    expect(html).toContain("bg-emerald-50");
  });

  it("renders an accessible error state", () => {
    const html = renderToStaticMarkup(<AdminNoticeBanner kind="error" message="Profile could not be saved." />);
    expect(html).toContain('role="alert"');
    expect(html).toContain("Profile could not be saved.");
    expect(html).toContain("bg-red-50");
  });
});
