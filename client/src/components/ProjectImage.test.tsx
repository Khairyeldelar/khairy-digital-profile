import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProjectImage } from "./ProjectImage";

describe("ProjectImage", () => {
  it("renders the default editorial cover when no custom image is available", () => {
    const html = renderToStaticMarkup(<ProjectImage src="" alt="غلاف المقال الافتراضي" />);

    expect(html).toContain("data:image/svg+xml");
    expect(html).toContain('alt="غلاف المقال الافتراضي"');
  });
});
