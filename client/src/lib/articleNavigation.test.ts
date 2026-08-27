import { describe, expect, it, vi } from "vitest";
import { returnToPreviousPage } from "./articleNavigation";

describe("returnToPreviousPage", () => {
  it("returns to the previous browser page when history is available", () => {
    const goBack = vi.fn();
    const goHome = vi.fn();

    expect(returnToPreviousPage(3, goBack, goHome)).toBe("previous");
    expect(goBack).toHaveBeenCalledOnce();
    expect(goHome).not.toHaveBeenCalled();
  });

  it("returns home when the article was opened directly", () => {
    const goBack = vi.fn();
    const goHome = vi.fn();

    expect(returnToPreviousPage(1, goBack, goHome)).toBe("home");
    expect(goHome).toHaveBeenCalledOnce();
    expect(goBack).not.toHaveBeenCalled();
  });
});
