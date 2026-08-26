import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ProjectCardTrigger } from "./ProjectCardTrigger";

describe("ProjectCardTrigger", () => {
  it("renders a keyboard-focusable button with an accessible open label", () => {
    const html = renderToStaticMarkup(
      <ProjectCardTrigger label="مشاهدة: نوفا نوتس" onOpen={vi.fn()}>
        <span>نوفا نوتس</span>
      </ProjectCardTrigger>,
    );

    expect(html).toContain('<button type="button"');
    expect(html).toContain('aria-label="مشاهدة: نوفا نوتس"');
    expect(html).toContain("نوفا نوتس");
  });
});
